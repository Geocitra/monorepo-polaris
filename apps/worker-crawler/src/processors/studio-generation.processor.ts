import { Job } from 'bullmq';
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

    if (data.taskType === 'REGENERATE_POSTER') {
      await StudioPosterRegenerationHandler.execute(
        job,
        this.aiEngine,
        this.storageAdapter
      );
      return;
    }

    if (data.taskType === 'INFOGRAPHIC_ONLY') {
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
