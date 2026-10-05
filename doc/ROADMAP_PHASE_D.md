# ROADMAP TEKNIS DETAIL: FASE D
## Observabilitas Sistem, Telemetri AI Terdistribusi, Circuit-Breaker Token Pool & Automasi Rekonsiliasi Kas Harian

> **Metodologi Arsitektur:** Menerapkan prinsip *Observability & Operational Resilience* (Distributed Tracing, Circuit-Breaker Pattern ala Michael Nygard, dan Automated Self-Healing Reconciliation) berdasarkan **OOAD Craig Larman** dan pola **GRASP**.

```text
========================================================================================================================
POLARIS ARCHITECTURE ROADMAP — FASE D: TELEMETRI AI & OPERASIONAL MANDIRI
========================================================================================================================

                                  [ SISTEM OPERASIONAL PLATFORM POLARIS ]
                                                     │
                                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SUB-FASE D.1: UNIFIED DISTRIBUTED AI TELEMETRY (LANGFUSE + DB DUAL-SYNC)                                            │
│ • Sinkronisasi Trace ID unik antara Langfuse Cloud SDK dan tabel PostgreSQL ai_trace_logs                            │
│ • Pelacakan komprehensif: Input/Output Tokens, Latensi (ms), Cost USD, dan Status kegagalan per panggilan model     │
│ • Meliputi seluruh operasi AI: gpt-4o (3.000 kata), gpt-4o-mini (Concierge & Social), DALL-E 3, Text-Embedding      │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SUB-FASE D.2: CIRCUIT-BREAKER TOKEN POOL & NOTIFIKASI AMBANG BATAS                                                   │
│ • Pola Desain Circuit-Breaker (CLOSED -> OPEN -> HALF-OPEN) untuk melindungi saldo deposit OpenAI                     │
│ • Pre-Flight Gate: Mencegah eksekusi inferensi jika sisa saldo < $2.00 (Fail-Fast tanpa melempar fatal crash)         │
│ • Alarm Ambang Batas: Jika saldo <= 20%, picu broadcast darurat Redis Pub/Sub & kirim email ke seluruh Superadmin    │
└──────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SUB-FASE D.3: CRON DAEMON REKONSILIASI KAS OTOMATIS (BULLMQ 01.30 WIB)                                               │
│ • Resolusi celah arsitektural: Integrasi mesin 5-Way Matching langsung ke dalam worker-crawler                       │
│ • Penarikan mutasi otomatis transaksi H-1 Midtrans Core API -> Eksekusi komparasi kas internal vs gateway           │
│ • Self-Healing otomatis pada transaksi macet + Penerbitan laporan audit kas harian (BALANCED / DISCREPANCY_DETECTED)│
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
========================================================================================================================
```

---

## 1. Analisis Kritis & Celah Arsitektural Baseline (The Gap Analysis)

Sebagai *Senior Software Architect*, audit terhadap codebase saat ini menemukan **tiga celah operasional kritis** yang wajib diselesaikan pada Fase D:

1. **Jejak Telemetri AI yang Tidak Tersinkronisasi (*Desynchronized Tracing*):**
   * Di `packages/ai-engine/src/ai-engine.adapter.ts`, Langfuse membuat trace ID acak internal. Di sisi lain, di `apps/worker-crawler` dan `api-core`, penulisan ke tabel `ai_trace_logs` membuat trace ID berbeda (`tr_timestamp_random`).
   * *Dampak:* Superadmin tidak dapat menghubungkan baris log di database lokal dengan sesi visualisasi mendalam di Langfuse Cloud. Keduanya terputus.
2. **Ketiadaan *Circuit-Breaker* pada Deposit Kredit AI (*Uncontrolled Wallet Exposure*):**
   * Di `platform_token_pools`, terdapat pencatatan modal saldo, namun sistem tidak memiliki proteksi *Pre-Flight Gate*. Jika saldo deposit OpenAI menipis atau habis di tengah malam, sistem tetap memanggil API OpenAI, menghasilkan rentetan *unhandled error 500* kepada anggota dewan yang sedang bekerja.
3. **Celah Algoritma Pekerja Rekonsiliasi di `worker-crawler`:**
   * Di `apps/worker-crawler/src/processors/reconciliation.processor.ts`, job cron 01.30 WIB saat ini **hanya mengambil daftar mutasi dari Midtrans, lalu selesai tanpa menjalankan algoritma pencocokan 5-Way Matching** ke basis data! Mesin pencocokan saat ini terisolasi di `BillingModule` (`api-core`).
   * *Dampak:* Audit harian belum benar-benar mandiri (*autonomous*); mutasi ditarik namun buku kas tidak diperbarui kecuali superadmin membuka dashboard manual.

---

## SUB-FASE D.1: Unified Distributed AI Telemetry (Langfuse & DB Dual-Sync)

