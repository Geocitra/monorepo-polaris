'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ARIK_NOIR = {
  bg: '#0A0A0A',
  bgCard: '#111111',
  bgCardHover: '#161616',
  border: '#1C1C1C',
  borderLight: '#2A2A2A',
  textPrimary: '#F5F2EB',
  textChampagne: '#E8DCC4',
  textGold: '#C5A880',
  textMuted: '#8E8A83',
  textDim: '#5C5852',
  accentGold: '#D4AF37',
};

export const ARIK_FALLBACK_PHOTO = '/images/avatar-dewan-budi.jpg';

export function getArikMemberInfo(member: any, theme: any, subdomain?: string) {
  const officialFullName: string =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] ||
    'Ahmad';
  const clean = (v: string) => (v || '').replace(/_/g, ' ');
  const primaryColor: string = theme?.primaryHexColor || ARIK_NOIR.textChampagne;

  return {
    officialFullName,
    firstName,
    photoUrl: theme?.officialPhotoUrl || member?.photoUrl || ARIK_FALLBACK_PHOTO,
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
    portalTitle: theme?.portalTitle || 'Arik Noir',
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

export function useArikHref(subdomain?: string) {
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

export const ARIK_DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    slug: 'arah-kebijakan-anggaran-pendidikan-daerah',
    title: 'Arah Kebijakan & Alokasi Anggaran Pendidikan Daerah 2026',
    category: 'Kebijakan Publik',
    categoryName: 'Kebijakan Publik',
    publishedAt: '2026-03-24',
    date: '24 Mar 2026',
    imageUrl: '/images/showcase-artikel-rapat.jpg',
    excerpt:
      'Telaah komprehensif atas alokasi 20% fungsi anggaran pendidikan daerah untuk pemerataan fasilitas belajar mengajar dan beasiswa siswa prasejahtera.',
    content: `Pendidikan merupakan fondasi utama peradaban bangsa. Dalam penyusunan APBD tahun anggaran 2026, kami di komisi legislatif memastikan bahwa mandat alokasi minimal 20 persen anggaran pendidikan benar-benar terdistribusi secara substansial, bukan sekadar pemenuhan angka administratif belaka.

Fokus utama alokasi ini mencakup rehabilitasi ruang kelas rusak di wilayah pelosok, penguatan kompetensi guru daerah, dan jaminan beasiswa pendidikan tinggi bagi putra-putri daerah berprestasi dari keluarga prasejahtera. Kebijakan ini merupakan wujud nyata akuntabilitas kami dalam mengawal masa depan generasi muda.`,
  },
  {
    id: 'art-2',
    slug: 'penguatan-kedaulatan-pangan-dan-subsidi-pupuk',
    title: 'Penguatan Kedaulatan Pangan Lokal & Distribusi Pupuk Petani',
    category: 'Agraria & Pangan',
    categoryName: 'Agraria & Pangan',
    publishedAt: '2026-03-18',
    date: '18 Mar 2026',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
    excerpt:
      'Mendorong integrasi rantai pasok gabah lokal dan digitalisasi pendistribusian pupuk bersubsidi guna melindungi kesejahteraan petani desa.',
    content: `Sektor pertanian adalah penopang kehidupan bangsa yang kerap menghadapi kerentanan harga pascapanen dan kelangkaan pupuk. Kami terus memperjuangkan subsidi pupuk tepat sasaran melalui integrasi data petani berbasis kartu digital.

Selain itu, pembentukan regulasi perlindungan lahan pertanian pangan berkelanjutan (LP2B) terus dikawal agar alih fungsi lahan sawah produktif dapat dihentikan demi menjaga ketahanan pangan daerah jangka panjang.`,
  },
  {
    id: 'art-3',
    slug: 'transparansi-apbd-dan-partisipasi-warga',
    title: 'Digitalisasi Musrenbang: Membuka Ruang Aspirasi Warga Berbasis Bukti',
    category: 'Tata Kelola',
    categoryName: 'Tata Kelola',
    publishedAt: '2026-03-10',
    date: '10 Mar 2026',
    imageUrl: '/images/showcase-artikel-umkm.jpg',
    excerpt:
      'Pemanfaatan platform digital dalam penjaringan aspirasi konstituen agar setiap usulan warga dapat dilacak secara transparan dari tingkat desa.',
    content: `Transparansi adalah benteng utama pencegahan korupsi anggaran. Melalui inisiatif parlemen modern, kami mendorong digitalisasi menyeluruh proses Musrenbang dan penyerapan pokok-pokok pikiran (Pokir) anggota dewan.

Masyarakat kini memiliki hak dan kemudahan memantau status usulan pembangunan jalan, jembatan, hingga bantuan sosial secara online tanpa sekat birokrasi yang berbelit.`,
  },
  {
    id: 'art-4',
    slug: 'pemberdayaan-ekonomi-kreatif-dan-umkm-desa',
    title: 'Akselerasi Bantuan Permodalan & Sertifikasi Halal UMKM Daerah',
    category: 'Ekonomi Kerakyatan',
    categoryName: 'Ekonomi Kerakyatan',
    publishedAt: '2026-02-28',
    date: '28 Feb 2026',
    imageUrl: '/images/showcase-infografis-anggaran.jpg',
    excerpt:
      'Kerangka program kemitraan BUMD dengan pelaku usaha mikro untuk membuka akses pasar ekspor dan pembiayaan bunga rendah.',
    content: `UMKM adalah motor penggerak roda ekonomi daerah yang paling tangguh. Kebijakan pendampingan legalitas, sertifikasi halal gratis, serta akses kredit usaha rakyat bersubsidi terus digulirkan melalui sinergi legislatif bersama dinas terkait.`,
  },
];

