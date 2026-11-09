-- Migration: 0021_party_ideology_matrix.sql
-- Description: Menambahkan matriks doktrin ideologi partai, filosofi inti, pandangan kebijakan sektoral (PolicySector), kamus diksi terpilih, dan pantangan narasi ke master_political_parties.

DO $$
BEGIN
  -- 1. Tambah kolom ideology_spectrum
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_political_parties' AND column_name = 'ideology_spectrum'
  ) THEN
    ALTER TABLE master_political_parties ADD COLUMN ideology_spectrum VARCHAR(50) NOT NULL DEFAULT 'NASIONALIS';
  END IF;

  -- 2. Tambah kolom core_philosophies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_political_parties' AND column_name = 'core_philosophies'
  ) THEN
    ALTER TABLE master_political_parties ADD COLUMN core_philosophies TEXT[] NOT NULL DEFAULT '{}';
  END IF;

  -- 3. Tambah kolom policy_doctrines (JSONB)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_political_parties' AND column_name = 'policy_doctrines'
  ) THEN
    ALTER TABLE master_political_parties ADD COLUMN policy_doctrines JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  -- 4. Tambah kolom preferred_vocabulary
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_political_parties' AND column_name = 'preferred_vocabulary'
  ) THEN
    ALTER TABLE master_political_parties ADD COLUMN preferred_vocabulary TEXT[] NOT NULL DEFAULT '{}';
  END IF;

  -- 5. Tambah kolom taboo_stances
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'master_political_parties' AND column_name = 'taboo_stances'
  ) THEN
    ALTER TABLE master_political_parties ADD COLUMN taboo_stances TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- 6. Update Doktrin & Ideologi untuk Seluruh Partai Politik Utama di Indonesia
-- PDI-P (Partai Demokrasi Indonesia Perjuangan)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'NASIONALIS_KERAKYATAN',
  core_philosophies = ARRAY['Pancasila 1 Juni 1945', 'Marhaenisme', 'Trisakti Bung Karno (Berdikari, Berdaulat, Berkepribadian)', 'Ekonomi Kerakyatan Gotong Royong'],
  preferred_vocabulary = ARRAY['gotong royong', 'berdikari', 'Trisakti', 'wong cilik', 'kedaulatan rakyat', 'keadilan sosial', 'pembebasan', 'nasionalisme kerakyatan'],
  taboo_stances = ARRAY['mendorong privatisasi layanan air bersih dan pangan', 'mengusulkan penghapusan subsidi sosial untuk rakyat kecil', 'kebijakan neoliberal pasar bebas murni tanpa intervensi negara'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Kedaulatan pangan mutlak; menolak impor beras dan komoditas utama saat musim panen raya petani lokal; memperjuangkan perlindungan lahan pertanian abadi dan subsidi pupuk langsung kepada petani gurem.",
    "FISKAL_ANGGARAN": "Anggaran negara dan APBD wajib pro-wong cilik; belanja perlindungan sosial dan pendidikan kerakyatan adalah hak konstitusional; pemangkasan pos belanja seremonial dan pemborosan birokrasi.",
    "EKONOMI_KETENAGAKERJAAN": "Perlindungan maksimal hak-hak buruh dan pekerja upah harian; kepastian jaminan sosial tenaga kerja (BPJS Ketenagakerjaan); penguatan ekonomi mikro dan koperasi gotong royong.",
    "LAYANAN_DASAR": "Pendidikan gratis berkualitas dan akses kesehatan menyeluruh tanpa diskriminasi kelas layanan; penguatan puskesmas dan fasilitas kesehatan primer di kantong-kantong pemukiman rakyat.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur konektivitas desa-kota yang membuka urat nadi ekonomi rakyat; penataan ruang yang memprioritaskan pemukiman layak bagi kaum marjinal dan mitigasi bencana kerakyatan.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa pandang bulu untuk keadilan rakyat miskin; perlindungan hak asasi manusia dan kebebasan beragama berdasarkan Pancasila; pemberantasan mafia tanah dan mafia hukum."
  }'::jsonb
WHERE code = 'PDIP';

