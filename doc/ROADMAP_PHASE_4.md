# ROADMAP TEKNIS DETAIL: FASE 4
## Desain & Integrasi Mesin Rekonsiliasi Midtrans (Automasi Audit Harian & Resolusi Selisih Superadmin)

> Disusun menggunakan metodologi Object-Oriented Analysis and Design (OOAD) Craig Larman, prinsip GRASP, dan standar integritas sistem akuntansi finansial modern (*Financial-Grade Ledger Reconciliation*).

```text
========================================================================================================================
POLARIS ARCHITECTURE ROADMAP — FASE 4: MESIN REKONSILIASI MIDTRANS & RESOLUSI AUDIT
========================================================================================================================

[SUB-FASE 4.1: GATEWAY REPORT ADAPTER & PARSER]
  ├── IPaymentReportPort (@polaris/core-domain) ──► Kontrak Agnostik Laporan Gateway
  ├── MidtransReportAdapter (@polaris/payment) ──► Parsing CSV / JSON Settlement Report Midtrans
  └── Normalisasi GatewaySettlementRecord[] (Order ID, Gross, MDR, PPN, Net, Settlement Time)

[SUB-FASE 4.2: RECONCILIATION ENGINE & SELF-HEALING]
  ├── ReconciliationEngineService (Pure Fabrication) ──► Matching Algorithm 5-Way
  │     ├── 1. MATCHED: Status, Gross, dan Order ID identik ──► Tandai Lolos Audit
  │     ├── 2. SELF-HEALING (Status Mismatch): Webhook macet tapi di Midtrans lunas ──► Auto-Settle & Aktifkan Lisensi
  │     ├── 3. AMOUNT MISMATCH: Selisih rupiah ──► Catat ke Discrepancy Log
  │     ├── 4. MISSING IN INTERNAL: Uang masuk di Midtrans tapi tak bertuan di DB ──► Alert Investigasi
  │     └── 5. MISSING IN GATEWAY: Di DB berstatus lunas tapi nihil di mutasi Midtrans ──► Alert Fraud
  └── Invariant Enforcer: Status Batch BALANCED vs DISCREPANCY_DETECTED

[SUB-FASE 4.3: BULLMQ DAEMON CRON & KONSOL SUPERADMIN]
  ├── BullMQ Cron (01.30 WIB): Audit Harian Mutasi H-1 Otomatis
  ├── REST API Superadmin (Batch History, Trigger Manual, Upload CSV Mutasi, Resolve Discrepancy)
  └── Antarmuka Web Dashboard: /superadmin/reconciliation (KPI Kas Bersih, Tabel Batch, Modal Resolusi Selisih)
========================================================================================================================
```

---

## SUB-FASE 4.1: Gateway Report Adapter & Midtrans Report Parser

### 1. Analisis Domain & Ekstraksi Laporan
* **Kebutuhan Bisnis:**
  Setiap hari kerja, Midtrans menerbitkan laporan penyelesaian dana (*Daily Settlement Report*) yang dapat diakses melalui:
  1. File CSV Settlement resmi (diunduh dari Midtrans Merchant Portal).
  2. Midtrans Reporting / Search API (`/v2/transactions` atau Iris Settlement List).
* **Format Data Laporan:**
  Kolom wajib yang harus diekstraksi: `order_id`, `transaction_time`, `settlement_time`, `gross_amount`, `payment_type`, `mdr_fee`, `net_amount`.
* **Solusi Arsitektural:**
  Menerapkan pola **Adapter Pattern & Port Architecture (Hexagonal)**: logika parsing CSV dan API gateway diisolasi di `@polaris/payment`, sementara domain inti hanya mengenal data struktur murni `GatewaySettlementRecord[]`.

