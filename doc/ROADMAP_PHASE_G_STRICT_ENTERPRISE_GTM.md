# AUDIT ARSITEKTURAL & BLUEPRINT ROADMAP FASE G: STRICT ENTERPRISE GTM & FINANCIAL LEDGER HARDENING

**Peran:** Senior Software Architect & System Analyst  
**Metodologi:** Craig Larman Object-Oriented Analysis & Design (OOAD) & GRASP Patterns  
**Domain:** Government Procurement (B2G), Multi-Dimensional Tensor Pricing, & Legislative Platform Architecture  

---

## BAGIAN 1: VERIFIKASI PONDASI EKSISTING DI CODEBASE

1. **Struktur Matriks Harga 3D (Level $\times$ Tier $\times$ Siklus):**
   - **Status:** Tabel `subscription_price_matrices` (`0012_dynamic_pricing_and_inquiries.sql`) dan seed 81 baris (`seed-pricing-matrices.sql`) membagi harga secara terstruktur berdasarkan:
     - 9 Tingkat Lembaga Legislatif / Eksekutif
     - 3 Plan Tier (`STARTER`, `PRO`, `VIP`)
     - 3 Billing Cycle (`MONTHLY`, `SEMESTER`, `ANNUAL`)
2. **Entitlement Gate Layout Tematik:**
   - Di `cms.service.ts` baris 226 dan entitas domain `PortalProfile.ts`, template kustom (`editorial-prestige`, `baliho-hero`, `newsroom-brief`) dikunci via `ForbiddenException` jika tier akun adalah `STARTER`. Akun Starter hanya diizinkan menggunakan `standard-default`.
3. **Penyembunyian Harga di Landing Page (*Price Obfuscation*):**
   - Di `apps/web-portal/src/components/landing/pricing-section.tsx`, nominal rupiah statis telah dihilangkan dan diganti menjadi *Tarif Terstandar per Yurisdiksi*, dengan tombol aksi memicu `ConsultationLeadModal` (pengajuan demo Google Meet / SPH).
4. **Penguncian Level Legislatif di Profil Dewan:**
   - Di `identity.service.ts` (`updateProfile`), field `legislativeLevel` dan `officeRole` dihilangkan dari mutasi profil mandiri dewan.
   - Di antarmuka `OfficialIdentityForm.tsx`, peran jabatan diberi label *Terkunci Mandat KPU* (`cursor-not-allowed`). Mutasi level hanya dapat dilakukan oleh Superadmin melalui `AdminUpdateLegislativeLevelDto`.
5. **Manajemen Akun Terpusat & Kredensial Sementara:**
   - Superadmin memiliki modal `CreateTenantModal.tsx` (`/admin/tenants/create`), yang otomatis men-generate kata sandi acak, mengunci level jabatan, mengatur `mustChangePassword = true`, dan menampilkan modal one-time copy credential.

---

## BAGIAN 2: BEDAH 5 LOGICAL FALLACIES & CELAH ARSITEKTURAL KRITIS

### 1. *The Public Self-Registration Arbitrage Fallacy* (Celah Penetrasi Mandiri)
- **Cacat Logika:** Harga DPR RI disembunyikan agar anggota DPR tidak mendaftar sebagai DPD/DPRD yang lebih murah. Namun jika endpoint publik `/auth/register` masih menerima `legislativeLevel` bebas, anggota DPR dapat memilih `DPRD_KABUPATEN_KOTA` saat mendaftar mandiri lalu checkout dengan harga termurah.
- **Keputusan Arsitektur:** **Opsi A (Strict Enterprise GTM)**. Menutup registrasi mandiri publik secara total. Seluruh pembukaan akun dewan wajib melalui proses asistensi/onboarding Superadmin setelah verifikasi yuridis (SK KPU / Pelantikan).

### 2. *The Hardcoded Fallback Fallacy* pada Durasi Hari (Bug Rekonsiliasi & Webhook)
- **Cacat Logika:** Kode lama pada `billing.service.ts`, `reconciliation-engine.service.ts`, dan `worker-crawler/reconciliation.processor.ts` masih memuat heuristik kas flat:
  ```typescript
  if (matchedMatrix) {
    durationDays = matchedMatrix.durationDays;
  } else if (grossAmountIdr >= 15000000) {
    durationDays = 365;
  } else if (grossAmountIdr >= 8000000) {
    durationDays = 180;
  }
  ```
  Pada matriks dinamis baru:
  - Paket `ANNUAL` DPRD Kab/Kota adalah **Rp 14.000.000** (< Rp 15 Juta). Jika query matriks meleset, sistem memberinya durasi 180 hari (rugi 6 bulan).
  - Paket `SEMESTER` DPR RI VIP adalah **Rp 50.000.000** (> Rp 15 Juta). Sistem malah memberinya 365 hari secara gratis.
