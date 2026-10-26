import { CreativePosterCompositor } from './packages/storage/dist/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const ALL_ARCHETYPES = [
  'POP_OUT_HERO',
  'STREET_JOURNALISM',
  'STATEMENT_PROFILE',
  'RETRO_CAMPAIGN',
  'TORN_PAPER_NEWS',
  'RETRO_SPLIT_MITIGATION',
  'MODULAR_GRID_CARDS',
  'CONSTRUCTIVIST_BAUHAUS',
  'THRESHOLD_RISOGRAPH',
  'SWISS_DUOTONE_EDITORIAL',
  'ISOMETRIC_CREATIVE_COLLAGE',
  'STORYBOOK_ILLUSTRATED',
  'TYPOGRAPHIC_MASK',
  'KINETIC_MOTION',
  'EXECUTIVE_SEMINAR',
  'TORN_VISION',
  'GALLERY_EXHIBITION',
  'POP_MAGAZINE_COLLAGE',
  'POLAROID_ADVENTURE',
  'VINTAGE_PERSONA_GAZETTE',
  'BROADSHEET_NEWSPAPER',
  'TECHNICAL_GRID_CALLOUT',
];

async function testAllArchetypes() {
  const bg = await fs.readFile('./uploads/fire_disaster_raw_ai.png');
  await fs.mkdir('./uploads/test_renders', { recursive: true });

  console.log(`Starting local render test for all ${ALL_ARCHETYPES.length} archetypes (100% offline, 0 AI tokens)...`);

  for (const archetype of ALL_ARCHETYPES) {
    try {
      const result = await CreativePosterCompositor.composePoster({
        backgroundBuffer: bg,
        headline: `UJI RENDERING ${archetype}`,
        quote: 'Kebijakan publik yang berkeadilan harus dirasakan langsung oleh seluruh lapisan masyarakat dari desa hingga kota.',
        memberName: 'DR. H. BUDI PRASETYO, M.SI.',
        memberTitle: 'ANGGOTA KOMISI V DPR RI // JAWA BARAT I',
        archetype,
        compositionMode: 'PUBLIC_ADVOCACY',
        primaryAccentColor: '#EA580C',
        secondaryAccentColor: '#3B82F6',
        editionTag: 'POLARIS // TEST RESES 2026',
        synthesizedCopy: {
          mainBannerTitle: archetype.replace(/_/g, ' '),
          mainBannerSubheader: 'POKOK PIKIRAN & REFORMASI KEBIJAKAN PARLEMEN',
          mainBannerDefinitionBody: 'Kebijakan publik yang berkeadilan harus dirasakan langsung oleh seluruh lapisan masyarakat dari desa hingga kota.',
          blocks: {
            point_1: { header: '01. REFORMASI NYATA', body: 'Menata ulang tata kelola anggaran agar tepat sasaran dan transparan.' },
            point_2: { header: '02. ADVOKASI WARGA', body: 'Menampung dan memperjuangkan aspirasi konstituen tanpa kompromi.' },
            col_1: { header: '01 / TRANSPARANSI', body: 'Keterbukaan alur data dan keputusan kebijakan yang dapat diakses publik.' },
            col_2: { header: '02 / AKUNTABILITAS', body: 'Tanggung jawab penuh atas setiap regulasi yang disahkan di parlemen.' },
            card_1: { header: 'RUANG KREATIF', body: 'Akses permodalan dan ruang inkubasi bagi talenta lokal.' },
            card_2: { header: 'KEBIJAKAN DIGITAL', body: 'Perlindungan hak cipta dan kepastian hukum ekosistem digital.' },
            exhibit_1: { header: 'DOKUMEN 01: ASPIRASI', body: 'Menyusuri wilayah konstituen untuk mencatat langsung keluhan riil.' },
            exhibit_2: { header: 'DOKUMEN 02: SOLUSI', body: 'Pengawalan alokasi anggaran hingga pembangunan selesai diresmikan.' },
          },
          mappedVisualCutouts: {},
        },
        outputFormat: 'png',
      });

      const outPath = `./uploads/test_renders/${archetype.toLowerCase()}.png`;
      await fs.writeFile(outPath, result.buffer);
      console.log(`✓ [SUCCESS] ${archetype}: ${result.width}x${result.height} (${Math.round(result.sizeBytes / 1024)} KB) -> ${outPath}`);
    } catch (err) {
      console.error(`✗ [FAILED] ${archetype}:`, err);
    }
  }

  console.log(`\nCompleted local render test for all ${ALL_ARCHETYPES.length} archetypes.`);
}

testAllArchetypes().catch(console.error);
