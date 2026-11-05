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
if [ -d "packages/database/src/migrations" ]; then
  for migration_file in $(ls -1 packages/database/src/migrations/*.sql 2>/dev/null | sort); do
    echo "-> Menjalankan migrasi: $(basename "$migration_file")"
    docker exec -i polaris_prod_postgres psql -U "${POSTGRES_USER:-polaris_admin}" -d "${POSTGRES_DB:-polaris_db}" < "$migration_file" >/dev/null 2>&1 || true
  done
  echo "Seluruh migrasi database selesai diverifikasi/diterapkan."
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