- **Solusi Arsitektur:** Hapus total seluruh heuristik `15000000` dan `8000000`. Ikat transaksi invoice secara deterministik dengan `matrix_id` / snapshot `duration_days` dan `billing_cycle`.

### 3. *The Missing Tier Transition Fallacy* (Ketidakjelasan Upgrade Starter ke Pro)
- **Cacat Logika:** Belum ada mekanisme pemisahan antara masa aktif kalender akun dengan state machine entitlement tier saat dewan ingin meng-upgrade paket dari Starter ke Pro sebelum masa aktif habis.
- **Solusi Arsitektur:** Pada model domain, `Subscription` harus memisahkan antara **Masa Aktif Akun** dengan **Entitlement Tier State Machine**.

### 4. *The Silent Expiry Vulnerability* pada Portal Publik
- **Cacat Logika:** Jika dewan berlangganan `PRO` dan memasang layout tematik `baliho-hero`, saat masa aktifnya berakhir/suspended, portal publiknya berisiko tetap menampilkan tema mewah.
- **Solusi Arsitektur:** Di `apps/web-portal/src/app/[subdomain]/page.tsx`, jika lisensi tenant tidak berstatus `ACTIVE`, layout otomatis dialihkan (*graceful fallback*) ke `StandardDefaultLayout`.

### 5. *Double Source of Truth* pada Pengajuan Lead (Inquiry)
- **Cacat Logika:** Jika form konsultasi tidak mewajibkan input tingkat jabatan dan wilayah dapil, sales/admin tidak dapat menentukan besaran tarif resmi penawaran.
- **Solusi Arsitektur:** Form inquiry publik (`ConsultationLeadModal`) wajib memvalidasi `legislativeLevel` dan `targetRegion`.

---

## BAGIAN 3: DIAGRAM ALUR BISNIS END-TO-END (STRICT ENTERPRISE GTM)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        JALUR 1: B2G ENTERPRISE SALES (UTAMA)                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Tim Sales POLARIS mendatangi Fraksi / Dewan di Parlemen.                            │
│ 2. Kesepakatan tercapai (Tingkat Jabatan & Dapil tervalidasi via SK KPU).               │
│ 3. Superadmin membuka /superadmin/tenants -> Klik [+ Buat Akun Dewan Baru]:             │
│    ├── Input: Nama, Email, No WA, Username, Dapil, Fraksi                              │
│    ├── Pilih Level: [DPR_RI / DPD_RI / DPRD_PROV / dll] (KUNCI OTORITAS ADMIN)         │
│    ├── Pilih Tier: [STARTER / PRO / VIP]                                               │
│    └── Opsi Pembayaran:                                                                │
│        ├── OPSI A: Terbitkan Invoice Pra-Bayar Midtrans (Kirim link bayar via WA/Email)│
│        └── OPSI B: Beri Kredensial Sementara -> Dewan login -> Bayar mandiri di portal │
│ 4. Dewan login perdana di app.polaris.id:                                              │
│    ├── Dipaksa ganti password (ForcePasswordChangeModal)                               │
│    ├── Melihat halaman /billing dengan HARGA YANG SUDAH TERKUNCI sesuai levelnya       │
│    └── Membayar via Midtrans Snap (VA/QRIS) -> Lisensi Aktif Otomatis.                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       JALUR 2: INBOUND LEADS (LANDING PAGE PUBLIK)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Anggota Dewan / Staf Ahli mengunjungi landing page polaris.id.                      │
│ 2. Membuka section Harga -> Melihat "Tarif Terstandar per Siklus Parlemen".            │
│ 3. Klik [Ajukan Permohonan Lisensi & Sesi Demo GMeet]:                                 │
│    ├── Mengisi Form: Nama, WA, Email Resmi, Tingkat Jabatan, Wilayah Dapil, Fraksi     │
│ 4. Data masuk ke Superadmin Console (/superadmin/inquiries) -> Status: NEW_LEAD        │
│ 5. Tim Admin memverifikasi, menjadwalkan demo GMeet, lalu klik [Onboard Lead]          │
│    └── Terhubung langsung ke Form Pembuatan Akun Jalur 1 di atas (Pre-filled data).    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## BAGIAN 4: BLUEPRINT ROADMAP 5 SUB-FASE

