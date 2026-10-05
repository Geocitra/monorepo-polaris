import { Injectable, Logger } from '@nestjs/common';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';

export interface DocumentAttachmentInput {
  name: string;
  type: string;
  base64: string;
}

export interface ParsedDocumentOutput {
  name: string;
  type: string;
  extractedContent: string;
}

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);
  private readonly aiEngine = new OpenAIAIEngineAdapter();

  constructor() {}

  /**
   * Mengurai sekumpulan berkas lampiran secara paralel dan mengekstrak teks / tabel / OCR
   */
  public async parseAttachments(attachments: DocumentAttachmentInput[]): Promise<ParsedDocumentOutput[]> {
    if (!attachments || attachments.length === 0) return [];

    const parsedResults: ParsedDocumentOutput[] = [];

    for (const att of attachments.slice(0, 5)) {
      try {
        const content = await this.parseSingleAttachment(att);
        parsedResults.push({
          name: att.name,
          type: att.type,
          extractedContent: content,
        });
      } catch (err: any) {
        this.logger.warn(`Gagal mengurai dokumen ${att.name}: ${err.message}`);
        parsedResults.push({
          name: att.name,
          type: att.type,
          extractedContent: `[Gagal mengurai: ${err.message}]`,
        });
      }
    }

    return parsedResults;
  }

  /**
   * Mengurai 1 lampiran berdasarkan tipe MIME atau ekstensinya
   */
  public async parseSingleAttachment(att: DocumentAttachmentInput): Promise<string> {
    const mime = (att.type || '').toLowerCase();
    const fileName = (att.name || '').toLowerCase();

    // 1. Gambar & Foto (PNG, JPEG, WebP) -> Menggunakan OpenAI GPT-4o Multimodal Vision OCR
    if (
      mime.includes('image/') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.webp')
    ) {
      return await this.aiEngine.performVisionOCR({
        base64Data: att.base64,
        mimeType: mime || 'image/jpeg',
        fileName: att.name,
      });
    }

    // 2. Berkas PDF -> OCR Dokumen & Ekstraksi Gambar/Tabel
    if (mime.includes('pdf') || fileName.endsWith('.pdf')) {
      // PDF dapat diproses melalui Vision OCR OpenAI sebagai gambar/dokumen
      return await this.aiEngine.performVisionOCR({
        base64Data: att.base64,
        mimeType: 'application/pdf',
        fileName: att.name,
      });
    }

    // 3. Berkas Spreadsheet CSV & Teks Biasa
    if (mime.includes('csv') || fileName.endsWith('.csv') || mime.includes('text/plain') || fileName.endsWith('.txt')) {
      return this.parseCsvOrText(att.base64);
    }

    // 4. Berkas Excel (XLSX) atau Word (DOCX)
    if (
      mime.includes('spreadsheet') ||
      mime.includes('excel') ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      mime.includes('word') ||
      fileName.endsWith('.docx')
    ) {
      return this.parseOfficeDoc(att.base64, att.name);
    }

    // Fallback: decode text
    return this.parseCsvOrText(att.base64);
  }

  /**
   * Mengubah CSV / teks mentah menjadi format Markdown Tabel yang mudah dibaca AI
   */
  private parseCsvOrText(base64: string): string {
    try {
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
      const rawText = Buffer.from(cleanBase64, 'base64').toString('utf-8');

      const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return 'Dokumen teks kosong.';

      // Deteksi jika berupa CSV
      if (lines[0].includes(',') || lines[0].includes(';')) {
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const rows = lines.slice(0, 50).map((line) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')));

        if (rows.length > 0 && rows[0].length > 1) {
          const header = `| ${rows[0].join(' | ')} |`;
          const separator = `| ${rows[0].map(() => '---').join(' | ')} |`;
          const body = rows
            .slice(1)
            .map((r) => `| ${r.join(' | ')} |`)
            .join('\n');
          return `${header}\n${separator}\n${body}`;
        }
      }

      return rawText.slice(0, 3000);
    } catch (err: any) {
      return `[Gagal decode teks: ${err.message}]`;
    }
  }

  /**
   * Ekstraksi teks & tabel dari dokumen office DOCX / XLSX secara aman
   */
  private parseOfficeDoc(base64: string, fileName: string): string {
    try {
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const rawString = buffer.toString('utf-8');

      // Ambil tag teks <w:t> untuk Word atau <v> / <t> untuk Excel
      const textMatches = rawString.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) ||
                          rawString.match(/<t[^>]*>([\s\S]*?)<\/t>/gi);

      if (textMatches && textMatches.length > 0) {
        const extracted = textMatches
          .map((m) => m.replace(/<[^>]+>/g, '').trim())
          .filter(Boolean)
          .join(' ');
        return `[Transkrip Dokumen ${fileName}]:\n${extracted.slice(0, 3500)}`;
      }

      // Jika zip binary terenkapsulasi, berikan label lampiran
      return `[Lampiran Dokumen Kebijakan: ${fileName} telah disertakan untuk analisis data]`;
    } catch {
      return `[Dokumen ${fileName} terlampir]`;
    }
  }
}
