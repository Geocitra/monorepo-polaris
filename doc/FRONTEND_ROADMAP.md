# POLARIS PLATFORM — CETAK BIRU ARSITEKTUR UI/UX & ROADMAP FRONTEND (FASE 6)

> **Dokumen Panduan Teknis & Sosio-Engineering**: Menjabarkan analisis psikologis pengguna, prinsip teknis, hierarki komponen, dan peta jalan bertahap untuk `apps/web-portal` dan `apps/web-dashboard`.

---

# BAGIAN 1: ANALISIS SOSIO-ENGINEERING & FILOSOFI DESAIN

Kita tidak membangun satu website monolitik, melainkan **dua ekosistem antarmuka dengan profil psikologis pengguna yang bertolak belakang**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                       DUA SISI EKOSISTEM FRONTEND                      │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. apps/web-dashboard            │ 2. apps/web-portal                 │
│    (Private Executive Workspace)  │    (Public Civic Microsite)        │
│                                   │                                    │
│ • Pengguna: Dewan & Tim Ahli      │ • Pengguna: Rakyat & Konstituen    │
│ • Device: Desktop, iPad, iPhone   │ • Device: Smartphone Android/iOS   │
│ • State: Sibuk, butuh data cepat  │ • State: Skeptis, butuh bukti riil │
│ • Gaya: Executive Linear / Apple  │ • Gaya: Editorial Prestige / Civic │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 1. Sosio-Engineering: Dashboard Anggota Dewan (`apps/web-dashboard`)
* **Profil Pengguna:** Pejabat publik dengan mobilitas ekstrem (di mobil dinas, ruang sidang komisi, reses lapangan). Waktu mereka membaca layar rata-rata **di bawah 30 detik**.
* **Prinsip UI/UX:**
  1. **Zero Clutter (Bebas Kebisingan):** Terapkan hierarki *High-Density Executive*. Pagi hari mereka hanya ingin melihat: (1) Sisa kuota, (2) Morning Briefing, dan (3) Tombol *Generate/Publish*.
  2. **Thumb-Friendly Actions (Mobile First untuk Dewan):** Dewan sering membuka dashboard dari iPhone/Android saat perjalanan. Tombol aksi utama (*Approve*, *Publish*, *Top-Up*) harus berada di area jangkauan jempol (*Thumb Zone*).
  3. **Visual Reassurance:** Tampilkan *real-time token bar* dengan analogi kredit konten yang transparan agar dewan merasa aman dari risiko biaya tak terduga.

