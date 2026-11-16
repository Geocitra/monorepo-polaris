export interface EditorialStyleProfile {
  style: 'AKADEMIS' | 'SOLUTIF' | 'KRITIS' | 'POPULER';
  label: string;
  chapterAnatomyDirectives: string[];
  headingFormat: 'FORMAL_NUMBERED' | 'JOURNALISTIC_FLOW';
  toneDirective: string;
  lexicalMandates: string[];
  framingMandate: string;
  chapterPromptGuidelines: string;
}

/**
 * Aturan Induk Editorial (Konsolidasi MASTER EDITORIAL RULES):
 * Berlaku lintas seluruh profil penulisan agar naskah bernas, alami, dan bebas klise AI.
 */
export const MASTER_EDITORIAL_CORE_RULES = `PEDOMAN INDUK EDITORIAL (WAJIB DIPATUHI):
1. DILARANG KERAS menggunakan kata "sekadar" atau "nyata" (misal "dampak nyata", "langkah nyata"). Jelaskan bukti atau capaian konkret.
2. DILARANG KERAS menggunakan tanda baca em dash (—) maupun garis pemisah horizontal ("---", "***", "___").
3. JUDUL SPESIFIK & ANTI-KOMA: DILARANG menggunakan tanda titik dua (":") dan DILARANG pola judul dua frasa yang digabung dengan koma (misal "Menata Kota, Menjaga Harapan") atau judul puitis abstrak.
4. PISAHKAN FAKTA, INTERPRETASI, ASUMSI & REKOMENDASI: Jangan membuat klaim sebab-akibat hanya dari korelasi. Sajikan perspektif tandingan bila relevan untuk menguji ketahanan argumen.
5. GAYA PARAGRAF MENGALIR (BUKAN POIN PRESENTASI): Bangun alur argumentasi bertahap antar-paragraf yang padat dan logis, jangan terasa seperti daftar bullet presentasi yang dipindahkan ke dokumen.
6. PENUTUP BERUPA SINTESIS ANALITIS: Akhiri naskah dengan sintesis implikasi kebijakan atau arah tindak lanjut yang konkret; DILARANG menutup dengan slogan motivasional generik.`;

/**
 * EditorialStyleProfileResolver (GRASP: Information Expert & Polymorphism)
 */
