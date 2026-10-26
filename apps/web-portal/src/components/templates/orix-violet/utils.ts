'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ORIX = {
  violet: '#3B0CB8',
  violetDark: '#22007C',
  violetLight: '#F3E8FF',
  violetAccent: '#7C3AED',
  yellow: '#F59E0B',
  dark: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
};

export const ORIX_FALLBACK_PHOTO = '/images/avatar-dewan-budi.jpg';

export function getOrixMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Ahmad';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || ORIX.violet;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || ORIX_FALLBACK_PHOTO,
    dapil: clean(member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I Jawa Barat'),
    party: clean(member?.partyAffiliation || 'Fraksi Parlemen'),
    legislativeLevel: clean(member?.legislativeLevel || 'DPRD PROVINSI'),
    commissionName: clean(member?.commissionName || 'Komisi I (Pemerintahan & Hukum)'),
    headlineTagline:
      theme?.headlineTagline ||
      `${clean(member?.legislativeLevel || 'DPRD PROVINSI')} • ${clean(member?.partyAffiliation || 'Fraksi Parlemen')}`,
    bio:
      member?.bio ||
      member?.biography ||
      'Mendedikasikan integritas, keahlian hukum, dan kepemimpinan aspiratif dalam mengawal suara warga daerah pemilihan menuju kebijakan daerah yang adil, transparan, dan berdampak nyata bagi kesejahteraan masyarakat.',
    officialEmail: `aspirasi@${subdomain || 'polaris'}.id`,
    officialPhone: '+62 812-3456-7890',
    instagramUsername:
      member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'polaris.advokasi',
    portalTitle: theme?.portalTitle || 'Orix',
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

export function useOrixHref(subdomain?: string) {
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

export const ORIX_DEFAULT_ARTICLES = [
  {
    id: 'orix-art-1',
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
    id: 'orix-art-2',
    slug: 'transformasi-digital-aspirasi-parlemen',
    title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Parlemen Daerah',
    category: 'Transformasi Digital',
    excerpt:
      'Mewujudkan transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi modern berbasis data riil.',
    featuredImageUrl: '/images/ref-article-1.jpg',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readingTime: '5 menit baca',
  },
  {
    id: 'orix-art-3',
    slug: 'penguatan-kualitas-pendidikan-vokasi',
    title: 'Penguatan Mutu Pendidikan Vokasi dan Pelatihan Kerja Generasi Muda',
    category: 'Pendidikan',
    excerpt:
      'Mendorong revitalisasi kurikulum SMK dan kemitraan industri untuk menekan angka pengangguran terbuka di wilayah dapil.',
    featuredImageUrl: '/images/ref-article-2.jpg',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    readingTime: '3 menit baca',
  },
  {
    id: 'orix-art-4',
    slug: 'pengawasan-infrastruktur-dasar-desa',
    title: 'Pengawasan Proyek Strategis Air Bersih dan Sanitasi di Pelosok Desa',
    category: 'Infrastruktur',
    excerpt:
      'Memastikan anggaran pembangunan fasilitas dasar terserap tepat waktu dan tepat sasaran tanpa kendala teknis di lapangan.',
    featuredImageUrl: '/images/ref-article-3.jpg',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    readingTime: '4 menit baca',
  },
];

export const ORIX_DEFAULT_INFOGRAPHICS = [
  {
    id: 'orix-info-1',
    title: 'Transparansi Realisasi APBD Sektor Pendidikan & Beasiswa Daerah',
    category: 'APBD & Anggaran',
    metric: 'Rp 45,2 M',
    metricLabel: 'Alokasi Kawalan',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date().toISOString(),
    description:
      'Rincian peruntukan fungsi pendidikan, renovasi gedung sekolah, serta beasiswa siswa berprestasi dan kurang mampu di seluruh kabupaten.',
  },
  {
    id: 'orix-info-2',
    title: 'Peta Penyerapan Aspirasi Warga Reses Masa Sidang II',
    category: 'Aspirasi Warga',
    metric: '92,4%',
    metricLabel: 'Tindak Lanjut Dinas',
    imageUrl: '/images/showcase-poster-surya.jpg',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    description:
      'Distribusi 490+ aspirasi warga yang masuk melalui kanal digital dan posko reses, dikelompokkan berdasarkan prioritas sektor infrastruktur dan kesehatan.',
  },
  {
    id: 'orix-info-3',
    title: 'Capaian Legislasi & Pengesahan Perda Inisiatif Kerakyatan',
    category: 'Kinerja Legislasi',
    metric: '14 Perda',
    metricLabel: 'Telah Diundangkan',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    description:
      'Daftar rancangan peraturan daerah yang telah rampung dibahas bersama eksekutif, mencakup perlindungan petani, UMKM, dan tata kelola lingkungan hidup.',
  },
];
