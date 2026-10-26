'use client';

import { usePathname } from 'next/navigation';

export const NEXORA_THEME = {
  bgLilac: '#F4F0FF',
  bgCard: '#FFFFFF',
  purplePrimary: '#8262FE',
  purpleDark: '#7048E8',
  purpleDeep: '#5F3DC4',
  purpleLight: '#EDE9FE',
  purpleTint: '#F5F3FF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  borderLight: '#E2E8F0',
  borderPurple: '#DDD6FE',
};

export const NEXORA_DEFAULT_HERO_PORTRAIT = '/images/aniviox-hero-portrait.jpg';

export const NEXORA_DEFAULT_ARTICLES = [
  {
    id: 'nx-art-1',
    title: 'Transformasi Digital Sektor UMKM: Membuka Akses Pasar Global untuk Produk Lokal',
    slug: 'transformasi-digital-umkm-pasar-global',
    category: 'Ekonomi Kreatif & UMKM',
    publishedAt: '2026-10-18T09:00:00Z',
    readingTime: '4 menit baca',
    featuredImageUrl: '/images/ref-article-1.jpg',
    excerpt:
      'Perlindungan dan akselerasi perizinan terpadu menjamin pegiat usaha kreatif daerah sanggup berkompetisi di platform global modern tanpa terhambat birokrasi konvensional.',
  },
  {
    id: 'nx-art-2',
    title: 'Kemandirian Pangan Daerah: Penguatan Rantai Pasok Petani & Nelayan Konstituen',
    slug: 'kemandirian-pangan-penguatan-rantai-pasok',
    category: 'Kesejahteraan Rakyat',
    publishedAt: '2026-10-14T08:30:00Z',
    readingTime: '5 menit baca',
    featuredImageUrl: '/images/ref-article-2.jpg',
    excerpt:
      'Infrastruktur logistik pedesaan serta kepastian serapan hasil tani oleh BUMD memangkas disparitas harga di tingkat pasar induk dan menjamin kesejahteraan petani.',
  },
  {
    id: 'nx-art-3',
    title: 'Transparansi Penganggaran Publik: Kawal Efektivitas Dana Desa Berkelanjutan',
    slug: 'transparansi-penganggaran-dana-desa-berkelanjutan',
    category: 'Akuntabilitas Legislasi',
    publishedAt: '2026-10-09T14:15:00Z',
    readingTime: '6 menit baca',
    featuredImageUrl: '/images/ref-article-3.jpg',
    excerpt:
      'Mendorong audit digital partisipatif agar setiap rupiah dana perimbangan terdistribusi tepat sasaran guna pembangunan fasilitas sanitasi dan pendidikan dasar.',
  },
];

export const NEXORA_DEFAULT_INFOGRAPHICS = [
  {
    id: 'nx-info-1',
    title: 'Peta Serapan Alokasi APBD Dapil 2026',
    category: 'Transparansi Anggaran',
    badge: 'Infografis Resmi',
    imageUrl: '/images/showcase-infografis-apbd.jpg',
    summary:
      'Visualisasi rincian anggaran infrastruktur irigasi, bantuan bibit unggul, serta fasilitas kesehatan tingkat pertama yang berhasil disalurkan sepanjang tahun 2026.',
  },
  {
    id: 'nx-info-2',
    title: 'Capaian Legislasi & Advokasi Hak Konstituen',
    category: 'Kinerja Parlemen',
    badge: 'Laporan Kinerja',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
    summary:
      'Rekapitulasi 14 RUU inisiatif, 120 rapat dengar pendapat umum, dan penyelesaian lebih dari 1.200 pengaduan warga melalui posko aspirasi daerah pemilihan.',
  },
  {
    id: 'nx-info-3',
    title: 'Kemandirian Energi Bersih & UMKM Ramah Lingkungan',
    category: 'Pemberdayaan Daerah',
    badge: 'Program Prioritas',
    imageUrl: '/images/showcase-poster-surya.jpg',
    summary:
      'Roadmap instalasi solar cell komunal bagi sentra pengeringan hasil perikanan rakyat guna menekan ongkos produksi hingga 35% per siklus panen.',
  },
];

export function getNexoraMemberInfo(member: any, theme: any, subdomain?: string) {
  const fullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Ahmad Fauzi, S.T., M.M.';

  const callName =
    member?.shortName ||
    fullName.split(' ')[0] ||
    'Ahmad';

  const title =
    member?.officialTitle ||
    'Anggota Dewan Perwakilan Rakyat Republik Indonesia';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    'Mendedikasikan amanah rakyat untuk memperjuangkan keadilan sosial, mendorong transparansi kebijakan, dan mengakselerasi kesejahteraan masyarakat melalui kerja nyata di parlemen.';

  const avatar =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    NEXORA_DEFAULT_HERO_PORTRAIT;

  const email = member?.contactEmail || theme?.contactEmail || 'kontak@polaris.parlemen.go.id';
  const phone = member?.contactPhone || theme?.contactPhone || '+62 811-9876-5432';
  const address =
    member?.officeAddress ||
    theme?.officeAddress ||
    'Gedung Nusantara I DPR RI, Jl. Jend. Gatot Subroto, Senayan, Jakarta Pusat';

  const instagramHandle =
    member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'ahmadfauzi.official';
  const instagramUrl = `https://instagram.com/${instagramHandle}`;

  const primaryColor = theme?.primaryHexColor || NEXORA_THEME.purplePrimary;

  return {
    fullName,
    callName,
    title,
    party,
    dapil,
    bio,
    avatar,
    email,
    phone,
    address,
    instagramHandle,
    instagramUrl,
    primaryColor,
  };
}

export function useNexoraHref(subdomain?: string) {
  const pathname = usePathname() || '';

  return (path: string) => {
    if (!subdomain) return path;

    const segments = pathname.split('/').filter(Boolean);
    const hasSubdomainPrefix = segments[0] === subdomain;

    if (hasSubdomainPrefix) {
      if (path === '/' || path === '') return `/${subdomain}`;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `/${subdomain}${cleanPath}`;
    }

    return path;
  };
}
