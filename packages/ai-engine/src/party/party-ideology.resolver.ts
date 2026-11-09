import { db, masterPoliticalParties, eq, or, sql } from '@polaris/database';
import { PolicySector } from '@polaris/shared-types';

export interface PartyIdeologyDirective {
  partyCode: string;
  partyName: string;
  ideologySpectrum: string;
  corePhilosophies: string[];
  sectorStance: string;
  preferredVocabulary: string[];
  tabooStances: string[];
  promptInstructions: string;
}

interface InternalPartyProfile {
  code: string;
  name: string;
  spectrum: string;
  philosophies: string[];
  vocabulary: string[];
  taboo: string[];
  doctrines: Partial<Record<PolicySector, string>>;
  defaultDoctrine: string;
}

const BUILTIN_PARTY_REGISTRY: Record<string, InternalPartyProfile> = {
  PDIP: {
    code: 'PDIP',
    name: 'Partai Demokrasi Indonesia Perjuangan (PDI-P)',
    spectrum: 'NASIONALIS_KERAKYATAN',
    philosophies: ['Pancasila 1 Juni 1945', 'Marhaenisme', 'Trisakti Bung Karno (Berdikari, Berdaulat, Berkepribadian)', 'Ekonomi Kerakyatan Gotong Royong'],
    vocabulary: ['gotong royong', 'berdikari', 'Trisakti', 'wong cilik', 'kedaulatan rakyat', 'keadilan sosial', 'pembebasan', 'nasionalisme kerakyatan'],
    taboo: ['mendorong privatisasi layanan air bersih dan pangan', 'mengusulkan pemotongan subsidi sosial untuk rakyat kecil', 'kebijakan neoliberal pasar bebas murni tanpa intervensi negara'],
    defaultDoctrine: 'Mengutamakan intervensi negara untuk melindungi masyarakat marjinal dan memastikan keadilan distributif bagi rakyat kecil (wong cilik).',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Kedaulatan pangan mutlak; menolak impor pangan saat panen raya lokal; memperjuangkan perlindungan lahan sawah abadi dan subsidi pupuk langsung kepada petani gurem.',
      [PolicySector.FISKAL_ANGGARAN]: 'Anggaran daerah (APBD) wajib pro-wong cilik; belanja perlindungan sosial dan pendidikan kerakyatan adalah hak konstitusional; pemangkasan pemborosan birokrasi.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Perlindungan maksimal hak-hak buruh dan pekerja upah harian; kepastian jaminan sosial tenaga kerja; penguatan ekonomi mikro dan koperasi gotong royong.',
      [PolicySector.LAYANAN_DASAR]: 'Pendidikan gratis berkualitas dan akses kesehatan menyeluruh tanpa diskriminasi kelas; penguatan puskesmas di kantong pemukiman padat warga.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Infrastruktur konektivitas desa-kota yang membuka urat nadi ekonomi rakyat; penataan ruang pro-pemukiman layak warga marjinal.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Penegakan hukum tanpa pandang bulu untuk keadilan rakyat miskin; pemberantasan mafia tanah dan mafia hukum.',
      [PolicySector.LINGKUNGAN_BENCANA]: 'Keadilan ekologis; perlindungan ruang hidup masyarakat adat dan pesisir dari eksploitasi perusak alam; mitigasi bencana kerakyatan.',
    },
  },
  GOLKAR: {
    code: 'GOLKAR',
    name: 'Partai Golongan Karya (Golkar)',
    spectrum: 'TEKNOKRATIS_PEMBANGUNAN',
    philosophies: ['Karya-Kekaryaan', 'Doktrin Karya Pembangunan', 'Sentrisme Teknokratis', 'Stabilitas Nasional dan Pertumbuhan Berkelanjutan'],
    vocabulary: ['karya nyata', 'stabilitas pembangunan', 'iklim investasi', 'akselerasi ekonomi', 'efisiensi birokrasi', 'kemitraan strategis', 'kapasitas fiskal', 'daya saing bangsa'],
    taboo: ['retorika konfrontatif terhadap dunia usaha dan investasi', 'sikap pesimisme terhadap pertumbuhan ekonomi', 'kebijakan proteksionisme berlebihan yang mematikan persaingan usaha'],
    defaultDoctrine: 'Menekankan stabilitas makro, pembangunan infrastruktur terukur, efisiensi birokrasi, dan kemitraan strategis pemerintah dengan dunia usaha.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Modernisasi agrobisnis berbasis mekanisasi dan teknologi digital; kemitraan korporasi pangan dan kelompok tani daerah; efisiensi rantai pasok pangan.',
      [PolicySector.FISKAL_ANGGARAN]: 'Manajemen fiskal yang disiplin dan prudent; perluasan basis PAD melalui kemudahan investasi; rasionalisasi belanja operasional menuju belanja modal produktif.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Penciptaan lapangan kerja masif melalui kemudahan izin usaha; revitalisasi pendidikan vokasi link-and-match dengan industri modern.',
      [PolicySector.LAYANAN_DASAR]: 'Efisiensi pengelolaan sistem jaminan sosial nasional; kemitraan pemerintah-swasta (PPP) dalam penyediaan rumah sakit daerah dan fasilitas pendidikan.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Percepatan Proyek Strategis Nasional (PSN) dan jalan logistik sentra produksi; tata ruang terpadu dan kawasan ekonomi khusus (KEK) daerah.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Kepastian hukum berusaha untuk menarik investor domestik dan global; deregulasi perizinan dan digitalisasi birokrasi satu pintu.',
      [PolicySector.LINGKUNGAN_BENCANA]: 'Pembangunan berkelanjutan berbasis ekonomi hijau (green economy); transisi energi berkeadilan tanpa mengorbankan stabilitas pasokan listrik industri.',
    },
  },
  GERINDRA: {
    code: 'GERINDRA',
    name: 'Partai Gerakan Indonesia Raya (Gerindra)',
    spectrum: 'NASIONALIS_KEDAULATAN',
    philosophies: ['Nasionalisme Kerakyatan', 'Kedaulatan Pangan, Energi dan Air', 'Ekonomi Kerakyatan Pasal 33 UUD 1945', 'Pertahanan dan Integritas Bangsa'],
    vocabulary: ['swasembada pangan', 'ketahanan nasional', 'kebocoran anggaran', 'berdiri di atas kaki sendiri', 'kedaulatan bangsa', 'generasi emas', 'kesejahteraan rakyat'],
    taboo: ['ketergantungan kronis pada impor bahan pangan dasar', 'kompromi terhadap kebocoran anggaran publik', 'melemahkan kedaulatan industri strategis nasional'],
    defaultDoctrine: 'Menegakkan kedaulatan pangan, energi, dan air serta memerangi kebocoran anggaran negara untuk dialihkan ke pemenuhan gizi dan modal ekonomi rakyat.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Swasembada pangan mutlak dan modernisasi irigasi waduk desa; penguatan lumbung pangan daerah (food estate) terpadu; kemandirian bibit dan pupuk lokal.',
      [PolicySector.FISKAL_ANGGARAN]: 'Pemberantasan kebocoran anggaran secara tegas; realokasi belanja seremonial dinas langsung untuk perbaikan gizi anak, makan bergizi, dan ketahanan sosial.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Revitalisasi Koperasi Unit Desa (KUD) dan permodalan pedagang pasar; hilirisasi komoditas mineral dan pertanian demi penyerapan jutaan tenaga kerja.',
      [PolicySector.LAYANAN_DASAR]: 'Investasi gizi dan kesehatan ibu-anak memutus stunting; peningkatan kesejahteraan guru, tenaga medis daerah terpencil, dan beasiswa kedokteran.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Infrastruktur logistik strategis, jaringan irigasi persawahan rakyat, dan pelabuhan sentra perikanan; pertahanan ruang pesisir dan wilayah terluar.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Penegakan hukum tanpa pandang bulu terhadap korupsi dan penyelundupan SDA; integritas aparat penegak hukum dan kedaulatan peradilan.',
    },
  },
  PKS: {
    code: 'PKS',
    name: 'Partai Keadilan Sejahtera (PKS)',
    spectrum: 'ISLAMIS_MODERAT_KEADILAN',
    philosophies: ['Islam Rahmatan lil Alamin', 'Keadilan Sosial dan Kesejahteraan', 'Integritas dan Etika Pelayanan Publik', 'Ketahanan Keluarga'],
    vocabulary: ['keadilan sosial', 'kemaslahatan umat', 'amanah anggaran', 'keberpihakan pada rakyat', 'pengawasan moral', 'ketahanan keluarga', 'transparansi publik'],
    taboo: ['pemborosan pos anggaran seremonial dan fasilitas pejabat', 'kebijakan yang menggerus institusi keluarga', 'kebijakan diskriminatif dan penindasan kaum mustadhafin'],
    defaultDoctrine: 'Memperjuangkan keadilan sosial, transparansi audit anggaran yang amanah, penguatan ketahanan keluarga, dan advokasi kaum rentan (mustadhafin).',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Keadilan distribusi pupuk dan transparansi kuota petani; perlindungan lahan sawah lestari dari alih fungsi liar; advokasi buruh tani dan petani plasma.',
      [PolicySector.FISKAL_ANGGARAN]: 'Disiplin anggaran anti-pemborosan; pengawasan rasio utang; alokasi belanja yang memprioritaskan bantuan langsung keluarga prasejahtera dan pembebasan pajak pekerja awal.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Pemberdayaan wirausaha berbasis keluarga dan UMKM; penolakan klausul ketenagakerjaan yang merugikan kepastian kerja buruh; perlindungan etis jam kerja perempuan.',
      [PolicySector.LAYANAN_DASAR]: 'Pendidikan karakter terpadu bebas biaya; penguatan puskesmas ramah anak dan lansia; posyandu sebagai garda depan ketahanan kesehatan keluarga.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Infrastruktur dasar air bersih dan sanitasi di pemukiman warga; pemerataan jalan desa poros pertanian; penolakan proyek mercusuar nir-manfaat.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Pengawasan etika penyelenggara negara dan transparansi rekrutmen birokrasi; penolakan gratifikasi serta independensi audit anti-korupsi.',
    },
  },
  PKB: {
    code: 'PKB',
    name: 'Partai Kebangkitan Bangsa (PKB)',
    spectrum: 'ISLAMIS_MODERAT_KERAKYATAN',
    philosophies: ['Ahlussunnah wal Jamaah an-Nahdliyyah', 'Kemaslahatan Ummah (Mabadi Khaira Ummah)', 'Pluralisme Kebangsaan Gus Dur', 'Pemberdayaan Masyarakat Desa dan Pesantren'],
    vocabulary: ['kemaslahatan', 'ekonomi kerakyatan', 'pesantren', 'santripreneur', 'keadilan distributif', 'desa mandiri', 'wong cilik', 'pluralisme toleran'],
    taboo: ['pengabaian peran pondok pesantren dan pendidikan keagamaan', 'pemusatan perputaran ekonomi hanya di pusat kota', 'intoleransi dan ancaman terhadap kerukunan beragama'],
    defaultDoctrine: 'Mengedepankan kemaslahatan umat, penguatan kemandirian desa, afirmasi pendidikan keagamaan/pesantren, dan pembelaan petani pedesaan.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Kebangkitan petani desa; penyediaan pupuk bersubsidi mudah dan murah langsung ke pintu petani; perbaikan irigasi desa berbasis swadaya.',
      [PolicySector.FISKAL_ANGGARAN]: 'Peningkatan dana desa dan dana abadi pesantren; alokasi anggaran daerah menitikberatkan pada wilayah pinggiran dan komunitas pesantren.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Inkubasi santripreneur dan ekonomi syariah inklusif; perlindungan hukum terpadu bagi pekerja migran Indonesia (PMI); permodalan murah pedagang mikro.',
      [PolicySector.LAYANAN_DASAR]: 'Kesetaraan fasilitas madrasah dan sekolah umum; beasiswa santri dan pemuda berprestasi; jaminan kesehatan gratis bagi guru ngaji daerah.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Pembangunan jembatan dan jalan poros desa-desa terpencil; konektivitas sentra produksi pangan pedesaan menuju pasar kabupaten.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Menjaga kebhinekaan dan kerukunan umat beragama; perlindungan hak-hak masyarakat adat dan komunitas lokal pedesaan.',
    },
  },
  NASDEM: {
    code: 'NASDEM',
    name: 'Partai NasDem',
    spectrum: 'NASIONALIS_DEMOKRATIS_RESTORASI',
    philosophies: ['Restorasi Indonesia', 'Nasionalis Demokratis', 'Politik Tanpa Mahar', 'Gerakan Perubahan Tata Kelola Bangsa'],
    vocabulary: ['restorasi', 'gerakan perubahan', 'tata kelola bersih', 'politik tanpa mahar', 'inovasi daerah', 'modernisasi pertanian', 'kepastian investasi'],
    taboo: ['mempertahankan status-quo birokrasi korup dan lambat', 'kebijakan tumpang tindih perizinan', 'politik transaksional dalam pelayanan publik'],
    defaultDoctrine: 'Mengusung gerakan restorasi dan perubahan tata kelola pemerintahan yang transparan, modernisasi sektor riil, dan kepastian hukum berusaha.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Restorasi tata kelola pangan; korporatisasi petani lokal agar memiliki daya tawar tinggi; modernisasi alat tangkap nelayan dan teknologi pascapanen.',
      [PolicySector.FISKAL_ANGGARAN]: 'Anggaran berbasis kinerja nyata (outcome-based budgeting); efisiensi pos seremonial dinas untuk dialihkan ke belanja modal produktif.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Ekosistem kewirausahaan pemuda berbasis teknologi; reformasi ketenagakerjaan yang menyeimbangkan fleksibilitas usaha dan kepastian perlindungan pekerja.',
      [PolicySector.LAYANAN_DASAR]: 'Digitalisasi sistem rujukan kesehatan daerah; peningkatan mutu guru berbasis sertifikasi kompetensi transparan tanpa pungli.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Infrastruktur penunjang pariwisata daerah dan sentra logistik komoditas unggulan; tata ruang ramah lingkungan.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Reformasi peradilan dan kepolisian daerah; meritokrasi lelang jabatan pimpinan tinggi OPD daerah secara terbuka.',
    },
  },
  PAN: {
    code: 'PAN',
    name: 'Partai Amanat Nasional (PAN)',
    spectrum: 'REFORMIS_MODERAT',
    philosophies: ['Amanat Rakyat', 'Islam Kemajuan dan Moderat', 'Semangat Reformasi Berkelanjutan', 'Kewirausahaan dan Persaingan Adil'],
    vocabulary: ['bantu rakyat', 'amanat reformasi', 'kewirausahaan', 'UMKM naik kelas', 'persaingan sehat', 'ekonomi terbuka', 'kemajuan daerah'],
    taboo: ['monopoli pasar yang menindas pedagang kecil', 'sikap pasif terhadap kemandirian usaha pemuda', 'birokrasi yang mematikan inisiatif inovasi swasta'],
    defaultDoctrine: 'Mendorong ekonomi terbuka berbasis kewirausahaan, pembelaan UMKM naik kelas, persaingan usaha yang adil, dan pemerintahan yang bersih.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Stabilitas harga kebutuhan pokok melalui operasi pasar transparan; bantuan bibit unggul dan pupuk tepat sasaran bagi kelompok tani produktif.',
      [PolicySector.FISKAL_ANGGARAN]: 'Insentif fiskal dan penghapusan retribusi memberatkan bagi pelaku UMKM pemula; optimalisasi aset daerah non-produktif menghasilkan PAD.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Akselerasi digitalisasi UMKM daerah; kredit usaha rakyat (KUR) bunga rendah tanpa agunan memberatkan; pelatihan kewirausahaan pemuda.',
      [PolicySector.LAYANAN_DASAR]: 'Fasilitasi beasiswa sains dan teknologi bagi pemuda daerah; peningkatan mutu layanan RSUD dan integrasi BPJS daerah tanpa antrean.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Pembangunan pasar tradisional modern yang higienis; perbaikan akses jalan sentra kerajinan dan industri rumahan pedesaan.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Tata kelola pemerintahan daerah yang bersih, melayani, dan bebas pungli; SPBE berbasis elektronik transparan.',
    },
  },
  DEMOKRAT: {
    code: 'DEMOKRAT',
    name: 'Partai Demokrat',
    spectrum: 'NASIONALIS_RELIGIUS',
    philosophies: ['Nasionalis-Religius', 'Pertumbuhan Berkeadilan (Growth with Equity)', 'Empat Pilar Kebijakan: Pro-Poor, Pro-Job, Pro-Growth, Pro-Environment'],
    vocabulary: ['pertumbuhan berkeadilan', 'pro-poor', 'pro-job', 'pro-growth', 'pro-environment', 'suara rakyat', 'solusi konkret', 'kelas menengah'],
    taboo: ['mengorbankan lingkungan hidup demi eksploitasi sesaat', 'pengabaian terhadap daya beli kelas menengah', 'pelemahan institusi demokrasi dan supremasi hukum'],
    defaultDoctrine: 'Mengedepankan pertumbuhan ekonomi yang berkeadilan (growth with equity), memelihara daya beli kelas menengah dan bawah, serta supremasi hukum.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Bantuan langsung sarana produksi tani tepat waktu; stabilisasi harga pangan dan proteksi margin keuntungan petani; penolakan impor pangan berlebihan.',
      [PolicySector.FISKAL_ANGGARAN]: 'Manajemen anggaran seimbang dan disiplin fiskal tinggi; menjaga daya beli masyarakat melalui subsidi tepat sasaran; pengendalian utang daerah.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Penciptaan lapangan kerja padat karya seluas-luasnya; insentif industri yang merekrut tenaga kerja lokal; perlindungan daya beli pekerja kelas menengah.',
      [PolicySector.LAYANAN_DASAR]: 'Program perlindungan sosial komprehensif bagi keluarga rentan; beasiswa pendidikan berprestasi; peningkatan sarana puskesmas kecamatan.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Pembangunan infrastruktur terencana yang berdampak langsung bagi rakyat tanpa beban utang liar; kelestarian lingkungan hidup dan hutan resapan.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Supremasi hukum, checks and balances di parlemen, dan kebebasan bersuara bagi masyarakat sipil; pencegahan penyalahgunaan kekuasaan aparatur.',
    },
  },
  PSI: {
    code: 'PSI',
    name: 'Partai Solidaritas Indonesia (PSI)',
    spectrum: 'PROGRESIF_REFORMIS',
    philosophies: ['Solidaritas Sosial', 'Anti-Korupsi dan Anti-Intoleransi', 'Transparansi Radikal', 'Meritokrasi dan Kesetaraan Kaum Muda'],
    vocabulary: ['transparansi anggaran', 'anti-korupsi', 'anti-intoleransi', 'kaum muda', 'BPJS gratis', 'meritokrasi', 'digitalisasi birokrasi', 'kesetaraan hak'],
    taboo: ['kebijakan diskriminatif berbasis SARA', 'anggaran siluman atau rapat gelap tanpa notula publik', 'kompromi terhadap tindakan korupsi dan kolusi birokrasi'],
    defaultDoctrine: 'Menegakkan transparansi radikal anggaran publik, pemberantasan korupsi tanpa kompromi, toleransi keragaman, dan afirmasi bagi generasi muda.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Digitalisasi rantai pasok pangan memotong tengkulak; transparansi online data penerima pupuk subsidi; regenerasi petani muda melalui smart-farming.',
      [PolicySector.FISKAL_ANGGARAN]: 'Keterbukaan anggaran APBD berbasis online (e-budgeting) terbuka untuk warga; penolakan pemborosan pos studi banding fiktif dinas.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Ekosistem kerja fleksibel bagi pekerja gig dan ekonomi kreatif; upah setara gender; penghapusan diskriminasi batas usia kerja.',
      [PolicySector.LAYANAN_DASAR]: 'Layanan BPJS Kesehatan gratis tanpa kelas dan tanpa antrean; digitalisasi rekam medis terpadu; fasilitas kesehatan mental terjangkau.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Transportasi publik terintegrasi, murah, aman dan ramah disabilitas; ruang terbuka hijau (RTH) dan fasilitas kreatif pemuda.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Layanan aduan pungli online respon cepat; penegakan hukum tegas ujaran intoleran; transparansi legislasi via live streaming sidang dewan.',
    },
  },
  PPP: {
    code: 'PPP',
    name: 'Partai Persatuan Pembangunan (PPP)',
    spectrum: 'ISLAMIS_PEMBANGUNAN',
    philosophies: ['Pembangunan Berkelanjutan Berbasis Islam', 'Kemaslahatan Ummat', 'Ukhuwah Islamiyah dan Wathaniyah', 'Keadilan dan Moralitas Publik'],
    vocabulary: ['kemaslahatan umat', 'pembangunan berkeadilan', 'ekonomi syariah', 'madrasah', 'pesantren', 'moralitas publik', 'keberkahan rizki'],
    taboo: ['legalisasi aktivitas yang melanggar moralitas publik dan agama', 'pengabaian terhadap lembaga pendidikan keagamaan tradisional', 'eksploitasi ekonomi yang merugikan rakyat bawah'],
    defaultDoctrine: 'Mengintegrasikan nilai-nilai moralitas keagamaan dengan pembangunan ekonomi berkelanjutan dan pemberdayaan pesantren serta umat.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Penyediaan benih dan pupuk halal-berkah bagi petani; revitalisasi lahan wakaf produktif untuk ketahanan pangan; perlindungan harga jual gabah.',
      [PolicySector.FISKAL_ANGGARAN]: 'Integrasi instrumen ZISWAF dengan APBD untuk pengentasan kemiskinan; alokasi anggaran khusus afirmasi sarana madrasah diniyah.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Pengembangan industri halal daerah dan sertifikasi halal gratis bagi UMKM; pembiayaan mikro berbasis bagi hasil syariah.',
      [PolicySector.LAYANAN_DASAR]: 'Bantuan operasional bagi pondok pesantren, guru mengaji, dan madrasah; beasiswa kader ulama dan cendekiawan muslim daerah.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Pembangunan sarana sanitasi pesantren dan air bersih pedesaan; perbaikan jalan penghubung sentra keagamaan dan pasar umat.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Penguatan regulasi pencegahan kemaksiatan, miras, dan judi online di daerah; penegakan hukum berkeadilan dan bermoral.',
    },
  },
  PERINDO: {
    code: 'PERINDO',
    name: 'Partai Persatuan Indonesia (Perindo)',
    spectrum: 'NASIONALIS_KESEJAHTERAAN',
    philosophies: ['Persatuan Indonesia', 'Kesejahteraan Rakyat sebagai Prasyarat Persatuan', 'Pemberdayaan Ekonomi Produktif', 'Inklusivitas Nasional'],
    vocabulary: ['kesejahteraan rakyat', 'ekonomi produktif', 'bantuan gerobak', 'modal usaha', 'persatuan bangsa', 'daya saing daerah', 'pemerataan rezeki'],
    taboo: ['kebijakan yang memperlebar jurang kesenjangan sosial', 'diskriminasi ekonomi terhadap pelaku usaha ultramikro', 'perpecahan persatuan antar-golongan masyarakat'],
    defaultDoctrine: 'Menitikberatkan pada peningkatan langsung kapasitas permodalan dan sarana produktif masyarakat bawah demi pemerataan kesejahteraan.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Bantuan sarana modern bagi nelayan dan petani; jaminan serapan hasil panen dengan harga menguntungkan petani; cold-storage terpadu hasil laut.',
      [PolicySector.FISKAL_ANGGARAN]: 'Anggaran daerah dialokasikan langsung untuk peningkatan modal kerja produktif masyarakat bawah, bukan sekadar bantuan konsumtif sesaat.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Program masif bantuan sarana usaha dan pendampingan manajemen bisnis UMKM; kredit lunak tanpa bunga bagi pedagang kaki lima.',
      [PolicySector.LAYANAN_DASAR]: 'Layanan ambulans dan faskes darurat gratis untuk warga miskin; pelatihan keterampilan digital gratis bagi pencari kerja muda.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Sentra kuliner dan kawasan UMKM tertata rapi di lokasi strategis kota; konektivitas desa nelayan menuju jalur distribusi kota.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Perlindungan hukum bagi pelaku usaha mikro dari pungli; penegakan hukum yang melindungi hak-hak ekonomi rakyat kecil.',
    },
  },
  INDEPENDEN: {
    code: 'INDEPENDEN',
    name: 'Non-Partai / Independen / DPD RI',
    spectrum: 'TEKNOKRATIS_KONSTITUSIONAL_NETRAL',
    philosophies: ['Mandat Konstitusi UUD 1945', 'Otonomi Daerah dan Keseimbangan Pusat-Daerah', 'Teknokrasi Kebijakan Berbasis Bukti Ilmiah', 'Non-Partisan untuk Kepentingan Seluruh Rakyat Daerah'],
    vocabulary: ['kepentingan daerah', 'otonomi daerah', 'mandat konstitusi', 'kesejahteraan daerah', 'pengawasan objektif', 'keseimbangan fiskal', 'kebijakan berbasis bukti'],
    taboo: ['memihak kepentingan sempit fraksi politik tertentu', 'mengorbankan kepentingan daerah demi kompromi koalisi partisan pusat'],
    defaultDoctrine: 'Mengedepankan objektivitas mandat konstitusi, keseimbangan fiskal pusat-daerah, pengawasan teknokratis murni, dan perlindungan kepentingan warga daerah.',
    doctrines: {
      [PolicySector.PANGAN_PERTANIAN]: 'Optimasi potensi agraria daerah tanpa sekat fraksi; penguatan regulasi Perda perlindungan petani lokal; kedaulatan pangan berbasis komoditas unggulan daerah.',
      [PolicySector.FISKAL_ANGGARAN]: 'Keseimbangan Dana Bagi Hasil (DBH) pusat-daerah; kemandirian fiskal PAD; audit objektif efisiensi belanja pemerintah daerah.',
      [PolicySector.EKONOMI_KETENAGAKERJAAN]: 'Perlindungan tenaga kerja lokal daerah; penyerapan putra daerah dalam proyek strategis; penguatan ekosistem kewirausahaan lokal.',
      [PolicySector.LAYANAN_DASAR]: 'Standar Pelayanan Minimal (SPM) pendidikan dan kesehatan di daerah 3T (terdepan, terluar, tertinggal); pemerataan faskes berkualitas.',
      [PolicySector.INFRASTRUKTUR_RUANG]: 'Pemerataan infrastruktur lintas kabupaten/kota; tata ruang wilayah berbasis kelestarian ekologi daerah dan mitigasi bencana.',
      [PolicySector.TATA_KELOLA_HUKUM]: 'Harmonisasi Perda dengan undang-undang nasional; kepastian regulasi daerah bebas tumpang tindih; pengawasan independen parlemen daerah.',
    },
  },
};

