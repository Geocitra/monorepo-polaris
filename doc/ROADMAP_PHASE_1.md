# ROADMAP TEKNIS DETAIL: FASE 1
## Penyelarasan Kontrak, Skema Basis Data & Master Boundary

> Disusun menggunakan metodologi Object-Oriented Analysis and Design (OOAD) Craig Larman dan prinsip pembagian tanggung jawab GRASP.

```text
[FASE 1: INTEGRITAS DATA & SKEMA]
  ├── Sub-Fase 1.1: Sinkronisasi & Migrasi Aman Enum Global (`legislative_level_enum`)
  ├── Sub-Fase 1.2: Refaktorisasi Batasan Agregat Dapil & Eliminasi Shared Mutation Fallacy
  └── Sub-Fase 1.3: Transformasi Model Bisnis: Dari "Quota Restriction" ke "Metered Ledger & Cost Observability"
```

---

## SUB-FASE 1.1: Sinkronisasi & Migrasi Aman Enum Global (`legislative_level_enum`)

### 1. Analisis Masalah & Integritas Data
* **Kondisi Eksisting:**
  * Di basis data fisik (`schema.sql`), enum `legislative_level_enum` didefinisikan secara terbatas pada 3 nilai: `'DPR_RI', 'DPRD_PROVINSI', 'DPRD_KABUPATEN_KOTA'`.
  * Di lapisan TypeScript (`@polaris/shared-types` dan `@polaris/database`), enum memiliki 9 nilai termasuk `KEPALA_DAERAH_GUBERNUR`, `DPD_RI`, `MPR_RI`, dan jabatan birokrat.
* **Risiko Arsitektural:** 
  Ketika seorang pengguna mendaftar atau memperbarui profil dengan jabatan di luar 3 nilai awal tersebut, PostgreSQL akan melempar fatal error: `invalid input value for enum legislative_level_enum`, menyebabkan transaksi HTTP *rollback* mendadak.

### 2. Penetapan Tanggung Jawab GRASP
* **Protected Variations:** Mengamankan lapisan persistensi agar perubahan nilai klasifikasi jabatan tidak merusak konsistensi tabel `tenant_members`.
* **High Cohesion:** Seluruh representasi enum di database, ORM, DTO, dan UI harus memiliki satu sumber kebenaran (*single source of truth*) yang identik.

### 3. Berkas yang Terdampak
1. `packages/database/src/migrations/0001_sync_legislative_level_enum.sql` *(Berkas Baru)*
2. `packages/database/src/schema/enums.ts`
3. `packages/shared-types/src/enums/index.ts`
4. `schema.sql` *(Pembaruan Master DDL)*

### 4. Langkah Eksekusi Terinci
* **Langkah 1.1.1 (Non-Destructive Migration Script):**
  Tulis skrip migrasi SQL khusus penambahan nilai enum baru tanpa menghapus data atau tipe yang sudah ada:
  ```sql
  DO $$ BEGIN
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'DPD_RI';
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'MPR_RI';
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'KEPALA_DAERAH_GUBERNUR';
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'KEPALA_DAERAH_WALIKOTA_BUPATI';
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD';
    ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'PIMPINAN_LEMBAGA_REKTOR_SWASTA';
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  ```
* **Langkah 1.1.2 (Penyelarasan Drizzle ORM):**
  Pastikan `packages/database/src/schema/enums.ts` merefleksikan 9 nilai tersebut secara sinkron dengan DDL.
* **Langkah 1.1.3 (Validasi DTO & Runtime Pipes):**
  Uji `RegisterRequestDto` dan `UpdateProfileDto` di `apps/api-core` untuk memastikan `class-validator` menerima seluruh nilai enum tanpa penolakan validasi.

---

## SUB-FASE 1.2: Refaktorisasi Batasan Agregat Dapil & Eliminasi Shared Mutation Fallacy

### 1. Analisis Domain & Masalah
* **Kondisi Eksisting:**
  Tabel `electoral_districts` adalah *Master Data KPU*. Namun, saat dewan memanggil `PUT /auth/profile` dengan membawa perubahan nama dapil atau daftar kabupaten, method `identity.service.ts::updateProfile` melakukan perintah:
  `UPDATE electoral_districts SET ... WHERE id = member.electoralDistrictId`.
