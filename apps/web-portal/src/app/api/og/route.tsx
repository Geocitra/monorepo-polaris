import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Kajian & Gagasan Kebijakan Publik';
    const author = searchParams.get('author') || 'Dr. H. Ahmad Fauzi, M.Si';
    const dapil = searchParams.get('dapil') || 'Wilayah Tugas Parlemen';
    const party = searchParams.get('party') || 'Parlemen';
    const category = searchParams.get('category') || 'RISALAH KEBIJAKAN PUBLIK';
    const primaryColor = searchParams.get('color') || '#1890FF';

    // Inisial Tokoh Bersih dari Gelar Akademik & Keagamaan
    const cleanAuthor = author
      .replace(/\b(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.|M\.Si|S\.H\.|S\.E\.|S\.Sos|B\.A\.|M\.A\.|Ph\.D)\b/gi, '')
      .replace(/[,.]/g, '')
      .trim();
    const words = cleanAuthor.split(/\s+/).filter(Boolean);
    const initials = (
      words.length >= 2 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2) || 'AF'
    ).toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #060911 0%, #0D1527 50%, #070B14 100%)',
            padding: '52px 64px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Ambient Glowing Color Aura (Top-Right) */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '500px',
              height: '500px',
              borderRadius: '999px',
              background: `linear-gradient(135deg, ${primaryColor}4D 0%, transparent 70%)`,
            }}
          />

          {/* Ambient Glowing Color Aura (Bottom-Left) */}
          <div
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: '-120px',
              width: '450px',
              height: '450px',
              borderRadius: '999px',
              background: `linear-gradient(45deg, ${primaryColor}33 0%, transparent 70%)`,
            }}
          />

          {/* Garis Aksen Tri-Color Elegan di Sisi Paling Atas */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: `linear-gradient(90deg, ${primaryColor} 0%, #FFFFFF 50%, ${primaryColor} 100%)`,
            }}
          />

          {/* ─── HEADER: BADGE KATEGORI & BRAND POLARIS CIVIC INTELLIGENCE ─── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Kategori Badge dengan Glowing Dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '999px',
                padding: '9px 20px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 10px ${primaryColor}`,
                }}
              />
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1.4px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </span>
            </div>

            {/* Logo POLARIS Civic Intelligence */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(13, 21, 39, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '8px 16px',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  backgroundColor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#060911',
                  fontWeight: 900,
                  fontSize: '17px',
                }}
              >
                P
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                  }}
                >
                  POLARIS
                </span>
                <span
                  style={{
                    color: '#64748B',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.7px',
                  }}
                >
                  CIVIC INTELLIGENCE
                </span>
              </div>
            </div>
          </div>

          {/* ─── BODY: JUDUL BESAR & SUBTITLE PRESTIGIUS ─── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 10,
              margin: '28px 0',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 55 ? '44px' : '52px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.18,
                letterSpacing: '-1px',
                maxHeight: '230px',
                overflow: 'hidden',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              {title}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px',
                color: '#94A3B8',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              <span style={{ color: primaryColor, fontSize: '18px' }}>◆</span>
              <span>Dokumen Resmi & Aspirasi Kebijakan Terverifikasi</span>
            </div>
          </div>

          {/* ─── FOOTER: IDENTITAS DEWAN & VERIFIKASI RESMI ─── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              paddingTop: '22px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Identitas Tokoh dengan Monogram Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: `2px solid ${primaryColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '20px',
                  boxShadow: `0 0 16px ${primaryColor}40`,
                }}
              >
                {initials}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      color: '#FFFFFF',
                      fontSize: '22px',
                      fontWeight: 800,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {author}
                  </span>

                  {/* Verified Check Badge (SVG) */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      backgroundColor: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#060911"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <span
                  style={{
                    color: '#94A3B8',
                    fontSize: '15px',
                    fontWeight: 500,
                    marginTop: '2px',
                  }}
                >
                  Fraksi {party} • Dapil {dapil}
                </span>
              </div>
            </div>

            {/* Pill CTA Resmi */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, #2563EB 100%)`,
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.3px',
                boxShadow: `0 4px 20px ${primaryColor}55`,
              }}
            >
              <span>Baca Risalah Resmi</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    return new Response('Gagal me-render kartu OpenGraph', { status: 500 });
  }
}
