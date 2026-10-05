export const PARTAI_OPTIONS = [
  'Golkar',
  'PDI Perjuangan',
  'Gerindra',
  'NasDem',
  'PKB',
  'PKS',
  'Demokrat',
  'PAN',
  'PPP',
  'PSI',
  'Perindo',
  'Non-Partai / Independen',
  'Kementerian / Lembaga Negara',
  'Pemerintah Daerah (Pemda)',
];

export const PUBLIC_OFFICE_ROLE_OPTIONS = [
  {
    value: 'DPR_RI',
    label: 'DPR RI (Dewan Perwakilan Rakyat Republik Indonesia)',
    category: 'Parlemen Nasional',
    scope: 'Regulasi Nasional (UU) & Pengawasan APBN',
  },
  {
    value: 'DPD_RI',
    label: 'DPD RI (Dewan Perwakilan Daerah Republik Indonesia)',
    category: 'Parlemen Nasional',
    scope: 'Representasi Kepentingan Provinsi di Tingkat Pusat',
  },
  {
    value: 'MPR_RI',
    label: 'MPR RI (Majelis Permusyawaratan Rakyat)',
    category: 'Parlemen Nasional',
    scope: 'Konstitusi & Kebijakan Fundamental Negara',
  },
  {
    value: 'DPRD_PROVINSI',
    label: 'DPRD Provinsi (Tingkat I)',
    category: 'Parlemen Daerah',
    scope: 'Perda Provinsi, Pengawasan APBD Provinsi & Dapil Terkait',
  },
  {
    value: 'DPRD_KABUPATEN_KOTA',
    label: 'DPRD Kabupaten / Kota (Tingkat II)',
    category: 'Parlemen Daerah',
    scope: 'Perda Kab/Kota, APBD Daerah & Konstituen Tingkat Kecamatan',
  },
  {
    value: 'KEPALA_DAERAH_GUBERNUR',
    label: 'Gubernur / Wakil Gubernur (Pemerintah Provinsi)',
    category: 'Eksekutif Wilayah',
    scope: 'Kepemimpinan & Kebijakan Strategis Provinsi',
  },
  {
    value: 'KEPALA_DAERAH_WALIKOTA_BUPATI',
    label: 'Bupati / Walikota (Pemerintah Kab/Kota)',
    category: 'Eksekutif Wilayah',
    scope: 'Pelayanan Publik & Pembangunan Daerah Otonom',
  },
  {
    value: 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD',
    label: 'Pejabat Eksekutif / Birokrat (Dirjen, Sekjen, Kepala Dinas/OPD)',
    category: 'Birokrasi & OPD',
    scope: 'Tata Kelola Kebijakan Sektoral & Eksekusi Program Kerja',
  },
  {
    value: 'PIMPINAN_LEMBAGA_REKTOR_SWASTA',
    label: 'Pimpinan Lembaga / Rektor / Tokoh Publik',
    category: 'Lembaga / Publik',
    scope: 'Kepemimpinan Institusional & Advokasi Kebijakan',
  },
];

export const PROVINSI_LIST = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
];

