/**
 * POLARIS Adaptive Typography & Contrast Helpers
 * Menghitung ukuran font dinamis berdasarkan panjang teks (mencegah teks terpotong / hilang di Satori),
 * dan menyediakan styling pelindung kontras teks di atas gambar latar AI.
 */

/**
 * Menghitung ukuran font dinamis agar teks panjang tidak tumpah/terpotong (overflow clipping)
 */
export function getAdaptiveFontSize(
  text: string,
  baseSize: number,
  minSize: number,
  charThreshold: number = 20
): number {
  const clean = (text || '').trim();
  if (clean.length <= charThreshold) return baseSize;

  const excess = clean.length - charThreshold;
  // Rasio reduksi halus (smooth step-down)
  const reductionFactor = Math.min(0.45, (excess / charThreshold) * 0.35);
  const calculated = Math.round(baseSize * (1 - reductionFactor));

  return Math.max(minSize, Math.min(baseSize, calculated));
}

/**
 * Pemotongan teks cerdas pada spasi terdekat
 */
export function smartTruncate(text: string, maxChars: number): string {
  const clean = (text || '').trim();
  if (clean.length <= maxChars) return clean;
  const limit = Math.max(3, maxChars - 3);
  const sliced = clean.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(' ');
  const safeText = lastSpace > limit * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${safeText.trim()}...`;
}

/**
 * Card style pelindung kontras untuk menjamin teks 100% terbaca di atas visual AI
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
