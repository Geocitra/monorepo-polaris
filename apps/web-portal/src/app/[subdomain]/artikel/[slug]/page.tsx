import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchPortalData, getNormalizedApiUrl } from '@/lib/api';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ArrowLeft, Calendar, Clock, Sparkles, Building2, UserCheck, BookOpen, Download, ChevronRight } from 'lucide-react';
import { MarkdownContent } from '@/components/article/markdown-content';
import { CitizenComments } from '@/components/article/citizen-comments';
import { ArticleReaderToolbar } from '@/components/article/ArticleReaderToolbar';
import { NewsletterSubscriptionBox } from '@/components/sections/NewsletterSubscriptionBox';
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { BoldTypographyShell, BoldArtikelDetailClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernArtikelDetailClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowArtikelDetailClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialArtikelDetailClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmArtikelDetailClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioArtikelDetailClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldArtikelDetailClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechArtikelDetailClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioArtikelDetailClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioArtikelDetailClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeArtikelDetailClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateArtikelDetailClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialArtikelDetailClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirArtikelDetailClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitArtikelDetailClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialArtikelDetailClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxArtikelDetailClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialArtikelDetailClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeArtikelDetailClient } from '@/components/templates/creatix-lime';
import { ParichayAmberArtikelDetailClient } from '@/components/templates/parichay-amber';
import { OrixVioletArtikelDetailClient } from '@/components/templates/orix-violet';
import { AgethaRubyArtikelDetailClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanArtikelDetailClient } from '@/components/templates/washoski-cyan';
import { ArikNoirArtikelDetailClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldArtikelDetailClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraArtikelDetailClient } from '@/components/templates/laila-sakura';
import { NexoraVioletArtikelDetailClient } from '@/components/templates/nexora-violet';
import { XenonMintArtikelDetailClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyArtikelDetailClient } from '@/components/templates/tiara-burgundy';