export const PROVINCE_PRESETS: Record<string, { dapils: string[]; sampleRegencies: string[] }> = {
  'Aceh': {
    dapils: ['Aceh I', 'Aceh II', 'DPRD Aceh Dapil 1 (Banda Aceh, Aceh Besar, Sabang)', 'DPRD Aceh Dapil 2 (Pidie, Pidie Jaya)', 'DPRD Aceh Dapil 3 (Bireuen)', 'DPRD Aceh Dapil 4 (Aceh Tengah, Bener Meriah)'],
    sampleRegencies: ['Kota Banda Aceh', 'Kab. Aceh Besar', 'Kota Sabang', 'Kab. Pidie', 'Kab. Bireuen', 'Kota Lhokseumawe', 'Kab. Aceh Utara']
  },
  'Sumatera Utara': {
    dapils: ['Sumatera Utara I', 'Sumatera Utara II', 'Sumatera Utara III', 'DPRD Sumut 1 (Medan A)', 'DPRD Sumut 2 (Medan B)', 'DPRD Sumut 3 (Deli Serdang)'],
    sampleRegencies: ['Kota Medan', 'Kab. Deli Serdang', 'Kab. Serdang Bedagai', 'Kota Tebing Tinggi', 'Kab. Karo', 'Kab. Simalungun', 'Kota Pematangsiantar', 'Kab. Asahan']
  },
  'Sumatera Barat': {
    dapils: ['Sumatera Barat I', 'Sumatera Barat II', 'DPRD Sumbar 1 (Padang)', 'DPRD Sumbar 2 (Padang Pariaman, Pariaman)', 'DPRD Sumbar 3 (Agam, Bukittinggi)'],
    sampleRegencies: ['Kota Padang', 'Kota Bukittinggi', 'Kab. Agam', 'Kab. Padang Pariaman', 'Kota Pariaman', 'Kab. Tanah Datar', 'Kota Payakumbuh']
  },
  'Riau': {
    dapils: ['Riau I', 'Riau II', 'DPRD Riau 1 (Pekanbaru)', 'DPRD Riau 2 (Kampar)', 'DPRD Riau 3 (Rokan Hulu)'],
    sampleRegencies: ['Kota Pekanbaru', 'Kota Dumai', 'Kab. Kampar', 'Kab. Bengkalis', 'Kab. Siak', 'Kab. Pelalawan', 'Kab. Rokan Hilir']
  },
  'Kepulauan Riau': {
    dapils: ['Kepulauan Riau', 'DPRD Kepri 1 (Tanjungpinang)', 'DPRD Kepri 2 (Bintan, Lingga)', 'DPRD Kepri 3 (Karimun)', 'DPRD Kepri 4 (Batam A)', 'DPRD Kepri 5 (Batam B)'],
    sampleRegencies: ['Kota Batam', 'Kota Tanjungpinang', 'Kab. Bintan', 'Kab. Karimun', 'Kab. Natuna', 'Kab. Kepulauan Anambas']
  },
  'Jambi': {
    dapils: ['Jambi', 'DPRD Jambi 1 (Kota Jambi)', 'DPRD Jambi 2 (Batanghari, Muaro Jambi)', 'DPRD Jambi 3 (Sarolangun, Merangin)'],
    sampleRegencies: ['Kota Jambi', 'Kab. Muaro Jambi', 'Kab. Batanghari', 'Kab. Tanjung Jabung Barat', 'Kab. Bungo', 'Kota Sungai Penuh']
  },
  'Sumatera Selatan': {
    dapils: ['Sumatera Selatan I', 'Sumatera Selatan II', 'DPRD Sumsel 1 (Palembang A)', 'DPRD Sumsel 2 (Palembang B)', 'DPRD Sumsel 3 (Ogan Komering Ilir, Ogan Ilir)'],
    sampleRegencies: ['Kota Palembang', 'Kab. Banyuasin', 'Kab. Ogan Ilir', 'Kab. Ogan Komering Ilir', 'Kab. Muara Enim', 'Kota Prabumulih']
  },
  'Kepulauan Bangka Belitung': {
    dapils: ['Bangka Belitung', 'DPRD Babel 1 (Pangkalpinang)', 'DPRD Babel 2 (Bangka)', 'DPRD Babel 3 (Bangka Selatan)', 'DPRD Babel 4 (Belitung, Belitung Timur)'],
    sampleRegencies: ['Kota Pangkalpinang', 'Kab. Bangka', 'Kab. Bangka Tengah', 'Kab. Bangka Barat', 'Kab. Bangka Selatan', 'Kab. Belitung']
  },
  'Bengkulu': {
    dapils: ['Bengkulu', 'DPRD Bengkulu 1 (Kota Bengkulu)', 'DPRD Bengkulu 2 (Bengkulu Utara, Bengkulu Tengah)', 'DPRD Bengkulu 3 (Mukomuko)'],
    sampleRegencies: ['Kota Bengkulu', 'Kab. Bengkulu Utara', 'Kab. Bengkulu Selatan', 'Kab. Rejang Lebong', 'Kab. Mukomuko']
  },
  'Lampung': {
    dapils: ['Lampung I', 'Lampung II', 'DPRD Lampung 1 (Bandar Lampung)', 'DPRD Lampung 2 (Lampung Selatan)', 'DPRD Lampung 3 (Pesawaran, Pringsewu, Metro)'],
    sampleRegencies: ['Kota Bandar Lampung', 'Kota Metro', 'Kab. Lampung Selatan', 'Kab. Lampung Tengah', 'Kab. Lampung Timur', 'Kab. Pesawaran']
  },
  'DKI Jakarta': {
    dapils: ['DKI Jakarta I', 'DKI Jakarta II', 'DKI Jakarta III', 'DPRD DKI 1 (Jakarta Pusat)', 'DPRD DKI 2 (Kep. Seribu, Jakarta Utara A)', 'DPRD DKI 3 (Jakarta Utara B)', 'DPRD DKI 4 (Jakarta Timur A)', 'DPRD DKI 5 (Jakarta Timur B)', 'DPRD DKI 6 (Jakarta Timur C)', 'DPRD DKI 7 (Jakarta Selatan A)', 'DPRD DKI 8 (Jakarta Selatan B)', 'DPRD DKI 9 (Jakarta Barat A)', 'DPRD DKI 10 (Jakarta Barat B)'],
    sampleRegencies: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat', 'Jakarta Utara', 'Kepulauan Seribu']
  },
  'Jawa Barat': {
    dapils: ['Jawa Barat I', 'Jawa Barat II', 'Jawa Barat III', 'Jawa Barat IV', 'Jawa Barat V', 'Jawa Barat VI', 'Jawa Barat VII', 'Jawa Barat VIII', 'Jawa Barat IX', 'Jawa Barat X', 'Jawa Barat XI', 'DPRD Jabar 1 (Kota Bandung, Kota Cimahi)', 'DPRD Jabar 2 (Kab. Bandung)', 'DPRD Jabar 3 (Kab. Bandung Barat)', 'DPRD Jabar 4 (Kab./Kota Tasikmalaya)', 'DPRD Jabar 5 (Kab./Kota Sukabumi)', 'DPRD Jabar 6 (Kab./Kota Bogor)'],
    sampleRegencies: ['Kota Bandung', 'Kota Cimahi', 'Kab. Bandung', 'Kab. Bandung Barat', 'Kab. Bogor', 'Kota Bogor', 'Kota Depok', 'Kab. Bekasi', 'Kota Bekasi', 'Kab. Karawang', 'Kab. Cirebon', 'Kota Cirebon', 'Kab. Garut', 'Kota Tasikmalaya']
  },
  'Banten': {
    dapils: ['Banten I', 'Banten II', 'Banten III', 'DPRD Banten 1 (Kota Serang)', 'DPRD Banten 2 (Kab. Serang A)', 'DPRD Banten 3 (Kab. Serang B)', 'DPRD Banten 4 (Kab. Tangerang A)', 'DPRD Banten 5 (Kab. Tangerang B)', 'DPRD Banten 6 (Kota Tangerang A)', 'DPRD Banten 7 (Kota Tangerang B)', 'DPRD Banten 8 (Kota Tangerang Selatan)'],
    sampleRegencies: ['Kota Tangerang', 'Kota Tangerang Selatan', 'Kab. Tangerang', 'Kota Serang', 'Kab. Serang', 'Kota Cilegon', 'Kab. Lebak', 'Kab. Pandeglang']
  },
  'Jawa Tengah': {
    dapils: ['Jawa Tengah I', 'Jawa Tengah II', 'Jawa Tengah III', 'Jawa Tengah IV', 'Jawa Tengah V', 'Jawa Tengah VI', 'Jawa Tengah VII', 'Jawa Tengah VIII', 'Jawa Tengah IX', 'Jawa Tengah X', 'DPRD Jateng 1 (Kota Semarang)', 'DPRD Jateng 2 (Semarang, Kendal, Salatiga)', 'DPRD Jateng 3 (Kudus, Jepara, Demak)', 'DPRD Jateng 7 (Solo, Sukoharjo, Klaten)'],
    sampleRegencies: ['Kota Semarang', 'Kota Surakarta', 'Kab. Semarang', 'Kab. Kendal', 'Kab. Boyolali', 'Kab. Klaten', 'Kab. Banyumas', 'Kab. Cilacap', 'Kota Magelang', 'Kab. Magelang', 'Kab. Brebes', 'Kab. Tegal', 'Kota Tegal']
  },
  'DI Yogyakarta': {
    dapils: ['DI Yogyakarta', 'DPRD DIY 1 (Kota Yogyakarta)', 'DPRD DIY 2 (Bantul Timur)', 'DPRD DIY 3 (Bantul Barat)', 'DPRD DIY 4 (Kulon Progo)', 'DPRD DIY 5 (Sleman Utara)', 'DPRD DIY 6 (Sleman Selatan)', 'DPRD DIY 7 (Gunungkidul)'],
    sampleRegencies: ['Kota Yogyakarta', 'Kab. Sleman', 'Kab. Bantul', 'Kab. Kulon Progo', 'Kab. Gunungkidul']
  },
  'Jawa Timur': {
    dapils: ['Jawa Timur I', 'Jawa Timur II', 'Jawa Timur III', 'Jawa Timur IV', 'Jawa Timur V', 'Jawa Timur VI', 'Jawa Timur VII', 'Jawa Timur VIII', 'Jawa Timur IX', 'Jawa Timur X', 'Jawa Timur XI', 'DPRD Jatim 1 (Kota Surabaya)', 'DPRD Jatim 2 (Sidoarjo)', 'DPRD Jatim 3 (Pasuruan, Probolinggo)', 'DPRD Jatim 4 (Banyuwangi, Bondowoso, Situbondo)', 'DPRD Jatim 5 (Lumajang, Jember)', 'DPRD Jatim 6 (Malang Raya)'],
    sampleRegencies: ['Kota Surabaya', 'Kab. Sidoarjo', 'Kota Malang', 'Kab. Malang', 'Kota Batu', 'Kab. Gresik', 'Kab. Jombang', 'Kab. Banyuwangi', 'Kab. Jember', 'Kab. Kediri', 'Kota Kediri', 'Kab. Pasuruan', 'Kab. Mojokerto']
  },
  'Bali': {
    dapils: ['Bali', 'DPRD Bali 1 (Denpasar)', 'DPRD Bali 2 (Badung)', 'DPRD Bali 3 (Tabanan)', 'DPRD Bali 4 (Jembrana)', 'DPRD Bali 5 (Buleleng)', 'DPRD Bali 6 (Bangli)', 'DPRD Bali 7 (Karangasem)', 'DPRD Bali 8 (Klungkung)', 'DPRD Bali 9 (Gianyar)'],
    sampleRegencies: ['Kota Denpasar', 'Kab. Badung', 'Kab. Gianyar', 'Kab. Tabanan', 'Kab. Buleleng', 'Kab. Karangasem', 'Kab. Klungkung', 'Kab. Bangli', 'Kab. Jembrana']
  },
  'Nusa Tenggara Barat': {
    dapils: ['Nusa Tenggara Barat I (Pulau Sumbawa)', 'Nusa Tenggara Barat II (Pulau Lombok)', 'DPRD NTB 1 (Kota Mataram)', 'DPRD NTB 2 (Lombok Barat, KLU)', 'DPRD NTB 3 (Lombok Timur A)', 'DPRD NTB 4 (Lombok Timur B)'],
    sampleRegencies: ['Kota Mataram', 'Kab. Lombok Barat', 'Kab. Lombok Tengah', 'Kab. Lombok Timur', 'Kab. Sumbawa', 'Kota Bima']
  },
  'Nusa Tenggara Timur': {
    dapils: ['Nusa Tenggara Timur I (Flores, Lembata, Alor)', 'Nusa Tenggara Timur II (Timor, Rote Ndao, Sabu Raijua, Sumba)', 'DPRD NTT 1 (Kota Kupang)', 'DPRD NTT 2 (Kab. Kupang, Rote, Sabu)'],
    sampleRegencies: ['Kota Kupang', 'Kab. Kupang', 'Kab. Flores Timur', 'Kab. Sikka', 'Kab. Ende', 'Kab. Manggarai', 'Kab. Sumba Timur']
  },
  'Kalimantan Barat': {
    dapils: ['Kalimantan Barat I', 'Kalimantan Barat II', 'DPRD Kalbar 1 (Kota Pontianak)', 'DPRD Kalbar 2 (Mempawah, Kubu Raya)', 'DPRD Kalbar 3 (Singkawang, Bengkayang)'],
    sampleRegencies: ['Kota Pontianak', 'Kota Singkawang', 'Kab. Kubu Raya', 'Kab. Mempawah', 'Kab. Sambas', 'Kab. Ketapang', 'Kab. Sintang']
  },
  'Kalimantan Tengah': {
    dapils: ['Kalimantan Tengah', 'DPRD Kalteng 1 (Palangka Raya, Katingan, Gunung Mas)', 'DPRD Kalteng 2 (Kotawaringin Timur, Seruyan)', 'DPRD Kalteng 3 (Kotawaringin Barat, Sukamara, Lamandau)'],
    sampleRegencies: ['Kota Palangka Raya', 'Kab. Kotawaringin Timur', 'Kab. Kotawaringin Barat', 'Kab. Kapuas', 'Kab. Barito Selatan']
  },
  'Kalimantan Selatan': {
    dapils: ['Kalimantan Selatan I', 'Kalimantan Selatan II', 'DPRD Kalsel 1 (Banjarmasin)', 'DPRD Kalsel 2 (Banjar)', 'DPRD Kalsel 3 (Barito Kuala)', 'DPRD Kalsel 7 (Banjarbaru, Tanah Laut)'],
    sampleRegencies: ['Kota Banjarmasin', 'Kota Banjarbaru', 'Kab. Banjar', 'Kab. Tanah Laut', 'Kab. Tanah Bumbu', 'Kab. Kotabaru']
  },
  'Kalimantan Timur': {
    dapils: ['Kalimantan Timur', 'DPRD Kaltim 1 (Samarinda)', 'DPRD Kaltim 2 (Balikpapan)', 'DPRD Kaltim 3 (Paser, Penajam Paser Utara / IKN)', 'DPRD Kaltim 4 (Kutai Kartanegara)'],
    sampleRegencies: ['Kota Samarinda', 'Kota Balikpapan', 'Kota Bontang', 'Kab. Kutai Kartanegara', 'Kab. Penajam Paser Utara', 'Kab. Paser', 'Kab. Berau']
  },
  'Kalimantan Utara': {
    dapils: ['Kalimantan Utara', 'DPRD Kaltara 1 (Tarakan)', 'DPRD Kaltara 2 (Bulungan, Tana Tidung)', 'DPRD Kaltara 3 (Malinau)', 'DPRD Kaltara 4 (Nunukan)'],
    sampleRegencies: ['Kota Tarakan', 'Kab. Bulungan', 'Kab. Nunukan', 'Kab. Malinau', 'Kab. Tana Tidung']
  },
  'Sulawesi Utara': {
    dapils: ['Sulawesi Utara', 'DPRD Sulut 1 (Kota Manado)', 'DPRD Sulut 2 (Minahasa Utara, Bitung)', 'DPRD Sulut 3 (Sangihe, Talaud, Sitaro)', 'DPRD Sulut 4 (Bolaang Mongondow Raya)'],
    sampleRegencies: ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kab. Minahasa', 'Kab. Minahasa Utara', 'Kab. Bolaang Mongondow']
  },
  'Gorontalo': {
    dapils: ['Gorontalo', 'DPRD Gorontalo 1 (Kota Gorontalo)', 'DPRD Gorontalo 2 (Bone Bolango)', 'DPRD Gorontalo 3 (Kab. Gorontalo A)', 'DPRD Gorontalo 6 (Boalemo, Pohuwato)'],
    sampleRegencies: ['Kota Gorontalo', 'Kab. Gorontalo', 'Kab. Bone Bolango', 'Kab. Boalemo', 'Kab. Pohuwato', 'Kab. Gorontalo Utara']
  },
  'Sulawesi Tengah': {
    dapils: ['Sulawesi Tengah', 'DPRD Sulteng 1 (Kota Palu)', 'DPRD Sulteng 2 (Parigi Moutong)', 'DPRD Sulteng 3 (Tolitoli, Buol)', 'DPRD Sulteng 4 (Banggai, Banggai Kepulauan, Banggai Laut)', 'DPRD Sulteng 5 (Poso, Tojo Una-Una)'],
    sampleRegencies: ['Kota Palu', 'Kab. Donggala', 'Kab. Sigi', 'Kab. Parigi Moutong', 'Kab. Banggai', 'Kab. Poso', 'Kab. Morowali', 'Kab. Morowali Utara']
  },
  'Sulawesi Barat': {
    dapils: ['Sulawesi Barat', 'DPRD Sulbar 1 (Mamuju)', 'DPRD Sulbar 2 (Polewali Mandar A)', 'DPRD Sulbar 3 (Polewali Mandar B)', 'DPRD Sulbar 5 (Majene)', 'DPRD Sulbar 7 (Pasangkayu)'],
    sampleRegencies: ['Kab. Mamuju', 'Kab. Polewali Mandar', 'Kab. Majene', 'Kab. Pasangkayu', 'Kab. Mamasa', 'Kab. Mamuju Tengah']
  },
  'Sulawesi Selatan': {
    dapils: ['Sulawesi Selatan I', 'Sulawesi Selatan II', 'Sulawesi Selatan III', 'DPRD Sulsel 1 (Makassar A)', 'DPRD Sulsel 2 (Makassar B)', 'DPRD Sulsel 3 (Gowa, Takalar)', 'DPRD Sulsel 4 (Jeneponto, Bantaeng, Selayar)'],
    sampleRegencies: ['Kota Makassar', 'Kab. Gowa', 'Kab. Takalar', 'Kab. Jeneponto', 'Kab. Bantaeng', 'Kab. Maros', 'Kab. Pangkajene dan Kepulauan', 'Kab. Bone', 'Kota Parepare', 'Kota Palopo']
  },
  'Sulawesi Tenggara': {
    dapils: ['Sulawesi Tenggara', 'DPRD Sultra 1 (Kota Kendari)', 'DPRD Sultra 2 (Konawe Selatan, Bombana)', 'DPRD Sultra 3 (Muna, Muna Barat, Buton Utara)', 'DPRD Sultra 4 (Kota Baubau, Buton, Wakatobi)'],
    sampleRegencies: ['Kota Kendari', 'Kota Baubau', 'Kab. Konawe', 'Kab. Konawe Selatan', 'Kab. Kolaka', 'Kab. Muna', 'Kab. Buton', 'Kab. Wakatobi']
  },
  'Maluku': {
    dapils: ['Maluku', 'DPRD Maluku 1 (Kota Ambon)', 'DPRD Maluku 2 (Buru, Buru Selatan)', 'DPRD Maluku 3 (Maluku Tengah)', 'DPRD Maluku 6 (Maluku Tenggara, Tual, Aru)'],
    sampleRegencies: ['Kota Ambon', 'Kota Tual', 'Kab. Maluku Tengah', 'Kab. Buru', 'Kab. Maluku Tenggara', 'Kab. Kepulauan Aru']
  },
  'Maluku Utara': {
    dapils: ['Maluku Utara', 'DPRD Malut 1 (Ternate, Halmahera Barat)', 'DPRD Malut 2 (Halmahera Utara, Morotai)', 'DPRD Malut 3 (Tidore, Halmahera Timur, Halmahera Tengah)', 'DPRD Malut 4 (Halmahera Selatan)'],
    sampleRegencies: ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kab. Halmahera Barat', 'Kab. Halmahera Utara', 'Kab. Halmahera Selatan', 'Kab. Pulau Morotai']
  },
  'Papua': {
    dapils: ['Papua', 'DPRD Papua 1 (Kota Jayapura A)', 'DPRD Papua 2 (Kota Jayapura B)', 'DPRD Papua 3 (Kab. Jayapura)', 'DPRD Papua 4 (Keerom)', 'DPRD Papua 5 (Sarmi, Mamberamo Raya)', 'DPRD Papua 6 (Biak Numfor, Supiori)', 'DPRD Papua 7 (Kepulauan Yapen, Waropen)'],
    sampleRegencies: ['Kota Jayapura', 'Kab. Jayapura', 'Kab. Keerom', 'Kab. Sarmi', 'Kab. Biak Numfor', 'Kab. Kepulauan Yapen']
  },
  'Papua Barat': {
    dapils: ['Papua Barat', 'DPRD Papua Barat 1 (Manokwari)', 'DPRD Papua Barat 2 (Manokwari Selatan, Pegunungan Arfak)', 'DPRD Papua Barat 3 (Teluk Bintuni)', 'DPRD Papua Barat 4 (Fakfak)', 'DPRD Papua Barat 5 (Kaimana)'],
    sampleRegencies: ['Kab. Manokwari', 'Kab. Fakfak', 'Kab. Teluk Bintuni', 'Kab. Kaimana', 'Kab. Manokwari Selatan', 'Kab. Pegunungan Arfak']
  },
  'Papua Selatan': {
    dapils: ['Papua Selatan', 'DPRD Papua Selatan 1 (Merauke A)', 'DPRD Papua Selatan 2 (Merauke B)', 'DPRD Papua Selatan 3 (Mappi)', 'DPRD Papua Selatan 4 (Boven Digoel)', 'DPRD Papua Selatan 5 (Asmat)'],
    sampleRegencies: ['Kab. Merauke', 'Kab. Boven Digoel', 'Kab. Mappi', 'Kab. Asmat']
  },
  'Papua Tengah': {
    dapils: ['Papua Tengah', 'DPRD Papua Tengah 1 (Nabire)', 'DPRD Papua Tengah 2 (Intan Jaya)', 'DPRD Papua Tengah 3 (Paniai)', 'DPRD Papua Tengah 4 (Deiyai)', 'DPRD Papua Tengah 5 (Mimika A)', 'DPRD Papua Tengah 6 (Mimika B)', 'DPRD Papua Tengah 7 (Puncak)', 'DPRD Papua Tengah 8 (Puncak Jaya)'],
    sampleRegencies: ['Kab. Nabire', 'Kab. Mimika', 'Kab. Paniai', 'Kab. Puncak', 'Kab. Puncak Jaya', 'Kab. Dogiyai', 'Kab. Deiyai', 'Kab. Intan Jaya']
  },
  'Papua Pegunungan': {
    dapils: ['Papua Pegunungan', 'DPRD Papua Pegunungan 1 (Jayawijaya)', 'DPRD Papua Pegunungan 2 (Lanny Jaya)', 'DPRD Papua Pegunungan 3 (Nduga)', 'DPRD Papua Pegunungan 4 (Tolikara)', 'DPRD Papua Pegunungan 5 (Mamberamo Tengah)', 'DPRD Papua Pegunungan 6 (Yalimo)', 'DPRD Papua Pegunungan 7 (Yahukimo)', 'DPRD Papua Pegunungan 8 (Pegunungan Bintang)'],
    sampleRegencies: ['Kab. Jayawijaya', 'Kab. Yahukimo', 'Kab. Tolikara', 'Kab. Pegunungan Bintang', 'Kab. Lanny Jaya', 'Kab. Nduga']
  },
  'Papua Barat Daya': {
    dapils: ['Papua Barat Daya', 'DPRD Papua Barat Daya 1 (Kota Sorong A)', 'DPRD Papua Barat Daya 2 (Kota Sorong B)', 'DPRD Papua Barat Daya 3 (Kab. Sorong)', 'DPRD Papua Barat Daya 4 (Raja Ampat)', 'DPRD Papua Barat Daya 5 (Sorong Selatan)', 'DPRD Papua Barat Daya 6 (Tambrauw, Maybrat)'],
    sampleRegencies: ['Kota Sorong', 'Kab. Sorong', 'Kab. Raja Ampat', 'Kab. Sorong Selatan', 'Kab. Tambrauw', 'Kab. Maybrat']
  },
};

