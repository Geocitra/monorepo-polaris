/**
 * Art-Collage Pipeline Orchestrator (ai-engine side)
 *
 * 1. Pilih blueprint/arketipe (selector existing).
 * 2. Otak Teks  : copy poster + visualSubject dari topik yang sama.
 * 3. Mutasi     : anchor ruang teks + palet tinta (seeded).
 * 4. Otak Visual: kanvas kolase utuh (opsional + referensi gaya multimodal).
 * 5. Vision     : temukan kotak aman untuk teks di kanvas yang SUDAH jadi.
 *
 * Komposisi teks (Satori) + ink-blend (Sharp) dikerjakan di @polaris/storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleImagenAdapter } from '../../adapters/google-imagen.adapter.js';
import { PosterBlueprintSelector } from '../selector.js';
import type { CreativePosterArchetype } from '../types.js';
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
  }): Promise<ArtCollagePosterResult> {
    const blueprint = await PosterBlueprintSelector.selectBestBlueprintAsync({
      topic: params.topic,
      forcedArchetype: params.forcedArchetype,
      excludeBlueprintId: params.excludeBlueprintId,
      forcedBrandHex: params.tenantBrandHex,
    });
    const archetype = blueprint.archetype;
    const dna = ART_COLLAGE_DNA[archetype];

    const seed = params.variationKey
      ? seedFromString(`${params.variationKey}:${archetype}`)
      : Math.floor(Math.random() * 2 ** 31);
    const mutation = pickArtCollageMutation(archetype, seed);

    const [copy, styleReference] = await Promise.all([
      synthesizeArtCollageCopy({ topic: params.topic, groundedContext: params.groundedContextSummary }),
      loadStyleReference(blueprint.referenceFile),
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