-- GOLKAR (Partai Golongan Karya)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'TEKNOKRATIS_PEMBANGUNAN',
  core_philosophies = ARRAY['Karya-Kekaryaan', 'Doktrin Karya Pembangunan', 'Sentrisme Teknokratis', 'Stabilitas Nasional dan Pertumbuhan Berkelanjutan'],
  preferred_vocabulary = ARRAY['karya nyata', 'stabilitas pembangunan', 'iklim investasi', 'akselerasi ekonomi', 'efisiensi birokrasi', 'kemitraan strategis', 'kapasitas fiskal', 'daya saing bangsa'],
  taboo_stances = ARRAY['retorika konfrontatif terhadap dunia usaha dan investasi', 'sikap pesimisme terhadap pertumbuhan ekonomi', 'kebijakan proteksionisme berlebihan yang mematikan persaingan usaha'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Modernisasi agrobisnis berbasis mekanisasi dan teknologi digital; kemitraan strategis antara korporasi pangan dan kelompok tani daerah; efisiensi rantai pasok untuk kestabilan harga pangan pasar.",
    "FISKAL_ANGGARAN": "Manajemen fiskal yang disiplin dan prudent; perluasan basis pendapatan asli daerah (PAD) melalui kemudahan investasi; rasionalisasi belanja operasional menuju belanja modal produktif bernilai tambah.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan lapangan kerja masif melalui kemudahan izin usaha (ease of doing business); revitalisasi pendidikan vokasi dan balai latihan kerja (BLK) link-and-match dengan industri modern.",
    "LAYANAN_DASAR": "Efisiensi pengelolaan sistem jaminan sosial nasional; kemitraan pemerintah-swasta (PPP) dalam akselerasi penyediaan rumah sakit daerah dan fasilitas pendidikan unggulan.",
    "INFRASTRUKTUR_RUANG": "Percepatan Proyek Strategis Nasional (PSN) dan jalan logistik sentra produksi; tata ruang berwawasan investasi terpadu dan zonasi kawasan ekonomi khusus (KEK) daerah.",
    "TATA_KELOLA_HUKUM": "Kepastian hukum berusaha untuk menarik investor domestik dan global; deregulasi perizinan dan digitalisasi birokrasi perizinan terpadu satu pintu (PTSP)."
  }'::jsonb
WHERE code = 'GOLKAR';

-- GERINDRA (Partai Gerakan Indonesia Raya)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'NASIONALIS_KEDAULATAN',
  core_philosophies = ARRAY['Nasionalisme Kerakyatan', 'Kedaulatan Pangan, Energi dan Air', 'Ekonomi Kerakyatan Pasal 33 UUD 1945', 'Pertahanan dan Integritas Bangsa'],
  preferred_vocabulary = ARRAY['swasembada pangan', 'ketahanan nasional', 'kebocoran anggaran', 'berdiri di atas kaki sendiri', 'kedaulatan bangsa', 'generasi emas', 'kesejahteraan rakyat'],
  taboo_stances = ARRAY['ketergantungan kronis pada impor bahan pangan dasar', 'kompromi terhadap kebocoran anggaran publik', 'melemahkan kedaulatan industri strategis dan pertahanan'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Swasembada pangan mutlak dan modernisasi irigasi waduk desa; penguatan lumbung pangan daerah (food estate) terkelola terpadu; proteksi kepemilikan bibit dan pupuk lokal mandiri.",
    "FISKAL_ANGGARAN": "Pemberantasan kebocoran anggaran publik secara tegas; realokasi belanja seremonial dinas langsung untuk perbaikan gizi anak, susu/makan siang bergizi, dan ketahanan sosial keluarga.",
    "EKONOMI_KETENAGAKERJAAN": "Revitalisasi Koperasi Unit Desa (KUD) dan permodalan langsung pedagang pasar tradisional; hilirisasi komoditas mineral dan pertanian demi penyerapan jutaan tenaga kerja terdidik di dalam negeri.",
    "LAYANAN_DASAR": "Investasi gizi dan kesehatan ibu-anak untuk memutus rantai stunting; peningkatan kesejahteraan guru, tenaga medis daerah terpencil, dan beasiswa kedokteran nasional.",
    "INFRASTRUKTUR_RUANG": "Prioritas infrastruktur logistik strategis, jaringan irigasi persawahan rakyat, dan pelabuhan sentra perikanan; pertahanan tata ruang pesisir dan wilayah perbatasan terluar.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa pandang bulu terhadap korupsi dan penyelundupan sumber daya alam; penguatan aparat penegak hukum dan integritas kedaulatan peradilan."
  }'::jsonb
WHERE code = 'GERINDRA';

