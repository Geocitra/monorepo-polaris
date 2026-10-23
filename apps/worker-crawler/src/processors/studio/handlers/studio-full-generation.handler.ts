import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { Job } from 'bullmq';
import { and, eq, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  tenantQuotaLedgers,
  tenantMembers,
  electoralDistricts,
  findSimilarKnowledgeChunks,
  withTenantContext,
  researchJobs,
  researchOutputs,
  datahubFiles,
  datahubDocumentRefs,
  datahubDocumentChunks,
} from '@polaris/database';
import {
  OpenAIAIEngineAdapter,
  ContextCapsuleBuilder,
  AutonomousResearchOrchestrator,
  DeterministicQualityGates,
  AiTelemetryService,
  DocumentExtractorService,
  ContextualChunkerService,
  DatahubEmbedderService,
} from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  CreativePosterCompositor,
  ArtCollageCompositor,
  ChromiumPosterCompositor,
} from '@polaris/storage';
import { ContentStatus, AssetType, ResearchJobStatus } from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';

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

export class StudioFullGenerationHandler {
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    console.log(
      `[StudioProcessor] Memulai pemrosesan tugas asinkron #${job.id} (PubID: ${publicationId})...`
    );

    try {
      // -----------------------------------------------------------------------
      // LANGKAH 1 (20%): Resolusi Wilayah & Ekstraksi Dokumen
      // -----------------------------------------------------------------------
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        20,
        'Menyusuri Konteks Regulasi & Analisis Dokumen Lampiran...'
      );

      const [member] = await db
        .select({
          fullName: tenantMembers.fullName,
          partyAffiliation: tenantMembers.partyAffiliation,
          dapilId: tenantMembers.electoralDistrictId,
          customDapil: tenantMembers.customDapilName,
          personalCoverage: tenantMembers.personalCoverage,
          photoUrl: tenantMembers.photoUrl,
          commissionName: tenantMembers.commissionName,
          legislativeLevel: tenantMembers.legislativeLevel,
        })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      let targetRegion = member?.personalCoverage?.[0] || 'NASIONAL';
      let dapilName = member?.customDapil || 'Dapil';

      if (member?.dapilId) {
        const [dapil] = await db
          .select()
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1);