export class PartyIdeologyResolver {
  /**
   * Menentukan sektor kebijakan dari judul topik jika tidak diberikan secara eksplisit
   */
  public static inferPolicySector(topicText: string): PolicySector {
    const text = (topicText || '').toLowerCase();
    if (text.includes('pangan') || text.includes('pupuk') || text.includes('tani') || text.includes('sawah') || text.includes('nelayan') || text.includes('panen')) {
      return PolicySector.PANGAN_PERTANIAN;
    }
    if (text.includes('anggaran') || text.includes('apbd') || text.includes('apbn') || text.includes('fiskal') || text.includes('pajak') || text.includes('belanja')) {
      return PolicySector.FISKAL_ANGGARAN;
    }
    if (text.includes('jalan') || text.includes('jembatan') || text.includes('infrastruktur') || text.includes('pupr') || text.includes('tata ruang') || text.includes('irigasi')) {
      return PolicySector.INFRASTRUKTUR_RUANG;
    }
    if (text.includes('buruh') || text.includes('pekerja') || text.includes('umkm') || text.includes('kerja') || text.includes('upah') || text.includes('wirausaha')) {
      return PolicySector.EKONOMI_KETENAGAKERJAAN;
    }
    if (text.includes('sekolah') || text.includes('pendidikan') || text.includes('kesehatan') || text.includes('bpjs') || text.includes('puskesmas') || text.includes('rsud') || text.includes('guru')) {
      return PolicySector.LAYANAN_DASAR;
    }
    if (text.includes('bansos') || text.includes('miskin') || text.includes('kemiskinan') || text.includes('stunting') || text.includes('bantuan sosial')) {
      return PolicySector.SOSIAL_KEMISKINAN;
    }
    if (text.includes('hukum') || text.includes('perda') || text.includes('korupsi') || text.includes('pungli') || text.includes('polisi') || text.includes('birokrasi') || text.includes('pelayanan publik')) {
      return PolicySector.TATA_KELOLA_HUKUM;
    }
    if (text.includes('banjir') || text.includes('bencana') || text.includes('sampah') || text.includes('lingkungan') || text.includes('hutan') || text.includes('polusi')) {
      return PolicySector.LINGKUNGAN_BENCANA;
    }
    return PolicySector.PANGAN_PERTANIAN;
  }

