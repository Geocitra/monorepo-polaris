# POLARIS PLATFORM — ARSITEKTUR & ROADMAP PENGEMBANGAN MODULAR

> **Kompas Utama Proyek**: Dokumen ini merupakan cetak biru struktur file menyeluruh (*exhaustive directory blueprint*) dan peta jalan (*roadmap*) pengembangan berbasis metodologi **Craig Larman** (Domain-Driven Design, GRASP, Low Coupling, High Cohesion).

---

# BAGIAN 1: CETAK BIRU STRUKTUR FOLDER & FILE LENGKAP

Berikut susunan berkas lengkap untuk seluruh `apps/` dan `packages/`. Setiap berkas memiliki tanggung jawab tunggal (*Single Responsibility Principle*).

```text
polaris-platform/
├── .env.example                                # Master template environment variables
├── .gitignore                                  # Git ignore root (node_modules, dist, .next)
├── package.json                                # Root workspace package definition
├── pnpm-workspace.yaml                         # Workspace member declaration
├── pnpm-lock.yaml                              # Lockfile dependency tree
├── turbo.json                                  # Turborepo build pipeline configuration
├── tsconfig.base.json                          # Base TypeScript compiler options
│
├── apps/
│   │
│   ├── api-core/                               # [BACKEND] NestJS Modular Application
│   │   ├── src/
│   │   │   ├── main.ts                         # Application entrypoint & global pipes
│   │   │   ├── app.module.ts                   # Root IoC dependency injection module
│   │   │   │
│   │   │   ├── common/                         # Shared Cross-Cutting Concerns
│   │   │   │   ├── decorators/                 # Custom decorators (@CurrentTenant, @Public)
│   │   │   │   │   └── current-tenant.decorator.ts
│   │   │   │   ├── filters/                    # Global HTTP Exception Filter
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── guards/                     # Security & Permission Gates
│   │   │   │   │   ├── auth.guard.ts           # JWT Token Validator
│   │   │   │   │   ├── subscription.guard.ts   # Cek Status Langganan Aktif
│   │   │   │   │   └── quota.guard.ts          # Cek Sisa Saldo Kredit Sebelum AI Call
│   │   │   │   └── interceptors/
│   │   │   │       ├── rls-context.interceptor.ts # Suntik tenant_id ke PostgreSQL Session
│   │   │   │       └── logging.interceptor.ts
│   │   │   │
│   │   │   └── modules/                        # Subsystem Modules (Sesuai Bounded Context)
│   │   │       ├── identity/
│   │   │       │   ├── identity.module.ts
│   │   │       │   ├── identity.controller.ts  # Auth, Register, Login
│   │   │       │   └── identity.service.ts
│   │   │       ├── billing/
│   │   │       │   ├── billing.module.ts
│   │   │       │   ├── billing.controller.ts   # Invoice & Webhook Midtrans/Xendit
│   │   │       │   └── billing.service.ts      # Transaksi atomik perpanjangan kuota
│   │   │       ├── cms/
│   │   │       │   ├── cms.module.ts
│   │   │       │   ├── cms.controller.ts       # Konfigurasi Subdomain, Warna, Bio
│   │   │       │   └── cms.service.ts
│   │   │       ├── studio/
│   │   │       │   ├── studio.module.ts
│   │   │       │   ├── studio.controller.ts    # Chat AI, Request Artikel & Poster
│   │   │       │   └── studio.service.ts       # Orchestrator AI Engine & BullMQ
│   │   │       └── constituent/
│   │   │           ├── constituent.module.ts
│   │   │           ├── constituent.controller.ts # Ingestion Aspirasi dari Web Publik
│   │   │           └── constituent.service.ts    # Enkripsi PII & Pembuatan Tiket
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web-dashboard/                          # [FRONTEND] Private Portal Anggota Dewan
│   │   ├── src/
│   │   │   ├── middleware.ts                   # Auth Protection Route Middleware
│   │   │   ├── app/
│   │   │   │   ├── (auth)/                     # Auth Route Group
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   └── (dashboard)/                # Protected App Route Group
│   │   │   │       ├── layout.tsx              # Sidebar, Topbar, User Quota Indicator
│   │   │   │       ├── page.tsx                # Executive Summary & Morning Briefing
│   │   │   │       ├── studio/                 # Studio AI Interaktif
│   │   │   │       │   ├── page.tsx            # Chat Assistant & Content Generator
│   │   │   │       │   └── [id]/page.tsx       # Editor Artikel 3000 Kata & Review Poster
│   │   │   │       ├── branding/               # Theme & Microsite Customizer
│   │   │   │       │   └── page.tsx            # Live Preview Iframe, Color Picker, Upload
│   │   │   │       ├── billing/                # Subscription & Invoices
│   │   │   │       │   └── page.tsx            # Quota Usage Bar, Top-Up, Snap Checkout
│   │   │   │       └── aspirasi/               # Constituent Feedback Inbox
│   │   │   │           └── page.tsx            # Triage Aduan Warga & Filter Isu
│   │   │   ├── components/                     # UI Primitives & Widgets
│   │   │   │   ├── ui/                         # Shadcn UI (Button, Input, Dialog, etc.)
│   │   │   │   ├── quota-badge.tsx             # Widget Indikator Sisa Token
│   │   │   │   └── article-editor.tsx          # Rich Text / Markdown Editor
│   │   │   └── lib/
│   │   │       ├── api-client.ts               # Axios / Fetch Wrapper ke api-core
│   │   │       └── utils.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web-portal/                             # [FRONTEND] Public Microsite (*.polaris.id)
│   │   ├── src/
│   │   │   ├── middleware.ts                   # Host-Header Routing (Wildcard Extractor)
│   │   │   ├── app/
│   │   │   │   ├── [subdomain]/                # Dynamic Tenant Route
│   │   │   │   │   ├── layout.tsx              # Dynamic Theme Injector (Hex Color/Logo)
│   │   │   │   │   ├── page.tsx                # Microsite Landing Page (Bio, Feed, Banner)
│   │   │   │   │   ├── artikel/[slug]/         # Halaman Canonical Artikel & Poster
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── lapor/                  # Form Aspirasi Warga Publik
│   │   │   │   │       └── page.tsx
│   │   │   │   └── api/og/                     # Edge Dynamic OpenGraph Image Route
│   │   │   │       └── route.tsx
│   │   │   └── lib/
│   │   │       └── tenant-fetcher.ts           # ISR Fetcher untuk Data Dewan
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── worker-crawler/                         # [BACKGROUND WORKER] Headless Queue Daemon
│       ├── src/
│       │   ├── worker.ts                       # Entrypoint Redis Worker Listeners
│       │   ├── queues/                         # Queue Definitions
│       │   │   ├── dalle.queue.ts              # Antrean Render Gambar DALL-E
│       │   │   └── scraper.queue.ts            # Antrean Scraping Berita
│       │   ├── processors/                     # Job Execution Logic
│       │   │   ├── dalle-stream.processor.ts   # Stream Gambar OpenAI -> R2 Storage
│       │   │   └── news-crawler.processor.ts   # RSS & Web Scraper Berita Daerah
│       │   └── cron/                           # Scheduled Crons
│       │       ├── morning-briefing.cron.ts    # Cron 05.00 WIB (Kompilasi Berita)
│       │       └── quota-reset.cron.ts         # Cron Akhir Bulan (Reset Saldo)
│       ├── tsconfig.json
│       └── package.json
│
└── packages/
    │
    ├── shared-types/                           # [CONTRACTS] Shared Interfaces & Enums
    │   ├── src/
    │   │   ├── index.ts                        # Main export barrel
    │   │   ├── enums/                          # Seluruh Enumeration Domain
    │   │   │   ├── legislative-level.enum.ts
    │   │   │   ├── subscription-status.enum.ts
    │   │   │   ├── content-status.enum.ts
    │   │   │   ├── asset-type.enum.ts
    │   │   │   └── issue-category.enum.ts
    │   │   └── dto/                            # API Request/Response Interfaces
    │   │       ├── auth.dto.ts
    │   │       ├── studio.dto.ts
    │   │       ├── cms.dto.ts
    │   │       ├── billing.dto.ts
    │   │       └── constituent.dto.ts
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── core-domain/                            # [PURE OOP] Domain Models & Ports
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── entities/                       # Aggregates & Business Invariants
    │   │   │   ├── TenantMember.ts
    │   │   │   ├── Subscription.ts
    │   │   │   ├── TenantQuota.ts
    │   │   │   ├── PortalProfile.ts
    │   │   │   ├── ContentPublication.ts
    │   │   │   └── ConstituentFeedback.ts
    │   │   ├── value-objects/                  # Immutable Value Objects
    │   │   │   ├── SubdomainSlug.ts
    │   │   │   ├── HexColor.ts
    │   │   │   └── CanonicalUrl.ts
    │   │   └── ports/                          # Abstraction Interfaces (DIP)
    │   │       ├── llm-provider.port.ts
    │   │       ├── storage.port.ts
    │   │       └── payment-gateway.port.ts
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── database/                               # [DATA ACCESS] Drizzle ORM & Postgres
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── client.ts                       # Postgres Connection Pool Instance
    │   │   ├── schema/                         # Table Definitions (1:1 DDL)
    │   │   │   ├── identity.schema.ts
    │   │   │   ├── billing.schema.ts
    │   │   │   ├── cms.schema.ts
    │   │   │   ├── content.schema.ts
    │   │   │   ├── knowledge.schema.ts         # pgvector 1536 column mapping
    │   │   │   └── constituent.schema.ts
    │   │   ├── rls/                            # Row-Level Security Execution Wrappers
    │   │   │   └── with-tenant.ts              # Injeksi context tenant_id
    │   │   └── migrations/                     # Drizzle Migration SQL Files
    │   ├── drizzle.config.ts
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── ai-engine/                              # [AI ORCHESTRATOR] OpenAI & Langfuse
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── client/
    │   │   │   ├── openai.client.ts            # OpenAI SDK Singleton
    │   │   │   └── langfuse.client.ts          # Langfuse Telemetry Tracer
    │   │   ├── prompts/                        # System Prompts & Strict JSON Schemas
    │   │   │   ├── article-3000w.prompt.ts     # Prompt Artikel Teknokratis
    │   │   │   ├── dalle-visual.prompt.ts      # Prompt Infografis Bahasa Inggris
    │   │   │   └── social-snippet.prompt.ts    # Prompt Pemecah Thread X / IG
    │   │   └── rag/
    │   │       ├── context-builder.ts          # Context Capsule Assembler
    │   │       └── vector-search.ts            # Query Similarity HNSW pgvector
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── storage/                                # [ASSET INFRA] Cloudflare R2 Gateway
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── r2.client.ts                    # S3 Client ke Endpoint Cloudflare
    │   │   ├── uploader.ts                     # Stream Ingestion dari DALL-E
    │   │   └── image-optimizer.ts              # Sharp Compressor ke WebP
    │   ├── tsconfig.json
    │   └── package.json
    │
    └── payment/                                # [FINANCIAL INFRA] Midtrans Gateway
        ├── src/
        │   ├── index.ts
        │   ├── midtrans.client.ts              # Snap Invoice Generator
        │   └── webhook-verifier.ts             # Signature SHA512 & Idempotency Guard
        ├── tsconfig.json
        └── package.json
```

