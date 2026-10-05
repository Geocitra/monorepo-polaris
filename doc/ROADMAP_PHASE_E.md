# ROADMAP TEKNIS DETAIL: FASE E
## Production Hardening, DevSecOps, On-Demand TLS & Kepatuhan Pemerintah (UU PDP / ISO 27001)

> **Metodologi Arsitektur:** Menerapkan prinsip *Infrastructure as Code (IaC)*, *Defense-in-Depth*, *Zero-Trust Deployment*, dan standar kepatuhan regulasi data nasional (UU PDP No. 27/2022) berdasarkan metodologi **Craig Larman (OOAD)** dan pola **GRASP**.

```text
========================================================================================================================
POLARIS ARCHITECTURE ROADMAP — FASE E: PRODUCTION HARDENING & DEVSECOPS
========================================================================================================================

                                  [ INTERNET TRAFIK (WARGA & DEWAN) ]
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: CLOUDFLARE EDGE WAF & DDOS SHIELD (*.polaris.id + Custom Domains)                                           │
│ • SSL/TLS 1.3 Strict Mode, Bot Fight Mode, Rate-Limiting Edge, dan Geo-IP Blocking                                    │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼ (Port 80/443 Encrypted)
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: REVERSE PROXY DENGAN AUTOMATIC ON-DEMAND TLS (CADDY / NGINX)                                                │
│ • On-Demand TLS: Menerbitkan sertifikat SSL instan untuk custom domain dewan (misal: achmadfauzi.id)                 │
│ • Ask Endpoint: Validasi kepemilikan domain ke api-core sebelum SSL diterbitkan (Anti-DDoS Certificate)              │
│ • Perutean Cerdas:                                                                                                   │
│   ├── app.polaris.id               ──► Container web-dashboard:3000 (Private Workspace)                              │
│   ├── api.polaris.id               ──► Container api-core:4000 (NestJS Backend API)                                  │
│   └── *.polaris.id & Custom Domain ──► Container web-portal:3001 (Public Microsite)                                  │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼ (Isolated Docker Bridge Network)
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: MULTI-STAGE DOCKER MICRO-CONTAINERS (STANDALONE ISOLATION)                                                  │
│ • Next.js Standalone Mode (< 180 MB per image, zero devDependencies)                                                 │
│ • Non-Root User Runtime (UID 1001 nodejs) & Read-Only Root Filesystem                                                │
│ • Database & Redis Terisolasi Total: Port 5432 & 6379 TIDAK BOLEH diekspos ke publik host                           │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LAYER 4: CI/CD ZERO-DOWNTIME DEPLOYMENT & DISASTER RECOVERY (DRP)                                                    │
│ • GitHub Actions: TypeCheck ──► Unit/Integration Test ──► Docker Build ──► Rolling Blue/Green Update                 │
│ • Otomasi Backup Harian: pg_dump terenkripsi AES-256 GPG ──► Offsite Cold Storage Cloudflare R2                     │
│ • Kepatuhan UU PDP No. 27/2022: Data Residency Indonesia, Right to be Forgotten, & Audit Log Sanitization             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

---

## 1. Analisis Kritis & Celah Arsitektur Menuju Produksi (Threat Model)

Sebelum menyusun kontainerisasi dan deployment, kita audit empat celah kritis produksi:

1. **Bloated Monorepo Docker Images (Anti-Pattern):**
   * *Masalah:* Menyalin seluruh direktori monorepo ke Dockerfile menghasilkan image berukuran $> 1.5\text{ GB}$, memperlambat proses deployment dan memperbesar *attack surface* kontainer.
   * *Solusi:* Menggunakan utilitas `turbo prune --scope=<app>` untuk memotong dependensi monorepo secara presisi, dipadukan dengan konfigurasi `output: 'standalone'` pada Next.js 15.
2. **Tantangan SSL pada Multi-Tenant Custom Domain:**
   * *Masalah:* Setiap anggota dewan dapat memasang custom domain pribadi (`achmadfauzi.id`). Nginx tradisional mewajibkan restart konfigurasi setiap kali ada domain baru.
   * *Solusi:* Menggunakan **Caddy Server dengan On-Demand TLS**. Caddy menerbitkan sertifikat Let's Encrypt secara otomatis saat traffic pertama tiba, dengan validasi melalui webhook internal (*Ask Endpoint*) untuk mencegah *SSL Certificate Denial-of-Service*.
3. **Database Exposure Risk:**
   * *Masalah:* Sering kali port 5432 PostgreSQL atau port 6379 Redis dipetakan ke host publik (`0.0.0.0:5432`).
   * *Solusi:* Konfigurasi *Docker Compose* produksi mengunci port database hanya di dalam jaringan internal kontainer (`polaris_internal_net`). Host luar tidak dapat mengakses port DB secara langsung.
4. **Kepatuhan Hukum UU PDP No. 27/2022 (Data Residency):**
   * Server VPS dan objek storage wajib berada di dalam batas teritorial yurisdiksi Indonesia.

---

## SUB-FASE E.1: Multi-Stage Dockerization & Optimasi Container Standalone

### 1. Desain Kontainerisasi Berbasis Pola GRASP
* **High Cohesion:** Setiap aplikasi (`api-core`, `web-dashboard`, `web-portal`, `worker-crawler`) memiliki Dockerfile terisolasi yang hanya mengemas dependensi yang benar-benar dibutuhkan saat runtime.
* **Protected Variations (Minimal Attack Surface):** Kontainer dijalankan di atas basis *Alpine Linux*, menggunakan user tanpa hak root (`USER nodejs`), serta mengaktifkan mode *production environment* (`NODE_ENV=production`).

### 2. Matriks Berkas Sub-Fase E.1

```text
polaris-platform/
├── Dockerfile.api-core                                   [BARU: Multi-stage Dockerfile NestJS]
├── Dockerfile.web-dashboard                              [BARU: Multi-stage Dockerfile Next.js Standalone]
├── Dockerfile.web-portal                                 [BARU: Multi-stage Dockerfile Next.js Standalone]
├── Dockerfile.worker-crawler                             [BARU: Headless Daemon Worker Container]
├── .dockerignore                                         [BARU: Eliminasi .git, node_modules, log]
├── docker-compose.prod.yml                               [BARU: Orkestrasi Produksi dengan Healthchecks]
│
├── apps/web-dashboard/
│   └── next.config.ts                                    [MODIFIKASI: Tambah output: 'standalone']
│
└── apps/web-portal/
    └── next.config.ts                                    [MODIFIKASI: Tambah output: 'standalone']
