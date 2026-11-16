const REGENCY_TO_PROVINCE_HINTS: ReadonlyArray<{ keywords: readonly string[]; provinceScope: string }> = [
  { provinceScope: 'ACEH', keywords: ['aceh', 'banda aceh', 'lhokseumawe', 'sabang', 'langsa'] },
  { provinceScope: 'SUMATERA_UTARA', keywords: ['sumatera utara', 'sumut', 'medan', 'binjai', 'deli serdang', 'pematangsiantar'] },
  { provinceScope: 'SUMATERA_BARAT', keywords: ['sumatera barat', 'sumbar', 'padang', 'bukittinggi', 'payakumbuh'] },
  { provinceScope: 'RIAU', keywords: ['riau', 'pekanbaru', 'dumai', 'siak', 'kampar'] },
  { provinceScope: 'SUMATERA_SELATAN', keywords: ['sumatera selatan', 'sumsel', 'palembang', 'lubuklinggau', 'prabumulih'] },
  { provinceScope: 'LAMPUNG', keywords: ['lampung', 'bandar lampung', 'metro'] },
  { provinceScope: 'DKI_JAKARTA', keywords: ['jakarta', 'dki', 'kepulauan seribu'] },
  { provinceScope: 'BANTEN', keywords: ['banten', 'tangerang', 'serang', 'cilegon', 'lebak', 'pandeglang'] },
  {
    provinceScope: 'JAWA_BARAT',
    keywords: [
      'jawa barat', 'jabar', 'bandung', 'bekasi', 'bogor', 'depok', 'cimahi',
      'cirebon', 'sukabumi', 'tasikmalaya', 'garut', 'karawang', 'subang',
      'indramayu', 'majalengka', 'kuningan', 'ciamis', 'purwakarta', 'sumedang', 'cianjur',
    ],
  },
  {
    provinceScope: 'JAWA_TENGAH',
    keywords: [
      'jawa tengah', 'jateng', 'semarang', 'solo', 'surakarta', 'magelang',
      'pekalongan', 'tegal', 'salatiga', 'banyumas', 'purwokerto', 'cilacap',
      'brebes', 'klaten', 'boyolali', 'kudus', 'pati', 'kebumen', 'wonogiri',
    ],
  },
  { provinceScope: 'DI_YOGYAKARTA', keywords: ['yogyakarta', 'jogja', 'sleman', 'bantul', 'gunungkidul', 'kulon progo'] },
  {
    provinceScope: 'JAWA_TIMUR',
    keywords: [
      'jawa timur', 'jatim', 'surabaya', 'malang', 'sidoarjo', 'gresik',
      'kediri', 'blitar', 'madiun', 'mojokerto', 'pasuruan', 'probolinggo',
      'jember', 'banyuwangi', 'lamongan', 'tuban', 'bojonegoro', 'madura',
    ],
  },
  { provinceScope: 'BALI', keywords: ['bali', 'denpasar', 'badung', 'gianyar', 'buleleng', 'tabanan'] },
  { provinceScope: 'KALIMANTAN_TIMUR', keywords: ['kalimantan timur', 'kaltim', 'samarinda', 'balikpapan', 'bontang', 'kutai'] },
  { provinceScope: 'KALIMANTAN_BARAT', keywords: ['kalimantan barat', 'kalbar', 'pontianak', 'singkawang'] },
  { provinceScope: 'KALIMANTAN_SELATAN', keywords: ['kalimantan selatan', 'kalsel', 'banjarmasin', 'banjarbaru'] },
  { provinceScope: 'SULAWESI_SELATAN', keywords: ['sulawesi selatan', 'sulsel', 'makassar', 'parepare', 'palopo', 'gowa', 'maros', 'bone'] },
  { provinceScope: 'SULAWESI_UTARA', keywords: ['sulawesi utara', 'sulut', 'manado', 'bitung', 'tomohon', 'minahasa'] },
  { provinceScope: 'NUSA_TENGGARA_BARAT', keywords: ['nusa tenggara barat', 'ntb', 'mataram', 'lombok', 'sumbawa', 'bima'] },
  { provinceScope: 'NUSA_TENGGARA_TIMUR', keywords: ['nusa tenggara timur', 'ntt', 'kupang', 'flores', 'sumba', 'timor'] },
  { provinceScope: 'PAPUA', keywords: ['papua', 'jayapura', 'merauke', 'timika'] },
];

/**
 * Memetakan nama wilayah/dapil menjadi daftar regionScope berjenjang (Kabupaten/Kota -> Provinsi -> Nasional).
 */
export function resolveRegionScopes(targetRegion: string): string[] {
  const scopes = new Set<string>(['NASIONAL', 'ALL']);
  const cleaned = (targetRegion || '').trim();
  if (!cleaned) {
    return Array.from(scopes);
  }

  const normalizedUpper = cleaned.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (normalizedUpper) {
    scopes.add(normalizedUpper);
  }

  const lower = cleaned.toLowerCase();
  for (const entry of REGENCY_TO_PROVINCE_HINTS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      scopes.add(entry.provinceScope);
    }
  }

  return Array.from(scopes);
}

