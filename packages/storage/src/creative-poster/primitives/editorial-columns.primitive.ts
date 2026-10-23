import { PosterCardArrangement, ResolvedColorTokens, SurfaceMode } from '../types.js';
import { smartTruncate, safeEditorialText } from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';

export interface EditorialBlockData {
  header: string;
  body: string;
  badge?: string;
}

export interface EditorialColumnsPrimitiveParams {
  blocks: Record<string, EditorialBlockData> | EditorialBlockData[];
  arrangement?: PosterCardArrangement;
  surfaceMode?: SurfaceMode;
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
  maxBlocks?: number;
}

/**
 * EditorialColumns Primitive: Merender blok informasi jurnalistik dalam format kolom,
 * horizontal split, atau grid modular dengan pemisah hairline elegan.
 */
export function buildEditorialColumnsPrimitive(params: EditorialColumnsPrimitiveParams): any {
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
  const {
    blocks,
    arrangement = 'horizontal_split',
    surfaceMode = 'HAIRLINE',
    isDark = colors.isDark !== false,
    maxBlocks = 3,
  } = params;

  const entries: [string, EditorialBlockData][] = Array.isArray(blocks)
    ? blocks.slice(0, maxBlocks).map((b, i) => [`col_${i + 1}`, b])
    : Object.entries(blocks || {}).slice(0, maxBlocks);
  if (entries.length === 0) return null;

  const textTokens = EditorialSurface.getTextColors(isDark, {
    brandHex: colors.primaryAccent,
    accentHex: colors.secondaryAccent,
  });

  const surfaceStyle = EditorialSurface.getTextSurface(surfaceMode, {
    isDark,
    accentHex: colors.primaryAccent,
    borderRadius: '4px',
    padding: '16px 20px',
  });

  const isHorizontal = arrangement === 'horizontal_split';

  const blockNodes = entries.map(([key, block], idx) => {
    const cleanHeader = safeEditorialText(block.header || `POKOK ${idx + 1}`);
    const cleanBody = safeEditorialText(block.body || '');

    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: isHorizontal ? '1' : 'none',
          gap: '6px',
          borderLeft: `2px solid ${idx === 0 ? colors.primaryAccent : colors.secondaryAccent}`,
          paddingLeft: '12px',
        },
        children: [
          {
            type: 'span',
            props: {
              style: {
                fontSize: '11px',
                fontWeight: 800,
                color: idx === 0 ? colors.primaryAccent : colors.secondaryAccent,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              },
              children: smartTruncate(cleanHeader, 40).toUpperCase(),
            },
          },
          {
            type: 'span',
            props: {
              style: {
                fontSize: '12px',
                color: textTokens.textPrimary,
                lineHeight: 1.45,
              },
              children: smartTruncate(cleanBody, 180),
            },
          },
        ],
      },
    };
  });

  return {
    type: 'div',
    props: {
      style: {
        ...surfaceStyle,
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box',
      },
      children: blockNodes,
    },
  };
}
