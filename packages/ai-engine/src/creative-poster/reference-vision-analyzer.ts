import { openaiClient } from '../client.js';
import { PreAnalyzedPosterBlueprint, CreativePosterArchetype } from './types.js';

export interface VisionAnalysisParams {
  imageBuffer?: Buffer;
  imageUrl?: string;
  imageBase64?: string;
  referenceFileName: string;
  topicHint?: string;
}

const VALID_ARCHETYPES: CreativePosterArchetype[] = [
  'POP_OUT_HERO',
  'STREET_JOURNALISM',
  'STATEMENT_PROFILE',
  'RETRO_CAMPAIGN',
  'TORN_PAPER_NEWS',
  'RETRO_SPLIT_MITIGATION',
  'MODULAR_GRID_CARDS',
  'CONSTRUCTIVIST_BAUHAUS',
  'THRESHOLD_RISOGRAPH',
  'SWISS_DUOTONE_EDITORIAL',
  'ISOMETRIC_CREATIVE_COLLAGE',
  'STORYBOOK_ILLUSTRATED',
  'TYPOGRAPHIC_MASK',
  'KINETIC_MOTION',
  'EXECUTIVE_SEMINAR',
  'TORN_VISION',
  'GALLERY_EXHIBITION',
  'POP_MAGAZINE_COLLAGE',
  'POLAROID_ADVENTURE',
  'VINTAGE_PERSONA_GAZETTE',
  'BROADSHEET_NEWSPAPER',
  'TECHNICAL_GRID_CALLOUT',
];

/**
 * PosterReferenceVisionAnalyzer: Menganalisis file referensi visual poster
 * menggunakan OpenAI GPT-4o Vision untuk mengekstrak geometri, palet warna,
 * gaya fotografi, dan batasan arsitektur menjadi blueprint terstruktur.
 */
export class PosterReferenceVisionAnalyzer {
  public static async analyzePosterReference(
    params: VisionAnalysisParams
  ): Promise<PreAnalyzedPosterBlueprint> {
    const { imageBuffer, imageUrl, imageBase64, referenceFileName, topicHint } = params;

    let targetDataUrl = imageUrl;
    if (!targetDataUrl && imageBuffer) {
      targetDataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    } else if (!targetDataUrl && imageBase64) {
      targetDataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
    }

    if (!targetDataUrl) {
      throw new Error(
        '[PosterReferenceVisionAnalyzer] Gagal: Tidak ada imageBuffer, imageUrl, atau imageBase64 yang diberikan.'
      );
    }

    const systemPrompt = `Anda adalah Master Art Director dan Computational Design Architect untuk POLARIS Creative Poster Engine.
Tugas Anda adalah membedah gambar referensi poster desain ini secara presisi dan menghasilkan spesifikasi JSON blueprint yang type-safe.

PILIHAN ARTIKETIPE RESMI (Wajib pilih salah satu yang paling mendekati):
${VALID_ARCHETYPES.join(', ')}

FORMAT OUTPUT JSON WAJIB:
{
  "name": "Nama Blueprint Deskriptif",
  "archetype": "SALAH_SATU_DARI_LIST_DI_ATAS",
  "description": "Deskripsi komposisi visual poster dalam 2-3 kalimat",
  "tags": ["tag1", "tag2", "tag3"],
  "aspectRatio": "4:5",
  "colorPalette": {
    "primaryAccent": "#HEX",
    "secondaryAccent": "#HEX",
    "backgroundBase": "#HEX",
    "textColor": "#HEX",
    "subTextColor": "#HEX",
    "cardBackground": "rgba(...)",
    "cardBorder": "rgba(...)"
  },
  "scenePromptHint": "Instruksi fotografi/seni kanvas latar belakang dalam Bahasa Inggris (gaya pencahayaan, lensa, tekstur kertas/dinding, NO text, NO typography, NO watermark)",
  "negativeSpaceZone": "Instruksi ruang kosong bersih dalam Bahasa Inggris untuk tempat meletakkan teks (contoh: clean empty negative space on top 35%)",
  "fixedConstraints": {
    "aspectRatio": "4:5",
    "zeroLogoInCanvas": true,
    "allowTextInImage": false,
    "enforcePrimaryBrandAccent": true,
    "imageNegativeAllow": ["banner", "border"],
    "toneSafety": "ALL_TOPICS"
  },
  "variationRules": {
    "allowedLayoutVariants": ["TOP_BANNER", "BOTTOM_ANCHOR"],
    "allowedHeaderPlacements": ["top", "bottom"],
    "allowedCardArrangements": ["stacked", "horizontal_split"],
    "canMutatePalette": true,
    "allowedColorMoods": ["SERIOUS_GOVERNANCE", "EMERGENCY_CRISIS", "HOPEFUL_PROGRESSIVE"]
  }
}`;

    const userPrompt = `Analisis file referensi poster: "${referenceFileName}".
${topicHint ? `Petunjuk konteks tema: ${topicHint}` : ''}
Ekstrak geometri, palet warna, dan blueprint desain sesuai instruksi.`;

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: targetDataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('[PosterReferenceVisionAnalyzer] OpenAI tidak mengembalikan respons analisis vision.');
    }

