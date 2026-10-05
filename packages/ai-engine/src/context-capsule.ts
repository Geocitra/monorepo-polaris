export interface RawContextSources {
  regionName: string;
  regulations: Array<{ reference: string; content: string }>;
  recentNews: Array<{ title: string; summary: string; portal: string }>;
  memberWritingSample?: string;
  comparisonRegionData?: string;
  externalWebSources?: Array<{ url: string; title?: string; content: string }>;
  attachedDocuments?: Array<{ name: string; type: string; extractedContent: string }>;
  framingStance?: string;
}

export class ContextCapsuleBuilder {
  /**
   * assembleContext menggabungkan seluruh layer fakta menjadi satu teks
   * grounding terstruktur untuk disuntikkan ke LLM.
   */
  public static assembleContext(sources: RawContextSources): string {
    const regulationSection = sources.regulations.length > 0
      ? sources.regulations.map((r, i) => `[Regulasi ${i + 1}] ${r.reference}:\n${r.content}`).join('\n\n')
      : 'Data regulasi daerah khusus belum tersedia.';

    const newsSection = sources.recentNews.length > 0
      ? sources.recentNews.map((n, i) => `[Berita ${i + 1} - ${n.portal}] ${n.title}: ${n.summary}`).join('\n')
      : 'Tidak ada berita daerah signifikan dalam 24 jam terakhir.';

    const comparisonSection = sources.comparisonRegionData
      ? `\n\n--- DATA KOMPARASI REGIONAL (STUDI BANDING) ---\n${sources.comparisonRegionData}`
      : '';

    const writingStyleSection = sources.memberWritingSample
      ? `\n\n--- CONTOH PREFERENSI GAYA BAHASA RESMI DEWAN ---\n"${sources.memberWritingSample}"\n(Catatan: Pertahankan diksi dan bobot argumentasi serupa dengan contoh ini).`
      : '';

    const webSection = sources.externalWebSources && sources.externalWebSources.length > 0
      ? `\n\n--- RUJUKAN SITUS WEB & RISET INTERNET TERKINI (LIVE INGESTION) ---\n` +
        sources.externalWebSources.map((w, i) => `[Tautan Web ${i + 1}] ${w.url}${w.title ? ` (${w.title})` : ''}:\n${w.content}`).join('\n\n')
      : '';

    const docSection = sources.attachedDocuments && sources.attachedDocuments.length > 0
      ? `\n\n--- DOKUMEN & FOTO LAMPIRAN DEWAN (HASIL OCR & EKSTRAKSI DATA TABEL) ---\n` +
        sources.attachedDocuments.map((d, i) => `[Dokumen ${i + 1}] ${d.name} (${d.type}):\n${d.extractedContent}`).join('\n\n')
      : '';

    const framingSection = sources.framingStance
      ? `\n\n--- ARAHAN SUDUT PANDANG / FRAMING POLITIK DEWAN ---\nFokus Framing: ${sources.framingStance}`
      : '';

    return `=== KAPSUL KONTEKS POLARIS (GROUNDING DATA LENGKAP) ===
WILAYAH TARGET: ${sources.regionName}

--- FAKTA REGULASI & PERATURAN RESMI AKTIF ---
${regulationSection}

--- DISKURSUS PUBLIK & BERITA MEDIA TERKINI (CRON CRAWLER) ---
${newsSection}${webSection}${docSection}${framingSection}${comparisonSection}${writingStyleSection}
======================================================`;
  }
}