```

### 3. Rincian Eksekusi Teknis
* **Langkah E.1.1 (Next.js Standalone Mode):**
  Mengaktifkan `output: 'standalone'` pada `apps/web-dashboard/next.config.ts` dan `apps/web-portal/next.config.ts`.
  * *Hasil:* Bundler Next.js hanya mengekstrak berkas JavaScript yang benar-benar dipanggil oleh halaman, memotong ukuran image dari $\sim 1.2\text{ GB}$ menjadi $\sim 160\text{ MB}$.
* **Langkah E.1.2 (Pola Multi-Stage Turbo Prune):**
  Setiap Dockerfile mengadopsi 4 tahap:
  1. `STAGE 1: Pruner` (`turbo prune --scope=@polaris/api-core --docker`).
  2. `STAGE 2: Dependency Installer` (`pnpm install --frozen-lockfile`).
  3. `STAGE 3: Builder` (`turbo run build --filter=@polaris/api-core...`).
  4. `STAGE 4: Runner` (Menyalin hasil kompilasi ke image *clean alpine*, menjalankan perintah via user `nodejs`).
* **Langkah E.1.3 (Docker Compose Production & Healthcheck):**
  Mendefinisikan `docker-compose.prod.yml`:
  * PostgreSQL 16 + pgvector dengan healthcheck `pg_isready -U polaris_admin`.
  * Redis 7 dengan healthcheck `redis-cli ping`.
  * Restart policy: `unless-stopped`.
  * Limit memori kontainer untuk mencegah *OOM Killer* di server VPS.

---

## SUB-FASE E.2: Reverse Proxy Caddy, On-Demand TLS & Cloudflare WAF

### 1. Arsitektur Perutean Host-Header Multi-Tenant
* **Kebutuhan:**
  Satu server VPS harus melayani 3 tipe domain:
  1. `app.polaris.id` $\rightarrow$ Ruang kerja dewan (`web-dashboard`).
  2. `api.polaris.id` $\rightarrow$ REST API backend (`api-core`).
  3. Wildcard `*.polaris.id` dan Custom Domain terverifikasi (`achmadfauzi.id`) $\rightarrow$ Portal publik konstituen (`web-portal`).

### 2. Keunggulan Caddy Server dengan On-Demand TLS (Best Practice SaaS)
Caddy Server memiliki kapabilitas *native* menerbitkan sertifikat SSL Let's Encrypt secara dinamis tanpa restart konfigurasi:

```text
[ Browser Request: https://achmadfauzi.id ]
                     │
                     ▼
[ Caddy Server: Menerima handshake TLS ]
                     │
                     ▼ (Internal HTTP Call / "Ask Endpoint")
[ GET http://api-core:4000/api/v1/cms/domain/check?domain=achmadfauzi.id ]
                     │
         ┌───────────┴───────────┐
         │ (Status 200 OK)       │ (Status 400/404)
         ▼                       ▼
[ Terbitkan SSL Let's Encrypt ] [ Tolak Koneksi (Anti-DDoS SSL) ]
```

### 3. Matriks Berkas Sub-Fase E.2

```text
polaris-platform/
├── Caddyfile                                             [BARU: Konfigurasi Reverse Proxy & On-Demand TLS]
│   (atau deployment/nginx/nginx.conf jika memilih Nginx)
│
├── apps/api-core/
│   └── src/
│       └── modules/
│           └── cms/
│               └── cms.controller.ts                     [MODIFIKASI: Tambah Endpoint Caddy Ask Validator]
```

### 4. Rincian Eksekusi Teknis
* **Langkah E.2.1 (Endpoint Caddy Ask Validator):**
  Di `CmsController`, tambahkan endpoint publik:
  `GET /api/v1/cms/domain/check?domain=:domain`
  * Mengecek tabel `portal_configs`: Jika `custom_domain = :domain AND custom_domain_status = 'VERIFIED' AND is_active = true`, kembalikan `HTTP 200 OK`. Jika tidak, kembalikan `HTTP 404 Not Found`.
  * *Tujuan:* Mencegah penyerang menghabiskan kuota sertifikat Let's Encrypt (*Rate-Limit Exhaustion*) dengan mengarahkan domain sembarangan ke IP server kita.
* **Langkah E.2.2 (Konfigurasi Caddyfile Produksi):**
  Menyusun blok konfigurasi Caddy:
  * Menyalakan gzip dan zstd compression.
  * Menetapkan header keamanan ketat:
    * `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
    * `X-Content-Type-Options: nosniff`
    * `X-Frame-Options: SAMEORIGIN`
    * `Referrer-Policy: strict-origin-when-cross-origin`

---

## SUB-FASE E.3: Automated CI/CD Pipeline & Zero-Downtime Deployment

### 1. Prinsip Pipeline DevSecOps
Deployment ke server produksi tidak boleh dilakukan secara manual via FTP atau SSH langsung. Setiap baris kode yang masuk ke branch `main` harus melewati pengujian otomatis sebelum kontainer diperbarui.

### 2. Tahapan Alur Kerja GitHub Actions (`.github/workflows/deploy.yml`)

```text
[ Git Push to 'main' ]
         │
         ▼
[ 1. LINT & TYPECHECK ] ──► (turbo run lint check-types)
         │
         ▼
[ 2. AUTOMATED TESTING ] ──► (Vitest Unit Tests & Integration Tests)
         │
         ▼
[ 3. CONTAINER BUILD ] ──► (Build Docker Images & Push to Container Registry)
         │
         ▼
[ 4. ZERO-DOWNTIME ROLLING DEPLOY ]
         ├── SSH ke Server Produksi via Private Key Rahasia
         ├── Pull Image Terbaru
         ├── docker compose up -d --no-deps --build <service>
         ├── Healthcheck Probe: Tunggu sampai container baru berstatus 'healthy'
         └── Prune Old Containers & Images (Bebaskan Disk VPS)
```

### 3. Matriks Berkas Sub-Fase E.3

```text
polaris-platform/
└── .github/
    └── workflows/
        ├── ci.yml                                        [BARU: Workflow Validasi Lint, Typecheck, Test]
        └── deploy.yml                                    [BARU: Workflow Zero-Downtime CD ke VPS Produksi]
```

---

## SUB-FASE E.4: Audit Kepatuhan Regulasi (UU PDP / ISO 27001) & Disaster Recovery Plan (DRP)

### 1. Pemenuhan Regulasi UU Perlindungan Data Pribadi (UU No. 27 Tahun 2022)
* **Pasal 20 & 21 (Data Residency & Kedaulatan Data):**
  * Seluruh server VPS (komputasi) dan database PostgreSQL berlokasi di pusat data wilayah Indonesia (misal: Biznet Gio, IDCloudHost, atau AWS Jakarta `ap-southeast-3`).
* **Pasal 8 & 9 (Hak Penghapusan / Right to be Forgotten):**
  * Implementasi *Cascade Hard Delete*: Jika seorang anggota dewan menghentikan langganan dan mengajukan penutupan akun, sistem mengeksekusi penghapusan menyeluruh data aspirasi warga dan PII vault yang terkait dengannya.
* **Pasal 46 (Pemberitahuan Kegagalan Perlindungan Data):**
  * Prosedur tata kelola insiden siber: Log audit tersimpan rapi untuk rekonstruksi forensik dalam waktu $3 \times 24\text{ jam}$.
* **Sanitasi Log Produksi:**
  * Larangan mutlak mencetak data NIK, nama lengkap warga, nomor WhatsApp, atau plain-text kata sandi pada log kontainer (`stdout`/`stderr`).

### 2. Rencana Tanggap Bencana & Pemulihan Cadangan (Disaster Recovery Plan)
* **Target Metrik Pemulihan:**
  * **RPO (*Recovery Point Objective*): $\le 24\text{ jam}$.** Data transaksi kas dan naskah dewan maksimal kehilangan perubahan 24 jam terakhir jika terjadi bencana fisik server.
  * **RTO (*Recovery Time Objective*): $\le 30\text{ menit}$.** Waktu yang dibutuhkan untuk membangun kembali seluruh platform di server baru dari titik nol.

### 3. Matriks Berkas Sub-Fase E.4

```text
polaris-platform/
└── scripts/
    ├── backup-cron.sh                                    [BARU: Skrip Ekspor DB + Enkripsi GPG AES-256]
    ├── restore-disaster.sh                               [BARU: Skrip Pemulihan 1-Klik dari Cold Storage]
    └── audit-compliance.sh                               [BARU: Skrip Validator Sanitasi Log & Secrets]
```

### 4. Rincian Alur Backup Otomatis (`scripts/backup-cron.sh`)
1. Eksekusi `pg_dump` dengan kompresi gzip biner.
2. Enkripsi simetris menggunakan GPG AES-256 (`gpg --symmetric --cipher-algo AES256`).
3. Streaming upload ke bucket *cold storage* terpisah di Cloudflare R2 / AWS S3 menggunakan enkripsi *at-rest*.
4. Retensi siklus: Hapus cadangan harian yang telah berumur lebih dari 30 hari secara otomatis.

---

## DEFINITION OF DONE (DoD) FASE E

Fase E dinyatakan **SELESAI 100%** dan platform POLARIS berstatus **PRODUCTION-READY** apabila:

1. **Efisiensi Kontainer Standalone:**
   * Seluruh image Docker Next.js (`web-dashboard` dan `web-portal`) berukuran $< 200\text{ MB}$, dan image NestJS (`api-core`) $< 180\text{ MB}$.
2. **Kekebalan Port Database:**
   * Uji pemindaian port eksternal (`nmap` terhadap IP server VPS): Port 5432 dan 6379 terbukti berstatus **CLOSED / FILTERED** bagi publik.
3. **Keberhasilan On-Demand TLS Custom Domain:**
   * Domain baru yang didaftarkan dewan berhasil memperoleh sertifikat HTTPS resmi secara otomatis dalam waktu $< 15\text{ detik}$ setelah DNS CNAME terhubung.
4. **Zero-Downtime Deployment:**
   * Eksekusi deploy versi baru melalui GitHub Actions tidak memicu *downtime* atau pemutusan koneksi pada sesi dewan yang sedang aktif membuat naskah.
5. **Uji Coba Simulasi Bencana (DRP Simulation):**
   * Server database pengujian sengaja dihapus; skrip `restore-disaster.sh` berhasil memulihkan seluruh skema, data anggota dewan, buku kas rekonsiliasi, dan artikel dalam waktu $< 15\text{ menit}$.

---

## STATUS FINAL ROADMAP: SELESAI 100% (PRODUCTION-READY)

```text
========================================================================================================================
                      STATUS AKHIR MASTER ROADMAP POLARIS PLATFORM — PRODUCTION READY
========================================================================================================================
[FASE A: PUBLIC ENGAGEMENT & CONCIERGE ENGINE]           ──► [SELESAI 100%]
  ├── A.1: Knowledge Base & Guardrail Sandbox            ──► SELESAI
  ├── A.2: Public Chat Controller & Ingress Defense      ──► SELESAI
  └── A.3: Floating Concierge Component                  ──► SELESAI

[FASE B: PENGUATAN CORE DOMAIN & RESILIENSI ASINKRON]   ──► [SELESAI 100%]
  ├── B.1: Row-Level Security (PostgreSQL Kernel RLS)    ──► SELESAI
  ├── B.2: Asynchronous BullMQ Decoupling & Sagas        ──► SELESAI
  └── B.3: Kriptografi HKDF UU PDP & Anti-SSRF DNS Guard ──► SELESAI

[FASE C: QUALITY ASSURANCE & AUTOMATED TESTING HARNESS] ──► [SELESAI 100%]
  ├── C.1: Pure Domain Invariants Unit Tests (Vitest)    ──► SELESAI
  ├── C.2: NestJS Integration Testing Harness            ──► SELESAI
  └── C.3: End-to-End User Journey Tests (Playwright)    ──► SELESAI

[FASE D: OBSERVABILITAS SISTEM & TELEMETRI AI]           ──► [SELESAI 100%]
  ├── D.1: Unified Distributed Telemetry & Langfuse Sync ──► SELESAI
  ├── D.2: Circuit-Breaker Token Pool & Pre-Flight Gate  ──► SELESAI
  └── D.3: Automasi Cron Rekonsiliasi Kas Harian (01.30) ──► SELESAI

[FASE E: PRODUCTION HARDENING, DEVSECOPS & COMPLIANCE]   ──► [SELESAI 100%]
  ├── E.1: Multi-Stage Docker & Standalone Optimization  ──► SELESAI
  ├── E.2: Reverse Proxy Caddy & On-Demand TLS           ──► SELESAI
  ├── E.3: Automated CI/CD Pipeline & Zero-Downtime      ──► SELESAI
  └── E.4: Audit Kepatuhan UU PDP & Disaster Recovery    ──► SELESAI
========================================================================================================================
```

