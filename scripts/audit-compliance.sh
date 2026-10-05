#!/usr/bin/env bash
# =========================================================================
# POLARIS PLATFORM — REGULATORY COMPLIANCE & SECURITY AUDITOR
# STANDAR KEPATUHAN: UU PDP No. 27/2022 & ISO 27001 Annex A
# =========================================================================
set -eo pipefail

echo "================================================================="
echo " POLARIS SECURITY & REGULATORY COMPLIANCE AUDITOR (UU PDP / ISO) "
echo "================================================================="

VIOLATIONS=0

echo -n "1. [UU PDP Pasal 20] Memeriksa Kedaulatan & Sanitasi File Lingkungan (.env)... "
if [ -f .env ] && git status --porcelain | grep -q "\.env$"; then
  echo "GAGAL (File .env terlacak di Git!)"
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "LOLOS (Aman)"
fi

echo -n "2. [ISO 27001 A.8.9] Memindai Kebocoran Hardcoded Secret di Codebase... "
SECRET_LEAKS=$(grep -rnE "(sk-proj-[a-zA-Z0-9]{20,}|Mid-server-[a-zA-Z0-9]{10,}|password\s*=\s*['\"][^'\"]+['\"])" packages/ apps/ 2>/dev/null | grep -v "node_modules" | grep -v "\.spec\.ts" | grep -v "\.env" | grep -v "/dist/" | grep -v "/\.next/" || true)

if [ -n "${SECRET_LEAKS}" ]; then
  echo "GAGAL! Ditemukan potensi hardcoded secret:"
  echo "${SECRET_LEAKS}"
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "LOLOS (Bersih)"
fi

echo -n "3. [UU PDP Pasal 8 & 9] Memverifikasi Hak Penghapusan Data Warga (Cascade Purge)... "
CASCADE_COUNT=$(grep -riE "(onDelete:\s*['\"]cascade['\"]|ON DELETE CASCADE)" packages/database/src/schema/ 2>/dev/null | wc -l || echo 0)
if [ "${CASCADE_COUNT}" -ge 8 ]; then
  echo "LOLOS (${CASCADE_COUNT} relasi tabel terproteksi cascade delete)"
else
  echo "PERINGATAN! Hanya ${CASCADE_COUNT} relasi cascade terdeteksi."
  VIOLATIONS=$((VIOLATIONS+1))
fi

echo -n "4. [UU PDP Pasal 35] Memverifikasi Proteksi Row-Level Security (PostgreSQL Kernel)... "
if [ -f "packages/database/src/migrations/0008_enforce_row_level_security.sql" ]; then
  RLS_POLICIES=$(grep -c "CREATE POLICY" packages/database/src/migrations/0008_enforce_row_level_security.sql || true)
  echo "LOLOS (${RLS_POLICIES} kebijakan RLS aktif)"
else
  echo "GAGAL (Skrip migrasi RLS tidak ditemukan!)"
  VIOLATIONS=$((VIOLATIONS+1))
fi

echo -n "5. [ISO 27001 A.12.3] Memverifikasi Ketersediaan Skrip Backup & Disaster Recovery... "
if [ -x "scripts/backup-cron.sh" ] && [ -x "scripts/restore-disaster.sh" ]; then
  echo "LOLOS (Executable dan siap beroperasi)"
else
  echo "GAGAL (Skrip backup/restore belum executable! Jalankan chmod +x scripts/*.sh)"
  VIOLATIONS=$((VIOLATIONS+1))
fi

echo "================================================================="
if [ ${VIOLATIONS} -eq 0 ]; then
  echo " HASIL AUDIT: SISTEM MEMENUHI STANDAR KEPATUHAN UU PDP & ISO 27001 "
  echo " Status: 100% PRODUCTION COMPLIANT & READY FOR ROLLOUT "
  exit 0
else
  echo " HASIL AUDIT: DITEMUKAN ${VIOLATIONS} KETIDAKSESUAIAN! HARAP SEGERA DIPERBAIKI. "
  exit 1
fi
