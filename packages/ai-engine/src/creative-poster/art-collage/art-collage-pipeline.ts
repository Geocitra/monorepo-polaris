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
import type { ArtCollagePosterResult } from './art-collage.types.js';

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

    const seed = params.variationKey
      ? seedFromString(`${params.variationKey}:${archetype}`)
      : Math.floor(Math.random() * 2 ** 31);
    const mutation = pickArtCollageMutation(archetype, seed);

    const isInfographic = params.isInfographic || isInfographicArchetype(archetype);

    const [copy, styleReference] = await Promise.all([
      synthesizeArtCollageCopy({ topic: params.topic, groundedContext: params.groundedContextSummary, archetype }),
      isInfographic ? Promise.resolve(undefined) : loadStyleReference(blueprint.referenceFile),
    ]);

    const imagePrompt = compileArtCollageImagePrompt({
      archetype,
      mutation,
      visualSubject: copy.visualSubject,
      withStyleReference: !!styleReference,
    });

    const image = await this.imageAdapter.generateArtCollage({
      prompt: imagePrompt,
      aspectRatio: '4:5',
      tenantId: params.tenantId,
      styleReference,
    });

    const layout = await VisionLayoutLocator.locate({
      imageBuffer: image.imageBuffer,
      mimeType: image.mimeType,
      anchor: mutation.anchor,
      paperTone: dna.paperTone,
    });

    return {
      imageBuffer: image.imageBuffer,
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
