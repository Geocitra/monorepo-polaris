export class PlatformFactsRegistry {
  private static readonly FACTS_XML = `<polaris_facts>
1. IDENTITAS PRODUK:
   - Nama Resmi: POLARIS Platform (Executive Legislative Operating System & Communication Suite).
   - Pengguna Utama: Anggota DPR RI, DPD RI, DPRD Provinsi, DPRD Kabupaten/Kota, Kepala Daerah (Gubernur, Walikota, Bupati), serta Pejabat Birokrat/Dinas OPD & Tenaga Ahli (TA).
   - Fungsi Inti: Membantu pemimpin publik mentransformasikan pokok pikiran (pokir), catatan sidang komisi, notula rapat, isu viral daerah, dan data aspirasi warga menjadi publikasi berbobot tinggi secara instan.

2. TIGA PILAR FORMAT KONTEN & KAPABILITAS GENERASI:
   - Format Teks / Kajian: Mampu menyusun Artikel Kebijakan Parlemen, Policy Brief, Policy Paper, Opini Media Massa, Rilis Pers, Naskah Penjelasan Raperda Inisiatif, hingga Pandangan Umum Fraksi. Panjang naskah fleksibel dari ringkasan eksekutif 750 kata hingga kajian mendalam 2.500 hingga 3.000 kata berbasis rujukan hukum JDIH (UU/Perda) dan data statistik BPS.
   - Format Infografis Data: Visualisasi diagram batang, pie, dan tren penyerapan anggaran fiskal APBD serta indikator makroekonomi daerah.
   - Format Poster Visual: Desain visual kampanye advokasi beresolusi tinggi (siap cetak 300 DPI CMYK dan rasio media sosial).

3. KANAL DISTRIBUSI & MEDIA SOSIAL:
   - Kanal yang Didukung Saat Ini:
     * Portal Website Resmi Pribadi dewan (otomatis tayang di subdomain .polaris.id atau custom domain pribadi).
     * WhatsApp: Paket broadcast format teks tebal/miring siap teruskan ke grup warga/kolega dewan.
     * Instagram: Caption terstruktur beserta rekomendasi hashtag kebijakan.
     * X (Twitter): Format utas (threads) bersambung yang ringkas dan padat.
   - Kanal yang BELUM Didukung Secara Langsung: Telegram, TikTok auto-upload, LinkedIn auto-post, atau platform lain di luar yang disebutkan di atas. Pengguna tetap dapat menyalin naskah secara manual.

4. STRUKTUR HARGA LISENSI TRANSPARAN:
   - Paket 1 Bulan: Rp 2.000.000 (Masa aktif 30 hari kalender, cocok untuk evaluasi atau masa sidang singkat).
   - Paket 6 Bulan: Rp 10.000.000 (Masa aktif 180 hari, hemat Rp 2.000.000 dibanding harga bulanan, ideal untuk 1 masa persidangan & reses).
   - Paket 1 Tahun: Rp 20.000.000 (Masa aktif 365 hari, hemat Rp 4.000.000 dibanding harga bulanan, mencakup 1 tahun anggaran APBN/APBD penuh).
   - Kebijakan Pemakaian: Seluruh paket berstatus Unlimited AI Generation (Naskah & Poster). Sisa hari aktif bersifat akumulatif saat perpanjangan (tidak pernah hangus).

5. TATA KELOLA PENGADAAN & KEUANGAN:
   - Pembayaran mandiri via Midtrans (Virtual Account Bank Mandiri/BCA/BNI/BRI, QRIS, Kartu Kredit).
   - Mendukung proses pengadaan instansi melalui Surat Perintah Kerja (SPK) dan e-Katalog, serta penerbitan Faktur Pajak resmi (PPN 11% & PPh).

6. KEDAULATAN DATA & KEAMANAN SIBER:
   - Seluruh server dan database berlokasi di wilayah hukum Republik Indonesia.
   - Kepatuhan 100% pada Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
   - Enkripsi data sensitif konstituen (PII) menggunakan standar AES-256 dengan kunci turunan per-tenant (HKDF).
   - Hak Cipta Naskah: 100% milik Pejabat Publik dan Institusi terkait, tanpa royalti.
</polaris_facts>`;

  public static getFacts(): string {
    return this.FACTS_XML;
  }
}