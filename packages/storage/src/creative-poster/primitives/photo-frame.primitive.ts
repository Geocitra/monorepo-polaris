import { ResolvedColorTokens } from '../types.js';

export type PhotoFrameStyle = 'POLAROID' | 'CIRCULAR_INSET' | 'HALFTONE_CUTOUT' | 'CLEAN_FRAME';

export interface PhotoFramePrimitiveParams {
  photoDataUri?: string;
  photoBase64?: string;
  style?: PhotoFrameStyle | 'polaroid' | 'circular_inset' | 'halftone_cutout' | 'clean_frame';
  caption?: string;
  width?: number;
  height?: number;
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
  rotationDeg?: number;
}

/**
 * PhotoFrame Primitive: Merender sub-foto dalam gaya Polaroid,
 * Circular Inset, Halftone Cutout, atau Clean Editorial Frame.
 */
export function buildPhotoFramePrimitive(params: PhotoFramePrimitiveParams): any {
  const colors = params.colors || params.resolvedColors || {
    primaryAccent: '#EA580C',
    secondaryAccent: '#FED7AA',
    backgroundBase: '#0F172A',
    textColor: '#FFFFFF',
    subTextColor: '#94A3B8',
    cardBackground: 'rgba(0,0,0,0.5)',
    cardBorder: 'rgba(255,255,255,0.1)',
    source: 'BLUEPRINT' as const,
    isDark: true,
  };
  const photoDataUri = params.photoDataUri || params.photoBase64;
  const styleRaw = (params.style || 'CLEAN_FRAME').toUpperCase() as PhotoFrameStyle;
  const style: PhotoFrameStyle =
    styleRaw === ('POLAROID' as any)
      ? 'POLAROID'
      : styleRaw === ('CIRCULAR_INSET' as any)
        ? 'CIRCULAR_INSET'
        : styleRaw === ('HALFTONE_CUTOUT' as any)
          ? 'HALFTONE_CUTOUT'
          : 'CLEAN_FRAME';
  const {
    caption,
    width = 240,
    height = 180,
    isDark = colors.isDark !== false,
    rotationDeg = 0,
  } = params;

  if (!photoDataUri) return null;

  const accent = colors.primaryAccent;

  if (style === 'POLAROID') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '10px 10px 18px 10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          transform: rotationDeg !== 0 ? `rotate(${rotationDeg}deg)` : undefined,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
        children: [
          {
            type: 'img',
            props: {
              src: photoDataUri,
              style: {
                width: `${width}px`,
                height: `${height}px`,
                objectFit: 'cover',
              },
            },
          },
          ...(caption
            ? [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: '11px',
                      color: '#1E293B',
                      marginTop: '8px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    },
                    children: caption.toUpperCase(),
                  },
                },
              ]
            : []),
        ],
      },
    };
  }

  if (style === 'CIRCULAR_INSET') {
    const size = Math.min(width, height);
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size + 8}px`,
          height: `${size + 8}px`,
          borderRadius: `${(size + 8) / 2}px`,
          border: `3px solid ${accent}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        },
        children: [
          {
            type: 'img',
            props: {
              src: photoDataUri,
              style: {
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: `${size / 2}px`,
                objectFit: 'cover',
              },
            },
          },
        ],
      },
    };
  }

  if (style === 'HALFTONE_CUTOUT') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          border: `2px solid ${accent}`,
          padding: '4px',
          backgroundColor: isDark ? '#09090B' : '#FFFFFF',
          boxShadow: `4px 4px 0px ${accent}`,
        },
        children: [
          {
            type: 'img',
            props: {
              src: photoDataUri,
              style: {
                width: `${width}px`,
                height: `${height}px`,
                objectFit: 'cover',
              },
            },
          },
          ...(caption
            ? [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Space Mono',
                      fontSize: '9.5px',
                      color: accent,
                      fontWeight: 700,
                      padding: '4px 2px 2px 2px',
                    },
                    children: `// ${caption.toUpperCase()}`,
                  },
                },
              ]
            : []),
        ],
      },
    };
  }

  // CLEAN_FRAME (Default)
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)'}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        borderRadius: '2px',
      },
      children: [
        {
          type: 'img',
          props: {
            src: photoDataUri,
            style: {
              width: `${width}px`,
              height: `${height}px`,
              objectFit: 'cover',
            },
          },
        },
      ],
    },
  };
}
