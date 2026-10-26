'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const CRIMSON = {
  bg: '#0B0B0B',
  bgAlt: '#121212',
  card: '#1A1A1A',
  red: '#D62828',
  redHover: '#B71C1C',
};

export const CRIMSON_FALLBACK_PHOTO = '/images/dewan-ahmad-fauzi-cutout.png';

export function getCrimsonMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Jonanda';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || '#D62828';
  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || CRIMSON_FALLBACK_PHOTO,
    dapil: clean(member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I'),
    party: clean(member?.partyAffiliation || 'Fraksi Parlemen'),
    legislativeLevel: clean(member?.legislativeLevel || 'DPRD PROVINSI'),
    commissionName: clean(member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)'),
    bio: member?.bio || member?.biography || '',
    officialEmail: `aspirasi@${subdomain || 'polaris'}.id`,
    officialPhone: '+62 812-3456-7890',
    instagramUsername:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi',
    portalTitle: theme?.portalTitle || 'POLARIS',
    primaryColor,
  };
}

export function useCrimsonHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  return (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };
}

/** Normalised article accessors (API data + fallback data). */
export function articleImage(a: any) {
  return (
    a?.featuredImageUrl || a?.coverUrl || a?.imageUrl || a?.thumbnail || a?.posterUrl ||
    '/images/showcase-artikel-pertanian.jpg'
  );
}
export function articleCategory(a: any) {
  return a?.issueCategory || a?.category || a?.categoryName || 'Kajian Kebijakan';
}
export function articleExcerpt(a: any) {
  return a?.excerpt || a?.summary || '';
}

export const CRIMSON_DEFAULT_ARTICLES = [
  {
    id: 'cn-art-1',
    slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
    title: 'Kajian Strategis Alokasi APBD 2026 untuk Pemulihan Ekonomi Kerakyatan',
    category: 'Kajian APBD',
    excerpt:
      'Analisis formulasi dan pengawasan belanja modal daerah guna mempercepat stimulus UMKM serta jaring pengaman sosial konstituen.',
    featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
    createdAt: new Date().toISOString(),
    readingTime: '4 menit baca',
  },
  {
    id: 'cn-art-2',
    slug: 'transformasi-digital-aspirasi-parlemen',
    title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Parlemen Daerah',
    category: 'Transformasi Digital',
    excerpt:
      'Transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi berbasis data riil.',
    featuredImageUrl: '/images/ref-article-1.jpg',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readingTime: '5 menit baca',
  },
  {
    id: 'cn-art-3',
    slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
    title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan',
    category: 'Regulasi Daerah',
    excerpt:
      'Memperkuat payung hukum perda tata ruang untuk menjamin kedaulatan pangan lokal dan kesejahteraan kelompok tani.',
    featuredImageUrl: '/images/ref-article-2.jpg',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    readingTime: '6 menit baca',
  },
  {
    id: 'cn-art-4',
    slug: 'evaluasi-akuntabilitas-penyerapan-anggaran',
    title: 'Evaluasi Akuntabilitas Penyerapan Belanja Modal Triwulan III',
    category: 'Kajian APBD',
    excerpt:
      'Telaah capaian program infrastruktur dasar dan rekomendasi percepatan realisasi lelang proyek fisik.',
    featuredImageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    readingTime: '5 menit baca',
  },
  {
    id: 'cn-art-5',
    slug: 'penguatan-perda-bantuan-hukum-masyarakat-miskin',
    title: 'Urgensi Perluasan Perda Bantuan Hukum bagi Warga Prasejahtera',
    category: 'Regulasi Daerah',
    excerpt:
      'Menjamin kesetaraan hak di muka hukum dengan menambah pos advokasi gratis bagi masyarakat kurang mampu.',
    featuredImageUrl: '/images/ref-article-3.jpg',
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    readingTime: '4 menit baca',
  },
  {
    id: 'cn-art-6',
    slug: 'reses-serap-aspirasi-infrastruktur-desa',
    title: 'Reses Masa Sidang II: Serap Aspirasi Infrastruktur Desa',
    category: 'Kegiatan Reses',
    excerpt:
      'Rangkuman temuan lapangan dan usulan prioritas warga untuk perbaikan jalan poros desa dan irigasi.',
    featuredImageUrl: '/images/default-article.jpg',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    readingTime: '3 menit baca',
  },
];

export const CRIMSON_DEFAULT_INFOGRAPHICS = [
  {
    id: 'cn-info-1',
    title: 'Transparansi Realisasi APBD Sektor Pendidikan & Beasiswa',
    category: 'APBD & Anggaran',
    metric: 'Rp 45,2 M',
    metricLabel: 'Alokasi Kawalan',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date().toISOString(),
    description: 'Perincian alokasi fungsi pendidikan, bantuan operasional, dan beasiswa putra-putri daerah.',
  },
  {
    id: 'cn-info-2',
    title: 'Peta Capaian Infrastruktur Konektivitas Desa',
    category: 'Infrastruktur',
    metric: '98,4%',
    metricLabel: 'Target Tuntas',
    imageUrl: '/images/showcase-poster-surya.jpg',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    description: 'Monitoring perbaikan jalan poros desa, jembatan penghubung, dan drainase pengendali banjir.',
  },
  {
    id: 'cn-info-3',
    title: 'Distribusi Alsintan & Pupuk Bersubsidi Petani',
    category: 'Pertanian & Pangan',
    metric: '1.420+',
    metricLabel: 'Kelompok Tani',
    imageUrl: '/images/article-crop-2.png',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    description: 'Penyaluran traktor, pompa air, dan pupuk bersubsidi tepat sasaran di seluruh dapil.',
  },
  {
    id: 'cn-info-4',
    title: 'Kanal Layanan Aspirasi & Advokasi Konstituen 24/7',
    category: 'Pelayanan Publik',
    metric: '24/7',
    metricLabel: 'Respon Cepat',
    imageUrl: '/images/parliament-panoramic-banner.png',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    description: 'Rekapitulasi tindak lanjut aspirasi warga melalui RDPU dan advokasi lintas komisi.',
  },
  {
    id: 'cn-info-5',
    title: 'Revitalisasi Fasilitas Puskesmas Rawat Inap',
    category: 'Kesehatan',
    metric: '32 Unit',
    metricLabel: 'Fasilitas',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    description: 'Pengadaan ambulans siaga desa dan ketersediaan obat generik esensial di kecamatan.',
  },
  {
    id: 'cn-info-6',
    title: 'Digitalisasi Sentra UMKM & Pasar Tradisional',
    category: 'Ekonomi Kerakyatan',
    metric: '850+',
    metricLabel: 'Pedagang Binaan',
    imageUrl: '/images/article-crop-1.png',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    description: 'Pelatihan QRIS, sertifikasi halal gratis, dan fasilitasi merek dagang usaha mikro.',
  },
];