-- PKS (Partai Keadilan Sejahtera)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'ISLAMIS_MODERAT_KEADILAN',
  core_philosophies = ARRAY['Islam Rahmatan lil Alamin', 'Keadilan Sosial dan Kesejahteraan', 'Integritas dan Etika Pelayanan Publik', 'Ketahanan Keluarga'],
  preferred_vocabulary = ARRAY['keadilan sosial', 'kemaslahatan umat', 'amanah anggaran', 'keberpihakan pada rakyat', 'pengawasan moral', 'ketahanan keluarga', 'transparansi publik'],
  taboo_stances = ARRAY['pemborosan pos anggaran seremonial dan fasilitas pejabat', 'kebijakan yang menggerus institusi keluarga', 'kebijakan diskriminatif dan penindasan kaum mustadhafin'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Keadilan distribusi pupuk dan transparansi kuota petani; perlindungan lahan sawah lestari dari alih fungsi komersial liar; advokasi nasib buruh tani dan petani plasma.",
    "FISKAL_ANGGARAN": "Disiplin anggaran anti-pemborosan; pengawasan ketat terhadap rasio utang daerah dan pusat; alokasi anggaran yang memprioritaskan bantuan langsung keluarga prasejahtera dan pembebasan pajak pekerja awal.",
    "EKONOMI_KETENAGAKERJAAN": "Pemberdayaan wirausaha berbasis keluarga dan UMKM mandiri; penolakan klausul ketenagakerjaan yang merugikan kepastian kerja buruh; perlindungan etis jam kerja perempuan.",
    "LAYANAN_DASAR": "Pendidikan karakter dan moralitas terpadu bebas biaya; penguatan puskesmas ramah anak dan lansia; integrasi posyandu sebagai garda depan ketahanan kesehatan keluarga.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur dasar air bersih dan sanitasi di pemukiman padat warga; pemerataan jalan desa poros pertanian dan penolakan proyek mercusuar nir-manfaat warga.",
    "TATA_KELOLA_HUKUM": "Pengawasan etika penyelenggara negara dan transparansi rekrutmen birokrasi; penolakan gratifikasi serta independensi lembaga audit dan anti-korupsi."
  }'::jsonb
WHERE code = 'PKS';

-- PKB (Partai Kebangkitan Bangsa)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'ISLAMIS_MODERAT_KERAKYATAN',
  core_philosophies = ARRAY['Ahlussunnah wal Jamaah an-Nahdliyyah', 'Kemaslahatan Ummah (Mabadi Khaira Ummah)', 'Pluralisme Kebangsaan Gus Dur', 'Pemberdayaan Masyarakat Desa dan Pesantren'],
  preferred_vocabulary = ARRAY['kemaslahatan', 'ekonomi kerakyatan', 'pesantren', 'santripreneur', 'keadilan distributif', 'desa mandiri', 'wong cilik', 'pluralisme toleran'],
  taboo_stances = ARRAY['pengabaian peran pondok pesantren dan pendidikan keagamaan', 'pemusatan perputaran ekonomi hanya di pusat kota', 'intoleransi dan ancaman terhadap kerukunan umat beragama'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Kebangkitan petani desa; penyediaan pupuk bersubsidi mudah dan murah langsung ke pintu petani; perbaikan tata kelola irigasi pedesaan berbasis swadaya warga.",
    "FISKAL_ANGGARAN": "Peningkatan signifikan dana desa dan dana abadi pesantren; alokasi anggaran daerah wajib menitikberatkan pada wilayah pinggiran dan komunitas pesantren.",
    "EKONOMI_KETENAGAKERJAAN": "Inkubasi santripreneur dan ekonomi syariah inklusif; perlindungan hukum terpadu bagi pekerja migran Indonesia (PMI/TKI); permodalan murah bagi pedagang mikro daerah.",
    "LAYANAN_DASAR": "Kesetaraan fasilitas madrasah dan sekolah umum; beasiswa santri dan pemuda berprestasi ke perguruan tinggi; jaminan kesehatan gratis bagi guru ngaji dan pengajar agama.",
    "INFRASTRUKTUR_RUANG": "Pembangunan jembatan dan jalan poros desa-desa terpencil; konektivitas sentra produksi pangan pedesaan menuju pasar kabupaten.",
    "TATA_KELOLA_HUKUM": "Menjaga kebhinekaan dan kerukunan umat beragama; perlindungan hak-hak masyarakat adat dan komunitas lokal pedesaan."
  }'::jsonb
