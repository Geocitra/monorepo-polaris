import sharp from 'sharp';
import { CompositionZone, ZoneRect, SurfaceMode } from '../types.js';

export interface SampledZoneMetrics {
  zoneId: string;
  luminance: number; // 0.0 (pitch black) s/d 1.0 (pure white)
  isDark: boolean; // luminance < 0.48
  hasHighVariance: boolean; // standard deviation > 38 (latar belakang ramai/tekstur tinggi)
  suggestedContrast: 'LIGHT_TEXT' | 'DARK_TEXT';
  suggestedSurface: SurfaceMode;
}

export class ZoneSampler {
  /**
   * Melakukan ekstraksi visual region Sharp pada buffer background AI
   * untuk menghitung luminansi, kontras, dan varians piksel per zona komposisi.
   */
  public static async sampleZones(
    imageBuffer: Buffer,
    zones: CompositionZone[]
  ): Promise<Map<string, SampledZoneMetrics>> {
    const results = new Map<string, SampledZoneMetrics>();
    if (!imageBuffer || imageBuffer.length === 0 || !zones || zones.length === 0) {
      return results;
    }

    try {
      const metadata = await sharp(imageBuffer).metadata();
      const imgWidth = metadata.width || 1080;
      const imgHeight = metadata.height || 1350;

      for (const zone of zones) {
        try {
          const rect = zone.rect;
          // Konversi rasio normalisasi (0.0 - 1.0) ke koordinat piksel absolut
          const left = Math.max(0, Math.min(imgWidth - 1, Math.round(rect.x * imgWidth)));
          const top = Math.max(0, Math.min(imgHeight - 1, Math.round(rect.y * imgHeight)));
          const width = Math.max(1, Math.min(imgWidth - left, Math.round(rect.w * imgWidth)));
          const height = Math.max(1, Math.min(imgHeight - top, Math.round(rect.h * imgHeight)));

          const stats = await sharp(imageBuffer)
            .extract({ left, top, width, height })
            .stats();

          const rMean = stats.channels[0]?.mean ?? 128;
          const gMean = stats.channels[1]?.mean ?? 128;
          const bMean = stats.channels[2]?.mean ?? 128;

          // Standar Luminansi Relatif ITU-R BT.601
          const luminance = (0.299 * rMean + 0.587 * gMean + 0.114 * bMean) / 255;
          const isDark = luminance < 0.48;

          const rStd = stats.channels[0]?.stdev ?? 0;
          const gStd = stats.channels[1]?.stdev ?? 0;
          const bStd = stats.channels[2]?.stdev ?? 0;
          const avgStd = (rStd + gStd + bStd) / 3;
          const hasHighVariance = avgStd > 38;

          let suggestedSurface: SurfaceMode = zone.surface || 'NONE';
          if (!zone.surface) {
            if (hasHighVariance && luminance > 0.35 && luminance < 0.65) {
              suggestedSurface = 'SCRIM_GRADIENT';
            } else if (hasHighVariance) {
              suggestedSurface = 'HAIRLINE';
            } else {
              suggestedSurface = 'NONE';
            }
          }

          results.set(zone.id, {
            zoneId: zone.id,
            luminance,
            isDark,
            hasHighVariance,
            suggestedContrast: isDark ? 'LIGHT_TEXT' : 'DARK_TEXT',
            suggestedSurface,
          });
        } catch {
          results.set(zone.id, {
            zoneId: zone.id,
            luminance: zone.contrastTarget === 'DARK_TEXT' ? 0.8 : 0.2,
            isDark: zone.contrastTarget !== 'DARK_TEXT',
            hasHighVariance: false,
            suggestedContrast: zone.contrastTarget || 'LIGHT_TEXT',
            suggestedSurface: zone.surface || 'NONE',
          });
        }
      }
    } catch (err) {
      console.warn('[ZoneSampler] Gagal membaca metadata sharp background:', err);
    }

    return results;
  }
}