export const ARIK_DEFAULT_INFOGRAPHICS = [
  {
    id: 'info-1',
    slug: 'postur-apbd-2026-prioritas-rakyat',
    title: 'Postur APBD 2026: Alokasi Belanja Prioritas Rakyat',
    category: 'Transparansi Fiskal',
    publishedAt: '2026-03-20',
    date: '20 Mar 2026',
    posterUrl: '/images/showcase-infografis-anggaran.jpg',
    imageUrl: '/images/showcase-infografis-anggaran.jpg',
    summary:
      'Visualisasi rincian pembagian belanja modal, belanja sosial, dan pemenuhan alokasi mandatory spending pendidikan dan kesehatan daerah.',
  },
  {
    id: 'info-2',
    slug: 'alur-pengaduan-dan-penyerapan-aspirasi',
    title: 'Alur Resmi Penyerapan Aspirasi Warga Melalui Rumah Aspirasi',
    category: 'Layanan Publik',
    publishedAt: '2026-03-15',
    date: '15 Mar 2026',
    posterUrl: '/images/showcase-artikel-umkm.jpg',
    imageUrl: '/images/showcase-artikel-umkm.jpg',
    summary:
      'Panduan langkah mudah masyarakat dalam menyampaikan usulan pembangunan dan pengaduan layanan melalui kanal digital terverifikasi.',
  },
  {
    id: 'info-3',
    slug: 'rekapitulasi-program-bantuan-pertanian',
    title: 'Peta Sebaran Bantuan Alsintan & Pupuk Musim Tanam 2026',
    category: 'Agraria Daerah',
    publishedAt: '2026-03-05',
    date: '05 Mar 2026',
    posterUrl: '/images/showcase-artikel-pertanian.jpg',
    imageUrl: '/images/showcase-artikel-pertanian.jpg',
    summary:
      'Data sebaran kelompok tani penerima traktor roda empat, pompa air, dan kuota pupuk bersubsidi di seluruh kecamatan dapil.',
  },
  {
    id: 'info-4',
    slug: 'capaian-legislasi-dan-perda-inisiatif',
    title: 'Capaian 5 Raperda Inisiatif DPRD untuk Perlindungan Warga',
    category: 'Produk Hukum',
    publishedAt: '2026-02-22',
    date: '22 Feb 2026',
    posterUrl: '/images/showcase-artikel-rapat.jpg',
    imageUrl: '/images/showcase-artikel-rapat.jpg',
    summary:
      'Rangkuman regulasi daerah yang berhasil disahkan demi penguatan perlindungan tenaga kerja lokal dan pelestarian mata air.',
  },
];