export class EditorialStyleProfileResolver {
  public static resolve(writingStyle?: string, framingStance?: string): EditorialStyleProfile {
    const rawStyle = (writingStyle || '').toUpperCase().trim();
    let style: 'AKADEMIS' | 'SOLUTIF' | 'KRITIS' | 'POPULER' = 'SOLUTIF';

    if (rawStyle.includes('AKADEMIS') || rawStyle.includes('RESEARCH') || rawStyle.includes('ILMIAH')) {
      style = 'AKADEMIS';
    } else if (rawStyle.includes('KRITIS') || rawStyle.includes('PENGAWASAN') || rawStyle.includes('AUDIT')) {
      style = 'KRITIS';
    } else if (
      rawStyle.includes('POPULER') ||
      rawStyle.includes('WARGA') ||
      rawStyle.includes('OPINI') ||
      rawStyle.includes('FEATURE') ||
      rawStyle.includes('MAJALAH')
    ) {
      style = 'POPULER';
    } else {
      style = 'SOLUTIF';
    }

    let framingMandate = '';
    const rawFraming = (framingStance || '').toUpperCase();
    if (rawFraming.includes('ANGGARAN') || rawFraming.includes('FISKAL')) {
      framingMandate =
        'FOKUS FRAMING ANGGARAN: Minimal 1 sub-poin bab wajib membedah alokasi APBD/APBN, efisiensi belanja daerah, pos anggaran sektoral dinas, dan mitigasi pemborosan fiskal.';
    } else if (rawFraming.includes('PENGAWASAN') || rawFraming.includes('KRITIS')) {
      framingMandate =
        'FOKUS FRAMING PENGAWASAN & KRITIS: Sub-poin bab wajib menyoroti fungsi pengawasan komisi dewan terhadap deviasi target dinas/OPD mitra dan penegakan akuntabilitas birokrasi.';
    } else if (rawFraming.includes('HUMANIS') || rawFraming.includes('LAPANGAN')) {
      framingMandate =
        'FOKUS FRAMING HUMANIS & LAPANGAN: Sub-poin bab wajib menonjolkan dampak sosial-ekonomi langsung bagi warga, petani, nelayan, atau kelompok rentan di Dapil.';
    }

    if (style === 'AKADEMIS') {
      return {
        style: 'AKADEMIS',
        label: 'Akademis & Riset Kebijakan (Evidence-Based)',
        headingFormat: 'FORMAL_NUMBERED',
        chapterAnatomyDirectives: [
          'Bab 1: Kerangka Konseptual & Urgensi Masalah (NARRATIVE_ONLY) - telaah latar belakang teoretis dan justifikasi ilmiah.',
          'Bab 2: Bukti Empiris & Statistik Lapangan (NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART) - dekomposisi data sekunder & primer.',
          'Bab 3: Harmonisasi Regulasi & Tata Kelola (NARRATIVE_WITH_ROOT_CAUSE) - telaah yuridis, hierarki aturan, dan hambatan struktural.',
          'Bab 4+: Rekomendasi Kebijakan Institusional & Sintesis (NARRATIVE_WITH_ROADMAP / NARRATIVE_ONLY) - kerangka intervensi berbasis kausalitas dan sintesis akhir.',
        ],
        toneDirective: 'Objektif, Metodologis, Berimbang (Cover-Both-Sides), Teknokratis Tinggi.',
        lexicalMandates: [
          'Kepadatan sitasi bukti [^EV-x] maksimal untuk memvalidasi setiap postulat argumen.',
          'Gunakan penalaran deduktif-analitis dan terminologi kebijakan publik baku (signifikansi statistik, kausalitas, dekomposisi, benchmark nasional).',
          'Hindari klaim emosional tanpa sandaran data atau regulasi resmi.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA AKADEMIS & EVIDENCE-BASED:
- Format heading bab: ## Bab [Nomor]. [Judul Substantif Tanpa Titik Dua]
- Kepadatan sitasi [^EV-x] wajib maksimal. Tautkan setiap klaim data ke token bukti yang disediakan.
- Struktur kalimat deduktif, tenang, berwibawa, dan menyajikan analisis komparatif serta perspektif tandingan.`,
      };
    }

    if (style === 'KRITIS') {
      return {
        style: 'KRITIS',
        label: 'Kritis & Pengawasan Kinerja Daerah (Investigatif)',
        headingFormat: 'FORMAL_NUMBERED',
        chapterAnatomyDirectives: [
          'Bab 1: Paradoks Klaim vs Realita Warga (NARRATIVE_ONLY) - kontras tajam antara janji dinas/klaim eksekutif dengan fakta lapangan.',
          'Bab 2: Audit Deviasi Target & Alokasi Anggaran (NARRATIVE_WITH_TABLE) - tabel audit perbandingan target RPJMD vs realisasi dinas.',
          'Bab 3: Anatomi Sumbatan Birokrasi & Tata Kelola (NARRATIVE_WITH_ROOT_CAUSE) - membedah akar kelalaian OPD dan celah pengawasan.',
          'Bab 4+: Evaluasi Kritis & Sintesis Pengawasan Parlemen (NARRATIVE_WITH_ROADMAP / NARRATIVE_ONLY) - langkah pengawasan komisi, desakan audit khusus, dan sintesis implikasi.',
        ],
        toneDirective: 'Investigatif, Tajam, Kritis, Menuntut Akuntabilitas Teknis Sektoral.',
        lexicalMandates: [
          'Awali paragraf dengan kalimat pendek menohok (high burstiness) untuk menegaskan ketimpangan temuan.',
          'Gunakan verba evaluatif tajam: membedah deviasi, menguji kepatuhan, menelusuri kelalaian, menuntut pertanggungjawaban.',
          'Tabel wajib membandingkan Klaim Dinas vs Temuan Lapangan atau Deviasi Anggaran.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA KRITIS & PENGAWASAN PARLEMEN:
- Format heading bab: ## Bab [Nomor]. [Judul Investigatif Tanpa Titik Dua]
- Awali bab dengan membongkar paradoks atau jurang antara target dinas dengan kondisi riil warga.
- Sajikan tabel audit komparasi klaim vs fakta deviasi anggaran/target.
- Nada tegas dan terukur dalam mengawal uang rakyat dan integritas pelayanan publik.`,
      };
    }

    if (style === 'POPULER') {
      return {
        style: 'POPULER',
        label: 'Editorial Majalah, Opini & Suara Warga',
        headingFormat: 'JOURNALISTIC_FLOW',
        chapterAnatomyDirectives: [
          'Bagian 1: Menetapkan Persoalan dari Realitas Lapangan (NARRATIVE_ONLY) - pembukaan langsung ke persoalan konkret warga.',
          'Bagian 2: Konteks & Mengapa Persoalan Ini Mendesak (NARRATIVE_ONLY) - latar belakang, kronologi, dan dampak langsung pada kehidupan warga.',
          'Bagian 3: Mengurai Akar Masalah & Kepentingan di Balik Kebijakan (NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART) - analisis data yang mudah dicerna.',
          'Bagian 4+: Implikasi & Sintesis Arah Perubahan (NARRATIVE_ONLY / NARRATIVE_WITH_ROADMAP) - konsekuensi kebijakan dan sintesis penutup yang matang.',
        ],
        toneDirective: 'Editorial Majalah Berkelas, Mengalir, Hangat, Analitis namun Ramah Pembaca.',
        lexicalMandates: [
          'DILARANG MENGGUNAKAN JARGON BIROKRASI KAKU (terjemahkan istilah dinas ke dalam bahasa percakapan cerdas sehari-hari).',
          'Gunakan format heading jurnalistik mengalir: ## [Judul Menarik] (DILARANG mencantumkan kata "Bab I", "Bab II", dll).',
          'Paragraf padat dan mengalir alami (3-4 kalimat per paragraf), menghindari bullet point berlebihan.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA EDITORIAL MAJALAH & OPINI PUBLIK:
- Format heading: ## [Judul Subbab Jurnalistik Mengalir] (JANGAN GUNAKAN KATA "BAB I", "BAB II", dll!).
- Bahasa Indonesia modern, matang, elegan, seperti feature majalah atau kolom opini premium.
- Pembukaan langsung memotret persoalan konkret di lapangan tanpa basa-basi abstrak.
- Penutup menyajikan sintesis implikasi yang berkelas, bukan slogan.`,
      };
    }

    return {
      style: 'SOLUTIF',
      label: 'Solutif & Eksekutif (Analisis & Kebijakan Aksi)',
      headingFormat: 'FORMAL_NUMBERED',
      chapterAnatomyDirectives: [
        'Bab 1: Pemetaan Masalah & Urgensi Lapangan (NARRATIVE_ONLY) - identifikasi kendala prioritas yang membutuhkan intervensi cepat.',
        'Bab 2: Diagnosa Kapasitas Fiskal & Anggaran (NARRATIVE_WITH_TABLE) - tabel alokasi anggaran dan efisiensi belanja program.',
        'Bab 3: Terobosan Taktis & Mekanisme Kebijakan (NARRATIVE_WITH_CHART atau NARRATIVE_ONLY) - analisis mekanisme kerja dan opsi solusi.',
        'Bab 4+: Matriks Rencana Aksi & Sintesis Implementasi (NARRATIVE_WITH_ROADMAP / NARRATIVE_ONLY) - pembagian peran, target waktu, dan sintesis penutup.',
      ],
      toneDirective: 'Eksekutif, Konstruktif, Berorientasi Solusi, Taktis, Lugas.',
      lexicalMandates: [
        'Rasio bahasan: 30% Masalah, 70% Solusi Konkret. Setiap kendala langsung dipasangkan dengan opsi solusi.',
        'Gunakan verba eksekusi aktif: mengalokasikan, memangkas hambatan, menginisiasi, mengeksekusi, menuntaskan.',
        'Jelaskan mekanisme kerja kebijakan, aktor yang bertanggung jawab, sumber daya, serta risiko implementasinya.',
      ],
      framingMandate,
      chapterPromptGuidelines: `GAYA SOLUTIF & EKSEKUTIF:
- Format heading bab: ## Bab [Nomor]. [Judul Taktis Tanpa Titik Dua]
- Tekankan 30% identifikasi masalah dan 70% perumusan solusi konkret lengkap dengan mekanismenya.
- Pastikan ada rekomendasi langkah cepat (quick wins) dan pembagian peran OPD/instansi yang jelas.
- Akhiri dengan sintesis implikasi kebijakan yang terukur, hindari slogan generik.`,
    };
  }
}

