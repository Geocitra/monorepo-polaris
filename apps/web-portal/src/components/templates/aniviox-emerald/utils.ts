'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ANIVIOX_EMERALD = {
  bg: '#060A08',
  bgDark: '#080E0B',
  bgCard: '#0C1510',
  bgCardHover: '#101C15',
  border: '#15241C',
  borderLight: '#1E362A',
  borderEmerald: 'rgba(0, 240, 118, 0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3B8AD',
  textMuted: '#688073',
  textDim: '#44564D',
  accent: '#00F076',
  accentHover: '#00D96A',
  accentSubtle: 'rgba(0, 240, 118, 0.12)',
  glowEmerald: 'rgba(0, 240, 118, 0.25)',
};

export const ANIVIOX_FALLBACK_PHOTO = '/images/aniviox-hero-portrait.jpg';

export function getAnivioxMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Ahmad';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || ANIVIOX_EMERALD.accent;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || ANIVIOX_FALLBACK_PHOTO,
    dapil: clean(member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I Jawa Barat'),
    party: clean(member?.partyAffiliation || 'Fraksi Parlemen'),
    legislativeLevel: clean(member?.legislativeLevel || 'DPRD PROVINSI'),
    commissionName: clean(member?.commissionName || 'Komisi I (Pemerintahan & Hukum)'),
    headlineTagline:
      theme?.headlineTagline ||
      `Wakil Rakyat ${clean(member?.legislativeLevel || 'DPRD PROVINSI')} • Fraksi ${clean(member?.partyAffiliation || 'Parlemen')}`,
    bio:
      member?.bio ||
      member?.biography ||
      'Mendedikasikan integritas, keahlian advokasi kebijakan publik, dan transparansi legislatif dalam mengawal suara warga daerah pemilihan menuju pembangunan daerah yang adil, berkelanjutan, dan berdampak nyata bagi seluruh lapisan masyarakat.',
    officialEmail: `aspirasi@${subdomain || 'polaris'}.id`,
    officialPhone: '+62 812-3456-7890',
    instagramUsername:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi',
    portalTitle: theme?.portalTitle || 'Aniviox Emerald',
    primaryColor,
    name: officialFullName,
    address: 'Gedung Parlemen / Rumah Aspirasi Rakyat, Lantai 3 Ruang Fraksi',
    email: `aspirasi@${subdomain || 'polaris'}.id`,
    phone: '+62 812-3456-7890',
    instagramHandle:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi',
    instagramUrl: `https://instagram.com/${
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi'
    }`,
  };
}

export function useAnivioxHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (path: string) => {
    let resolvedPath = path;
    if (subdomain && !pathname?.startsWith(`/${subdomain}`)) {
      resolvedPath = `/${subdomain}${path === '/' ? '' : path}`;
    }

    const currentTemplate = searchParams?.get('template');
    if (currentTemplate) {
      const separator = resolvedPath.includes('?') ? '&' : '?';
      return `${resolvedPath}${separator}template=${encodeURIComponent(currentTemplate)}`;
    }
    return resolvedPath;
  };
}