### 2. Penetapan Tanggung Jawab GRASP
* **Protected Variations (`IPaymentReportPort`):**
  Mengisolasi format laporan Midtrans. Jika kelak POLARIS menambahkan mutasi rekening koran bank manual (B2B SPK) atau gateway lain (Xendit), modul rekonsiliasi inti tidak perlu diubah.
* **Pure Fabrication (`MidtransReportAdapter`):**
  Layanan buatan yang bertanggung jawab mem-parsing string CSV/JSON mentah, menormalisasi tanggal, dan memvalidasi keabsahan baris mutasi.
* **High Cohesion:**
  `MidtransReportAdapter` hanya berfokus pada I/O dan deserialisasi laporan gateway, tanpa mencampurkan logika bisnis pencocokan database.

### 3. Berkas yang Terdampak
1. `packages/core-domain/src/ports/payment-report.port.ts` *(Berkas Baru)*
2. `packages/payment/src/report-parser.ts` *(Berkas Baru)*
3. `packages/payment/src/index.ts`
4. `packages/shared-types/src/dto/reconciliation.dto.ts`

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 4.1.1 (Definisi Port Laporan Domain):**
  Di `@polaris/core-domain`, buat interface `IPaymentReportPort`:
  ```typescript
  export interface GatewaySettlementRecord {
    gatewayOrderId: string;
    grossAmountIdr: number;
    mdrFeeIdr: number;
    vatFeeIdr: number;
    netAmountIdr: number;
    paymentType: string;
    transactionTime: Date;
    settlementTime: Date;
  }
  export interface IPaymentReportPort {
    parseSettlementCsv(csvString: string): Promise<GatewaySettlementRecord[]>;
    fetchSettlementListByDate(dateStr: string): Promise<GatewaySettlementRecord[]>;
  }
  ```
* **Langkah 4.1.2 (Pembangunan Parser CSV Midtrans):**
  Di `@polaris/payment`, buat `MidtransReportAdapter` yang mampu mem-parsing CSV mutasi standar Midtrans (membuang header baris non-data, menangani pemisah koma/titik koma, parsing desimal rupiah, dan timezone GMT+7).
* **Langkah 4.1.3 (Unit Test Parsing):**
  Buat pengujian mandiri terhadap sampel CSV Midtrans untuk memastikan tidak ada kesalahan pemotongan angka nol (*zero-padding*) pada `order_id` dan nominal rupiah.

---

## SUB-FASE 4.2: Mesin Rekonsiliasi Inti (*Matching Algorithm & Self-Healing Engine*)

### 1. Analisis Domain & Logika Pencocokan 5-Arah (5-Way Matching)
* **Masalah Bisnis:**
  Membandingkan dua himpunan data transaksi: **Himpunan Internal $I$** (`invoice_transactions`) dan **Himpunan Gateway $G$** (`GatewaySettlementRecord[]`).
* **Matriks Evaluasi Komparasi:**

| Kasus | Kondisi Data | Status Rekonsiliasi | Tindakan Sistem |
| :--- | :--- | :--- | :--- |
| **1. Matched Sempurna** | Order ID cocok, Status sama (`SETTLEMENT`), Gross sama ($\pm \text{Rp } 2$) | `MATCHED` | Hubungkan ke Batch ID, tandai lunas tervalidasi audit. |
| **2. Self-Healing (Missed Webhook)** | Order ID cocok, di Midtrans sudah `settlement`, di internal masih `PENDING` | `MATCHED` *(Auto-Healed)* | **Self-Healing Otomatis:** Ubah status menjadi `SETTLEMENT`, aktifkan lisensi dewan, buat log resolusi otomatis. |
| **3. Selisih Nominal** | Order ID cocok, nominal kotor di Midtrans $\ne$ tagihan internal | `DISCREPANCY` | Catat ke `reconciliation_discrepancies` tipe `AMOUNT_MISMATCH`. |
| **4. Tidak Ada di Internal** | Transaksi ada di Midtrans, tapi Order ID tidak ada di database POLARIS | `DISCREPANCY` | Catat tipe `MISSING_IN_INTERNAL` (uang tak bertuan/salah rekening tujuan). |
| **5. Tidak Ada di Gateway** | Di internal tercatat `SETTLEMENT`, tapi tidak ada di laporan mutasi resmi Midtrans | `DISCREPANCY` | Catat tipe `MISSING_IN_GATEWAY` (indikasi bypass pembayaran palsu/fraud). |