* **Cacat Integritas:**
  Jika ada 5 anggota dewan yang mereferensikan Dapil yang sama (misal: "Jawa Barat I" atau `DAPIL-DEFAULT`), perubahan yang dilakukan oleh salah satu dewan akan menimpa data master dan secara sepihak mengubah profil 4 dewan lainnya.

### 2. Penetapan Tanggung Jawab GRASP
* **Information Expert:**
  * Master data `electoral_districts` adalah domain referensi publik; satu-satunya yang berhak mengubahnya adalah modul **Superadmin**.
  * Anggota dewan (`TenantMember`) hanya berhak mengubah *wilayah kerja personal/fokus binaan*, bukan mengubah nama master Dapil resmi KPU.
* **Low Coupling:** Memisahkan data wilayah personal dewan dari tabel referensi master KPU.

### 3. Berkas yang Terdampak
1. `packages/database/src/schema/identity.ts`
2. `packages/shared-types/src/dto/auth.dto.ts`
3. `apps/api-core/src/modules/identity/identity.service.ts`
4. `apps/api-core/src/modules/identity/dto/auth.dto.ts`
5. `apps/web-dashboard/src/components/profile/ElectoralDistrictForm.tsx`

### 4. Langkah Eksekusi Terinci
* **Langkah 1.2.1 (Pemisahan Kolom Wilayah Personal di `tenant_members`):**
  Tambahkan kolom representasi wilayah personal pada tabel `tenant_members`:
  * `custom_dapil_name VARCHAR(100)`: Nama representasi kerja yang ingin ditampilkan dewan (jika berbeda dari master KPU).
  * `personal_coverage TEXT[]`: Daftar kabupaten/kecamatan spesifik yang menjadi fokus kerja anggota dewan tersebut.
  * Tetap pertahankan `electoral_district_id` sebagai *foreign key readonly* yang menunjuk ke tabel master `electoral_districts`.
* **Langkah 1.2.2 (Refaktorisasi `identity.service.ts::updateProfile`):**
  * **Hapus** logika `db.update(electoralDistricts).where(...)`.
  * Ubah logika penyimpanan: jika dewan mengisi nama dapil kustom atau daftar kabupaten, simpan data tersebut langsung ke baris `tenant_members` yang bersangkutan.
* **Langkah 1.2.3 (Pembersihan Fallback `DAPIL-DEFAULT`):**
  * Hapus kebiasaan membuat `DAPIL-DEFAULT` otomatis yang diperebutkan banyak user.
  * Izinkan kolom `electoral_district_id` bernilai `NULL` jika pada saat registrasi dewan belum memilih Dapil resmi KPU, dan gunakan data personal wilayah sementara hingga verifikasi admin selesai.
* **Langkah 1.2.4 (Penyesuaian Antarmuka Dashboard Dewan):**
  Perbarui `ElectoralDistrictForm.tsx` agar menyimpan fokus wilayah ke profil personal dewan, bukan mengubah entitas master.

---

## SUB-FASE 1.3: Transformasi Model Bisnis: Dari "Quota Enforcement" ke "Metered Ledger & Cost Observability"

### 1. Analisis Domain & Masalah
* **Kondisi Eksisting:**
  * Kode mengandung artefak pembatasan semu: `TopUpQuotaDto`, pengecekan kuota fiktif, serta `QuotaGuard` yang bernilai `return true;`.
  * Model bisnis yang sebenarnya: **Unlimited Consumption**, namun **Meticulous Telemetry & Cost Accounting** (pencatatan konsumsi token dan estimasi biaya per tenant secara akurat tanpa pemblokiran).

### 2. Penetapan Tanggung Jawab GRASP
* **Pure Fabrication:** 
  `TenantUsageLedger` bertanggung jawab mencatat pembukuan agregat pemakaian (*metering ledger*) per siklus tagihan tanpa membebani entitas domain dengan logika pembatasan kuota palsu.