        if (dapil) {
          if (!member.customDapil) dapilName = dapil.dapilName;
          if (!member.personalCoverage || member.personalCoverage.length === 0) {
            targetRegion = dapil.regencyCoverage?.[0] || 'NASIONAL';
          }
        }
      }

      // Vektor Grounding Otentik (RAG) untuk Topik
      let queryVector: number[] | null = null;
      try {
        const embedResult = await aiEngine.generateEmbedding(data.topic, tenantId);
        queryVector = embedResult.embedding;
      } catch (err: any) {
        console.warn(`[StudioProcessor] Query embedding gagal: ${err.message}`);
      }

      // =======================================================================
      // LANGKAH 1A: MULTIMODAL INGESTION, DEDUPLIKASI SHA-256 & RAG CHUNKING
      // Hak Milik Dokumen: Terikat strictly ke Tokoh Binaan aktif (tenantId)
      // =======================================================================
      const parsedDocuments: Array<{ name: string; type: string; extractedContent: string }> = [];

      if (data.attachments && data.attachments.length > 0) {
        for (const att of data.attachments.slice(0, 5)) {
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
                `[StudioProcessor] Dokumen '${cleanName}' terdeduplikasi via SHA-256 (${contentSha256}). Skip ekstraksi & embedding ulang.`
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
                cleanName
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
                    fullChunkText: `[Dokumen: ${cleanName}]\n${extractedText}`,
                    tokenCount: Math.ceil(extractedText.length / 4),
                  },
                ];
              } else {
                generatedChunks = ContextualChunkerService.chunkDocument(extractedText, {
                  documentTitle: cleanName,
                  categoryTag: 'DOKUMEN_INTERNAL',
                  targetChunkWords: 380,
                  overlapWords: 70,
                });
              }

              // Batch Embeddings & Simpan ke pgvector
              if (generatedChunks.length > 0) {
                const chunkTexts = generatedChunks.map((c) => c.fullChunkText || c.chunkContent);
                const embeddings = await DatahubEmbedderService.generateBatchEmbeddings(chunkTexts);

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
              await db.insert(datahubDocumentRefs).values({
                fileId: targetFileId,
                uploadedByTenantId: tenantId, // Hak milik mutlak tokoh dewan binaan yang aktif!
                customTitle: cleanName,
                dapilCode: member?.customDapil || null,
                partyAffiliation: member?.partyAffiliation || null,
                branchType: 'LEGISLATIF',
                legislativeLevel: (member?.legislativeLevel as any) || 'DPRD_PROVINSI',
                privacyScope: 'PRIVATE_TENANT',
                categoryTag: 'DOKUMEN_INTERNAL',
              });
            }

            // 3. RAG TOP-K RELEVANCE FILTERING: Ambil chunk terbaik yang relevan dengan topik artikel
            if (fileChunks.length > 0) {
              let selectedChunks = fileChunks;

              if (fileChunks.length > 3 && queryVector && queryVector.length > 0) {
                const scored = fileChunks.map((ch) => ({
                  chunk: ch,
                  score: cosineSimilarity(queryVector!, ch.vectorEmbedding),
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
            console.warn(`[StudioProcessor] Gagal memproses lampiran ${att.name}: ${attErr.message}`);
          }
        }
      }

      // -----------------------------------------------------------------------
      // LANGKAH 1B (20%-35%): Autonomous Research Pipeline (Planner, Multi-Source, Evidence Spans)
      // -----------------------------------------------------------------------
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        20,
        'Menjalankan Riset Otonom & Pencarian Bukti Terverifikasi...'
      );

      let researchJobId: string | undefined;
      let groundedEvidenceText = '';
      let evidenceMap = new Map<string, string>();

      try {
        const researchResult = await AutonomousResearchOrchestrator.executeResearchPipeline({
          tenantId,
          topic: data.topic,
          userPrompt: data.prompt || data.topic,
          targetRegion,
          queryEmbedding: queryVector || undefined,
          attachedDocuments: parsedDocuments,
          providedUrls: data.externalUrls || data.referencedUrls || [],
          onProgress: async (step, pct) => {
            const scaledPct = Math.round(20 + (pct / 100) * 15);
            await StudioContextHelper.emitProgress(tenantId, jobId, scaledPct, step);
          },
        });
        researchJobId = researchResult.jobId;
        groundedEvidenceText = researchResult.groundedContextText;
        evidenceMap = researchResult.evidenceIdMap;
      } catch (researchErr: any) {
        console.warn(
          `[StudioProcessor] Autonomous research error, fallback ke RAG dasar: ${researchErr.message}`
        );
      }

      const similarChunks = queryVector
        ? await findSimilarKnowledgeChunks(queryVector, 3, targetRegion, 0.6)
        : [];

      const baseContext = ContextCapsuleBuilder.assembleContext({
        regionName: `${dapilName} (${targetRegion})`,
        regulations: similarChunks.map((c) => ({
          reference: c.structuralReference,
          content: c.chunkContent,
        })),
        recentNews: [],
        comparisonRegionData: data.comparisonRegion
          ? `Perbandingan: ${data.comparisonRegion}`
          : undefined,
        attachedDocuments: parsedDocuments,
        framingStance: data.framingStance,
      });

      const contextPayload = groundedEvidenceText
        ? `${baseContext}\n\n${groundedEvidenceText}`
        : baseContext;

      // -----------------------------------------------------------------------
      // LANGKAH 2 (50%): Sintesis Naskah Kebijakan Panjang (GPT-4o)
      // -----------------------------------------------------------------------
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        35,
        'Menyusun Naskah Kebijakan Modular Berantai...'
      );

      const generatedArticle = await aiEngine.generateArticle({
        topic: data.topic,
        regionalContextData: contextPayload,
        targetAudience: data.targetAudience,
        targetLength: data.targetLength,
        writingStyle: data.writingStyle,
        framingStance: data.framingStance,
        toneOverride: data.toneOverride,
        tenantId,
        onProgress: async (step, pct) => {
          await StudioContextHelper.emitProgress(tenantId, jobId, pct, step);
        },
      });

      // -----------------------------------------------------------------------
      // LANGKAH 2B: Deterministic Quality Control Gate & BR-05 Self-Healing Gate
      // -----------------------------------------------------------------------
      const validEvidenceKeys = new Set(evidenceMap.keys());
      let qcResult = DeterministicQualityGates.verifyCitationQualityControl(
        generatedArticle.contentMarkdown,
        validEvidenceKeys
      );

      // BR-05: Self-Healing Anti-Rogue Citation Gate
      if (qcResult.rogueCitations && qcResult.rogueCitations.length > 0) {
        console.warn(
          `[StudioProcessor] Terdeteksi ${qcResult.rogueCitations.length} rogue citation fiktif: [${qcResult.rogueCitations.join(', ')}]. Menjalankan Self-Healing Citation Gate...`
        );
        let healedMarkdown = generatedArticle.contentMarkdown;
        for (const rogueId of qcResult.rogueCitations) {
          const escaped = rogueId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const rogueRegex = new RegExp(`\\[(?:\\^|Bukti:?\\s*)?${escaped}\\]`, 'gi');
          healedMarkdown = healedMarkdown.replace(rogueRegex, '');
        }
        healedMarkdown = healedMarkdown.replace(/[ \t]{2,}([.,;])/g, '$1');
        generatedArticle.contentMarkdown = healedMarkdown;

        // Re-evaluasi QC setelah pembersihan deterministik
        qcResult = DeterministicQualityGates.verifyCitationQualityControl(
          generatedArticle.contentMarkdown,
          validEvidenceKeys
        );
      }

      if (researchJobId) {
        try {
          await db
            .update(researchJobs)
            .set({
              qcPassed: qcResult.qcPassed,
              status: ResearchJobStatus.COMPLETED,
              updatedAt: new Date(),
            })
            .where(eq(researchJobs.id, researchJobId));

          await db.insert(researchOutputs).values({
            researchJobId,
            title: generatedArticle.title,
            executiveSummary: generatedArticle.excerpt,
            markdownBody: generatedArticle.contentMarkdown,
            bibliographyJson: Array.from(evidenceMap.entries()).map(([token, spanId]) => ({
              citationToken: token,
              evidenceSpanId: spanId,
            })),
            qcReport: qcResult,
          });
        } catch (dbErr: any) {
          console.warn(`[StudioProcessor] Gagal menyimpan research outputs: ${dbErr.message}`);
        }
      }

      let socialPack = {
        instagramCaption: '',
        twitterThreads: [] as string[],
        whatsappBroadcast: `*${generatedArticle.title}*\n\n${generatedArticle.excerpt}`,
      };
      try {
        const generatedSocialPack = await aiEngine.generateSocialSnippets(
          generatedArticle.contentMarkdown
        );
        socialPack = {
          instagramCaption: generatedSocialPack.instagramCaption || '',
          twitterThreads: generatedSocialPack.twitterThreads || [],
          whatsappBroadcast:
            generatedSocialPack.whatsappBroadcast || socialPack.whatsappBroadcast,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[StudioProcessor] Social pack gagal dibuat; memakai ringkasan artikel: ${message}`
        );
      }

      // Commit naskah artikel sebelum operasi gambar opsional
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        69,
        'Menyimpan naskah dan paket teks...'
      );
      const textCostUsd = AiCostCalculator.calculateCostUsd(generatedArticle.totalTokensUsed, 0);

      // Self-healing sanitizer untuk rogue citations (Defect 6)
      let finalMarkdown = generatedArticle.contentMarkdown;
      if (qcResult.rogueCitations && qcResult.rogueCitations.length > 0) {
        console.warn(
          `[StudioProcessor] Menghapus ${qcResult.rogueCitations.length} rogue citation dari naskah: ${qcResult.rogueCitations.join(', ')}`
        );
        for (const rogueId of qcResult.rogueCitations) {
          const rogueRegex = new RegExp(`\\[(?:\\^|Bukti:?\\s*)?${rogueId}\\]`, 'gi');
          finalMarkdown = finalMarkdown.replace(rogueRegex, '');
        }
      }

      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(contentPublications)
          .set({
            title: generatedArticle.title,
            excerpt: generatedArticle.excerpt,
            bodyContentMarkdown: finalMarkdown,
            wordCount: generatedArticle.wordCount,
            status: ContentStatus.DRAFT,
            researchJobId: researchJobId || null,
            updatedAt: new Date(),
          })
          .where(eq(contentPublications.id, publicationId));

        const currentMonth = new Date().toISOString().slice(0, 7);

        await tx
          .insert(tenantQuotaLedgers)
          .values({
            tenantId,
            billingCycleMonth: currentMonth,
            articleLimit: 0,
            articleUsed: 1,
            dalleLimit: 0,
            dalleUsed: 0,
            totalTokensConsumed: generatedArticle.totalTokensUsed,
            estimatedCostUsd: String(textCostUsd),
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              articleUsed: sql`${tenantQuotaLedgers.articleUsed} + 1`,
              totalTokensConsumed: sql`${tenantQuotaLedgers.totalTokensConsumed} + ${generatedArticle.totalTokensUsed}`,
              estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${textCostUsd}`,
              updatedAt: new Date(),
            },
          });

        await tx
          .insert(socialSyndicationPacks)
          .values({
            publicationId,
            instagramCaption: socialPack.instagramCaption,
            twitterThreads: socialPack.twitterThreads,
            whatsappBroadcastText: socialPack.whatsappBroadcast,
          })
          .onConflictDoUpdate({
            target: socialSyndicationPacks.publicationId,
            set: {
              instagramCaption: socialPack.instagramCaption,
              twitterThreads: socialPack.twitterThreads,
              whatsappBroadcastText: socialPack.whatsappBroadcast,
            },
          });
      });

      // PROGRESSIVE INSTANT DELIVERY: Naskah teks 100% siap di database!
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        70,
        'Naskah kebijakan telah tersimpan. Merender materi visual...',
        'RUNNING',
        undefined,
        undefined,
        true,
        publicationId
      );

      let posterSucceeded = !data.generateDallePoster;
      let posterFailure: string | undefined;
      if (data.generateDallePoster) {
        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          85,
          'Merender poster visual berestetika tinggi; naskah telah tersimpan...'
        );
        try {
          const headlineText = data.headline || generatedArticle.title;
          const quoteText = generatedArticle.excerpt?.slice(0, 160) || '';

          // Keputusan Desain Mutlak: AI tidak merender wajah tokoh dan sistem tidak menaruh foto tokoh pada poster
          const subjectPhotoBuffer: Buffer | undefined = undefined;
          const compositionMode: 'PUBLIC_ADVOCACY' = 'PUBLIC_ADVOCACY';

          const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
            tenantId,
            member?.partyAffiliation
          );

          // 2. Ekstrak latar belakang berseni dan fakta kontekstual terstruktur
          const cleanTopic = (generatedArticle.title || data.topic || '').trim();
          const articleExcerpt = generatedArticle.excerpt || '';
          const articleSnippet = (generatedArticle.contentMarkdown || '').slice(0, 1200);
          const evidenceSnippet = (groundedEvidenceText || '').slice(0, 1000);

          const cleanContextSummary = [
            `JUDUL & RINGKASAN EKSEKUTIF ARTIKEL: ${generatedArticle.title} — ${articleExcerpt}`,
            articleSnippet ? `CUPLIKAN ISI & DATA ARTIKEL:\n${articleSnippet}` : '',
            evidenceSnippet ? `BUKTI RISET TERVERIFIKASI:\n${evidenceSnippet}` : '',
          ]
            .filter(Boolean)
            .join('\n\n')
            .trim();

          let posterBuffer: Buffer | undefined;
          let posterSizeBytes = 0;
          let promptUsedJson = '';
          const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

          const useArtCollageEngine = process.env.POSTER_ENGINE_MODE !== 'legacy';

          if (useArtCollageEngine) {
            try {
              console.log(
                `[StudioProcessor] Menjalankan Art-Collage Pipeline v3 (Zero-Box + Vision Locator)...`
              );
              const artCollage = await aiEngine.generateArtCollagePoster({
                topic: cleanTopic,
                groundedContextSummary: cleanContextSummary,
                forcedArchetype: (data.forcedArchetype as any) || undefined,
                tenantBrandHex,
                tenantId,
                variationKey: `${publicationId}:${jobId}`,
              });

              const memberSignature = member?.fullName
                ? `${member.fullName} — ${member.commissionName || 'KOMISI DPR RI'} // ${dapilName}`
                : `ANGGOTA DEWAN // ${dapilName}`;

              let composed: { buffer: Buffer; sizeBytes: number; detectedLuminance: number; blendModeUsed: string };
              try {
                composed = await ChromiumPosterCompositor.compose({
                  canvasBuffer: artCollage.imageBuffer,
                  copy: artCollage.copy,
                  zones: artCollage.layout,
                  palette: {
                    accentHex: artCollage.mutation.palette.accentHex,
                    secondaryHex: artCollage.mutation.palette.secondaryHex,
                  },
                  signature: memberSignature,
                  editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
                  textToneHint: artCollage.layout.textTone,
                });
              } catch (chromErr: any) {
                console.warn(`[StudioProcessor] Chromium compositor gagal (${chromErr.message}), fallback ke Sharp compositor...`);
                composed = await ArtCollageCompositor.compose({
                  canvasBuffer: artCollage.imageBuffer,
                  copy: artCollage.copy,
                  zones: artCollage.layout,
                  palette: {
                    accentHex: artCollage.mutation.palette.accentHex,
                    secondaryHex: artCollage.mutation.palette.secondaryHex,
                  },
                  signature: memberSignature,
                  editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
                  textToneHint: artCollage.layout.textTone,
                });
              }

              posterBuffer = composed.buffer;
              posterSizeBytes = composed.sizeBytes;
              promptUsedJson = JSON.stringify({
                engine: 'ART_COLLAGE_V3',
                blueprintId: artCollage.blueprintId,
                archetype: artCollage.archetype,
                referenceFile: artCollage.referenceFile,
                usedStyleReference: artCollage.usedStyleReference,
                mutation: artCollage.mutation,
                layout: artCollage.layout,
                imagePrompt: artCollage.imagePrompt,
                imageProvider: artCollage.imageProvider,
                detectedLuminance: composed.detectedLuminance,
                blendModeUsed: composed.blendModeUsed,
              });
            } catch (artCollageErr: any) {
              console.warn(
                `[StudioProcessor] Art-Collage engine mengalami kendala (${artCollageErr.message}), beralih ke engine cadangan...`
              );
            }
          }

          // Fallback legacy bila mode legacy dipaksa atau art-collage gagal
          if (!posterBuffer) {
            const backgroundResult = await aiEngine.generateCreativePosterBackground({
              topic: cleanTopic,
              groundedContextSummary: cleanContextSummary,
              compositionMode,
              forcedArchetype: (data.forcedArchetype as any) || undefined,
              tenantBrandHex,
              tenantId,
            });

            let backgroundBuffer: Buffer;
            if (backgroundResult.temporaryImageUrl.startsWith('data:')) {
              const base64Part = backgroundResult.temporaryImageUrl.split(',')[1] || '';
              backgroundBuffer = Buffer.from(base64Part, 'base64');
            } else {
              const resp = await fetch(backgroundResult.temporaryImageUrl);
              backgroundBuffer = Buffer.from(await resp.arrayBuffer());
            }

            const composedPoster = await CreativePosterCompositor.composePoster({
              backgroundBuffer,
              subjectPhotoBuffer,
              headline: headlineText,
              quote: quoteText,
              memberName: member?.fullName || 'ANGGOTA DEWAN',
              memberTitle: `${member?.commissionName || 'KOMISI DPR RI'} // ${dapilName}`,
              archetype: backgroundResult.blueprint.archetype,
              compositionMode,
              synthesizedCopy: backgroundResult.compiledPrompt.synthesizedCopy,
              primaryAccentColor:
                backgroundResult.compiledPrompt.synthesizedCopy?.primaryAccent ||
                backgroundResult.blueprint.colorPalette.primaryAccent ||
                tenantBrandHex,
              secondaryAccentColor:
                backgroundResult.compiledPrompt.synthesizedCopy?.secondaryAccent ||
                backgroundResult.blueprint.colorPalette.secondaryAccent,
              canvasWidth: backgroundResult.compiledPrompt.canvasDimensions.width,
              canvasHeight: backgroundResult.compiledPrompt.canvasDimensions.height,
              editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
              outputFormat: 'webp',
              compositionPlan: backgroundResult.compiledPrompt.compositionPlan,
              enableVisualQA: true,
              autoHealContrast: true,
            });

            if (composedPoster.qaReport) {
              AiTelemetryService.recordPosterQAMetrics({
                tenantId,
                archetype: backgroundResult.blueprint.archetype,
                score: composedPoster.qaReport.score,
                passed: composedPoster.qaReport.passed,
                issues: composedPoster.qaReport.issues,
                metrics: composedPoster.qaReport.metrics,
                recommendation: composedPoster.qaReport.recommendation,
              }).catch((telErr) =>
                console.warn('[StudioProcessor] QA telemetry write skipped:', telErr?.message)
              );
            }

            posterBuffer = composedPoster.buffer;
            posterSizeBytes = composedPoster.sizeBytes;
            promptUsedJson = JSON.stringify({
              blueprintId: backgroundResult.blueprint.id,
              blueprint: backgroundResult.blueprint.name,
              archetype: backgroundResult.blueprint.archetype,
              compositionPlan: backgroundResult.compiledPrompt.compositionPlan,
              compiledPrompt: backgroundResult.compiledPrompt.englishPrompt,
              qaReport: composedPoster.qaReport,
            });
          }

          // 5. Unggah hasil komposit ke Cloudflare R2
          let finalPublicUrl = '';
          let finalSizeBytes = posterSizeBytes;

          try {
            const uploadResult = await storageAdapter.uploadBuffer(posterBuffer, {
              destinationPath: destPath,
              contentType: 'image/webp',
              contentLength: posterSizeBytes,
            });
            finalPublicUrl = uploadResult.publicUrl;
          } catch (storageErr) {
            console.warn(
              `[StudioProcessor] GCS/R2 buffer upload gagal, beralih ke data base64:`,
              storageErr
            );
            finalPublicUrl = `data:image/webp;base64,${posterBuffer.toString('base64')}`;
          }

          await withTenantContext(tenantId, async (tx) => {
            await tx
              .delete(mediaAssets)
              .where(
                and(
                  eq(mediaAssets.publicationId, publicationId),
                  eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
                )
              );

            await tx.insert(mediaAssets).values({
              publicationId,
              assetType: AssetType.DALLE_POSTER,
              r2StorageUrl: finalPublicUrl,
              cdnPublicUrl: finalPublicUrl,
              promptUsed: promptUsedJson,
              mimeType: 'image/webp',
              fileSizeBytes: finalSizeBytes,
            });

            await tx
              .update(tenantQuotaLedgers)
              .set({
                dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + 1`,
                estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${AiCostCalculator.DALLE3_COST_PER_IMAGE_USD}`,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(tenantQuotaLedgers.tenantId, tenantId),
                  eq(tenantQuotaLedgers.billingCycleMonth, new Date().toISOString().slice(0, 7))
                )
              );
          });
          posterSucceeded = true;
        } catch (error: unknown) {
          posterSucceeded = false;
          posterFailure = error instanceof Error ? error.message : String(error);
          console.warn(`[StudioProcessor] Poster gagal; naskah tetap tersimpan: ${posterFailure}`);
        }
      }

      const completionStep = posterSucceeded
        ? 'Selesai! Naskah dan materi yang tersedia siap ditinjau.'
        : 'Naskah artikel berhasil dibuat (Poster visual tertunda).';
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        completionStep,
        'COMPLETED',
        `/studio/artikel`,
        posterFailure
      );

      await StudioContextHelper.emitNotification(
        tenantId,
        posterSucceeded ? 'Naskah Kebijakan Selesai!' : 'Naskah Tersimpan, Poster Tertunda',
        posterSucceeded
          ? `Naskah "${generatedArticle.title}" siap ditinjau di Studio Artikel.`
          : `Naskah "${generatedArticle.title}" berhasil dibuat dan tersimpan. Poster visual dapat dibuat ulang nanti.`
      );

      console.log(
        `[StudioProcessor] Tugas asinkron #${job.id} selesai 100% dengan sukses. Canonical Trace ID: ${generatedArticle.canonicalTraceId}`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[StudioProcessor] Kegagalan langkah kritis job #${job.id}: ${message}`);

      await withTenantContext(tenantId, async (tx) =>
        tx
          .update(contentPublications)
          .set({
            status: ContentStatus.DRAFT,
            excerpt: `[Pemrosesan Tertunda] ${message.slice(0, 450)}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(contentPublications.id, publicationId),
              eq(contentPublications.status, ContentStatus.GENERATING)
            )
          )
      ).catch(() => null);

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        `Pemrosesan tertunda: ${message}`,
        'FAILED',
        undefined,
        message
      );
      throw error;
    }
  }
}
