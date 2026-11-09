import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { and, eq } from 'drizzle-orm';
import {
  db,
  datahubFiles,
  datahubDocumentRefs,
  datahubDocumentChunks,
} from '@polaris/database';
import {
  DocumentExtractorService,
  ContextualChunkerService,
  DatahubEmbedderService,
  DocumentClassifierService,
} from '@polaris/ai-engine';
import { DatahubPrivacyScope, DatahubCategory } from '@polaris/shared-types';

export interface ProcessAttachmentsOptions {
  tenantId: string;
  attachments?: Array<{
    name: string;
    type: string;
    base64?: string;
  }>;
  queryVector?: number[] | null;
  resolvedDapilCode?: string | null;
  member?: {
    partyAffiliation?: string | null;
    legislativeLevel?: string | null;
  };
}

export interface ParsedAttachmentDocument {
  name: string;
  type: string;
  extractedContent: string;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class StudioAttachmentPipelineService {
  /**
   * Memproses lampiran multimodal:
   * 1. Decode base64 & kalkulasi hash SHA-256
   * 2. Cek deduplikasi di datahub_files (jika ada, gunakan chunking & vektor tersimpan)
   * 3. Jika berkas baru: ekstraksi teks (PDF/DOCX/OCR), simpan fisik file, klasifikasi, chunking, generate embeddings & simpan pgvector
   * 4. Registrasi referensi kepemilikan multi-tenant ke datahub_document_refs
   * 5. Top-K semantic filtering berdasarkan cosine similarity dengan queryVector topik artikel
   */
  public static async processAttachments(
    options: ProcessAttachmentsOptions
  ): Promise<ParsedAttachmentDocument[]> {
    const { tenantId, attachments, queryVector, resolvedDapilCode, member } = options;

    if (!attachments || attachments.length === 0) {
      return [];
    }

    const parsedDocuments: ParsedAttachmentDocument[] = [];

    for (const att of attachments.slice(0, 5)) {
      try {
        if (!att.base64) continue;
        const cleanBase64 = att.base64.replace(/^data:[^;]+;base64,/, '');
        const fileBuffer = Buffer.from(cleanBase64, 'base64');
        if (fileBuffer.length === 0) continue;

        const contentSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const cleanName = att.name || 'lampiran_lapangan';
        const cleanMime = (att.type || 'application/octet-stream').toLowerCase();

        // 1. Cek Deduplikasi Fisik di DataHub
        const [existingFile] = await db
          .select({
            id: datahubFiles.id,
            contentSha256: datahubFiles.contentSha256,
            extractionStatus: datahubFiles.extractionStatus,
            extractedRawText: datahubFiles.extractedRawText,
          })
          .from(datahubFiles)
          .where(eq(datahubFiles.contentSha256, contentSha256))
          .limit(1);

        let targetFileId: string;
        let fileChunks: Array<{
          chunkIndex: number;
          sectionTitle: string | null;
          chunkContent: string;
          vectorEmbedding: number[];
        }> = [];

        if (existingFile && existingFile.extractionStatus === 'COMPLETED') {
          // DEDUPLIKASI HIT! File fisik, ekstraksi & embedding sudah ada.
          console.log(
            `[StudioAttachmentPipeline] Dokumen '${cleanName}' terdeduplikasi via SHA-256 (${contentSha256}). Skip ekstraksi & embedding ulang.`
          );
          targetFileId = existingFile.id;

          // Ambil chunk dan vektor yang sudah tersimpan di pgvector
          const loadedChunks = await db
            .select({
              chunkIndex: datahubDocumentChunks.chunkIndex,
              sectionTitle: datahubDocumentChunks.sectionTitle,
              chunkContent: datahubDocumentChunks.chunkContent,
              vectorEmbedding: datahubDocumentChunks.vectorEmbedding,
            })
            .from(datahubDocumentChunks)
            .where(eq(datahubDocumentChunks.fileId, targetFileId));

          fileChunks = loadedChunks;
        } else {
          // BERKAS BARU: Ekstraksi Teks Multimodal (PDF, DOCX, Gemini Vision OCR, CSV/Plaintext)
          const extraction = await DocumentExtractorService.extractText(
            fileBuffer,
            cleanMime,
            cleanName,
            tenantId
          );
          const extractedText = (extraction.text || '').trim();

          // Simpan fisik file ke upload dir lokal
          const uploadDir = path.resolve(process.cwd(), 'uploads/datahub');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const ext = path.extname(cleanName) || '.bin';
          const localFilePath = path.join(uploadDir, `${contentSha256}${ext}`);
          if (!fs.existsSync(localFilePath)) {
            fs.writeFileSync(localFilePath, fileBuffer);
          }

          // Simpan record master file
          const [newMasterFile] = await db
            .insert(datahubFiles)
            .values({
              contentSha256,
              originalFileName: cleanName,
              mimeType: cleanMime,
              fileSizeBytes: fileBuffer.length,
              storagePath: `/uploads/datahub/${contentSha256}${ext}`,
              extractionStatus: 'COMPLETED',
              totalPages: extraction.totalPages || 1,
              extractedRawText: extractedText.slice(0, 100000),
            })
            .returning({ id: datahubFiles.id });

          targetFileId = newMasterFile.id;

          // Klasifikasi Cerdas Kategori Dokumen (3-Pass AI & Heuristik)
          let detectedCategory = DatahubCategory.DOKUMEN_INTERNAL;
          try {
            const cls = await DocumentClassifierService.classifyDocument(
              cleanName,
              extractedText,
              undefined,
              tenantId
            );
            detectedCategory = cls.category;
          } catch (clsErr: any) {
            console.warn(
              `[StudioAttachmentPipeline] Gagal klasifikasi dokumen ${cleanName}: ${clsErr.message}`
            );
          }

          // PEMBEDAAN CHUNKING SISTEM:
          // - Dokumen pendek / Foto OCR (<= 800 kata): Unified Single Context Chunk
          // - Dokumen panjang (Perda, APBD, LKPJ > 800 kata): Contextual Sliding Window Chunking
          const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
          let generatedChunks: any[] = [];

          if (wordCount <= 800 || extraction.extractorUsed === 'gemini-vision-ocr') {
            generatedChunks = [
              {
                chunkIndex: 0,
                sectionTitle:
                  extraction.extractorUsed === 'gemini-vision-ocr'
                    ? 'Transkrip & Scene Lapangan'
                    : 'Ringkasan Rilis/Memo',
                chunkContent: extractedText,
                fullChunkText: `[Kategori: ${detectedCategory}] [Dokumen: ${cleanName}]\n${extractedText}`,
                tokenCount: Math.ceil(extractedText.length / 4),
              },
            ];
          } else {
            generatedChunks = ContextualChunkerService.chunkDocument(extractedText, {
              documentTitle: cleanName,
              categoryTag: detectedCategory,
              targetChunkWords: 380,
              overlapWords: 70,
            });
          }

          // Batch Embeddings & Simpan ke pgvector
          if (generatedChunks.length > 0) {
            const chunkTexts = generatedChunks.map((c) => c.fullChunkText || c.chunkContent);
            const embeddings = await DatahubEmbedderService.generateBatchEmbeddings(chunkTexts, 50, tenantId);

            const chunkRows = generatedChunks.map((c, idx) => ({
              fileId: targetFileId,
              chunkIndex: c.chunkIndex,
              sectionTitle: c.sectionTitle || `Bagian ${idx + 1}`,
              chunkContent: c.chunkContent,
              contextualHeader: c.contextualHeader || null,
              tokenCount: c.tokenCount || Math.ceil(c.chunkContent.length / 4),
              vectorEmbedding: embeddings[idx],
            }));

            for (let i = 0; i < chunkRows.length; i += 50) {
              const slice = chunkRows.slice(i, i + 50);
              await db.insert(datahubDocumentChunks).values(slice);
            }

            fileChunks = chunkRows;
          }
        }

        // 2. KEPEMILIKAN DOKUMEN: Daftarkan Referensi Multi-Tenant ke Tokoh Binaan (tenantId)
        const [existingRef] = await db
          .select({ id: datahubDocumentRefs.id })
          .from(datahubDocumentRefs)
          .where(
            and(
              eq(datahubDocumentRefs.fileId, targetFileId),
              eq(datahubDocumentRefs.uploadedByTenantId, tenantId)
            )
          )
          .limit(1);

        if (!existingRef) {
          let refCategory = DatahubCategory.DOKUMEN_INTERNAL;
          const [priorRef] = await db
            .select({ categoryTag: datahubDocumentRefs.categoryTag })
            .from(datahubDocumentRefs)
            .where(eq(datahubDocumentRefs.fileId, targetFileId))
            .limit(1);

          if (priorRef?.categoryTag) {
            refCategory = priorRef.categoryTag as DatahubCategory;
          } else if (fileChunks.length > 0) {
            const sampleText = fileChunks.map((c) => c.chunkContent).join('\n').slice(0, 3000);
            const cls = await DocumentClassifierService.classifyDocument(cleanName, sampleText, undefined, tenantId);
            refCategory = cls.category;
          }

          await db.insert(datahubDocumentRefs).values({
            fileId: targetFileId,
            uploadedByTenantId: tenantId,
            customTitle: cleanName,
            dapilCode: resolvedDapilCode,
            partyAffiliation: member?.partyAffiliation || null,
            branchType: member?.legislativeLevel?.startsWith('KEPALA_DAERAH')
              ? 'EKSEKUTIF'
              : member?.legislativeLevel === 'PIMPINAN_LEMBAGA_REKTOR_SWASTA'
                ? 'PUBLIK'
                : 'LEGISLATIF',
            legislativeLevel: (member?.legislativeLevel as any) || null,
            privacyScope: DatahubPrivacyScope.PRIVATE_TENANT,
            categoryTag: refCategory,
          });
        }

        // 3. RAG TOP-K RELEVANCE FILTERING: Ambil chunk terbaik yang relevan dengan topik artikel
        if (fileChunks.length > 0) {
          let selectedChunks = fileChunks;

          if (fileChunks.length > 3 && queryVector && queryVector.length > 0) {
            const scored = fileChunks.map((ch) => ({
              chunk: ch,
              score: cosineSimilarity(queryVector, ch.vectorEmbedding),
            }));
            scored.sort((a, b) => b.score - a.score);
            selectedChunks = scored.slice(0, 4).map((s) => s.chunk);
          }

          const formattedContent = selectedChunks
            .map(
              (ch, idx) =>
                `[Lampiran Dokumen: ${cleanName} - ${ch.sectionTitle || 'Bagian ' + (idx + 1)}]:\n${ch.chunkContent}`
            )
            .join('\n\n');

          parsedDocuments.push({
            name: cleanName,
            type: cleanMime,
            extractedContent: formattedContent,
          });
        }
      } catch (attErr: any) {
        console.warn(`[StudioAttachmentPipeline] Gagal memproses lampiran ${att.name}: ${attErr.message}`);
      }
    }

    return parsedDocuments;
  }
}

