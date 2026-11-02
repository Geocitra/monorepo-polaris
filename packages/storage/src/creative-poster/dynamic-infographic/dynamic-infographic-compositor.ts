import sharp from 'sharp';
import satori from 'satori';
import { FontLoader } from '../core/font-loader.js';
import {
  DynamicInfographicContent,
  DynamicInfographicLayoutSpec,
  DynamicInfographicVisualAssets,
  DynamicInfographicComposeResult,
} from './dynamic-infographic.types.js';

export class DynamicInfographicCompositor {
  public static async compose(
    content: DynamicInfographicContent,
    layout: DynamicInfographicLayoutSpec,
    visualAssets: DynamicInfographicVisualAssets = {},
    options: { outputFormat?: 'jpeg' | 'webp'; quality?: number } = {}
  ): Promise<DynamicInfographicComposeResult> {
    const { outputFormat = 'webp', quality = 92 } = options;

    // 1. Muat font typography
    const fonts = await FontLoader.getFonts();
    const plusJakarta = fonts.find((f) => f.name === 'PlusJakartaSans') || fonts[0];
    const anton = fonts.find((f) => f.name === 'Anton') || fonts[0];

    const rootChildren: any[] = [];

    // 2. Vintage Canvas Double Border
    const borderColor = layout.canvas.borderColor || '#6D4C3D';
    rootChildren.push({
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '1056px',
          height: '1326px',
          border: `4px solid ${borderColor}`,
          borderRadius: '4px',
        },
      },
    });
    rootChildren.push({
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '18px',
          left: '18px',
          width: '1044px',
          height: '1314px',
          border: '1px solid #8D6E63',
          borderRadius: '2px',
        },
      },
    });

    // 3. SVG Wedges Fan & Divider Lines (jika ada pada tata letak)
    const svgChildren: any[] = [];
    if (layout.wedges && layout.wedges.length > 0) {
      for (const w of layout.wedges) {
        svgChildren.push({
          type: 'polygon',
          props: {
            points: w.points,
            fill: w.fill,
            opacity: w.opacity ?? 0.85,
          },
        });
      }
    }
    if (layout.dividerLines && layout.dividerLines.length > 0) {
      for (const l of layout.dividerLines) {
        svgChildren.push({
          type: 'line',
          props: {
            x1: l.x1,
            y1: l.y1,
            x2: l.x2,
            y2: l.y2,
            stroke: l.stroke || '#D7CCC8',
            strokeWidth: String(l.strokeWidth || 1.5),
          },
        });
      }
    }

    if (svgChildren.length > 0) {
      rootChildren.push({
        type: 'svg',
        props: {
          style: {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '1080px',
            height: '1350px',
          },
          children: svgChildren,
        },
      });
    }

    // 4. Pita Judul Vertikal di Sisi Kiri
    if (layout.leftRibbon) {
      const letters = layout.leftRibbon.titleLetters?.length > 0
        ? layout.leftRibbon.titleLetters
        : content.mainTitle.replace(/\s+/g, '').slice(0, 10).split('');

      const letterElements = letters.map((char) => ({
        type: 'div',
        props: {
          style: {
            fontSize: `${layout.leftRibbon?.fontSize || 54}px`,
            fontFamily: 'Anton',
            color: layout.leftRibbon?.color || '#4A3525',
            lineHeight: '1',
            textAlign: 'center',
            marginBottom: '14px',
            textShadow: '2px 2px 0px rgba(255,255,255,0.7)',
          },
          children: char,
        },
      }));

      rootChildren.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: `${layout.leftRibbon.y}px`,
            left: `${layout.leftRibbon.x}px`,
            width: `${layout.leftRibbon.w}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          },
          children: letterElements,
        },
      });

      // Dekorasi buku antik di bawah pita judul jika diizinkan
      if (layout.leftRibbon.hasOpenBookIcon && visualAssets.decorations?.open_book) {
        const bookB64 = `data:image/jpeg;base64,${visualAssets.decorations.open_book.toString('base64')}`;
        rootChildren.push({
          type: 'img',
          props: {
            src: bookB64,
            style: {
              position: 'absolute',
              left: `${layout.leftRibbon.x}px`,
              top: `${layout.leftRibbon.y + layout.leftRibbon.h}px`,
              width: `${layout.leftRibbon.w}px`,
              height: '75px',
              objectFit: 'contain',
            },
          },
        });
      }
    }

    // 5. Motif Visual Utama (Jam Melingkar / Emblem AI)
    if (layout.motif && layout.motif.type !== 'none' && visualAssets.motifImageBuffer) {
      const motifB64 = `data:image/png;base64,${visualAssets.motifImageBuffer.toString('base64')}`;
      const size = layout.motif.size || 320;
      const borderRadius = layout.motif.borderRadius !== undefined ? `${layout.motif.borderRadius}px` : `${Math.round(size / 2)}px`;

      rootChildren.push({
        type: 'img',
        props: {
          src: motifB64,
          style: {
            position: 'absolute',
            left: `${layout.motif.x}px`,
            top: `${layout.motif.y}px`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius,
            overflow: 'hidden',
            objectFit: 'cover',
            boxShadow: '0 8px 24px rgba(60,35,15,0.35)',
          },
        },
      });
    }

    // 6. Seksi-Seksi Konten Infografis Dinamis
    content.sections.forEach((sec, idx) => {
      const secLayout = layout.sections.find((s) => s.id === sec.id) || layout.sections[idx];
      if (!secLayout) return;

      const badge = secLayout.badge;
      const rawTb = secLayout.textBox || (secLayout as any).box || {};
      const tb = {
        x: rawTb.x ?? 72,
        y: rawTb.y ?? (310 + idx * 240),
        w: rawTb.w ?? (rawTb as any).width ?? 440,
        h: rawTb.h ?? (rawTb as any).height ?? 220,
      };

      const rawIb = secLayout.imageBox;
      const ib = rawIb
        ? {
            x: rawIb.x ?? 0,
            y: rawIb.y ?? 0,
            w: rawIb.w ?? (rawIb as any).width ?? 90,
            h: rawIb.h ?? (rawIb as any).height ?? 90,
          }
        : undefined;
      const secImgBuffer = visualAssets.sectionImageBuffers?.[sec.id] || visualAssets.decorations?.[sec.id];

      // A. Era Badge
      if (badge && (badge.text || sec.phaseTag)) {
        rootChildren.push({
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: `${badge.x}px`,
              top: `${badge.y}px`,
              backgroundColor: badge.color || sec.badgeColor || '#8B5E3C',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '12px',
              display: 'flex',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '0.4px',
              whiteSpace: 'nowrap',
            },
            children: badge.text || `${sec.phaseTag}${sec.periodLabel ? ` // ${sec.periodLabel}` : ''}`,
          },
        });
      }

      // B. Editorial Text Box & Bullet Points
      const bulletElements = sec.bullets.map((b) => ({
        type: 'div',
        props: {
          style: {
            display: 'flex',
            fontSize: '11px',
            color: '#3E2723',
            lineHeight: '1.35',
            marginBottom: '3px',
          },
          children: [
            {
              type: 'span',
              props: {
                style: {
                  marginRight: '5px',
                  color: badge?.color || sec.badgeColor || '#8B5E3C',
                  fontWeight: 900,
                },
                children: '•',
              },
            },
            {
              type: 'span',
              props: {
                style: { display: 'flex' },
                children: b,
              },
            },
          ],
        },
      }));

      rootChildren.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: `${tb.x}px`,
            top: `${tb.y}px`,
            width: `${tb.w}px`,
            display: 'flex',
            flexDirection: 'column',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#2B1B17',
                  marginBottom: '4px',
                  lineHeight: '1.2',
                },
                children: sec.title,
              },
            },
            ...bulletElements,
          ],
        },
      });

      // C. Ilustrasi Tematik Seksi
      if (ib && secImgBuffer) {
        const secImgB64 = `data:image/jpeg;base64,${secImgBuffer.toString('base64')}`;
        rootChildren.push({
          type: 'img',
          props: {
            src: secImgB64,
            style: {
              position: 'absolute',
              left: `${ib.x}px`,
              top: `${ib.y}px`,
              width: `${ib.w}px`,
              height: `${ib.h}px`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
            },
          },
        });
      }
    });

    // 7. Profile / Verification Badge
    if (layout.profileBox) {
      const memberName = content.memberName || 'POLARIS INDONESIA';
      const memberTitle = content.memberTitle || 'DAPIL // EDISI KHUSUS';
      const monogram = memberName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

      rootChildren.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: `${layout.profileBox.x}px`,
            top: `${layout.profileBox.y}px`,
            width: `${layout.profileBox.w}px`,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #D7CCC8',
            boxShadow: '0 4px 12px rgba(60,35,15,0.1)',
          },
          children: [
            content.memberAvatarBuffer
              ? {
                  type: 'img',
                  props: {
                    src: `data:image/jpeg;base64,${content.memberAvatarBuffer.toString('base64')}`,
                    style: {
                      width: '42px',
                      height: '42px',
                      borderRadius: '21px',
                      objectFit: 'cover',
                      marginRight: '12px',
                    },
                  },
                }
              : {
                  type: 'div',
                  props: {
                    style: {
                      width: '42px',
                      height: '42px',
                      borderRadius: '21px',
                      backgroundColor: '#6D4C3D',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '14px',
                      marginRight: '12px',
                    },
                    children: monogram,
                  },
                },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '13px', fontWeight: 800, color: '#2B1B17' },
                      children: memberName,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '10px', color: '#6D4C3D', fontWeight: 600 },
                      children: memberTitle,
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    }

    // 8. Satori VDOM Rendering
    const vdom = {
      type: 'div',
      props: {
        style: {
          width: '1080px',
          height: '1350px',
          display: 'flex',
          backgroundColor: layout.canvas.backgroundColor || '#F6F1EA',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'PlusJakartaSans',
        },
        children: rootChildren,
      },
    };

    const svg = await satori(vdom as any, {
      width: 1080,
      height: 1350,
      fonts: [
        {
          name: 'PlusJakartaSans',
          data: plusJakarta.data,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Anton',
          data: anton.data,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    // 9. Sharp Rasterization
    let sharpInstance = sharp(Buffer.from(svg));
    let buffer: Buffer;

    if (outputFormat === 'jpeg') {
      buffer = await sharpInstance.jpeg({ quality }).toBuffer();
    } else {
      buffer = await sharpInstance.webp({ quality }).toBuffer();
    }

    return {
      buffer,
      sizeBytes: buffer.length,
      format: outputFormat,
    };
  }
}

