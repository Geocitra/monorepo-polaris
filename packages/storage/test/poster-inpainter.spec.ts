import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { PosterInpainter } from '../src/creative-poster/poster-inpainter.js';
import { PosterColorHarmonizer } from '../src/creative-poster/poster-color-harmonizer.js';
import type { PosterLayerManifest } from '@polaris/shared-types';

describe('PosterInpainter & PosterColorHarmonizer (Canva-Grade Fidelity)', () => {
  it('PosterInpainter menambal area teks dengan warna kertas krem sekitar (bukan #FFFFFF)', async () => {
    // Buat kanvas kertas krem #EAE7DF (234, 231, 223) berukuran 200x200 dengan blok teks gelap di tengah
    const bg = sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 234, g: 231, b: 223, alpha: 1 },
      },
    });
    const darkTextBlock = await sharp({
      create: {
        width: 80,
        height: 30,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const posterBuffer = await bg
      .composite([{ input: darkTextBlock, left: 60, top: 80 }])
      .png()
      .toBuffer();

    const result = await PosterInpainter.inpaintPoster({
      inputBuffer: posterBuffer,
      naturalW: 200,
      naturalH: 200,
      componentBounds: [{ id: 't1', x: 60, y: 80, w: 80, h: 30, cardBg: '#FFFFFF' }],
    });

    const centerPixel = await sharp(result.outputBuffer)
      .extract({ left: 95, top: 90, width: 10, height: 10 })
      .raw()
      .toBuffer();

    // Harus menyatu dengan kertas krem (234, 231, 223), bukan putih (255, 255, 255)
    expect(centerPixel[0]).toBe(234);
    expect(centerPixel[1]).toBe(231);
    expect(centerPixel[2]).toBe(223);
  });

  it('PosterColorHarmonizer.cropOrnamentWithAlpha mengekstrak cipratan cat biru sebagai PNG transparan', async () => {
    const bg = sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 234, g: 231, b: 223, alpha: 1 },
      },
    });
    const blueSplash = await sharp({
      create: {
        width: 40,
        height: 40,
        channels: 4,
        background: { r: 29, g: 78, b: 216, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const posterBuffer = await bg
      .composite([{ input: blueSplash, left: 30, top: 30 }])
      .png()
      .toBuffer();

    const ornamentPng = await PosterColorHarmonizer.cropOrnamentWithAlpha(posterBuffer, {
      x: 10,
      y: 10,
      w: 80,
      h: 80,
      refWidth: 100,
      refHeight: 100,
    });

    expect(ornamentPng).not.toBeNull();
    const { data, info } = await sharp(ornamentPng!)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sudut kiri atas (area kertas) harus transparan (alpha === 0)
    expect(data[3]).toBe(0);
    // Tengah (area cat biru) harus solid (alpha === 255)
    const centerIdx = (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 4;
    expect(data[centerIdx + 3]).toBe(255);
  });

  it('PosterColorHarmonizer.harmonizeManifest membuang frame palsu yang warnanya sama dengan kertas', async () => {
    const creamPaper = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 234, g: 231, b: 223, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const manifest: PosterLayerManifest = {
      version: 1,
      width: 200,
      height: 200,
      layers: [
        {
          kind: 'frame',
          id: 'fake_header_box',
          role: 'header-card',
          x: 20,
          y: 20,
          w: 160,
          h: 60,
          fill: '#FFFFFF',
          radius: 4,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: null,
        },
        {
          kind: 'text',
          id: 't1',
          role: 'headline',
          text: 'JUDUL',
          x: 30,
          y: 30,
          w: 140,
          h: 30,
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          color: '#0F172A',
          textAlign: 'left',
          lineHeightPx: 28,
          letterSpacingPx: 0,
          box: null,
        },
      ],
    };

    const harmonized = await PosterColorHarmonizer.harmonizeManifest(manifest, creamPaper);
    expect(harmonized.layers.some((l) => l.kind === 'frame')).toBe(false);
    expect(harmonized.layers.some((l) => l.kind === 'text')).toBe(true);
  });
});