### 2. Penetapan Tanggung Jawab GRASP
* **Information Expert:** 
  `ReconciliationBatch` (Aggregate Root) memvalidasi kondisi akhir: jika seluruh transaksi cocok dan nol selisih, tandai `BALANCED`. Jika ada $\ge 1$ selisih, tandai `DISCREPANCY_DETECTED`.
* **Pure Fabrication (`ReconciliationEngineService`):**
  Layanan orkestrator yang mengeksekusi komparasi himpunan data secara atomik di dalam PostgreSQL transaction block (`db.transaction`).
* **Low Coupling:**
  Mesin rekonsiliasi beroperasi secara non-destruktif; tidak menghapus data transaksi yang sudah ada, hanya memperbarui pointer relasi batch dan status audit.

### 3. Berkas yang Terdampak
1. `apps/api-core/src/modules/billing/reconciliation-engine.service.ts` *(Berkas Baru)*
2. `apps/api-core/src/modules/billing/billing.module.ts`
3. `apps/api-core/src/modules/billing/billing.service.ts`

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 4.2.1 (Pembangunan Engine Service):**
  Buat `ReconciliationEngineService` dengan method utama `executeReconciliation(reconDate, gatewayRecords, executedBy)`.
* **Langkah 4.2.2 (Eksekusi 5-Way Matching):**
  Lakukan pencocokan berbasis Map Index O(1) untuk performa cepat pada ribuan baris data:
  ```typescript
  const gatewayMap = new Map(gatewayRecords.map(r => [r.gatewayOrderId, r]));
  ```
* **Langkah 4.2.3 (Penerapan Logika Self-Healing):**
  Jika ditemukan invoice internal berstatus `PENDING` padahal di Midtrans sudah lunas, panggil `activateSubscriptionFromSettlement` secara transaksional, lalu buat catatan resolusi `AUTO_RESOLVED` pada tabel selisih.
* **Langkah 4.2.4 (Penutupan Batch Audit):**
  Hitung akumulasi final: $\text{Total Gross}$, $\text{Total MDR}$, $\text{Total Net}$, dan update status `reconciliation_batches`.

---

## SUB-FASE 4.3: Automasi Daemon BullMQ & Konsol Audit Superadmin

### 1. Analisis Kebutuhan Operasional & Penjadwalan
* **Kebutuhan Daemon:**
  Audit harian harus berjalan otomatis setiap dini hari tanpa campur tangan manusia (misal: pukul 01.30 WIB untuk merekonsiliasi transaksi H-1).
* **Kebutuhan Antarmuka Superadmin:**
  Tim Finance / Superadmin memerlukan antarmuka untuk:
  1. Melihat daftar riwayat batch harian dan ringkasan kas bersih platform.
  2. Mengunggah file CSV mutasi Midtrans secara manual (jika koneksi API gateway terputus).
  3. Memicu rekonsiliasi ulang (*re-run reconciliation*) untuk tanggal tertentu.
  4. Meninjau daftar selisih (*discrepancies*) dan menandai resolusi manual beserta catatan justifikasi pembukuan (*manual resolution with audit notes*).

### 2. Penetapan Tanggung Jawab GRASP
* **Controller (`SuperadminReconciliationController`):**
  Menyediakan endpoint REST API terproteksi `SuperadminGuard` untuk konsumsi dashboard web.
* **Indirection (`reconciliation.queue.ts` di `apps/worker-crawler`):**
  Menjadwalkan eksekusi cron harian menggunakan BullMQ Repeatable Jobs, memastikan tugas audit tidak membebani server web API.