export const ANIVIOX_DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    slug: 'arah-kebijakan-anggaran-pendidikan-daerah',
    title: 'Arah Kebijakan & Alokasi Anggaran Pendidikan Daerah 2026',
    category: 'Kebijakan Publik',
    categoryName: 'Kebijakan Publik',
    publishedAt: '2026-03-24',
    date: '24 Mar 2026',
    imageUrl: '/images/aniviox-card-1.jpg',
    excerpt:
      'Telaah komprehensif atas alokasi 20% fungsi anggaran pendidikan daerah untuk pemerataan fasilitas belajar mengajar dan beasiswa siswa prasejahtera.',
    content: `Pendidikan merupakan fondasi utama peradaban bangsa. Dalam penyusunan APBD tahun anggaran 2026, kami di komisi legislatif memastikan bahwa mandat alokasi minimal 20 persen anggaran pendidikan benar-benar terdistribusi secara substansial, bukan sekadar pemenuhan angka administratif belaka.

Fokus utama alokasi ini mencakup rehabilitasi ruang kelas rusak di wilayah pelosok, penguatan kompetensi guru daerah, dan jaminan beasiswa pendidikan tinggi bagi putra-putri daerah berprestasi dari keluarga prasejahtera. Kebijakan ini merupakan wujud nyata akuntabilitas kami dalam mengawal masa depan generasi muda.`,
  },
  {
    id: 'art-2',
    slug: 'penguatan-kedaulatan-pangan-dan-subsidi-pupuk',
    title: 'Penguatan Kedaulatan Pangan Daerah & Efektivitas Distribusi Pupuk',
    category: 'Pertanian & Pangan',
    categoryName: 'Pertanian & Pangan',
    publishedAt: '2026-03-18',
    date: '18 Mar 2026',
    imageUrl: '/images/ref-article-1.jpg',
    excerpt:
      'Langkah taktis parlemen memastikan ketersediaan pasokan pupuk bersubsidi dan perlindungan harga gabah di tingkat petani lokal saat panen raya.',
    content: `Ketahanan pangan daerah berawal dari kesejahteraan para petani di garis depan. Melalui rapat kerja bersama Dinas Pertanian dan distributor pupuk daerah, kami mengawal pembaruan sistem data kelompok tani (e-RDKK) agar subsidi pupuk tepat sasaran dan bebas dari praktik spekulasi harga.

Selain itu, skema dana cadangan stabilisasi pangan daerah telah disetujui guna menyerap hasil panen petani lokal dengan harga acuan yang layak, mencegah anjloknya harga saat panen raya serentak.`,
  },
  {
    id: 'art-3',
    slug: 'transparansi-perda-dan-digitalisasi-layanan-publik',
    title: 'Transparansi Perda & Akselerasi Digitalisasi Layanan Publik',
    category: 'Tata Kelola Pemerintahan',
    categoryName: 'Tata Kelola Pemerintahan',
    publishedAt: '2026-03-10',
    date: '10 Mar 2026',
    imageUrl: '/images/ref-article-2.jpg',
    excerpt:
      'Mendorong integrasi layanan birokrasi satu pintu guna memangkas pungli dan memberikan kepastian berusaha bagi pelaku UMKM di daerah pemilihan.',
    content: `Transformasi digital bukan sekadar tren teknologi, melainkan instrumen demokrasi untuk memberantas korupsi dan inefisiensi birokrasi. Bapemperda telah merampungkan revisi Perda Pelayanan Publik yang mewajibkan seluruh dinas mengintegrasikan sistem pelaporan dan izin usaha ke dalam platform digital terpadu.

Dengan sistem terintegrasi ini, masyarakat dapat memantau proses perizinan secara real-time dan memberikan umpan balik langsung terhadap kualitas layanan aparatur pemerintahan daerah.`,
  },
  {
    id: 'art-4',
    slug: 'mitigasi-bencana-dan-tata-ruang-berkelanjutan',
    title: 'Urgensi Mitigasi Bencana & Penataan Ruang Berkelanjutan',
    category: 'Lingkungan Hidup',
    categoryName: 'Lingkungan Hidup',
    publishedAt: '2026-02-28',
    date: '28 Feb 2026',
    imageUrl: '/images/ref-article-3.jpg',
    excerpt:
      'Advokasi alokasi dana tanggap darurat dan penertiban izin alih fungsi lahan resapan air untuk meminimalkan risiko banjir berkepanjangan.',
    content: `Bencana hidrometeorologi yang kian sering melanda kawasan pemukiman memerlukan tindakan preventif yang tegas, bukan penanganan reaktif semata. Parlemen mendesak penegakan hukum tata ruang terhadap alih fungsi hutan lindung dan kawasan resapan air di hulu sungai.

Kami juga mengawal peningkatan alokasi anggaran BPBD untuk sistem peringatan dini berbasis komunitas dan normalisasi drainase terintegrasi di wilayah rawan genangan.`,
  },
];

export const ANIVIOX_DEFAULT_INFOGRAPHICS = [
  {
    id: 'info-1',
    title: 'Alokasi APBD 2026: Sektor Pendidikan & Kesehatan Prioritas Warga',
    category: 'Transparansi APBD',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    badge: 'Fiskal Daerah',
    summary: 'Rincian alokasi belanja modal dan bantuan sosial untuk warga daerah pemilihan tahun anggaran berjalan.',
  },
  {
    id: 'info-2',
    title: 'Roadmap Perda Pangan: Perlindungan Petani & Stabilitas Harga Pasar',
    category: 'Kedaulatan Pangan',
    imageUrl: '/images/showcase-poster-surya.jpg',
    badge: 'Regulasi',
    summary: 'Infografis tahapan perumusan naskah akademik hingga pengesahan Perda perlindungan lahan pertanian pangan berkelanjutan.',
  },
  {
    id: 'info-3',
    title: 'Capaian Reses Masa Sidang: 120+ Aspirasi Terverifikasi & Ditindaklanjuti',
    category: 'Laporan Reses',
    imageUrl: '/images/article-crop-1.png',
    badge: 'Advokasi Warga',
    summary: 'Statistik aspirasi masyarakat per kecamatan yang telah masuk ke dalam pokok-pokok pikiran (Pokir) DPRD.',
  },
  {
    id: 'info-4',
    title: 'Infrastruktur Pedesaan: Progres Perbaikan Jalan & Jembatan Penghubung',
    category: 'Infrastruktur',
    imageUrl: '/images/article-crop-2.png',
    badge: 'Pembangunan',
    summary: 'Peta sebaran titik rehabilitasi jalan poros desa yang dibiayai melalui dana bantuan keuangan provinsi.',
  },
];
