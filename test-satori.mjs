import { CreativePosterCompositor } from './packages/storage/dist/index.mjs';
import fs from 'node:fs/promises';

async function test() {
  const bg = await fs.readFile('./uploads/poster_kelangkaan_air_bersih.png');
  let subject;
  try {
    subject = await fs.readFile('./apps/web-dashboard/public/images/avatar-dewan-cutout.webp');
  } catch (e) {
    console.log('No avatar cutout found');
  }

  const result = await CreativePosterCompositor.composePoster({
    backgroundBuffer: bg,
    subjectPhotoBuffer: subject,
    headline: 'DARURAT AIR BERSIH',
    memberName: 'DR. H. BUDI PRASETYO, M.SI.',
    memberTitle: 'KOMISI V DPR RI // JAWA BARAT I',
    archetype: 'STREET_JOURNALISM',
    compositionMode: 'FIGURE_CENTERPIECE',
    primaryAccentColor: '#9E0B0F',
    synthesizedCopy: {
      mainBannerTitle: 'KRISIS AIR BERSIH',
      mainBannerSubheader: 'PENGEMBANGAN KEBIJAKAN PUBLIK • INFRASTRUKTUR DASAR',
      mainBannerDefinitionBody: 'SECARA SUBSTANTIF, PENANGANAN ISU KRISIS AIR BERSIH MEMBUTUHKAN KOLABORASI TERPADU ANTARA PEMERINTAH DAERAH, KEMENTERIAN PUPR, DAN PENGAWASAN PARLEMEN GUNA MEMPERCEPAT PIPANISASI SPAM REGIONAL.',
      blocks: {
        left_positive: {
          header: 'DAMPAK KRISIS',
          body: 'SUMUR WARGA MENGERING DI 14 KECAMATAN MEMAKSA RATUSAN KELUARGA MEMBELI AIR TANGKI SWASTA DENGAN HARGA TINGGI DAN KUALITAS MERAGUKAN.'
        },
        left_negative_box: {
          header: 'MANFAAT SPAM',
          body: 'JARINGAN PERPIPAAN AIR MINUM MENGHEMAT PENGELUARAN WARGA HINGGA 60% SERTA MENJAMIN STANDAR BAKU MUTU KESEHATAN KELUARGA.'
        },
        center_giant_title: {
          header: 'SOLUSI NYATA',
          body: 'DORONGAN ANGGARAN DAK FISIK AIR MINUM DITINGKATKAN 25% UNTUK REHABILITASI JARINGAN TRANSMISI DAN RESERVOIR DISTRIBUSI.'
        },
        right_cause: {
          header: 'AKSI PARLEMEN',
          body: 'KOMISI V MENGINSTALASI 12 TITIK SUMUR BOR DALAM DAN MENGAWAL TUNTASNYA PROYEK BENDUNGAN MULTIGUNA DI WILAYAH HULU.'
        }
      },
      mappedVisualCutouts: {}
    },
    outputFormat: 'png'
  });

  await fs.writeFile('./uploads/poster_satori_editorial_test.png', result.buffer);
  await fs.writeFile('/mnt/c/Users/PC/.gemini/antigravity-ide/brain/20183ae9-093f-4958-af8d-9d39f692ed3c/poster_satori_editorial_test.png', result.buffer);
  console.log('SUCCESS: Rendered', result.width, 'x', result.height, 'size:', result.sizeBytes);
}

test().catch(console.error);