```text
[SUB-FASE 1: ELIMINASI REGISTRASI MANDIRI & PENGAMANAN BOUNDARY IDENTITAS]
  ├── Nonaktifkan Public Registration API (POST /api/v1/auth/register) ──► Deprecated / 403 Forbidden
  ├── Tutup Akses Publik /register di web-dashboard ──► Redirect ke Landing Lead Page
  └── Sinkronkan Seluruh CTA Landing Page (web-portal) ──► Fokus 100% ke Form Inquiry & Demo GMeet

[SUB-FASE 2: PIPA KONVERSI CRM/INQUIRY KE TENANT (ONBOARDING PIPELINE)]
  ├── DTO & Service AdminConvertInquiryDto ──► Validasi Level Legislatif & Wilayah Kerja
  ├── Atomic Provisioning Transaction ──► Buat Member + Portal + Subdomain + Sandi Acak
  └── Notifikasi Kredensial Resmi via Email ──► Sesi 2FA & Flag Wajib Ganti Password

[SUB-FASE 3: DETERMINISTIC FINANCIAL LEDGER & ELIMINASI HEURISTIK DOKUMEN KAS]
  ├── Hubungkan matrix_id & duration_days eksplisit pada invoice_transactions
  ├── Hapus Hardcoded Heuristic (grossAmount >= 15000000) di Billing & Reconciliation Engine
  └── Garansi Audit: Kalkulasi Hari Sesuai Matriks Yurisdiksi 100% Deterministik

[SUB-FASE 4: CMS ENTITLEMENT GATING & FALLBACK EXPIRED TENANT]
  ├── Dynamic Gating: Layout Tematik (Editorial, Baliho, Newsroom) hanya aktif jika Plan >= PRO
  ├── Mitigasi Silent Expiry di web-portal: Fallback otomatis ke StandardDefaultLayout jika lisensi nonaktif
  └── Penguncian Permanen Kolom legislativeLevel di Profil Anggota Dewan

[SUB-FASE 5: HARMONISASI KONTRAK TIPE & INTEGRASI TESTING HARNESS]
  ├── Update Unit Tests (@polaris/core-domain & @polaris/payment)
  ├── Update Integration Tests (@polaris/api-core)
  └── Update Playwright E2E Test Suite (Hapus tes registrasi mandiri, ganti dengan Lead-to-Onboard Journey)
```

---

## BAGIAN 5: KATALOG BERKAS TERDAMPAK (EXHAUSTIVE IMPACT MATRIX)

```text
polaris-platform/
│
├── packages/
│   ├── core-domain/
│   │   ├── src/entities/InvoiceTransaction.ts         # Tambah snapshot durationDays & matrixId
│   │   ├── src/entities/PortalProfile.ts              # Perkuat layout entitlement validator
│   │   └── test/InvoiceTransaction.spec.ts            # Hapus ketergantungan kalkulasi nominal flat lama
│   │
│   ├── database/
│   │   ├── src/schema/billing.ts                      # Tambah kolom matrixId & durationDays pada invoiceTransactions
│   │   ├── src/schema/inquiry.ts                      # Pastikan relasi convertedTenantId terindeks rapi
│   │   └── src/migrations/                            # Skrip migrasi DDL kolom pendukung invoice
│   │
│   └── shared-types/
│       ├── src/dto/auth.dto.ts                        # Deprecate / sanitize RegisterRequestDto
│       ├── src/dto/inquiry.dto.ts                     # Tambah ConvertInquiryDto
│       └── src/dto/billing.dto.ts                     # Sinkronisasi snapshot tagihan
│
├── apps/api-core/
│   ├── src/modules/identity/
│   │   ├── identity.controller.ts                     # Blokir/Deprecate endpoint POST /auth/register
│   │   ├── identity.service.ts                        # Nonaktifkan registerTenant publik mandiri
│   │   └── dto/auth.dto.ts                            # Validasi penutupan registrasi mandiri
│   │
│   ├── src/modules/billing/
│   │   ├── billing.service.ts                         # ELIMINASI total fallback 15jt/8jt, ikat ke matriks
│   │   └── reconciliation-engine.service.ts           # ELIMINASI fallback 15jt/8jt pada autoHealSubscription
│   │
│   ├── src/modules/inquiry/
│   │   ├── inquiry.controller.ts                      # Endpoint POST /inquiries/:id/convert-tenant
│   │   ├── inquiry.service.ts                         # Logika atomik convertInquiryToTenant
│   │   └── dto/inquiry.dto.ts                         # Validasi payload konversi lead
│   │
│   ├── src/modules/superadmin/
│   │   ├── superadmin.service.ts                      # Integrasi pre-fill form onboarding
│   │   └── superadmin.controller.ts                   # Validasi hak akses onboarding
│   │
│   └── test/
│       ├── billing-webhook-idempotency.spec.ts        # Uji aktivas lisensi dinamis tanpa tebakan nominal
│       └── reconciliation-engine.spec.ts              # Uji self-healing berbasis matriks akurat
│
├── apps/web-dashboard/
│   ├── src/app/
│   │   ├── (auth)/register/page.tsx                   # Ubah menjadi Gate Informatif / Redirect ke Inquiry
│   │   ├── (auth)/login/page.tsx                      # Bersihkan link "Daftar di sini" -> arahkan ke kontak resmi
│   │   └── superadmin/inquiries/page.tsx              # Integrasikan tombol Onboard dengan pre-filled data
│   │
│   ├── src/components/auth/
│   │   ├── RegisterStepBasic.tsx                      # Decommission / Hapus form step registrasi mandiri
│   │   └── RegisterStepOnboarding.tsx                 # Decommission
│   │
│   └── src/components/superadmin/inquiries/
│       ├── InquiryTable.tsx                           # Sambungkan aksi Onboard ke modal konversi
│       └── ScheduleMeetModal.tsx                      # Sinkronisasi alur meeting demo
│
├── apps/web-portal/
│   ├── src/app/
│   │   ├── page.tsx                                   # Bersihkan link `${DASHBOARD_URL}/register`
│   │   ├── [subdomain]/page.tsx                       # Tambah Graceful Fallback jika lisensi tenant expired
│   │   └── pricing/page.tsx                           # Arahkan CTA ke modal inquiry
│   │
│   └── src/components/landing/
│       ├── landing-navbar.tsx                         # Ganti tombol "Daftar" -> "Ajukan Akses"
│       ├── landing-footer.tsx                         # Bersihkan tautan register mandiri
│       ├── feature-pillars.tsx                        # Sinkronisasi CTA
│       ├── hero-video-background.tsx                  # Sinkronisasi CTA
│       └── solution-section.tsx                       # Sinkronisasi CTA
│
└── apps/worker-crawler/
    └── src/processors/
        └── reconciliation.processor.ts                # ELIMINASI total fallback 15jt/8jt pada worker cron
```

