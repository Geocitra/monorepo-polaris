import {
  CompositionPlan,
  ResolvedColorTokens,
  SynthesizedEditorialCopy,
  SurfaceMode,
} from '../types.js';
import { VariantResolver } from './variant-resolver.js';
import {
  buildMastheadPrimitive,
  MastheadStyle,
  buildHeadlinePrimitive,
  buildEditorialColumnsPrimitive,
  buildStatBadgesPrimitive,
  buildPhotoFramePrimitive,
  PhotoFrameStyle,
  buildMemberSignaturePrimitive,
} from '../primitives/index.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
  safeEditorialText,
} from './adaptive-typography.js';

export type StructuralFamily =
  | 'CINEMATIC_MINIMAL'
  | 'EDITORIAL_MAGAZINE'
  | 'BOLD_MANIFESTO'
  | 'DATA_INFOGRAPHIC';

export interface ArchetypeSkinConfig {
  structuralFamily?: StructuralFamily;
  mastheadStyle?: MastheadStyle;
  headlineFontFamily?: 'Bebas Neue' | 'Anton' | 'DejaVu Serif' | 'Plus Jakarta Sans';
  headlineSurface?: SurfaceMode;
  headlineAlign?: 'left' | 'center' | 'right';
  headlineMaxFontSize?: number;
  columnsSurface?: SurfaceMode;
  signatureSurface?: SurfaceMode;
  signatureBorderSide?: 'left' | 'top' | 'none';
  defaultPhotoStyle?: PhotoFrameStyle;
}

export interface ParametricPosterOptions {
  width?: number;
  height?: number;
  headline?: string;
  quote?: string;
  copy?: Partial<SynthesizedEditorialCopy>;
  memberName?: string;
  memberTitle?: string;
  editionTag?: string;
  logoDataUri?: string;
  qrCodeDataUri?: string;
  subPhotos?: Array<{ dataUri: string; caption?: string; style?: PhotoFrameStyle }>;
  compositionPlan?: CompositionPlan;
  plan?: CompositionPlan;
  resolvedColors?: ResolvedColorTokens;
  colors?: ResolvedColorTokens;
  skinConfig?: ArchetypeSkinConfig;
}

/**
 * ParametricSatoriRenderer: Mesin perakit VNode Satori parametrik yang menyusun
 * 4 Kerangka Struktur (Structural Families) berbeda secara visual:
 * 1. CINEMATIC_MINIMAL: Poster film / alam / storybook, 0 stat circles, 65-70% kanvas bersih terbuka.
 * 2. EDITORIAL_MAGAZINE: Majalah Swiss / broadsheet, 0 stat circles, 2 kolom horizontal berdampingan.
 * 3. BOLD_MANIFESTO: Gerakan publik / Bauhaus / kinetic, 0 stat circles, 2 kartu aksi kontras tinggi.
 * 4. DATA_INFOGRAPHIC: Khusus indikator / data, HANYA di sini stat circles / badges dirender.
 */
