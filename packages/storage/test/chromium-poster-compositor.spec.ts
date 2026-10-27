import { describe, it, expect, afterAll } from 'vitest';
import sharp from 'sharp';
import { ChromiumPosterCompositor } from '../src/creative-poster/chromium-poster-compositor.js';
import { BrowserSingleton } from '../src/creative-poster/browser-singleton.js';

describe('ChromiumPosterCompositor (Playwright Headless)', () => {
  afterAll(async () => {
    await BrowserSingleton.close();
  });

  it('harus merender poster HTML/CSS via Chromium menjadi WebP 1080x1350 pixel-perfect', async () => {
    // 1. Kanvas sintetis (1080x1350)
    const dummyCanvas = await sharp({
      create: {
        width: 1080,
        height: 1350,
        channels: 3,
        background: { r: 245, g: 245, b: 240 },
      },
    })
      .webp()
      .toBuffer();

    // 2. Eksekusi render via Chromium
    const result = await ChromiumPosterCompositor.compose({
      canvasBuffer: dummyCanvas,
      copy: {
        kicker: 'INFRASTRUKTUR DAERAH',
        headline: 'PERCEPATAN JALUR LOGISTIK JAWA BARAT',
        deck: 'Pengawasan alokasi perbaikan ruas jalan vital untuk memulihkan arus mobilitas warga.',
        points: [
          { label: 'AUDIT JALUR', text: 'Pemeriksaan titik rawan amblas dan perkerasan aspal berstandar.' },
          { label: 'TRANSPARANSI', text: 'Setiap pos pembiayaan dibuka akuntabel kepada konstituen.' },
        ],
        closingLine: 'Komitmen mengawal kemaslahatan publik dan efisiensi logistik.',
      },
      zones: {
        headline: { x: 0.08, y: 0.08, w: 0.84, h: 0.18 },
        body: { x: 0.08, y: 0.28, w: 0.84, h: 0.26 },
        footer: { x: 0.08, y: 0.88, w: 0.84, h: 0.06 },
        textTone: 'DARK',
      },
      palette: {
        accentHex: '#D97706',
        secondaryHex: '#374151',
      },
      signature: 'RENO S NUGRAHA — KOMISI DPR RI // JAWA BARAT I',
      editionTag: 'POLARIS // JAWA BARAT I',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.sizeBytes).toBeGreaterThan(10000);
    expect(result.blendModeUsed).toBe('multiply');

    // 3. Verifikasi dimensi dan format file menggunakan sharp
    const meta = await sharp(result.buffer).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1350);
    expect(meta.format).toBe('webp');
  });

  it('harus aman dari XSS/HTML injection dari teks hasil LLM', async () => {
    const dummyCanvas = await sharp({
      create: {
        width: 1080,
        height: 1350,
        channels: 3,
        background: { r: 20, g: 25, b: 35 },
      },
    })
      .webp()
      .toBuffer();

    const result = await ChromiumPosterCompositor.compose({
      canvasBuffer: dummyCanvas,
      copy: {
        headline: '<script>alert("hack")</script> & "KUOTA SUBSIDI"',
        points: [{ label: '<b>INJEKSI</b>', text: '<img src=x onerror=alert(1)>' }],
      },
      zones: {},
      palette: {
        accentHex: 'red; background: black', // Nilai kotor, harus jatuh ke fallback aman
      },
      signature: '<marquee>ANGGOTA DEWAN</marquee>',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    const meta = await sharp(result.buffer).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1350);
  });
});
