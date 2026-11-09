export type VisualStyle = 'infographic' | 'poster' | 'photo' | 'illustration';
export type AspectRatio = '4:5' | '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

export interface InfographicTemplateOption {
  id: string; // 'auto' | 'INFOGRAPHIC_NARRATIVE_WAVE' | etc.
  name: string;
  subtitle: string;
  previewImage: string;
  archetype?: string;
  description: string;
  tags: string[];
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplateOption[] = [
  {
    id: 'auto',
    name: 'Otomatis (Pilihan Cerdas AI)',
    subtitle: 'Analisis topik & pilihkan template terbaik',
    previewImage: '',
    description: 'AI menganalisis naskah/topik Anda dan otomatis memilih template paling tepat dari 12 desain referensi.',
    tags: ['Rekomendasi', 'Adaptif', 'Auto AI'],
  },
  {
    id: 'INFOGRAPHIC_NARRATIVE_WAVE',
    name: 'Gelombang Naratif',
    subtitle: 'Alur S-Curve 4 Dimensi Isu',
    previewImage: '/templates/infografis/template-01-red-wave-narrative.jpg',
    archetype: 'INFOGRAPHIC_NARRATIVE_WAVE',
    description: 'Pita lengkung merah bergelombang membagi 4 dimensi/tahapan pembahasan kebijakan dengan kolase foto warga.',
    tags: ['4 Dimensi', 'Siklus', 'Humanis'],
  },
  {
    id: 'INFOGRAPHIC_CHRONICLE_GRID',
    name: 'Kronik & Rekam Jejak',
    subtitle: 'Format Berita Koran & Grid Sejarah',
    previewImage: '/templates/infografis/template-02-biography-timeline-grid.jpg',
    archetype: 'INFOGRAPHIC_CHRONICLE_GRID',
    description: 'Masthead oranye vertikal di sisi kiri dengan grid kartu pencapaian, rekam jejak, dan foto dokumentasi arsip.',
    tags: ['Biografi', 'Tokoh', 'Rekam Jejak'],
  },
  {
    id: 'INFOGRAPHIC_RADIAL_CLOCK',
    name: 'Jam Melingkar',
    subtitle: 'Lintasan Waktu Era & Sejarah',
    previewImage: '/templates/infografis/template-03-radial-clock-chronicle.jpg',
    archetype: 'INFOGRAPHIC_RADIAL_CLOCK',
    description: 'Dial jam saku antik memancarkan sektor tonggak sejarah dari masa ke masa di atas perkamen vintage klasik.',
    tags: ['Evolusi Waktu', 'Era', 'Perkamen'],
  },
  {
    id: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    name: 'Advokasi Data 5 Pilar',
    subtitle: 'Statistik Angka & 5 Kapsul Aksi',
    previewImage: '/templates/infografis/template-04-advocacy-data-pillars.jpg',
    archetype: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    description: 'Motif batik Indonesia dengan statistik persen besar, ilustrasi warga, dan 5 pilar kapsul langkah solusi (P-U-T-U-S).',
    tags: ['Statistik', 'Batik', '5 Pilar Aksi'],
  },
  {
    id: 'INFOGRAPHIC_VISIONARY_TIMELINE',
    name: 'Garis Waktu Visioner',
    subtitle: 'Modern Minimalis & Garis Waktu',
    previewImage: '/templates/infografis/template-05-visionary-milestone-timeline.jpg',
    archetype: 'INFOGRAPHIC_VISIONARY_TIMELINE',
    description: 'Gaya monokrom modern dengan kartu frosted glass, kutipan inspiratif, dan pita garis waktu horizontal di bawah.',
    tags: ['Inovasi', 'Digital', 'Timeline'],
  },
  {
    id: 'INFOGRAPHIC_EDITORIAL_COLLAGE',
    name: 'Kolase Zine Risograf',
    subtitle: 'Light & Shadow / Modul Edukasi',
    previewImage: '/templates/infografis/template-06-Light bears shadow.jpg',
    archetype: 'INFOGRAPHIC_EDITORIAL_COLLAGE',
    description: 'Potongan judul blok warna (teal & mustard), ilustrasi cut-out bohlam lampu dengan bayangan tanaman, kartu tanya-jawab modular, fakta menarik, dan footer pita penutup.',
    tags: ['Kolase', 'Risograf', 'Sains & Edukasi', 'Light & Shadow'],
  },
  {
    id: 'INFOGRAPHIC_HISTORICAL_EXPEDITION',
    name: 'Kronik Sejarah & Ekspedisi',
    subtitle: 'Biografi Vintage & Gulungan Perkamen',
    previewImage: '/templates/infografis/template-07-template-infografis.jpg',
    archetype: 'INFOGRAPHIC_HISTORICAL_EXPEDITION',
    description: 'Gaya arsip biografi sejarah berlatar perkamen kayu cokelat hangat, bingkai oval antik, figura emas, kompas navigasi bahari, buku kuno, dan pena bulu.',
    tags: ['Sejarah', 'Perkamen', 'Biografi', 'Vintage Ekspedisi'],
  },
];

export interface InfographicIteration {
  id: string;
  versionNumber: number;
  timestamp: string;
  prompt: string;
  imageUrl: string;
  caption: string;
  title: string;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  archetype?: string;
  source: 'INITIAL' | 'REFINE' | 'RESTORE';
  publicationId?: string;
  isPublished?: boolean;
  publishedUrl?: string;
  layersData?: string;
  rawCanvasUrl?: string;
}

export interface InfographicSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeIterationId: string;
  iterations: InfographicIteration[];
}