    const parsed = JSON.parse(content);
    return this.validateAndSanitizeBlueprint(parsed, referenceFileName);
  }

  /**
   * Memvalidasi dan melengkapi nilai default blueprint agar type-safe
   */
  public static validateAndSanitizeBlueprint(
    raw: any,
    referenceFileName: string
  ): PreAnalyzedPosterBlueprint {
    const rawArchetype = String(raw.archetype || '').toUpperCase();
    const archetype: CreativePosterArchetype = VALID_ARCHETYPES.includes(
      rawArchetype as any
    )
      ? (rawArchetype as CreativePosterArchetype)
      : 'POP_OUT_HERO';

    const cleanId =
      raw.id ||
      `TPL-23-CUSTOM-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        Math.random() * 1000
      )}`;

    const palette = raw.colorPalette || {};

    return {
      id: cleanId,
      name: raw.name || `Custom Reference - ${referenceFileName.slice(0, 30)}`,
      archetype,
      referenceFile: referenceFileName,
      description: raw.description || 'Poster blueprint tergenerasi otomatis dari AI Vision analysis.',
      tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : ['custom', 'vision-ingested'],
      aspectRatio: raw.aspectRatio === '9:16' ? '9:16' : '4:5',
      colorPalette: {
        primaryAccent: palette.primaryAccent || '#EA580C',
        secondaryAccent: palette.secondaryAccent || '#FB923C',
        backgroundBase: palette.backgroundBase || '#0F172A',
        textColor: palette.textColor || '#FFFFFF',
        subTextColor: palette.subTextColor || 'rgba(255,255,255,0.7)',
        cardBackground: palette.cardBackground || 'rgba(15, 23, 42, 0.85)',
        cardBorder: palette.cardBorder || 'rgba(255, 255, 255, 0.15)',
      },
      scenePromptHint:
        raw.scenePromptHint ||
        'cinematic editorial lighting, clean negative space, photographic authenticity, fine grain texture, zero text, zero typography',
      negativeSpaceZone:
        raw.negativeSpaceZone ||
        'large clean empty negative space on top 40% with generous breathing room for vector typography',
      slotManifest: {
        canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
        slots: {
          subjectPhoto: { x: 0.54, y: 0.38, w: 0.44, h: 0.62 },
          headlineBlock: {
            x: 0.05,
            y: 0.06,
            w: 0.90,
            maxLines: 2,
            fontFamily: 'Bebas Neue',
            fontSizePx: 96,
            textColor: '#FFFFFF',
          },
          memberIdentity: {
            x: 0.05,
            y: 0.90,
            w: 0.90,
            nameFontSizePx: 22,
            titleFontSizePx: 12,
            nameColor: '#FFFFFF',
            titleColor: palette.primaryAccent || '#EA580C',
          },
          officialEmblem: { x: 0.05, y: 0.03, w: 0.20, maxHeightPx: 32, placement: 'top-left' },
        },
      },
      fixedConstraints: {
        primaryAccentLocked: raw.fixedConstraints?.primaryAccentLocked ?? false,
        baseBackgroundTone:
          raw.fixedConstraints?.baseBackgroundTone ||
          (palette.backgroundBase?.toLowerCase().startsWith('#0') ||
          palette.backgroundBase?.toLowerCase().startsWith('#1')
            ? 'DARK'
            : 'LIGHT'),
        requiredFontFamilies: {
          headline: raw.fixedConstraints?.requiredFontFamilies?.headline || 'Bebas Neue',
          body: raw.fixedConstraints?.requiredFontFamilies?.body || 'Plus Jakarta Sans',
        },
        imageNegativeAllow: raw.fixedConstraints?.imageNegativeAllow || ['border', 'frame'],
        toneSafety: raw.fixedConstraints?.toneSafety || 'ALL_TOPICS',
      },
      variationRules: {
        allowedLayoutVariants: raw.variationRules?.allowedLayoutVariants || [
          'TOP_BANNER',
          'BOTTOM_ANCHOR',
        ],
        allowedHeaderPlacements: raw.variationRules?.allowedHeaderPlacements || ['top', 'bottom'],
        allowedCardArrangements: raw.variationRules?.allowedCardArrangements || [
          'stacked',
          'horizontal_split',
        ],
        canMutatePalette: raw.variationRules?.canMutatePalette !== false,
        allowedColorMoods: raw.variationRules?.allowedColorMoods || [
          'SERIOUS_GOVERNANCE',
          'EMERGENCY_CRISIS',
          'HOPEFUL_PROGRESSIVE',
        ],
      },
    };
  }
}
