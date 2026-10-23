export interface DocumentChunk {
  chunkIndex: number;
  sectionTitle: string;
  contextualHeader: string;
  chunkContent: string;
  fullChunkText: string; // Header + Content (untuk di-embed ke vektor)
  tokenCount: number;
}

export interface ChunkingOptions {
  documentTitle: string;
  categoryTag?: string;
  targetChunkWords?: number; // default ~350-450 kata (~500 token)
  overlapWords?: number;     // default ~70 kata (~15-20% overlap)
}

export class ContextualChunkerService {
  /**
   * Memotong dokumen menjadi chunk-chunk semantik yang dilengkapi Contextual Header
   * serta Sliding Window Overlap untuk menjamin informasi tidak terputus di tengah kalimat.
   */
  public static chunkDocument(
    rawText: string,
    options: ChunkingOptions
  ): DocumentChunk[] {
    const {
      documentTitle,
      categoryTag = 'DOKUMEN_INTERNAL',
      targetChunkWords = 380,
      overlapWords = 70,
    } = options;

    if (!rawText || rawText.trim().length === 0) {
      return [];
    }

    // 1. Bersihkan karakter non-standar dan rapikan newline
    const cleanText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 2. Deteksi seksi atau heading (Markdown headings atau penanda hukum Indonesia: BAB / PASAL)
    const paragraphs = cleanText.split(/\n\n+/);
    const sections: { title: string; content: string }[] = [];

    let currentSectionTitle = 'Pendahuluan / Dokumen Utama';
    let currentSectionBuffer: string[] = [];

    const headingRegex = /^(#{1,4}\s+|BAB\s+[IVXLCDM\d]+|PASAL\s+\d+|BAGIAN\s+[IVXLCDM\d]+)/i;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const firstLine = trimmed.split('\n')[0].trim();
      if (headingRegex.test(firstLine) && firstLine.length <= 120) {
        // Simpan seksi sebelumnya jika sudah ada teks
        if (currentSectionBuffer.length > 0) {
          sections.push({
            title: currentSectionTitle,
            content: currentSectionBuffer.join('\n\n'),
          });
          currentSectionBuffer = [];
        }
        currentSectionTitle = firstLine.replace(/^#+\s*/, '');
      }
      currentSectionBuffer.push(trimmed);
    }

    if (currentSectionBuffer.length > 0) {
      sections.push({
        title: currentSectionTitle,
        content: currentSectionBuffer.join('\n\n'),
      });
    }

    // 3. Sliding Window Chunking dengan Overlap pada tiap seksi
    const finalChunks: DocumentChunk[] = [];
    let globalChunkIndex = 0;

    for (const sec of sections) {
      const words = sec.content.split(/\s+/).filter(Boolean);

      if (words.length <= targetChunkWords + overlapWords) {
        // Seksi cukup pendek, jadikan 1 chunk langsung
        const content = words.join(' ');
        const contextualHeader = `[DOKUMEN: ${documentTitle} | KATEGORI: ${categoryTag} | BAGIAN: ${sec.title}]`;
        const fullChunkText = `${contextualHeader}\n\n${content}`;
        const tokenEstimate = Math.ceil(fullChunkText.length / 4);

        finalChunks.push({
          chunkIndex: globalChunkIndex++,
          sectionTitle: sec.title,
          contextualHeader,
          chunkContent: content,
          fullChunkText,
          tokenCount: tokenEstimate,
        });
      } else {
        // Seksi panjang, gunakan sliding window
        let startIndex = 0;
        let subIndex = 1;

        while (startIndex < words.length) {
          const chunkWords = words.slice(startIndex, startIndex + targetChunkWords);
          if (chunkWords.length === 0) break;

          const content = chunkWords.join(' ');
          const subTitle = `${sec.title} (Bagian ${subIndex})`;
          const contextualHeader = `[DOKUMEN: ${documentTitle} | KATEGORI: ${categoryTag} | BAGIAN: ${subTitle}]`;
          const fullChunkText = `${contextualHeader}\n\n${content}`;
          const tokenEstimate = Math.ceil(fullChunkText.length / 4);

          finalChunks.push({
            chunkIndex: globalChunkIndex++,
            sectionTitle: subTitle,
            contextualHeader,
            chunkContent: content,
            fullChunkText,
            tokenCount: tokenEstimate,
          });

          // Geser window dengan pengurangan overlap
          startIndex += targetChunkWords - overlapWords;
          subIndex++;

          // Jika sisa kata sedikit (< overlapWords), hentikan agar tidak menghasilkan chunk mikro
          if (words.length - startIndex < overlapWords) {
            break;
          }
        }
      }
    }

    return finalChunks;
  }
}
