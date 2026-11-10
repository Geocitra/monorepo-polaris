import { describe, it, expect, afterAll } from 'vitest';
import sharp from 'sharp';
import { ChromiumPosterCompositor } from '../src/creative-poster/chromium-poster-compositor.js';
import { BrowserSingleton } from '../src/creative-poster/browser-singleton.js';

describe('ChromiumPosterCompositor (Playwright Headless)', { timeout: 30000 }, () => {
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
  }, 30000);

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
  it('harus mengekstrak layer manifest granular (kartu + teks terpisah) untuk Magic Layers', async () => {
    const dummyCanvas = await sharp({
      create: { width: 928, height: 1152, channels: 3, background: { r: 200, g: 190, b: 180 } },
    })
      .webp()
      .toBuffer();

    const points = Array.from({ length: 5 }, (_, i) => ({
      label: `PILAR UJI ${i + 1}`,
      text: `Deskripsi pilar nomor ${i + 1} untuk pengujian pemisahan layer komponen.`,
    }));

    const result = await ChromiumPosterCompositor.compose({
      canvasBuffer: dummyCanvas,
      copy: {
        kicker: 'DATA UJI // ANALISIS',
        headline: 'JUDUL UTAMA PENGUJIAN',
        deck: 'Deck pengujian.',
        stats: [
          { value: '9,3%', label: 'STAT A' },
          { value: 'RP 1 T', label: 'STAT B' },
          { value: '15', label: 'STAT C' },
          { value: '50%', label: 'STAT D' },
        ],
        points,
        closingLine: 'Kalimat penutup pengujian.',
      },
      zones: {},
      archetype: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    });

    const manifest = result.layoutManifest;
    expect(manifest).not.toBeNull();
    expect(manifest!.width).toBe(1080);
    expect(manifest!.height).toBe(1350);

    if (process.env.DUMP_LAYER_MANIFEST) {
      const fs = await import('fs');
      fs.writeFileSync(process.env.DUMP_LAYER_MANIFEST, JSON.stringify(manifest, null, 2));
      fs.writeFileSync(process.env.DUMP_LAYER_MANIFEST + '.webp', result.buffer);
    }

    const texts = manifest!.layers.filter((l) => l.kind === 'text');
    const textOf = (t: string) => texts.find((l) => l.kind === 'text' && l.text === t);

    // Setiap elemen kartu adalah layer teks tersendiri
    expect(textOf('◈ 01')).toBeTruthy();
    expect(textOf('PILAR UJI 1')).toBeTruthy();
    expect(textOf(points[0].text)).toBeTruthy();
    expect(textOf('STAT A')).toBeTruthy();
    expect(textOf('JUDUL UTAMA PENGUJIAN')).toBeTruthy();

    // Badge membawa kotak latarnya sendiri (pill)
    const badge = textOf('◈ 01');
    expect(badge && badge.kind === 'text' && badge.box?.fill).toBeTruthy();

    // Kotak panel kartu tersedia sebagai frame
    expect(manifest!.layers.some((l) => l.kind === 'frame' && l.role === 'apillars-cols-container')).toBe(true);
  });
});
