/**
 * Art-Collage Overlay Layout (Zero-Box Policy)
 *
 * Satori di sini HANYA mencetak tipografi transparan di atas kanvas kolase AI:
 * - TIDAK ADA backgroundColor, kartu, border kotak, atau borderRadius.
 * - Posisi & ukuran mengikuti kotak dari Vision Layout Locator (0..1 ternormalisasi).
 * - Ukuran font dihitung agar teks MUAT di dalam kotak (tidak terpotong di tepi kanvas).
 */

export interface ArtCollageBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ArtCollageOverlayCopy {
  kicker: string;
  headline: string;
  deck: string;
  points: Array<{ label: string; text: string }>;
  closingLine: string;
}

export interface ArtCollageInk {
  headline: string;
  body: string;
  accent: string;
  rule: string;
  /** Bayangan halus untuk zona yang terdeteksi ramai (tanpa kotak). */
  softShadow?: string;
}

export interface ArtCollageOverlayParams {
  width: number;
  height: number;
  copy: ArtCollageOverlayCopy;
  zones: { headline: ArtCollageBox; body: ArtCollageBox; footer: ArtCollageBox };
  ink: ArtCollageInk;
  signature: string;
  editionTag?: string;
  logoDataUri?: string;
  align?: 'left' | 'center';
}

// Rata-rata lebar glyph relatif terhadap font-size (estimasi konservatif)
const GLYPH = { anton: 0.5, bebas: 0.42, jakarta: 0.56 };

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitHeadline(text: string, boxW: number, boxH: number): { size: number; lines: number } {
  const longestWord = Math.max(...text.split(/\s+/).map((w) => w.length), 1);
  for (let size = 168; size >= 34; size -= 2) {
    const charW = size * GLYPH.anton;
    if (longestWord * charW > boxW) continue;
    const cpl = Math.max(1, Math.floor(boxW / charW));
    const lines = wrapLines(text, cpl).length;
    if (lines <= 4 && lines * size * 1.0 <= boxH) return { size, lines };
  }
  return { size: 34, lines: 4 };
}

function estimateBodyHeight(copy: ArtCollageOverlayCopy, boxW: number, s: number): number {
  const lh = s * 1.38;
  const cpl = Math.max(8, Math.floor(boxW / (s * GLYPH.jakarta)));
  const labelSize = Math.round(s * 1.25);
  let h = 0;
  if (copy.deck) h += wrapLines(copy.deck, cpl).length * lh + s * 0.9;
  for (const p of copy.points) {
    h += labelSize * 1.05 + wrapLines(p.text, cpl).length * lh + s * 0.8;
  }
  if (copy.closingLine) h += wrapLines(copy.closingLine, cpl).length * lh;
  return h;
}

function fitBody(copy: ArtCollageOverlayCopy, boxW: number, boxH: number): number {
  for (let s = 28; s >= 13; s -= 1) {
    if (estimateBodyHeight(copy, boxW, s) <= boxH) return s;
  }
  return 13;
}

export function buildArtCollageOverlayLayout(params: ArtCollageOverlayParams): any {
  const { width, height, copy, zones, ink, signature, editionTag, logoDataUri } = params;
  const align = params.align || 'left';
  const px = (b: ArtCollageBox) => ({
    left: Math.round(b.x * width),
    top: Math.round(b.y * height),
    w: Math.round(b.w * width),
    h: Math.round(b.h * height),
  });

  const H = px(zones.headline);
  const B = px(zones.body);
  const F = px(zones.footer);

  const kickerSize = Math.max(16, Math.min(30, Math.round(H.w / 26)));
  const kickerBlock = copy.kicker ? kickerSize * 1.6 : 0;
  const headlineFit = fitHeadline(copy.headline, H.w, Math.max(40, H.h - kickerBlock));
  const bodySize = fitBody(copy, B.w, B.h);
  const labelSize = Math.round(bodySize * 1.25);
  const textAlign = align === 'center' ? 'center' : 'left';
  const alignItems = align === 'center' ? 'center' : 'flex-start';
  const shadow = ink.softShadow ? { textShadow: ink.softShadow } : {};

  const headlineNode = {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        left: H.left,
        top: H.top,
        width: H.w,
        height: H.h,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems,
      },
      children: [
        ...(copy.kicker
          ? [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Bebas Neue',
                    fontSize: kickerSize,
                    letterSpacing: '0.12em',
                    color: ink.accent,
                    marginBottom: Math.round(kickerSize * 0.35),
                    textAlign,
                    ...shadow,
                  },
                  children: copy.kicker,
                },
              },
            ]
          : []),
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Anton',
              fontSize: headlineFit.size,
              lineHeight: 0.98,
              letterSpacing: '-0.005em',
              color: ink.headline,
              width: '100%',
              textAlign,
              ...shadow,
            },
            children: copy.headline,
          },
        },
      ],
    },
  };

  const bodyChildren: any[] = [];
  if (copy.deck) {
    bodyChildren.push({
      type: 'div',
      props: {
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          fontSize: bodySize,
          lineHeight: 1.38,
          color: ink.body,
          marginBottom: Math.round(bodySize * 0.9),
          textAlign,
          ...shadow,
        },
        children: copy.deck,
      },
    });
  }
  for (const p of copy.points) {
    bodyChildren.push({
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems,
          marginBottom: Math.round(bodySize * 0.8),
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Bebas Neue',
                fontSize: labelSize,
                letterSpacing: '0.06em',
                color: ink.accent,
                lineHeight: 1.05,
                ...shadow,
              },
              children: p.label,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 600,
                fontSize: bodySize,
                lineHeight: 1.38,
                color: ink.body,
                textAlign,
                ...shadow,
              },
              children: p.text,
            },
          },
        ],
      },
    });
  }
  if (copy.closingLine) {
    bodyChildren.push({
      type: 'div',
      props: {
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          fontSize: bodySize,
          lineHeight: 1.38,
          color: ink.accent,
          textAlign,
          ...shadow,
        },
        children: copy.closingLine,
      },
    });
  }

  const bodyNode = {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        left: B.left,
        top: B.top,
        width: B.w,
        height: B.h,
        display: 'flex',
        flexDirection: 'column',
        alignItems,
      },
      children: bodyChildren,
    },
  };

  const footerSize = Math.max(12, Math.min(18, Math.round(F.h * 0.38)));
  const footerNode = {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        left: F.left,
        top: F.top,
        width: F.w,
        height: F.h,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Garis rule tipografis tipis (bukan kotak kartu)
        borderTop: `1.5px solid ${ink.rule}`,
        paddingTop: Math.round(F.h * 0.12),
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
            children: [
              ...(logoDataUri
                ? [
                    {
                      type: 'img',
                      props: {
                        src: logoDataUri,
                        style: { height: Math.round(F.h * 0.6), marginRight: 12, objectFit: 'contain' },
                      },
                    },
                  ]
                : []),
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 700,
                    fontSize: footerSize,
                    letterSpacing: '0.04em',
                    color: ink.body,
                    ...shadow,
                  },
                  children: signature.toUpperCase(),
                },
              },
            ],
          },
        },
        ...(editionTag
          ? [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Bebas Neue',
                    fontSize: Math.round(footerSize * 1.15),
                    letterSpacing: '0.1em',
                    color: ink.accent,
                    ...shadow,
                  },
                  children: editionTag.toUpperCase(),
                },
              },
            ]
          : []),
      ],
    },
  };

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        display: 'flex',
        position: 'relative',
        backgroundColor: 'transparent',
      },
      children: [headlineNode, bodyNode, footerNode],
    },
  };
}