---

# BAGIAN 2: ROADMAP PENGEMBANGAN MODULAR TERSTRUKTUR

Roadmap ini dibagi menjadi **6 Fase Berurutan**. Implementasi tidak melompat ke fase berikutnya sebelum fase sebelumnya lulus kriteria pengujian (*Definition of Done*).

```text
[FASE 0: KESIAPAN LINGKUNGAN] ──► [FASE 1: KONTRAK & DOMAIN] ──► [FASE 2: BASIS DATA & RLS]
                                                                        │
[FASE 5: APLIKASI WEB]        ◄── [FASE 4: WORKER & DAEMON]  ◄── [FASE 3: INTEGRASI ADAPTER]
```

---

### FASE 0: Workspace & Tooling Foundation (Pondasi Repositori)
* **Tujuan:** Memastikan infrastruktur repo lokal siap tanpa ada konflik kompilasi antar package.
* **Komponen Modular Terkecil:**
  1. `0.1`: Konfigurasi file konfigurasi monorepo (`turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`).
  2. `0.2`: Setup skrip pembersihan (*clean cache*) dan validator environment (`.env`).
* **Kriteria Selesai (DoD):** Perintah `pnpm build` di root berjalan sukses tanpa error package dependency.

---

### FASE 1: Contracts & Pure Domain Specification (Cetak Biru Logika)
* **Tujuan:** Mendefinisikan seluruh tipe data, aturan bisnis, dan antarmuka (*ports*) tanpa dependensi framework luar.
* **Komponen Modular Terkecil:**
  1. `1.1`: Package `@polaris/shared-types` $\rightarrow$ Pemetaan seluruh enum (11 Enum) dan DTO Request/Response.
  2. `1.2`: Package `@polaris/core-domain` $\rightarrow$ Entitas `TenantQuota` (logika batas artikel/DALL-E).
  3. `1.3`: Package `@polaris/core-domain` $\rightarrow$ Entitas `ContentPublication` (logika slug & state transition).
  4. `1.4`: Package `@polaris/core-domain` $\rightarrow$ Entitas `PortalProfile` (validasi format subdomain).
  5. `1.5`: Package `@polaris/core-domain` $\rightarrow$ Deklarasi Interface Ports (`ILlmGateway`, `IStorageGateway`, `IPaymentGateway`).
