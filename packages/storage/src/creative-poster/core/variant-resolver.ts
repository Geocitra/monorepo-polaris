import {
  PosterLayoutVariant,
  PosterHeaderPlacement,
  PosterCardArrangement,
} from '../types.js';

export interface LayoutContainerStyles {
  display: 'flex';
  flexDirection: 'column' | 'row';
  justifyContent: 'flex-start' | 'flex-end' | 'space-between' | 'center';
  alignItems: 'stretch' | 'flex-start' | 'center';
  padding: string;
  boxSizing: 'border-box';
}

export interface CardContainerStyles {
  display: 'flex';
  flexDirection: 'column' | 'row';
  flexWrap: 'wrap' | 'nowrap';
  gap: string;
  width: string;
}

/**
 * VariantResolver: Otoritas penentuan struktur Flexbox kanvas Satori berdasarkan
 * variasi dinamis layout (TOP_BANNER, BOTTOM_ANCHOR, EDITORIAL_SPLIT, CENTERED_HERO).
 */
export class VariantResolver {
  /**
   * Menghasilkan styling root flex container berdasarkan variant dan penempatan header
   */
  public static resolveRootContainer(
    variant: PosterLayoutVariant = 'TOP_BANNER',
    headerPlacement: PosterHeaderPlacement = 'top',
    canvasPadding = '64px'
  ): LayoutContainerStyles {
    if (variant === 'BOTTOM_ANCHOR' || headerPlacement === 'bottom') {
      return {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: canvasPadding,
        boxSizing: 'border-box',
      };
    }

    if (variant === 'CENTERED_HERO' || headerPlacement === 'center') {
      return {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        padding: canvasPadding,
        boxSizing: 'border-box',
      };
    }

    // Default: TOP_BANNER atau EDITORIAL_SPLIT
    return {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      padding: canvasPadding,
      boxSizing: 'border-box',
    };
  }

  /**
   * Menghasilkan susunan flex container untuk kartu/blok sekunder
   */
  public static resolveCardContainer(
    arrangement: PosterCardArrangement = 'stacked',
    options?: { gap?: string }
  ): CardContainerStyles {
    const gap = options?.gap || '24px';

    switch (arrangement) {
      case 'horizontal_split':
        return {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap,
          width: '100%',
        };

      case 'grid_compact':
        return {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          width: '100%',
        };

      case 'single_hero_card':
        return {
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          gap,
          width: '100%',
        };

      case 'stacked':
      default:
        return {
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          gap,
          width: '100%',
        };
    }
  }

  /**
   * Mengatur orientasi konten utama (split columns atau single vertical stream)
   */
  public static resolveContentDirection(
    variant: PosterLayoutVariant = 'TOP_BANNER'
  ): 'row' | 'column' {
    return variant === 'EDITORIAL_SPLIT' ? 'row' : 'column';
  }
}
