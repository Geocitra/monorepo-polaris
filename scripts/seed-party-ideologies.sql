-- =========================================================================
-- POLARIS PLATFORM — MASTER POLITICAL PARTIES & IDEOLOGY SEEDER
-- Idempoten (ON CONFLICT DO UPDATE): Aman dijalankan berulang kali.
-- Dapat langsung dieksekusi di database container tanpa build ulang!
-- =========================================================================

-- 1. Pastikan tabel master_political_parties dan kolom-kolomnya siap
CREATE TABLE IF NOT EXISTS master_political_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  ballot_number INTEGER,
  primary_color VARCHAR(20) NOT NULL,
  secondary_color VARCHAR(20),
  logo_url TEXT,
  description TEXT,
  ideology_spectrum VARCHAR(50) NOT NULL DEFAULT 'NASIONALIS',
  core_philosophies TEXT[] NOT NULL DEFAULT '{}',
  policy_doctrines JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferred_vocabulary TEXT[] NOT NULL DEFAULT '{}',
  taboo_stances TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Pastikan kolom pendukung ideologi ada (jika tabel sudah ada dari schema lama)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_political_parties' AND column_name = 'ideology_spectrum') THEN
    ALTER TABLE master_political_parties ADD COLUMN ideology_spectrum VARCHAR(50) NOT NULL DEFAULT 'NASIONALIS';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_political_parties' AND column_name = 'core_philosophies') THEN
    ALTER TABLE master_political_parties ADD COLUMN core_philosophies TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_political_parties' AND column_name = 'policy_doctrines') THEN
    ALTER TABLE master_political_parties ADD COLUMN policy_doctrines JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_political_parties' AND column_name = 'preferred_vocabulary') THEN
    ALTER TABLE master_political_parties ADD COLUMN preferred_vocabulary TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_political_parties' AND column_name = 'taboo_stances') THEN
    ALTER TABLE master_political_parties ADD COLUMN taboo_stances TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- 2. SEED DATA SELURUH PARTAI POLITIK INDONESIA