### 1. Analisis Domain & Model Data Telemetri
* **Konsep Inti:**
  Setiap interaksi AI (baik pembuatan naskah 3.000 kata, ekstraksi materi infografis, pembuatan poster DALL-E 3, pencarian vektor RAG, hingga obrolan asisten landing page) harus menghasilkan **Satu Identitas Jejak Tunggal (*Canonical Trace ID*)**.
* **Kebutuhan Informasi:**
  * `traceId`: Format UUID v4 atau nanoid berstandar OpenTelemetry.
  * `operation`: `generate-parliamentary-article-3000w` | `public-concierge-chat` | `dalle-image-generation` | `text-embedding-rag`.
  * `model`: `gpt-4o` | `gpt-4o-mini` | `dall-e-3` | `text-embedding-3-small`.
  * `inputTokens`, `outputTokens`, `totalTokens`.
  * `latencyMs`: Durasi waktu tempuh jaringan dan pemrosesan model.
  * `costUsd`: Biaya riil OpenAI terhitung secara matematis.
  * `status`: `SUCCESS` | `FAILED` | `REFUSAL`.

### 2. Pembagian Tanggung Jawab GRASP
* **Pure Fabrication (`AiTelemetryTracer`):**
  Layanan buatan di `@polaris/ai-engine` yang mengorkestrasi pencatatan ke SDK Langfuse dan secara atomik menuliskan baris log ke database PostgreSQL via port abstraction.
* **Information Expert (`AiCostCalculator`):**
  Pakar formula penetapan tarif resmi per jenis model:
  * GPT-4o: $\$2.50 / 1\text{M Input}, \$10.00 / 1\text{M Output}$ (rata-rata terbobot $\$12.00 / 1\text{M}$).
  * GPT-4o-mini: $\$0.15 / 1\text{M Input}, \$0.60 / 1\text{M Output}$.
  * DALL-E 3 (Portrait 1024x1792): Flat $\$0.08 / \text{gambar}$.
  * Text-Embedding-3-Small: $\$0.02 / 1\text{M Token}$.

### 3. Matriks Berkas Terdampak Sub-Fase D.1

```text
packages/core-domain/
└── src/
    └── ports/
        └── llm-provider.port.ts                          [MODIFIKASI: Sertakan traceId eksplisit pada result]

packages/ai-engine/
└── src/
    ├── telemetry/
    │   └── ai-telemetry.service.ts                       [BARU: Dual-Tracer Langfuse & Database Writer]
    ├── client.ts                                         [MODIFIKASI: Penguatan konfigurasi Langfuse Client]
    └── ai-engine.adapter.ts                              [MODIFIKASI: Integrasi sinkronisasi canonical traceId]

apps/api-core/
└── src/
    └── modules/
        └── superadmin/
            └── superadmin.service.ts                     [MODIFIKASI: Sinkronisasi rincian kueri telemetri trace]
```

---

## SUB-FASE D.2: Circuit-Breaker Token Pool & Notifikasi Ambang Batas

### 1. Analisis Pola Desain: *Circuit-Breaker Pattern (Michael Nygard)*
Untuk mencegah pemborosan saldo (*wallet draining*) dan kegagalan fatal saat deposit menipis, kita mengimplementasikan mesin *state machine* 3-kondisi:

```text
               [ Deposit Berkurang Normal ]
              ┌───────────────────────────┐
              │                           ▼
      ┌───────────────┐  Saldo <= $2.00  ┌───────────────┐
  ───►│    CLOSED     │─────────────────►│     OPEN      │
      │ (AI Normal)   │                  │ (Trip/Blocked)│
      └───────────────┘                  └───────────────┘
              ▲                                  │
              │         Top-Up Berhasil          │
              └──────────────────────────────────┘
                      (Uji Coba 1 Panggilan)
```

1. **State `CLOSED` (Normal):** Sisa deposit aman ($> 20\%$). Seluruh permintaan AI dieksekusi tanpa hambatan.
2. **State `OPEN` (Terputus / Diblokir):**
   * Sisa saldo deposit platform $\le \$2.00$ (kritis) ATAU OpenAI API mengalami *outage* global 3 kali berturut-turut.
   * *Tindakan Fail-Fast:* Sistem langsung menolak permintaan generasi dalam waktu $< 5\text{ ms}$ dengan pesan bermartabat kepada dewan: *"Layanan pemrosesan AI sedang dalam sinkronisasi kapasitas berkala. Silakan coba sesaat lagi atau hubungi administrator."*
   * Beban server $0$, tidak ada panggilan gagal yang membuang waktu tunggu timeout.
3. **Threshold Alarm ($\le 20\%$):**
   * Ketika saldo tersisa $\le 20\%$ dari alokasi master, sistem otomatis memancarkan event `realtime:broadcast` via Redis Pub/Sub ke seluruh browser superadmin yang aktif.
   * Mengirim email darurat otomatis via `EmailService` ke alamat administrator utama (`smtpgeocitra@gmail.com`).

### 2. Pembagian Tanggung Jawab GRASP
* **Protected Variations (`PlatformTokenCircuitBreaker`):**
  Melindungi seluruh modul pemanggil AI (`StudioService`, `PublicChatService`, `ConstituentService`) dari keharusan memeriksa saldo secara manual di setiap baris kode.
