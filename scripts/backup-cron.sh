#!/usr/bin/env bash
# =========================================================================
# POLARIS PLATFORM — AUTOMATED ENCRYPTED DATABASE BACKUP SCRIPT
# STANDAR: ISO 27001 (A.12.3.1) & UU PDP No. 27/2022
# =========================================================================
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${HOME}/polaris-backups"
DB_CONTAINER="polaris_prod_postgres"
DB_USER="${POSTGRES_USER:-polaris_admin}"
DB_NAME="${POSTGRES_DB:-polaris_db}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_PASSPHRASE:-polaris_master_backup_secret_2026}"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

RAW_SQL="${BACKUP_DIR}/dump_${DB_NAME}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${RAW_SQL}.gz"
ENCRYPTED_FILE="${COMPRESSED_FILE}.gpg"

echo "=========================================================="
echo " [POLARIS BACKUP] Memulai Pencadangan Basis Data: ${TIMESTAMP} "
echo "=========================================================="

# 1. Eksekusi pg_dump dari dalam container database
echo "[1/5] Mengekspor database dari container ${DB_CONTAINER}..."
docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists > "${RAW_SQL}"

# 2. Kompresi arsip (Gzip level 9)
echo "[2/5] Mengompresi file SQL (Gzip -9)..."
gzip -9 "${RAW_SQL}"

# 3. Enkripsi simetris GPG AES-256 (At-Rest Cryptography)
echo "[3/5] Mengenkripsi arsip menggunakan GPG AES-256..."
gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "${ENCRYPTION_KEY}" -o "${ENCRYPTED_FILE}" "${COMPRESSED_FILE}"

# Hapus file kompresi plaintext sebelum enkripsi
rm -f "${COMPRESSED_FILE}"

FILE_SIZE=$(du -h "${ENCRYPTED_FILE}" | cut -f1)
echo "Cadangan terenkripsi selesai: ${ENCRYPTED_FILE} (${FILE_SIZE})"

# 4. Streaming off-site upload ke Cloudflare R2 / S3 (Jika kredensial terpasang)
echo "[4/5] Mengunggah cadangan ke off-site cold storage..."
if command -v aws &> /dev/null && [ -n "${R2_BUCKET_NAME}" ]; then
  aws s3 cp "${ENCRYPTED_FILE}" "s3://${R2_BUCKET_NAME}/backups/db/$(basename "${ENCRYPTED_FILE}")" \
    --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  echo "Unggah ke Cloudflare R2 berhasil."
else
  echo "PERINGATAN: AWS CLI / R2 credentials tidak terpasang. Cadangan disimpan lokal di server."
fi

# 5. Kebijakan Retensi: Hapus arsip lokal yang lebih dari 30 hari
echo "[5/5] Menjalankan rotasi pembersihan arsip > ${RETENTION_DAYS} hari..."
find "${BACKUP_DIR}" -name "dump_*.sql.gz.gpg" -type f -mtime +${RETENTION_DAYS} -delete

echo "=========================================================="
echo " [POLARIS BACKUP] PENCADANGAN DATABASE SUKSES DIAMANKAN! "
echo "=========================================================="
