'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const AGETHA_RUBY = {
  black: '#0F0F0F',
  cardDark: '#1A1A1A',
  cardHighlight: '#E50914',
  rubyRed: '#E50914',
  rubyDark: '#B91C1C',
  borderDark: '#262626',
  textMuted: '#9CA3AF',
  textLight: '#E5E7EB',
  white: '#FFFFFF',
};

export const AGETHA_FALLBACK_PHOTO = '/images/avatar-dewan-budi.jpg';

export function getAgethaMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Ahmad';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || AGETHA_RUBY.rubyRed;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || AGETHA_FALLBACK_PHOTO,
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
      'Mendedikasikan integritas, keahlian advokasi hukum, dan kepemimpinan aspiratif dalam mengawal suara warga daerah pemilihan menuju kebijakan daerah yang adil, transparan, dan berdampak nyata bagi kesejahteraan masyarakat.',
    officialEmail: `aspirasi@${subdomain || 'polaris'}.id`,
    officialPhone: '+62 812-3456-7890',
    instagramUsername:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi',
    portalTitle: theme?.portalTitle || 'Agetha Ruby',
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

export function useAgethaHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  return (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}preview_template=${encodeURIComponent(previewTemplate)}`;
    }
    return base;
  };
}

export const AGETHA_DEFAULT_ARTICLES = [
  {
    id: 'agetha-art-1',
    title: 'Strategi Pengawasan & Transparansi Realisasi APBD Demi Kepentingan Rakyat',
    slug: 'strategi-pengawasan-transparansi-apbd',
    category: 'Pengawasan Anggaran',
    date: '20 Okt 2026',
    publishedAt: '2026-10-20',
    readTime: '4 min baca',
    readingTime: '4 min baca',
    imageUrl: '/images/showcase-artikel-rapat.jpg',
    featuredImageUrl: '/images/showcase-artikel-rapat.jpg',
    excerpt:
      'Membedah alokasi pos anggaran infrastruktur jalan dan sarana air bersih agar tepat sasaran hingga ke pelosok desa.',
  },
  {
    id: 'agetha-art-2',
    title: 'Pengesahan Perda Perlindungan & Pemberdayaan Usaha Mikro di Daerah',
    slug: 'pengesahan-perda-perlindungan-umkm',
    category: 'Legislasi & Regulasi',
    date: '16 Okt 2026',
    publishedAt: '2026-10-16',
    readTime: '5 min baca',
    readingTime: '5 min baca',
    imageUrl: '/images/showcase-artikel-desa.jpg',
    featuredImageUrl: '/images/showcase-artikel-desa.jpg',
    excerpt:
      'Payung hukum daerah untuk melindungi produk lokal dan menjamin kemudahan akses permodalan tanpa bunga mencekik.',
  },
  {
    id: 'agetha-art-3',
    title: 'Catatan Reses: Menyerap Jeritan Petani dan Peningkatan Distribusi Pupuk',
    slug: 'catatan-reses-jeritan-petani-pupuk',
    category: 'Advokasi Warga',
    date: '12 Okt 2026',
    publishedAt: '2026-10-12',
    readTime: '3 min baca',
    readingTime: '3 min baca',
    imageUrl: '/images/showcase-artikel-dialog.jpg',
    featuredImageUrl: '/images/showcase-artikel-dialog.jpg',
    excerpt:
      'Komitmen langsung parlemen memastikan kuota pupuk subsidi tersalurkan tepat waktu sebelum musim tanam tiba.',
  },
  {
    id: 'agetha-art-4',
    title: 'Peningkatan Kualitas Sarana Kesehatan Puskesmas Pembantu di Wilayah Terpencil',
    slug: 'peningkatan-kualitas-sarana-puskesmas',
    category: 'Layanan Publik',
    date: '08 Okt 2026',
    publishedAt: '2026-10-08',
    readTime: '4 min baca',
    readingTime: '4 min baca',
    imageUrl: '/images/showcase-artikel-sidang.jpg',
    featuredImageUrl: '/images/showcase-artikel-sidang.jpg',
    excerpt:
      'Mendorong pengadaan ambulans desa dan ketersediaan tenaga medis siaga 24 jam untuk menjamin pertolongan pertama warga.',
  },
];

export const AGETHA_DEFAULT_INFOGRAPHICS = [
  {
    id: 'agetha-info-1',
    title: 'Infografis Ringkasan Postur APBD & Alokasi Anggaran Pendidikan 2026',
    category: 'Transparansi APBD',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    posterUrl: '/images/showcase-infografis-apbd.jpg',
    date: '18 Okt 2026',
    description: 'Rincian grafik alokasi anggaran fungsi pengawasan parlemen untuk sektor pendidikan dan beasiswa masyarakat tidak mampu.',
  },
  {
    id: 'agetha-info-2',
    title: 'Capaian 100 Hari Kerja: Penyerapan Aspirasi & Realisasi Pokir Dapil',
    category: 'Kinerja Dapil',
    imageUrl: '/images/showcase-infografis-reses.jpg',
    posterUrl: '/images/showcase-infografis-reses.jpg',
    date: '14 Okt 2026',
    description: 'Visualisasi sebaran 60+ program bantuan pokir dan renovasi fasilitas publik yang telah terealisasi di daerah pemilihan.',
  },
  {
    id: 'agetha-info-3',
    title: 'Alur Penyampaian & Tindak Lanjut Aspirasi Warga Bersama Fraksi Dewan',
    category: 'Pelayanan Publik',
    imageUrl: '/images/showcase-infografis-agenda.jpg',
    posterUrl: '/images/showcase-infografis-agenda.jpg',
    date: '09 Okt 2026',
    description: 'Diagram langkah verifikasi masukan warga dari posko dapil hingga dibawa ke rapat dengar pendapat komisi.',
  },
];
