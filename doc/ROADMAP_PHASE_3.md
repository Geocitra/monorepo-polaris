# ROADMAP TEKNIS DETAIL: FASE 3
## Refaktorisasi Modul Billing & Penyusunan Fondasi Rekonsiliasi Finansial

> Disusun menggunakan metodologi Object-Oriented Analysis and Design (OOAD) Craig Larman, prinsip GRASP, dan standar Production-Grade Financial Accounting.

```text
====================================================================================================
POLARIS ARCHITECTURE ROADMAP — FASE 3: REFAKTORISASI BILLING & FONDASI REKONSILIASI
====================================================================================================

[SUB-FASE 3.1: PERLUASAN SKEMA & ENTITAS FINANSIAL]
  ├── Multi-Component Accounting di invoice_transactions (Gross, MDR, PPN, Net, Settlement Time)
  └── MidtransFeeCalculator (Pure Fabrication) ──► Estimasi Biaya Payment Channel (VA, QRIS, CC)

[SUB-FASE 3.2: PEMODELAN AGREGAT REKONSILIASI]
  ├── Tabel reconciliation_batches ──► Batch Lifecycle State Machine (PROCESSING -> BALANCED / DISCREPANCY)
  ├── Tabel reconciliation_discrepancies ──► Status Mismatch, Amount Mismatch, Missing Transactions
  └── Enum Kontrak Finansial di @polaris/shared-types

[SUB-FASE 3.3: IDEMPOTENT FINANCIAL WEBHOOK & AUDIT TRAIL]
  ├── Penguatan Idempotency Guard & Penangkapan Komponen Dana Bersih (Net Ingress)
  └── Atomic Subscription Activation ──► Mutasi Status Transaksi + Aktivasi Lisensi Atomik (ACID)
====================================================================================================
```

---

## SUB-FASE 3.1: Perluasan Skema & Entitas Finansial (`invoice_transactions`)

### 1. Analisis Domain & Kebutuhan Akuntansi
* **Kondisi Eksisting:**
  Tabel `invoice_transactions` saat ini hanya mencatat kolom tunggal `amount_idr` dan `payment_status`. 
* **Masalah Akuntansi:**
  Uang yang dibayarkan oleh anggota dewan (*Gross Amount*, misal Rp 10.000.000) **berbeda** dengan uang kas yang dicairkan (*disbursed*) oleh Midtrans ke rekening operasional POLARIS (*Net Amount*), karena adanya potongan:
  1. Biaya MDR (*Merchant Discount Rate*), misal 0,7% untuk QRIS atau flat ~Rp 4.000 untuk Virtual Account bank.
  2. Pajak Pertambahan Nilai (PPN 11%) atas biaya jasa transaksi gateway.
* **Solusi Arsitektural:**
  Memperluas model `InvoiceTransaction` agar menganut kaidah pembukuan presisi:
  $$\text{Net Amount} = \text{Gross Amount} - (\text{MDR Fee} + \text{VAT Fee})$$
  Serta menambahkan kolom `settlement_time` (waktu uang selesai divalidasi bank) dan `reconciliation_status` (`UNRECONCILED`, `MATCHED`, `DISCREPANCY`).

### 2. Penetapan Tanggung Jawab GRASP
* **Information Expert (`InvoiceTransaction` Entity):**
  Objek entitas transaksi memegang otoritas atas status pembayarannya sendiri, mengetahui kapan tagihan berstatus lunas, serta validasi bahwa `net_amount` tidak boleh bernilai negatif.
* **Pure Fabrication (`MidtransFeeCalculator`):**
  Layanan khusus untuk memetakan formula fee per kanal pembayaran (BCA VA, Mandiri VA, QRIS, Kartu Kredit). Tidak membebani entitas domain dengan rincian teknis tarif vendor.
* **Protected Variations:**
  Komponen nilai finansial disimpan dalam format desimal presisi (`NUMERIC(12, 2)` di PostgreSQL dan string ber-presisi di TypeScript) untuk mencegah galat pembulatan (*floating point rounding errors*).

### 3. Berkas yang Terdampak
1. `packages/database/src/migrations/0006_financial_reconciliation_foundation.sql` *(Berkas Baru)*
2. `packages/database/src/schema/billing.ts`
3. `packages/core-domain/src/entities/InvoiceTransaction.ts` *(Entitas Domain Baru)*
4. `packages/payment/src/fee-calculator.ts` *(Pure Fabrication Baru)*
5. `packages/shared-types/src/dto/billing.dto.ts`

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 3.1.1 (Migrasi Kolom Akuntansi Finansial):**
  Tambahkan kolom pada tabel `invoice_transactions`:
  * `gross_amount_idr NUMERIC(12, 2)`
  * `mdr_fee_idr NUMERIC(12, 2) DEFAULT 0.00`
  * `vat_fee_idr NUMERIC(12, 2) DEFAULT 0.00`
  * `net_amount_idr NUMERIC(12, 2)`
  * `settlement_time TIMESTAMPTZ`
  * `reconciliation_status VARCHAR(30) DEFAULT 'UNRECONCILED'`
