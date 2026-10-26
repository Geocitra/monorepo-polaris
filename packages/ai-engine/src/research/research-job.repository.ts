import {
  db,
  researchJobs,
  researchQuestions,
  sources,
  researchJobSources,
  sourceVersions,
  sourceAssessments,
  evidenceSpans,
  claims,
  claimEvidence,
  eq,
} from '@polaris/database';
import {
  ResearchJobStatus,
  SourceType,
  PublisherType,
  SourceLifecycle,
} from '@polaris/shared-types';
import {
  IResearchJobRepositoryPort,
  CreateResearchJobDto,
  ResearchQuestionDto,
  InsertedResearchQuestion,
  RegisteredSourceItem,
  SaveClaimEvidenceParams,
  SaveClaimEvidenceResult,
} from '@polaris/core-domain';
import { WebDiscoveryConnector } from './connectors/web-discovery.connector.js';

export class DrizzleResearchJobRepository implements IResearchJobRepositoryPort {
  public async createJob(input: CreateResearchJobDto): Promise<{ id: string }> {
    const [job] = await db
      .insert(researchJobs)
      .values({
        tenantId: input.tenantId,
        topic: input.topic,
        userPrompt: input.userPrompt,
        targetRegion: input.targetRegion,
        status: (input.status as any) || ResearchJobStatus.PLANNING,
      })
      .returning();

    return { id: job.id };
  }

  public async saveQuestions(
    jobId: string,
    questions: ResearchQuestionDto[]
  ): Promise<InsertedResearchQuestion[]> {
    const insertedQuestions: InsertedResearchQuestion[] = [];
    await db.transaction(async (tx) => {
      for (const q of questions) {
        const [qRow] = await tx
          .insert(researchQuestions)
          .values({
            researchJobId: jobId,
            question: q.question,
            intentCategory: q.intentCategory as any,
            temporalBound: q.temporalBound,
            geographicScope: q.geographicScope,
            minRequiredEvidence: q.minRequiredEvidence || 1,
          })
          .returning();
        insertedQuestions.push({
          id: qRow.id,
          question: qRow.question,
          minRequiredEvidence: qRow.minRequiredEvidence,
        });
      }
    });
    return insertedQuestions;
  }

