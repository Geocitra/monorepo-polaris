import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Kajian & Gagasan Kebijakan Publik';
    const author = searchParams.get('author') || 'Anggota Dewan';
    const dapil = searchParams.get('dapil') || 'Wilayah Tugas Parlemen';
    const party = searchParams.get('party') || 'Parlemen';
    const category = searchParams.get('category') || 'KEBIJAKAN PUBLIK';
    const primaryColor = searchParams.get('color') || '#1890FF';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0F172A', // Slate 900
            padding: '64px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Garis Aksen Warna Partai di Bagian Atas */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12px',
              backgroundColor: primaryColor,
            }}
          />

          {/* Header Kartu: Badge Kategori & Logo POLARIS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                padding: '8px 20px',
              }}
            >
              <span
                style={{
                  color: primaryColor,
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '18px',
                }}
              >
                P
              </div>
              <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
                POLARIS.ID
              </span>
            </div>
          </div>

          {/* Tengah: Judul Artikel Kebijakan */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '24px', marginBottom: '24px' }}>
            <h1
              style={{
                fontSize: title.length > 60 ? '46px' : '56px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.25,
                maxHeight: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Footer: Identitas Anggota Dewan & Dapil */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '28px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#FFFFFF', fontSize: '26px', fontWeight: 800 }}>
                {author}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '18px', marginTop: '4px' }}>
                Fraksi {party} • Dapil {dapil}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: primaryColor,
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              Baca Selengkapnya
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
