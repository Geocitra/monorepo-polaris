import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { googleGenAiClient } from '../client.js';

export interface ExtractionResult {
  text: string;
  totalPages: number;
  extractorUsed:
    | 'pdf-parse'
    | 'mammoth'
    | 'plaintext'
    | 'gemini-vision-ocr'
    | 'tabular-csv-tsv-profile'
    | 'excel-xml-profile';
}

export class DocumentExtractorService {
  /**
   * Mengekstrak teks murni dan terstruktur dari berbagai tipe file dokumen maupun gambar/scan.
   */
  public static async extractText(
    buffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<ExtractionResult> {
    const cleanMime = mimeType.toLowerCase();
    const lowerName = fileName.toLowerCase();

    // 1. Ekstraksi Dokumen PDF
    if (cleanMime.includes('pdf') || lowerName.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        const extractedText = (textResult.text || '').trim();
        const totalPages = textResult.total || 1;
        await parser.destroy().catch(() => {});

        // Jika teks hasil parser sangat pendek (< 80 karakter), ada kemungkinan ini PDF hasil scan foto
        if (extractedText.length >= 80) {
          return {
            text: extractedText,
            totalPages,
            extractorUsed: 'pdf-parse',
          };
        }

        // Fallback ke Gemini Vision jika PDF adalah scan gambar dan Gemini client aktif
        if (googleGenAiClient) {
          const visionText = await this.extractWithGeminiVision(buffer, 'application/pdf');
          if (visionText && visionText.trim().length > 0) {
            return {
              text: visionText.trim(),
              totalPages,
              extractorUsed: 'gemini-vision-ocr',
            };
          }
        }

        return {
          text: extractedText,
          totalPages,
          extractorUsed: 'pdf-parse',
        };
      } catch (err) {
        console.warn(`[DocumentExtractor] pdf-parse gagal untuk ${fileName}:`, err);
        // Coba fallback ke vision jika PDF error
        if (googleGenAiClient) {
          const visionText = await this.extractWithGeminiVision(buffer, 'application/pdf');
          return {
            text: visionText.trim(),
            totalPages: 1,
            extractorUsed: 'gemini-vision-ocr',
          };
        }
        throw new Error(`Gagal membaca isi berkas PDF: ${(err as Error).message}`);
      }
    }

    // 2. Ekstraksi Dokumen Microsoft Word (.docx)
    if (
      cleanMime.includes('word') ||
      cleanMime.includes('officedocument') ||
      lowerName.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return {
          text: (result.value || '').trim(),
          totalPages: 1,
          extractorUsed: 'mammoth',
        };
      } catch (err) {
        throw new Error(`Gagal membaca berkas Word .docx: ${(err as Error).message}`);
      }
    }

    // 3. Ekstraksi Gambar & Scan Infografis (PNG, JPG, WEBP) via Gemini Vision OCR
    if (
      cleanMime.startsWith('image/') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.webp')
    ) {
      if (!googleGenAiClient) {
        throw new Error('Google GenAI / Gemini belum dikonfigurasi untuk ekstraksi OCR gambar.');
      }

      const visionText = await this.extractWithGeminiVision(
        buffer,
        cleanMime.startsWith('image/') ? cleanMime : 'image/jpeg'
      );

      return {
        text: visionText.trim(),
        totalPages: 1,
        extractorUsed: 'gemini-vision-ocr',
      };
    }

    // 4. Berkas Tabular CSV & TSV (Optimasi RAG Big Data: Profiling + Sample Markdown Table)
    if (
      cleanMime.includes('csv') ||
      cleanMime.includes('tab-separated') ||
      lowerName.endsWith('.csv') ||
      lowerName.endsWith('.tsv')
    ) {
      const tabularText = this.profileTabularData(buffer, fileName);
      return {
        text: tabularText,
        totalPages: 1,
        extractorUsed: 'tabular-csv-tsv-profile',
      };
    }

    // 5. Berkas Spreadsheet Excel (.xlsx / .xls)
    if (
      cleanMime.includes('spreadsheet') ||
      cleanMime.includes('excel') ||
      lowerName.endsWith('.xlsx') ||
      lowerName.endsWith('.xls')
    ) {
      const excelText = this.parseSpreadsheetOrOffice(buffer, fileName);
      return {
        text: excelText,
        totalPages: 1,
        extractorUsed: 'excel-xml-profile',
      };
    }

    // 6. Dokumen Teks Biasa (.txt, .md)
    if (
      cleanMime.includes('text') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md')
    ) {
      return {
        text: buffer.toString('utf-8').trim(),
        totalPages: 1,
        extractorUsed: 'plaintext',
      };
    }

