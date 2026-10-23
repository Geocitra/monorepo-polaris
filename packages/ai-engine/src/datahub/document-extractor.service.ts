import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { googleGenAiClient } from '../client.js';

export interface ExtractionResult {
  text: string;
  totalPages: number;
  extractorUsed: 'pdf-parse' | 'mammoth' | 'plaintext' | 'gemini-vision-ocr';
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

    // 4. Dokumen Teks Biasa (.txt, .md, .csv)
    if (
      cleanMime.includes('text') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.csv')
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
