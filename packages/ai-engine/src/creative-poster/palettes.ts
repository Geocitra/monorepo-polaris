/**
 * POLARIS Curated Harmonious Editorial Color Palettes
 * Sistem Palet Warna Senada & Berestetika Tinggi.
 * Menghilangkan kebosanan satu warna monoton dan menjamin kontras keterbacaan tipografi.
 */

export interface HarmoniousColorPalette {
  id: string;
  name: string;
  primaryAccent: string;   // Warna sorotan utama (e.g. #059669)
  secondaryAccent: string; // Warna sorotan sekunder senada (e.g. #34D399)
  backgroundBase: string;  // Warna latar kertas/kanvas (e.g. #F0FDF4 atau #F8F9FA)
  textColor: string;       // Warna teks utama (#FFFFFF atau #111827)
  subTextColor: string;    // Warna teks sekunder
  cardBackground: string;  // Latar belakang kartu kontras protektif (e.g. rgba(6, 78, 59, 0.85))
  cardBorder: string;      // Border kartu (e.g. rgba(52, 211, 153, 0.25))
}

export const HARMONIOUS_COLOR_PALETTES: HarmoniousColorPalette[] = [
  {
    id: 'PAL-EMERALD',
    name: 'Deep Forest Emerald & Mint',
    primaryAccent: '#059669',
    secondaryAccent: '#34D399',
    backgroundBase: '#F0FDF4',
    textColor: '#FFFFFF',
    subTextColor: '#A7F3D0',
    cardBackground: 'rgba(6, 78, 59, 0.88)',
    cardBorder: 'rgba(52, 211, 153, 0.3)',
  },
  {
    id: 'PAL-ROYAL-INDIGO',
    name: 'Royal Indigo & Electric Violet',
    primaryAccent: '#4F46E5',
    secondaryAccent: '#818CF8',
    backgroundBase: '#EEF2FF',
    textColor: '#FFFFFF',
    subTextColor: '#C7D2FE',
    cardBackground: 'rgba(30, 27, 75, 0.88)',
    cardBorder: 'rgba(129, 140, 248, 0.3)',
  },
  {
    id: 'PAL-CRIMSON-TERRACOTTA',
    name: 'Crimson Red & Warm Terracotta',
    primaryAccent: '#DC2626',
    secondaryAccent: '#F87171',
    backgroundBase: '#FEF2F2',
    textColor: '#FFFFFF',
    subTextColor: '#FECACA',
    cardBackground: 'rgba(69, 10, 10, 0.88)',
    cardBorder: 'rgba(248, 113, 113, 0.3)',
  },
  {
    id: 'PAL-MIDNIGHT-SAPPHIRE',
    name: 'Midnight Sapphire & Cyan',
    primaryAccent: '#0284C7',
    secondaryAccent: '#38BDF8',
    backgroundBase: '#F0F9FF',
    textColor: '#FFFFFF',
    subTextColor: '#BAE6FD',
    cardBackground: 'rgba(8, 47, 73, 0.88)',
    cardBorder: 'rgba(56, 189, 248, 0.3)',
  },
  {
    id: 'PAL-VINTAGE-AMBER',
    name: 'Vintage Amber & Warm Ochre',
    primaryAccent: '#D97706',
    secondaryAccent: '#FBBF24',
    backgroundBase: '#FFFBEB',
    textColor: '#FFFFFF',
    subTextColor: '#FDE68A',
    cardBackground: 'rgba(69, 26, 3, 0.88)',
    cardBorder: 'rgba(251, 191, 36, 0.3)',
  },
  {
    id: 'PAL-NORDIC-TEAL',
    name: 'Nordic Teal & Sage',
    primaryAccent: '#0D9488',
    secondaryAccent: '#2DD4BF',
    backgroundBase: '#F0FDFA',
    textColor: '#FFFFFF',
    subTextColor: '#99F6E4',
    cardBackground: 'rgba(19, 78, 74, 0.88)',
    cardBorder: 'rgba(45, 212, 191, 0.3)',
  },
  {
    id: 'PAL-BURGUNDY-ROSE',
    name: 'Burgundy Wine & Dusty Rose',
    primaryAccent: '#9F1239',
    secondaryAccent: '#FB7185',
    backgroundBase: '#FFF1F2',
    textColor: '#FFFFFF',
    subTextColor: '#FECDD3',
    cardBackground: 'rgba(76, 5, 25, 0.88)',
    cardBorder: 'rgba(251, 113, 133, 0.3)',
  },
  {
    id: 'PAL-SUNSET-CORAL',
    name: 'Sunset Orange & Warm Coral',
    primaryAccent: '#EA580C',
    secondaryAccent: '#FB923C',
    backgroundBase: '#FFF7ED',
    textColor: '#FFFFFF',
    subTextColor: '#FED7AA',
    cardBackground: 'rgba(67, 20, 7, 0.88)',
    cardBorder: 'rgba(251, 146, 60, 0.3)',
  },
  {
    id: 'PAL-COBALT-GOLD',
    name: 'Deep Cobalt & Imperial Gold',
    primaryAccent: '#2563EB',
    secondaryAccent: '#F59E0B',
    backgroundBase: '#F8FAFC',
    textColor: '#FFFFFF',
    subTextColor: '#FDE68A',
    cardBackground: 'rgba(23, 37, 84, 0.88)',
    cardBorder: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'PAL-CHARCOAL-LIME',
    name: 'Charcoal Slate & Electric Lime',
    primaryAccent: '#84CC16',
    secondaryAccent: '#A3E635',
    backgroundBase: '#0F172A',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
    cardBackground: 'rgba(15, 23, 42, 0.90)',
    cardBorder: 'rgba(132, 204, 22, 0.35)',
  },
  {
    id: 'PAL-MONOCHROME-MINIMAL',
    name: 'Editorial Ink & Platinum',
    primaryAccent: '#18181B',
    secondaryAccent: '#71717A',
    backgroundBase: '#FAFAFA',
    textColor: '#18181B',
    subTextColor: '#52525B',
    cardBackground: 'rgba(244, 244, 245, 0.92)',
    cardBorder: 'rgba(24, 24, 27, 0.25)',
  },
];

/**
 * Mengambil palet warna senada secara acak untuk variasi visual non-monoton
 */
export function getRandomHarmoniousPalette(excludePaletteId?: string): HarmoniousColorPalette {
  let pool = HARMONIOUS_COLOR_PALETTES;
  if (excludePaletteId && pool.length > 1) {
    const filtered = pool.filter((p) => p.id !== excludePaletteId);
    if (filtered.length > 0) pool = filtered;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Menyelesaikan palet warna berdasarkan nama mood AI atau ID palet, dengan fallback acak
 */
export function resolveHarmoniousPalette(
  moodOrId?: string,
  excludePaletteId?: string
): HarmoniousColorPalette {
  if (!moodOrId) return getRandomHarmoniousPalette(excludePaletteId);

  const normalized = moodOrId.toUpperCase().trim();
  const directMatch = HARMONIOUS_COLOR_PALETTES.find(
    (p) =>
      p.id.toUpperCase() === normalized ||
      p.name.toUpperCase().includes(normalized) ||
      normalized.includes(p.id.replace('PAL-', ''))
  );
  if (directMatch) return directMatch;

  return getRandomHarmoniousPalette(excludePaletteId);
}
