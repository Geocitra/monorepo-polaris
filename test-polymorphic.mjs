import { CreativePosterCompositor } from './packages/storage/dist/index.mjs';
import fs from 'node:fs/promises';

async function testPolymorphic() {
  const bg = await fs.readFile('./uploads/poster_kelangkaan_air_bersih.png');
  let subject;
  try {
    subject = await fs.readFile('./apps/web-dashboard/public/images/avatar-dewan-cutout.webp');
  } catch (e) {
    console.log('No avatar cutout found');
  }

  // Test POP_OUT_HERO / STATEMENT_PROFILE
  const resultProfile = await CreativePosterCompositor.composePoster({
    backgroundBuffer: bg,
    subjectPhotoBuffer: subject,
    headline: 'KEADILAN AKSES AIR BERSIH',
    quote: 'Setiap warga negara memiliki hak konstitusional yang sama atas air minum layak dan sanitasi yang sehat tanpa diskriminasi wilayah.',
    memberName: 'DR. H. BUDI PRASETYO, M.SI.',
    memberTitle: 'ANGGOTA KOMISI V DPR RI // JAWA BARAT I',
    archetype: 'STATEMENT_PROFILE',
    compositionMode: 'FIGURE_CENTERPIECE',
    primaryAccentColor: '#2563EB',
    editionTag: 'POLARIS STATEMENT // RESES 2026',
    synthesizedCopy: {
      mainBannerTitle: 'KEADILAN AIR BERSIH',
      mainBannerSubheader: 'POKOK PIKIRAN FRAKSI & KEBIJAKAN PARLEMEN',
      mainBannerDefinitionBody: 'Setiap warga negara memiliki hak konstitusional yang sama atas air minum layak dan sanitasi yang sehat tanpa diskriminasi wilayah.',
      blocks: {},
      mappedVisualCutouts: {}
    },
    outputFormat: 'png'
  });

  await fs.writeFile('./uploads/poster_statement_profile_test.png', resultProfile.buffer);
  await fs.writeFile('/mnt/c/Users/PC/.gemini/antigravity-ide/brain/20183ae9-093f-4958-af8d-9d39f692ed3c/poster_statement_profile_test.png', resultProfile.buffer);
  console.log('SUCCESS: Rendered Statement Profile', resultProfile.width, 'x', resultProfile.height, 'size:', resultProfile.sizeBytes);
}

testPolymorphic().catch(console.error);
