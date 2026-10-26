import sharp from 'sharp';
import satori from 'satori';
import QRCode from 'qrcode';
import { MultiRegionCropper } from '../multi-region-cropper.js';
import {
  ComposeCreativePosterOptions,
  ComposedPosterResult,
  SynthesizedEditorialCopy,
  CompositionPlan,
  ResolvedColorTokens,
  resolveColorAuthority,
  PosterQAReport,
} from './types.js';
import { FontLoader } from './core/font-loader.js';
import { SubjectHarmonizer } from './core/subject-harmonizer.js';
import { ZoneSampler } from './core/zone-sampler.js';
import { ParametricSatoriRenderer } from './core/parametric-renderer.js';
import { PosterVisualQAGate } from './qa/poster-visual-qa-gate.js';
import { RevisionPolicy } from './qa/revision-policy.js';
import { buildStreetJournalismLayout } from './layouts/street-journalism.layout.js';
import { buildStandardEditorialLayout } from './layouts/standard-editorial.layout.js';
import {
  buildTornPaperVeritasLayout,
  buildTornPaperWingsSvg,
} from './layouts/torn-paper-veritas.layout.js';
import { buildRetroMitigationLayout } from './layouts/retro-mitigation.layout.js';
import { buildModularCardsLayout } from './layouts/modular-cards.layout.js';
import { buildVintageGazetteLayout } from './layouts/vintage-gazette.layout.js';
import { buildPopOutHeroLayout } from './layouts/pop-out-hero.layout.js';
import { buildStatementProfileLayout } from './layouts/statement-profile.layout.js';
import { buildRetroCampaignLayout } from './layouts/retro-campaign.layout.js';
import { buildConstructivistBauhausLayout } from './layouts/constructivist-bauhaus.layout.js';
import { buildThresholdRisographLayout } from './layouts/threshold-risograph.layout.js';
import { buildSwissDuotoneEditorialLayout } from './layouts/swiss-duotone-editorial.layout.js';
import { buildIsometricCreativeCollageLayout } from './layouts/isometric-creative-collage.layout.js';
import { buildStorybookIllustratedLayout } from './layouts/storybook-illustrated.layout.js';
import { buildTypographicMaskLayout } from './layouts/typographic-mask.layout.js';
import { buildKineticMotionLayout } from './layouts/kinetic-motion.layout.js';
import { buildExecutiveSeminarLayout } from './layouts/executive-seminar.layout.js';
import { buildTornVisionLayout } from './layouts/torn-vision.layout.js';
import { buildGalleryExhibitionLayout } from './layouts/gallery-exhibition.layout.js';
import { buildPopMagazineCollageLayout } from './layouts/pop-magazine-collage.layout.js';
import { buildPolaroidAdventureLayout } from './layouts/polaroid-adventure.layout.js';
import { buildBroadsheetNewspaperLayout } from './layouts/broadsheet-newspaper.layout.js';
import { buildTechnicalGridCalloutLayout } from './layouts/technical-grid-callout.layout.js';


/**
 * @deprecated Satori-based compositor. Satori has limited CSS/font capabilities and is no longer used in production.
 * Production has transitioned 100% to ChromiumPosterCompositor (Playwright/Chromium).
 */
export class CreativePosterCompositor {
  /**
   * Helper publik untuk mengekspor SVG Sobekan Kertas (Backward Compatibility)
   */
  public static buildTornPaperWingsSvg(canvasWidth: number, canvasHeight: number): Buffer {
    return buildTornPaperWingsSvg(canvasWidth, canvasHeight);
  }

