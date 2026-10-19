import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { CreativePosterCompositor } from '../src/creative-poster-compositor.js';

describe('CreativePosterCompositor', () => {
  it('harus merakit 3 layer poster dengan Sharp dan menghasilkan WebP 1080x1350', async () => {
    // 1. Buat dummy background AI buffer 1000x1000
    const dummyBackground = await sharp({
      create: {
        width: 1000,
        height: 1000,
        channels: 3,
        background: { r: 30, g: 41, b: 59 },
      },
    })
      .jpeg()
      .toBuffer();

    // 2. Buat dummy cutout foto dewan transparan 400x500
    const dummySubjectCutout = await sharp({
      create: {
        width: 400,
        height: 500,
        channels: 4,
        background: { r: 234, g: 88, b: 12, alpha: 0.9 },
      },
    })
      .png()
      .toBuffer();

    // 3. Eksekusi komposisi untuk arketipe STREET_JOURNALISM
    const resultStreet = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      subjectPhotoBuffer: dummySubjectCutout,
      headline: 'HARGA PUPUK MENCEKIK PETANI DAERAH',
      quote: 'Pemerintah harus menjamin ketersediaan pasokan pupuk subsidi di tingkat pengecer.',
      memberName: 'H. AHMAD FAUZI, S.T.',
      memberTitle: 'Anggota Komisi IV DPR RI // Fraksi Golkar',
      archetype: 'STREET_JOURNALISM',
      primaryAccentColor: '#DC2626',
      canvasWidth: 1080,
      canvasHeight: 1350,
      outputFormat: 'webp',
    });

    expect(resultStreet.mimeType).toBe('image/webp');
    expect(resultStreet.width).toBe(1080);
    expect(resultStreet.height).toBe(1350);
    expect(resultStreet.sizeBytes).toBeGreaterThan(1000);

    // 4. Eksekusi komposisi untuk arketipe POP_OUT_HERO
    const resultHero = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      subjectPhotoBuffer: dummySubjectCutout,
      headline: 'THE REFORM',
      quote: 'Membangun ekosistem ekonomi digital yang adil bagi generasi muda.',
      memberName: 'H. AHMAD FAUZI, S.T.',
      memberTitle: 'Anggota Komisi IV DPR RI',
      archetype: 'POP_OUT_HERO',
      primaryAccentColor: '#EA580C',
      outputFormat: 'png',
    });

    expect(resultHero.mimeType).toBe('image/png');
    expect(resultHero.width).toBe(1080);
    expect(resultHero.height).toBe(1350);
    expect(resultHero.sizeBytes).toBeGreaterThan(1000);
  });

  it('harus merakit layout TORN_PAPER_NEWS (Techno Veritas / Malam Jago Merah) lengkap dengan torn paper mask dan stat circles', async () => {
    const dummyBackground = await sharp({
      create: { width: 1080, height: 1650, channels: 3, background: { r: 15, g: 23, b: 42 } },
    }).png().toBuffer();

    const result = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      headline: 'MALAM JAGO MERAH',
      memberName: 'POLARIS VERITAS',
      memberTitle: 'EDISI ADVOKASI BENCANA',
      archetype: 'TORN_PAPER_NEWS',
      primaryAccentColor: '#DC2626',
      canvasWidth: 1080,
      canvasHeight: 1650,
      outputFormat: 'png',
      synthesizedCopy: {
        mainBannerTitle: 'MALAM JAGO MERAH',
        mainBannerSubheader: 'Kebakaran Landa Pemukiman Padat; Ribuan Jiwa Mengungsi',
        mainBannerDefinitionBody: 'Kobaran api melahap ratusan rumah pada malam hari.',
        blocks: {
          left_positive: {
            header: 'BPBD Dirikan Posko Terpadu',
            body: 'Petugas gabungan dan relawan mendirikan posko pengungsian 24 jam.',
          },
          right_cause: {
            header: 'Evaluasi Instalasi Hidran',
            body: 'Kaji ulang ketersediaan air pemadam di area padat penduduk.',
          },
        },
        mappedVisualCutouts: {},
        statCircles: [
          { topLabel: 'Setidaknya', value: '120+', description: 'rumah terbakar.' },
          { topLabel: 'Armada Siaga', value: '28', description: 'unit damkar dikerahkan.' },
          { topLabel: 'Lebih dari', value: '1.450', description: 'jiwa mengungsi.' },
        ],
      },
    });

    expect(result.mimeType).toBe('image/png');
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1650);
    expect(result.sizeBytes).toBeGreaterThan(10000);
  });

  it('harus merakit layout RETRO_SPLIT_MITIGATION (Earthquake Retro) dengan split dua kolom', async () => {
    const dummyBackground = await sharp({
      create: { width: 1080, height: 1350, channels: 3, background: { r: 245, g: 239, b: 235 } },
    }).png().toBuffer();

    const result = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      headline: 'GET TO KNOW EARTHQUAKE',
      memberName: 'TIM MITIGASI BENCANA',
      memberTitle: 'PANDUAN KESELAMATAN WARGA',
      archetype: 'RETRO_SPLIT_MITIGATION',
      primaryAccentColor: '#0D9488',
      canvasWidth: 1080,
      canvasHeight: 1350,
      outputFormat: 'webp',
      synthesizedCopy: {
        mainBannerTitle: 'GET TO KNOW EARTHQUAKE',
        mainBannerSubheader: 'PANDUAN KESELAMATAN & MITIGASI BENCANA GEMPA',
        mainBannerDefinitionBody: 'Kesiapsiagaan menghadapi potensi bencana alam.',
        blocks: {},
        mappedVisualCutouts: {},
        numberedItems: [
          { number: '01', title: 'Perlindungan Diri', summary: 'Cari tempat kokoh dan jauhi kaca.' },
          { number: '02', title: 'Putus Aliran Listrik', summary: 'Segera matikan meteran listrik.' },
          { number: '03', title: 'Jalur Evakuasi', summary: 'Gunakan tangga darurat bukan lift.' },
          { number: '04', title: 'Titik Kumpul', summary: 'Menuju ruang terbuka dan koordinasi RT/RW.' },
        ],
      },
    });

    expect(result.mimeType).toBe('image/webp');
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1350);
  });

  it('harus merakit layout MODULAR_GRID_CARDS (5 Modern Cards) dengan aksen blok nomor', async () => {
    const dummyBackground = await sharp({
      create: { width: 1080, height: 1350, channels: 3, background: { r: 255, g: 255, b: 255 } },
    }).png().toBuffer();

    const result = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      headline: '5 POKOK REKOMENDASI KEBIJAKAN',
      memberName: 'H. AHMAD FAUZI, S.T.',
      memberTitle: 'Anggota Komisi IV DPR RI',
      archetype: 'MODULAR_GRID_CARDS',
      primaryAccentColor: '#DC2626',
      canvasWidth: 1080,
      canvasHeight: 1350,
      outputFormat: 'webp',
    });

    expect(result.mimeType).toBe('image/webp');
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1350);
  });

  it('harus merakit layout VINTAGE_PERSONA_GAZETTE (The S News) broadsheet klasik', async () => {
    const dummyBackground = await sharp({
      create: { width: 1080, height: 1350, channels: 3, background: { r: 244, g: 240, b: 232 } },
    }).png().toBuffer();

    const result = await CreativePosterCompositor.composePoster({
      backgroundBuffer: dummyBackground,
      headline: 'THE S NEWS',
      quote: 'Komitmen pengabdian tanpa henti untuk kemaslahatan masyarakat.',
      memberName: 'TRẦN MINH HIỂN',
      memberTitle: 'TOKOH INSPIRATIF ADVOKASI',
      archetype: 'VINTAGE_PERSONA_GAZETTE',
      primaryAccentColor: '#1E3A8A',
      canvasWidth: 1080,
      canvasHeight: 1350,
      outputFormat: 'webp',
    });

    expect(result.mimeType).toBe('image/webp');
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1350);
  });
});
