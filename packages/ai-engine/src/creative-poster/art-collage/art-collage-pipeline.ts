/**
 * POLARIS Creative Poster Engine v2.0 - ART-COLLAGE POSTER PIPELINE
 *
 * Alur terpadu:
 * 1. Selector memilih archetype + blueprint referensi.
 * 2. ArtCollageDirector:
 *    - Sintesis copywriter kontekstual via LLM (headline, subhead, 3-5 points).
 *    - Compile image prompt deterministik berbasis ART_COLLAGE_DNA + variasi mutasi.
 *    - Membaca reference image (base64) dari disk jika ada.
 * 3. Imagen 3 generate poster art utuh (kertas, subjek kolase, visual, margin kosong).
 * 4. VisionLayoutLocator (Gemini Vision OCR):
 *    - Menganalisis gambar hasil render, mendeteksi zona teks kosong, warna background lokal,
 *      dan merekomendasikan koordinat box / layout Satori yang tepat.
 * 5. Composite Satori Zero-Box (HTML/CSS) -> SVG -> PNG (transparan, tanpa border/kotak).
 * 6. Sharp ink-blend overlay di atas base visual poster.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleImagenAdapter } from '../../adapters/google-imagen.adapter.js';
import { PosterBlueprintSelector } from '../selector.js';
import type { CreativePosterArchetype } from '../types.js';
import { isInfographicArchetype } from '@polaris/shared-types';
import {
  ART_COLLAGE_DNA,
  compileArtCollageImagePrompt,
  pickArtCollageMutation,
  seedFromString,
  synthesizeArtCollageCopy,
} from './art-collage-director.js';
import { VisionLayoutLocator } from './vision-layout-locator.js';
import type { ArtCollagePosterResult, ArtCollageCopy } from './art-collage.types.js';

const REFERENCE_DIR_CANDIDATES = [
  process.env.POSTER_REFERENCE_DIR,
  path.resolve(process.cwd(), 'uploads/references/poster'),
  path.resolve(process.cwd(), '../uploads/references/poster'),
  path.resolve(process.cwd(), '../../uploads/references/poster'),
  path.resolve(process.cwd(), '../../../uploads/references/poster'),
  path.resolve(process.cwd(), 'uploads/references/infografis'),
  path.resolve(process.cwd(), '../uploads/references/infografis'),
  path.resolve(process.cwd(), '../../uploads/references/infografis'),
  path.resolve(process.cwd(), '../../../uploads/references/infografis'),
  path.resolve(process.cwd(), 'apps/web-dashboard/public/templates/infografis'),
  path.resolve(process.cwd(), '../apps/web-dashboard/public/templates/infografis'),
  path.resolve(process.cwd(), '../../apps/web-dashboard/public/templates/infografis'),
].filter((d): d is string => !!d);

async function loadStyleReference(
  referenceFile: string
): Promise<{ mimeType: string; base64: string } | undefined> {
  if (process.env.POSTER_STYLE_REFERENCE === 'off' || !referenceFile) return undefined;
  for (const dir of REFERENCE_DIR_CANDIDATES) {
    try {
      const buf = await fs.readFile(path.join(dir, referenceFile));
      const ext = path.extname(referenceFile).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { mimeType, base64: buf.toString('base64') };
    } catch {
      // coba direktori berikutnya
    }
  }
  console.warn(`[ArtCollagePipeline] Referensi gaya "${referenceFile}" tidak ditemukan; lanjut tanpa referensi.`);
  return undefined;
}

export class ArtCollagePosterPipeline {
  private static readonly imageAdapter = new GoogleImagenAdapter();

  public static async generate(params: {
    topic: string;
    groundedContextSummary?: string;
    forcedArchetype?: CreativePosterArchetype;
    excludeBlueprintId?: string;
    tenantBrandHex?: string;
    tenantId?: string;
    /** Mis. jobId/publicationId: membuat mutasi reproducible untuk audit. */
    variationKey?: string;
    isInfographic?: boolean;
    candidateIndex?: number;
    remedyPrompt?: string;
    reuseCopy?: ArtCollageCopy;
  }): Promise<ArtCollagePosterResult> {
    const blueprint = await PosterBlueprintSelector.selectBestBlueprintAsync({
      topic: params.topic,
      forcedArchetype: params.forcedArchetype,
      excludeBlueprintId: params.excludeBlueprintId,
      forcedBrandHex: params.tenantBrandHex,
      isInfographic: params.isInfographic,
    });
    const archetype = blueprint.archetype;
    const dna = ART_COLLAGE_DNA[archetype];

    const seedKey = params.candidateIndex && params.candidateIndex > 1
      ? `${params.variationKey || Date.now()}:c${params.candidateIndex}:${archetype}`
      : `${params.variationKey || Date.now()}:${archetype}`;
    const seed = seedFromString(seedKey);
    const mutation = pickArtCollageMutation(archetype, seed, { topic: params.topic });

    const isInfographic = params.isInfographic || isInfographicArchetype(archetype);

    const [copy, styleReference] = await Promise.all([
      params.reuseCopy
        ? Promise.resolve(params.reuseCopy)
        : synthesizeArtCollageCopy({ topic: params.topic, groundedContext: params.groundedContextSummary, archetype }),
      loadStyleReference(blueprint.referenceFile),
    ]);

    const imagePrompt = compileArtCollageImagePrompt({
      archetype,
      mutation,
      visualSubject: copy.visualSubject,
      withStyleReference: !!styleReference,
      remedyPrompt: params.remedyPrompt,
    });

    const image = await this.imageAdapter.generateArtCollage({
      prompt: imagePrompt,
      aspectRatio: '4:5',
      tenantId: params.tenantId,
      styleReference,
    });

    const secondaryImageBuffers: Buffer[] = [];
    if (archetype !== 'INFOGRAPHIC_NARRATIVE_WAVE' && dna.allowMultiImage && process.env.CHRONICLE_MULTI_IMAGE !== 'false') {
      try {
        console.log(
          `[ArtCollagePipeline] Aturan Multi-Image aktif untuk ${archetype}: men-generate gambar dokumenter tambahan ke-2 via 9Router...`
        );
        const secondaryPrompt = [
          `Create a high-resolution, print-quality 2x2 MULTI-PHOTO ARCHIVAL DOCUMENTARY CONTACT SHEET (vertical 4:5 ratio) showing 4 DIFFERENT supplementary Indonesian field scenes about: ${copy.visualSubject}.`,
          `Show wide-angle community impact, public infrastructure details, field workers in action, and citizen beneficiaries in Indonesia.`,
          `Each quadrant must be a clean, realistic documentary photograph separated by thin warm cream borders (#F4EFE6) with ABSOLUTELY ZERO text, zero numbers, and zero labels.`,
        ].join('\n');
        const secondaryImage = await this.imageAdapter.generateArtCollage({
          prompt: secondaryPrompt,
          aspectRatio: '4:5',
          tenantId: params.tenantId,
        });
        if (secondaryImage?.imageBuffer) {
          secondaryImageBuffers.push(secondaryImage.imageBuffer);
          console.log(
            `[ArtCollagePipeline] Sukses men-generate gambar dokumenter ke-2 untuk ${archetype} (${secondaryImage.imageBuffer.length} bytes).`
          );
        }
      } catch (secErr: any) {
        console.warn(
          `[ArtCollagePipeline] Generasi gambar ke-2 opsional dilewati (${secErr?.message}), menggunakan 4 kuadran dari kanvas multi-foto utama.`
        );
      }
    }

    const layout = await VisionLayoutLocator.locate({
      imageBuffer: image.imageBuffer,
      mimeType: image.mimeType,
      anchor: mutation.anchor,
      paperTone: dna.paperTone,
      isInfographic,
    });

    return {
      imageBuffer: image.imageBuffer,
      secondaryImageBuffers: secondaryImageBuffers.length > 0 ? secondaryImageBuffers : undefined,
      imageMimeType: image.mimeType,
      archetype,
      blueprintId: blueprint.id,
      referenceFile: blueprint.referenceFile,
      usedStyleReference: image.usedStyleReference,
      mutation,
      copy,
      layout,
      imagePrompt,
      imageProvider: image.provider,
    };
  }
}
