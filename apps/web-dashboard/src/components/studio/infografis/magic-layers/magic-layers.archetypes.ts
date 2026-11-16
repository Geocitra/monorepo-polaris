import { FabricImage, Shadow } from 'fabric';
import type { ComponentSliceDef, PosterArchetype } from './magic-layers.types';
import { resolveSafeImageUrl } from './magic-layers.canvas-utils';

/**
 * Deteksi tata letak poster secara cerdas berdasarkan archetype backend atau analisis judul/naskah.
 */
export function detectPosterLayout(
  archetype?: string,
  title?: string,
  subtitle?: string
): PosterArchetype {
  if (archetype) {
    if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') return 'INFOGRAPHIC_ADVOCACY_PILLARS';
    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') return 'INFOGRAPHIC_NARRATIVE_WAVE';
    if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') return 'INFOGRAPHIC_CHRONICLE_GRID';
    if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') return 'INFOGRAPHIC_RADIAL_CLOCK';
    if (archetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  const text = `${title || ''} ${subtitle || ''}`.toLowerCase();

  // 1. Poster 5 Pilar Advokasi (Kemiskinan Kota Bandung, Bantuan, APBD, dsb.)
  if (
    text.includes('kemiskinan') ||
    text.includes('5 pilar') ||
    text.includes('pilar aksi') ||
    text.includes('advocacy') ||
    text.includes('apbd') ||
    text.includes('bantuan langsung') ||
    text.includes('indikator')
  ) {
    return 'INFOGRAPHIC_ADVOCACY_PILLARS';
  }

  // 2. Poster Kronik & Rekam Jejak (Biografi Soedirman, Tokoh, Grid Arsip)
  if (
    text.includes('soedirman') ||
    text.includes('sudirman') ||
    text.includes('biografi') ||
    text.includes('guru teladan') ||
    text.includes('purbalingga') ||
    text.includes('kronik') ||
    text.includes('rekam jejak')
  ) {
    return 'INFOGRAPHIC_CHRONICLE_GRID';
  }

  // 3. Poster Jam Melingkar & Tonggak Sejarah (Radial Clock)
  if (
    text.includes('tonggak') ||
    text.includes('radial') ||
    text.includes('jam saku') ||
    text.includes('milestone')
  ) {
    return 'INFOGRAPHIC_RADIAL_CLOCK';
  }

  // 4. Poster Gelombang Naratif 4 Dimensi (Pelatihan Balai Kerja, Pengangguran, dsb.)
  if (
    text.includes('pengangguran') ||
    text.includes('pelatihan') ||
    text.includes('dimensi') ||
    text.includes('balai latihan') ||
    text.includes('gelombang') ||
    text.includes('s-curve')
  ) {
    return 'INFOGRAPHIC_NARRATIVE_WAVE';
  }

  // 5. Garis Waktu Visioner
  if (
    text.includes('visioner') ||
    text.includes('garis waktu') ||
    text.includes('timeline')
  ) {
    return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  return 'GENERIC_INFOGRAPHIC';
}

export function getArchetypeComponentDefs(
  archetype: PosterArchetype,
  naturalW: number,
  naturalH: number,
  title?: string,
  subtitle?: string,
  author?: string
): ComponentSliceDef[] {
  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    const headlineText = (title || 'KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA').toUpperCase();
    const deckText = subtitle || 'Infografik Publik: KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA';
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      // 1. Top Bar Tag Header
      {
        id: `slice_toptag_${Date.now()}`,
        name: 'Top Tag: POLARIS // DAPIL JABAR',
        text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
        x: 0.045,
        y: 0.016,
        w: 0.910,
        h: 0.026,
        textColor: '#64748B',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: 'transparent',
      },
      // 2. Masthead Header Card (Kicker + Judul + Narasi Ringkas)
      {
        id: `slice_masthead_${Date.now()}`,
        name: 'Judul Utama: Kemiskinan Kota Bandung',
        text: `DATA KEMISKINAN DI JABAR // ANALISIS STRATEGIS\n${headlineText}\n${deckText}`,
        x: 0.045,
        y: 0.046,
        w: 0.910,
        h: 0.125,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      // 3. 4 Kotak Metrik KPI Kemiskinan
      {
        id: `slice_stat_0_${Date.now()}`,
        name: 'Metrik 01: 9,3%',
        text: '9,3%\nPERSENTASE PENDUDUK MISKIN',
        x: 0.045,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_1_${Date.now()}`,
        name: 'Metrik 02: RP 1 TRILIUN',
        text: 'RP 1 TRILIUN\nTOTAL ANGGARAN PENGENTASAN',
        x: 0.275,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_2_${Date.now()}`,
        name: 'Metrik 03: 15 KELURAHAN',
        text: '15 KELURAHAN\nKONSENTRASI WILAYAH TERBANYAK',
        x: 0.505,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_3_${Date.now()}`,
        name: 'Metrik 04: 50%',
        text: '50%\nTARGET PENGURANGAN KEMISKINAN',
        x: 0.735,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      // 4. Banner Section Tag
      {
        id: `slice_section_tag_${Date.now()}`,
        name: 'Banner: PILAR AKSI & ADVOKASI',
        text: 'PILAR AKSI & ADVOKASI BERKELANJUTAN',
        x: 0.045,
        y: 0.450,
        w: 0.315,
        h: 0.026,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#DC2626',
      },
      // 5. 5 Kartu Pilar Aksi Utuh (Tinggi ~500px: badge ◈ 01..05 + judul + isi + tag ✦ INDIKATOR)
      {
        id: `slice_pillar_0_${Date.now()}`,
        name: 'Pilar 01: 3 KEBIJAKAN STRATEGIS',
        text: '◈ 01\n3 KEBIJAKAN STRATEGIS\n\nPemerintah Kota Bandung meluncurkan 3 kebijakan strategis untuk mengurangi kemiskinan; pendidikan, kesehatan dan pemberdayaan ekonomi dengan alokasi Rp 500 miliar.\n\n✦ INDIKATOR 01',
        x: 0.045,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_1_${Date.now()}`,
        name: 'Pilar 02: 5.000 KELUARGA BANTUAN',
        text: '◈ 02\n5.000 KELUARGA BANTUAN\n\nSebanyak 5.000 keluarga miskin menerima bantuan langsung tunai sebesar Rp 1 juta per tahun untuk meningkatkan daya beli dan akses terhadap kebutuhan dasar.\n\n✦ INDIKATOR 02',
        x: 0.2285,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_2_${Date.now()}`,
        name: 'Pilar 03: TARGET PENDIDIKAN 2024',
        text: '◈ 03\nTARGET PENDIDIKAN 2024\n\nMeningkatkan anggaran pendidikan hingga 20% dari APBD untuk memastikan anak-anak usia sekolah mendapatkan akses pendidikan yang layak.\n\n✦ INDIKATOR 03',
        x: 0.412,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_3_${Date.now()}`,
        name: 'Pilar 04: PROGRAM KEWIRAUSAHAAN',
        text: '◈ 04\nPROGRAM KEWIRAUSAHAAN\n\nMeluncurkan program pelatihan wirausaha dengan target 2.000 UMKM baru yang didukung dengan pelatihan dan akses modal.\n\n✦ INDIKATOR 04',
        x: 0.5955,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_4_${Date.now()}`,
        name: 'Pilar 05: AUDIT KEBIJAKAN TAHUNAN',
        text: '◈ 05\nAUDIT KEBIJAKAN TAHUNAN\n\nMelakukan audit tahunan terhadap semua program pengentasan kemiskinan guna memastikan transparansi dan akuntabilitas penggunaan anggaran.\n\n✦ INDIKATOR 05',
        x: 0.779,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      // 6. Closing Takeaway Banner
      {
        id: `slice_closing_${Date.now()}`,
        name: 'Sintesis Penutup Kebijakan',
        text: 'Transparansi dan kolaborasi antara pemerintah dan masyarakat kunci dalam mengatasi kemiskinan di Kota Bandung.',
        x: 0.045,
        y: 0.865,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 7. Footer Bar
      {
        id: `slice_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.045,
        y: 0.915,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    return [
      // 1. Masthead Kiri Oranye
      {
        id: `slice_soedirman_masthead_${Date.now()}`,
        name: 'Banner Masthead Tokoh',
        text: 'SOEDIRMAN\n\nSANG GURU TELADAN YANG MENJADI JENDERAL BESAR BANGSA INDONESIA',
        x: 0.045,
        y: 0.035,
        w: 0.315,
        h: 0.450,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.024),
        cardBg: '#EA580C',
      },
      // 2. Biodata Bawah Kiri
      {
        id: `slice_soedirman_bio_${Date.now()}`,
        name: 'Biodata Raden Soedirman',
        text: 'Raden Soedirman\nLahir 24 Januari 1916 di Purbalingga.',
        x: 0.045,
        y: 0.590,
        w: 0.315,
        h: 0.360,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 3. 6 Kartu Rekam Jejak Kolom Kanan
      {
        id: `slice_chronicle_0_${Date.now()}`,
        name: 'Rekam Jejak 01: RIWAYAT PENDIDIKAN',
        text: 'RIWAYAT PENDIDIKAN\n\nRiwayat pendidikan yang tidak berjalan dengan lancar karena kendala ekonomi.',
        x: 0.380,
        y: 0.035,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_1_${Date.now()}`,
        name: 'Rekam Jejak 02: GURU TELADAN (1936)',
        text: 'GURU TELADAN (1936)\n\nMenjadi seorang guru di H.I.S Muhammadiyah Cilacap pada tahun 1936.',
        x: 0.380,
        y: 0.185,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_2_${Date.now()}`,
        name: 'Rekam Jejak 03: MILITER PETA',
        text: 'MILITER PETA\n\nMasuk ke militer di PETA dan membuktikan kepemimpinan hingga menjadi seorang Jenderal Besar.',
        x: 0.380,
        y: 0.335,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_3_${Date.now()}`,
        name: 'Rekam Jejak 04: PERANG GERILYA',
        text: 'PERANG GERILYA\n\nMenjadi pemimpin perang Gerilya yang tangguh dalam mempertahankan kemerdekaan Indonesia.',
        x: 0.380,
        y: 0.485,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_4_${Date.now()}`,
        name: 'Rekam Jejak 05: DITENGAH SAKIT',
        text: 'DITENGAH SAKIT\n\nDidiagnosa menderita tuberkulosis namun tetap memimpin pasukan dengan ditandu masuk keluar hutan.',
        x: 0.380,
        y: 0.645,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_5_${Date.now()}`,
        name: 'Rekam Jejak 06: AKHIR HAYAT',
        text: 'AKHIR HAYAT\n\nWafat setelah Belanda resmi mengakui kedaulatan penuh Republik Indonesia.',
        x: 0.380,
        y: 0.805,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    const titleText = (title || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      // 1. Header Card
      {
        id: `slice_radial_header_${Date.now()}`,
        name: 'Judul Utama (Masthead)',
        text: `DATA PELATIHAN KERJA // ANALISIS KEBIJAKAN\n${titleText}`,
        x: 0.045,
        y: 0.045,
        w: 0.910,
        h: 0.125,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      // 2. 3 KPIs di Atas Sayap Kanan
      {
        id: `slice_radial_stat_0_${Date.now()}`,
        name: 'Metrik 10%',
        text: '10%\nPENURUNAN PENGANGGURAN',
        x: 0.470,
        y: 0.180,
        w: 0.155,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_radial_stat_1_${Date.now()}`,
        name: 'Metrik Rp 200 Miliar',
        text: 'RP 200 MILIAR\nTOTAL ANGGARAN',
        x: 0.635,
        y: 0.180,
        w: 0.165,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_radial_stat_2_${Date.now()}`,
        name: 'Metrik 8 Kota',
        text: '8 KOTA\nKONSENTRASI DI JABAR',
        x: 0.810,
        y: 0.180,
        w: 0.145,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      // 3. 5 Tonggak Sayap Kanan
      {
        id: `slice_milestone_0_${Date.now()}`,
        name: 'Tonggak 01: 15.000 PESERTA',
        text: 'TONGGAK 01: 15.000 PESERTA PELATIHAN\n\nBalai Latihan Kerja telah melatih 15.000 peserta dengan kurikulum industri.',
        x: 0.470,
        y: 0.265,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_1_${Date.now()}`,
        name: 'Tonggak 02: RP 200 MILIAR',
        text: 'TONGGAK 02: RP 200 MILIAR DIANGGARKAN\n\nPemerintah Provinsi mengalokasikan anggaran untuk peningkatan fasilitas BLK.',
        x: 0.470,
        y: 0.390,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_2_${Date.now()}`,
        name: 'Tonggak 03: 8 KOTA PRIORITAS',
        text: 'TONGGAK 03: 8 KOTA PRIORITAS\n\nPelatihan diprioritaskan di daerah dengan tingkat pengangguran terbuka tinggi.',
        x: 0.470,
        y: 0.515,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_3_${Date.now()}`,
        name: 'Tonggak 04: 95% PENYERAPAN',
        text: 'TONGGAK 04: 95% PENYERAPAN TENAGA KERJA\n\nLulusan bersertifikasi berhasil diserap langsung ke sektor industri terkemuka.',
        x: 0.470,
        y: 0.640,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_4_${Date.now()}`,
        name: 'Tonggak 05: KERJA SAMA INDUSTRI',
        text: 'TONGGAK 05: PROGRAM KERJA SAMA INDUSTRI\n\nMembangun kemitraan dengan 50 perusahaan manufaktur dan digital terkemuka.',
        x: 0.470,
        y: 0.765,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 4. Sintesis Kebijakan
      {
        id: `slice_radial_synth_${Date.now()}`,
        name: 'Sintesis Kebijakan',
        text: 'SINTESIS KEBIJAKAN\nPenting untuk terus mengevaluasi efektivitas program guna memastikan akuntabilitas anggaran.',
        x: 0.470,
        y: 0.890,
        w: 0.485,
        h: 0.045,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      // 5. Footer
      {
        id: `slice_radial_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.045,
        y: 0.945,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') {
    const headlineText = (title || 'KEMISKINAN DI KOTA BANDUNG MENURUN').toUpperCase();
    const deckText = subtitle || 'Peta jalan dan target strategis pengentasan kemiskinan daerah.';
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      {
        id: `slice_vtl_toptag_${Date.now()}`,
        name: 'Top Tag: POLARIS // DAPIL JABAR',
        text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
        x: 0.050,
        y: 0.019,
        w: 0.900,
        h: 0.024,
        textColor: '#64748B',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_masthead_${Date.now()}`,
        name: 'Judul Utama (Visionary Header)',
        text: `TELAAH KEBIJAKAN & TARGET STRATEGIS\n${headlineText}\n${deckText}`,
        x: 0.050,
        y: 0.056,
        w: 0.900,
        h: 0.110,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_stat_0_${Date.now()}`,
        name: 'Metrik 01: 5,2%',
        text: '5,2%\nPENURUNAN KEMISKINAN',
        x: 0.050,
        y: 0.171,
        w: 0.216,
        h: 0.056,
        textColor: '#991B1B',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.016),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_stat_1_${Date.now()}`,
        name: 'Metrik 02: RP 500 MILIAR',
        text: 'RP 500 MILIAR\nANGGARAN PENANGANAN KEMISKINAN',
        x: 0.278,
        y: 0.171,
        w: 0.216,
        h: 0.056,
        textColor: '#991B1B',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.016),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_stat_2_${Date.now()}`,
        name: 'Metrik 03: 3 KECAMATAN',
        text: '3 KECAMATAN\nPRIORITAS INTERVENSI',
        x: 0.506,
        y: 0.171,
        w: 0.216,
        h: 0.056,
        textColor: '#991B1B',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.016),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_stat_3_${Date.now()}`,
        name: 'Metrik 04: 95%',
        text: '95%\nTARGET PEMBERDAYAAN',
        x: 0.734,
        y: 0.171,
        w: 0.216,
        h: 0.056,
        textColor: '#991B1B',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.016),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_banner_${Date.now()}`,
        name: 'Banner: PETA JALAN TARGET',
        text: 'PETA JALAN TARGET & REALISASI CAPAIAN',
        x: 0.050,
        y: 0.463,
        w: 0.340,
        h: 0.024,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#991B1B',
      },
      {
        id: `slice_vtl_step_0_${Date.now()}`,
        name: 'Fase 01: 5,2% PENURUNAN ANGKA KEMISKINAN',
        text: 'FASE 01\n5,2% PENURUNAN ANGKA KEMISKINAN\n\nAngka kemiskinan di Kota Bandung turun dari 9,5% menjadi 7,8% dalam dua tahun terakhir, menunjukkan efektivitas program sosial yang diimplementasikan.\n\n✦ TAHAP 01',
        x: 0.050,
        y: 0.492,
        w: 0.220,
        h: 0.370,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_step_1_${Date.now()}`,
        name: 'Fase 02: RP 500 MILIAR UNTUK PROGRAM SOSIAL',
        text: 'FASE 02\nRP 500 MILIAR UNTUK PROGRAM SOSIAL\n\nPemerintah Kota Bandung mengalokasikan anggaran sebesar Rp 500 miliar untuk program penanggulangan kemiskinan, termasuk pelatihan keterampilan dan bantuan langsung.\n\n✦ TAHAP 02',
        x: 0.276,
        y: 0.492,
        w: 0.220,
        h: 0.370,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_step_2_${Date.now()}`,
        name: 'Fase 03: 3 KECAMATAN PRIORITAS',
        text: 'FASE 03\n3 KECAMATAN PRIORITAS\n\nTiga kecamatan dengan angka kemiskinan tertinggi, yaitu Kecamatan X, Y dan Z, menjadi fokus utama dalam program intervensi yang lebih intensif.\n\n✦ TAHAP 03',
        x: 0.502,
        y: 0.492,
        w: 0.220,
        h: 0.370,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_step_3_${Date.now()}`,
        name: 'Fase 04: 95% TARGET PEMBERDAYAAN',
        text: 'FASE 04\n95% TARGET PEMBERDAYAAN\n\nProgram pemberdayaan masyarakat menargetkan 95% partisipasi warga dalam pelatihan keterampilan dan akses ke layanan kesehatan.\n\n✦ TAHAP 04',
        x: 0.728,
        y: 0.492,
        w: 0.220,
        h: 0.370,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_closing_${Date.now()}`,
        name: 'Sintesis Penutup',
        text: 'Kolaborasi pemerintah dan warga memastikan target pengentasan kemiskinan tercapai tepat waktu.',
        x: 0.050,
        y: 0.872,
        w: 0.900,
        h: 0.036,
        textColor: '#0F172A',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_vtl_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.050,
        y: 0.922,
        w: 0.900,
        h: 0.038,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
    const headline = (title || 'PENANGANAN KARHUTLA DI KOTA BANDUNG').toUpperCase();
    const deck = subtitle || 'Diperlukan langkah konkret dan transparan untuk mitigasi dan penanggulangan karhutla secara berkelanjutan.';
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      // 1. Top Bar Tag Header
      {
        id: `slice_wave_toptag_${Date.now()}`,
        name: 'Top Tag: POLARIS // DAPIL JABAR',
        text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
        x: 0.050,
        y: 0.019,
        w: 0.900,
        h: 0.024,
        textColor: '#64748B',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 2. Header Masthead
      {
        id: `slice_wave_masthead_${Date.now()}`,
        name: 'Header Utama Karhutla',
        text: `DATA KARHUTLA JABAR // ANALISIS KEBIJAKAN\n${headline}\n${deck}`,
        x: 0.050,
        y: 0.056,
        w: 0.900,
        h: 0.130,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      // 3. 4 KPIs
      {
        id: `slice_wave_kpi_0_${Date.now()}`,
        name: 'Metrik 35%',
        text: '35%\nPENINGKATAN KASUS KARHUTLA',
        x: 0.070,
        y: 0.140,
        w: 0.200,
        h: 0.040,
        textColor: '#D7261E',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_kpi_1_${Date.now()}`,
        name: 'Metrik RP 300 MILIAR',
        text: 'RP 300 MILIAR\nTOTAL ANGGARAN PENANGANAN',
        x: 0.290,
        y: 0.140,
        w: 0.200,
        h: 0.040,
        textColor: '#D7261E',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_kpi_2_${Date.now()}`,
        name: 'Metrik 12 KAWASAN',
        text: '12 KAWASAN\nZONA RAWAN BENCANA',
        x: 0.510,
        y: 0.140,
        w: 0.200,
        h: 0.040,
        textColor: '#D7261E',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_kpi_3_${Date.now()}`,
        name: 'Metrik 80%',
        text: '80%\nTARGET PEMULIHAN LAHAN',
        x: 0.730,
        y: 0.140,
        w: 0.200,
        h: 0.040,
        textColor: '#D7261E',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 4. 4 Staggered Zigzag Cards Along S-Curve
      {
        id: `slice_wave_card_0_${Date.now()}`,
        name: 'Dimensi 01: 5 TAHUN TERAKHIR',
        text: 'DIMENSI 01\n5 TAHUN TERAKHIR\n\nKota Bandung mengalami peningkatan kasus karhutla sebesar 35%, dengan total 150 hektar lahan terbakar yang berdampak pada kualitas udara.',
        x: 0.542,
        y: 0.200,
        w: 0.408,
        h: 0.133,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_card_1_${Date.now()}`,
        name: 'Dimensi 02: ANGGARAN RP 300 MILIAR',
        text: 'DIMENSI 02\nANGGARAN RP 300 MILIAR\n\nPemerintah Kota Bandung mengalokasikan anggaran sebesar RP 300 miliar untuk penanganan karhutla, termasuk sosialisasi dan rehabilitasi lahan.',
        x: 0.050,
        y: 0.363,
        w: 0.408,
        h: 0.133,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_card_2_${Date.now()}`,
        name: 'Dimensi 03: 12 KAWASAN RAWAN',
        text: 'DIMENSI 03\n12 KAWASAN RAWAN\n\nTerdapat 12 kawasan di Kota Bandung yang menjadi zona rawan karhutla, di mana 70% berasal dari aktivitas manusia.',
        x: 0.542,
        y: 0.526,
        w: 0.408,
        h: 0.133,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_wave_card_3_${Date.now()}`,
        name: 'Dimensi 04: 80% TARGET PEMULIHAN',
        text: 'DIMENSI 04\n80% TARGET PEMULIHAN\n\nTarget pemulihan lahan terbakar adalah 80% dalam waktu 3 tahun, dengan melibatkan masyarakat dan organisasi lokal.',
        x: 0.050,
        y: 0.689,
        w: 0.408,
        h: 0.133,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      // 5. Closing Banner
      {
        id: `slice_wave_closing_${Date.now()}`,
        name: 'Sintesis Penutup',
        text: 'Diperlukan transparansi dalam penggunaan anggaran untuk penanganan karhutla demi keberlanjutan lingkungan di Kota Bandung.',
        x: 0.050,
        y: 0.867,
        w: 0.900,
        h: 0.036,
        textColor: '#0F172A',
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      // 6. Footer
      {
        id: `slice_wave_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.050,
        y: 0.919,
        w: 0.900,
        h: 0.038,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  // DEFAULT & NARRATIVE WAVE (Pelatihan Balai Kerja 4 Dimensi Zigzag)
  const titleText = (title || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
  const subtitleText = subtitle || 'Program pelatihan di Balai Latihan Kerja Jawa Barat berhasil menurunkan angka pengangguran terbuka sebesar 12,5% di Kota Bandung. Dengan alokasi anggaran Rp 300 miliar, program ini mendukung 10.000 peserta pelatihan setiap tahun.';
  const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

  return [
    // 1. Top Bar Tag Header
    {
      id: `slice_toptag_${Date.now()}`,
      name: 'Top Tag: POLARIS // DAPIL JABAR',
      text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
      x: 0.082,
      y: 0.018,
      w: 0.836,
      h: 0.024,
      textColor: '#64748B',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: 'transparent',
    },
    // 2. Header Masthead (Title + Subtitle)
    {
      id: `slice_headline_${Date.now()}`,
      name: 'Judul Utama (Headline & Narasi)',
      text: `DATA PELATIHAN KERJA // STRATEGI EKONOMI\n${titleText}\n\n${subtitleText}`,
      x: 0.082,
      y: 0.045,
      w: 0.836,
      h: 0.175,
      textColor: '#0F172A',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.032),
      cardBg: '#FFFFFF',
    },
    // 3. 4 KPIs
    {
      id: `slice_kpi_0_${Date.now()}`,
      name: 'Metrik 12,5%',
      text: '12,5%\nPENURUNAN PENGANGGURAN',
      x: 0.095,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_1_${Date.now()}`,
      name: 'Metrik Rp 300 Miliar',
      text: 'RP 300 MILIAR\nTOTAL ANGGARAN',
      x: 0.300,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_2_${Date.now()}`,
      name: 'Metrik 10.000 Peserta',
      text: '10.000 PESERTA\nKONSENTRASI PELATIHAN',
      x: 0.505,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_3_${Date.now()}`,
      name: 'Metrik 95%',
      text: '95%\nTINGKAT PENYERAPAN',
      x: 0.710,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    // 4. 4 Dimensi Zigzag Cards
    {
      id: `slice_dimensi_0_${Date.now()}`,
      name: 'Kartu Dimensi 01: 5 BLK',
      text: 'DIMENSI 01: 5 BALAI LATIHAN KERJA\n\nTerdapat 5 Balai Latihan Kerja di Kota Bandung yang menyediakan berbagai program pelatihan sesuai kebutuhan industri lokal.',
      x: 0.505,
      y: 0.315,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_1_${Date.now()}`,
      name: 'Kartu Dimensi 02: 60% BERSERTIFIKAT',
      text: 'DIMENSI 02: 60% PESERTA BERSERTIFIKAT\n\nDari total peserta, 60% berhasil mendapatkan sertifikat kompetensi yang diakui industri, meningkatkan daya saing di pasar kerja.',
      x: 0.082,
      y: 0.450,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_2_${Date.now()}`,
      name: 'Kartu Dimensi 03: 3 SEKTOR PRIORITAS',
      text: 'DIMENSI 03: 3 SEKTOR PRIORITAS\n\nPelatihan difokuskan pada 3 sektor prioritas: teknologi informasi, industri kreatif dan manufaktur untuk mendukung pertumbuhan ekonomi.',
      x: 0.505,
      y: 0.585,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_3_${Date.now()}`,
      name: 'Kartu Dimensi 04: 30% PENINGKATAN',
      text: 'DIMENSI 04: 30% PENINGKATAN KETERAMPILAN\n\nPeserta pelatihan menunjukkan peningkatan keterampilan sebesar 30% setelah mengikuti program, berdasarkan evaluasi pasca-pelatihan.',
      x: 0.082,
      y: 0.720,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    // 5. Closing Takeaway Banner
    {
      id: `slice_closing_${Date.now()}`,
      name: 'Sintesis Penutup',
      text: 'Penting untuk terus memantau dan mengevaluasi efektivitas program pelatihan guna memastikan transparansi dan akuntabilitas dalam pengelolaan anggaran.',
      x: 0.082,
      y: 0.855,
      w: 0.836,
      h: 0.045,
      textColor: '#0F172A',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    // 6. Footer
    {
      id: `slice_footer_${Date.now()}`,
      name: 'Identitas Dewan (Footer)',
      text: `${authorText}                      2026`,
      x: 0.082,
      y: 0.910,
      w: 0.836,
      h: 0.045,
      textColor: '#0F172A',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
  ];
}

/**
 * Pemuat HTMLImageElement tangguh yang mengatasi kendala CORS lintas port/origin.
 */
async function loadResilientHTMLImage(url: string): Promise<HTMLImageElement> {
  const safeUrl = resolveSafeImageUrl(url);

  // Strategi 1: Fetch sebagai Blob lokal (100% same-origin)
  try {
    const res = await fetch(safeUrl);
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = blobUrl;
      });
    }
  } catch (err) {
    console.warn('[MagicLayers] fetch blob untuk HTMLImage gagal, fallback direct img:', err);
  }

  // Strategi 2: Direct image anonymous
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = safeUrl;
  });
}

/**
 * Memotong irisan elemen asli poster secara pixel-perfect menjadi FabricImage independen.
 * Mempertahankan 100% estetika, font asli, ornamen, badge diamond, dan tombol indikator.
 */
async function createCroppedComponentSlice(
  sourceImg: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
  options: {
    id: string;
    name: string;
    text: string;
    naturalW: number;
    naturalH: number;
    def?: ComponentSliceDef;
  }
): Promise<FabricImage> {
  const cropW = Math.max(1, Math.round(crop.w));
  const cropH = Math.max(1, Math.round(crop.h));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = cropW;
  offCanvas.height = cropH;
  const ctx = offCanvas.getContext('2d');
  if (ctx) {
    const scaleX = (sourceImg.naturalWidth || sourceImg.width || options.naturalW) / options.naturalW;
    const scaleY = (sourceImg.naturalHeight || sourceImg.height || options.naturalH) / options.naturalH;

    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);

    ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, cropW, cropH);
  }

  const sliceDataUrl = offCanvas.toDataURL('image/png');
  const sliceImg = await FabricImage.fromURL(sliceDataUrl);

  sliceImg.set({
    originX: 'left',
    originY: 'top',
    left: Math.round(crop.x),
    top: Math.round(crop.y),
    stroke: '#7D2AE8', // Canva Purple outline
    strokeWidth: 2,
    strokeUniform: true,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#7D2AE8',
    borderColor: '#7D2AE8',
    cornerSize: 8,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.06)', blur: 4, offsetX: 0, offsetY: 2 }),
  });

  (sliceImg as any).customId = options.id;
  (sliceImg as any).customData = {
    name: options.name,
    text: options.text,
    isComponentSlice: true,
    cropRect: crop,
    originalX: crop.x,
    originalY: crop.y,
    def: options.def,
  };

  sliceImg.setCoords();
  return sliceImg;
}
