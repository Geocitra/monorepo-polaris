import { SynthesizedEditorialCopy } from '../types.js';
import { getAdaptiveFontSize, smartTruncate } from '../core/adaptive-typography.js';

export interface StandardEditorialLayoutParams {
  width: number;
  height: number;
  headline: string;
  quote?: string;
  copy: SynthesizedEditorialCopy;
  memberName: string;
  memberTitle: string;
  editionTag: string;
  primaryAccent: string;
  secondaryAccent?: string;
  archetype: string;
  logoDataUri?: string;
}

export function buildStandardEditorialLayout(params: StandardEditorialLayoutParams): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent,
    secondaryAccent,
    archetype,
    logoDataUri,
  } = params;

  const displayTitle = (copy.mainBannerTitle || headline || 'POLARIS EDITORIAL').toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'ASPIRASI & KEBIJAKAN PARLEMEN';
  const displayQuote =
    quote ||
    copy.mainBannerDefinitionBody ||
    'Mewujudkan tata kelola kebijakan publik yang transparan, akuntabel, dan berkeadilan bagi seluruh rakyat.';

  const isRetro = archetype === 'RETRO_CAMPAIGN';
  const isProfile = archetype === 'STATEMENT_PROFILE';

  const secAccent = secondaryAccent || copy.secondaryAccent || (isRetro ? '#FEF08A' : '#38BDF8');
  const cardBg = copy.cardBackground || 'rgba(8, 12, 22, 0.86)';
  const cardBrd = copy.cardBorder || 'rgba(255, 255, 255, 0.16)';

  const titleFontSize = getAdaptiveFontSize(displayTitle, isProfile ? 84 : 96, 52, 16);
  const quoteFontSize = getAdaptiveFontSize(displayQuote, 14, 11, 140);


  const stats = copy.statCircles && copy.statCircles.length >= 3
    ? copy.statCircles.slice(0, 3)
    : [
        { topLabel: 'KOMITMEN 01', value: 'Transparansi', description: 'Keterbukaan alokasi anggaran dan pengawasan.' },
        { topLabel: 'KOMITMEN 02', value: 'Akurasi Data', description: 'Penyaluran program tepat sasaran di lapangan.' },
        { topLabel: 'KOMITMEN 03', value: 'Dampak Nyata', description: 'Peningkatan kesejahteraan riil bagi masyarakat.' },
      ];

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '40px 48px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // 1. HEADER (Logo + Edition Tag + Member Title)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: `2px solid ${isRetro ? primaryAccent : '#E4E4E7'}`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px' },
                  children: [
                    ...(logoDataUri
                      ? [
                          {
                            type: 'img',
                            props: {
                              src: logoDataUri,
                              style: { height: '32px', objectFit: 'contain' },
                            },
                          },
                        ]
                      : []),
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '18px',
                          color: primaryAccent,
                          letterSpacing: '0.06em',
                        },
                        children: editionTag.toUpperCase(),
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isRetro ? '#18181B' : '#F4F4F5',
                    letterSpacing: '0.06em',
                    backgroundColor: isRetro ? '#FEF08A' : 'rgba(0, 0, 0, 0.45)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                  },
                  children: memberTitle.toUpperCase(),
                },
              },
            ],
          },
        },

        // 2. HERO HEADLINE & TOP SUBHEADER (Wrapped in protective container)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '12px',
              backgroundColor: isRetro ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.78)',
              border: `1px solid ${isRetro ? '#E4E4E7' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '8px',
              padding: '16px 22px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '13px',
                    fontWeight: 700,
                    color: primaryAccent,
                    letterSpacing: '0.08em',
                  },
                  children: displaySubheader.slice(0, 65).toUpperCase(),
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: isProfile ? 'Anton' : 'Bebas Neue',
                    fontSize: `${titleFontSize}px`,
                    color: isRetro ? '#18181B' : '#FFFFFF',
                    lineHeight: 0.92,
                    letterSpacing: '0.02em',
                    textShadow: isRetro ? 'none' : '0 4px 18px rgba(0,0,0,0.6)',
                  },
                  children: smartTruncate(displayTitle, 40),
                },
              },
            ],
          },
        },

        // 3. MIDDLE AREA (Data Highlights Grid)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              margin: '12px 0',
            },
            children: stats.map((st) => ({
              type: 'div',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: isRetro ? '#FFFFFF' : 'rgba(15, 23, 42, 0.88)',
                  border: `1.5px solid ${isRetro ? '#E4E4E7' : 'rgba(255, 255, 255, 0.18)'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '10px',
                        fontWeight: 700,
                        color: primaryAccent,
                        letterSpacing: '0.05em',
                      },
                      children: (st.topLabel || 'INDIKATOR').toUpperCase().slice(0, 18),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontFamily: 'Anton',
                        fontSize: '26px',
                        color: isRetro ? '#18181B' : '#FFFFFF',
                        lineHeight: 1.1,
                        margin: '2px 0',
                      },
                      children: (st.value || '100%').slice(0, 15),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '9.5px',
                        color: isRetro ? '#52525B' : '#94A3B8',
                        lineHeight: 1.35,
                      },
                      children: (st.description || '').slice(0, 60),
                    },
                  },
                ],
              },
            })),
          },
        },

        // 4. BOTTOM STATEMENT CARD & MEMBER FOOTER
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            },
            children: [
              // Quote Card (Glassmorphism / Solid Card)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: isRetro ? '#FFFFFF' : 'rgba(15, 23, 42, 0.82)',
                    borderLeft: `5px solid ${primaryAccent}`,
                    borderRadius: '8px',
                    padding: '18px 24px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: `${quoteFontSize}px`,
                          color: isRetro ? '#1F2937' : '#F1F5F9',
                          lineHeight: 1.45,
                          textAlign: 'justify',
                        },
                        children: smartTruncate(displayQuote, 220),
                      },
                    },
                  ],
                },
              },

              // Member Identity Banner
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: '12px 20px',
                    borderRadius: '6px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              fontFamily: 'Anton',
                              fontSize: '20px',
                              color: '#FFFFFF',
                              letterSpacing: '0.04em',
                            },
                            children: memberName.toUpperCase(),
                          },
                          {
                            type: 'span',
                            props: {
                              fontSize: '11px',
                              color: '#94A3B8',
                              letterSpacing: '0.04em',
                            },
                            children: memberTitle.toUpperCase(),
                          },
                        ],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '11px',
                          color: primaryAccent,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        },
                        children: 'POLARIS OFFICIAL MEDIA',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}