  /**
   * Mengambil arahan ideologi partai yang disesuaikan dengan topik artikel
   */
  public static async resolveDirective(params: {
    partyAffiliation?: string | null;
    topic: string;
    policySector?: PolicySector;
  }): Promise<PartyIdeologyDirective> {
    const rawParty = (params.partyAffiliation || '').trim().toUpperCase();
    const sector = params.policySector || this.inferPolicySector(params.topic);

    // 1. Normalisasi kode partai
    let matchedCode = 'INDEPENDEN';
    if (rawParty) {
      const clean = rawParty.replace(/[^A-Z]/g, '');
      if (clean.includes('PDIP') || clean.includes('PERJUANGAN')) matchedCode = 'PDIP';
      else if (clean.includes('GOLKAR') || clean.includes('GOLONGANKARYA')) matchedCode = 'GOLKAR';
      else if (clean.includes('GERINDRA')) matchedCode = 'GERINDRA';
      else if (clean.includes('PKS') || clean.includes('SEJAHTERA')) matchedCode = 'PKS';
      else if (clean.includes('PKB') || clean.includes('BANGSA')) matchedCode = 'PKB';
      else if (clean.includes('NASDEM')) matchedCode = 'NASDEM';
      else if (clean.includes('PAN') || clean.includes('AMANAT')) matchedCode = 'PAN';
      else if (clean.includes('DEMOKRAT')) matchedCode = 'DEMOKRAT';
      else if (clean.includes('PSI') || clean.includes('SOLIDARITAS')) matchedCode = 'PSI';
      else if (clean.includes('PPP') || clean.includes('PEMBANGUNAN')) matchedCode = 'PPP';
      else if (clean.includes('PERINDO')) matchedCode = 'PERINDO';
    }

    const fallbackProfile = BUILTIN_PARTY_REGISTRY[matchedCode] || BUILTIN_PARTY_REGISTRY.INDEPENDEN;

    // 2. Query master_political_parties di DB jika ada data doktrin kustom yang disetting admin
    let dbProfile: {
      name?: string;
      ideologySpectrum?: string;
      corePhilosophies?: string[];
      policyDoctrines?: Record<string, string>;
      preferredVocabulary?: string[];
      tabooStances?: string[];
    } | null = null;

    try {
      if (matchedCode !== 'INDEPENDEN') {
        const [row] = await db
          .select({
            name: masterPoliticalParties.name,
            ideologySpectrum: masterPoliticalParties.ideologySpectrum,
            corePhilosophies: masterPoliticalParties.corePhilosophies,
            policyDoctrines: masterPoliticalParties.policyDoctrines,
            preferredVocabulary: masterPoliticalParties.preferredVocabulary,
            tabooStances: masterPoliticalParties.tabooStances,
          })
          .from(masterPoliticalParties)
          .where(
            or(
              eq(masterPoliticalParties.code, matchedCode),
              sql`UPPER(REPLACE(${masterPoliticalParties.code}, '-', '')) = ${matchedCode}`
            )
          )
          .limit(1);

        if (row) dbProfile = row;
      }
    } catch {
      // Abaikan jika DB belum dimigrasi atau offline, gunakan builtin registry
    }

    const partyName = dbProfile?.name || fallbackProfile.name;
    const spectrum = dbProfile?.ideologySpectrum || fallbackProfile.spectrum;
    const corePhilosophies = (dbProfile?.corePhilosophies && dbProfile.corePhilosophies.length > 0)
      ? dbProfile.corePhilosophies
      : fallbackProfile.philosophies;

    const doctrines = (dbProfile?.policyDoctrines && typeof dbProfile.policyDoctrines === 'object')
      ? (dbProfile.policyDoctrines as Record<string, string>)
      : (fallbackProfile.doctrines as Record<string, string>);

    const sectorStance = doctrines[sector] || fallbackProfile.defaultDoctrine;

    const preferredVocabulary = (dbProfile?.preferredVocabulary && dbProfile.preferredVocabulary.length > 0)
      ? dbProfile.preferredVocabulary
      : fallbackProfile.vocabulary;

    const tabooStances = (dbProfile?.tabooStances && dbProfile.tabooStances.length > 0)
      ? dbProfile.tabooStances
      : fallbackProfile.taboo;

    // 3. Susun arahan prompt sistem terstruktur
    const promptInstructions = `HALUAN IDEOLOGI & SIKAP PARTAI (${partyName} - ${spectrum}):
- Falsafah Dasar: ${corePhilosophies.join(', ')}.
- Sikap Khusus Sektor ${sector}: ${sectorStance}
- Diksi Pilihan (Gunakan secara alami): ${preferredVocabulary.slice(0, 6).map((v) => `"${v}"`).join(', ')}.
- Pantangan Sikap/Narasi (DILARANG KERAS): ${tabooStances.map((t) => `jangan pernah ${t}`).join('; ')}.
- Karakter Tulisan: Tulisan WAJIB mencerminkan keberpihakan ideologi ${partyName} di atas secara substantif dan elegan, namun tetap berbobot kenegaraan/kebijakan publik profesional tanpa terdengar seperti pamflet kampanye murahan.`;

    return {
      partyCode: matchedCode,
      partyName,
      ideologySpectrum: spectrum,
      corePhilosophies,
      sectorStance,
      preferredVocabulary,
      tabooStances,
      promptInstructions,
    };
  }
}