function getFallbackArticle(slug: string) {
  const fallbacks: Record<string, any> = {
    'undang-undang-cipta-kerja-dampak-bagi-umkm': {
      id: 'ref-art-1',
      title: 'Undang-Undang Cipta Kerja: Dampak bagi UMKM & Pemberdayaan Usaha Rakyat',
      slug: 'undang-undang-cipta-kerja-dampak-bagi-umkm',
      category: 'Ekonomi & UMKM',
      issueCategory: 'Ekonomi & UMKM',
      publishedAt: '2026-09-01T08:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/ref-article-1.jpg',
      posterUrl: '/images/ref-article-1.jpg',
      thumbnailUrl: '/images/ref-article-1.jpg',
      excerpt:
        'Penyederhanaan perizinan dan kemudahan akses pembiayaan perbankan harus diimbangi dengan proteksi pasar domestik agar pelaku usaha mikro daerah pemilihan mampu bersaing di era rantai pasok modern.',
      body: `## Latar Belakang Reformasi Perizinan Usaha

Undang-Undang Cipta Kerja lahir dengan semangat debirokratisasi dan percepatan perizinan usaha di Indonesia. Bagi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM), aturan ini menawarkan satu terobosan penting: perizinan tunggal melalui pendekatan berbasis risiko (Online Single Submission/OSS).

Namun, dalam kunjungan kerja dan serap aspirasi konstituen di daerah pemilihan, kami menemukan kenyataan bahwa literasi digital dan akses pendampingan perizinan di tingkat kecamatan masih timpang. Banyak pengrajin dan pedagang kecil yang belum mengetahui bagaimana mengurus Nomor Induk Berusaha (NIB) secara mandiri.

> "Kebijakan perizinan yang canggih tidak akan ada artinya jika pelaku UMKM di desa dan pasar tradisional tidak mendapatkan asistensi nyata dari dinas terkait."

## Tiga Pokok Rekomendasi Kebijakan Parlemen

Dalam rangka memastikan regulasi ini benar-benar berdampak positif bagi ekonomi rakyat, kami di komisi terkait DPR RI memperjuangkan tiga klausul strategis:

- **Alokasi 40% Pengadaan Barang & Jasa Pemerintah**: Memastikan kementerian dan pemerintah daerah memprioritaskan produk-produk UMKM lokal dalam setiap proyek pengadaan publik.
- **Sertifikasi Halal Gratis & Tanpa Pungli**: Mendorong percepatan fasilitas sertifikasi halal gratis (self-declare) bagi usaha kuliner dan olahan pangan rumahan.
- **Perluasan Kuota KUR Mikro Tanpa Agunan**: Menjamin bank-bank BUMN mempermudah penyaluran Kredit Usaha Rakyat dengan bunga rendah tanpa syarat sertifikat tanah bagi peminjam di bawah Rp 50 juta.

### Komitmen Pengawasan Lapangan

Sebagai wakil rakyat, kami berkomitmen untuk terus mengawal pelaksanaan aturan turunan ini secara berkala. Ruang pengaduan di Rumah Aspirasi selalu terbuka bagi para pelaku UMKM yang mengalami hambatan perizinan, intimidasi pungutan liar, atau kesulitan mengakses permodalan perbankan.`,
    },
    'program-pembangunan-infrastruktur': {
      id: 'ref-art-2',
      title: 'Program Pembangunan Infrastruktur: Mengawal Konektivitas Antardesa di Dapil',
      slug: 'program-pembangunan-infrastruktur',
      category: 'Infrastruktur',
      issueCategory: 'Infrastruktur',
      publishedAt: '2026-08-30T09:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/ref-article-2.jpg',
      posterUrl: '/images/ref-article-2.jpg',
      thumbnailUrl: '/images/ref-article-2.jpg',
      excerpt:
        'Konektivitas jalan dan jembatan logistik antardesa adalah urat nadi perekonomian warga. Pengawasan ketat anggaran memastikan pembangunan tepat waktu dan bebas penyelewengan.',
      body: `## Urgensi Konektivitas Daerah

Pembangunan infrastruktur tidak boleh hanya berpusat pada jalan tol antarprovinsi, melainkan harus menembus jalan-jalan poros desa dan jembatan penghubung kecamatan.

Melalui program aspirasi dewan, kami telah mengalokasikan anggaran untuk perbaikan 42,8 kilometer jalan kabupaten di 16 kecamatan konstituen.

> "Infrastruktur yang berkualitas adalah bentuk keadilan sosial nyata yang langsung menurunkan biaya logistik panen petani."

## Pengawasan Mutu Konstruksi

Kami mewajibkan tim teknis pelaksana untuk mematuhi standar spesifikasi beton dan drainase air yang tahan cuaca ekstrem. Sidak berkala ke lokasi proyek dilakukan demi memastikan tidak ada pengurangan volume material.`,
    },
    'sosialisasi-pendidikan-karakter-di-sekolah': {
      id: 'ref-art-3',
      title: 'Sosialisasi Pendidikan Karakter & Penguatan Moral Generasi Muda Bangsa',
      slug: 'sosialisasi-pendidikan-karakter-di-sekolah',
      category: 'Pendidikan',
      issueCategory: 'Pendidikan',
      publishedAt: '2026-08-28T10:00:00.000Z',
      readingTime: '3 menit baca',
      featuredImageUrl: '/images/ref-article-3.jpg',
      posterUrl: '/images/ref-article-3.jpg',
      thumbnailUrl: '/images/ref-article-3.jpg',
      excerpt:
        'Pendidikan bukan sekadar transfer ilmu pengetahuan teknis, melainkan pembentukan integritas karakter dan nilai-nilai kebangsaan yang tangguh.',
      body: `## Transformasi Kurikulum & Budi Pekerti

Di era kecerdasan buatan dan disrupsi informasi digital, tantangan terbesar anak muda kita adalah krisis keteladanan dan degradasi moral.

Pendidikan karakter harus diintegrasikan dalam seluruh mata pelajaran, dengan menitikberatkan pada kejujuran, disiplin, toleransi, dan kepedulian terhadap sesama.

> "Masa depan sebuah bangsa tidak diukur dari seberapa megah gedung sekolahnya, melainkan seberapa kokoh budi pekerti anak-anak didiknya."`,
    },
    'kajian-alokasi-apbd-pemulihan-ekonomi': {
      id: 'art-naya-1',
      title: 'Kajian Strategis Alokasi APBD 2026 untuk Pemulihan Ekonomi Kerakyatan',
      slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
      category: 'Kajian APBD',
      issueCategory: 'Kajian APBD',
      publishedAt: '2026-10-15T08:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
      posterUrl: '/images/showcase-artikel-pertanian.jpg',
      thumbnailUrl: '/images/showcase-artikel-pertanian.jpg',
      excerpt:
        'Analisis komprehensif mengenai formulasi dan pengawasan alokasi belanja modal daerah guna mempercepat stimulus sektor UMKM serta jaring pengaman sosial konstituen.',
      body: `## Pengantar Analisis APBD Berbasis Kerakyatan

APBD bukan sekadar lembaran angka akuntansi publik, melainkan kompas politik anggaran yang menentukan arah kemakmuran masyarakat di daerah pemilihan. Alokasi belanja modal harus dirancang dengan prinsip keberpihakan kepada sektor-sektor riil yang bersentuhan langsung dengan denyut nadi perekonomian warga.

Dalam konteks pemulihan ekonomi pasca-pandemi dan dinamika inflasi bahan pokok, postur belanja daerah memerlukan reorientasi pada tiga sektor vital: ketahanan pangan pedesaan, bantuan stimulus permodalan UMKM, dan perbaikan infrastruktur jalan sentra produksi.

> "Setiap rupiah dana publik yang dialokasikan dalam APBD harus dapat dipertanggungjawabkan asas kemanfaatannya bagi perbaikan taraf hidup masyarakat lapis bawah."

### Strategi Pengawasan dan Evaluasi di Parlemen

Sebagai anggota Badan Anggaran dan komisi kedewanan, pengawasan berkala terus dilakukan melalui audit kinerja serapan triwulanan. Kami memastikan bahwa lelang proyek infrastruktur strategis tidak mengalami penumpukan di akhir tahun anggaran, melainkan terlaksana secara proporsional demi menjaga daya beli warga lokal.`,
    },
    'transformasi-digital-aspirasi-parlemen': {
      id: 'art-naya-2',
      title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Tingkat Parlemen Daerah',
      slug: 'transformasi-digital-aspirasi-parlemen',
      category: 'Transformasi Digital',
      issueCategory: 'Transformasi Digital',
      publishedAt: '2026-10-12T08:00:00.000Z',
      readingTime: '5 menit baca',
      featuredImageUrl: '/images/ref-article-1.jpg',
      posterUrl: '/images/ref-article-1.jpg',
      thumbnailUrl: '/images/ref-article-1.jpg',
      excerpt:
        'Mewujudkan transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi modern berbasis data riil dan tanggap cepat komisi.',
      body: `## Menjembatani Suara Rakyat Melalui Kanal Digital

Partisipasi bermakna (meaningful participation) hanya dapat terwujud jika kanal komunikasi antara masyarakat dan dewan perwakilan terbuka lebar tanpa sekat birokrasi yang kaku. Digitalisasi layanan aspirasi hadir sebagai solusi agar setiap keluhan, usulan perbaikan jalan, atau aduan beasiswa dapat tercatat dan tertelusur secara transparan.

Melalui portal POLARIS dan integrasi hotline reses, masyarakat dapat memantau status disposisi pengaduan mereka secara langsung.`,
    },
    'buatkan-artikel-tentang-asap-karhutla-4cf9c438': {
      "id": "1fe24b12-3669-4813-934a-1e40ee67ed9f",
      "title": "Mengatasi Asap Karhutla: Urgensi Kebijakan dan Solusi untuk Jakarta Timur",
      "slug": "buatkan-artikel-tentang-asap-karhutla-4cf9c438",
      "category": "Kebijakan Publik",
      "issueCategory": "Kesejahteraan Sosial",
      "publishedAt": "2026-10-15T02:47:36.278Z",
      "readingTime": "5 menit baca",
      "featuredImageUrl": "/images/ref-article-1.jpg",
      "posterUrl": "/images/ref-article-1.jpg",
      "thumbnailUrl": "/images/ref-article-1.jpg",
      "excerpt": "Asap akibat kebakaran hutan dan lahan (karhutla) menjadi ancaman serius bagi kesehatan dan kualitas hidup warga Jakarta Timur. Diperlukan kebijakan strategis dan tindakan konkret untuk mengatasi dampak buruk ini secara efektif.",
      "body": "# Bab 1: Latar Belakang & Urgensi Lapangan\n\nKebakaran hutan dan lahan (karhutla) telah menjadi isu lingkungan yang signifikan di Indonesia, dengan dampak yang meluas hingga ke wilayah urban seperti Jakarta Timur. Meskipun Jakarta Timur bukanlah daerah yang secara langsung terkena kebakaran hutan, namun dampak asap yang dihasilkan dari karhutla di daerah lain dapat mempengaruhi kualitas udara dan kesehatan masyarakat di wilayah ini. Asap karhutla mengandung partikel berbahaya seperti PM2.5 yang dapat menyebabkan gangguan pernapasan, penyakit kardiovaskular, dan masalah kesehatan lainnya.\n\nKondisi geografis dan cuaca yang sering kali tidak menentu di Jakarta Timur juga memperparah situasi ini. Angin yang bertiup dari arah selatan dan tenggara dapat membawa asap dari daerah yang mengalami karhutla ke wilayah Jakarta Timur, memperburuk kualitas udara dan mengancam kesehatan masyarakat. Oleh karena itu, menangani asap karhutla menjadi prioritas mendesak bagi pemerintah daerah untuk melindungi warganya.\n\n# Bab 2: Pembedahan Fakta Data & Statistik Regional\n\nMeskipun data spesifik mengenai dampak asap karhutla di Jakarta Timur belum tersedia secara lengkap, kita dapat mengacu pada data kualitas udara yang menunjukkan peningkatan konsentrasi PM2.5 selama musim kemarau, ketika kebakaran hutan dan lahan lebih sering terjadi. Menurut data dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG), kualitas udara di Jakarta Timur sering kali berada pada level tidak sehat selama periode ini.\n\nSelain itu, data kesehatan dari Dinas Kesehatan DKI Jakarta menunjukkan peningkatan kasus penyakit pernapasan seperti asma dan infeksi saluran pernapasan akut (ISPA) selama musim asap. Hal ini menandakan bahwa dampak asap karhutla terhadap kesehatan masyarakat sangat nyata dan memerlukan perhatian serius dari pemerintah daerah.\n\n# Bab 3: Tinjauan Hukum & Harmonisasi Regulasi\n\nSaat ini, belum ada regulasi daerah khusus yang secara langsung mengatur penanganan asap karhutla di Jakarta Timur. Namun, secara nasional, Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup mengatur tentang kewajiban pemerintah daerah untuk menjaga kualitas lingkungan, termasuk udara.\n\nSelain itu, Peraturan Pemerintah Nomor 41 Tahun 1999 tentang Pengendalian Pencemaran Udara juga memberikan landasan hukum bagi pemerintah daerah untuk mengambil tindakan dalam mengendalikan pencemaran udara akibat asap karhutla. Pemerintah daerah dapat memanfaatkan regulasi ini untuk menyusun kebijakan lokal yang lebih spesifik dan efektif dalam menangani dampak asap karhutla.\n\n# Bab 4: Analisis Dampak Sosial-Ekonomi Konstituen\n\nDampak sosial-ekonomi dari asap karhutla di Jakarta Timur sangat signifikan. Dari sisi kesehatan, peningkatan kasus penyakit pernapasan menyebabkan beban biaya kesehatan yang lebih tinggi bagi masyarakat dan pemerintah daerah. Selain itu, kualitas udara yang buruk dapat mengganggu aktivitas ekonomi, terutama bagi sektor informal yang bergantung pada aktivitas luar ruangan.\n\nDari sisi pendidikan, kualitas udara yang buruk dapat menyebabkan penutupan sekolah sementara, mengganggu proses belajar mengajar dan berdampak pada kualitas pendidikan anak-anak. Secara keseluruhan, dampak sosial-ekonomi dari asap karhutla mengancam kesejahteraan masyarakat dan memerlukan intervensi kebijakan yang tepat.\n\n# Bab 5: Rekomendasi Kebijakan Konkret & Langkah Aksi Parlemen\n\nUntuk mengatasi dampak asap karhutla di Jakarta Timur, berikut adalah beberapa rekomendasi kebijakan konkret yang dapat diambil oleh pemerintah daerah dan parlemen:\n\n1. **Peningkatan Pemantauan Kualitas Udara:** Memperkuat sistem pemantauan kualitas udara dengan memasang lebih banyak stasiun pemantau di seluruh wilayah Jakarta Timur untuk memberikan data yang akurat dan real-time kepada masyarakat.\n\n2. **Penyusunan Regulasi Daerah Khusus:** Menyusun regulasi daerah yang secara khusus mengatur penanganan asap karhutla, termasuk pengendalian sumber polusi dan penegakan hukum bagi pelanggar.\n\n3. **Peningkatan Kesadaran Masyarakat:** Melakukan kampanye edukasi kepada masyarakat tentang bahaya asap karhutla dan cara melindungi diri, seperti penggunaan masker dan mengurangi aktivitas luar ruangan saat kualitas udara buruk.\n\n4. **Kerjasama Antar Daerah:** Membangun kerjasama dengan daerah lain yang menjadi sumber asap untuk mengurangi kebakaran hutan dan lahan melalui program pencegahan dan penanggulangan yang efektif.\n\n5. **Penguatan Infrastruktur Kesehatan:** Meningkatkan kapasitas fasilitas kesehatan di Jakarta Timur untuk menangani peningkatan kasus penyakit pernapasan selama musim asap.\n\nDengan langkah-langkah ini, diharapkan dampak asap karhutla di Jakarta Timur dapat diminimalisir, sehingga kesehatan dan kesejahteraan masyarakat dapat terjaga dengan baik."
},
    'buatkan-artikel-tentang-kemiskinan-67fffbcd': {
      "id": "82be3230-9c56-46ed-8915-3196cc5a0274",
      "title": "Mengentaskan Kemiskinan di Jakarta Timur: Strategi Kebijakan dan Implementasi Efektif",
      "slug": "buatkan-artikel-tentang-kemiskinan-67fffbcd",
      "category": "Kebijakan Publik",
      "issueCategory": "Kesejahteraan Sosial",
      "publishedAt": "2026-10-15T02:54:48.835Z",
      "readingTime": "4 menit baca",
      "featuredImageUrl": "/images/ref-article-1.jpg",
      "posterUrl": "/images/ref-article-1.jpg",
      "thumbnailUrl": "/images/ref-article-1.jpg",
      "excerpt": "Kemiskinan di Jakarta Timur merupakan tantangan multidimensional yang memerlukan pendekatan terpadu dan strategis. Artikel ini menganalisis data dan regulasi yang ada untuk memberikan rekomendasi kebijakan yang konkret bagi pengambil keputusan daerah.",
      "body": "# Bab 1: Latar Belakang & Urgensi Lapangan\n\nJakarta Timur, sebagai salah satu wilayah administratif di DKI Jakarta, menghadapi tantangan kemiskinan yang kompleks. Sebagai pusat urbanisasi dan ekonomi, Jakarta Timur tidak hanya menjadi magnet bagi pencari kerja dari berbagai daerah, tetapi juga menghadapi tekanan sosial-ekonomi yang signifikan. Berdasarkan data Badan Pusat Statistik (BPS), tingkat kemiskinan di Jakarta Timur menunjukkan tren yang fluktuatif, dipengaruhi oleh faktor-faktor seperti migrasi urban, ketidakstabilan ekonomi, dan akses terbatas terhadap layanan dasar.\n\nKemiskinan di Jakarta Timur tidak hanya diukur dari pendapatan, tetapi juga dari akses terhadap pendidikan, kesehatan, dan perumahan yang layak. Oleh karena itu, urgensi untuk mengentaskan kemiskinan di wilayah ini tidak hanya menjadi tanggung jawab pemerintah daerah, tetapi juga memerlukan kolaborasi dengan sektor swasta dan masyarakat sipil.\n\n# Bab 2: Pembedahan Fakta Data & Statistik Regional\n\nMenurut data BPS terbaru, tingkat kemiskinan di Jakarta Timur mencapai sekitar 3,5% dari total populasi. Meskipun angka ini tampak rendah dibandingkan dengan rata-rata nasional, perlu dicatat bahwa Jakarta Timur memiliki populasi yang padat, sehingga jumlah absolut penduduk miskin cukup signifikan. Selain itu, disparitas pendapatan antara kelompok masyarakat juga menjadi isu yang perlu diperhatikan.\n\nData menunjukkan bahwa sektor informal masih menjadi sumber penghidupan utama bagi banyak penduduk miskin di Jakarta Timur. Namun, sektor ini rentan terhadap fluktuasi ekonomi dan tidak memberikan jaminan sosial yang memadai. Selain itu, akses terhadap pendidikan berkualitas dan layanan kesehatan yang terjangkau masih menjadi tantangan bagi keluarga miskin.\n\n# Bab 3: Tinjauan Hukum & Harmonisasi Regulasi\n\nDalam konteks regulasi, DKI Jakarta telah memiliki berbagai kebijakan yang bertujuan untuk mengurangi kemiskinan, seperti program Kartu Jakarta Pintar (KJP) dan Kartu Jakarta Sehat (KJS). Namun, implementasi di tingkat lokal sering kali menghadapi kendala birokrasi dan kurangnya koordinasi antar lembaga.\n\nUndang-Undang Nomor 13 Tahun 2011 tentang Penanganan Fakir Miskin mengamanatkan pemerintah daerah untuk menyusun rencana penanggulangan kemiskinan yang komprehensif. Namun, harmonisasi regulasi antara kebijakan pusat dan daerah sering kali menjadi tantangan, terutama dalam hal alokasi anggaran dan prioritas program.\n\n# Bab 4: Analisis Dampak Sosial-Ekonomi Konstituen\n\nKemiskinan di Jakarta Timur berdampak langsung pada kualitas hidup masyarakat. Dampak sosial dari kemiskinan meliputi peningkatan angka putus sekolah, masalah kesehatan, dan meningkatnya angka kriminalitas. Secara ekonomi, kemiskinan menghambat pertumbuhan ekonomi lokal karena daya beli masyarakat yang rendah dan keterbatasan akses terhadap peluang ekonomi.\n\nSelain itu, kemiskinan juga mempengaruhi stabilitas sosial di Jakarta Timur. Ketidakpuasan terhadap layanan publik dan ketidakadilan sosial dapat memicu konflik sosial dan mengurangi kohesi masyarakat. Oleh karena itu, penanganan kemiskinan harus menjadi prioritas utama dalam agenda pembangunan daerah.\n\n# Bab 5: Rekomendasi Kebijakan Konkret & Langkah Aksi Parlemen\n\nUntuk mengatasi kemiskinan di Jakarta Timur, diperlukan pendekatan kebijakan yang holistik dan terintegrasi. Berikut adalah beberapa rekomendasi kebijakan yang dapat dipertimbangkan:\n\n1. **Penguatan Program Sosial**: Memperkuat program bantuan sosial seperti KJP dan KJS dengan meningkatkan transparansi dan akuntabilitas dalam penyaluran bantuan.\n\n2. **Peningkatan Akses Pendidikan dan Pelatihan**: Meningkatkan akses terhadap pendidikan berkualitas dan pelatihan keterampilan bagi penduduk miskin untuk meningkatkan daya saing mereka di pasar kerja.\n\n3. **Pengembangan Ekonomi Lokal**: Mendorong pengembangan usaha mikro, kecil, dan menengah (UMKM) melalui akses permodalan dan pelatihan kewirausahaan.\n\n4. **Peningkatan Infrastruktur Dasar**: Memperbaiki infrastruktur dasar seperti transportasi, air bersih, dan sanitasi untuk meningkatkan kualitas hidup masyarakat.\n\n5. **Kolaborasi Multi-Pihak**: Membangun kemitraan dengan sektor swasta dan organisasi masyarakat sipil untuk mengimplementasikan program penanggulangan kemiskinan yang berkelanjutan.\n\nLangkah aksi parlemen dapat meliputi pengawasan ketat terhadap implementasi program-program tersebut, serta memastikan alokasi anggaran yang memadai untuk mendukung upaya pengentasan kemiskinan di Jakarta Timur. Dengan komitmen yang kuat dan strategi yang tepat, diharapkan kemiskinan di Jakarta Timur dapat berkurang secara signifikan dalam beberapa tahun ke depan."
},
    'buatkan-artikel-tentang-korupsi-c59c8f9a': {
      "id": "26d4640e-021b-4d1d-a2aa-8440c41d97cc",
      "title": "Memerangi Korupsi di Jakarta Timur: Strategi Penguatan Transparansi dan Akuntabilitas",
      "slug": "buatkan-artikel-tentang-korupsi-c59c8f9a",
      "category": "Kebijakan Publik",
      "issueCategory": "Kesejahteraan Sosial",
      "publishedAt": "2026-10-15T02:56:38.629Z",
      "readingTime": "5 menit baca",
      "featuredImageUrl": "/images/ref-article-1.jpg",
      "posterUrl": "/images/ref-article-1.jpg",
      "thumbnailUrl": "/images/ref-article-1.jpg",
      "excerpt": "Korupsi merupakan ancaman serius bagi tata kelola pemerintahan yang baik di Jakarta Timur. Artikel ini mengkaji urgensi penanganan korupsi dengan pendekatan berbasis data dan regulasi yang tepat.",
      "body": "# Bab 1: Latar Belakang & Urgensi Lapangan\n\nKorupsi telah lama menjadi salah satu isu paling mendesak di Indonesia, termasuk di wilayah DKI Jakarta, khususnya Jakarta Timur. Sebagai pusat ekonomi dan pemerintahan, Jakarta Timur menghadapi tantangan besar dalam memastikan bahwa setiap aspek tata kelola pemerintahan bebas dari praktik korupsi. Korupsi tidak hanya merugikan keuangan negara, tetapi juga menggerogoti kepercayaan publik terhadap institusi pemerintah dan menghambat pembangunan yang berkelanjutan.\n\nDi tingkat lokal, korupsi dapat mempengaruhi berbagai sektor, mulai dari pengadaan barang dan jasa, perizinan, hingga pelayanan publik. Oleh karena itu, penting bagi pemerintah daerah untuk mengimplementasikan kebijakan yang efektif dalam mencegah dan memberantas korupsi, guna memastikan bahwa sumber daya publik digunakan secara efisien dan transparan.\n\n# Bab 2: Pembedahan Fakta Data & Statistik Regional\n\nMeskipun data spesifik mengenai tingkat korupsi di Jakarta Timur belum tersedia secara publik, kita dapat merujuk pada laporan Komisi Pemberantasan Korupsi (KPK) yang menunjukkan bahwa DKI Jakarta merupakan salah satu wilayah dengan kasus korupsi yang cukup tinggi di Indonesia. Berdasarkan data KPK, sektor yang paling rentan terhadap korupsi di Jakarta termasuk pengadaan barang dan jasa serta perizinan.\n\nMenurut laporan tahunan KPK, pada tahun 2022, terdapat lebih dari 100 kasus korupsi yang ditangani di wilayah DKI Jakarta, dengan sebagian besar kasus melibatkan pejabat publik dan sektor swasta. Hal ini menunjukkan perlunya tindakan tegas dan sistematis untuk mengurangi insiden korupsi di wilayah ini.\n\n# Bab 3: Tinjauan Hukum & Harmonisasi Regulasi\n\nDalam upaya memberantas korupsi, pemerintah pusat telah mengeluarkan berbagai regulasi, seperti Undang-Undang Nomor 31 Tahun 1999 tentang Pemberantasan Tindak Pidana Korupsi, yang kemudian diubah dengan Undang-Undang Nomor 20 Tahun 2001. Regulasi ini memberikan landasan hukum yang kuat bagi penegakan hukum terhadap tindak pidana korupsi.\n\nDi tingkat daerah, meskipun belum ada peraturan daerah khusus yang mengatur pemberantasan korupsi di Jakarta Timur, pemerintah daerah dapat mengadopsi kebijakan yang sejalan dengan regulasi nasional. Misalnya, menerapkan sistem pengadaan barang dan jasa secara elektronik (e-procurement) untuk meningkatkan transparansi dan mengurangi peluang korupsi.\n\n# Bab 4: Analisis Dampak Sosial-Ekonomi Konstituen\n\nKorupsi memiliki dampak yang luas terhadap masyarakat, terutama dalam hal ekonomi dan sosial. Di Jakarta Timur, korupsi dapat menghambat investasi dan pertumbuhan ekonomi, karena investor cenderung menghindari wilayah yang dianggap tidak transparan dan berisiko tinggi. Selain itu, korupsi juga dapat mengurangi kualitas pelayanan publik, seperti kesehatan dan pendidikan, yang pada akhirnya merugikan masyarakat, terutama kelompok rentan.\n\nDari perspektif sosial, korupsi dapat menurunkan moral dan etika masyarakat, karena masyarakat mungkin merasa bahwa keberhasilan lebih ditentukan oleh koneksi dan suap daripada kerja keras dan integritas. Oleh karena itu, pemberantasan korupsi tidak hanya penting untuk pertumbuhan ekonomi, tetapi juga untuk membangun masyarakat yang adil dan berintegritas.\n\n# Bab 5: Rekomendasi Kebijakan Konkret & Langkah Aksi Parlemen\n\nUntuk mengatasi masalah korupsi di Jakarta Timur, diperlukan pendekatan yang komprehensif dan berkelanjutan. Berikut adalah beberapa rekomendasi kebijakan yang dapat diambil oleh pemerintah daerah dan parlemen:\n\n1. **Peningkatan Transparansi:** Menerapkan sistem e-government yang memungkinkan akses publik terhadap informasi pemerintah, termasuk pengadaan barang dan jasa, anggaran, dan perizinan.\n\n2. **Penguatan Pengawasan Internal:** Meningkatkan kapasitas dan independensi unit pengawasan internal untuk mendeteksi dan mencegah praktik korupsi di lingkungan pemerintahan.\n\n3. **Pendidikan Anti-Korupsi:** Mengintegrasikan pendidikan anti-korupsi ke dalam kurikulum sekolah dan program pelatihan bagi pegawai negeri sipil untuk membangun budaya integritas sejak dini.\n\n4. **Kolaborasi dengan KPK:** Memperkuat kerja sama dengan KPK dan lembaga penegak hukum lainnya untuk meningkatkan efektivitas penegakan hukum terhadap kasus korupsi.\n\n5. **Penghargaan dan Sanksi:** Memberikan insentif bagi pegawai negeri yang menunjukkan integritas tinggi, serta menerapkan sanksi tegas bagi mereka yang terlibat dalam korupsi.\n\nDengan langkah-langkah ini, diharapkan Jakarta Timur dapat menjadi contoh bagi wilayah lain dalam upaya pemberantasan korupsi, serta menciptakan lingkungan yang kondusif bagi pembangunan yang berkelanjutan dan inklusif."
},
    'buatkan-artikel-tentang-pemberantasan-korupsi-a8dd7726': {
      "id": "e16d4f58-3c7a-430c-a63f-3c39dda42c51",
      "title": "Membongkar Jerat Korupsi di Jantung Pemerintahan Daerah",
      "slug": "buatkan-artikel-tentang-pemberantasan-korupsi-a8dd7726",
      "category": "Tata Kelola Pemerintahan",
      "issueCategory": "Transparansi",
      "publishedAt": "2026-10-27T06:31:28.923Z",
      "readingTime": "9 menit baca",
      "featuredImageUrl": "/images/ref-article-1.jpg",
      "posterUrl": "/images/ref-article-1.jpg",
      "thumbnailUrl": "/images/ref-article-1.jpg",
      "excerpt": "Korupsi menjadi penghambat utama pembangunan di daerah. Dengan pendekatan solutif dan taktis, artikel ini menawarkan strategi pemberantasan korupsi yang efektif bagi pimpinan daerah.",
      "body": "# Membongkar Jerat Korupsi di Jantung Pemerintahan Daerah\n\n> **Ringkasan Eksekutif:** Korupsi menjadi penghambat utama pembangunan di daerah. Dengan pendekatan solutif dan taktis, artikel ini menawarkan strategi pemberantasan korupsi yang efektif bagi pimpinan daerah.\n\n## Bab I. Memahami Akar Masalah Korupsi di Daerah\n\nKorupsi di tingkat daerah adalah masalah sistemik yang memerlukan intervensi cepat dan tepat. Di Kota Bandung, korupsi telah mengakar dalam berbagai aspek pemerintahan daerah. Pemerintah Daerah harus segera mengambil tindakan untuk mengatasi masalah ini sebelum dampaknya semakin meluas. Korupsi tidak hanya merugikan anggaran daerah tetapi juga menghambat pembangunan dan pelayanan publik yang seharusnya dinikmati oleh warga. Oleh karena itu, identifikasi akar masalah dan penerapan solusi konkret menjadi sangat penting.\n\nData lapangan menunjukkan bahwa alokasi anggaran yang tidak tepat dan lemahnya pengawasan menjadi penyebab utama korupsi di daerah. Berdasarkan evaluasi anggaran, banyak proyek yang tidak sesuai dengan perencanaan awal dan sering kali mengalami pembengkakan biaya. Hal ini terjadi karena kurangnya transparansi dan akuntabilitas dalam pengelolaan anggaran daerah. Pemerintah Daerah harus memperkuat sistem pengawasan dan audit internal untuk memastikan setiap alokasi anggaran digunakan secara efektif dan efisien .\n\nHambatan teknis dalam penanganan korupsi di daerah meliputi kurangnya sumber daya manusia yang kompeten dan minimnya dukungan teknologi informasi. Dampak langsung dari korupsi ini dirasakan oleh warga dalam bentuk layanan publik yang buruk dan infrastruktur yang tidak memadai. Misalnya, proyek pembangunan jalan yang seharusnya selesai tepat waktu sering kali tertunda akibat praktik korupsi. Pemerintah Daerah harus meningkatkan kapasitas aparatur sipil negara dan memanfaatkan teknologi untuk mempermudah pengawasan dan pelaporan kasus korupsi.\n\nSebagai langkah taktis, Pemerintah Daerah harus segera membentuk satuan tugas anti-korupsi yang terdiri dari berbagai OPD mitra. Satuan tugas ini bertanggung jawab untuk mengidentifikasi, mencegah dan menindaklanjuti kasus korupsi di daerah. Selain itu, perlu ada pelatihan rutin bagi aparatur sipil negara untuk meningkatkan integritas dan profesionalisme mereka. Komisi Dewan juga harus berperan aktif dalam mengawasi pelaksanaan kebijakan anti-korupsi dan memberikan rekomendasi perbaikan secara berkala. Dengan langkah-langkah ini, diharapkan korupsi di daerah dapat diminimalisir dan pembangunan daerah dapat berjalan lebih optimal.\n\n## Bab II. Diagnosa Kapasitas Fiskal dan Anggaran Daerah\n\nPemerintah Daerah Kota Bandung menghadapi tantangan serius dalam pengelolaan anggaran yang sering kali menjadi celah bagi praktik korupsi. Analisis alokasi anggaran saat ini menunjukkan bahwa terdapat ketidakseimbangan dalam distribusi dana yang mengarah pada potensi penyimpangan. Beberapa program prioritas tidak mendapatkan alokasi yang memadai, sementara sektor lain mengalami kelebihan anggaran tanpa justifikasi yang jelas. Hal ini menciptakan ruang bagi manipulasi anggaran yang dapat merugikan masyarakat. Oleh karena itu, Pemerintah Daerah harus melakukan audit menyeluruh untuk memastikan alokasi anggaran sesuai dengan kebutuhan strategis pembangunan daerah .\n\nUntuk memperjelas efisiensi belanja program, berikut adalah tabel perbandingan efisiensi belanja beberapa program prioritas di Kota Bandung:\n\n| Program                 | Anggaran (Miliar IDR) | Efisiensi (%) |\n|-------------------------|-----------------------|---------------|\n| Pendidikan              | 500                   | 85            |\n| Kesehatan               | 400                   | 90            |\n| Infrastruktur           | 600                   | 70            |\n| Pariwisata              | 200                   | 60            |\n\nTabel di atas menunjukkan bahwa sektor pendidikan dan kesehatan memiliki efisiensi belanja yang lebih tinggi dibandingkan infrastruktur dan pariwisata. Pemerintah Daerah perlu meninjau ulang alokasi anggaran infrastruktur dan pariwisata agar lebih efisien dan tepat sasaran.\n\nIdentifikasi sektor dengan risiko korupsi tinggi menjadi langkah krusial dalam mencegah kebocoran anggaran. Sektor infrastruktur dan pariwisata di Kota Bandung sering kali menjadi sorotan karena besarnya anggaran yang dialokasikan dan minimnya transparansi dalam pelaksanaan proyek. Pemerintah Daerah harus memperketat pengawasan dan meningkatkan transparansi dalam proses pengadaan barang dan jasa. Penerapan sistem e-procurement dapat menjadi solusi untuk meminimalisir intervensi pihak-pihak yang tidak bertanggung jawab.\n\nSebagai langkah perbaikan, Pemerintah Daerah harus mengimplementasikan sistem anggaran berbasis kinerja yang mengutamakan transparansi dan akuntabilitas. Sistem ini memungkinkan evaluasi berkala terhadap capaian program dan penggunaan anggaran. Selain itu, pembentukan satuan tugas anti-korupsi di setiap Organisasi Perangkat Daerah (OPD) dapat menjadi langkah cepat (quick wins) dalam mencegah praktik korupsi. Setiap OPD harus bertanggung jawab atas pengawasan internal dan pelaporan penggunaan anggaran secara berkala. Dengan demikian, Pemerintah Daerah dapat meminimalisir peluang korupsi dan memastikan anggaran daerah digunakan secara optimal untuk kesejahteraan masyarakat.\n\n## Bab III. Terobosan Taktis dan Solusi Cepat dari Dewan\n\nDewan daerah memiliki peran strategis dalam menginisiasi solusi cepat untuk pemberantasan korupsi. Untuk mencapai tujuan ini, dewan harus mengadopsi skema solusi dan quick wins yang terukur dan efektif. Pertama, dewan dapat membentuk tim khusus yang bertugas mengidentifikasi area rawan korupsi di setiap Organisasi Perangkat Daerah (OPD). Tim ini harus bekerja sama dengan auditor independen untuk melakukan audit mendalam terhadap penggunaan anggaran. Selain itu, dewan perlu menetapkan indikator kinerja utama yang jelas untuk setiap OPD guna memastikan akuntabilitas. Langkah-langkah ini tidak hanya mencegah korupsi tetapi juga meningkatkan efisiensi penggunaan anggaran daerah.\n\nDewan daerah juga memiliki tanggung jawab penting dalam pengawasan dan penegakan aturan. Dewan harus memastikan bahwa setiap kebijakan yang diimplementasikan sesuai dengan regulasi yang berlaku dan tidak memberikan celah untuk penyalahgunaan wewenang. Pengawasan yang ketat harus dilakukan melalui rapat evaluasi berkala dengan OPD terkait. Dewan juga harus mendorong transparansi dengan mempublikasikan laporan kinerja dan penggunaan anggaran secara rutin kepada publik. Dengan demikian, masyarakat dapat turut serta dalam mengawasi jalannya pemerintahan daerah.\n\n<!-- VISUAL_SLOT: {\"type\": \"INFOGRAPHIC\", \"caption\": \"Diagram skema solusi cepat pemberantasan korupsi\", \"prompt\": \"Buat diagram yang menunjukkan langkah-langkah cepat untuk mengatasi korupsi di tingkat daerah\"} -->\n\nContoh kasus sukses dari daerah lain dapat menjadi inspirasi bagi dewan daerah dalam merancang strategi pemberantasan korupsi. Misalnya, Kota Surabaya berhasil menurunkan tingkat korupsi dengan menerapkan sistem e-budgeting yang transparan. Sistem ini memungkinkan setiap pengeluaran anggaran dapat dilacak secara real-time oleh publik. Selain itu, Surabaya juga menerapkan sistem reward and punishment yang ketat bagi pegawai negeri sipil (PNS) berdasarkan kinerja dan integritas. Keberhasilan ini menunjukkan bahwa dengan komitmen dan strategi yang tepat, korupsi dapat diminimalisir secara signifikan.\n\nSebagai rekomendasi kebijakan aksi untuk implementasi segera, dewan daerah harus mengesahkan regulasi yang mendukung penerapan teknologi informasi dalam pengelolaan anggaran. Dewan juga perlu menginisiasi program pelatihan dan pengembangan kapasitas bagi PNS untuk meningkatkan pemahaman mereka tentang pentingnya transparansi dan akuntabilitas. Selain itu, dewan harus berkolaborasi dengan lembaga penegak hukum untuk memperkuat penegakan hukum terhadap pelaku korupsi. Langkah-langkah ini akan memastikan bahwa upaya pemberantasan korupsi dapat berjalan efektif dan berkelanjutan.\n\n\n\n## Bab IV. Matriks Rencana Aksi dan Peran OPD Mitra\n\nPemerintah Daerah harus membagi tugas dan tanggung jawab antar OPD secara jelas untuk memerangi korupsi di jantung pemerintahan daerah. Setiap OPD memiliki peran spesifik yang harus diemban dengan penuh tanggung jawab. Dinas Keuangan, misalnya, bertugas mengawasi aliran dana dan memastikan transparansi anggaran. Sementara itu, Dinas Pengawasan Internal berperan dalam melakukan audit berkala dan mendeteksi potensi penyimpangan. Kolaborasi ini tidak hanya meningkatkan efisiensi tetapi juga memperkuat akuntabilitas di setiap lini pemerintahan.\n\nPemerintah Daerah menetapkan target waktu dan milestone pencapaian untuk memastikan rencana aksi anti-korupsi berjalan sesuai jadwal. Setiap OPD harus menyusun jadwal kerja yang terperinci dengan batas waktu yang realistis. Misalnya, dalam tiga bulan pertama, OPD harus menyelesaikan audit internal dan melaporkan temuan kepada pimpinan daerah. Selanjutnya, dalam enam bulan, harus ada peningkatan sistem pengawasan berbasis teknologi informasi. Penetapan milestone ini memungkinkan evaluasi berkala dan penyesuaian strategi jika diperlukan.\n\nIndikator keberhasilan dan mekanisme evaluasi menjadi kunci dalam mengukur efektivitas rencana aksi. Pemerintah Daerah harus menetapkan indikator yang terukur seperti penurunan jumlah kasus korupsi dan peningkatan kepatuhan terhadap regulasi. Selain itu, mekanisme evaluasi harus melibatkan audit eksternal untuk memastikan objektivitas dan kredibilitas hasil evaluasi. Komisi Terkait mendesak evaluasi mendalam setiap enam bulan untuk menilai kemajuan dan mengidentifikasi area yang memerlukan perbaikan .\n\nKomitmen bersama untuk keberlanjutan program adalah elemen penting yang harus dijaga oleh seluruh pemangku kepentingan. Pemerintah Daerah, DPRD dan masyarakat harus bersatu padu dalam mendukung dan mengawasi implementasi rencana aksi. Komitmen ini diwujudkan melalui penandatanganan pakta integritas oleh setiap OPD dan pelibatan masyarakat dalam pengawasan. Dengan demikian, keberlanjutan program anti-korupsi dapat terjamin dan memberikan dampak jangka panjang bagi pembangunan daerah.\n\n| Prioritas Aksi | Waktu Eksekusi | Output Konkret | Pemangku Kepentingan Terkait |\n|----------------|----------------|----------------|-----------------------------|\n| Audit Internal | 3 bulan        | Laporan Audit  | Dinas Pengawasan Internal   |\n| Pengawasan TI  | 6 bulan        | Sistem TI Baru | Dinas Komunikasi dan Informasi |\n| Evaluasi Berkala | 6 bulan       | Laporan Evaluasi | Komisi Terkait              |\n| Pakta Integritas | 1 bulan       | Dokumen Pakta  | Semua OPD                   |"
},
    'pengawalan-regulasi-lahan-pangan-berkelanjutan': {
      id: 'art-naya-3',
      title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan (LP2B)',
      slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
      category: 'Regulasi Daerah',
      issueCategory: 'Regulasi Daerah',
      publishedAt: '2026-10-08T08:00:00.000Z',
      readingTime: '6 menit baca',
      featuredImageUrl: '/images/default-article.jpg',
      posterUrl: '/images/default-article.jpg',
      thumbnailUrl: '/images/default-article.jpg',
      excerpt:
        'Memperkuat payung hukum perda tata ruang wilayah untuk menjamin kedaulatan pangan lokal, kepastian irigasi, dan perlindungan kesejahteraan kelompok tani daerah.',
      body: `## Menjaga Kedaulatan Pangan Daerah

Alih fungsi lahan pertanian produktif menjadi kawasan perumahan komersial atau industri manufaktur yang tidak terkendali menjadi ancaman serius bagi ketahanan pangan lokal. Petani sering kali berada pada posisi tawar yang rentan ketika berhadapan dengan ekspansi spekulan lahan.

Oleh karena itu, penyusunan Perda LP2B menjadi prioritas legislasi daerah yang terus kami perjuangkan agar lahan sawah beririgasi teknis mendapatkan proteksi hukum permanen dan insentif pajak daerah bagi para petani penggarap.`,
    },
  };

  return fallbacks[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) {
    return { title: 'Portal Tidak Ditemukan - POLARIS' };
  }

  const API_BASE_URL = getNormalizedApiUrl();





  let article = null;
  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    // Ignore fetch error, use fallback below
  }

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) {
    return { title: 'Artikel Tidak Ditemukan - POLARIS' };
  }

  const { member, theme, portal } = portalData;
  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.polaris.id`;

  const title = `${article.title} - ${member.fullName}`;
  const description = article.excerpt || `Telaah kebijakan dan risalah publik oleh ${member.fullName}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/artikel/${slug}`
    : (article.canonicalUrl || `${baseUrl}/${subdomain}/artikel/${slug}`);

  // WhatsApp dan Telegram HANYA mendukung JPG dan PNG untuk preview kartu media.
  // File .webp tidak didukung oleh scraper WhatsApp.
  const isWebp = article.posterUrl && article.posterUrl.toLowerCase().includes('.webp');
  const hasJpgPngPoster =
    article.posterUrl &&
    article.posterUrl.startsWith('http') &&
    !isWebp;

  const ogImageUrl = hasJpgPngPoster
    ? article.posterUrl
    : `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}&category=${encodeURIComponent(article.category || 'RISALAH KEBIJAKAN')}`;

  return {
    title,
    description,
    keywords: [
      article.title,
      article.category || 'Kebijakan Publik',
      member.fullName,
      member.partyAffiliation,
      member.dapilName,
      'Telaah Parlemen',
      'Regulasi',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [member.fullName],
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}



  function renderArticleContent({
  templateId,
  article,
  member,
  effectiveTheme,
  subdomain,
  recentArticles,
  documents,
  slug,
}: {
  templateId: string;
  article: any;
  member: any;
  effectiveTheme: any;
  subdomain: string;
  recentArticles: any[];
  documents: any[];
  slug: string;
}) {
  const theme = effectiveTheme;
  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <BoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </BoldTypographyShell>
    );
  }

  if (templateId === PortalTemplateId.DARK_MODERN || templateId === 'dark-modern') {
    return (
      <DarkModernShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <DarkModernArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </DarkModernShell>
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW || templateId === 'neon-glow') {
    return (
      <NeonGlowShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <NeonGlowArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </NeonGlowShell>
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL || templateId === 'clean-editorial') {
    return (
      <CleanEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CleanEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CleanEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM || templateId === 'creative-warm') {
    return (
      <CreativeWarmShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CreativeWarmArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CreativeWarmShell>
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return (
      <FoliobloxShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <FoliobloxArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </FoliobloxShell>
    );
  }

  if (templateId === PortalTemplateId.STUDIO_EDITORIAL || templateId === 'studio-editorial') {
    return (
      <StudioEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <StudioEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </StudioEditorialShell>
    );
  }

  if (
    templateId === PortalTemplateId.WARM_PORTFOLIO ||
    templateId === 'warm-portfolio'
  ) {
    return (
      <WarmPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <WarmPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </WarmPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CRIMSON_NOIR || templateId === 'crimson-noir') {
    return (
      <CrimsonNoirShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CrimsonNoirArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CrimsonNoirShell>
    );
  }

  if (templateId === PortalTemplateId.GOLDEN_SPLIT || templateId === 'golden-split') {
    return (
      <GoldenSplitShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <GoldenSplitArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </GoldenSplitShell>
    );
  }

  if (templateId === PortalTemplateId.BLUSH_EDITORIAL || templateId === 'blush-editorial') {
    return (
      <BlushEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <BlushEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        recentArticles={recentArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }


  if (
    templateId === PortalTemplateId.NAYA_EDITORIAL ||
    templateId === 'naya-editorial' ||
    templateId === 'naya-digital'
  ) {
    return (
      <NayaEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <NayaEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </NayaEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_GOLD || templateId === 'midnight-gold') {
    return (
      <MidnightGoldShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <MidnightGoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </MidnightGoldShell>
    );
  }

  if (templateId === PortalTemplateId.EMERALD_TECH || templateId === 'emerald-tech') {
    return (
      <EmeraldTechShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <EmeraldTechArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </EmeraldTechShell>
    );
  }

  if (templateId === PortalTemplateId.QURIFOLIO || templateId === 'qurifolio') {
    return (
      <QurifolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <QurifolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </QurifolioShell>
    );
  }

  if (templateId === PortalTemplateId.AMBER_PORTFOLIO || templateId === 'amber-portfolio') {
    return (
      <AmberPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <AmberPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </AmberPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIX_LIME || templateId === 'creatix-lime') {
    return (
      <CreatixLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CreatixLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CreatixLimeShell>
    );
  }

  if (
    templateId === PortalTemplateId.MIDNIGHT_LIME ||
    templateId === 'midnight-lime'
  ) {
    return (
      <MidnightLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <MidnightLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </MidnightLimeShell>
    );
  }

  if (templateId === PortalTemplateId.PLATINUM_SLATE || templateId === 'platinum-slate') {
    return (
      <PlatinumSlateShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <PlatinumSlateArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </PlatinumSlateShell>
    );
  }

  const wordCount = article.wordCount || 3000;
  const readingTime = calculateReadingTime(wordCount);

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="artikel"
      showMasthead={false}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-14">
        {/* Top Navigation & Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#96702c] hover:text-[#805f24] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            POLARIS Negarawan • Risalah Kebijakan
          </div>
        </div>

        <article className="relative">
          {/* Editorial Header */}
          <header className="space-y-5 border-b border-slate-200 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-[#96702c] border border-amber-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#96702c]" />
                <span>Kajian Kebijakan Parlemen Resmi</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{readingTime}</span>
              </span>
            </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
            {article.title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center gap-4 pt-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
              {theme?.officialPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold text-sm">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {member.fullName}
                </span>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>Fraksi {member.partyAffiliation}</span>
                <span>•</span>
                <span>Dapil {member.dapilName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateIndonesian(article.publishedAt)}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Reader Toolbar: Scroll Progress, Font Size, Copy Link, Print, Share */}
        <ArticleReaderToolbar
          title={article.title}
          canonicalUrl={article.canonicalUrl}
        />

        {/* Poster Visual (Cloudflare R2 / DALL-E) */}
        {article.posterUrl && (
          <div className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.posterUrl}
              alt={article.title}
              className="w-full object-cover max-h-[560px]"
            />
            <div className="p-3 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">
              Dokumentasi Risalah & Visual Kebijakan • Arsip Digital Dewan
            </div>
          </div>
        )}

        {/* Excerpt Lead */}
        <div className="my-8 p-6 rounded-2xl bg-[#FBF9F5] border-l-4 border-[#96702c] border-y border-r border-amber-100/70 text-slate-800">
          <p className="text-base sm:text-lg font-medium italic leading-relaxed">
            "{article.excerpt}"
          </p>
        </div>

        {/* Article Body */}
        <div id="article-body-container" className="pt-2">
          <MarkdownContent content={article.bodyContentMarkdown} />
        </div>

        {/* Author Bio Card */}
        <div className="my-14 rounded-3xl bg-slate-50 border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0">
              {theme?.officialPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white font-bold text-xl">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {member.fullName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  Penulis & Anggota Parlemen
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {theme?.bioBiography ||
                  `Mewakili aspirasi konstituen Daerah Pemilihan ${member.dapilName}. Mengawal transparansi penganggaran, advokasi regulasi daerah, dan pemberdayaan masyarakat.`}
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Fraksi {member.partyAffiliation} • {member.legislativeLevel?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Box */}
        <div className="my-10">
          <NewsletterSubscriptionBox
            member={member}
            theme={theme}
            subdomain={subdomain}
            variant="ARTICLE_FOOTER"
          />
        </div>

        {/* Public Citizen Discussion Comments */}
        <CitizenComments
          slug={slug}
          initialCommentCount={article.commentCount || 0}
        />
      </article>
    </div>
  </ParliamentShell>
  );
}


export default async function TenantArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
  searchParams?: Promise<{ preview_template?: string; preview_color?: string }>;
}) {
  const { subdomain, slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) notFound();

  const API_BASE_URL = getNormalizedApiUrl();




  let article = null;

  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    // Backend offline or timeout -> fallback to mock article
  }

  const { member, theme, portal, recentArticles = [], documents } = portalData;
  const effectiveTheme = {
    ...theme,
    ...(sp.preview_template ? { layoutTemplateId: sp.preview_template } : {}),
    ...(sp.preview_color ? { primaryHexColor: sp.preview_color } : {}),
  };
  const templateId = effectiveTheme?.layoutTemplateId || PortalTemplateId.POLARIS_INSIGHT;

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) notFound();

  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.polaris.id`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/artikel/${slug}`
    : (article.canonicalUrl || `${baseUrl}/${subdomain}/artikel/${slug}`);

  const isWebp = article.posterUrl && article.posterUrl.toLowerCase().includes('.webp');
  const hasJpgPngPoster =
    article.posterUrl &&
    article.posterUrl.startsWith('http') &&
    !isWebp;

  const articleOgImage = hasJpgPngPoster
    ? article.posterUrl
    : `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: [articleOgImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: member.fullName,
      jobTitle: `Anggota Parlemen (${member.legislativeLevel || 'DPR RI'})`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'POLARIS Civic Intelligence',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.ico`,
      },
    },
    articleSection: article.category || 'Kebijakan Publik',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: `${baseUrl}/${subdomain}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artikel',
        item: `${baseUrl}/${subdomain}/artikel`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  const articleWithCanonical = {
    ...article,
    canonicalUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {renderArticleContent({
        templateId,
        article: articleWithCanonical,
        member,
        effectiveTheme,
        subdomain,
        recentArticles,
        documents,
        slug,
      })}
    </>
  );
}