WHERE code = 'PKB';

-- NASDEM (Partai NasDem)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'NASIONALIS_DEMOKRATIS_RESTORASI',
  core_philosophies = ARRAY['Restorasi Indonesia', 'Nasionalis Demokratis', 'Politik Tanpa Mahar', 'Gerakan Perubahan Tata Kelola Bangsa'],
  preferred_vocabulary = ARRAY['restorasi', 'gerakan perubahan', 'tata kelola bersih', 'politik tanpa mahar', 'inovasi daerah', 'modernisasi pertanian', 'kepastian investasi'],
  taboo_stances = ARRAY['mempertahankan status-quo birokrasi korup dan lambat', 'kebijakan tumpang tindih perizinan', 'politik transaksional mahar dalam pelayanan publik'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Restorasi tata kelola pangan; korporatisasi petani lokal agar memiliki daya tawar tinggi; modernisasi alat tangkap nelayan dan teknologi pascapanen terpadu.",
    "FISKAL_ANGGARAN": "Anggaran berbasis kinerja nyata (outcome-based budgeting); efisiensi total pos rapat dan seremonial dinas untuk dialihkan ke belanja modal produktif daerah.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan ekosistem startup dan kewirausahaan pemuda berbasis teknologi; reformasi ketenagakerjaan yang menyeimbangkan fleksibilitas usaha dan kepastian perlindungan pekerja.",
    "LAYANAN_DASAR": "Digitalisasi sistem rujukan kesehatan daerah; peningkatan mutu guru berbasis sertifikasi kompetensi transparan tanpa pungutan liar.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur penunjang pariwisata daerah dan sentra logistik komoditas unggulan; perbaikan tata ruang kota yang inklusif dan ramah lingkungan.",
    "TATA_KELOLA_HUKUM": "Reformasi menyeluruh peradilan dan birokrasi kepolisian daerah; meritokrasi lelang jabatan pimpinan tinggi OPD daerah secara terbuka."
  }'::jsonb
WHERE code = 'NASDEM';

-- PAN (Partai Amanat Nasional)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'REFORMIS_MODERAT',
  core_philosophies = ARRAY['Amanat Rakyat', 'Islam Kemajuan dan Moderat', 'Semangat Reformasi Berkelanjutan', 'Kewirausahaan dan Persaingan Adil'],
  preferred_vocabulary = ARRAY['bantu rakyat', 'amanat reformasi', 'kewirausahaan', 'UMKM naik kelas', 'persaingan sehat', 'ekonomi terbuka', 'kemajuan daerah'],
  taboo_stances = ARRAY['monopoli pasar yang menindas pedagang kecil', 'sikap pasif terhadap kemandirian usaha generasi muda', 'birokrasi yang mematikan inisiatif inovasi swasta'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Stabilitas harga kebutuhan pokok melalui operasi pasar transparan; bantuan bibit unggul dan pupuk tepat sasaran bagi kelompok tani produktif.",
    "FISKAL_ANGGARAN": "Insentif fiskal dan penghapusan retribusi memberatkan bagi pelaku UMKM pemula; optimalisasi aset daerah non-produktif agar menghasilkan dividen bagi kas daerah.",
    "EKONOMI_KETENAGAKERJAAN": "Akselerasi digitalisasi UMKM daerah (go-digital); pembiayaan kredit usaha rakyat (KUR) bunga rendah tanpa agunan memberatkan; pelatihan kewirausahaan generasi muda.",
    "LAYANAN_DASAR": "Fasilitasi beasiswa sains dan teknologi bagi pemuda daerah; peningkatan mutu layanan RSUD dan integrasi BPJS daerah tanpa antrean berbelit.",
    "INFRASTRUKTUR_RUANG": "Pembangunan pasar tradisional modern yang higienis; perbaikan akses jalan sentra kerajinan dan industri rumahan pedesaan.",
    "TATA_KELOLA_HUKUM": "Tata kelola pemerintahan daerah yang bersih, melayani, dan bebas pungli; akuntabilitas publik melalui sistem layanan berbasis elektronik (SPBE)."
  }'::jsonb
WHERE code = 'PAN';

