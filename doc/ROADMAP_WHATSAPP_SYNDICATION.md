# Arsip Roadmap: WhatsApp Syndication & Memo Warga (Polaris Platform)

Dokumen ini mendokumentasikan spesifikasi, rencana fitur, dan arsitektur integrasi **WhatsApp Broadcast & Memo Warga** yang diarsipkan untuk dieksekusi pada iterasi berikutnya.

---

## 1. Latar Belakang & Sosio-Engineering
Bagi anggota dewan dan politisi di Indonesia, WhatsApp adalah kanal konsolidasi politik paling intim:
- Menjangkau pengurus struktur partai, koordinator TPS, relawan dapil, dan paguyuban RT/RW.
- Pola konsumsi konstituen di grup WhatsApp sangat menyukai pesan ringkas dengan poin-poin tebal dan lampiran poster resmi yang bisa diteruskan (*forward*).

---

## 2. Fitur yang Direncanakan

### A. Generator Format Pesan WhatsApp (Markdown Engine)
- Otomatis mengubah artikel kajian/berita parlemen menjadi format pesan WhatsApp ramah baca:
  - Header tebal dengan emoji: `*KABAR PARLEMEN DAERAH* 🏛️`
  - Ringkasan poin isu: `📌 *Pokok Masalah:* ...`
  - Langkah advokasi: `🎯 *Langkah Dewan:* ...`
  - Tautan portal publik: `🔗 Baca kajian lengkap: https://polaris.id/p/[slug]`
- Selektor gaya bahasa:
  1. **Formal Kedinasan:** Bahasa baku untuk grup birokrasi, dinas, dan rilis pers.
  2. **Akrab Warga Dapil:** Bahasa santai, komunikatif untuk relawan dan grup warga.

### B. Quick Actions
- **Tombol "Buka WhatsApp Web / App":**
  Memanfaatkan URL scheme:
  ```text
  https://api.whatsapp.com/send?text={ENCODED_MESSAGE}
  ```
  Pengguna langsung diarahkan ke aplikasi WhatsApp dengan pesan terisi otomatis tanpa perlu mengetik manual.
- **Unduh Poster Dokumen Resolusi Penuh (A4):**
  Unduh poster visual asli tanpa kompresi atau pemotongan rasio, siap di-drag & drop ke ruang obrolan grup.

### C. (Masa Depan) Integrasi WhatsApp Business Cloud API
- Pengiriman pesan template terjadwal ke daftar nomor relawan/tim sukses melalui Meta WhatsApp Business Platform.
- Webhook status pengiriman (terkirim, dibaca).

---

*Status: Diarsipkan sementara untuk memprioritaskan integrasi Meta Threads API.*
