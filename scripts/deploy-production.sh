#!/usr/bin/env bash
# =========================================================================
# POLARIS PLATFORM — ZERO-DOWNTIME ROLLING DEPLOYMENT SCRIPT
# =========================================================================
set -eo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="polaris"

echo "=== [1/5] Verifikasi Environment File (.env) ==="
if [ ! -f .env ]; then
  echo "ERROR: File .env produksi tidak ditemukan di server!"
  exit 1
fi

echo "=== [2/5] Menarik (Pull) Container Images Terbaru dari GHCR ==="
docker compose -f ${COMPOSE_FILE} pull --ignore-pull-failures || true

echo "=== [3/5] Memastikan Database & Redis Berstatus Healthy ==="
docker compose -f ${COMPOSE_FILE} up -d postgres redis

# Tunggu sampai Postgres berstatus healthy
RETRIES=15
until [ $(docker inspect --format='{{json .State.Health.Status}}' polaris_prod_postgres 2>/dev/null) == '"healthy"' ] || [ $RETRIES -le 0 ]; do
  echo "Menunggu database PostgreSQL siap... ($RETRIES percobaan tersisa)"
  sleep 2
  RETRIES=$((RETRIES-1))
done

if [ $RETRIES -le 0 ]; then
  echo "FATAL: PostgreSQL gagal mencapai status healthy dalam batas waktu!"
  exit 1
fi
echo "PostgreSQL & Redis siap dan berstatus healthy."

echo "=== [3.5/5] Menjalankan Sinkronisasi Migrasi Database PostgreSQL ==="
# Ambil kredensial DB dari .env (tanpa men-source seluruh file) agar psql memakai user/db yang sama dengan container
read_env_var() { grep -E "^\s*$1\s*=" .env 2>/dev/null | tail -1 | sed -E "s/^\s*$1\s*=\s*//; s/^[\"']//; s/[\"']\s*$//" | tr -d '\r' || true; }
POSTGRES_USER="${POSTGRES_USER:-$(read_env_var POSTGRES_USER)}"
POSTGRES_DB="${POSTGRES_DB:-$(read_env_var POSTGRES_DB)}"

# Cari folder migrasi: hasil git checkout ATAU hasil sinkronisasi SCP dari pipeline CD
MIGRATIONS_DIR=""
for candidate in "packages/database/src/migrations" "migrations"; do
  if [ -d "$candidate" ] && ls -1 "$candidate"/*.sql >/dev/null 2>&1; then
    MIGRATIONS_DIR="$candidate"
    break
  fi
done

if [ -z "$MIGRATIONS_DIR" ]; then
  echo "WARNING: Folder migrasi SQL tidak ditemukan — langkah migrasi dilewati!"
else
  echo "Menggunakan folder migrasi: ${MIGRATIONS_DIR}"
  MIGRATION_WARNINGS=0
  for migration_file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
    echo "-> Menjalankan migrasi: $(basename "$migration_file")"
    # Migrasi bersifat idempoten; error tidak menghentikan deploy, tetapi WAJIB terlihat di log.
    # (Tanpa ON_ERROR_STOP agar statement lain dalam file yang sama tetap diterapkan, seperti perilaku lama.)
    output=$(docker exec -i polaris_prod_postgres psql -q \
        -U "${POSTGRES_USER:-polaris_admin}" -d "${POSTGRES_DB:-polaris_db}" < "$migration_file" 2>&1) || true
    if echo "$output" | grep -qE "ERROR|FATAL"; then
      MIGRATION_WARNINGS=$((MIGRATION_WARNINGS+1))
      echo "   !! WARNING: migrasi $(basename "$migration_file") menghasilkan error:"
      echo "$output" | grep -E "ERROR|FATAL" | sed 's/^/      /'
    fi
  done
  echo "Seluruh migrasi database selesai diproses (${MIGRATION_WARNINGS} peringatan)."
fi

echo "=== [4/5] Melakukan Rolling Restart Sub-Sistem Aplikasi (Pre-built GHCR Images) ==="
# Restart backend API Core terlebih dahulu (tanpa --build di VPS karena image sudah di-pull dari GHCR)
docker compose -f ${COMPOSE_FILE} up -d --no-deps api-core
sleep 4

# Restart Worker Daemon BullMQ
docker compose -f ${COMPOSE_FILE} up -d --no-deps worker-crawler

# Restart Web Dashboard Dewan & Web Portal Publik
docker compose -f ${COMPOSE_FILE} up -d --no-deps web-dashboard
docker compose -f ${COMPOSE_FILE} up -d --no-deps web-portal

echo "=== [5/5] Pembersihan Image Usang (Dangling Images Cleanup) ==="
docker image prune -f --filter "until=72h"

echo "=========================================================="
echo " [POLARIS CD] DEPLOYMENT BERHASIL DILAKSANAKAN DENGAN SUKSES! "
echo "=========================================================="
docker compose -f ${COMPOSE_FILE} ps