  public async updateJobStatus(jobId: string, status: string): Promise<void> {
    await db
      .update(researchJobs)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(researchJobs.id, jobId));
  }

  public async saveRegulationSources(
    jobId: string,
    regulations: any[]
  ): Promise<RegisteredSourceItem[]> {
    if (!regulations || regulations.length === 0) return [];

    const evaluatedSources: RegisteredSourceItem[] = [];
    await db.transaction(async (tx) => {
      for (const reg of regulations) {
        const url = `internal://regulation/${reg.documentId}`;
        const [s] = await tx
          .insert(sources)
          .values({
            url,
            canonicalUrl: url,
            sourceType: SourceType.INTERNAL_REGULATION,
            publisherName: 'Pemerintah Daerah / JDIH',
            publisherType: PublisherType.GOVERNMENT,
            publisherCredibilityScore: 0.95,
            lifecycleStatus: SourceLifecycle.VERIFIED,
          })
          .onConflictDoUpdate({
            target: sources.url,
            set: {
              retrievedAt: new Date(),
              lifecycleStatus: SourceLifecycle.VERIFIED,
            },
          })
          .returning();

        const contentHash = WebDiscoveryConnector.hashContent(reg.chunkContent);
        const [sv] = await tx
          .insert(sourceVersions)
          .values({
            sourceId: s.id,
            contentHash,
            title: reg.structuralReference,
            extractedText: reg.chunkContent,
            httpStatus: 200,
          })
          .onConflictDoUpdate({
            target: [sourceVersions.sourceId, sourceVersions.contentHash],
            set: {
              title: reg.structuralReference,
              extractedText: reg.chunkContent,
            },
          })
          .returning();

        await tx
          .insert(researchJobSources)
          .values({
            researchJobId: jobId,
            sourceId: s.id,
            relevanceScore: reg.similarityScore,
            queryUsed: 'Vector HNSW Cosine Search',
          })
          .onConflictDoNothing();

        evaluatedSources.push({
          sourceId: s.id,
          versionId: sv.id,
          title: reg.structuralReference,
          url: s.url,
          publisherName: 'JDIH / Regulasi Daerah',
          extractedText: reg.chunkContent,
          isAccepted: true,
        });
      }
    });
    return evaluatedSources;
  }

  public async saveNewsSources(
    jobId: string,
    news: any[]
  ): Promise<RegisteredSourceItem[]> {
    if (!news || news.length === 0) return [];

    const evaluatedSources: RegisteredSourceItem[] = [];
    await db.transaction(async (tx) => {
      for (const item of news) {
        const [s] = await tx
          .insert(sources)
          .values({
            url: item.originalUrl,
            canonicalUrl: item.originalUrl,
            sourceType: SourceType.INTERNAL_NEWS,
            publisherName: item.portalName,
            publisherType: PublisherType.MEDIA,
            publisherCredibilityScore: 0.8,
            lifecycleStatus: SourceLifecycle.VERIFIED,
          })
          .onConflictDoUpdate({
            target: sources.url,
            set: {
              retrievedAt: new Date(),
              lifecycleStatus: SourceLifecycle.VERIFIED,
            },
          })
          .returning();

        const contentHash = WebDiscoveryConnector.hashContent(item.cleanSummary);
        const [sv] = await tx
          .insert(sourceVersions)
          .values({
            sourceId: s.id,
            contentHash,
            title: item.articleTitle,
            extractedText: item.cleanSummary,
            httpStatus: 200,
          })
          .onConflictDoUpdate({
            target: [sourceVersions.sourceId, sourceVersions.contentHash],
            set: {
              title: item.articleTitle,
              extractedText: item.cleanSummary,
            },
          })
          .returning();

        await tx
          .insert(researchJobSources)
          .values({
            researchJobId: jobId,
            sourceId: s.id,
            relevanceScore: 0.8,
            queryUsed: 'Civic Media Diskursus Filter',
          })
          .onConflictDoNothing();

        evaluatedSources.push({
          sourceId: s.id,
          versionId: sv.id,
          title: item.articleTitle,
          url: s.url,
          publisherName: item.portalName,
          extractedText: item.cleanSummary,
          isAccepted: true,
        });
      }
    });
    return evaluatedSources;
  }

  public async saveAcademicSource(
    jobId: string,
    paper: any,
    assessment: any,
    queryUsed: string
  ): Promise<RegisteredSourceItem> {
    const textBody = `${paper.title}. Penulis: ${paper.authors.join(', ')} (${paper.publicationYear || 'N/A'}). Jurnal: ${paper.journalTitle || ''}. ${paper.abstractSnippet || ''}`;

    let evaluatedItem: RegisteredSourceItem | null = null;
    await db.transaction(async (tx) => {
      const [s] = await tx
        .insert(sources)
        .values({
          url: paper.url,
          canonicalUrl: `https://doi.org/${paper.doi}`,
          sourceType: SourceType.ACADEMIC_PAPER,
          publisherName: paper.journalTitle || 'Academic Publisher',
          publisherType: PublisherType.ACADEMIC,
          doi: paper.doi,
          isPeerReviewed: paper.isPeerReviewed,
          hasRetractionsOrCorrections: paper.hasRetractionsOrCorrections,
          publisherCredibilityScore: 0.88,
          lifecycleStatus: assessment.lifecycleStatus,
        })
        .onConflictDoUpdate({
          target: sources.url,
          set: {
            retrievedAt: new Date(),
            lifecycleStatus: assessment.lifecycleStatus,
          },
        })
        .returning();

      const contentHash = WebDiscoveryConnector.hashContent(textBody);
      const [sv] = await tx
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash,
          title: paper.title,
          extractedText: textBody,
          httpStatus: 200,
        })
        .onConflictDoUpdate({
          target: [sourceVersions.sourceId, sourceVersions.contentHash],
          set: {
            title: paper.title,
            extractedText: textBody,
          },
        })
        .returning();

      await tx.insert(sourceAssessments).values({
        sourceId: s.id,
        substantiveScore: assessment.substantiveScore,
        methodologyScore: assessment.methodologyScore,
        recencyScore: assessment.recencyScore,
        overallScore: assessment.overallScore,
        assessmentReason: assessment.assessmentReason,
        isAccepted: assessment.isAccepted,
      });

      await tx
        .insert(researchJobSources)
        .values({
          researchJobId: jobId,
          sourceId: s.id,
          relevanceScore: assessment.overallScore,
          queryUsed: queryUsed || 'Academic Query',
        })
        .onConflictDoNothing();

      evaluatedItem = {
        sourceId: s.id,
        versionId: sv.id,
        title: paper.title,
        url: paper.url,
        publisherName: paper.journalTitle || 'Jurnal Akademik',
        extractedText: textBody,
        isAccepted: assessment.isAccepted,
      };
    });

    return evaluatedItem!;
  }

  public async saveWebSource(
    jobId: string,
    web: any,
    assessment: any
  ): Promise<RegisteredSourceItem> {
    let evaluatedItem: RegisteredSourceItem | null = null;
    await db.transaction(async (tx) => {
      const [s] = await tx
        .insert(sources)
        .values({
          url: web.url,
          canonicalUrl: web.canonicalUrl,
          sourceType: SourceType.EXTERNAL_WEB,
          publisherName: web.publisherName,
          publisherType: PublisherType.MEDIA,
          lifecycleStatus: assessment.lifecycleStatus,
        })
        .onConflictDoUpdate({
          target: sources.url,
          set: {
            retrievedAt: new Date(),
            lifecycleStatus: assessment.lifecycleStatus,
          },
        })
        .returning();

      const [sv] = await tx
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash: web.contentHash,
          title: web.title,
          rawContent: web.rawContent,
          extractedText: web.extractedText,
          httpStatus: web.httpStatus,
        })
        .onConflictDoUpdate({
          target: [sourceVersions.sourceId, sourceVersions.contentHash],
          set: {
            title: web.title,
            rawContent: web.rawContent,
            extractedText: web.extractedText,
            httpStatus: web.httpStatus,
          },
        })
        .returning();

      await tx.insert(sourceAssessments).values({
        sourceId: s.id,
        substantiveScore: assessment.substantiveScore,
        methodologyScore: assessment.methodologyScore,
        recencyScore: assessment.recencyScore,
        overallScore: assessment.overallScore,
        assessmentReason: assessment.assessmentReason,
        isAccepted: assessment.isAccepted,
      });

      await tx
        .insert(researchJobSources)
        .values({
          researchJobId: jobId,
          sourceId: s.id,
          relevanceScore: assessment.overallScore,
          queryUsed: 'User Supplied URL',
        })
        .onConflictDoNothing();

      evaluatedItem = {
        sourceId: s.id,
        versionId: sv.id,
        title: web.title,
        url: web.url,
        publisherName: web.publisherName || web.domain,
        extractedText: web.extractedText,
        isAccepted: assessment.isAccepted,
      };
    });

    return evaluatedItem!;
  }

  public async saveAttachmentSource(
    jobId: string,
    doc: { name: string; extractedContent: string }
  ): Promise<RegisteredSourceItem> {
    let evaluatedItem: RegisteredSourceItem | null = null;
    await db.transaction(async (tx) => {
      const attachmentUrl = `attachment://${jobId}/${encodeURIComponent(doc.name)}`;
      const [s] = await tx
        .insert(sources)
        .values({
          url: attachmentUrl,
          canonicalUrl: attachmentUrl,
          sourceType: SourceType.USER_ATTACHMENT,
          publisherName: `Lampiran Pengguna (${doc.name})`,
          publisherType: PublisherType.USER,
          publisherCredibilityScore: 0.75,
          lifecycleStatus: SourceLifecycle.VERIFIED,
        })
        .onConflictDoUpdate({
          target: sources.url,
          set: {
            retrievedAt: new Date(),
            lifecycleStatus: SourceLifecycle.VERIFIED,
            publisherCredibilityScore: 0.75,
          },
        })
        .returning();

      const contentHash = WebDiscoveryConnector.hashContent(doc.extractedContent);
      const [sv] = await tx
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash,
          title: doc.name,
          extractedText: doc.extractedContent,
          httpStatus: 200,
        })
        .onConflictDoUpdate({
          target: [sourceVersions.sourceId, sourceVersions.contentHash],
          set: {
            title: doc.name,
            extractedText: doc.extractedContent,
          },
        })
        .returning();

      await tx
        .insert(researchJobSources)
        .values({
          researchJobId: jobId,
          sourceId: s.id,
          relevanceScore: 0.75,
          queryUsed: 'User Attachment Ingestion',
        })
        .onConflictDoNothing();

      evaluatedItem = {
        sourceId: s.id,
        versionId: sv.id,
        title: doc.name,
        url: s.url,
        publisherName: `Lampiran Pengguna (${doc.name})`,
        extractedText: doc.extractedContent,
        isAccepted: true,
      };
    });

    return evaluatedItem!;
  }

  public async saveClaimsAndEvidence(
    params: SaveClaimEvidenceParams
  ): Promise<SaveClaimEvidenceResult> {
    const { jobId, claims: extractedClaims, insertedQuestions } = params;
    const evidenceCountPerQuestion: Record<string, number> = {};
    const evidenceIdMap = new Map<string, string>();
    const evidenceDetailMap = new Map<string, { id: string; quote: string; context: string }>();
    let spanCounter = 1;

    await db.transaction(async (tx) => {
      for (const c of extractedClaims) {
        const targetQuestion =
          c.questionIndex && c.questionIndex > 0 && c.questionIndex <= insertedQuestions.length
            ? insertedQuestions[c.questionIndex - 1]
            : insertedQuestions[0];

        const [claimRow] = await tx
          .insert(claims)
          .values({
            researchJobId: jobId,
            researchQuestionId: targetQuestion?.id,
            claimStatement: c.claimStatement,
            status: c.status,
            confidenceScore: c.confidenceScore,
          })
          .returning();

        for (const ev of c.evidenceItems) {
          const shortToken = `EV-${spanCounter++}`;
          const [evSpan] = await tx
            .insert(evidenceSpans)
            .values({
              sourceId: ev.sourceId,
              verbatimQuote: ev.verbatimQuote,
              contextSnippet: ev.contextSnippet,
              sectionOrPage: ev.sectionOrPage,
              confidenceScore: 0.95,
              isVerified: true,
            })
            .returning();

          evidenceIdMap.set(shortToken, evSpan.id);
          evidenceDetailMap.set(shortToken, {
            id: evSpan.id,
            quote: ev.verbatimQuote,
            context: ev.contextSnippet,
          });

          await tx.insert(claimEvidence).values({
            claimId: claimRow.id,
            evidenceSpanId: evSpan.id,
            supportType: ev.supportType,
            relationshipExplanation: ev.relationshipExplanation,
          });

          if (targetQuestion) {
            evidenceCountPerQuestion[targetQuestion.id] =
              (evidenceCountPerQuestion[targetQuestion.id] || 0) + 1;
          }
        }
      }
    });

    return {
      evidenceCountPerQuestion,
      evidenceIdMap,
      evidenceDetailMap,
    };
  }

  public async updateJobSufficiency(
    jobId: string,
    isSufficient: boolean,
    summaryReport: string
  ): Promise<void> {
    await db
      .update(researchJobs)
      .set({
        evidenceSufficient: isSufficient,
        summaryReport,
        updatedAt: new Date(),
      })
      .where(eq(researchJobs.id, jobId));
  }

  public async markJobFailed(
    jobId: string,
    errorMessage: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await db
      .update(researchJobs)
      .set({
        status: ResearchJobStatus.FAILED,
        summaryReport: `Research pipeline failed: ${errorMessage}`,
        metadata: {
          failedAt: new Date().toISOString(),
          error: errorMessage,
          ...metadata,
        },
        updatedAt: new Date(),
      })
      .where(eq(researchJobs.id, jobId));
  }
}