---

## BAGIAN 6: MATRIKS POLA GRASP

| Tanggung Jawab Desain | Objek / Komponen | Prinsip GRASP | Alasan Arsitektural |
| :--- | :--- | :--- | :--- |
| **Menutup Pendaftaran Mandiri** | `IdentityController` | *Protected Variations* | Melindungi entitas `TenantMember` dari manipulasi data atau pemilihan level legislatif sepihak oleh klien publik. |
| **Penerbitan Akun Anggota Dewan** | `SuperadminService` & `InquiryService` | *Creator & Controller* | Hanya entitas pengelola berwenang yang boleh memicu pembuatan akun setelah verifikasi keabsahan institusional. |
| **Penerbitan Sandi Sementara** | `SuperadminService` | *Pure Fabrication* | Menghasilkan sandi aman 12 karakter dan memaksa `mustChangePassword = true` pada login perdana. |
| **Penentuan Durasi Hari Lisensi** | `SubscriptionPriceMatrix` | *Information Expert* | Matriks harga adalah pakar tunggal yang memegang data durasi (`duration_days`) per level dan siklus. Tidak boleh ada baris kode lain yang menebak hari berdasarkan nominal uang. |
| **Pembatasan Layout Tematik** | `CmsService` & Portal View Engine | *Protected Variations* | Memastikan template premium (`editorial`, `baliho`, `newsroom`) hanya aktif jika langganan berstatus `ACTIVE` dan bertier $\ge \text{PRO}$. |

---

## BAGIAN 7: DEFINITION OF DONE (DoD)

1. **Keamanan Registrasi Publik:** Akses langsung ke `POST /api/v1/auth/register` mengembalikan HTTP `403 Forbidden` dan rute browser `/register` mengarahkan ke form permohonan lisensi.
2. **Onboarding Lead Superadmin:** Superadmin dapat mengklik `Onboard` pada salah satu lead di `/superadmin/inquiries`, data terisi otomatis, dan akun dewan berhasil terbit beserta kata sandi sementara yang aktif.
3. **Akurasi Hari Lisensi 100%:** Pembayaran paket Annual DPRD Kab/Kota (Rp 14 Juta) atau DPR RI VIP Semester (Rp 50 Juta) terbukti menghasilkan masa aktif hari yang tepat sesuai matriks (365 hari dan 180 hari), tanpa distorsi angka statis lama.
4. **Gating Portal Publik:** Portal anggota dewan dengan lisensi kedaluwarsa atau tier Starter otomatis dialihkan ke layout standar resmi.
5. **Kompilasi Bersih:** `pnpm check-types` dan `pnpm build` sukses di seluruh 10 paket monorepo.
