#!/usr/bin/env bash
# =========================================================================
# POLARIS PLATFORM — DISASTER RECOVERY & RESTORATION RUNBOOK
# RTO Target: <= 30 Menit | RPO Target: <= 24 Jam
# =========================================================================
set -eo pipefail

if [ -z "$1" ]; then
  echo "PENGGUNAAN: ./scripts/restore-disaster.sh <path_to_encrypted_backup.sql.gz.gpg>"
  echo "Contoh: ./scripts/restore-disaster.sh ~/polaris-backups/dump_polaris_db_20261005_030000.sql.gz.gpg"
  exit 1
fi

ENCRYPTED_ARCHIVE="$1"
DB_CONTAINER="polaris_prod_postgres"
DB_USER="${POSTGRES_USER:-polaris_admin}"
DB_NAME="${POSTGRES_DB:-polaris_db}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_PASSPHRASE:-polaris_master_backup_secret_2026}"

if [ ! -f "${ENCRYPTED_ARCHIVE}" ]; then
  echo "ERROR: Berkas cadangan '${ENCRYPTED_ARCHIVE}' tidak ditemukan!"
  exit 1
fi

echo "=========================================================="
echo " ⚠️ PERINGATAN: PROSES PEMULIHAN BENCANA DATABASE POLARIS ⚠️ "
echo " Target Arsip: ${ENCRYPTED_ARCHIVE}"
echo " Database Tujuan: ${DB_NAME} pada kontainer ${DB_CONTAINER}"
echo "=========================================================="
read -p "Apakah Anda yakin ingin menimpa database dengan cadangan ini? (ketik 'PULIHKAN'): " CONFIRM

if [ "${CONFIRM}" != "PULIHKAN" ]; then
  echo "Pemulihan dibatalkan oleh operator."
  exit 0
fi

TEMP_DECRYPTED="/tmp/restore_temp_$$.sql.gz"
TEMP_SQL="/tmp/restore_temp_$$.sql"

echo "[1/4] Mendekripsi arsip menggunakan kunci GPG AES-256..."
gpg --batch --yes --decrypt --passphrase "${ENCRYPTION_KEY}" -o "${TEMP_DECRYPTED}" "${ENCRYPTED_ARCHIVE}"

echo "[2/4] Mengekstrak file SQL..."
gunzip -c "${TEMP_DECRYPTED}" > "${TEMP_SQL}"
rm -f "${TEMP_DECRYPTED}"

echo "[3/4] Mengalirkan struktur skema dan data ke PostgreSQL..."
docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${TEMP_SQL}"
rm -f "${TEMP_SQL}"

echo "[4/4] Memvalidasi integritas pasca-pemulihan..."
MEMBER_COUNT=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT count(*) FROM tenant_members;")
ARTICLE_COUNT=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT count(*) FROM content_publications;")
RECON_COUNT=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT count(*) FROM reconciliation_batches;")

echo "=========================================================="
echo " [PEMULIHAN SUKSES] DATABASE TELAH KEMBALI BEROPERASI NORMAL "
echo " - Total Anggota Dewan: $(echo ${MEMBER_COUNT} | tr -d ' ')"
echo " - Total Naskah Artikel: $(echo ${ARTICLE_COUNT} | tr -d ' ')"
echo " - Total Batch Rekonsiliasi Kas: $(echo ${RECON_COUNT} | tr -d ' ')"
echo "=========================================================="