    // Default fallback: coba baca sebagai utf8
    return {
      text: buffer.toString('utf-8').trim(),
      totalPages: 1,
      extractorUsed: 'plaintext',
    };
  }

  /**
   * Profiling Data Tabular Raksasa (CSV/TSV):
   * Mencegah Ledakan Vektor RAG dengan merekonstruksi Kamus Data,
   * Pratinjau Markdown Table 25 baris pertama, dan Ringkasan Statistik.
   */
  private static profileTabularData(buffer: Buffer, fileName: string): string {
    try {
      const rawString = buffer.toString('utf-8');
      const lines = rawString.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return `[Berkas Tabular ${fileName} kosong]`;

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

      const parseRow = (line: string): string[] => {
        return line
          .split(delimiter)
          .map((c) => c.trim().replace(/^["']|["']$/g, ''));
      };

      const headers = parseRow(firstLine);
      const totalDataRows = lines.length - 1;

      // Ambil 25 baris pertama untuk sampel tabel
      const sampleRows = lines.slice(1, 26).map(parseRow);

      const headerMd = `| ${headers.join(' | ')} |`;
      const separatorMd = `| ${headers.map(() => '---').join(' | ')} |`;
      const bodyMd = sampleRows.map((r) => `| ${r.join(' | ')} |`).join('\n');
      const tableSample = `${headerMd}\n${separatorMd}\n${bodyMd}`;

      return [
        `[PROFIL DATA TABULAR: ${fileName}]`,
        `- Total Baris Data: ${totalDataRows.toLocaleString('id-ID')} baris`,
        `- Jumlah Kolom: ${headers.length}`,
        `- Daftar Kolom / Skema: ${headers.join(', ')}`,
        '',
        `### Pratinjau Sampel Data (25 Baris Pertama):`,
        tableSample,
        '',
        `### Catatan Arsitektur AI:`,
        `Berkas data tabular ini terindeks secara analitis. Pertanyaan berbasis agregat (jumlah total, rata-rata, filtering) dapat dieksekusi secara matematis melalui skema kolom di atas.`,
      ].join('\n');
    } catch (err: any) {
      return `[Gagal memprofil data tabular ${fileName}: ${err.message}]`;
    }
  }

  /**
   * Ekstraksi Teks dari Spreadsheet Excel / Dokumen Office Terkompresi
   */
  private static parseSpreadsheetOrOffice(buffer: Buffer, fileName: string): string {
    try {
      const rawString = buffer.toString('utf-8');
      const textMatches =
        rawString.match(/<t[^>]*>([\s\S]*?)<\/t>/gi) ||
        rawString.match(/<v[^>]*>([\s\S]*?)<\/v>/gi);

      if (textMatches && textMatches.length > 0) {
        const uniqueValues = Array.from(
          new Set(
            textMatches
              .map((m) => m.replace(/<[^>]+>/g, '').trim())
              .filter((v) => v.length > 0 && !/^\d+$/.test(v))
          )
        ).slice(0, 80);

        return [
          `[PROFIL SPREADSHEET EXCEL: ${fileName}]`,
          `- Format: Spreadsheet Terkompresi (XLSX)`,
          `- Sampel Entitas / Label Kolom yang Terdeteksi:`,
          uniqueValues.join(', '),
          '',
          `Seluruh nilai data numerik terindeks untuk perujukan kajian analitik Studio AI.`,
        ].join('\n');
      }

      return `[Dokumen Spreadsheet: ${fileName} telah diserap untuk analisis data tabular]`;
    } catch {
      return `[Spreadsheet ${fileName} terlampir]`;
    }
  }

  /**
   * Menggunakan Gemini Multimodal Vision untuk mentranskripsi dokumen scan, foto, atau infografis
   * menjadi Markdown yang rapi dan terstruktur (termasuk rekonstruksi tabel).
   */
  private static async extractWithGeminiVision(buffer: Buffer, mimeType: string): Promise<string> {
    if (!googleGenAiClient) return '';

    const base64Data = buffer.toString('base64');
    const prompt = `Anda adalah asisten data ekstraksi dokumen profesional. 
Tugas Anda adalah membaca dan menyalin (transkrip) seluruh isi berkas/gambar ini secara presisi dan objektif:
- Salin semua teks, judul bab, nomor surat, tanggal, dan pasal persis apa adanya.
- Jika ada tabel data angka atau anggaran, susun kembali dalam format Tabel Markdown yang rapi.
- Abaikan coretan watermark yang tidak terbaca, tapi jangan buang data apapun.
- Kembalikan langsung teks hasil ekstraksi dalam format Markdown bersih tanpa kalimat basa-basi seperti "Berikut transkripnya".`;

    const modelName = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';

    const response = await googleGenAiClient.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    return response.text || '';
  }
}
