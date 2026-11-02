import {
  DynamicContentArchitect,
  GeneratedInfographicContent,
  GenerateInfographicContentParams,
} from './dynamic-content-architect.js';
import {
  DynamicVisualGenerator,
  VisualAssetsBundle,
} from './dynamic-visual-generator.js';
import { DynamicVisionSynthesizer } from './dynamic-vision-synthesizer.js';
import type { DynamicInfographicLayoutSpec } from './dynamic-layout.types.js';

export interface PrepareDynamicInfographicOptions extends GenerateInfographicContentParams {
  referenceTemplatePath?: string;
  onProgress?: (percent: number, status: string) => Promise<void> | void;
}

export interface PreparedDynamicInfographic {
  content: GeneratedInfographicContent;
  visualAssets: VisualAssetsBundle;
  layoutSpec: DynamicInfographicLayoutSpec;
}

export class DynamicInfographicOrchestrator {
  /**
   * Menjalankan 3 langkah AI autonomous infographic generation
   * (Langkah 4: Komposisi grafis dijalankan oleh DynamicInfographicCompositor di layer storage)
   */
  public static async prepare(
    options: PrepareDynamicInfographicOptions
  ): Promise<PreparedDynamicInfographic> {
    const {
      topic,
      dapilName,
      targetRegion,
      memberName,
      memberTitle,
      ragContextSummary,
      referenceTemplatePath,
      onProgress,
    } = options;

    // =========================================================================
    // LANGKAH 1: AI MENULIS ISI KONTEN REDAKSI INFOGRAFIS
    // =========================================================================
    if (onProgress) await onProgress(15, 'AI merumuskan isi naskah editorial & struktur kronik...');
    console.log('[DynamicInfographic] Langkah 1: Merumuskan isi konten editorial...');

    const content = await DynamicContentArchitect.generateContent({
      topic,
      dapilName,
      targetRegion,
      memberName,
      memberTitle,
      ragContextSummary,
    });

    // =========================================================================
    // LANGKAH 2: GENERATE & SIAPKAN GAMBAR VISUAL UNTUK ISI KONTEN
    // =========================================================================
    if (onProgress) await onProgress(40, 'AI mengenerate gambar visual & ilustrasi tematik...');
    console.log('[DynamicInfographic] Langkah 2: Mengenerate gambar visual...');

    const visualAssets = await DynamicVisualGenerator.prepareVisualAssets();

    // =========================================================================
    // LANGKAH 3: AI MEMBUAT LAYOUT DENGAN MELIHAT TEMPLATE REFERENSI (VISION)
    // =========================================================================
    if (onProgress) await onProgress(65, 'AI Vision menganalisis template & merancang layout spasial...');
    console.log('[DynamicInfographic] Langkah 3: AI Vision menganalisis template referensi...');

    const layoutSpec = await DynamicVisionSynthesizer.synthesizeLayoutFromTemplate(
      referenceTemplatePath,
      {
        mainTitle: content.mainTitle,
        sectionCount: content.sections.length,
      }
    );

    return {
      content,
      visualAssets,
      layoutSpec,
    };
  }
}
