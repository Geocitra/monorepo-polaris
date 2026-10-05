import { PolicySector } from '@polaris/shared-types';

export interface CivicRelevanceAssessment {
  accepted: boolean;
  sector: PolicySector | null;
  relevanceScore: number;
  matchedKeywords: string[];
  rejectionReason?: 'NON_POLICY_NOISE' | 'INSUFFICIENT_POLICY_EVIDENCE';
}

const POLICY_TAXONOMY: ReadonlyArray<{ sector: PolicySector; keywords: readonly string[] }> = [
  {
    sector: PolicySector.FISKAL_ANGGARAN,
    keywords: [
      'apbd', 'apbn', 'anggaran daerah', 'pendapatan asli daerah', 'pad',
      'dana bagi hasil', 'dbh', 'dana alokasi umum', 'dau', 'dana alokasi khusus',
      'dak', 'belanja modal', 'silpa', 'pajak daerah', 'retribusi daerah',
      'transfer ke daerah', 'dana transfer', 'dana desa', 'pemangkasan anggaran',
      'pemotongan anggaran', 'belanja negara', 'belanja daerah', 'dana migas',
    ],
  },
  {
    sector: PolicySector.INFRASTRUKTUR_RUANG,
    keywords: [
      'jalan rusak', 'jalan kabupaten', 'jalan provinsi', 'jembatan', 'irigasi',
      'tata ruang', 'rtrw', 'drainase', 'pupr', 'sanitasi', 'infrastruktur publik',
      'perbaikan jalan', 'jalan nasional', 'jembatan putus', 'akses jalan',
      'air bersih', 'pompa air', 'pengairan', 'tanggul',
    ],
  },
  {
    sector: PolicySector.PANGAN_PERTANIAN,
    keywords: [
      'pupuk subsidi', 'pupuk bersubsidi', 'harga gabah', 'petani', 'hasil panen',
      'lahan pertanian', 'ketahanan pangan', 'benih', 'nelayan', 'bulog',
      'harga beras', 'produksi beras', 'produksi jagung', 'lahan jagung',
      'produksi padi', 'bantuan petani', 'hasil pertanian', 'komoditas pangan',
    ],
  },
  {
    sector: PolicySector.SOSIAL_KEMISKINAN,
    keywords: [
      'bantuan sosial', 'bansos', 'dtks', 'program keluarga harapan', 'pkh',
      'stunting', 'kemiskinan', 'bantuan langsung tunai', 'blt', 'dinas sosial',
      'makan bergizi gratis', 'mbg', 'keluarga penerima manfaat', 'bantuan pangan',
      'program bantuan', 'penerima bansos',
    ],
  },
  {
    sector: PolicySector.LAYANAN_DASAR,
    keywords: [
      'bpjs', 'puskesmas', 'rsud', 'pelayanan kesehatan', 'ruang kelas',
      'bosda', 'beasiswa', 'sekolah negeri', 'tenaga kesehatan', 'posyandu',
      'rumah sakit', 'layanan kesehatan', 'fasilitas kesehatan', 'sekolah dasar',
      'sekolah menengah', 'pendidikan daerah',
    ],
  },
  {
    sector: PolicySector.TATA_KELOLA_HUKUM,
    keywords: [
      'peraturan daerah', 'perda', 'rancangan peraturan daerah', 'raperda',
      'bpk', 'inspektorat', 'audit pemerintah', 'pengadaan pemerintah',
      'netralitas asn', 'pelayanan publik', 'putusan pengadilan',
      'aparatur sipil negara', 'pegawai asn', 'disiplin pegawai', 'kementerian',
      'pemerintah daerah', 'pemerintah kabupaten', 'pemerintah provinsi',
      'lembaga pemasyarakatan', 'lapas', 'kalapas',
    ],
  },
  {
    sector: PolicySector.EKONOMI_KETENAGAKERJAAN,
    keywords: [
      'umr', 'umk', 'upah minimum', 'tenaga kerja', 'umkm', 'izin usaha',
      'pasar tradisional', 'pemutusan hubungan kerja', 'phk', 'dinas tenaga kerja',
      'koperasi desa', 'lapangan kerja', 'penciptaan lapangan kerja', 'pengangguran',
      'distribusi bahan pokok', 'investasi daerah', 'ekonomi desa',
    ],
  },
  {
    sector: PolicySector.LINGKUNGAN_BENCANA,
    keywords: [
      'analisis mengenai dampak lingkungan', 'amdal', 'pengelolaan sampah',
      'tempat pembuangan akhir', 'tpa', 'banjir', 'longsor', 'kekeringan',
      'mitigasi bencana', 'bpbd', 'kualitas udara', 'pencemaran sungai',
      'banjir bandang', 'tanggap darurat', 'evakuasi bencana', 'gempa bumi',
      'risiko gempa', 'zona subduksi', 'bencana alam', 'kebakaran hutan',
    ],
  },
];

const NON_POLICY_SIGNALS = [
  'k-pop', 'kpop', 'blackpink', 'boyband', 'girlband', 'drakor',
  'drama korea', 'sinetron', 'gosip selebriti', 'zodiak', 'horoskop',
  'liga champions', 'liga inggris', 'motogp', 'formula 1', 'esports',
  'box office', 'konser musik',
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function includesPhrase(normalizedText: string, phrase: string): boolean {
  const normalizedPhrase = normalizeText(phrase);
  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

export class CivicRelevanceGatekeeper {
  static assess(title: string, summary: string): CivicRelevanceAssessment {
    const normalizedText = normalizeText(`${title} ${summary}`);
    const sectorMatches = POLICY_TAXONOMY.map(({ sector, keywords }) => ({
      sector,
      keywords: keywords.filter((keyword) => includesPhrase(normalizedText, keyword)),
    })).filter((match) => match.keywords.length > 0);

    const allMatchedKeywords = [...new Set(sectorMatches.flatMap((match) => match.keywords))];
    const strongestMatch = sectorMatches.reduce<(typeof sectorMatches)[number] | null>(
      (best, match) => !best || match.keywords.length > best.keywords.length ? match : best,
      null
    );
    const hasNonPolicySignal = NON_POLICY_SIGNALS.some((signal) =>
      includesPhrase(normalizedText, signal)
    );

    if (hasNonPolicySignal && !strongestMatch) {
      return {
        accepted: false,
        sector: null,
        relevanceScore: 0,
        matchedKeywords: [],
        rejectionReason: 'NON_POLICY_NOISE',
      };
    }

    if (!strongestMatch || strongestMatch.keywords.length < 2) {
      return {
        accepted: false,
        sector: null,
        relevanceScore: 0,
        matchedKeywords: allMatchedKeywords,
        rejectionReason: 'INSUFFICIENT_POLICY_EVIDENCE',
      };
    }

    const relevanceScore = Math.min(1, 0.5 + strongestMatch.keywords.length * 0.15);
    return {
      accepted: relevanceScore >= 0.65,
      sector: strongestMatch.sector,
      relevanceScore,
      matchedKeywords: strongestMatch.keywords,
      rejectionReason: undefined,
    };
  }
}