### 3. Berkas yang Terdampak
1. `apps/worker-crawler/src/queues/reconciliation.queue.ts` *(Berkas Baru)*
2. `apps/worker-crawler/src/processors/reconciliation.processor.ts` *(Berkas Baru)*
3. `apps/worker-crawler/src/worker.ts`
4. `apps/api-core/src/modules/superadmin/superadmin-reconciliation.controller.ts` *(Berkas Baru)*
5. `apps/api-core/src/modules/superadmin/superadmin.module.ts`
6. `apps/web-dashboard/src/app/superadmin/reconciliation/page.tsx` *(Halaman Baru)*
7. `apps/web-dashboard/src/components/superadmin/reconciliation/*` *(Komponen UI Baru)*

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 4.3.1 (Worker Cron BullMQ):**
  Di `apps/worker-crawler`, daftarkan cron job berulang `daily-reconciliation-job` dengan pola `30 1 * * *` (01.30 WIB).
* **Langkah 4.3.2 (REST API Superadmin):**
  Bangun endpoint di `api-core`:
  * `GET /admin/reconciliation/batches`: Daftar batch rekonsiliasi (paginasi & filter status).
  * `GET /admin/reconciliation/batches/:id`: Detail batch + daftar transaksi selisih.
  * `POST /admin/reconciliation/trigger`: Memicu audit tanggal tertentu.
  * `POST /admin/reconciliation/upload-csv`: Ingestion laporan CSV Midtrans secara manual via multipart form-data.
  * `POST /admin/reconciliation/discrepancies/:id/resolve`: Menyelesaikan selisih secara manual oleh finance admin.
* **Langkah 4.3.3 (Antarmuka Web Dashboard Superadmin):**
  Di `apps/web-dashboard`, bangun ruang kerja rekonsiliasi:
  * Kartu KPI Kas Bersih (Total Gross, Biaya MDR, Dana Bersih Masuk Kas, Total Selisih).
  * Tabel Riwayat Batch Rekonsiliasi (indikator badge `BALANCED`, `DISCREPANCY_DETECTED`, `RESOLVED`).
  * Modal Upload CSV Settlement Midtrans & Drawer Penyelesaian Selisih Transaksi.

---

# DEFINITION OF DONE (DoD) FASE 4

Fase 4 dinyatakan tuntas secara arsitektural apabila memenuhi seluruh kriteria objektif berikut:

1. **Uji Parser Laporan:**
   * Parser berhasil membaca sampel CSV atau JSON mutasi resmi Midtrans dan menghasilkan array `GatewaySettlementRecord[]` tanpa kesalahan konversi angka rupiah.
2. **Uji Algoritma 5-Way Matching:**
   * **Kasus Cocok:** Transaksi lunas otomatis ditandai `MATCHED` dan terhubung ke Batch ID terkait.
   * **Kasus Self-Healing:** Transaksi internal yang sengaja dibiarkan berstatus `PENDING` (simulasi webhook macet) berhasil dipulihkan otomatis menjadi `SETTLEMENT`, lisensi dewan aktif, dan tercatat di audit log.
   * **Kasus Anomali:** Simulasi transaksi fiktif menghasilkan pencatatan presisi pada tabel `reconciliation_discrepancies`.
3. **Uji Invarian Keseimbangan Batch:**
   * Batch berstatus `BALANCED` jika dan hanya jika `total_discrepancies === 0` dan $\text{Gross} = \text{Net} + \text{MDR} + \text{VAT}$.
4. **Uji Operasional Superadmin:**
   * Admin Finance dapat mengunggah file CSV mutasi Midtrans di halaman dashboard `/superadmin/reconciliation`, melihat status rekonsiliasi harian, dan menyelesaikan selisih transaksi secara manual dengan catatan audit yang sah.