// ==========================================
// PILIHAN MINAT ISU KEBIJAKAN (AI GROUNDING)
// ==========================================
export const POLICY_INTEREST_SUGGESTIONS = [
  { id: 'pendidikan', label: 'Pendidikan & Kebudayaan', icon: 'GraduationCap', desc: 'Kurikulum, guru honorer, beasiswa, sarpras sekolah' },
  { id: 'kesehatan', label: 'Kesehatan & BPJS', icon: 'HeartPulse', desc: 'Fasilitas RS/Puskesmas, stunting, obat & BPJS' },
  { id: 'infrastruktur', label: 'Infrastruktur & Tata Ruang', icon: 'Building2', desc: 'Jalan daerah, jembatan, irigasi, sanitasi warga' },
  { id: 'pertanian', label: 'Pertanian, Pangan & Nelayan', icon: 'Wheat', desc: 'Subsidi pupuk, harga gabah, benih & alat tangkap' },
  { id: 'umkm', label: 'UMKM & Ekonomi Kreatif', icon: 'Store', desc: 'Permodalan, digitalisasi usaha, sertifikasi halal' },
  { id: 'anggaran', label: 'APBD & Transparansi Anggaran', icon: 'Coins', desc: 'Efisiensi belanja, audit BPK, pengawasan proyek' },
  { id: 'lingkungan', label: 'Lingkungan Hidup & Energi Terbarukan', icon: 'Leaf', desc: 'Pengelolaan sampah, AMDAL, banjir & emisi karbon' },
  { id: 'hukum_antikorupsi', label: 'Hukum, HAM & Anti-Korupsi', icon: 'Scale', desc: 'Perda berkeadilan, advokasi warga, integritas OPD' },
  { id: 'ketenagakerjaan', label: 'Ketenagakerjaan & Lapangan Kerja', icon: 'Briefcase', desc: 'UMR/UMK, pelatihan vokasi BLK, buruh migran' },
  { id: 'sosial_bansos', label: 'Kesejahteraan Sosial & Bansos', icon: 'ShieldCheck', desc: 'DTKS, PKH, disabilitas & pengentasan kemiskinan' },
  { id: 'perempuan_anak', label: 'Pemberdayaan Perempuan & Anak', icon: 'Users', desc: 'Perlindungan KDRT, hak anak, kepemimpinan wanita' },
  { id: 'transportasi', label: 'Transportasi Publik & Logistik', icon: 'Bus', desc: 'Angkutan umum daerah, keselamatan jalan, tol laut' },
  { id: 'pariwisata', label: 'Pariwisata & Budaya Lokal', icon: 'Palmtree', desc: 'Destinasi wisata, pelestarian adat, devisa lokal' },
  { id: 'digital_keamanan', label: 'Digitalisasi & Keterbukaan Informasi', icon: 'Laptop', desc: 'Smart city, sinyal blankspot 4G/5G, literasi digital' },
];