* **Langkah 3.1.2 (Pembangunan `MidtransFeeCalculator`):**
  Buat kalkulator tarif gateway di `@polaris/payment` yang menghitung potongan fee standar Midtrans:
  * `qris`: $0,7\%$ dari gross amount.
  * `bank_transfer` (VA): Flat Rp 4.000 + PPN 11% (Rp 4.440).
  * `credit_card`: $2,9\% + \text{Rp } 2.000$ + PPN 11%.
* **Langkah 3.1.3 (Entitas Domain Murni `InvoiceTransaction`):**
  Di `@polaris/core-domain`, buat kelas entitas `InvoiceTransaction` dengan metode:
  * `settlePayment(settlementTime, feeBreakdown)`
  * `markReconciled(batchId)`
  * `markDiscrepancy(reason)`

---

## SUB-FASE 3.2: Pemodelan Agregat Rekonsiliasi (`reconciliation_batches` & `discrepancies`)

### 1. Analisis Domain & Relasi Antar Agregat
* **Konsep Inti:**
  Proses rekonsiliasi bukan operasi satu transaksi, melainkan **audit sekumpulan data (*Batch Audit*)** per siklus tanggal (misal: Transaksi Harian H-1).
* **Agregat Utama:**
  1. **`ReconciliationBatch` (Aggregate Root):**
     Menampung meta-informasi rekonsiliasi: tanggal audit, total transaksi internal, total mutasi gateway, total nominal gross yang cocok, total potongan fee gateway, dan status batch (`PROCESSING`, `BALANCED`, `DISCREPANCY_DETECTED`, `RESOLVED`).
  2. **`ReconciliationDiscrepancy` (Entity):**
     Menampung detail selisih jika ada transaksi anomali, jenis selisih (`STATUS_MISMATCH`, `AMOUNT_MISMATCH`, `MISSING_IN_INTERNAL`, `MISSING_IN_GATEWAY`), catatan investigasi, dan aktor penyelesai (*resolved by admin*).

### 2. Penetapan Tanggung Jawab GRASP
* **High Cohesion:** 
  Pencatatan selisih dipisahkan ke tabel khusus `reconciliation_discrepancies`, sehingga tabel operasional `invoice_transactions` tetap bersih dari log audit selisih yang berat.
* **Low Coupling:**
  `ReconciliationBatch` hanya menyimpan referensi ID transaksi dan tautan dokumen laporan mentah (*raw report URL*) di Cloudflare R2 tanpa mengunci (*lock*) baris database utama selama proses komparasi berjalan.

### 3. Berkas yang Terdampak
1. `packages/database/src/schema/billing.ts` (Daftarkan tabel `reconciliationBatches` & `reconciliationDiscrepancies`)
2. `packages/shared-types/src/enums/index.ts` (Tambah Enum Status Rekonsiliasi)
3. `packages/shared-types/src/dto/reconciliation.dto.ts` *(Berkas Baru)*
4. `packages/core-domain/src/entities/ReconciliationBatch.ts` *(Berkas Baru)*

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 3.2.1 (DDL Skema Tabel Rekonsiliasi):**
  Definisikan tabel `reconciliation_batches` dan `reconciliation_discrepancies` di Drizzle ORM beserta *foreign key constraints* dan indeks pencarian berdasarkan tanggal & status.
* **Langkah 3.2.2 (Pemetaan Enum Kontrak):**
  Definisikan enum pada `@polaris/shared-types`:
  * `ReconciliationStatus`: `UNRECONCILED`, `MATCHED`, `DISCREPANCY`.
  * `BatchReconStatus`: `PROCESSING`, `BALANCED`, `DISCREPANCY_DETECTED`, `RESOLVED`.
  * `DiscrepancyType`: `STATUS_MISMATCH`, `AMOUNT_MISMATCH`, `MISSING_IN_INTERNAL`, `MISSING_IN_GATEWAY`.
  * `DiscrepancyResolution`: `UNRESOLVED`, `AUTO_RESOLVED`, `MANUALLY_RESOLVED`, `IGNORED`.