### 2. Sosio-Engineering: Portal Publik Konstituen (`apps/web-portal`)
* **Profil Pengguna:** Masyarakat dapil dengan variasi spektrum digital: mulai dari pemilih muda Gen Z di perkotaan hingga petani/pedagang di pedesaan yang membuka web lewat jaringan seluler 4G/3G pas-pasan.
* **Prinsip UI/UX:**
  1. **Anti-Pencitraan Murahan (Dignified Legitimacy):** Portal dirancang menyerupai majalah kebijakan prestisius (*The Atlantic / Kompas Editorial*), bukan web partai yang bising. Ini menaikkan wibawa intelektual dewan di mata publik.
  2. **Tipografi Kelas Dunia (Readability First):** Artikel 3.000 kata membutuhkan *fluid typography* (`Inter` / `Merriweather`), kontras rasio WCAG AAA, dan indikator perkiraan waktu baca (*Reading Time Indicator*).
  3. **Kepercayaan Publik (Civic Proof):** Formulir aduan warga (`/lapor`) langsung menerbitkan **Nomor Tiket Resmi (#CS-XXXX)** dengan tanda terima digital. Ini menciptakan efek psikologis bahwa suara warga dihargai secara formal, bukan sekadar janji politik.

---

# BAGIAN 2: PRINSIP TEKNIS & BEST PRACTICES FRONTEND

Untuk mencapai performa maksimal dan kemudahan pemeliharaan jangka panjang:

1. **Stack Fondasi:**
   * **Framework:** Next.js 15 (App Router, React 19, Server Components).
   * **Styling:** Tailwind CSS v4 + CVA (*Class Variance Authority*) untuk variasi komponen.
   * **Primitif UI:** Radix UI / Shadcn UI (Headless, 100% *accessible* WAI-ARIA).
   * **Ikon:** Lucide React (Ringan & konsisten).
   * **Animasi:** Framer Motion (Transisi halus mikro-interaksi tanpa beban performa).
2. **Dynamic Multi-Tenant Theming (CSS Variables on the Fly):**
   * Website dewan harus bisa berwarna kuning (Golkar), merah (PDIP), biru (Nasdem/PAN/Demokrat), hijau (PKB/PPP), atau jingga (PKS) **tanpa merombak kode**.
   * Backend menyuntikkan kode HEX ke variabel CSS root (`--primary`, `--secondary`) saat SSR. Seluruh tombol, badge, dan border otomatis beradaptasi dengan identitas partai dewan.
3. **Pemisahan Server Component vs Client Component (RSC Boundary):**
   * **Server Component (Default):** Halaman artikel, layout publik, dan meta tags dirender di server. Ukuran bundel JavaScript client mendekati 0 KB untuk SEO dan kecepatan loading kilat.
   * **Client Component (`'use client'`):** Hanya dipakai pada widget interaktif: chat prompt studio, iframe live preview branding, dan form upload.
4. **Responsivitas 3-Breakpoint Adaptif:**
   * *Mobile (`< 640px`):* Menu drawer samping, single column layout, touch target minimal 44x44px.
   * *Tablet (`640px - 1024px`):* Dual pane layout (draf di kiri, live preview di kanan).
   * *Desktop (`> 1024px`):* Multi-column executive grid dengan sticky sidebar.

---

# BAGIAN 3: ROADMAP MODULAR FRONTEND TERPERINCI

Fase 6 dibagi menjadi dua aplikasi dengan tahapan komponen terkecil (*atomic milestones*):

```text
=============================================================================
ROADMAP FRONTEND POLARIS (FASE 6)
=============================================================================

[FASE 6.1: APPS/WEB-PORTAL — PUBLIC CIVIC ENGINE (*.polaris.id)]
  ├── 6.1.1: Next.js Setup, Tailwind Config & Dynamic Theme Variable Injector
  ├── 6.1.2: Host-Header Wildcard Middleware (Penyaring Subdomain & Custom Domain)
  ├── 6.1.3: Shell Komponen Publik (Navbar Dinamis, Footer Akuntabilitas, Breadcrumb)
  ├── 6.1.4: Halaman Beranda Publik (Hero Baliho Resmi, Bio, Tautan Medsos, Feed Artikel)
  ├── 6.1.5: Halaman Pembaca Artikel 3.000 Kata (Tipografi Editorial, Poster DALL-E R2, Social Share Dock)
  ├── 6.1.6: Halaman Layanan Konstituen (/lapor, Form Captcha Turnstile & Pelacak Tiket)
  └── 6.1.7: Generator OpenGraph Dinamis (/api/og Thumbnail Otomatis untuk WA & X)

[FASE 6.2: APPS/WEB-DASHBOARD — EXECUTIVE WORKSPACE DEWAN]
  ├── 6.2.1: Next.js Setup, Shadcn UI Core & Session Auth Guard Interceptor
  ├── 6.2.2: Executive App Shell (Responsive Collapsible Sidebar, Mobile Drawer, Topbar Quota Badge)
  ├── 6.2.3: Halaman Ringkasan Pagi (Executive Pulse, Morning Briefing 5 Isu, Rekomendasi Hari Ini)
  ├── 6.2.4: Studio AI Interaktif (Prompt Box, Streaming Generator, Editor Dual-Pane, DALL-E Review)
  ├── 6.2.5: Visual Branding Customizer (Theme Color Picker, Upload Banner R2, Iframe Live Preview)
  ├── 6.2.6: Panel Billing & Kuota (Indikator Saldo Real-Time, Midtrans Snap Checkout, Top-Up Addons)
  └── 6.2.7: Inbox Advokasi Konstituen (Triage Pengaduan, Modal Dekripsi PII UU PDP, Status Disposisi)
```

---

# BAGIAN 4: ARSITEKTUR KOMPONEN MODULAR (`apps/web-portal`)

Berikut adalah struktur hirarki komponen atomik untuk **`apps/web-portal`**:

```text
apps/web-portal/
├── src/
│   ├── middleware.ts                   # Host-Header Extractor (Subdomain Switcher)
│   ├── app/
│   │   ├── layout.tsx                  # Root HTML shell
│   │   ├── [subdomain]/
│   │   │   ├── layout.tsx              # Dynamic Theme Injector (CSS Variable Provider)
│   │   │   ├── page.tsx                # Public Homepage
│   │   │   ├── artikel/[slug]/
│   │   │   │   └── page.tsx            # Canonical Article Page (3.000 Kata + DALL-E)
│   │   │   └── lapor/
│   │   │       └── page.tsx            # Civic Reporting Form
│   │   └── api/og/route.tsx            # Edge Dynamic OpenGraph Image
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── portal-header.tsx       # Navbar adaptif warna partai
│   │   │   ├── portal-footer.tsx       # Footer akuntabilitas resmi
│   │   │   └── mobile-nav.tsx          # Drawer navigasi mobile
│   │   ├── home/
│   │   │   ├── hero-section.tsx        # Foto resmi dewan & tagline
│   │   │   ├── bio-card.tsx            # Riwayat komisi & wilayah dapil
│   │   │   ├── social-strip.tsx        # Ikon medsos resmi terverifikasi
│   │   │   └── recent-articles.tsx     # Grid kartu artikel terbitan
│   │   ├── article/
│   │   │   ├── article-header.tsx      # Judul, tanggal, estimasi baca, badge status
│   │   │   ├── dalle-poster-modal.tsx  # Lightbox pratinjau gambar poster WebP
│   │   │   ├── article-body.tsx        # Typography renderer untuk Markdown panjang
│   │   │   └── share-floating-bar.tsx  # Sticky bar sebar ke WA/X/FB/Salin Tautan
│   │   └── constituent/
│   │       ├── report-form.tsx         # Form aduan warga berpagar validasi
│   │       └── ticket-status-card.tsx  # Kartu pelacakan status laporan #CS-XXXX
│   │
│   └── lib/
│       ├── api.ts                      # Fetch wrapper ke api-core (/api/v1/cms/public/:slug)
│       └── utils.ts                    # Helper format tanggal ID, estimasi waktu baca
```
