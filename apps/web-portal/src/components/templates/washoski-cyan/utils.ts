'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const WASHOSKI_CYAN = {
  black: '#070707',
  pureBlack: '#000000',
  cardDark: '#111111',
  cyan: '#05DFD7',
  cyanNeon: '#00F2FE',
  cyanDim: 'rgba(5, 223, 215, 0.15)',
  borderDark: '#1E1E1E',
  textMuted: '#9CA3AF',
  textLight: '#E5E7EB',
  white: '#FFFFFF',
};

export const WASHOSKI_FALLBACK_PHOTO = '/images/avatar-dewan-budi.jpg';

export function getWashoskiMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Ahmad';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || WASHOSKI_CYAN.cyan;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || WASHOSKI_FALLBACK_PHOTO,
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
    portalTitle: theme?.portalTitle || 'Washoski Cyan',
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

export function useWashoskiHref(subdomain?: string) {
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

export const WASHOSKI_DEFAULT_ARTICLES = [
  {
    id: 'washoski-art-1',
    title: 'Transparansi Realisasi Pos Belanja APBD demi Pembangunan Tepat Sasaran',
    slug: 'transparansi-pos-belanja-apbd',
    category: 'Pengawasan Anggaran',
    date: '21 Okt 2026',
    publishedAt: '2026-10-21',
    readTime: '4 min baca',
    readingTime: '4 min baca',
    imageUrl: '/images/showcase-artikel-rapat.jpg',
    featuredImageUrl: '/images/showcase-artikel-rapat.jpg',
    excerpt:
      'Audit mendalam terhadap serapan belanja modal infrastruktur dasar untuk memastikan tidak ada alokasi fiktif yang merugikan rakyat.',
  },
  {
    id: 'washoski-art-2',
    title: 'Advokasi Payung Hukum Penguatan Ekonomi Kerakyatan & Koperasi Daerah',
    slug: 'advokasi-payung-hukum-ekonomi-kerakyatan',
    category: 'Legislasi & Perda',
    date: '17 Okt 2026',
    publishedAt: '2026-10-17',
    readTime: '5 min baca',
    readingTime: '5 min baca',
    imageUrl: '/images/showcase-artikel-desa.jpg',
    featuredImageUrl: '/images/showcase-artikel-desa.jpg',
    excerpt:
      'Menyusun kerangka regulasi perlindungan produk lokal serta kemudahan akses perbankan tanpa syarat berbelit bagi pengrajin desa.',
  },
  {
    id: 'washoski-art-3',
    title: 'Serap Aspirasi Masa Reses: Mengawal Kepastian Pasokan Air Irigasi & Bibit',
    slug: 'serap-aspirasi-reses-irigasi-bibit',
    category: 'Advokasi Warga',
    date: '13 Okt 2026',
    publishedAt: '2026-10-13',
    readTime: '3 min baca',
    readingTime: '3 min baca',
    imageUrl: '/images/showcase-artikel-dialog.jpg',
    featuredImageUrl: '/images/showcase-artikel-dialog.jpg',
    excerpt:
      'Hasil pertemuan tatap muka bersama gabungan kelompok tani guna mempercepat perbaikan bendungan sekunder sebelum musim hujan.',
  },
  {
    id: 'washoski-art-4',
    title: 'Standardisasi Layanan Kesehatan Puskesmas 24 Jam di Wilayah Pesisir & Pegunungan',
    slug: 'standardisasi-layanan-puskesmas-24-jam',
    category: 'Layanan Publik',
    date: '09 Okt 2026',
    publishedAt: '2026-10-09',
    readTime: '4 min baca',
    readingTime: '4 min baca',
    imageUrl: '/images/showcase-artikel-sidang.jpg',
    featuredImageUrl: '/images/showcase-artikel-sidang.jpg',
    excerpt:
      'Mendorong dinas kesehatan merekrut tenaga medis lokal dan menyediakan pos pertolongan gawat darurat lengkap di setiap kecamatan.',
  },
];

export const WASHOSKI_DEFAULT_INFOGRAPHICS = [
  {
    id: 'washoski-info-1',
    title: 'Visualisasi Sebaran Anggaran Fungsi Pengawasan APBD 2026',
    category: 'Transparansi APBD',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    posterUrl: '/images/showcase-infografis-apbd.jpg',
    date: '19 Okt 2026',
    description: 'Diagram proporsi belanja operasional versus belanja modal langsung untuk kepentingan sarana publik masyarakat.',
  },
  {
    id: 'washoski-info-2',
    title: 'Rekapitulasi 120+ Program Pokok Pikiran (Pokir) yang Terealisasi',
    category: 'Kinerja Parlemen',
    imageUrl: '/images/showcase-infografis-reses.jpg',
    posterUrl: '/images/showcase-infografis-reses.jpg',
    date: '15 Okt 2026',
    description: 'Peta sebaran renovasi ruang kelas sekolah, saluran drainase, dan bantuan alat pertanian di seluruh penjuru dapil.',
  },
  {
    id: 'washoski-info-3',
    title: 'Mekanisme & Alur Pengawalan Aspirasi Warga Hingga Rapat Paripurna',
    category: 'Pelayanan Publik',
    imageUrl: '/images/showcase-infografis-agenda.jpg',
    posterUrl: '/images/showcase-infografis-agenda.jpg',
    date: '10 Okt 2026',
    description: 'Panduan visual cara warga menyampaikan aduan infrastruktur dan tahapan tindak lanjut resmi oleh tim komisi.',
  },
];
