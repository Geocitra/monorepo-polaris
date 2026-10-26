import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import {
  db,
  contentPublications,
  researchJobs,
  researchQuestions,
  sources,
  sourceVersions,
  evidenceSpans,
  claims,
  researchOutputs,
  researchJobSources,
} from '@polaris/database';

@Injectable()
export class StudioResearchService {
  /**
   * Mengambil data jejak audit riset, rujukan, bukti kutipan, dan laporan QC untuk sebuah naskah artikel
   */
  async getArticleResearchAuditTrail(tenantId: string, articleId: string) {
    const [pub] = await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        researchJobId: contentPublications.researchJobId,
      })
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!pub) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    if (!pub.researchJobId) {
      return {
        hasResearchJob: false,
        message: 'Artikel ini tidak menggunakan sesi riset otonom terpisah.',
      };
    }

    const [job] = await db
      .select()
      .from(researchJobs)
      .where(eq(researchJobs.id, pub.researchJobId))
      .limit(1);

    const questions = await db
      .select()
      .from(researchQuestions)
      .where(eq(researchQuestions.researchJobId, pub.researchJobId));

    // Ambil sumber-sumber yang diikutsertakan
    const jobSources = await db
      .select({
        sourceId: sources.id,
        url: sources.url,
        canonicalUrl: sources.canonicalUrl,
        publisherName: sources.publisherName,
        publisherType: sources.publisherType,
        publisherCredibilityScore: sources.publisherCredibilityScore,
        doi: sources.doi,
        isPeerReviewed: sources.isPeerReviewed,
        lifecycleStatus: sources.lifecycleStatus,
        relevanceScore: researchJobSources.relevanceScore,
        retrievedAt: sources.retrievedAt,
      })
      .from(researchJobSources)
      .innerJoin(sources, eq(researchJobSources.sourceId, sources.id))
      .where(eq(researchJobSources.researchJobId, pub.researchJobId));

    // Ambil versi snapshot untuk setiap sumber (Mitigasi Risiko Link Rot!)
    const sourceIds = jobSources.map((s) => s.sourceId);
    let versions: any[] = [];
    if (sourceIds.length > 0) {
      versions = await db
        .select({
          id: sourceVersions.id,
          sourceId: sourceVersions.sourceId,
          contentHash: sourceVersions.contentHash,
          title: sourceVersions.title,
          extractedText: sourceVersions.extractedText,
          fetchedAt: sourceVersions.fetchedAt,
        })
        .from(sourceVersions)
        .where(inArray(sourceVersions.sourceId, sourceIds));
    }

    // Ambil bukti kutipan konkret (Evidence Spans)
    let spans: any[] = [];
    if (sourceIds.length > 0) {
      spans = await db
        .select()
        .from(evidenceSpans)
        .where(inArray(evidenceSpans.sourceId, sourceIds));
    }

    // Ambil claims
    const claimList = await db
      .select()
      .from(claims)
      .where(eq(claims.researchJobId, pub.researchJobId));

    // Ambil research output & QC report
    const [output] = await db
      .select()
      .from(researchOutputs)
      .where(eq(researchOutputs.researchJobId, pub.researchJobId))
      .limit(1);

    // Gabungkan data versi snapshot ke jobSources
    const enrichedSources = jobSources.map((s) => {
      const v = versions.find((ver) => ver.sourceId === s.sourceId);
      return {
        ...s,
        cachedSnapshot: v
          ? {
              versionId: v.id,
              title: v.title,
              contentHash: v.contentHash,
              snippet: v.extractedText.slice(0, 1000),
              fetchedAt: v.fetchedAt,
            }
          : null,
      };
    });

    return {
      hasResearchJob: true,
      job: {
        id: job?.id,
        topic: job?.topic,
        status: job?.status,
        evidenceSufficient: job?.evidenceSufficient,
        qcPassed: job?.qcPassed,
        summaryReport: job?.summaryReport,
        createdAt: job?.createdAt,
      },
      questions,
      sources: enrichedSources,
      evidenceSpans: spans,
      claims: claimList,
      qcReport: output?.qcReport || null,
      bibliography: output?.bibliographyJson || [],
    };
  }

  /**
   * Menambahkan rujukan / sumber internal secara manual oleh Staf Ahli (Mitigasi Kontrol Pengguna)
   */
  async addManualResearchSource(
    tenantId: string,
    articleId: string,
    dto: { url: string; title: string; publisherName: string; notes?: string }
  ) {
    const [pub] = await db
      .select({ id: contentPublications.id, researchJobId: contentPublications.researchJobId })
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!pub) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    let jobId = pub.researchJobId;
    if (!jobId) {
      const [newJob] = await db
        .insert(researchJobs)
        .values({
          tenantId,
          topic: 'Riset Manual Dewan',
          userPrompt: 'Penyusunan Rujukan Manual',
          targetRegion: 'NASIONAL',
          status: 'COMPLETED',
          evidenceSufficient: true,
          qcPassed: true,
        })
        .returning();
      jobId = newJob.id;
      await db
        .update(contentPublications)
        .set({ researchJobId: jobId })
        .where(eq(contentPublications.id, articleId));
    }

    const [src] = await db
      .insert(sources)
      .values({
        url: dto.url,
        canonicalUrl: dto.url,
        sourceType: 'USER_ATTACHMENT',
        publisherName: dto.publisherName,
        publisherType: 'USER',
        publisherCredibilityScore: 0.9,
        lifecycleStatus: 'VERIFIED',
      })
      .returning();

    await db.insert(researchJobSources).values({
      researchJobId: jobId,
      sourceId: src.id,
      relevanceScore: 1.0,
      queryUsed: 'Manual Added by Staff',
    });

    return { success: true, source: src };
  }

  /**
   * Menghapus rujukan dari naskah artikel
   */
  async deleteResearchSource(tenantId: string, articleId: string, sourceId: string) {
    const [pub] = await db
      .select({ id: contentPublications.id, researchJobId: contentPublications.researchJobId })
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!pub || !pub.researchJobId) {
      throw new NotFoundException('Artikel atau sesi riset tidak ditemukan.');
    }

    await db
      .delete(researchJobSources)
      .where(
        and(
          eq(researchJobSources.researchJobId, pub.researchJobId),
          eq(researchJobSources.sourceId, sourceId)
        )
      );

    return { success: true };
  }
}