-- DEMOKRAT (Partai Demokrat)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'NASIONALIS_RELIGIUS',
  core_philosophies = ARRAY['Nasionalis-Religius', 'Pertumbuhan Berkeadilan (Growth with Equity)', 'Empat Pilar Kebijakan: Pro-Poor, Pro-Job, Pro-Growth, Pro-Environment'],
  preferred_vocabulary = ARRAY['pertumbuhan berkeadilan', 'pro-poor', 'pro-job', 'pro-growth', 'pro-environment', 'suara rakyat', 'solusi konkret', 'kelas menengah'],
  taboo_stances = ARRAY['mengorbankan lingkungan hidup demi eksploitasi jangka pendek', 'pengabaian terhadap daya beli kelas menengah', 'pelemahan institusi demokrasi dan supremasi hukum'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Bantuan langsung sarana produksi tani tepat waktu; stabilisasi harga pangan dan proteksi margin keuntungan petani; penolakan impor pangan yang memukul petani domestik.",
    "FISKAL_ANGGARAN": "Manajemen anggaran yang seimbang dan disiplin fiskal tinggi; menjaga daya beli masyarakat melalui subsidi tepat sasaran; pengawasan alokasi utang agar tidak membebani generasi depan.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan lapangan kerja padat karya seluas-luasnya; insentif pajak bagi industri yang merekrut tenaga kerja lokal dalam jumlah besar; perlindungan daya beli pekerja kelas menengah.",
    "LAYANAN_DASAR": "Program perlindungan sosial komprehensif bagi keluarga miskin dan rentan; beasiswa pendidikan berprestasi; peningkatan sarana prasarana puskesmas di seluruh pelosok kecamatan.",
    "INFRASTRUKTUR_RUANG": "Pembangunan infrastruktur terencana yang berdampak langsung bagi rakyat tanpa membebani keuangan negara; kelestarian lingkungan hidup dan perlindungan hutan resapan air.",
    "TATA_KELOLA_HUKUM": "Supremasi hukum, penegakan checks and balances di parlemen, dan kebebasan bersuara bagi masyarakat sipil; pencegahan penyalahgunaan kekuasaan aparatur negara."
  }'::jsonb
WHERE code = 'DEMOKRAT';

-- PSI (Partai Solidaritas Indonesia)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'PROGRESIF_REFORMIS',
  core_philosophies = ARRAY['Solidaritas Sosial', 'Anti-Korupsi dan Anti-Intoleransi', 'Transparansi Radikal', 'Meritokrasi dan Kesetaraan Kaum Muda'],
  preferred_vocabulary = ARRAY['transparansi anggaran', 'anti-korupsi', 'anti-intoleransi', 'kaum muda', 'BPJS gratis', 'meritokrasi', 'digitalisasi birokrasi', 'kesetaraan hak'],
  taboo_stances = ARRAY['kebijakan diskriminatif berbasis SARA', 'anggaran siluman atau rapat gelap tanpa notula publik', 'kompromi terhadap tindakan korupsi dan kolusi birokrasi'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Digitalisasi rantai pasok pangan untuk memotong perantara tengkulak; transparansi data penerima pupuk subsidi secara online; regenerasi petani muda melalui smart-farming.",
    "FISKAL_ANGGARAN": "Keterbukaan anggaran APBD berbasis online (e-budgeting) terbuka untuk warga; penolakan pemborosan pos studi banding fiktif dinas dan biaya dinas pejabat.",
    "EKONOMI_KETENAGAKERJAAN": "Ekosistem kerja yang fleksibel bagi pekerja gig dan ekonomi kreatif; upah setara gender; penghapusan diskriminasi batas usia maksimal dalam lowongan kerja.",
    "LAYANAN_DASAR": "Layanan BPJS Kesehatan gratis tanpa kelas dan tanpa antrean diskriminatif; digitalisasi rekam medis terpadu; fasilitas kesehatan mental terjangkau bagi pemuda.",
    "INFRASTRUKTUR_RUANG": "Transportasi publik terintegrasi, murah, aman dan ramah disabilitas; penyediaan ruang terbuka hijau (RTH) dan fasilitas kreatif pemuda di perkotaan.",
    "TATA_KELOLA_HUKUM": "Layanan pengaduan pungli online respon cepat; penegakan hukum tegas terhadap ujaran kebencian intoleran; transparansi legislasi via live streaming sidang dewan."
  }'::jsonb
WHERE code = 'PSI';

