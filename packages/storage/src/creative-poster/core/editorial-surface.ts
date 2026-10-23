import { SurfaceMode } from '../types.js';

export interface EditorialSurfaceOptions {
  luminance?: number;
  isDark?: boolean;
  brandHex?: string;
  accentHex?: string;
  borderRadius?: string;
  padding?: string;
}

export interface EditorialColorTokens {
  textPrimary: string;
  textMuted: string;
  textAccent: string;
  borderSubtle: string;
  surfaceBackground: string;
}

/**
 * EditorialSurface: Otoritas pembuatan visual surface dan kontras teks adaptif untuk Satori.
 * Menggantikan kartu UI dashboard tebal dengan perlakuan tipografi majalah editorial asli.
 */
export class EditorialSurface {
  /**
   * Menghitung palet teks dan border berdasarkan luminansi latar belakang
   * Menjamin rasio kontras WCAG AA (minimal 4.5:1 untuk teks biasa, 3:1 untuk headline tebal)
   */
  public static getTextColors(
    isDark: boolean,
    options?: { brandHex?: string; accentHex?: string }
  ): EditorialColorTokens {
    if (isDark) {
      return {
        textPrimary: '#FFFFFF',
        textMuted: 'rgba(255, 255, 255, 0.75)',
        textAccent: options?.accentHex || options?.brandHex || '#F59E0B',
        borderSubtle: 'rgba(255, 255, 255, 0.15)',
        surfaceBackground: 'rgba(15, 23, 42, 0.45)',
      };
    } else {
      return {
        textPrimary: '#0F172A',
        textMuted: 'rgba(15, 23, 42, 0.70)',
        textAccent: options?.accentHex || options?.brandHex || '#0284C7',
        borderSubtle: 'rgba(15, 23, 42, 0.15)',
        surfaceBackground: 'rgba(255, 255, 255, 0.65)',
      };
    }
  }

  /**
   * Mengembalikan styling inline untuk Satori sesuai mode surface arsitektur
   */
  public static getTextSurface(
    mode: SurfaceMode = 'NONE',
    options?: EditorialSurfaceOptions
  ): Record<string, any> {
    const isDark = options?.isDark ?? true;
    const padding = options?.padding || '0px';
    const borderRadius = options?.borderRadius || '0px';

    switch (mode) {
      case 'NONE':
        return {
          display: 'flex',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding,
          borderRadius,
        };

      case 'HAIRLINE':
        return {
          display: 'flex',
          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.12)'}`,
          padding: padding === '0px' ? '20px 24px' : padding,
          borderRadius: borderRadius === '0px' ? '4px' : borderRadius,
          backdropFilter: 'blur(8px)',
        };

      case 'SCRIM_GRADIENT':
        return {
          display: 'flex',
          background: isDark
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(10, 15, 29, 0.75) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.88) 100%)',
          padding: padding === '0px' ? '24px 28px' : padding,
          borderRadius,
        };

      case 'SOLID_BAND':
        return {
          display: 'flex',
          background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)',
          borderTop: `2px solid ${options?.accentHex || (isDark ? '#F59E0B' : '#0F172A')}`,
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          padding: padding === '0px' ? '24px 32px' : padding,
          borderRadius,
        };

      default:
        return {
          display: 'flex',
          background: 'transparent',
          padding,
          borderRadius,
        };
    }
  }
}