// ==========================================
// PILIHAN JENIS KELAMIN
// ==========================================
export const GENDER_OPTIONS = [
  { value: 'LAKI_LAKI', label: 'Laki-laki', icon: 'User' },
  { value: 'PEREMPUAN', label: 'Perempuan', icon: 'UserCheck' },
];

// ==========================================
// PILIHAN JENJANG PENDIDIKAN
// ==========================================
export const EDUCATION_LEVEL_OPTIONS = [
  'S3 (Doktor / Ph.D)',
  'S2 (Magister / Master)',
  'S1 (Sarjana)',
  'D4 / D3 (Diploma / Ahli Madya)',
  'SMA / SMK / MA / Sederajat',
  'Pesantren / Pendidikan Non-Formal',
];

// ==========================================
// SARAN KURSUS / PELATIHAN POPULER DEWAN
// ==========================================
export const POPULAR_COURSES_SUGGESTIONS = [
  'Program Pendidikan Reguler Angkatan (PPRA) Lemhannas RI',
  'Kursus Singkat Pimpinan Daerah (KSPD) Lemhannas RI',
  'Executive Education in Public Policy & Leadership',
  'Kursus Legal Drafting & Perancangan Naskah Akademik Perda',
  'Bimbingan Teknis (Bimtek) Pengawasan & Evaluasi APBD',
  'Sertifikasi Kompetensi Mediator Publik & Hubungan Industrial',
  'Pelatihan Komunikasi Strategis & Manajemen Krisis Media',
  'Workshop Audit Forensik & Pencegahan Fraud Anggaran',
  'Pelatihan Diplomasi Parlemen & Kerjasama Antar Lembaga',
];