* **High Cohesion:** 
  Hapus seluruh kode mati (*dead code*) yang memberi ilusi batas kuota, sehingga sistem fokus 100% pada pencatatan akurat token in/out, panggilan API, dan estimasi biaya ke dalam `ai_trace_logs` dan `tenant_quota_ledgers` (yang akan diredefinisi semantiknya menjadi usage ledger).

### 3. Berkas yang Terdampak
1. `packages/core-domain/src/entities/TenantQuota.ts` (Redefinisi semantik)
2. `packages/shared-types/src/dto/billing.dto.ts` & `apps/api-core/src/modules/billing/dto/billing.dto.ts`
3. `apps/api-core/src/common/guards/quota.guard.ts`
4. `apps/api-core/src/modules/billing/billing.service.ts`
5. `apps/worker-crawler/src/processors/billing-maintenance.processor.ts`

### 4. Langkah Eksekusi Terinci
* **Langkah 1.3.1 (Pembersihan Kontrak API DTO):**
  * Hapus kelas `TopUpQuotaDto` (`addonType: EXTRA_ARTICLES_10 | EXTRA_DALLE_5`) dari `shared-types` dan `billing.dto.ts`.
  * Hapus endpoint top-up kuota artikel/dalle fiktif jika ada di `billing.controller.ts`.
* **Langkah 1.3.2 (Redefinisi Peran `QuotaGuard`):**
  * Karena konsumsi token tidak dibatasi jatah kuota, ubah peran guard pembuat konten menjadi **`SubscriptionActiveGuard`** (hanya memverifikasi apakah akun berstatus `ACTIVE` atau `TRIAL` aktif, bukan menghitung sisa saldo artikel).
  * Hapus `QuotaGuard` kosong untuk menghindari kebingungan arsitektural.
* **Langkah 1.3.3 (Optimalisasi Pembukuan Metering pada `tenant_quota_ledgers`):**
  * Ubah semantik pembukuan di `billing.service.ts` dan `studio.service.ts`:
    * Field `article_used` dan `dalle_used` murni berfungsi sebagai penghitung akumulasi (*counter* inkremental).
    * Pastikan `total_tokens_consumed` selalu bertambah secara atomik setiap kali generate artikel (`input_tokens + output_tokens`).
  * Tambahkan kolom estimasi rupiah dan USD jika diperlukan langsung di ledger bulanan untuk memudahkan kueri laporan keuangan.
* **Langkah 1.3.4 (Penyelarasan Worker Maintenance Bulanan):**
  * Di `billing-maintenance.processor.ts::processMonthlyQuotaRollover`, ubah logikanya:
    * Tugas rollover di awal bulan bukan "mereset batas sisa", melainkan **membuka buku pembukuan baru** untuk bulan berjalan (`billingCycleMonth = YYYY-MM`) dengan nilai awal `article_used = 0, dalle_used = 0, total_tokens_consumed = 0`.

---

# DEFINITION OF DONE (DoD) FASE 1

Fase 1 dinyatakan selesai secara arsitektural apabila memenuhi seluruh kriteria objektif berikut:

1. **Uji Validasi Enum:** Eksekusi registrasi atau update profil dengan jabatan `KEPALA_DAERAH_GUBERNUR` dan `DPD_RI` berhasil disimpan ke PostgreSQL tanpa error `invalid input value for enum`.
2. **Uji Isolasi Dapil:** 
   * Buat 2 akun pengujian (Dewan A dan Dewan B) dengan Dapil yang sama.
   * Lakukan pembaruan wilayah kerja personal pada Dewan A.
   * Verifikasi data master `electoral_districts` dan profil Dewan B: **tidak boleh ada 1 byte pun data Dewan B atau master Dapil yang berubah.**
3. **Uji Transparansi Metering:**
   * Lakukan proses pembuatan artikel AI pada akun aktif.
   * Verifikasi bahwa tidak ada guard yang memblokir kuota.
   * Nilai `article_used`, `total_tokens_consumed`, dan catatan di `ai_trace_logs` bertambah secara atomik dan akurat.
4. **Pembersihan Kode Mati:** Tidak ada lagi dependensi atau DTO `TopUpQuotaDto` yang tersisa di dalam monorepo.