INSERT INTO master_political_parties (
  code, name, ballot_number, primary_color, secondary_color, description,
  ideology_spectrum, core_philosophies, preferred_vocabulary, taboo_stances, policy_doctrines
)
VALUES
-- 1. PKB
(
  'PKB', 'Partai Kebangkitan Bangsa', 1, '#007A3D', '#F4B223',
  'Partai Kebangkitan Bangsa didirikan pada tahun 1998 berakar pada tradisi Ahlussunnah wal Jamaah dan pluralisme kebangsaan Gus Dur.',
  'ISLAMIS_MODERAT_KERAKYATAN',
  ARRAY['Ahlussunnah wal Jamaah an-Nahdliyyah', 'Kemaslahatan Ummah (Mabadi Khaira Ummah)', 'Pluralisme Kebangsaan Gus Dur', 'Pemberdayaan Masyarakat Desa dan Pesantren'],
  ARRAY['kemaslahatan', 'ekonomi kerakyatan', 'pesantren', 'santripreneur', 'keadilan distributif', 'desa mandiri', 'wong cilik', 'pluralisme toleran'],
  ARRAY['pengabaian peran pondok pesantren dan pendidikan keagamaan', 'pemusatan perputaran ekonomi hanya di pusat kota', 'intoleransi dan ancaman terhadap kerukunan umat beragama'],
  '{
    "PANGAN_PERTANIAN": "Kebangkitan petani desa; penyediaan pupuk bersubsidi mudah dan murah langsung ke pintu petani; perbaikan tata kelola irigasi pedesaan berbasis swadaya warga.",
    "FISKAL_ANGGARAN": "Peningkatan signifikan dana desa dan dana abadi pesantren; alokasi anggaran daerah wajib menitikberatkan pada wilayah pinggiran dan komunitas pesantren.",
    "EKONOMI_KETENAGAKERJAAN": "Inkubasi santripreneur dan ekonomi syariah inklusif; perlindungan hukum terpadu bagi pekerja migran Indonesia (PMI/TKI); permodalan murah bagi pedagang mikro daerah.",
    "LAYANAN_DASAR": "Kesetaraan fasilitas madrasah dan sekolah umum; beasiswa santri dan pemuda berprestasi ke perguruan tinggi; jaminan kesehatan gratis bagi guru ngaji dan pengajar agama.",
    "INFRASTRUKTUR_RUANG": "Pembangunan jembatan dan jalan poros desa-desa terpencil; konektivitas sentra produksi pangan pedesaan menuju pasar kabupaten.",
    "TATA_KELOLA_HUKUM": "Menjaga kebhinekaan dan kerukunan umat beragama; perlindungan hak-hak masyarakat adat dan komunitas lokal pedesaan."
  }'::jsonb
),
-- 2. GERINDRA
(
  'GERINDRA', 'Partai Gerakan Indonesia Raya', 2, '#C8102E', '#FFFFFF',
  'Partai Gerakan Indonesia Raya berfokus pada nasionalisme kerakyatan, kedaulatan pangan, energi, dan ketahanan nasional yang kuat.',
  'NASIONALIS_KEDAULATAN',
  ARRAY['Nasionalisme Kerakyatan', 'Kedaulatan Pangan, Energi dan Air', 'Ekonomi Kerakyatan Pasal 33 UUD 1945', 'Pertahanan dan Integritas Bangsa'],
  ARRAY['swasembada pangan', 'ketahanan nasional', 'kebocoran anggaran', 'berdiri di atas kaki sendiri', 'kedaulatan bangsa', 'generasi emas', 'kesejahteraan rakyat'],
  ARRAY['ketergantungan kronis pada impor bahan pangan dasar', 'kompromi terhadap kebocoran anggaran publik', 'melemahkan kedaulatan industri strategis dan pertahanan'],
  '{
    "PANGAN_PERTANIAN": "Swasembada pangan mutlak dan modernisasi irigasi waduk desa; penguatan lumbung pangan daerah (food estate) terkelola terpadu; proteksi kepemilikan bibit dan pupuk lokal mandiri.",
    "FISKAL_ANGGARAN": "Pemberantasan kebocoran anggaran publik secara tegas; realokasi belanja seremonial dinas langsung untuk perbaikan gizi anak, susu/makan siang bergizi, dan ketahanan sosial keluarga.",
    "EKONOMI_KETENAGAKERJAAN": "Revitalisasi Koperasi Unit Desa (KUD) dan permodalan langsung pedagang pasar tradisional; hilirisasi komoditas mineral dan pertanian demi penyerapan jutaan tenaga kerja terdidik di dalam negeri.",
    "LAYANAN_DASAR": "Investasi gizi dan kesehatan ibu-anak untuk memutus rantai stunting; peningkatan kesejahteraan guru, tenaga medis daerah terpencil, dan beasiswa kedokteran nasional.",
    "INFRASTRUKTUR_RUANG": "Prioritas infrastruktur logistik strategis, jaringan irigasi persawahan rakyat, dan pelabuhan sentra perikanan; pertahanan tata ruang pesisir dan wilayah perbatasan terluar.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa pandang bulu terhadap korupsi dan penyelundupan sumber daya alam; penguatan aparat penegak hukum dan integritas kedaulatan peradilan."
  }'::jsonb
),
-- 3. PDIP
(
  'PDIP', 'Partai Demokrasi Indonesia Perjuangan', 3, '#D90429', '#000000',
  'Partai Demokrasi Indonesia Perjuangan berlandaskan Pancasila 1 Juni 1945, ajaran Bung Karno, dan komitmen pembelaan terhadap wong cilik.',
  'NASIONALIS_KERAKYATAN',
  ARRAY['Pancasila 1 Juni 1945', 'Marhaenisme', 'Trisakti Bung Karno (Berdikari, Berdaulat, Berkepribadian)', 'Ekonomi Kerakyatan Gotong Royong'],
  ARRAY['gotong royong', 'berdikari', 'Trisakti', 'wong cilik', 'kedaulatan rakyat', 'keadilan sosial', 'pembebasan', 'nasionalisme kerakyatan'],
  ARRAY['mendorong privatisasi layanan air bersih dan pangan', 'mengusulkan penghapusan subsidi sosial untuk rakyat kecil', 'kebijakan neoliberal pasar bebas murni tanpa intervensi negara'],
  '{
    "PANGAN_PERTANIAN": "Kedaulatan pangan mutlak; menolak impor beras dan komoditas utama saat musim panen raya petani lokal; memperjuangkan perlindungan lahan pertanian abadi dan subsidi pupuk langsung kepada petani gurem.",
    "FISKAL_ANGGARAN": "Anggaran negara dan APBD wajib pro-wong cilik; belanja perlindungan sosial dan pendidikan kerakyatan adalah hak konstitusional; pemangkasan pos belanja seremonial dan pemborosan birokrasi.",
    "EKONOMI_KETENAGAKERJAAN": "Perlindungan maksimal hak-hak buruh dan pekerja upah harian; kepastian jaminan sosial tenaga kerja (BPJS Ketenagakerjaan); penguatan ekonomi mikro dan koperasi gotong royong.",
    "LAYANAN_DASAR": "Pendidikan gratis berkualitas dan akses kesehatan menyeluruh tanpa diskriminasi kelas layanan; penguatan puskesmas dan fasilitas kesehatan primer di kantong-kantong pemukiman rakyat.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur konektivitas desa-kota yang membuka urat nadi ekonomi rakyat; penataan ruang yang memprioritaskan pemukiman layak bagi kaum marjinal dan mitigasi bencana kerakyatan.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa pandang bulu untuk keadilan rakyat miskin; perlindungan hak asasi manusia dan kebebasan beragama berdasarkan Pancasila; pemberantasan mafia tanah dan mafia hukum."
  }'::jsonb
),
-- 4. GOLKAR
(
  'GOLKAR', 'Partai Golongan Karya', 4, '#FFD700', '#1E3A8A',
  'Partai Golongan Karya berorientasi pada karya kekaryaan, stabilitas pembangunan teknokratis, dan percepatan pertumbuhan ekonomi.',
  'TEKNOKRATIS_PEMBANGUNAN',
  ARRAY['Karya-Kekaryaan', 'Doktrin Karya Pembangunan', 'Sentrisme Teknokratis', 'Stabilitas Nasional dan Pertumbuhan Berkelanjutan'],
  ARRAY['karya nyata', 'stabilitas pembangunan', 'iklim investasi', 'akselerasi ekonomi', 'efisiensi birokrasi', 'kemitraan strategis', 'kapasitas fiskal', 'daya saing bangsa'],
  ARRAY['retorika konfrontatif terhadap dunia usaha dan investasi', 'sikap pesimisme terhadap pertumbuhan ekonomi', 'kebijakan proteksionisme berlebihan yang mematikan persaingan usaha'],
  '{
    "PANGAN_PERTANIAN": "Modernisasi agrobisnis berbasis mekanisasi dan teknologi digital; kemitraan strategis antara korporasi pangan dan kelompok tani daerah; efisiensi rantai pasok untuk kestabilan harga pangan pasar.",
    "FISKAL_ANGGARAN": "Manajemen fiskal yang disiplin dan prudent; perluasan basis pendapatan asli daerah (PAD) melalui kemudahan investasi; rasionalisasi belanja operasional menuju belanja modal produktif bernilai tambah.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan lapangan kerja masif melalui kemudahan izin usaha (ease of doing business); revitalisasi pendidikan vokasi dan balai latihan kerja (BLK) link-and-match dengan industri modern.",
    "LAYANAN_DASAR": "Efisiensi pengelolaan sistem jaminan sosial nasional; kemitraan pemerintah-swasta (PPP) dalam akselerasi penyediaan rumah sakit daerah dan fasilitas pendidikan unggulan.",
    "INFRASTRUKTUR_RUANG": "Percepatan Proyek Strategis Nasional (PSN) dan jalan logistik sentra produksi; tata ruang berwawasan investasi terpadu dan zonasi kawasan ekonomi khusus (KEK) daerah.",
    "TATA_KELOLA_HUKUM": "Kepastian hukum berusaha untuk menarik investor domestik dan global; deregulasi perizinan dan digitalisasi birokrasi perizinan terpadu satu pintu (PTSP)."
  }'::jsonb
),
-- 5. NASDEM
(
  'NASDEM', 'Partai NasDem', 5, '#002B49', '#FF6F00',
  'Partai NasDem mengusung Gerakan Perubahan dan Restorasi Indonesia menuju tatanan berbangsa yang berdaulat dan berintegritas.',
  'NASIONALIS_DEMOKRATIS_RESTORASI',
  ARRAY['Restorasi Indonesia', 'Nasionalis Demokratis', 'Politik Tanpa Mahar', 'Gerakan Perubahan Tata Kelola Bangsa'],
  ARRAY['restorasi', 'gerakan perubahan', 'tata kelola bersih', 'politik tanpa mahar', 'inovasi daerah', 'modernisasi pertanian', 'kepastian investasi'],
  ARRAY['mempertahankan status-quo birokrasi korup dan lambat', 'kebijakan tumpang tindih perizinan', 'politik transaksional mahar dalam pelayanan publik'],
  '{
    "PANGAN_PERTANIAN": "Restorasi tata kelola pangan; korporatisasi petani lokal agar memiliki daya tawar tinggi; modernisasi alat tangkap nelayan dan teknologi pascapanen terpadu.",
    "FISKAL_ANGGARAN": "Anggaran berbasis kinerja nyata (outcome-based budgeting); efisiensi total pos rapat dan seremonial dinas untuk dialihkan ke belanja modal produktif daerah.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan ekosistem startup dan kewirausahaan pemuda berbasis teknologi; reformasi ketenagakerjaan yang menyeimbangkan fleksibilitas usaha dan kepastian perlindungan pekerja.",
    "LAYANAN_DASAR": "Digitalisasi sistem rujukan kesehatan daerah; peningkatan mutu guru berbasis sertifikasi kompetensi transparan tanpa pungutan liar.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur penunjang pariwisata daerah dan sentra logistik komoditas unggulan; perbaikan tata ruang kota yang inklusif dan ramah lingkungan.",
    "TATA_KELOLA_HUKUM": "Reformasi menyeluruh peradilan dan birokrasi kepolisian daerah; meritokrasi lelang jabatan pimpinan tinggi OPD daerah secara terbuka."
  }'::jsonb
),
-- 6. BURUH
(
  'BURUH', 'Partai Buruh', 6, '#FF6600', '#000000',
  'Partai Buruh memperjuangkan terwujudnya negara kesejahteraan (welfare state) untuk buruh, petani, nelayan, dan rakyat kecil.',
  'SOSIAL_DEMOKRAT_PERBURUHAN',
  ARRAY['Negara Kesejahteraan (Welfare State)', 'Kedaulatan Kaum Buruh dan Petani', 'Keadilan Distributif', 'Jaminan Sosial Seumur Hidup'],
  ARRAY['upah layak', 'hapus outsourcing', 'jaminan sosial seumur hidup', 'kedaulatan buruh', 'reforma agraria sejati', 'hak mogok dan berserikat', 'keadilan upah'],
  ARRAY['sistem kerja kontrak berkepanjangan tanpa kepastian', 'upah murah', 'pemutusan hubungan kerja sepihak', 'pembatasan hak serikat pekerja'],
  '{
    "PANGAN_PERTANIAN": "Reforma agraria sejati dan pembagian tanah untuk petani gurem; jaminan harga beli panen oleh Bulog di atas biaya produksi.",
    "FISKAL_ANGGARAN": "Pajak progresif bagi korporasi besar dan orang super kaya untuk mendanai jaminan sosial warga miskin dan jaminan pengangguran.",
    "EKONOMI_KETENAGAKERJAAN": "Penghapusan sistem alih daya (outsourcing) liar; penetapan upah minimum berdasarkan standar hidup layak riil; kepastian kerja permanen.",
    "LAYANAN_DASAR": "Jaminan kesehatan 100% gratis tanpa iuran memberatkan bagi buruh dan pekerja informal; jaminan pensiun dan jaminan perumahan buruh.",
    "INFRASTRUKTUR_RUANG": "Pembangunan kampung susun dan perumahan rakyat buruh dekat sentra industri; air bersih gratis di pemukiman pekerja.",
    "TATA_KELOLA_HUKUM": "Pengadilan hubungan industrial yang adil dan memihak buruh; penindakan pidana bagi pengusaha nakal yang menahan upah dan THR."
  }'::jsonb
),
-- 7. GELORA
(
  'GELORA', 'Partai Gelombang Rakyat Indonesia', 7, '#0099FF', '#FF3300',
  'Partai Gelora Indonesia mengusung visi Arah Baru Indonesia untuk membawa Indonesia menjadi kekuatan 5 besar dunia.',
  'NASIONALIS_RELIGIUS_FUTURISTIK',
  ARRAY['Arah Baru Indonesia', 'Kekuatan 5 Besar Dunia', 'Integrasi Islam dan Kebangsaan', 'Demokrasi Pengetahuan'],
  ARRAY['arah baru', 'lima besar dunia', 'lompatan ekonomi', 'inovasi masa depan', 'kedaulatan geopolitik', 'kolaborasi kebangsaan', 'generasi pembaharu'],
  ARRAY['narasi polarisasi identitas memecah belah', 'mentalitas kerdil dan inferior di panggung global', 'pembatasan akses teknologi dan sains bagi rakyat'],
  '{
    "PANGAN_PERTANIAN": "Transformasi pertanian modern berbasis kecerdasan buatan dan bioteknologi; industrialisasi pangan maritim untuk mendominasi pasar global.",
    "FISKAL_ANGGARAN": "Belanja negara berbasis riset, sains, dan teknologi tinggi; peningkatan rasio pajak berbasis pertumbuhan ekonomi baru bukan membebani rakyat.",
    "EKONOMI_KETENAGAKERJAAN": "Pemberdayaan talenta digital dan industri kreatif generasi muda; pelatihan kecakapan masa depan untuk bersaing di pasar global.",
    "LAYANAN_DASAR": "Kuliah gratis untuk anak bangsa berprestasi; pemenuhan nutrisi dan gizi ibu hamil untuk melahirkan generasi unggul bebas stunting.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur konektivitas digital 5G di seluruh pelosok pulau; kota-kota masa depan yang ramah lingkungan dan berteknologi tinggi.",
    "TATA_KELOLA_HUKUM": "Kolaborasi strategis seluruh elemen bangsa tanpa polarisasi; reformasi hukum berbasis digitalisasi dan kecerdasan buatan."
  }'::jsonb
),
-- 8. PKS
(
  'PKS', 'Partai Keadilan Sejahtera', 8, '#FF6600', '#FFFFFF',
  'Partai Keadilan Sejahtera mengedepankan nilai-nilai Islam rahmatan lil alamin, ketahanan keluarga, dan integritas pelayanan publik.',
  'ISLAMIS_MODERAT_KEADILAN',
  ARRAY['Islam Rahmatan lil Alamin', 'Keadilan Sosial dan Kesejahteraan', 'Integritas dan Etika Pelayanan Publik', 'Ketahanan Keluarga'],
  ARRAY['keadilan sosial', 'kemaslahatan umat', 'amanah anggaran', 'keberpihakan pada rakyat', 'pengawasan moral', 'ketahanan keluarga', 'transparansi publik'],
  ARRAY['pemborosan pos anggaran seremonial dan fasilitas pejabat', 'kebijakan yang menggerus institusi keluarga', 'kebijakan diskriminatif dan penindasan kaum mustadhafin'],
  '{
    "PANGAN_PERTANIAN": "Keadilan distribusi pupuk dan transparansi kuota petani; perlindungan lahan sawah lestari dari alih fungsi komersial liar; advokasi nasib buruh tani dan petani plasma.",
    "FISKAL_ANGGARAN": "Disiplin anggaran anti-pemborosan; pengawasan ketat terhadap rasio utang daerah dan pusat; alokasi anggaran yang memprioritaskan bantuan langsung keluarga prasejahtera dan pembebasan pajak pekerja awal.",
    "EKONOMI_KETENAGAKERJAAN": "Pemberdayaan wirausaha berbasis keluarga dan UMKM mandiri; penolakan klausul ketenagakerjaan yang merugikan kepastian kerja buruh; perlindungan etis jam kerja perempuan.",
    "LAYANAN_DASAR": "Pendidikan karakter dan moralitas terpadu bebas biaya; penguatan puskesmas ramah anak dan lansia; integrasi posyandu sebagai garda depan ketahanan kesehatan keluarga.",
    "INFRASTRUKTUR_RUANG": "Infrastruktur dasar air bersih dan sanitasi di pemukiman padat warga; pemerataan jalan desa poros pertanian dan penolakan proyek mercusuar nir-manfaat warga.",
    "TATA_KELOLA_HUKUM": "Pengawasan etika penyelenggara negara dan transparansi rekrutmen birokrasi; penolakan gratifikasi serta independensi lembaga audit dan anti-korupsi."
  }'::jsonb
),
-- 9. PKN
(
  'PKN', 'Partai Kebangkitan Nusantara', 9, '#C41E3A', '#FFFFFF',
  'Partai Kebangkitan Nusantara bertekad membangkitkan kembali semangat kejayaan peradaban maritim dan persatuan Nusantara.',
  'NASIONALIS_NUSANTARA',
  ARRAY['Kejayaan Nusantara', 'Kemandirian Bahari dan Maritim', 'Kebangsaan Inklusif', 'Keadilan Kawasan Timur dan Barat'],
  ARRAY['kebangkitan nusantara', 'kedaulatan maritim', 'gotong royong nusantara', 'kemandirian daerah', 'keadilan antarpulau', 'warisan luhur bangsa'],
  ARRAY['pemusatan pembangunan hanya di Jawa (Jawasentris)', 'pelecehan nilai sejarah dan budaya daerah', 'eksploitasi kekayaan daerah tanpa pembagian hasil adil'],
  '{
    "PANGAN_PERTANIAN": "Revitalisasi kedaulatan maritim dan pangan pesisir; armada kapal modern bagi nelayan lokal Nusantara; lumbung pangan lokal kepulauan.",
    "FISKAL_ANGGARAN": "Otonomi fiskal yang lebih adil bagi daerah penghasil sumber daya alam; pemerataan dana transfer ke daerah kepulauan terluar.",
    "EKONOMI_KETENAGAKERJAAN": "Pengembangan industri pengolahan perikanan terpadu di kawasan timur; penciptaan sentra ekonomi bahari dan pariwisata budaya daerah.",
    "LAYANAN_DASAR": "Kapal rumah sakit terapung dan puskesmas keliling pulau terluar; akses pendidikan bermutu di daerah 3T (terdepan, terluar, tertinggal).",
    "INFRASTRUKTUR_RUANG": "Tol laut nyata dengan tarif subsidi logistik yang menekan disparitas harga barang antar-pulau; pelabuhan rakyat berstandar modern.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum kedaulatan laut dari pencurian ikan asing; perlindungan adat dan kearifan lokal di seluruh pelosok nusantara."
  }'::jsonb
),
-- 10. HANURA
(
  'HANURA', 'Partai Hati Nurani Rakyat', 10, '#E65100', '#8D6E63',
  'Partai Hanura menempatkan hati nurani sebagai pedoman utama perjuangan politik demi keadilan dan kepedulian rakyat bawah.',
  'NASIONALIS_NURANI',
  ARRAY['Hati Nurani sebagai Kompas Moral', 'Keadilan Rakyat Bawah', 'Nasionalisme Berkeadaban', 'Kebersamaan Nyata'],
  ARRAY['hati nurani', 'nurani rakyat', 'pengabdian tulus', 'keadilan nyata', 'kepedulian sosial', 'anti-arogansi kekuasaan'],
  ARRAY['arogansi birokrasi yang mematikan rasa empati', 'mengabaikan jeritan rakyat miskin', 'kebijakan elitis tanpa mendengarkan aspirasi bawah'],
  '{
    "PANGAN_PERTANIAN": "Sentuhan nurani bagi nasib petani kecil; penyaluran bibit dan sarana pertanian bebas dari manipulasi dan percaloan dinas.",
    "FISKAL_ANGGARAN": "Anggaran yang menyentuh langsung kebutuhan dapur rakyat; penghapusan pos anggaran pemborosan rapat dan fasilitas pejabat daerah.",
    "EKONOMI_KETENAGAKERJAAN": "Perlindungan terhadap pedagang kaki lima dan pasar tradisional dari penggusuran sepihak tanpa relokasi yang layak.",
    "LAYANAN_DASAR": "Pelayanan kesehatan yang ramah dan memanusiakan pasien miskin; sekolah yang bebas dari pungutan uang gedung liar.",
    "INFRASTRUKTUR_RUANG": "Perbaikan gang-gang pemukiman warga dan drainase lingkungan untuk mencegah banjir di kantong pemukiman padat.",
    "TATA_KELOLA_HUKUM": "Birokrasi yang melayani dengan ketulusan hati nurani; perlindungan warga kecil dari kesewenang-wenangan aparat."
  }'::jsonb
),
-- 11. GARUDA
(
  'GARUDA', 'Partai Garda Republik Indonesia', 11, '#8B0000', '#D4AF37',
  'Partai Garuda merupakan garda pemuda mandiri yang memperjuangkan perubahan nyata dan regenerasi kepemimpinan bangsa.',
  'NASIONALIS_KEPEMUDAAN',
  ARRAY['Garda Terdepan Pemuda Indonesia', 'Perubahan Melalui Regenerasi', 'Nasionalisme Progresif', 'Kemandirian Ekonomi Kaum Muda'],
  ARRAY['garda pemuda', 'generasi penerus', 'perubahan nyata', 'mandiri dan berani', 'patriotisme baru', 'inklusif pemuda'],
  ARRAY['pembungkaman peran pemuda dalam politik', 'politik dinasti tertutup', 'pembatasan akses kepemimpinan generasi baru'],
  '{
    "PANGAN_PERTANIAN": "Gerakan regenerasi petani muda (smart farmers); adopsi teknologi agritech untuk memikat generasi milenial dan Gen-Z ke sektor pertanian.",
    "FISKAL_ANGGARAN": "Alokasi anggaran khusus inkubasi bisnis rintisan pemuda dan permodalan wirausaha awal tanpa jaminan sertifikat tanah.",
    "EKONOMI_KETENAGAKERJAAN": "Penghapusan syarat pengalaman kerja dan batas usia diskriminatif bagi lulusan baru (fresh graduate) di seluruh perusahaan.",
    "LAYANAN_DASAR": "Beasiswa keterampilan vokasi digital; fasilitas konseling kesehatan mental gratis bagi generasi muda di fasilitas kesehatan publik.",
    "INFRASTRUKTUR_RUANG": "Creative hub dan ruang publik ber-wifi gratis di setiap kecamatan untuk ruang belajar dan kerja kreatif pemuda.",
    "TATA_KELOLA_HUKUM": "Keterbukaan akses informasi publik dan pelibatan aktif organisasi kepemudaan dalam pembuatan peraturan daerah."
  }'::jsonb
),
-- 12. PAN
(
  'PAN', 'Partai Amanat Nasional', 12, '#0055A5', '#FFFFFF',
  'Partai Amanat Nasional memperjuangkan amanat rakyat, reformasi berkelanjutan, dan kemajuan UMKM serta kewirausahaan daerah.',
  'REFORMIS_MODERAT',
  ARRAY['Amanat Rakyat', 'Islam Kemajuan dan Moderat', 'Semangat Reformasi Berkelanjutan', 'Kewirausahaan dan Persaingan Adil'],
  ARRAY['bantu rakyat', 'amanat reformasi', 'kewirausahaan', 'UMKM naik kelas', 'persaingan sehat', 'ekonomi terbuka', 'kemajuan daerah'],
  ARRAY['monopoli pasar yang menindas pedagang kecil', 'sikap pasif terhadap kemandirian usaha generasi muda', 'birokrasi yang mematikan inisiatif inovasi swasta'],
  '{
    "PANGAN_PERTANIAN": "Stabilitas harga kebutuhan pokok melalui operasi pasar transparan; bantuan bibit unggul dan pupuk tepat sasaran bagi kelompok tani produktif.",
    "FISKAL_ANGGARAN": "Insentif fiskal dan penghapusan retribusi memberatkan bagi pelaku UMKM pemula; optimalisasi aset daerah non-produktif agar menghasilkan dividen bagi kas daerah.",
    "EKONOMI_KETENAGAKERJAAN": "Akselerasi digitalisasi UMKM daerah (go-digital); pembiayaan kredit usaha rakyat (KUR) bunga rendah tanpa agunan memberatkan; pelatihan kewirausahaan generasi muda.",
    "LAYANAN_DASAR": "Fasilitasi beasiswa sains dan teknologi bagi pemuda daerah; peningkatan mutu layanan RSUD dan integrasi BPJS daerah tanpa antrean berbelit.",
    "INFRASTRUKTUR_RUANG": "Pembangunan pasar tradisional modern yang higienis; perbaikan akses jalan sentra kerajinan dan industri rumahan pedesaan.",
    "TATA_KELOLA_HUKUM": "Tata kelola pemerintahan daerah yang bersih, melayani, dan bebas pungli; akuntabilitas publik melalui sistem layanan berbasis elektronik (SPBE)."
  }'::jsonb
),
-- 13. PBB
(
  'PBB', 'Partai Bulan Bintang', 13, '#006633', '#FFFF00',
  'Partai Bulan Bintang berakar pada tradisi Masyumi yang memperjuangkan syariat Islam dan kepastian hukum ketatanegaraan berkeadilan.',
  'ISLAMIS_KONSTITUSIONAL',
  ARRAY['Syariat Islam dalam Bingkai NKRI', 'Ketatanegaraan Berkeadilan (Masyumi Heritage)', 'Supremasi Hukum Konstitusi', 'Amar Maruf Nahi Munkar'],
  ARRAY['konstitusi berkeadilan', 'syariat rahmatan lil alamin', 'supremasi hukum', 'integritas hakim', 'ketatanegaraan bersih', 'keadilan moral'],
  ARRAY['pelanggaran konstitusi dan hukum ketatanegaraan', 'sekularisme ekstrem yang anti-agama', 'penggusuran nilai moralitas bangsa'],
  '{
    "PANGAN_PERTANIAN": "Kemandirian pangan berbasis tanah wakaf dan tanah adat; kepastian hak milik tanah petani dari gugatan sepihak korporasi.",
    "FISKAL_ANGGARAN": "Manajemen anggaran yang bersih dari riba dan manipulasi akuntansi; pemanfaatan dana ZISWAF terintegrasi untuk jaminan sosial umat.",
    "EKONOMI_KETENAGAKERJAAN": "Penguatan lembaga keuangan mikro syariah (BMT) di tingkat kelurahan; perlindungan hak-hak pekerja berbasis akad syariah yang adil.",
    "LAYANAN_DASAR": "Penguatan kurikulum adab dan moral di sekolah umum; bantuan sarana prasarana madrasah dan pondok pesantren tradisional.",
    "INFRASTRUKTUR_RUANG": "Pembangunan tata ruang yang menjaga situs-situs bersejarah keagamaan dan fasilitas ibadah publik yang representatif.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa pandang bulu berlandaskan keadilan konstitusional; pemberantasan mafia peradilan dan pembenahan integritas hakim."
  }'::jsonb
),
-- 14. DEMOKRAT
(
  'DEMOKRAT', 'Partai Demokrat', 14, '#000080', '#D90429',
  'Partai Demokrat berpijak pada nasionalis-religius dengan doktrin pertumbuhan berkeadilan dan kepedulian pada kelas menengah.',
  'NASIONALIS_RELIGIUS',
  ARRAY['Nasionalis-Religius', 'Pertumbuhan Berkeadilan (Growth with Equity)', 'Empat Pilar Kebijakan: Pro-Poor, Pro-Job, Pro-Growth, Pro-Environment'],
  ARRAY['pertumbuhan berkeadilan', 'pro-poor', 'pro-job', 'pro-growth', 'pro-environment', 'suara rakyat', 'solusi konkret', 'kelas menengah'],
  ARRAY['mengorbankan lingkungan hidup demi eksploitasi jangka pendek', 'pengabaian terhadap daya beli kelas menengah', 'pelemahan institusi demokrasi dan supremasi hukum'],
  '{
    "PANGAN_PERTANIAN": "Bantuan langsung sarana produksi tani tepat waktu; stabilisasi harga pangan dan proteksi margin keuntungan petani; penolakan impor pangan yang memukul petani domestik.",
    "FISKAL_ANGGARAN": "Manajemen anggaran yang seimbang dan disiplin fiskal tinggi; menjaga daya beli masyarakat melalui subsidi tepat sasaran; pengawasan alokasi utang agar tidak membebani generasi depan.",
    "EKONOMI_KETENAGAKERJAAN": "Penciptaan lapangan kerja padat karya seluas-luasnya; insentif pajak bagi industri yang merekrut tenaga kerja lokal dalam jumlah besar; perlindungan daya beli pekerja kelas menengah.",
    "LAYANAN_DASAR": "Program perlindungan sosial komprehensif bagi keluarga miskin dan rentan; beasiswa pendidikan berprestasi; peningkatan sarana prasarana puskesmas di seluruh pelosok kecamatan.",
    "INFRASTRUKTUR_RUANG": "Pembangunan infrastruktur terencana yang berdampak langsung bagi rakyat tanpa membebani keuangan negara; kelestarian lingkungan hidup dan perlindungan hutan resapan air.",
    "TATA_KELOLA_HUKUM": "Supremasi hukum, penegakan checks and balances di parlemen, dan kebebasan bersuara bagi masyarakat sipil; pencegahan penyalahgunaan kekuasaan aparatur negara."
  }'::jsonb
),
-- 15. PSI
(
  'PSI', 'Partai Solidaritas Indonesia', 15, '#E50914', '#FFFFFF',
  'Partai Solidaritas Indonesia mewakili suara progresif kaum muda, transparansi radikal, anti-korupsi, dan anti-intoleransi.',
  'PROGRESIF_REFORMIS',
  ARRAY['Solidaritas Sosial', 'Anti-Korupsi dan Anti-Intoleransi', 'Transparansi Radikal', 'Meritokrasi dan Kesetaraan Kaum Muda'],
  ARRAY['transparansi anggaran', 'anti-korupsi', 'anti-intoleransi', 'kaum muda', 'BPJS gratis', 'meritokrasi', 'digitalisasi birokrasi', 'kesetaraan hak'],
  ARRAY['kebijakan diskriminatif berbasis SARA', 'anggaran siluman atau rapat gelap tanpa notula publik', 'kompromi terhadap tindakan korupsi dan kolusi birokrasi'],
  '{
    "PANGAN_PERTANIAN": "Digitalisasi rantai pasok pangan untuk memotong perantara tengkulak; transparansi data penerima pupuk subsidi secara online; regenerasi petani muda melalui smart-farming.",
    "FISKAL_ANGGARAN": "Keterbukaan anggaran APBD berbasis online (e-budgeting) terbuka untuk warga; penolakan pemborosan pos studi banding fiktif dinas dan biaya dinas pejabat.",
    "EKONOMI_KETENAGAKERJAAN": "Ekosistem kerja yang fleksibel bagi pekerja gig dan ekonomi kreatif; upah setara gender; penghapusan diskriminasi batas usia maksimal dalam lowongan kerja.",
    "LAYANAN_DASAR": "Layanan BPJS Kesehatan gratis tanpa kelas dan tanpa antrean diskriminatif; digitalisasi rekam medis terpadu; fasilitas kesehatan mental terjangkau bagi pemuda.",
    "INFRASTRUKTUR_RUANG": "Transportasi publik terintegrasi, murah, aman dan ramah disabilitas; penyediaan ruang terbuka hijau (RTH) dan fasilitas kreatif pemuda di perkotaan.",
    "TATA_KELOLA_HUKUM": "Layanan pengaduan pungli online respon cepat; penegakan hukum tegas terhadap ujaran kebencian intoleran; transparansi legislasi via live streaming sidang dewan."
  }'::jsonb
),
-- 16. PERINDO
(
  'PERINDO', 'Partai Persatuan Indonesia', 16, '#002060', '#E30613',
  'Partai Persatuan Indonesia berfokus pada percepatan kesejahteraan rakyat kecil melalui bantuan modal dan sarana ekonomi produktif.',
  'NASIONALIS_KESEJAHTERAAN',
  ARRAY['Persatuan Indonesia', 'Kesejahteraan Rakyat sebagai Prasyarat Persatuan', 'Pemberdayaan Ekonomi Produktif', 'Inklusivitas Nasional'],
  ARRAY['kesejahteraan rakyat', 'ekonomi produktif', 'bantuan gerobak', 'modal usaha', 'persatuan bangsa', 'daya saing daerah', 'pemerataan rezeki'],
  ARRAY['kebijakan yang memperlebar jurang kesenjangan sosial', 'diskriminasi ekonomi terhadap pelaku usaha ultramikro', 'perpecahan persatuan antar-golongan masyarakat'],
  '{
    "PANGAN_PERTANIAN": "Bantuan sarana modern bagi nelayan dan petani; jaminan serapan hasil panen dengan harga menguntungkan petani; cold-storage terpadu untuk hasil laut nelayan.",
    "FISKAL_ANGGARAN": "Anggaran daerah yang dialokasikan langsung untuk peningkatan modal kerja produktif masyarakat bawah, bukan sekadar bantuan konsumtif sesaat.",
    "EKONOMI_KETENAGAKERJAAN": "Program masif bantuan sarana usaha (seperti gerobak/tenda usaha modern) dan pendampingan manajemen bisnis UMKM; kredit lunak tanpa bunga bagi pedagang kaki lima.",
    "LAYANAN_DASAR": "Layanan ambulans dan faskes gratis untuk keadaan darurat warga miskin; pelatihan keterampilan digital gratis bagi anak muda pencari kerja.",
    "INFRASTRUKTUR_RUANG": "Sentra kuliner dan kawasan UMKM tertata rapi di lokasi strategis kota; konektivitas desa nelayan menuju jalur distribusi kota.",
    "TATA_KELOLA_HUKUM": "Perlindungan hukum bagi pelaku usaha mikro dari pungutan liar; penegakan hukum berkeadilan yang melindungi hak-hak ekonomi rakyat kecil."
  }'::jsonb
),
-- 17. PPP
(
  'PPP', 'Partai Persatuan Pembangunan', 17, '#006600', '#FFFFFF',
  'Partai Persatuan Pembangunan berakar pada fusi partai-partai Islam dengan mengedepankan prinsip pembangunan berkeadilan dan akhlak karimah.',
  'ISLAMIS_PEMBANGUNAN',
  ARRAY['Prinsip Pembangunan Berkelanjutan Berbasis Islam', 'Kemaslahatan Ummat', 'Ukhuwah Islamiyah dan Wathaniyah', 'Keadilan dan Amar Maruf Nahi Munkar'],
  ARRAY['kemaslahatan umat', 'pembangunan berkeadilan', 'ekonomi syariah', 'madrasah', 'pesantren', 'moralitas publik', 'keberkahan rizki'],
  ARRAY['legalisasi aktivitas yang melanggar moralitas publik dan agama', 'pengabaian terhadap lembaga pendidikan keagamaan tradisional', 'eksploitasi ekonomi yang merugikan rakyat bawah'],
  '{
    "PANGAN_PERTANIAN": "Penyediaan benih dan pupuk halal-berkah bagi petani; revitalisasi lahan wakaf produktif untuk ketahanan pangan umat; perlindungan harga jual gabah petani.",
    "FISKAL_ANGGARAN": "Integrasi instrumen zakat, infaq, shadaqah dan wakaf (ZISWAF) dengan APBD untuk pengentasan kemiskinan; alokasi anggaran khusus afirmasi sarana madrasah diniyah.",
    "EKONOMI_KETENAGAKERJAAN": "Pengembangan industri halal daerah dan sertifikasi halal gratis bagi UMKM; pembiayaan mikro berbasis bagi hasil syariah bebas riba.",
    "LAYANAN_DASAR": "Bantuan operasional bagi pondok pesantren, guru mengaji, dan madrasah; beasiswa kader ulama dan cendekiawan muslim daerah ke universitas terkemuka.",
    "INFRASTRUKTUR_RUANG": "Pembangunan sarana sanitasi pesantren dan fasilitas air wudhu bersih pedesaan; perbaikan jalan penghubung sentra keagamaan dan pasar umat.",
    "TATA_KELOLA_HUKUM": "Penguatan regulasi pencegahan kemaksiatan, miras, dan judi online di daerah; penegakan hukum yang adil berlandaskan keadilan ilahiah dan konstitusi."
  }'::jsonb
),
-- 18. UMMAT
(
  'UMMAT', 'Partai Ummat', 24, '#000000', '#D4AF37',
  'Partai Ummat berasaskan Islam dengan semboyan melawan kezaliman dan menegakkan keadilan di seluruh bidang kehidupan berbangsa.',
  'ISLAMIS_KRITIS_KEADILAN',
  ARRAY['Melawan Kezaliman dan Menegakkan Keadilan', 'Tauhid Sosial', 'Kedaulatan Moral Rakyat', 'Amar Maruf Nahi Munkar'],
  ARRAY['lawan kezaliman', 'tegakkan keadilan', 'tauhid sosial', 'kedaulatan rakyat', 'keberpihakan mustadhafin', 'independensi moral'],
  ARRAY['pembiaran kezaliman ekonomi oligarki', 'pembatasan kebebasan kritis ulama dan cendekiawan', 'subordinasi hukum kepada pemilik modal'],
  '{
    "PANGAN_PERTANIAN": "Perlindungan petani dari cengkeraman kartel pupuk dan mafia impor pangan; pengembalian kedaulatan tanah adat dan tanah ulayat rakyat.",
    "FISKAL_ANGGARAN": "Penolakan terhadap utang ugal-ugalan yang membebani kedaulatan negara; audit forensik menyeluruh terhadap kebocoran APBD dan APBN.",
    "EKONOMI_KETENAGAKERJAAN": "Penghapusan skema perburuhan eksploitatif; dukungan permodalan mandiri bagi umat agar tidak terjerat pinjol dan rentenir.",
    "LAYANAN_DASAR": "Akses kesehatan adil tanpa penolakan rumah sakit bagi kaum papa; perlindungan kebebasan bersuara dan kebebasan akademik di perguruan tinggi.",
    "INFRASTRUKTUR_RUANG": "Penghentian proyek-proyek reklamasi dan penggusuran sepihak yang merugikan rakyat marjinal; tata ruang berkeadilan ekologis.",
    "TATA_KELOLA_HUKUM": "Penegakan hukum tanpa tebang pilih dan tanpa pandang bulu; perlawanan terhadap segala bentuk penyalahgunaan kekuasaan (abuse of power)."
  }'::jsonb
),
-- 19. INDEPENDEN / NON-PARTAI
(
  'NON_PARTAI', 'Non-Partai / Independen / DPD', 0, '#4B5563', '#10B981',
  'Profil perwakilan non-partisan, anggota DPD RI, atau tokoh independen yang berfokus murni pada advokasi aspirasi warga konstituen daerah.',
  'NEGARAWAN_INDEPENDEN',
  ARRAY['Pelayanan Publik Murni', 'Kepentingan Daerah di Atas Kepentingan Golongan', 'Meritokrasi Kebijakan', 'Pancasila dan Konstitusi'],
  ARRAY['kepentingan warga daerah', 'non-partisan', 'independen objektif', 'integritas pelayanan', 'solusi teknokratis', 'akuntabilitas langsung'],
  ARRAY['perilaku partisan sektarian', 'mengorbankan aspirasi konstituen demi agenda partai politik', 'retorika politik identitas sempit'],
  '{
    "PANGAN_PERTANIAN": "Perjuangan alokasi sarana produksi pertanian daerah langsung ke kelompok tani tanpa dipolitisasi; stabilitas rantai pasok pangan lokal.",
    "FISKAL_ANGGARAN": "Pengawasan ketat dan independen terhadap serapan APBD; memastikan setiap rupiah pajak warga kembali dalam bentuk pelayanan publik bermutu.",
    "EKONOMI_KETENAGAKERJAAN": "Pengembangan sentra ekonomi lokal dan kemudahan berusaha bagi pengusaha muda daerah; mediasi hubungan industrial yang netral dan adil.",
    "LAYANAN_DASAR": "Akses setara bagi seluruh warga tanpa memandang afiliasi politik; peningkatan standar pelayanan puskesmas dan sekolah negeri daerah.",
    "INFRASTRUKTUR_RUANG": "Prioritas perbaikan jalan daerah yang rusak parah dan lampu penerangan jalan umum; tata ruang yang melindungi ruang hidup warga.",
    "TATA_KELOLA_HUKUM": "Pengawasan tata kelola pemda yang bersih dari KKN; kanal pengaduan warga langsung dengan jaminan tindak lanjut cepat."
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  ballot_number = EXCLUDED.ballot_number,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  description = EXCLUDED.description,
  ideology_spectrum = EXCLUDED.ideology_spectrum,
  core_philosophies = EXCLUDED.core_philosophies,
  preferred_vocabulary = EXCLUDED.preferred_vocabulary,
  taboo_stances = EXCLUDED.taboo_stances,
  policy_doctrines = EXCLUDED.policy_doctrines,
  is_active = true,
  updated_at = NOW();

-- 3. Tampilkan verifikasi hasil seeding
SELECT code, name, ballot_number, ideology_spectrum, cardinality(core_philosophies) AS total_philosophies
FROM master_political_parties
ORDER BY ballot_number ASC;

