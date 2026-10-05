export class PlatformFactsRegistry {
    private static readonly FACTS_XML = `<polaris_facts>
1. IDENTITAS PRODUK:
   - Nama Resmi: POLARIS Platform (Executive Legislative Operating System & Communication Suite).
   - Pengguna Utama: Anggota DPR RI, DPD RI, DPRD Provinsi, DPRD Kabupaten/Kota, Kepala Daerah, serta Pejabat Birokrat/Dinas OPD.
   - Fungsi Inti: Membantu pemimpin publik mentransformasikan pokok pikiran, catatan sidang komisi, notula rapat, dan data aspirasi warga menjadi publikasi.

2. TIGA PILAR FORMAT KONTEN:
   - Artikel Kebijakan Parlemen: Panjang 2.500 hingga 3.000 kata, dengan struktur jurnalistik dewan dan dukungan data yang tersedia.
   - Infografis Data APBD/BPS: Visualisasi diagram batang, pie, dan tren penyerapan anggaran fiskal daerah.
   - Poster Kampanye & Advokasi: Desain visual beresolusi tinggi untuk materi cetak dan media sosial.

3. STRUKTUR HARGA LISENSI:
   - Paket 1 Bulan: Rp 2.000.000 (masa aktif 30 hari kalender).
   - Paket 6 Bulan: Rp 10.000.000 (masa aktif 180 hari; hemat Rp 2.000.000 dibanding harga bulanan).
   - Paket 1 Tahun: Rp 20.000.000 (masa aktif 365 hari; hemat Rp 4.000.000 dibanding harga bulanan).
   - Perpanjangan menambahkan sisa hari aktif secara akumulatif.

4. TATA KELOLA PENGADAAN & KEUANGAN:
   - Pembayaran mandiri melalui Midtrans, termasuk Virtual Account, QRIS, dan kartu kredit.
   - Mendukung proses pengadaan instansi melalui Surat Perintah Kerja (SPK) dan e-Katalog.

5. KEDAULATAN DATA & KEAMANAN:
   - POLARIS dirancang untuk mendukung kepatuhan terhadap Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
   - Data sensitif dapat dilindungi dengan enkripsi AES-256 dan pengelolaan kunci per-tenant.
   - Hak penggunaan naskah mengikuti kebijakan dan perjanjian layanan POLARIS.
</polaris_facts>`;

    public static getFacts(): string {
        return this.FACTS_XML;
    }
}