-- PPP (Partai Persatuan Pembangunan)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'ISLAMIS_PEMBANGUNAN',
  core_philosophies = ARRAY['Prinsip Pembangunan Berkelanjutan Berbasis Islam', 'Kemaslahatan Ummat', 'Ukhuwah Islamiyah dan Wathaniyah', 'Keadilan dan Amar Maruf Nahi Munkar'],
  preferred_vocabulary = ARRAY['kemaslahatan umat', 'pembangunan berkeadilan', 'ekonomi syariah', 'madrasah', 'pesantren', 'moralitas publik', 'keberkahan rizki'],
  taboo_stances = ARRAY['legalisasi aktivitas yang melanggar moralitas publik dan agama', 'pengabaian terhadap lembaga pendidikan keagamaan tradisional', 'eksploitasi ekonomi yang merugikan rakyat bawah'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Penyediaan benih dan pupuk halal-berkah bagi petani; revitalisasi lahan wakaf produktif untuk ketahanan pangan umat; perlindungan harga jual gabah petani.",
    "FISKAL_ANGGARAN": "Integrasi instrumen zakat, infaq, shadaqah dan wakaf (ZISWAF) dengan APBD untuk pengentasan kemiskinan; alokasi anggaran khusus afirmasi sarana madrasah diniyah.",
    "EKONOMI_KETENAGAKERJAAN": "Pengembangan industri halal daerah dan sertifikasi halal gratis bagi UMKM; pembiayaan mikro berbasis bagi hasil syariah bebas riba.",
    "LAYANAN_DASAR": "Bantuan operasional bagi pondok pesantren, guru mengaji, dan madrasah; beasiswa kader ulama dan cendekiawan muslim daerah ke universitas terkemuka.",
    "INFRASTRUKTUR_RUANG": "Pembangunan sarana sanitasi pesantren dan fasilitas air wudhu bersih pedesaan; perbaikan jalan penghubung sentra keagamaan dan pasar umat.",
    "TATA_KELOLA_HUKUM": "Penguatan regulasi pencegahan kemaksiatan, miras, dan judi online di daerah; penegakan hukum yang adil berlandaskan keadilan ilahiah dan konstitusi."
  }'::jsonb
WHERE code = 'PPP';

-- PERINDO (Partai Persatuan Indonesia)
UPDATE master_political_parties
SET 
  ideology_spectrum = 'NASIONALIS_KESEJAHTERAAN',
  core_philosophies = ARRAY['Persatuan Indonesia', 'Kesejahteraan Rakyat sebagai Prasyarat Persatuan', 'Pemberdayaan Ekonomi Produktif', 'Inklusivitas Nasional'],
  preferred_vocabulary = ARRAY['kesejahteraan rakyat', 'ekonomi produktif', 'bantuan gerobak', 'modal usaha', 'persatuan bangsa', 'daya saing daerah', 'pemerataan rezeki'],
  taboo_stances = ARRAY['kebijakan yang memperlebar jurang kesenjangan sosial', 'diskriminasi ekonomi terhadap pelaku usaha ultramikro', 'perpecahan persatuan antar-golongan masyarakat'],
  policy_doctrines = '{
    "PANGAN_PERTANIAN": "Bantuan sarana modern bagi nelayan dan petani; jaminan serapan hasil panen dengan harga menguntungkan petani; cold-storage terpadu untuk hasil laut nelayan.",
    "FISKAL_ANGGARAN": "Anggaran daerah yang dialokasikan langsung untuk peningkatan modal kerja produktif masyarakat bawah, bukan sekadar bantuan konsumtif sesaat.",
    "EKONOMI_KETENAGAKERJAAN": "Program masif bantuan sarana usaha (seperti gerobak/tenda usaha modern) dan pendampingan manajemen bisnis UMKM; kredit lunak tanpa bunga bagi pedagang kaki lima.",
    "LAYANAN_DASAR": "Layanan ambulans dan faskes gratis untuk keadaan darurat warga miskin; pelatihan keterampilan digital gratis bagi anak muda pencari kerja.",
    "INFRASTRUKTUR_RUANG": "Sentra kuliner dan kawasan UMKM tertata rapi di lokasi strategis kota; konektivitas desa nelayan menuju jalur distribusi kota.",
    "TATA_KELOLA_HUKUM": "Perlindungan hukum bagi pelaku usaha mikro dari pungutan liar; penegakan hukum berkeadilan yang melindungi hak-hak ekonomi rakyat kecil."
  }'::jsonb
WHERE code = 'PERINDO';

