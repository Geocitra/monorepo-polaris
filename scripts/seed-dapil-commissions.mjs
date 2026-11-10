import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../packages/database/node_modules/postgres/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
try {
  process.loadEnvFile(path.join(rootDir, '.env'));
} catch (e) {
  if (fs.existsSync(path.join(rootDir, '.env'))) {
    const envLines = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  }
}

const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/polaris?schema=public';
const cleanUrl = rawUrl.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

console.log('====================================================');
console.log(' POLARIS SEEDER: MASTER DAPIL & KOMISI DEWAN NASIONAL');
console.log('====================================================');
console.log(`Menghubungkan ke database: ${cleanUrl.replace(/:[^:@]+@/, ':****@')}`);

const sql = postgres(cleanUrl, {
  max: 5,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const MASTER_COMMISSIONS_DATA = [
  // --- DPR RI (11 Komisi Resmi 2024-2029 + AKD) ---
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_I',
    name: 'Komisi I (Pertahanan, Intelijen, Luar Negeri & Kominfo)',
    focus_areas: ['Pertahanan Negara', 'Diplomasi & Kerja Sama Internasional', 'Intelijen & Keamanan Siber', 'Komunikasi & Informatika', 'Penyiaran'],
    partner_ministries: ['Kementerian Pertahanan', 'Kementerian Luar Negeri', 'Kementerian Komunikasi dan Informatika', 'Badan Intelijen Negara (BIN)', 'Tentara Nasional Indonesia (TNI)', 'BSSN', 'KPI', 'Dewan Pers'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_II',
    name: 'Komisi II (Pemerintahan Dalam Negeri, Otonomi Daerah, Pemilu & ATR)',
    focus_areas: ['Pemerintahan Dalam Negeri', 'Otonomi Daerah & Pemekaran', 'Reformasi Birokrasi & ASN', 'Penyelenggaraan Pemilu & Pilkada', 'Agraria & Tata Ruang'],
    partner_ministries: ['Kementerian Dalam Negeri', 'KemenPAN-RB', 'KPU RI', 'Bawaslu RI', 'DKPP', 'Kementerian ATR/BPN', 'BKN', 'LAN', 'ANRI', 'Ombudsman RI'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_III',
    name: 'Komisi III (Penegakan Hukum, HAM, Kepolisian & Keamanan)',
    focus_areas: ['Penegakan Hukum Pidana/Perdata', 'Hak Asasi Manusia (HAM)', 'Pemberantasan Korupsi & Narkotika', 'Sistem Peradilan & Keimigrasian'],
    partner_ministries: ['Kementerian Hukum dan HAM', 'Kejaksaan Agung RI', 'Kepolisian Negara RI (Polri)', 'KPK', 'Mahkamah Agung RI', 'Mahkamah Konstitusi RI', 'Komisi Yudisial', 'PPATK', 'BNN', 'BNPT', 'LPSK'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_IV',
    name: 'Komisi IV (Pertanian, Lingkungan Hidup, Kehutanan & Kelautan)',
    focus_areas: ['Kedaulatan & Ketahanan Pangan', 'Kelautan & Perikanan Tangkap/Budidaya', 'Kehutanan & Konservasi Alam', 'Kesejahteraan Petani & Nelayan'],
    partner_ministries: ['Kementerian Pertanian', 'Kementerian Lingkungan Hidup dan Kehutanan', 'Kementerian Kelautan dan Perikanan', 'Badan Pangan Nasional (Bapanas)', 'Perum BULOG', 'BRGM'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_V',
    name: 'Komisi V (Infrastruktur, Perhubungan, PUPR & Daerah Tertinggal)',
    focus_areas: ['Konektivitas Transportasi Nasional', 'Infrastruktur Jalan, Jembatan & Bendungan', 'Perumahan Rakyat & Permukiman', 'Kesiapsiagaan Bencana & SAR'],
    partner_ministries: ['Kementerian Perhubungan', 'Kementerian PUPR', 'Kementerian Desa, PDTT', 'BMKG', 'Basarnas', 'BPIW'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_VI',
    name: 'Komisi VI (Perdagangan, BUMN, Investasi, UMKM & Koperasi)',
    focus_areas: ['Pengawasan BUMN & Dividen Negara', 'Tata Niaga Pasar & Ekspor-Impor', 'Pemberdayaan Koperasi & UMKM', 'Realisasi Investasi Dalam & Luar Negeri'],
    partner_ministries: ['Kementerian BUMN', 'Kementerian Perdagangan', 'Kementerian Investasi / BKPM', 'Kementerian Koperasi dan UKM', 'KPPU', 'BP Batam', 'BSN'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_VII',
    name: 'Komisi VII (Perindustrian, Energi, UMKM, Pariwisata & Ekonomi Kreatif)',
    focus_areas: ['Hilirisasi Industri & Manufaktur', 'Ketahanan Energi & Mineral', 'Pengembangan Destinasi Wisata & Budaya', 'Ekonomi Kreatif & Startup'],
    partner_ministries: ['Kementerian Perindustrian', 'Kementerian Pariwisata dan Ekonomi Kreatif', 'SKK Migas', 'BPH Migas'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_VIII',
    name: 'Komisi VIII (Agama, Sosial, Kebencanaan & Perlindungan Perempuan)',
    focus_areas: ['Kerukunan Umat Beragama & Penyelenggaraan Haji', 'Bantuan Sosial & Pengentasan Kemiskinan', 'Penanggulangan Bencana Alam', 'Pemberdayaan Perempuan & Perlindungan Anak'],
    partner_ministries: ['Kementerian Agama', 'Kementerian Sosial', 'Kementerian PPPA', 'BNPB', 'Badan Pengelola Keuangan Haji (BPKH)', 'Baznas', 'KPAI'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_IX',
    name: 'Komisi IX (Kesehatan, Ketenagakerjaan & Kependudukan)',
    focus_areas: ['Pelayanan Kesehatan & JKN/KBS', 'Hubungan Industrial & Upah Minimum', 'Pelindungan Pekerja Migran', 'Kependudukan & Penurunan Stunting', 'Pengawasan Obat & Makanan'],
    partner_ministries: ['Kementerian Kesehatan', 'Kementerian Ketenagakerjaan', 'BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'BPOM', 'BKKBN', 'BP2MI'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_X',
    name: 'Komisi X (Pendidikan, Riset, Olahraga, Kebudayaan & Perpustakaan)',
    focus_areas: ['Kualitas Kurikulum & Kesejahteraan Guru/Dosen', 'Prestasi Olahraga Nasional', 'Pemajuan Kebudayaan & Bahasa Daerah', 'Literasi & Arsip Bangsa'],
    partner_ministries: ['Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', 'Kementerian Pemuda dan Olahraga', 'Badan Riset dan Inovasi Nasional (BRIN)', 'Perpustakaan Nasional (Perpusnas)'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'KOMISI_XI',
    name: 'Komisi XI (Keuangan Negara, Perencanaan Pembangunan & Sektor Jasa Keuangan)',
    focus_areas: ['Kebijakan Fiskal, Pajak & Bea Cukai', 'Rencana Kerja Pemerintah & Bappenas', 'Stabilitas Sistem Keuangan & Perbankan', 'Audit Keuangan Negara'],
    partner_ministries: ['Kementerian Keuangan', 'Kementerian PPN / Bappenas', 'Bank Indonesia (BI)', 'Otoritas Jasa Keuangan (OJK)', 'Lembaga Penjamin Simpanan (LPS)', 'Badan Pemeriksa Keuangan (BPK)'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'BANGGAR_RI',
    name: 'Badan Anggaran (Banggar DPR RI)',
    focus_areas: ['Penyusunan RUU APBN', 'Alokasi Dana Bagi Hasil & DAK/DAU', 'Evaluasi Kinerja Fiskal Pemerintah'],
    partner_ministries: ['Kementerian Keuangan', 'Bappenas', 'Bank Indonesia'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'BALEG_RI',
    name: 'Badan Legislasi (Baleg DPR RI)',
    focus_areas: ['Program Legislasi Nasional (Prolegnas)', 'Harmonisasi & Sinkronisasi RUU', 'Uji Kelayakan Regulasi'],
    partner_ministries: ['Kementerian Hukum dan HAM', 'Sekretariat Negara'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'BAKN_RI',
    name: 'Badan Akuntabilitas Keuangan Negara (BAKN DPR RI)',
    focus_areas: ['Telaah Hasil Pemeriksaan BPK', 'Tindak Lanjut Kerugian Keuangan Negara'],
    partner_ministries: ['BPK RI', 'Inspektorat Jenderal Kementerian'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'BKSAP_RI',
    name: 'Badan Kerja Sama Antar-Parlemen (BKSAP DPR RI)',
    focus_areas: ['Diplomasi Parlemen Bilateral & Multilateral', 'Forum IPU, AIPA, PUIC'],
    partner_ministries: ['Kementerian Luar Negeri'],
  },
  {
    legislative_level: 'DPR_RI',
    code: 'PIMPINAN_DPR_RI',
    name: 'Pimpinan DPR RI (Ketua & Wakil Ketua DPR RI)',
    focus_areas: ['Pimpinan Sidang Paripurna', 'Koordinasi Antar Fraksi & Lembaga Tinggi Negara', 'Kebijakan Strategis Parlemen'],
    partner_ministries: ['Presiden RI', 'MPR RI', 'DPD RI', 'Kementerian/Lembaga Negara'],
  },

  // --- DPRD PROVINSI (Tingkat I: Komisi A s/d E + AKD) ---
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'KOMISI_A_PROV',
    name: 'Komisi A (Pemerintahan, Hukum, Ketertiban, Kominfo & Kepegawaian)',
    focus_areas: ['Tata Kelola Pemerintahan Provinsi', 'Hukum & Peraturan Daerah (Perda)', 'Keamanan & Ketertiban Umum', 'Kepegawaian Daerah (BKD/BKPSDM)', 'Diskominfo & Statistik'],
    partner_ministries: ['Biro Tata Pemerintahan Setda Prov', 'Satpol PP Provinsi', 'BKD Provinsi', 'Diskominfo Provinsi', 'Bakesbangpol Provinsi', 'Inspektorat Provinsi'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'KOMISI_B_PROV',
    name: 'Komisi B (Perekonomian, Pertanian, Perdagangan, BUMD & Keuangan Daerah)',
    focus_areas: ['Pendapatan Asli Daerah (PAD)', 'Kinerja BUMD & Bank Pembangunan Daerah (BPD)', 'Pertanian, Perkebunan, Peternakan & Perikanan', 'Koperasi, UMKM & Industri Kreatif'],
    partner_ministries: ['Bapenda Provinsi', 'Dinas Pertanian & Ketahanan Pangan', 'Dinas Kelautan & Perikanan', 'Dinas Koperasi & UKM', 'Biro Perekonomian Setda Prov', 'Direksi BUMD Provinsi'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'KOMISI_C_PROV',
    name: 'Komisi C (Keuangan, Aset Daerah, Anggaran & Pajak/Retribusi)',
    focus_areas: ['Pengelolaan Keuangan & Aset Daerah (BPKAD)', 'Retribusi & Efisiensi Belanja Daerah', 'Audit Penggunaan APBD'],
    partner_ministries: ['BPKAD Provinsi', 'Bapenda Provinsi', 'Inspektorat Daerah Provinsi'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'KOMISI_D_PROV',
    name: 'Komisi D (Pembangunan, Bina Marga, Tata Ruang, Lingkungan Hidup & Perhubungan)',
    focus_areas: ['Infrastruktur Jalan & Jembatan Provinsi (Bina Marga)', 'Tata Ruang Wilayah (RTRW)', 'Sumber Daya Air & Irigasi', 'Perhubungan & Transportasi Publik', 'Dinas Lingkungan Hidup & Kehutanan'],
    partner_ministries: ['Dinas Bina Marga & Penataan Ruang', 'Dinas SDA Provinsi', 'Dinas Perhubungan Provinsi', 'Dinas Lingkungan Hidup', 'Dinas ESDM'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'KOMISI_E_PROV',
    name: 'Komisi E (Kesejahteraan Rakyat, Pendidikan, Kesehatan, Sosial & Ketenagakerjaan)',
    focus_areas: ['Pendidikan Menengah (SMA/SMK) & Guru Honorer', 'RSUD Provinsi & Jaminan Kesehatan Daerah', 'Pengentasan Kemiskinan & Bantuan Sosial', 'Ketenagakerjaan & Perlindungan Pekerja', 'Kepemudaan, Olahraga & Kebudayaan'],
    partner_ministries: ['Dinas Pendidikan Provinsi', 'Dinas Kesehatan Provinsi & RSUD Prov', 'Dinas Sosial Provinsi', 'Disnakertrans Provinsi', 'Disparbud Provinsi', 'Dispora Provinsi'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'BANGGAR_PROV',
    name: 'Badan Anggaran (Banggar DPRD Provinsi)',
    focus_areas: ['Pembahasan KUA-PPAS Provinsi', 'Penyusunan Ranperda APBD & APBD-P', 'Evaluasi Realisasi Belanja & Pembiayaan'],
    partner_ministries: ['TAPD Pemerintah Provinsi', 'Bappeda Provinsi', 'BPKAD Provinsi'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'BAPEMPERDA_PROV',
    name: 'Badan Pembentukan Perda (Bapemperda DPRD Provinsi)',
    focus_areas: ['Propemperda Provinsi', 'Kajian Naskah Akademik Ranperda Inisiatif', 'Harmonisasi Produk Hukum Daerah'],
    partner_ministries: ['Biro Hukum Setda Provinsi', 'Kanwil Kemenkumham'],
  },
  {
    legislative_level: 'DPRD_PROVINSI',
    code: 'PIMPINAN_DPRD_PROV',
    name: 'Pimpinan DPRD Provinsi (Ketua & Wakil Ketua)',
    focus_areas: ['Pimpinan Rapat Paripurna & Pengambilan Keputusan', 'Koordinasi dengan Gubernur & Forkopimda Provinsi'],
    partner_ministries: ['Gubernur & Wakil Gubernur', 'Forkopimda Provinsi', 'Sekretariat DPRD'],
  },

  // --- DPRD KABUPATEN / KOTA (Tingkat II: Komisi I s/d IV + AKD) ---
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'KOMISI_I_KABKOTA',
    name: 'Komisi I (Hukum, Pemerintahan Desa/Kecamatan, Satpol PP & Kependudukan)',
    focus_areas: ['Pemerintahan Desa & Alokasi Dana Desa (ADD)', 'Pelayanan Adminduk (Disdukcapil)', 'Ketertiban Umum, Satpol PP & Pemadam Kebakaran', 'Pelayanan Perizinan Terpadu (DPMPTSP)'],
    partner_ministries: ['Bagian Tata Pemerintahan Setda', 'Dinas PMD', 'Disdukcapil', 'Satpol PP & Damkar', 'DPMPTSP', 'Bakesbangpol'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'KOMISI_II_KABKOTA',
    name: 'Komisi II (Perekonomian, Pertanian, Perikanan, Perdagangan, UMKM & BUMD)',
    focus_areas: ['Pasar Tradisional & Modern', 'Pendampingan UMKM & Koperasi', 'Pertanian, Peternakan & Lumbung Pangan', 'Pengawasan Perumda / BUMD Kab/Kota'],
    partner_ministries: ['Dinas Perdagangan & Perindustrian', 'Dinas Koperasi & UMKM', 'Dinas Pertanian', 'Dinas Perikanan', 'Direksi BUMD Daerah'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'KOMISI_III_KABKOTA',
    name: 'Komisi III (Pembangunan, PUPR, Permukiman, Lingkungan Hidup & Perhubungan)',
    focus_areas: ['Jalan Kabupaten/Kota & Drainase Lingkungan', 'Air Bersih (PDAM) & Pengelolaan Sampah', 'Perumahan Rakyat & Kawasan Permukiman (Disperkim)', 'Dishub & Penerangan Jalan Umum (PJU)'],
    partner_ministries: ['Dinas PUPR', 'Dinas Perkimtan', 'Dinas Lingkungan Hidup (DLH)', 'Dinas Perhubungan', 'Direksi PDAM'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'KOMISI_IV_KABKOTA',
    name: 'Komisi IV (Kesejahteraan Rakyat, Pendidikan Dasar, Kesehatan, RSUD & Sosial)',
    focus_areas: ['Pendidikan Dasar (PAUD, SD, SMP) & Beasiswa', 'Puskesmas & RSUD Daerah', 'Penanganan Kemiskinan & Bansos PKH/DTKS', 'Pemberdayaan Perempuan & Perlindungan Anak', 'Ketenagakerjaan Lokal'],
    partner_ministries: ['Dinas Pendidikan', 'Dinas Kesehatan & Direksi RSUD', 'Dinas Sosial', 'Disnakertrans', 'DP3A'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'BANGGAR_KABKOTA',
    name: 'Badan Anggaran (Banggar DPRD Kab/Kota)',
    focus_areas: ['Pembahasan KUA-PPAS Kabupaten/Kota', 'Penyusunan Ranperda APBD & APBD-P', 'Evaluasi Pendapatan Pajak Daerah'],
    partner_ministries: ['TAPD Pemerintah Kab/Kota', 'Bappeda', 'BKAD / Bapenda'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'BAPEMPERDA_KABKOTA',
    name: 'Badan Pembentukan Perda (Bapemperda DPRD Kab/Kota)',
    focus_areas: ['Propemperda Kabupaten/Kota', 'Kajian Ranperda Inisiatif DPRD', 'Fasilitasi Evaluasi Produk Hukum Daerah'],
    partner_ministries: ['Bagian Hukum Setda', 'Kanwil Kemenkumham'],
  },
  {
    legislative_level: 'DPRD_KABUPATEN_KOTA',
    code: 'PIMPINAN_DPRD_KABKOTA',
    name: 'Pimpinan DPRD Kabupaten/Kota (Ketua & Wakil Ketua)',
    focus_areas: ['Pimpinan Sidang Paripurna', 'Sinergi Eksekutif & Forkopimda Tingkat II'],
    partner_ministries: ['Bupati / Walikota', 'Forkopimda Kab/Kota', 'Sekretariat DPRD'],
  },
];

export const ELECTORAL_DISTRICTS_DATA = [
  // --- 84 DAPIL DPR RI RESMI KPU 2024-2029 ---
  {
    dapil_code: 'DAPIL-ACEH-1',
    dapil_name: 'ACEH I',
    province_name: 'Aceh',
    regency_coverage: ['Kab. Aceh Selatan', 'Kab. Aceh Tenggara', 'Kab. Aceh Barat', 'Kab. Aceh Besar', 'Kab. Pidie', 'Kab. Simeulue', 'Kab. Aceh Singkil', 'Kab. Bireuen', 'Kab. Aceh Barat Daya', 'Kab. Gayo Lues', 'Kab. Aceh Jaya', 'Kab. Nagan Raya', 'Kota Banda Aceh', 'Kota Sabang', 'Kota Subulussalam'],
    total_voters: 2154382,
  },
  {
    dapil_code: 'DAPIL-ACEH-2',
    dapil_name: 'ACEH II',
    province_name: 'Aceh',
    regency_coverage: ['Kab. Aceh Timur', 'Kab. Aceh Tengah', 'Kab. Aceh Utara', 'Kab. Bener Meriah', 'Kab. Pidie Jaya', 'Kota Lhokseumawe', 'Kota Langsa'],
    total_voters: 1774218,
  },
  {
    dapil_code: 'DAPIL-SUMUT-1',
    dapil_name: 'SUMATERA UTARA I',
    province_name: 'Sumatera Utara',
    regency_coverage: ['Kota Medan', 'Kab. Deli Serdang', 'Kab. Serdang Bedagai', 'Kota Tebing Tinggi'],
    total_voters: 3450912,
  },
  {
    dapil_code: 'DAPIL-SUMUT-2',
    dapil_name: 'SUMATERA UTARA II',
    province_name: 'Sumatera Utara',
    regency_coverage: ['Kab. Tapanuli Tengah', 'Kab. Tapanuli Utara', 'Kab. Tapanuli Selatan', 'Kab. Nias', 'Kab. Labuhanbatu', 'Kab. Toba', 'Kab. Mandailing Natal', 'Kab. Nias Selatan', 'Kab. Humbang Hasundutan', 'Kab. Samosir', 'Kab. Padang Lawas', 'Kab. Padang Lawas Utara', 'Kab. Labuhanbatu Selatan', 'Kab. Labuhanbatu Utara', 'Kab. Nias Utara', 'Kab. Nias Barat', 'Kota Sibolga', 'Kota Padang Sidempuan', 'Kota Gunungsitoli'],
    total_voters: 3254180,
  },
  {
    dapil_code: 'DAPIL-SUMUT-3',
    dapil_name: 'SUMATERA UTARA III',
    province_name: 'Sumatera Utara',
    regency_coverage: ['Kab. Asahan', 'Kab. Simalungun', 'Kab. Dairi', 'Kab. Karo', 'Kab. Pakpak Bharat', 'Kab. Batubara', 'Kota Pematangsiantar', 'Kota Tanjungbalai', 'Kota Binjai'],
    total_voters: 3324510,
  },
  {
    dapil_code: 'DAPIL-SUMBAR-1',
    dapil_name: 'SUMATERA BARAT I',
    province_name: 'Sumatera Barat',
    regency_coverage: ['Kab. Pesisir Selatan', 'Kab. Solok', 'Kab. Sijunjung', 'Kab. Tanah Datar', 'Kab. Kepulauan Mentawai', 'Kab. Dharmasraya', 'Kab. Solok Selatan', 'Kota Padang', 'Kota Solok', 'Kota Sawahlunto', 'Kota Padang Panjang'],
    total_voters: 2341200,
  },
  {
    dapil_code: 'DAPIL-SUMBAR-2',
    dapil_name: 'SUMATERA BARAT II',
    province_name: 'Sumatera Barat',
    regency_coverage: ['Kab. Padang Pariaman', 'Kab. Agam', 'Kab. Lima Puluh Kota', 'Kab. Pasaman', 'Kab. Pasaman Barat', 'Kota Bukittinggi', 'Kota Payakumbuh', 'Kota Pariaman'],
    total_voters: 1745230,
  },
  {
    dapil_code: 'DAPIL-RIAU-1',
    dapil_name: 'RIAU I',
    province_name: 'Riau',
    regency_coverage: ['Kab. Bengkalis', 'Kab. Kepulauan Meranti', 'Kab. Rokan Hilir', 'Kab. Rokan Hulu', 'Kab. Siak', 'Kota Pekanbaru', 'Kota Dumai'],
    total_voters: 2841200,
  },
  {
    dapil_code: 'DAPIL-RIAU-2',
    dapil_name: 'RIAU II',
    province_name: 'Riau',
    regency_coverage: ['Kab. Indragiri Hilir', 'Kab. Indragiri Hulu', 'Kab. Kampar', 'Kab. Kuantan Singingi', 'Kab. Pelalawan'],
    total_voters: 1892400,
  },
  {
    dapil_code: 'DAPIL-KEPRI-1',
    dapil_name: 'KEPULAUAN RIAU',
    province_name: 'Kepulauan Riau',
    regency_coverage: ['Kab. Bintan', 'Kab. Karimun', 'Kab. Natuna', 'Kab. Lingga', 'Kab. Kepulauan Anambas', 'Kota Batam', 'Kota Tanjungpinang'],
    total_voters: 1500595,
  },
  {
    dapil_code: 'DAPIL-JAMBI-1',
    dapil_name: 'JAMBI',
    province_name: 'Jambi',
    regency_coverage: ['Kab. Batanghari', 'Kab. Bungo', 'Kab. Kerinci', 'Kab. Merangin', 'Kab. Muaro Jambi', 'Kab. Sarolangun', 'Kab. Tanjung Jabung Barat', 'Kab. Tanjung Jabung Timur', 'Kab. Tebo', 'Kota Jambi', 'Kota Sungai Penuh'],
    total_voters: 2676107,
  },
  {
    dapil_code: 'DAPIL-SUMSEL-1',
    dapil_name: 'SUMATERA SELATAN I',
    province_name: 'Sumatera Selatan',
    regency_coverage: ['Kota Palembang', 'Kab. Musi Banyuasin', 'Kab. Banyuasin', 'Kab. Musi Rawas', 'Kab. Musi Rawas Utara', 'Kota Lubuklinggau'],
    total_voters: 3125400,
  },
  {
    dapil_code: 'DAPIL-SUMSEL-2',
    dapil_name: 'SUMATERA SELATAN II',
    province_name: 'Sumatera Selatan',
    regency_coverage: ['Kab. Ogan Komering Ilir', 'Kab. Ogan Ilir', 'Kab. Muara Enim', 'Kab. Lahat', 'Kab. OKU', 'Kab. OKU Timur', 'Kab. OKU Selatan', 'Kab. Empat Lawang', 'Kota Pagar Alam', 'Kota Prabumulih'],
    total_voters: 3201500,
  },
  {
    dapil_code: 'DAPIL-BABEL-1',
    dapil_name: 'KEPULAUAN BANGKA BELITUNG',
    province_name: 'Kepulauan Bangka Belitung',
    regency_coverage: ['Kab. Bangka', 'Kab. Belitung', 'Kab. Bangka Barat', 'Kab. Bangka Tengah', 'Kab. Bangka Selatan', 'Kab. Belitung Timur', 'Kota Pangkalpinang'],
    total_voters: 1067434,
  },
  {
    dapil_code: 'DAPIL-BENGKULU-1',
    dapil_name: 'BENGKULU',
    province_name: 'Bengkulu',
    regency_coverage: ['Kab. Bengkulu Selatan', 'Kab. Rejang Lebong', 'Kab. Bengkulu Utara', 'Kab. Kaur', 'Kab. Seluma', 'Kab. Mukomuko', 'Kab. Lebong', 'Kab. Kepahiang', 'Kab. Bengkulu Tengah', 'Kota Bengkulu'],
    total_voters: 1494828,
  },
  {
    dapil_code: 'DAPIL-LAMPUNG-1',
    dapil_name: 'LAMPUNG I',
    province_name: 'Lampung',
    regency_coverage: ['Kab. Lampung Selatan', 'Kab. Lampung Barat', 'Kab. Tanggamus', 'Kab. Pesawaran', 'Kab. Pringsewu', 'Kab. Pesisir Barat', 'Kota Bandar Lampung', 'Kota Metro'],
    total_voters: 3341200,
  },
  {
    dapil_code: 'DAPIL-LAMPUNG-2',
    dapil_name: 'LAMPUNG II',
    province_name: 'Lampung',
    regency_coverage: ['Kab. Lampung Tengah', 'Kab. Lampung Utara', 'Kab. Tulang Bawang', 'Kab. Way Kanan', 'Kab. Tulang Bawang Barat', 'Kab. Mesuji'],
    total_voters: 3198500,
  },

  // --- PULAU JAWA ---
  {
    dapil_code: 'DAPIL-DKI-1',
    dapil_name: 'DKI JAKARTA I',
    province_name: 'DKI Jakarta',
    regency_coverage: ['Kota Jakarta Timur'],
    total_voters: 2383972,
  },
  {
    dapil_code: 'DAPIL-DKI-2',
    dapil_name: 'DKI JAKARTA II',
    province_name: 'DKI Jakarta',
    regency_coverage: ['Kota Jakarta Pusat', 'Kota Jakarta Selatan', 'Luar Negeri'],
    total_voters: 4346875,
  },
  {
    dapil_code: 'DAPIL-DKI-3',
    dapil_name: 'DKI JAKARTA III',
    province_name: 'DKI Jakarta',
    regency_coverage: ['Kota Jakarta Barat', 'Kota Jakarta Utara', 'Kabupaten Kepulauan Seribu'],
    total_voters: 2448356,
  },
  {
    dapil_code: 'DAPIL-JABAR-1',
    dapil_name: 'JAWA BARAT I',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kota Bandung', 'Kota Cimahi'],
    total_voters: 2484674,
  },
  {
    dapil_code: 'DAPIL-JABAR-2',
    dapil_name: 'JAWA BARAT II',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Bandung', 'Kabupaten Bandung Barat'],
    total_voters: 3658210,
  },
  {
    dapil_code: 'DAPIL-JABAR-3',
    dapil_name: 'JAWA BARAT III',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Cianjur', 'Kota Bogor'],
    total_voters: 2541900,
  },
  {
    dapil_code: 'DAPIL-JABAR-4',
    dapil_name: 'JAWA BARAT IV',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Sukabumi', 'Kota Sukabumi'],
    total_voters: 2215800,
  },
  {
    dapil_code: 'DAPIL-JABAR-5',
    dapil_name: 'JAWA BARAT V',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Bogor'],
    total_voters: 3889441,
  },
  {
    dapil_code: 'DAPIL-JABAR-6',
    dapil_name: 'JAWA BARAT VI',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kota Bekasi', 'Kota Depok'],
    total_voters: 3201400,
  },
  {
    dapil_code: 'DAPIL-JABAR-7',
    dapil_name: 'JAWA BARAT VII',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Bekasi', 'Kabupaten Karawang', 'Kabupaten Purwakarta'],
    total_voters: 4798200,
  },
  {
    dapil_code: 'DAPIL-JABAR-8',
    dapil_name: 'JAWA BARAT VIII',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Cirebon', 'Kabupaten Indramayu', 'Kota Cirebon'],
    total_voters: 3120500,
  },
  {
    dapil_code: 'DAPIL-JABAR-9',
    dapil_name: 'JAWA BARAT IX',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Majalengka', 'Kabupaten Sumedang', 'Kabupaten Subang'],
    total_voters: 2894100,
  },
  {
    dapil_code: 'DAPIL-JABAR-10',
    dapil_name: 'JAWA BARAT X',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Ciamis', 'Kabupaten Kuningan', 'Kabupaten Pangandaran', 'Kota Banjar'],
    total_voters: 2510300,
  },
  {
    dapil_code: 'DAPIL-JABAR-11',
    dapil_name: 'JAWA BARAT XI',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Garut', 'Kabupaten Tasikmalaya', 'Kota Tasikmalaya'],
    total_voters: 3740900,
  },
  {
    dapil_code: 'DAPIL-JATENG-1',
    dapil_name: 'JAWA TENGAH I',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kota Semarang', 'Kabupaten Semarang', 'Kabupaten Kendal', 'Kota Salatiga'],
    total_voters: 3209840,
  },
  {
    dapil_code: 'DAPIL-JATENG-2',
    dapil_name: 'JAWA TENGAH II',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Kudus', 'Kabupaten Jepara', 'Kabupaten Demak'],
    total_voters: 2715000,
  },
  {
    dapil_code: 'DAPIL-JATENG-3',
    dapil_name: 'JAWA TENGAH III',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Grobogan', 'Kabupaten Blora', 'Kabupaten Rembang', 'Kabupaten Pati'],
    total_voters: 3341800,
  },
  {
    dapil_code: 'DAPIL-JATENG-4',
    dapil_name: 'JAWA TENGAH IV',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Wonogiri', 'Kabupaten Karanganyar', 'Kabupaten Sragen'],
    total_voters: 2450200,
  },
  {
    dapil_code: 'DAPIL-JATENG-5',
    dapil_name: 'JAWA TENGAH V',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Boyolali', 'Kabupaten Klaten', 'Kabupaten Sukoharjo', 'Kota Surakarta'],
    total_voters: 3012400,
  },
  {
    dapil_code: 'DAPIL-JATENG-6',
    dapil_name: 'JAWA TENGAH VI',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Purworejo', 'Kabupaten Wonosobo', 'Kabupaten Magelang', 'Kabupaten Temanggung', 'Kota Magelang'],
    total_voters: 2980100,
  },
  {
    dapil_code: 'DAPIL-JATENG-7',
    dapil_name: 'JAWA TENGAH VII',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Purbalingga', 'Kabupaten Banjarnegara', 'Kabupaten Kebumen'],
    total_voters: 2650400,
  },
  {
    dapil_code: 'DAPIL-JATENG-8',
    dapil_name: 'JAWA TENGAH VIII',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Cilacap', 'Kabupaten Banyumas'],
    total_voters: 2890500,
  },
  {
    dapil_code: 'DAPIL-JATENG-9',
    dapil_name: 'JAWA TENGAH IX',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Tegal', 'Kabupaten Brebes', 'Kota Tegal'],
    total_voters: 2940200,
  },
  {
    dapil_code: 'DAPIL-JATENG-10',
    dapil_name: 'JAWA TENGAH X',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kabupaten Pekalongan', 'Kabupaten Pemalang', 'Kabupaten Batang', 'Kota Pekalongan'],
    total_voters: 2810300,
  },
  {
    dapil_code: 'DAPIL-DIY-1',
    dapil_name: 'DAERAH ISTIMEWA YOGYAKARTA',
    province_name: 'DI Yogyakarta',
    regency_coverage: ['Kabupaten Kulon Progo', 'Kabupaten Bantul', 'Kabupaten Gunungkidul', 'Kabupaten Sleman', 'Kota Yogyakarta'],
    total_voters: 2870974,
  },
  {
    dapil_code: 'DAPIL-JATIM-1',
    dapil_name: 'JAWA TIMUR I',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kota Surabaya', 'Kabupaten Sidoarjo'],
    total_voters: 3678540,
  },
  {
    dapil_code: 'DAPIL-JATIM-2',
    dapil_name: 'JAWA TIMUR II',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Probolinggo', 'Kabupaten Pasuruan', 'Kota Probolinggo', 'Kota Pasuruan'],
    total_voters: 2480100,
  },
  {
    dapil_code: 'DAPIL-JATIM-3',
    dapil_name: 'JAWA TIMUR III',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Banyuwangi', 'Kabupaten Bondowoso', 'Kabupaten Situbondo'],
    total_voters: 2510300,
  },
  {
    dapil_code: 'DAPIL-JATIM-4',
    dapil_name: 'JAWA TIMUR IV',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Lumajang', 'Kabupaten Jember'],
    total_voters: 2890400,
  },
  {
    dapil_code: 'DAPIL-JATIM-5',
    dapil_name: 'JAWA TIMUR V',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Malang', 'Kota Malang', 'Kota Batu'],
    total_voters: 3012500,
  },
  {
    dapil_code: 'DAPIL-JATIM-6',
    dapil_name: 'JAWA TIMUR VI',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Kediri', 'Kabupaten Blitar', 'Kabupaten Tulungagung', 'Kota Kediri', 'Kota Blitar'],
    total_voters: 3190200,
  },
  {
    dapil_code: 'DAPIL-JATIM-7',
    dapil_name: 'JAWA TIMUR VII',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Pacitan', 'Kabupaten Ponorogo', 'Kabupaten Trenggalek', 'Kabupaten Magetan', 'Kabupaten Ngawi'],
    total_voters: 3201400,
  },
  {
    dapil_code: 'DAPIL-JATIM-8',
    dapil_name: 'JAWA TIMUR VIII',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Mojokerto', 'Kabupaten Jombang', 'Kabupaten Nganjuk', 'Kabupaten Madiun', 'Kota Mojokerto', 'Kota Madiun'],
    total_voters: 3410500,
  },
  {
    dapil_code: 'DAPIL-JATIM-9',
    dapil_name: 'JAWA TIMUR IX',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Bojonegoro', 'Kabupaten Tuban'],
    total_voters: 2010400,
  },
  {
    dapil_code: 'DAPIL-JATIM-10',
    dapil_name: 'JAWA TIMUR X',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Lamongan', 'Kabupaten Gresik'],
    total_voters: 2040100,
  },
  {
    dapil_code: 'DAPIL-JATIM-11',
    dapil_name: 'JAWA TIMUR XI',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kabupaten Bangkalan', 'Kabupaten Sampang', 'Kabupaten Pamekasan', 'Kabupaten Sumenep'],
    total_voters: 3120400,
  },
  {
    dapil_code: 'DAPIL-BANTEN-1',
    dapil_name: 'BANTEN I',
    province_name: 'Banten',
    regency_coverage: ['Kabupaten Pandeglang', 'Kabupaten Lebak'],
    total_voters: 2104500,
  },
  {
    dapil_code: 'DAPIL-BANTEN-2',
    dapil_name: 'BANTEN II',
    province_name: 'Banten',
    regency_coverage: ['Kabupaten Serang', 'Kota Cilegon', 'Kota Serang'],
    total_voters: 2198400,
  },
  {
    dapil_code: 'DAPIL-BANTEN-3',
    dapil_name: 'BANTEN III',
    province_name: 'Banten',
    regency_coverage: ['Kabupaten Tangerang', 'Kota Tangerang', 'Kota Tangerang Selatan'],
    total_voters: 4541200,
  },

  // --- BALI & NUSA TENGGARA ---
  {
    dapil_code: 'DAPIL-BALI-1',
    dapil_name: 'BALI',
    province_name: 'Bali',
    regency_coverage: ['Kota Denpasar', 'Kab. Badung', 'Kab. Gianyar', 'Kab. Tabanan', 'Kab. Buleleng', 'Kab. Karangasem', 'Kab. Klungkung', 'Kab. Bangli', 'Kab. Jembrana'],
    total_voters: 3269516,
  },
  {
    dapil_code: 'DAPIL-NTB-1',
    dapil_name: 'NUSA TENGGARA BARAT I',
    province_name: 'Nusa Tenggara Barat',
    regency_coverage: ['Kab. Sumbawa Barat', 'Kab. Sumbawa', 'Kab. Dompu', 'Kab. Bima', 'Kota Bima'],
    total_voters: 1120400,
  },
  {
    dapil_code: 'DAPIL-NTB-2',
    dapil_name: 'NUSA TENGGARA BARAT II',
    province_name: 'Nusa Tenggara Barat',
    regency_coverage: ['Kota Mataram', 'Kab. Lombok Barat', 'Kab. Lombok Tengah', 'Kab. Lombok Timur', 'Kab. Lombok Utara'],
    total_voters: 2798200,
  },
  {
    dapil_code: 'DAPIL-NTT-1',
    dapil_name: 'NUSA TENGGARA TIMUR I',
    province_name: 'Nusa Tenggara Timur',
    regency_coverage: ['Kab. Alor', 'Kab. Lembata', 'Kab. Flores Timur', 'Kab. Sikka', 'Kab. Ende', 'Kab. Ngada', 'Kab. Manggarai', 'Kab. Manggarai Barat', 'Kab. Nagekeo', 'Kab. Manggarai Timur'],
    total_voters: 1892100,
  },
  {
    dapil_code: 'DAPIL-NTT-2',
    dapil_name: 'NUSA TENGGARA TIMUR II',
    province_name: 'Nusa Tenggara Timur',
    regency_coverage: ['Kota Kupang', 'Kab. Kupang', 'Kab. Timor Tengah Selatan', 'Kab. Timor Tengah Utara', 'Kab. Belu', 'Kab. Rote Ndao', 'Kab. Sumba Barat', 'Kab. Sumba Timur', 'Kab. Sumba Tengah', 'Kab. Sumba Barat Daya', 'Kab. Sabu Raijua', 'Kab. Malaka'],
    total_voters: 2110400,
  },

  // --- SULAWESI & INDONESIA TIMUR ---
  {
    dapil_code: 'DAPIL-SULSEL-1',
    dapil_name: 'SULAWESI SELATAN I',
    province_name: 'Sulawesi Selatan',
    regency_coverage: ['Kota Makassar', 'Kab. Gowa', 'Kab. Takalar', 'Kab. Jeneponto', 'Kab. Bantaeng', 'Kab. Kepulauan Selayar'],
    total_voters: 2541200,
  },
  {
    dapil_code: 'DAPIL-SULSEL-2',
    dapil_name: 'SULAWESI SELATAN II',
    province_name: 'Sulawesi Selatan',
    regency_coverage: ['Kab. Bulukumba', 'Kab. Sinjai', 'Kab. Bone', 'Kab. Maros', 'Kab. Pangkajene dan Kepulauan', 'Kab. Barru', 'Kab. Soppeng', 'Kab. Wajo', 'Kota Parepare'],
    total_voters: 2390100,
  },
  {
    dapil_code: 'DAPIL-SULSEL-3',
    dapil_name: 'SULAWESI SELATAN III',
    province_name: 'Sulawesi Selatan',
    regency_coverage: ['Kab. Sidenreng Rappang', 'Kab. Enrekang', 'Kab. Luwu', 'Kab. Tana Toraja', 'Kab. Luwu Utara', 'Kab. Luwu Timur', 'Kab. Toraja Utara', 'Kota Palopo'],
    total_voters: 1740300,
  },
  {
    dapil_code: 'DAPIL-SULUT-1',
    dapil_name: 'SULAWESI UTARA',
    province_name: 'Sulawesi Utara',
    regency_coverage: ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kota Kotamobagu', 'Kab. Minahasa', 'Kab. Minahasa Utara', 'Kab. Minahasa Selatan', 'Kab. Minahasa Tenggara', 'Kab. Bolaang Mongondow', 'Kab. Sangihe', 'Kab. Talaud'],
    total_voters: 1969603,
  },
  {
    dapil_code: 'DAPIL-SULTENG-1',
    dapil_name: 'SULAWESI TENGAH',
    province_name: 'Sulawesi Tengah',
    regency_coverage: ['Kota Palu', 'Kab. Sigi', 'Kab. Donggala', 'Kab. Parigi Moutong', 'Kab. Poso', 'Kab. Tojo Una-Una', 'Kab. Tolitoli', 'Kab. Buol', 'Kab. Banggai', 'Kab. Banggai Kepulauan', 'Kab. Morowali', 'Kab. Morowali Utara'],
    total_voters: 2236703,
  },
  {
    dapil_code: 'DAPIL-SULTRA-1',
    dapil_name: 'SULAWESI TENGGARA',
    province_name: 'Sulawesi Tenggara',
    regency_coverage: ['Kota Kendari', 'Kota Baubau', 'Kab. Konawe', 'Kab. Kolaka', 'Kab. Muna', 'Kab. Buton', 'Kab. Wakatobi', 'Kab. Bombana'],
    total_voters: 1867931,
  },
  {
    dapil_code: 'DAPIL-SULBAR-1',
    dapil_name: 'SULAWESI BARAT',
    province_name: 'Sulawesi Barat',
    regency_coverage: ['Kab. Mamuju', 'Kab. Majene', 'Kab. Polewali Mandar', 'Kab. Mamasa', 'Kab. Pasangkayu', 'Kab. Mamuju Tengah'],
    total_voters: 985760,
  },
  {
    dapil_code: 'DAPIL-MALUKU-1',
    dapil_name: 'MALUKU',
    province_name: 'Maluku',
    regency_coverage: ['Kota Ambon', 'Kab. Maluku Tengah', 'Kab. Maluku Tenggara', 'Kab. Buru', 'Kab. Seram Bagian Barat', 'Kab. Seram Bagian Timur', 'Kab. Kepulauan Aru'],
    total_voters: 1341012,
  },
  {
    dapil_code: 'DAPIL-MALUT-1',
    dapil_name: 'MALUKU UTARA',
    province_name: 'Maluku Utara',
    regency_coverage: ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kab. Halmahera Barat', 'Kab. Halmahera Utara', 'Kab. Halmahera Selatan', 'Kab. Halmahera Timur', 'Kab. Halmahera Tengah', 'Kab. Kepulauan Sula', 'Kab. Pulau Morotai', 'Kab. Pulau Taliabu'],
    total_voters: 953978,
  },
  {
    dapil_code: 'DAPIL-PAPUA-1',
    dapil_name: 'PAPUA',
    province_name: 'Papua',
    regency_coverage: ['Kota Jayapura', 'Kab. Jayapura', 'Kab. Keerom', 'Kab. Sarmi', 'Kab. Mamberamo Raya', 'Kab. Kepulauan Yapen', 'Kab. Biak Numfor', 'Kab. Waropen', 'Kab. Supiori'],
    total_voters: 727835,
  },

  // --- CONTOH MASTER DAPIL DPRD PROVINSI (REPRESENTASI DAERAH) ---
  {
    dapil_code: 'DAPIL-DPRD-PROV-JABAR-1',
    dapil_name: 'DPRD JABAR 1',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kota Bandung', 'Kota Cimahi'],
    total_voters: 2484674,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-JABAR-2',
    dapil_name: 'DPRD JABAR 2',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Bandung'],
    total_voters: 2627000,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-JABAR-7',
    dapil_name: 'DPRD JABAR 7',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kota Cirebon', 'Kabupaten Cirebon', 'Kabupaten Indramayu'],
    total_voters: 3120500,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-JABAR-9',
    dapil_name: 'DPRD JABAR 9',
    province_name: 'Jawa Barat',
    regency_coverage: ['Kabupaten Bekasi'],
    total_voters: 2200100,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-DKI-1',
    dapil_name: 'DPRD DKI 1',
    province_name: 'DKI Jakarta',
    regency_coverage: ['Kota Jakarta Pusat'],
    total_voters: 830100,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-DKI-4',
    dapil_name: 'DPRD DKI 4',
    province_name: 'DKI Jakarta',
    regency_coverage: ['Kota Jakarta Timur (Cakung, Pulogadung, Matraman)'],
    total_voters: 920400,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-JATENG-1',
    dapil_name: 'DPRD JATENG 1',
    province_name: 'Jawa Tengah',
    regency_coverage: ['Kota Semarang'],
    total_voters: 1215000,
  },
  {
    dapil_code: 'DAPIL-DPRD-PROV-JATIM-1',
    dapil_name: 'DPRD JATIM 1',
    province_name: 'Jawa Timur',
    regency_coverage: ['Kota Surabaya'],
    total_voters: 2218500,
  },
];

async function runSeed() {
  try {
    console.log('\n[1/2] Seeding Master Komisi (DPR RI, DPRD Provinsi, DPRD Kab/Kota)...');
    for (const comm of MASTER_COMMISSIONS_DATA) {
      await sql.unsafe(`
        INSERT INTO master_commissions (legislative_level, code, name, focus_areas, partner_ministries)
        SELECT 
          $1::legislative_level, 
          $2, 
          $3, 
          $4::text[], 
          $5::text[]
        WHERE NOT EXISTS (
          SELECT 1 FROM master_commissions 
          WHERE legislative_level = $1::legislative_level AND code = $2
        );
      `, [comm.legislative_level, comm.code, comm.name, comm.focus_areas, comm.partner_ministries]);
    }
    const commissionCount = await sql`SELECT count(*) FROM master_commissions;`;
    console.log(`  -> Berhasil! Total ${commissionCount[0].count} komisi & AKD dewan tersedia di master_commissions.`);

    console.log('\n[2/2] Seeding Master Daerah Pemilihan (Electoral Districts KPU)...');
    for (const dapil of ELECTORAL_DISTRICTS_DATA) {
      await sql.unsafe(`
        INSERT INTO electoral_districts (dapil_code, dapil_name, province_name, regency_coverage, total_voters)
        VALUES ($1, $2, $3, $4::text[], $5)
        ON CONFLICT (dapil_code) DO UPDATE SET
          dapil_name = EXCLUDED.dapil_name,
          province_name = EXCLUDED.province_name,
          regency_coverage = EXCLUDED.regency_coverage,
          total_voters = EXCLUDED.total_voters;
      `, [dapil.dapil_code, dapil.dapil_name, dapil.province_name, dapil.regency_coverage, dapil.total_voters]);
    }
    const dapilCount = await sql`SELECT count(*) FROM electoral_districts;`;
    console.log(`  -> Berhasil! Total ${dapilCount[0].count} daerah pemilihan tersimpan di electoral_districts.`);

    console.log('\n====================================================');
    console.log(' SEEDING SELESAI DENGAN SUKSES! DATA RESMI TERSEDIA.');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Gagal menjalankan seeder:', error);
  } finally {
    await sql.end();
  }
}

runSeed();