export class ParametricSatoriRenderer {
  public static renderParametricPoster(options: ParametricPosterOptions): any {
    const compositionPlan = options.compositionPlan || options.plan;
    const resolvedColors = options.resolvedColors || options.colors || {
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
    const rawCopy: any = options.copy || {};
    const headline = options.headline || rawCopy.mainBannerTitle || rawCopy.headline || 'POLARIS';
    const quote = options.quote || rawCopy.mainBannerSubheader || rawCopy.quote || '';
    const copy: SynthesizedEditorialCopy = {
      mainBannerTitle: headline,
      mainBannerSubheader: quote,
      mainBannerDefinitionBody: rawCopy.mainBannerDefinitionBody || '',
      blocks: rawCopy.blocks || {},
      mappedVisualCutouts: rawCopy.mappedVisualCutouts || {},
      statCircles: rawCopy.statCircles || [],
      numberedItems: rawCopy.numberedItems || [],
      layoutVariant: rawCopy.layoutVariant,
      headerPlacement: rawCopy.headerPlacement,
      cardArrangement: rawCopy.cardArrangement,
      ...rawCopy,
    };

    const {
      width = 1080,
      height = 1350,
      memberName = 'POLARIS MEMBER',
      memberTitle = 'ANGGOTA DEWAN',
      editionTag = 'EDISI RESMI',
      logoDataUri,
      qrCodeDataUri,
      subPhotos = [],
      skinConfig = {},
    } = options;

    const structuralFamily: StructuralFamily = skinConfig.structuralFamily || 'EDITORIAL_MAGAZINE';
    const layoutVariant = compositionPlan?.layoutVariant || copy.layoutVariant || 'TOP_BANNER';
    const headerPlacement = compositionPlan?.headerPlacement || copy.headerPlacement || 'top';
    const cardArrangement = compositionPlan?.cardArrangement || copy.cardArrangement || 'horizontal_split';

    const isDark = resolvedColors.isDark !== false;

    // 1. Primitive: Masthead
    const mastheadNode = buildMastheadPrimitive({
      style: skinConfig.mastheadStyle || (structuralFamily === 'CINEMATIC_MINIMAL' ? 'MODERN_MINIMAL' : 'BROADSHEET_CLASSIC'),
      editionTag,
      logoDataUri,
      colors: resolvedColors,
      isDark,
    });

    // 2. Primitive: Headline
    const headlineZoneSurface = compositionPlan?.zones?.find(
      (z) => z.role === 'HEADLINE'
    )?.surface;

    const displayTitle = wordSafeHeadlineTruncate(copy.mainBannerTitle || headline || 'POLARIS', 34);

    const headlineNode = buildHeadlinePrimitive({
      title: displayTitle,
      subheader: copy.mainBannerSubheader,
      definitionBody: structuralFamily === 'CINEMATIC_MINIMAL' ? undefined : (quote || copy.mainBannerDefinitionBody),
      fontFamily: skinConfig.headlineFontFamily || (structuralFamily === 'CINEMATIC_MINIMAL' ? 'DejaVu Serif' : 'Bebas Neue'),
      maxFontSize: skinConfig.headlineMaxFontSize || (structuralFamily === 'CINEMATIC_MINIMAL' ? 96 : 88),
      surfaceMode: headlineZoneSurface || skinConfig.headlineSurface || (structuralFamily === 'CINEMATIC_MINIMAL' ? 'NONE' : 'HAIRLINE'),
      align: skinConfig.headlineAlign || 'left',
      colors: resolvedColors,
      isDark,
    });

    // 3. Primitive: Sub Photos (jika ada thumbnail)
    const photoNodes = subPhotos.map((p) =>
      buildPhotoFramePrimitive({
        photoDataUri: p.dataUri,
        caption: p.caption,
        style: p.style || skinConfig.defaultPhotoStyle || 'CLEAN_FRAME',
        colors: resolvedColors,
        isDark,
      })
    );

    // 4. Primitive: Member Signature
    const sigZoneSurface = compositionPlan?.zones?.find(
      (z) => z.role === 'MEMBER_SIGNATURE'
    )?.surface;

    const signatureNode = buildMemberSignaturePrimitive({
      memberName,
      memberTitle,
      qrCodeDataUri,
      surfaceMode: sigZoneSurface || skinConfig.signatureSurface || (structuralFamily === 'CINEMATIC_MINIMAL' ? 'HAIRLINE' : 'SOLID_BAND'),
      borderAccentSide: skinConfig.signatureBorderSide || 'left',
      colors: resolvedColors,
      isDark,
    });

    // Assembly VNode pohon layout berdasarkan Structural Family & Layout Variant
    const rootStyles = VariantResolver.resolveRootContainer(
      layoutVariant,
      headerPlacement,
      '40px 48px'
    );

    let mainChildren: any[] = [];

    // =======================================================================
    // FAMILY 1: CINEMATIC_MINIMAL (Fine Art, Storybook, Polaroid, Film Poster)
    // 0 Stat Circles, 0 Large Columns Box. 65-70% kanvas terbuka bersih untuk karya AI.
    // =======================================================================
    if (structuralFamily === 'CINEMATIC_MINIMAL') {
      const cleanQuote = smartSentenceClamp(safeEditorialText(quote || copy.mainBannerDefinitionBody || ''), 130);
      const pullQuoteNode = cleanQuote
        ? {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderLeft: `3.5px solid ${resolvedColors.primaryAccent}`,
                paddingLeft: '16px',
                marginBottom: '16px',
                maxWidth: '850px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: skinConfig.headlineFontFamily === 'DejaVu Serif' ? 'DejaVu Serif' : 'Plus Jakarta Sans',
                      fontSize: '15px',
                      fontStyle: 'italic',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      lineHeight: 1.45,
                    },
                    children: `"${cleanQuote}"`,
                  },
                },
              ],
            },
          }
        : null;

      const middleOpenSpace = {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flex: 1,
            width: '100%',
            minHeight: '440px',
            alignItems: 'center',
            justifyContent: 'center',
          },
          children: photoNodes.length > 0 ? [photoNodes[0]] : [],
        },
      };

      if (layoutVariant === 'BOTTOM_ANCHOR' || headerPlacement === 'bottom') {
        mainChildren = [
          mastheadNode,
          middleOpenSpace,
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
              children: [pullQuoteNode, headlineNode, signatureNode].filter(Boolean),
            },
          },
        ];
      } else {
        mainChildren = [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
              children: [mastheadNode, headlineNode],
            },
          },
          middleOpenSpace,
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
              children: [pullQuoteNode, signatureNode].filter(Boolean),
            },
          },
        ];
      }
    }

    // =======================================================================
    // FAMILY 2: EDITORIAL_MAGAZINE (Swiss Duotone, Broadsheet Newspaper, Gazette)
    // 0 Stat Circles. 2 Kolom Berdampingan Horizontal (50% kiri / 50% kanan) dipisah hairline rule.
    // =======================================================================
    else if (structuralFamily === 'EDITORIAL_MAGAZINE') {
      const blockEntries = Object.values(copy.blocks || {});
      const leftBlock = blockEntries[0] || {
        header: 'FOKUS KEBIJAKAN',
        body: copy.mainBannerDefinitionBody || 'Evaluasi tata kelola anggaran dan keselarasan regulasi demi transparansi publik.',
      };
      const rightBlock = blockEntries[1] || {
        header: 'AKSI PARLEMEN',
        body: 'Pengawasan berkala dan pendampingan advokasi berkelanjutan bersama konstituen.',
      };

      const magazineColumnsNode = {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)'}`,
            borderRadius: '8px',
            padding: '18px 22px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box',
            marginBottom: '16px',
          },
          children: [
            // Kolom Kiri (50%)
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  paddingRight: '18px',
                  borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
                  gap: '6px',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontFamily: skinConfig.headlineFontFamily === 'Bebas Neue' ? 'Bebas Neue' : 'Anton',
                        fontSize: '17px',
                        color: resolvedColors.primaryAccent,
                        letterSpacing: '0.04em',
                      },
                      children: safeEditorialText(leftBlock.header || 'FOKUS KEBIJAKAN').toUpperCase().slice(0, 36),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '11px',
                        lineHeight: 1.45,
                        color: isDark ? '#E2E8F0' : '#334155',
                      },
                      children: smartSentenceClamp(safeEditorialText(leftBlock.body || ''), 135),
                    },
                  },
                ],
              },
            },
            // Kolom Kanan (50%)
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  paddingLeft: '18px',
                  gap: '6px',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontFamily: skinConfig.headlineFontFamily === 'Bebas Neue' ? 'Bebas Neue' : 'Anton',
                        fontSize: '17px',
                        color: resolvedColors.primaryAccent,
                        letterSpacing: '0.04em',
                      },
                      children: safeEditorialText(rightBlock.header || 'AKSI PARLEMEN').toUpperCase().slice(0, 36),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '11px',
                        lineHeight: 1.45,
                        color: isDark ? '#E2E8F0' : '#334155',
                      },
                      children: smartSentenceClamp(safeEditorialText(rightBlock.body || ''), 135),
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const middleOpenSpace = {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flex: 1,
            width: '100%',
            minHeight: '260px',
          },
        },
      };

      mainChildren = [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
            children: [mastheadNode, headlineNode],
          },
        },
        middleOpenSpace,
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
            children: [magazineColumnsNode, signatureNode],
          },
        },
      ];
    }

    // =======================================================================
    // FAMILY 3: BOLD_MANIFESTO (Bauhaus, Kinetic Motion, Torn Vision, Collage)
    // 0 Stat Circles. Pita judul tegas + 2 Kartu Aksi Kompak Berdampingan.
    // =======================================================================
    else if (structuralFamily === 'BOLD_MANIFESTO') {
      const blockEntries = Object.values(copy.blocks || {});
      const cardA = blockEntries[0] || {
        header: 'RESPONS CEPAT',
        body: copy.mainBannerDefinitionBody || 'Respons taktis langsung di lapangan menyerap aspirasi kritis.',
      };
      const cardB = blockEntries[1] || {
        header: 'KOMITMEN TEGAS',
        body: 'Kawal transparansi kebijakan daerah demi kesejahteraan warga.',
      };

      const manifestoCardsNode = {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            width: '100%',
            marginBottom: '16px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderLeft: `4px solid ${resolvedColors.primaryAccent}`,
                  borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRight: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '6px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontFamily: 'Anton',
                        fontSize: '16px',
                        color: resolvedColors.primaryAccent,
                        letterSpacing: '0.04em',
                      },
                      children: safeEditorialText(cardA.header).toUpperCase().slice(0, 32),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '11px',
                        lineHeight: 1.4,
                        color: isDark ? '#CBD5E1' : '#475569',
                      },
                      children: smartSentenceClamp(safeEditorialText(cardA.body), 110),
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderLeft: `4px solid ${resolvedColors.secondaryAccent || resolvedColors.primaryAccent}`,
                  borderTop: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRight: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '6px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontFamily: 'Anton',
                        fontSize: '16px',
                        color: resolvedColors.secondaryAccent || resolvedColors.primaryAccent,
                        letterSpacing: '0.04em',
                      },
                      children: safeEditorialText(cardB.header).toUpperCase().slice(0, 32),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '11px',
                        lineHeight: 1.4,
                        color: isDark ? '#CBD5E1' : '#475569',
                      },
                      children: smartSentenceClamp(safeEditorialText(cardB.body), 110),
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const middleOpenSpace = {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flex: 1,
            width: '100%',
            minHeight: '260px',
          },
        },
      };

      mainChildren = [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
            children: [mastheadNode, headlineNode],
          },
        },
        middleOpenSpace,
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' },
            children: [manifestoCardsNode, signatureNode],
          },
        },
      ];
    }

    // =======================================================================
    // FAMILY 4: DATA_INFOGRAPHIC (Pop Magazine, Indikator & Capaian Kinerja)
    // HANYA pada mode inilah Stat Badges Primitive (3 Lingkaran Data) dirender.
    // =======================================================================
    else {
      const statCircles = copy.statCircles && copy.statCircles.length > 0
        ? copy.statCircles
        : [
            { topLabel: 'CAPAIAN', value: '100%', description: 'Realisasi program tepat sasaran.' },
            { topLabel: 'PENERIMA', value: '2.500+', description: 'Warga terdata mendapat manfaat.' },
            { topLabel: 'EVALUASI', value: 'TERUJI', description: 'Transparansi anggaran berkala.' },
          ];

      // 4. Primitive: Stat Badges
      const statsNode = buildStatBadgesPrimitive({
        statCircles,
        numberedItems: copy.numberedItems,
        colors: resolvedColors,
        isDark,
      });

      // 5. Primitive: Editorial Columns
      const bodyZoneSurface = compositionPlan?.zones?.find(
        (z) => z.role === 'EDITORIAL_BODY' || z.role === 'COLUMNS' || z.role === 'CARDS'
      )?.surface;

      const columnsNode = buildEditorialColumnsPrimitive({
        blocks: copy.blocks || {},
        arrangement: cardArrangement,
        surfaceMode: bodyZoneSurface || skinConfig.columnsSurface || 'HAIRLINE',
        colors: resolvedColors,
        isDark,
        maxBlocks: layoutVariant === 'EDITORIAL_SPLIT' ? 2 : 3,
      });

      if (layoutVariant === 'BOTTOM_ANCHOR' || headerPlacement === 'bottom') {
        mainChildren = [
          mastheadNode,
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                width: '100%',
              },
              children: [
                ...(statsNode ? [statsNode] : []),
                ...(photoNodes.length > 0
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'row', gap: '16px' },
                          children: photoNodes,
                        },
                      },
                    ]
                  : []),
                ...(columnsNode ? [columnsNode] : []),
                headlineNode,
                signatureNode,
              ],
            },
          },
        ];
      } else if (layoutVariant === 'EDITORIAL_SPLIT') {
        mainChildren = [
          mastheadNode,
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: '32px',
                flex: '1',
                margin: '24px 0',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '1',
                      gap: '16px',
                    },
                    children: [headlineNode, ...(statsNode ? [statsNode] : [])],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '1',
                      gap: '16px',
                    },
                    children: [
                      ...(columnsNode ? [columnsNode] : []),
                      ...(photoNodes.length > 0
                        ? [
                            {
                              type: 'div',
                              props: {
                                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                                children: photoNodes,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
              ],
            },
          },
          signatureNode,
        ];
      } else if (layoutVariant === 'CENTERED_HERO') {
        mainChildren = [
          mastheadNode,
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                gap: '20px',
                flex: '1',
              },
              children: [
                headlineNode,
                ...(columnsNode ? [columnsNode] : []),
                ...(statsNode ? [statsNode] : []),
              ],
            },
          },
          signatureNode,
        ];
      } else {
        // TOP_BANNER (Default Data Infographic)
        mainChildren = [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                width: '100%',
              },
              children: [mastheadNode, headlineNode],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                width: '100%',
              },
              children: [
                ...(statsNode ? [statsNode] : []),
                ...(photoNodes.length > 0
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'row', gap: '16px' },
                          children: photoNodes,
                        },
                      },
                    ]
                  : []),
                ...(columnsNode ? [columnsNode] : []),
                signatureNode,
              ],
            },
          },
        ];
      }
    }

    return {
      type: 'div',
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          ...rootStyles,
          position: 'relative',
          fontFamily: 'Plus Jakarta Sans',
        },
        children: mainChildren,
      },
    };
  }
}