* **Kriteria Selesai (DoD):** Unit test murni untuk validasi domain invariant lulus 100% (contoh: tes kuota tidak bisa minus).

---

### FASE 2: Persistence & Security Kernel (Database Layer)
* **Tujuan:** Memetakan tabel PostgreSQL, koneksi `pgvector`, dan keamanan multi-tenant ke dalam kode.
* **Komponen Modular Terkecil:**
  1. `2.1`: Package `@polaris/database` $\rightarrow$ Inisialisasi Drizzle ORM client & connection pooling.
  2. `2.2`: Package `@polaris/database` $\rightarrow$ Pemetaan skema tabel Drizzle 1:1 terhadap DDL SQL kita.
  3. `2.3`: Package `@polaris/database` $\rightarrow$ Implementasi helper `withTenantContext()` untuk mengeksekusi query di balik PostgreSQL Row-Level Security (RLS).
  4. `2.4`: Package `@polaris/database` $\rightarrow$ Query helper khusus `pgvector` HNSW (Cosine Distance search).
* **Kriteria Selesai (DoD):** Script pengujian query berhasil menyimpan data dan memblokir data tenant lain ketika RLS aktif.

---

### FASE 3: Infrastructure Adapters (AI, Storage & Payment)
* **Tujuan:** Membungkus layanan pihak ketiga ke dalam implementasi interface *ports* yang telah dibuat di Fase 1.
* **Komponen Modular Terkecil:**
  1. `3.1`: Package `@polaris/storage` $\rightarrow$ Client Cloudflare R2, fungsi *direct stream upload*, dan optimasi kompresi WebP.
  2. `3.2`: Package `@polaris/payment` $\rightarrow$ Generator invoice Midtrans Snap dan verifikasi signature webhook SHA512 idempotent.
  3. `3.3`: Package `@polaris/ai-engine` $\rightarrow$ Wrapper OpenAI GPT-4o (3.000 kata) dan GPT-4o-mini dengan skema JSON terstruktur.
  4. `3.4`: Package `@polaris/ai-engine` $\rightarrow$ Wrapper OpenAI DALL-E 3 (Portrait 1024x1792).
  5. `3.5`: Package `@polaris/ai-engine` $\rightarrow$ Interceptor Langfuse untuk audit token, latensi, dan biaya per tenant.