* **Langkah 3.2.3 (Invariants Domain Model):**
  Di `@polaris/core-domain`, buat entitas `ReconciliationBatch` dengan bisnis logic:
  * Suatu batch hanya boleh berstatus `BALANCED` jika `totalDiscrepancies === 0`.
  * Jika ditemukan $\ge 1$ selisih, status batch otomatis berubah menjadi `DISCREPANCY_DETECTED`.

---

## SUB-FASE 3.3: Idempotent Financial Webhook & Refaktorisasi Billing Service

### 1. Analisis Masalah & Transaksi ACID
* **Kondisi Eksisting:**
  Pada `BillingService::handleMidtransWebhook`, saat menerima status `settlement`, sistem memperbarui `invoice_transactions` dan `subscriptions`. Namun, nominal fee Midtrans belum dihitung, dan data bersih kas belum tercatat.
* **Tindakan Perbaikan:**
  1. *Payload Capture:* Ekstrak `settlement_time`, `payment_type`, dan `gross_amount` langsung dari webhook.
  2. *Automatic Fee Breakdown:* Panggil `MidtransFeeCalculator` untuk menghitung `mdr_fee_idr`, `vat_fee_idr`, dan `net_amount_idr`.
  3. *Strict Idempotency Guard:* Jika webhook untuk `order_id` yang sama tiba berulang kali (*webhook retry*), sistem memastikan tidak terjadi duplikasi kalkulasi kas ataupun perpanjangan masa aktif ganda.

### 2. Penetapan Tanggung Jawab GRASP
* **Controller:** `BillingController` menerima HTTP POST `/billing/webhook`, memvalidasi signature SHA-512, dan mendelegasikan pemrosesan ke `BillingService`.
* **Creator Pattern:** `BillingService` bertindak sebagai *Creator* pencatatan mutasi lunas di dalam blok transaksi PostgreSQL database (`db.transaction`).

### 3. Berkas yang Terdampak
1. `apps/api-core/src/modules/billing/billing.service.ts`
2. `packages/payment/src/payment.adapter.ts`
3. `apps/api-core/src/modules/billing/dto/billing.dto.ts`

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 3.3.1 (Penyempurnaan Webhook Parser di Adapter):**
  Di `packages/payment/src/payment.adapter.ts`, buat parser terstruktur yang mengekstrak rincian webhook:
  `{ orderId, grossAmount, paymentType, transactionTime, settlementTime, fraudStatus, paymentStatus }`.
* **Langkah 3.3.2 (Refaktorisasi Eksekusi Transaksional di `BillingService`):**
  Ubah metode `activateSubscriptionFromSettlement`:
  * Masukkan kalkulasi fee MDR & PPN secara presisi.
  * Update kolom `gross_amount_idr`, `mdr_fee_idr`, `vat_fee_idr`, `net_amount_idr`, dan `settlement_time` di tabel `invoice_transactions`.
  * Set `reconciliation_status = 'UNRECONCILED'` sebagai penanda siap diaudit pada batch rekonsiliasi harian.
* **Langkah 3.3.3 (Endpoint Status Keuangan Lengkap):**
  Perbarui metode `getBillingStatus` agar mengembalikan rincian transaksi terakhir lengkap dengan kanal pembayaran dan status verifikasi finansial.

---

# DEFINITION OF DONE (DoD) FASE 3

Fase 3 dinyatakan tuntas dan siap melangkah ke integrasi mesin rekonsiliasi di Fase 4 apabila:

1. **Integritas Skema Akuntansi:**
   * Tabel `invoice_transactions` memiliki kolom akuntansi lengkap (`gross_amount_idr`, `mdr_fee_idr`, `vat_fee_idr`, `net_amount_idr`, `settlement_time`, `reconciliation_status`).
   * Tabel `reconciliation_batches` dan `reconciliation_discrepancies` terpasang di PostgreSQL dengan *foreign keys* dan indeks yang valid.
2. **Kalkulasi Net Amount Presisi:**
   * Simulasi pembayaran via QRIS dan Virtual Account menghasilkan potongan MDR dan PPN 11% yang tepat hingga satuan rupiah, dan $\text{Gross} = \text{Net} + \text{MDR} + \text{PPN}$ terbukti seimbang.
3. **Idempotensi Webhook Finansial:**
   * Penembakan webhook settlement Midtrans sebanyak 3 kali berturut-turut untuk invoice yang sama menghasilkan status `ALREADY_SETTLED_IDEMPOTENT` tanpa menduplikasi penambahan masa aktif ataupun merusak angka pembukuan.
4. **Kompilasi TypeScript:** Seluruh package (`core-domain`, `database`, `payment`, `shared-types`, dan `api-core`) berhasil di-build tanpa *type error*.