  /**
   * composePoster: Merakit Kolase AI + Subjek Harmonized + Tipografi Vektor Satori
   */
  public static async composePoster(
    options: ComposeCreativePosterOptions
  ): Promise<ComposedPosterResult> {
    const {
      backgroundBuffer,
      subjectPhotoBuffer,
      officialLogoBuffer,
      headline,
      quote,
      memberName,
      memberTitle = 'ANGGOTA PARLEMEN',
      archetype = 'STREET_JOURNALISM',
      compositionMode = 'PUBLIC_ADVOCACY',
      synthesizedCopy,
      primaryAccentColor = '#9E0B0F',
      canvasWidth = 1080,
      canvasHeight = 1350,
      editionTag = 'POLARIS ADVOKASI',
      outputFormat = 'webp',
    } = options;

    // Otoritas Tunggal Warna
    const effectiveColors: ResolvedColorTokens =
      options.resolvedColors ||
      resolveColorAuthority({
        tenantBrandHex: options.primaryAccentColor || synthesizedCopy?.primaryAccent,
        colorMoodAccent: synthesizedCopy?.colorMood,
        blueprintPalette: {
          primaryAccent: options.primaryAccentColor || synthesizedCopy?.primaryAccent,
          secondaryAccent: options.secondaryAccentColor || synthesizedCopy?.secondaryAccent,
        },
      });

    // Jalankan analisis kontras Sharp jika backgroundBuffer dan zones tersedia
    let zoneSamples: any = undefined;
    if (options.compositionPlan?.zones && options.compositionPlan.zones.length > 0) {
      try {
        const sampled = await ZoneSampler.sampleZones(
          backgroundBuffer,
          options.compositionPlan.zones
        );
        zoneSamples = sampled.get('zone_headline') || sampled.get('headline') || Array.from(sampled.values())[0];
        if (zoneSamples) {
          effectiveColors.isDark = zoneSamples.isDark;
        }
      } catch (err) {
        // Abaikan dan lanjutkan dengan fallback warna aman
      }
    }

    // 1. Normalisasi Kanvas Dasar AI (Crop-aware gravity adaptif)
    const headerPlacement = options.compositionPlan?.headerPlacement || synthesizedCopy?.headerPlacement || 'top';
    const positionGravity = headerPlacement === 'bottom' ? 'north' : headerPlacement === 'top' ? 'south' : 'center';

    const baseCanvas = sharp(backgroundBuffer).resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: 'cover',
      position: positionGravity,
    });

    const compositeLayers: sharp.OverlayOptions[] = [];

    // 2. Siapkan Logo Partai/Lembaga (Layer Terkunci)
    let logoDataUri: string | undefined;
    if (officialLogoBuffer && officialLogoBuffer.length > 0) {
      logoDataUri = `data:image/png;base64,${officialLogoBuffer.toString('base64')}`;
    }

    let qrCodeDataUri: string | undefined;
    if (options.qrCodeUrl) {
      try {
        qrCodeDataUri = await QRCode.toDataURL(options.qrCodeUrl, {
          width: 140,
          margin: 1,
          color: { dark: '#111827', light: '#FAF8F5' },
        });
      } catch {
        // Fallback gracefully
      }
    }

    // 3. Render Layer Tipografi Vektor via Satori (Polymorphic Layout Builder)
    const fonts = await FontLoader.getFonts();
    const copyData: SynthesizedEditorialCopy = synthesizedCopy || {
      mainBannerTitle: headline.slice(0, 22),
      mainBannerSubheader: `PENGEMBANGAN KEBIJAKAN PUBLIK • Get to Know More`,
      mainBannerDefinitionBody: quote || headline,
      blocks: {},
      mappedVisualCutouts: {},
    };

    // 3.5. Jika TORN_PAPER_NEWS, tambahkan Layer Mask Sobekan Kertas (Torn Paper Wings)
    if (archetype === 'TORN_PAPER_NEWS') {
      const tornPaperMask = buildTornPaperWingsSvg(canvasWidth, canvasHeight);
      compositeLayers.push({
        input: tornPaperMask,
        left: 0,
        top: 0,
      });
    }

    // Percabangan Polimorfik: Dispatch ke Layout Builder yang sesuai dengan arketipe
    const effectiveAccent =
      copyData.primaryAccent || primaryAccentColor || '#EA580C';
    const effectiveSecondary =
      copyData.secondaryAccent || options.secondaryAccentColor || '#FB923C';

    let vnode: any;

    if (archetype === 'STREET_JOURNALISM') {
      vnode = buildStreetJournalismLayout({
        width: canvasWidth,
        height: canvasHeight,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'TORN_PAPER_NEWS') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'thumb1', leftRatio: 0.05, topRatio: 0.25, widthRatio: 0.35, heightRatio: 0.20, targetWidth: 160, targetHeight: 100 },
          { id: 'thumb2', leftRatio: 0.05, topRatio: 0.70, widthRatio: 0.35, heightRatio: 0.20, targetWidth: 160, targetHeight: 100 },
        ],
        options.galleryPhotos
      );

      let qrCodeDataUri: string | undefined;
      try {
        qrCodeDataUri = await QRCode.toDataURL(
          'https://polaris.gov.id/advokasi/tanggap-darurat',
          { width: 140, margin: 1, color: { dark: '#111827', light: '#FAF8F5' } }
        );
      } catch {
        // Fallback gracefully
      }

      vnode = buildTornPaperVeritasLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        croppedThumbnails,
        qrCodeDataUri,
      });
    } else if (archetype === 'RETRO_SPLIT_MITIGATION') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'insetCircle', leftRatio: 0.30, topRatio: 0.20, widthRatio: 0.40, heightRatio: 0.40, targetWidth: 260, targetHeight: 260 },
        ],
        options.galleryPhotos
      );

      vnode = buildRetroMitigationLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        croppedThumbnails,
        logoDataUri,
      });
    } else if (archetype === 'MODULAR_GRID_CARDS') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'card1', leftRatio: 0.05, topRatio: 0.32, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card2', leftRatio: 0.50, topRatio: 0.32, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card3', leftRatio: 0.05, topRatio: 0.52, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card4', leftRatio: 0.50, topRatio: 0.52, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card5', leftRatio: 0.25, topRatio: 0.42, widthRatio: 0.50, heightRatio: 0.35, targetWidth: 280, targetHeight: 180, grayscale: true },
        ],
        options.galleryPhotos
      );

      vnode = buildModularCardsLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        croppedThumbnails,
      });
    } else if (archetype === 'VINTAGE_PERSONA_GAZETTE') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'subPhoto', leftRatio: 0.05, topRatio: 0.15, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 320, targetHeight: 200 },
        ],
        options.galleryPhotos
      );

      vnode = buildVintageGazetteLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        croppedThumbnails,
      });
    } else if (archetype === 'POP_OUT_HERO') {
      vnode = buildPopOutHeroLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'STATEMENT_PROFILE') {
      vnode = buildStatementProfileLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'RETRO_CAMPAIGN') {
      vnode = buildRetroCampaignLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
      });
    } else if (archetype === 'CONSTRUCTIVIST_BAUHAUS') {
      vnode = buildConstructivistBauhausLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'THRESHOLD_RISOGRAPH') {
      vnode = buildThresholdRisographLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'SWISS_DUOTONE_EDITORIAL') {
      vnode = buildSwissDuotoneEditorialLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'ISOMETRIC_CREATIVE_COLLAGE') {
      vnode = buildIsometricCreativeCollageLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'STORYBOOK_ILLUSTRATED') {
      vnode = buildStorybookIllustratedLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'TYPOGRAPHIC_MASK') {
      vnode = buildTypographicMaskLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'KINETIC_MOTION') {
      vnode = buildKineticMotionLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'EXECUTIVE_SEMINAR') {
      vnode = buildExecutiveSeminarLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'TORN_VISION') {
      vnode = buildTornVisionLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'GALLERY_EXHIBITION') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'exhibit1', leftRatio: 0.10, topRatio: 0.20, widthRatio: 0.40, heightRatio: 0.25, targetWidth: 240, targetHeight: 160 },
          { id: 'exhibit2', leftRatio: 0.52, topRatio: 0.20, widthRatio: 0.40, heightRatio: 0.25, targetWidth: 240, targetHeight: 160 },
        ],
        options.galleryPhotos
      );
      vnode = buildGalleryExhibitionLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        croppedThumbnails,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'POP_MAGAZINE_COLLAGE') {
      vnode = buildPopMagazineCollageLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'POLAROID_ADVENTURE') {
      vnode = buildPolaroidAdventureLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'BROADSHEET_NEWSPAPER') {
      vnode = buildBroadsheetNewspaperLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else if (archetype === 'TECHNICAL_GRID_CALLOUT') {
      vnode = buildTechnicalGridCalloutLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    } else {
      vnode = buildStandardEditorialLayout({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: effectiveAccent,
        secondaryAccent: effectiveSecondary,
        archetype,
        logoDataUri,
        compositionPlan: options.compositionPlan,
        resolvedColors: effectiveColors,
      });
    }

    const svgString = await satori(vnode, {
      width: canvasWidth,
      height: canvasHeight,
      fonts,
    });

    // 4. Jika Mode FIGURE_CENTERPIECE dan foto PNG Anggota Dewan tersedia:
    // Terapkan Aturan Desain Profesional: Bottom-Anchored & Rule of Thirds (Anti-Melayang di Tengah!)
    if (
      compositionMode === 'FIGURE_CENTERPIECE' &&
      subjectPhotoBuffer &&
      subjectPhotoBuffer.length > 0
    ) {
      let targetW: number;
      let targetH: number;
      let left: number;
      let top: number;

      if (archetype === 'STREET_JOURNALISM') {
        // Tokoh diletakkan di sepertiga kanan (x: 54%), berjangkar kuat ke batas bawah
        targetW = Math.round(canvasWidth * 0.44);
        targetH = Math.round(canvasHeight * 0.62);
        left = Math.round(canvasWidth * 0.54);
        top = canvasHeight - targetH;
      } else if (archetype === 'STATEMENT_PROFILE') {
        // Tokoh berdiri berwibawa di sisi kanan (x: 50%), berjangkar ke batas bawah
        targetW = Math.round(canvasWidth * 0.50);
        targetH = Math.round(canvasHeight * 0.70);
        left = Math.round(canvasWidth * 0.50);
        top = canvasHeight - targetH;
      } else if (archetype === 'POP_OUT_HERO') {
        // Tokoh dramatis menembus frame tengah-kanan
        targetW = Math.round(canvasWidth * 0.52);
        targetH = Math.round(canvasHeight * 0.74);
        left = Math.round(canvasWidth * 0.46);
        top = canvasHeight - targetH;
      } else {
        // Arketipe lainnya: Sepertiga kanan berjangkar ke bawah
        targetW = Math.round(canvasWidth * 0.46);
        targetH = Math.round(canvasHeight * 0.66);
        left = Math.round(canvasWidth * 0.52);
        top = canvasHeight - targetH;
      }

      const harmonizedSubject = await SubjectHarmonizer.harmonizeSubjectPhoto(
        subjectPhotoBuffer,
        archetype,
        targetW,
        targetH
      );

      compositeLayers.push({
        input: harmonizedSubject,
        left,
        top,
      });
    }


    // 5. Masukkan Layer Tipografi Vektor Satori (Z-Index paling depan / on top)
    compositeLayers.push({
      input: Buffer.from(svgString),
      top: 0,
      left: 0,
    });

    // 6. Eksekusi Komposisi Awal
    const finalPipeline = baseCanvas.composite(compositeLayers);

    let outputBuffer =
      outputFormat === 'png'
        ? await finalPipeline.png().toBuffer()
        : await finalPipeline.webp({ quality: 92, effort: 4 }).toBuffer();

    // 7. Visual Quality Evaluation (Fase 3 QA Gate)
    let qaReport: PosterQAReport | undefined = undefined;

    if (options.enableVisualQA !== false) {
      try {
        qaReport = await PosterVisualQAGate.evaluateQuality({
          compositeBuffer: outputBuffer,
          plan: options.compositionPlan,
          resolvedColors: effectiveColors,
          surfaceMode: zoneSamples?.surfaceMode,
          canvasWidth,
          canvasHeight,
        });

        // 8. Self-Healing Revision Loop (Zero-Waste Satori Re-render)
        if (
          options.autoHealContrast &&
          !qaReport.passed &&
          qaReport.recommendation.action === 'ADJUST_SURFACE'
        ) {
          const decision = RevisionPolicy.evaluateDecision({
            report: qaReport,
            currentPlan: options.compositionPlan,
            currentSurfaceMode: zoneSamples?.surfaceMode,
          });

          if (decision.healed && decision.newSurfaceMode) {
            const healedPlan = options.compositionPlan
              ? RevisionPolicy.applyHealingToPlan(options.compositionPlan, decision)
              : undefined;

            const healedVNode = ParametricSatoriRenderer.renderParametricPoster({
              width: canvasWidth,
              height: canvasHeight,
              headline,
              quote,
              copy: copyData,
              memberName,
              memberTitle,
              editionTag,
              logoDataUri,
              qrCodeDataUri,
              compositionPlan: healedPlan,
              resolvedColors: effectiveColors,
              skinConfig: {
                headlineSurface: decision.newSurfaceMode,
                columnsSurface: decision.newSurfaceMode,
              },
            });

            const healedSvgString = await satori(healedVNode, {
              width: canvasWidth,
              height: canvasHeight,
              fonts,
            });

            const healedLayers = [...compositeLayers];
            healedLayers[healedLayers.length - 1] = {
              input: Buffer.from(healedSvgString),
              top: 0,
              left: 0,
            };

            const healedPipeline = sharp(backgroundBuffer)
              .resize(canvasWidth, canvasHeight, { fit: 'cover', position: 'center' })
              .composite(healedLayers);

            const healedBuffer =
              outputFormat === 'png'
                ? await healedPipeline.png().toBuffer()
                : await healedPipeline.webp({ quality: 92, effort: 4 }).toBuffer();

            const reevaluatedQA = await PosterVisualQAGate.evaluateQuality({
              compositeBuffer: healedBuffer,
              plan: healedPlan,
              resolvedColors: effectiveColors,
              surfaceMode: decision.newSurfaceMode,
              canvasWidth,
              canvasHeight,
            });

            outputBuffer = healedBuffer;
            qaReport = {
              ...reevaluatedQA,
              recommendation: {
                ...reevaluatedQA.recommendation,
                reason: `Self-healed via Satori: ${decision.reason}`,
              },
            };
          }
        }
      } catch (err: any) {
        console.warn(`[CreativePosterCompositor] QA Gate evaluation failed: ${err?.message}`);
      }
    }

    return {
      buffer: outputBuffer,
      mimeType: outputFormat === 'png' ? 'image/png' : 'image/webp',
      sizeBytes: outputBuffer.length,
      width: canvasWidth,
      height: canvasHeight,
      qaReport,
    };
  }
}
