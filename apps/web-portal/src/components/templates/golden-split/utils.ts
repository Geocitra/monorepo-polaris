'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const GOLDEN = {
  bgDark: '#1E1E1E',
  bgSection: '#252525',
  bgCard: '#2E2E2E',
  gold: '#FFA800',
  goldLight: '#FFB82E',
  goldDark: '#E09400',
  textMuted: '#9E9E9E',
};

export const GOLDEN_FALLBACK_PHOTO = '/images/dewan-ahmad-fauzi-cutout.png';

export function getGoldenMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Jonanda';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || '#FFA800';
  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || GOLDEN_FALLBACK_PHOTO,
    dapil: clean(member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I Jawa Barat'),
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

export function useGoldenHref(subdomain?: string) {
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

export function getArticleImage(a: any) {
  return (
    a?.featuredImageUrl ||
    a?.coverUrl ||
    a?.imageUrl ||
    a?.thumbnail ||
    a?.posterUrl ||
    '/images/showcase-artikel-pertanian.jpg'
  );
}

export function getArticleCategory(a: any) {
  return a?.issueCategory || a?.category || a?.categoryName || 'Kajian Kebijakan';
}

export function getArticleExcerpt(a: any) {
  return a?.excerpt || a?.summary || '';
}

export const GOLDEN_DEFAULT_ARTICLES = [
  {
    id: 'gold-art-1',
    slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
    title: 'Kajian Strategis Alokasi APBD 2026 untuk Pemulihan Ekonomi Kerakyatan',
    category: 'Kajian APBD',
    excerpt:
      'Analisis komprehensif formulasi dan pengawasan belanja modal daerah guna mempercepat stimulus UMKM serta jaring pengaman sosial konstituen.',
    featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
    createdAt: new Date().toISOString(),
    readingTime: '4 menit baca',
  },
  {
    id: 'gold-art-2',
    slug: 'transformasi-digital-aspirasi-parlemen',
    title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Parlemen Daerah',
    category: 'Transformasi Digital',
    excerpt:
      'Mewujudkan transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi modern berbasis data riil.',
    featuredImageUrl: '/images/ref-article-1.jpg',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readingTime: '5 menit baca',
  },
  {
    id: 'gold-art-3',
    slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
    title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan',
    category: 'Regulasi Daerah',
    excerpt:
      'Memperkuat payung hukum perda tata ruang untuk menjamin kedaulatan pangan lokal, kepastian irigasi, dan perlindungan kelompok tani.',
    featuredImageUrl: '/images/ref-article-2.jpg',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    readingTime: '6 menit baca',
  },
  {
    id: 'gold-art-4',
    slug: 'evaluasi-akuntabilitas-penyerapan-anggaran',
    title: 'Evaluasi Akuntabilitas Penyerapan Belanja Modal Triwulan III',
    category: 'Kajian APBD',
    excerpt:
      'Telaah capaian program infrastruktur dasar dan rekomendasi percepatan realisasi lelang proyek fisik tanpa mengurangi kualitas konstruksi.',
    featuredImageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    readingTime: '5 menit baca',
  },
  {
    id: 'gold-art-5',
    slug: 'penguatan-perda-bantuan-hukum-masyarakat-miskin',
    title: 'Urgensi Perluasan Perda Bantuan Hukum bagi Warga Prasejahtera',
    category: 'Regulasi Daerah',
    excerpt:
      'Menjamin kesetaraan hak di muka hukum dengan menambah alokasi pos advokasi gratis bagi masyarakat yang membutuhkan kepastian hukum.',
    featuredImageUrl: '/images/ref-article-3.jpg',
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    readingTime: '4 menit baca',
  },
  {
    id: 'gold-art-6',
    slug: 'reses-serap-aspirasi-infrastruktur-desa',
    title: 'Reses Masa Sidang: Serap Aspirasi & Tinjau Titik Jalan Rusak',
    category: 'Kegiatan Reses',
    excerpt:
      'Rangkuman temuan lapangan dan usulan prioritas warga untuk perbaikan jalan poros desa serta normalisasi saluran irigasi pertanian.',
    featuredImageUrl: '/images/default-article.jpg',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    readingTime: '3 menit baca',
  },
];

export const GOLDEN_DEFAULT_INFOGRAPHICS = [
  {
    id: 'gold-info-1',
    title: 'Transparansi Realisasi APBD Sektor Pendidikan & Beasiswa',
    category: 'APBD & Anggaran',
    metric: 'Rp 45,2 M',
    metricLabel: 'Alokasi Kawalan',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date().toISOString(),
    description: 'Perincian alokasi fungsi pendidikan, bantuan sarana belajar, dan beasiswa bagi siswa daerah berprestasi.',
  },
  {
    id: 'gold-info-2',
    title: 'Peta Capaian Infrastruktur Konektivitas Desa & Jembatan',
    category: 'Infrastruktur',
    metric: '98,4%',
    metricLabel: 'Target Tuntas',
    imageUrl: '/images/showcase-poster-surya.jpg',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    description: 'Monitoring berkala perbaikan jalan poros desa, jembatan penghubung antar-kecamatan, dan drainase pengendali banjir.',
  },
  {
    id: 'gold-info-3',
    title: 'Distribusi Alsintan & Bantuan Pupuk Petani',
    category: 'Pertanian & Pangan',
    metric: '1.420+',
    metricLabel: 'Kelompok Tani',
    imageUrl: '/images/article-crop-2.png',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    description: 'Penyaluran traktor, pompa air sawah, dan bantuan pupuk bersubsidi tepat sasaran bagi kelompok tani.',
  },
  {
    id: 'gold-info-4',
    title: 'Kanal Layanan Aspirasi & Tindak Lanjut 24/7',
    category: 'Pelayanan Publik',
    metric: '24/7',
    metricLabel: 'Respon Cepat',
    imageUrl: '/images/parliament-panoramic-banner.png',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    description: 'Rekapitulasi berkala tindak lanjut aspirasi warga melalui rapat dengar pendapat dan advokasi komisi.',
  },
  {
    id: 'gold-info-5',
    title: 'Revitalisasi Fasilitas Puskesmas Rawat Inap & Ambulans',
    category: 'Kesehatan',
    metric: '32 Unit',
    metricLabel: 'Fasilitas Layanan',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    description: 'Pengadaan ambulans siaga desa dan peningkatan ketersediaan obat generik esensial di tingkat kecamatan.',
  },
  {
    id: 'gold-info-6',
    title: 'Digitalisasi Sentra UMKM & Pasar Tradisional',
    category: 'Ekonomi Kerakyatan',
    metric: '850+',
    metricLabel: 'Pedagang Binaan',
    imageUrl: '/images/article-crop-1.png',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    description: 'Pelatihan transaksi digital QRIS, fasilitasi sertifikasi halal, dan pendampingan izin usaha mikro.',
  },
];
