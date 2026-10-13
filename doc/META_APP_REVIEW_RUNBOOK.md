# PANDUAN PENGAJUAN & RUNBOOK REVIEW META DEVELOPER (INSTAGRAM GRAPH API)
**Aplikasi:** POLARIS Platform (Executive Legislative Operating System)
**Jenis Integrasi:** Business Login for Instagram / Content Publishing API
**Versi Graph API:** v21.0+

---

## 1. Daftar Izin (*Permissions*) yang Diajukan

| Permission Name | Kategori | Justifikasi Penggunaan dalam Aplikasi |
| :--- | :--- | :--- |
| `instagram_business_basic` | Core | Membaca profil publik (@handle, nama, foto profil) untuk membuktikan koneksi akun resmi dewan di dashboard. |
| `instagram_business_content_publish` | Core | Menerbitkan postingan feed gambar kebijakan dan rilis pers resmi secara langsung dari Studio Konten POLARIS. |

---

## 2. Naskah Demonstrasi Video (*Screencast Walkthrough Script*)

Untuk lolos review Meta, unggah video rekaman layar (durasi 2–3 menit) yang memperagakan 5 langkah berikut tanpa jeda:

1. **Langkah 1: Menunjukkan Halaman Login & Dashboard Dewan**
   - Buka `https://app.polaris.id/login` dan masuk ke akun demonstrasi.
   - Perlihatkan identitas dewan di topbar.
2. **Langkah 2: Proses Otorisasi OAuth Resmi Meta**
   - Navigasi ke menu **Tema & Website** (`/branding`) -> Tab **Instagram Resmi**.
   - Klik tombol `[Hubungkan Akun Instagram Resmi]`.
   - Perlihatkan URL browser beralih ke `https://www.instagram.com/oauth/authorize?...` dengan Client ID POLARIS yang jelas.
   - Berikan izin pada akun Instagram Professional Tester.
   - Tunjukkan redirect kembali ke POLARIS dan kartu status akun berubah menjadi *Terhubung sebagai @handle*.
3. **Langkah 3: Pembuatan Konten di Studio AI**
   - Buka menu **Studio Konten AI** (`/studio/terpadu`).
   - Masukkan isu kebijakan (misal: *"Ketahanan Pangan & Pupuk Subsidi"*).
   - Tunjukkan naskah, caption Instagram, dan poster visual selesai dirumuskan.
4. **Langkah 4: Penerbitan 1-Klik ke Instagram**
   - Klik tombol `[Terbitkan Langsung ke @handle]`.
   - Perlihatkan indikator progres asinkron BullMQ (10% -> 50% -> 100%).
   - Tunjukkan pop-up toast berhasil dengan tautan permalink.
5. **Langkah 5: Pembuktian Postingan Live di Instagram**
   - Buka tab baru browser ke profil Instagram resmi tester (`https://instagram.com/handle`).
   - Refresh halaman dan perlihatkan postingan baru telah tayang utuh dengan gambar berasio 4:5 yang proporsional dan caption rapi.

---

## 3. Pernyataan Kepatuhan Perlindungan Data (Data Privacy Statement)

- **Tanpa Penyimpanan Kata Sandi:** Aplikasi tidak pernah meminta, melihat, atau menyimpan kata sandi pengguna Instagram.
- **Kriptografi Standar Pemerintah:** Seluruh token akses dienkripsi menggunakan AES-256-GCM dengan kunci HKDF unik per penyewa (*multi-tenant*), mematuhi Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
- **Mekanisme Pencabutan Akses (*De-authorization Callback*):** Pengguna dapat memutus sambungan kapan saja via tombol *Putuskan Akun*, yang secara otomatis menghapus kunci akses dari server.