* **Information Expert (`PlatformTokenPoolRepository`):**
  Pakar data yang memegang status saldo saat ini, persentase terpakai, dan ambang batas peringatan (*alert threshold*).

### 3. Matriks Berkas Terdampak Sub-Fase D.2

```text
packages/core-domain/
└── src/
    └── entities/
        └── PlatformTokenPool.ts                          [BARU: Entitas Domain Pengendali Circuit Breaker]

packages/database/
└── src/
    └── schema/
        └── billing.ts                                    [MODIFIKASI: Tambah status circuit_state pada pool]

apps/api-core/
└── src/
    ├── common/
    │   └── guards/
    │       └── token-circuit-breaker.guard.ts            [BARU: Pre-Flight Guard Pemeriksa Status Saldo]
    └── modules/
        ├── redis/
        │   └── redis.service.ts                          [MODIFIKASI: Caching status circuit di memori Redis]
        └── superadmin/
            └── superadmin.service.ts                     [MODIFIKASI: Logika Top-Up mereset status Circuit]
```

---

## SUB-FASE D.3: Automasi Daemon Rekonsiliasi Finansial Harian (01.30 WIB)

### 1. Analisis Kebutuhan & Integrasi Lintas-Subistem
* **Masalah Inti:**
  `apps/worker-crawler` dan `apps/api-core` adalah dua aplikasi mandiri di dalam monorepo. Selama ini `ReconciliationEngineService` diletakkan di `api-core`, sehingga `reconciliation.processor.ts` di worker tidak dapat mengakses logika pencocokan kas secara langsung tanpa melanggar batas modularitas.
* **Solusi Arsitektural Bersih (OOAD Clean Architecture):**
  1. **Ekstraksi Engine ke Domain / Shared Layer:**
     Memindahkan logika murni *5-Way Matching Algorithm* ke `@polaris/payment` atau modul servis yang dapat diakses bersama oleh `api-core` dan `worker-crawler`.
  2. **Eksekusi Asinkron Mandiri:**
     Setiap pukul 01.30 WIB, worker BullMQ:
     * Menghitung tanggal target ($H-1$).
     * Mengambil daftar invoice internal yang berstatus `UNRECONCILED` atau `PENDING` pada tanggal tersebut.
     * Mengkueri status resmi ke Midtrans Core API secara *batch*.
     * Menjalankan kalkulasi selisih, *self-healing* transaksi macet, dan menutup batch dengan status `BALANCED` atau `DISCREPANCY_DETECTED`.
     * Jika terdeteksi selisih $> \text{Rp } 0$, memancarkan sinyal darurat finansial ke superadmin console.

### 2. Pembagian Tanggung Jawab GRASP
* **Controller / Job Processor (`ReconciliationProcessor`):**
  Mengambil data transaksi dari antrean Redis dan mendelegasikan eksekusi pencocokan kas.
* **High Cohesion:**
  Seluruh rangkaian audit keuangan berjalan tanpa bergantung pada apakah superadmin sedang membuka laptop atau tidak.

### 3. Matriks Berkas Terdampak Sub-Fase D.3

```text
packages/payment/
└── src/
    └── reconciliation-core.engine.ts                     [BARU: Shared Engine 5-Way Matching Mandiri]

apps/worker-crawler/
└── src/
    └── processors/
        └── reconciliation.processor.ts                   [MODIFIKASI: Eksekusi Penuh Audit Kas H-1]

apps/api-core/
└── src/
    └── modules/
        └── billing/
            └── reconciliation-engine.service.ts          [MODIFIKASI: Mendelegasikan ke Shared Core Engine]
```

---

## DEFINITION OF DONE (DoD) FASE D

Fase D dinyatakan **SELESAI 100%** apabila memenuhi kriteria pengujian terukur berikut:

1. **Sinkronisasi Trace 1:1:**
   * Setiap kali artikel kebijakan atau chat publik digenerate, `traceId` yang tercatat di Langfuse Cloud identik persis dengan kolom `trace_id` pada tabel `ai_trace_logs` di database lokal.
2. **Kekebalan Circuit-Breaker:**
   * Disimulasikan saldo deposit diatur ke $\$1.50$ (di bawah ambang batas $\$2.00$):
     * Permintaan pembuatan naskah baru langsung ditolak dalam $< 10\text{ ms}$ dengan status aman tanpa menyentuh API OpenAI.
     * Alarm darurat berbunyi di antarmuka Superadmin Topbar Bell secara instan via Redis Pub/Sub.
3. **Audit Kas Harian Berjalan Tuntas 100%:**
   * Tepat pukul 01.30 WIB (atau saat dipicu uji coba), cron BullMQ berhasil membuat baris baru di `reconciliation_batches` untuk tanggal $H-1$, mencocokkan mutasi kas, dan menyelesaikan transaksi macet secara otomatis (*Self-Healing*).