* **Kriteria Selesai (DoD):** Eksekusi tes integrasi mandiri memanggil AI dan menghasilkan trace tercatat di dashboard Langfuse.

---

### FASE 4: Backend Application Core (NestJS Modules)
* **Tujuan:** Membangun REST API, guards keamanan, dan orkestrasi use-case bisnis.
* **Komponen Modular Terkecil:**
  1. `4.1`: `@polaris/api-core` $\rightarrow$ Setup Guards (`AuthGuard`, `SubscriptionGuard`, `QuotaGuard`).
  2. `4.2`: Modul `Billing` $\rightarrow$ Endpoint transaksi Snap dan webhook receiver Midtrans.
  3. `4.3`: Modul `CMS` $\rightarrow$ Endpoint kustomisasi tema, upload foto resmi, dan validasi subdomain.
  4. `4.4`: Modul `Studio` $\rightarrow$ Endpoint interaksi AI, orkestrasi Context Capsule (RAG), dan pembagian varian medsos.
  5. `4.5`: Modul `Constituent` $\rightarrow$ Endpoint penerima aspirasi warga dan vault enkripsi PII (UU PDP).
* **Kriteria Selesai (DoD):** Seluruh API lulus pengujian via Postman/Bruno dengan status kode dan DTO yang valid.

---

