import { Job } from 'bullmq';
import { eq, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  tenantQuotaWallets,
  tenantQuotaTransactions,
} from '@polaris/database';
import { QuotaTransactionType, QuotaConsumptionChannel } from '@polaris/shared-types';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { StudioGenerationJobPayload } from '../queues/studio.queue.js';
import {
  StudioFullGenerationHandler,
  StudioPosterRegenerationHandler,
  StudioInfographicGenerationHandler,
  StudioContextHelper,
} from './studio/index.js';

/**
 * StudioGenerationProcessor (Dispatcher & Orchestrator)
 *
 * Menerapkan pola Orchestrator/Dispatcher modular untuk pemrosesan BullMQ:
 * - StudioFullGenerationHandler (Riset Otonom, Analisis Kebijakan Panjang, QC Sitasi, Poster)
 * - StudioPosterRegenerationHandler (Regenerasi Khusus Poster Visual)
 * - StudioInfographicGenerationHandler (Generasi Khusus Infografik Publik)
 */
export class StudioGenerationProcessor {
  private static readonly aiEngine = new OpenAIAIEngineAdapter();
  private static readonly storageAdapter = new CloudflareR2StorageAdapter();

  /**
   * Router utama untuk memproses pekerjaan generasi studio
   */
  public static async process(job: Job<StudioGenerationJobPayload>): Promise<void> {
    const data = job.data;

    try {
      if (data.taskType === 'REGENERATE_POSTER') {
        await StudioPosterRegenerationHandler.execute(
          job,
          this.aiEngine,
          this.storageAdapter
        );
        return;
      }

      if (data.taskType === 'INFOGRAPHIC_ONLY' || data.taskType === 'POSTER_ONLY') {
        await StudioInfographicGenerationHandler.execute(
          job,
          this.aiEngine,
          this.storageAdapter
        );
        return;
      }

      await StudioFullGenerationHandler.execute(
        job,
        this.aiEngine,
        this.storageAdapter
      );
    } catch (error) {
      const maxAttempts = job.opts?.attempts ?? 3;
      const isFinalAttempt = (job.attemptsMade ?? 0) + 1 >= maxAttempts;
      if (isFinalAttempt && data.taskType !== 'REGENERATE_POSTER') {
        await this.refundTerminalFailedPublicationQuota(data.tenantId, data.publicationId).catch(
          (refundErr) => {
            console.warn(
              `[StudioProcessor] Gagal auto-refund kuota saat kegagalan terminal PubID ${data.publicationId}:`,
              refundErr
            );
          }
        );
      }
      throw error;
    }
  }

  /**
   * Mengembalikan kuota secara otomatis jika pekerjaan generasi Studio gagal permanen
   * setelah seluruh retry BullMQ habis dan belum ada naskah/media yang berhasil disimpan.
   */
  private static async refundTerminalFailedPublicationQuota(
    tenantId: string,
    publicationId: string
  ): Promise<void> {
    if (!tenantId || !publicationId) return;

    const [pub] = await db
      .select({
        wordCount: contentPublications.wordCount,
        quotaCostDeducted: contentPublications.quotaCostDeducted,
        generationCheckpoints: contentPublications.generationCheckpoints,
      })
      .from(contentPublications)
      .where(eq(contentPublications.id, publicationId))
      .limit(1);

    if (!pub) return;

    const checkpoints = (pub.generationCheckpoints || {}) as Record<string, any>;
    if (checkpoints.quotaRefunded || checkpoints.articleDone || (pub.wordCount ?? 0) > 100) {
      return;
    }

    const existingAssets = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.publicationId, publicationId))
      .limit(1);

    if (existingAssets.length > 0) return;

    const refundAmount = pub.quotaCostDeducted ?? 0;
    if (refundAmount <= 0) return;

    const [wallet] = await db
      .select()
      .from(tenantQuotaWallets)
      .where(eq(tenantQuotaWallets.tenantId, tenantId))
      .limit(1);

    if (!wallet) return;

    const newRemaining = Math.min(
      wallet.totalQuotaAllocated,
      wallet.remainingQuota + refundAmount
    );

    await db
      .update(tenantQuotaWallets)
      .set({
        remainingQuota: newRemaining,
        updatedAt: new Date(),
      })
      .where(eq(tenantQuotaWallets.id, wallet.id));

    await db.insert(tenantQuotaTransactions).values({
      tenantId,
      publicationId,
      channel: QuotaConsumptionChannel.WEB_STUDIO,
      referenceCode: `WEB-${publicationId.slice(0, 8)}`,
      transactionType: QuotaTransactionType.REFUND_CANCELLED,
      amountDelta: refundAmount,
      balanceAfter: newRemaining,
      notes: `Refund otomatis kegagalan terminal worker BullMQ (PubID: ${publicationId.slice(0, 8)}, +${refundAmount} kuota)`,
    });

    await db
      .update(contentPublications)
      .set({
        quotaCostDeducted: 0,
        generationCheckpoints: { ...checkpoints, quotaRefunded: true },
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, publicationId));

    console.log(
      `[StudioProcessor] Auto-refund +${refundAmount} kuota berhasil untuk kegagalan terminal PubID ${publicationId}`
    );
  }

  /**
   * Backward-compatible delegation helpers
   */
  public static async resolveTenantBrandColor(tenantId: string, partyAffiliation?: string | null) {
    return await StudioContextHelper.resolveTenantBrandColor(tenantId, partyAffiliation);
  }

  public static async emitProgress(...args: Parameters<typeof StudioContextHelper.emitProgress>) {
    return await StudioContextHelper.emitProgress(...args);
  }

  public static async emitNotification(...args: Parameters<typeof StudioContextHelper.emitNotification>) {
    return await StudioContextHelper.emitNotification(...args);
  }
}
