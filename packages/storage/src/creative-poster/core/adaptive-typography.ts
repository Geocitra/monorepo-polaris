/**
 * POLARIS Adaptive Typography & Contrast Helpers
 * Menghitung ukuran font dinamis berdasarkan panjang teks (mencegah teks terpotong / hilang di Satori),
 * dan menyediakan styling pelindung kontras teks di atas gambar latar AI.
 */

/**
 * Menghitung ukuran font dinamis agar teks panjang tidak tumpah/terpotong (overflow clipping)
 */
/**
 * Menghitung ukuran font dinamis agar teks panjang tidak tumpah/terpotong (overflow clipping)
 * Memperhitungkan panjang kata tunggal ekstrem (misal "INFRASTRUKTUR", "BERKELANJUTAN")
 * agar font size turun ke rentang proporsional (52px - 68px) dan tidak terpotong tepi kanvas Satori.
 */
export function getAdaptiveFontSize(
  text: string,
  baseSize: number,
  minSize: number,
  charThreshold: number = 20
): number {
  const clean = (text || '').trim();
  if (!clean) return baseSize;

  const words = clean.split(/\s+/);
  const maxWordLength = Math.max(...words.map((w) => w.length), 0);

  let calculated = baseSize;

  if (clean.length > charThreshold) {
    const excess = clean.length - charThreshold;
    // Rasio reduksi halus (smooth step-down)
    const reductionFactor = Math.min(0.45, (excess / charThreshold) * 0.35);
    calculated = Math.round(baseSize * (1 - reductionFactor));
  }

  // Jika terdapat kata tunggal sangat panjang (seperti "INFRASTRUKTUR" 13 huruf atau "BERKELANJUTAN" 13 huruf)
  // turunkan ukuran font ke rentang proporsional (misal 52px - 68px)
  if (maxWordLength >= 13) {
    calculated = Math.min(calculated, Math.max(minSize, Math.round(baseSize * 0.72)));
  } else if (maxWordLength >= 11) {
    calculated = Math.min(calculated, Math.max(minSize, Math.round(baseSize * 0.82)));
  }

  return Math.max(minSize, Math.min(baseSize, calculated));
}

/**
 * Pemotongan judul utama yang aman terhadap batas kata (Word-Safe Headline Truncation).
 * DILARANG KERAS memotong di tengah kata dan DILARANG menambahkan '...' pada judul utama.
 */
export function wordSafeHeadlineTruncate(title: string, maxChars: number = 34): string {
  const clean = (title || '').trim();
  if (clean.length <= maxChars) return clean;

  const words = clean.split(/\s+/);
  const kept: string[] = [];
  let currentLen = 0;

  for (const w of words) {
    const candidateLen = kept.length === 0 ? w.length : currentLen + 1 + w.length;
    if (candidateLen <= maxChars) {
      kept.push(w);
      currentLen = candidateLen;
    } else {
      break;
    }
  }

  // Jika kata pertama saja sudah melebihi maxChars, pertahankan kata pertama tanpa slicing
  if (kept.length === 0 && words.length > 0) {
    return words[0]!;
  }

  return kept.join(' ');
}

/**
 * Pembersihan label lingkaran statistik (statCircles topLabel)
 * WAJIB 1 KATA PENDEK (maksimal 11 karakter), huruf kapital, TANPA titik-titik (...)
 */
export function cleanCircleLabel(label: string, maxChars: number = 11): string {
  if (!label) return 'SASARAN';
  const clean = label.trim().replace(/[.]+$/, '');
  const firstWord = clean.split(/\s+/)[0] || '';
  if (firstWord.length <= maxChars) {
    return firstWord.toUpperCase();
  }
  return firstWord.slice(0, maxChars).toUpperCase();
}

/**
 * Pemotongan kalimat tuntas tanpa ellipsis menggantung (Anti-Ellipsis Sentence Clamping).
 * Memprioritaskan pemotongan pada akhir kalimat utuh (. atau ;) jika posisinya >= 55% batas.
 * Jika harus memotong klausa, akhiri dengan tanda titik '.' yang rapi dan bersih.
 */
export function smartSentenceClamp(text: string, maxChars: number = 150): string {
  const clean = (text || '').trim();
  if (clean.length <= maxChars) return clean;

  const limitSlice = clean.slice(0, maxChars);
  const minThreshold = Math.floor(maxChars * 0.55);

  // Cari akhir kalimat utuh (. atau ;)
  const sentenceEndMatches = [...limitSlice.matchAll(/[.;!?]\s*/g)];
  let bestSentenceEndIndex = -1;

  for (const m of sentenceEndMatches) {
    const endPos = (m.index ?? 0) + 1;
    if (endPos >= minThreshold && endPos <= maxChars) {
      bestSentenceEndIndex = endPos;
    }
  }

  if (bestSentenceEndIndex > 0) {
    return clean.slice(0, bestSentenceEndIndex).trim();
  }

  // Jika tidak ada kalimat utuh, potong pada batas kata terdekat dan akhiri tanda titik '.'
  const lastSpace = limitSlice.lastIndexOf(' ');
  const safeText = lastSpace > minThreshold ? limitSlice.slice(0, lastSpace) : limitSlice;
  return `${safeText.replace(/[.,;:!?\s]+$/, '').trim()}.`;
}

/**
 * Pemotongan teks cerdas pada spasi terdekat
 * Untuk teks paragraf (>= 60 char), mengalihkan ke smartSentenceClamp agar bebas dari ellipsis menggantung.
 */
export function smartTruncate(text: string, maxChars: number, withEllipsis = true): string {
  const clean = (text || '').trim();
  if (clean.length <= maxChars) return clean;

  if (maxChars >= 60) {
    return smartSentenceClamp(clean, maxChars);
  }

  if (!withEllipsis) {
    const sliced = clean.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(' ');
    return (lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced).trim();
  }

  const limit = Math.max(3, maxChars - 3);
  const sliced = clean.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(' ');
  const safeText = lastSpace > limit * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${safeText.trim()}...`;
}

/**
 * Sanitasi deterministik teks editorial untuk layout poster
 * Membuang mikrolinguistik terlarang (nyata, sekadar, babu bhaiya, dsb.)
 */
export function safeEditorialText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bnyata\b/gi, 'konkret')
    .replace(/\bsekadar\b/gi, 'hanya')
    .replace(/\bbukan sekadar\b/gi, 'tidak hanya')
    .replace(/babu bhaiya/gi, 'rekan warga')
    .replace(/[—–]/g, '-')
    .trim();
}

/**
 * @deprecated Gunakan editorial-surface.ts (getTextSurface) untuk estetika terpadu tanpa kartu kaku
 * Card style pelindung kontras untuk menjamin teks 100% terbaca di atas visual AI (Backward Compatibility)
 */
export function getProtectiveCardStyle(options?: {
  bgColor?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
}) {
  return {
    backgroundColor: options?.bgColor || 'rgba(10, 15, 29, 0.82)',
    border: `1.5px solid ${options?.borderColor || 'rgba(255, 255, 255, 0.15)'}`,
    borderRadius: options?.borderRadius || '8px',
    padding: options?.padding || '16px 20px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  };
}