### FASE 5: Background Workers & Headless Daemons (Automasi)
* **Tujuan:** Memindahkan tugas-tugas berat agar tidak memblokir server backend utama.
* **Komponen Modular Terkecil:**
  1. `5.1`: `@polaris/worker-crawler` $\rightarrow$ Setup BullMQ connection dan Redis queue listeners.
  2. `5.2`: Queue Processor `dalle-stream` $\rightarrow$ Pengunduh gambar DALL-E dan penyimpan otomatis ke Cloudflare R2.
  3. `5.3`: Cron Job `news-crawler` $\rightarrow$ Pengikis berita RSS media lokal terdaftar dan deduplikasi artikel.
  4. `5.4`: Cron Job `quota-reset` $\rightarrow$ Reset alokasi kuota bulanan per siklus tagihan anggota dewan.
* **Kriteria Selesai (DoD):** Worker berhasil memproses antrean gambar di latar belakang tanpa ada kegagalan koneksi Redis.

---

### FASE 6: User-Facing Applications (Frontend Next.js 15 & Theming Engine)
> **Cetak Biru Detail**: Lihat panduan arsitektural lengkap di [doc/FRONTEND_ROADMAP.md](file:///wsl.localhost/Ubuntu/home/pc/projects/polaris-platform/doc/FRONTEND_ROADMAP.md).

* **Tujuan:** Membangun dua ekosistem antarmuka pengguna: (1) `web-portal` (Website civic publik konstituen) dan (2) `web-dashboard` (Workspace eksekutif privat anggota dewan).
* **Komponen Modular Terkecil:**
  * **SUB-FASE 6.1: `@polaris/web-portal` — Public Civic Engine (`*.polaris.id`):**
    1. `6.1.1`: Next.js Setup, Tailwind Config & Dynamic Theme Variable Injector (`--primary`, `--secondary`).
    2. `6.1.2`: Host-Header Wildcard Middleware (Penyaring Subdomain & Custom Domain).
    3. `6.1.3`: Shell Komponen Publik (Navbar Dinamis, Footer Akuntabilitas, Mobile Drawer).
    4. `6.1.4`: Halaman Beranda Publik (Hero Baliho Resmi, Bio, Tautan Medsos, Feed Artikel).
    5. `6.1.5`: Halaman Pembaca Artikel 3.000 Kata (Tipografi Editorial, Poster DALL-E R2, Social Share Dock).
    6. `6.1.6`: Halaman Layanan Konstituen (`/lapor`, Form Captcha Turnstile & Pelacak Tiket `#CS-XXXX`).
    7. `6.1.7`: Generator OpenGraph Dinamis (`/api/og` Edge Thumbnail Otomatis untuk WA & X).
  * **SUB-FASE 6.2: `@polaris/web-dashboard` — Executive Workspace Dewan:**
    1. `6.2.1`: Next.js Setup, Shadcn UI Core & Session Auth Guard Interceptor.
    2. `6.2.2`: Executive App Shell (Responsive Collapsible Sidebar, Mobile Drawer, Topbar Quota Badge).
    3. `6.2.3`: Halaman Ringkasan Pagi (Executive Pulse, Morning Briefing 5 Isu, Rekomendasi Hari Ini).
    4. `6.2.4`: Studio AI Interaktif (Prompt Box, Streaming Generator, Editor Dual-Pane, DALL-E Review).
    5. `6.2.5`: Visual Branding Customizer (Theme Color Picker, Upload Banner R2, Iframe Live Preview).
    6. `6.2.6`: Panel Billing & Kuota (Indikator Saldo Real-Time, Midtrans Snap Checkout, Top-Up Addons).
    7. `6.2.7`: Inbox Advokasi Konstituen (Triage Pengaduan, Modal Dekripsi PII UU PDP, Status Disposisi).
* **Kriteria Selesai (DoD):**
  1. Akses ke `ahmad-fauzi.polaris.id` me-render profil publik dewan secara instan di Edge CDN dengan warna HEX partai yang sesuai.
  2. Dewan dapat login ke `app.polaris.id`, membuat artikel via Studio AI, mempublikasikannya dalam 1-klik, dan artikel tersebut langsung tayang di portal publik pribadinya.
  3. Warga dapat mengirimkan aduan di portal publik dan menerima nomor tiket `#CS-XXXX`, yang langsung muncul di inbox dashboard dewan dalam keadaan terdekripsi aman.
