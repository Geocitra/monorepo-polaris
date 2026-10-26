'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const LAILA_SAKURA = {
  bg: '#080D1A',
  bgDark: '#050811',
  bgCard: '#0D1527',
  bgCardHover: '#131F38',
  border: '#1E2B42',
  borderLight: '#263754',
  borderPink: 'rgba(255, 77, 141, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0ABC0',
  textMuted: '#64748B',
  accent: '#FF4D8D', // Hot Sakura Pink
  accentSecondary: '#FF2E74',
  accentSubtle: 'rgba(255, 77, 141, 0.12)',
  glowPink: 'rgba(255, 77, 141, 0.4)',
  capsuleBg: '#FFD1DC',
  capsuleText: '#7A0E37',
};

export const LAILA_FALLBACK_PHOTO = '/images/laila-sakura-hero.jpg';

export function getLailaMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Laila';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || LAILA_SAKURA.accent;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || LAILA_FALLBACK_PHOTO,
    dapil: clean(member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I Jawa Barat'),
    party: clean(member?.partyAffiliation || 'Fraksi Parlemen'),
    legislativeLevel: clean(member?.legislativeLevel || 'DPRD PROVINSI'),
    commissionName: clean(member?.commissionName || 'Komisi I (Pemerintahan & Hukum)'),
    headlineTagline:
      theme?.headlineTagline ||
      `Anggota ${clean(member?.legislativeLevel || 'DPRD PROVINSI')} • Fraksi ${clean(member?.partyAffiliation || 'Parlemen')}`,
    bio:
      member?.bio ||
      member?.biography ||
      'Mendedikasikan integritas, keahlian advokasi kebijakan publik, dan transparansi legislatif dalam mengawal suara warga daerah pemilihan menuju pembangunan daerah yang adil, humanis, dan berdampak nyata bagi seluruh masyarakat.',
    officialEmail: `aspirasi@${subdomain || 'polaris'}.id`,
    officialPhone: '+62 812-3456-7890',
    instagramUsername:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'laila.advokasi',
    portalTitle: theme?.portalTitle || 'Laila Sakura',
    primaryColor,
    name: officialFullName,
    address: 'Gedung Parlemen / Rumah Aspirasi Rakyat, Lantai 3 Ruang Fraksi',
    email: `aspirasi@${subdomain || 'polaris'}.id`,
    phone: '+62 812-3456-7890',
    instagramHandle:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'laila.advokasi',
    instagramUrl: `https://instagram.com/${
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'laila.advokasi'
    }`,
  };
}

export function useLailaHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (path: string) => {
    let resolvedPath = path;
    if (subdomain && !pathname?.startsWith(`/${subdomain}`)) {
      resolvedPath = `/${subdomain}${path === '/' ? '' : path}`;
    }

    const currentTemplate = searchParams?.get('preview_template') || searchParams?.get('template');
    if (currentTemplate) {
      const separator = resolvedPath.includes('?') ? '&' : '?';
      return `${resolvedPath}${separator}preview_template=${encodeURIComponent(currentTemplate)}`;
    }
    return resolvedPath;
  };
}

export const LAILA_DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    slug: 'arah-kebijakan-anggaran-pendidikan-daerah',
    title: 'Arah Kebijakan & Alokasi Anggaran Pendidikan Daerah 2026',
    category: 'Kebijakan Publik',
    publishedAt: '2026-03-24',
    date: '2026',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
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
    publishedAt: '2026-03-18',
    date: '2026',
    imageUrl: '/images/aniviox-card-1.jpg',
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
    publishedAt: '2026-03-10',
    date: '2025',
    imageUrl: '/images/ref-article-1.jpg',
    excerpt:
      'Mendorong integrasi layanan birokrasi satu pintu guna memangkas pungli dan memberikan kepastian berusaha bagi pelaku UMKM di daerah pemilihan.',
    content: `Transformasi digital bukan sekadar tren teknologi, melainkan instrumen demokrasi untuk memberantas korupsi dan inefisiensi birokrasi. Bapemperda telah merampungkan revisi Perda Pelayanan Publik yang mewajibkan seluruh dinas mengintegrasikan sistem pelaporan dan izin usaha ke dalam platform digital terpadu.

Dengan sistem terintegrasi ini, masyarakat dapat memantau proses perizinan secara real-time dan memberikan umpan balik langsung terhadap kualitas layanan aparatur pemerintahan daerah.`,
  },
];

export const LAILA_DEFAULT_INFOGRAPHICS = [
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
];
