import sharp from 'sharp';
import satori from 'satori';
import QRCode from 'qrcode';
import { MultiRegionCropper } from '../multi-region-cropper.js';
import {
  ComposeCreativePosterOptions,
  ComposedPosterResult,
  SynthesizedEditorialCopy,
} from './types.js';
import { FontLoader } from './core/font-loader.js';
import { SubjectHarmonizer } from './core/subject-harmonizer.js';
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

    // 1. Normalisasi Kanvas Dasar AI
    const baseCanvas = sharp(backgroundBuffer).resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: 'cover',
      position: 'center',
    });

    const compositeLayers: sharp.OverlayOptions[] = [];

    // 2. Siapkan Logo Partai/Lembaga (Layer Terkunci)
    let logoDataUri: string | undefined;
    if (officialLogoBuffer && officialLogoBuffer.length > 0) {
      logoDataUri = `data:image/png;base64,${officialLogoBuffer.toString('base64')}`;
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
          { id: 'card1', leftRatio: 0.05, topRatio: 0.05, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card2', leftRatio: 0.50, topRatio: 0.05, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card3', leftRatio: 0.05, topRatio: 0.50, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card4', leftRatio: 0.50, topRatio: 0.50, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card5', leftRatio: 0.25, topRatio: 0.35, widthRatio: 0.50, heightRatio: 0.30, targetWidth: 280, targetHeight: 180, grayscale: true },
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
      });
    }

    const svgString = await satori(vnode, {
      width: canvasWidth,
      height: canvasHeight,
      fonts,
    });

    // 4. Jika Mode FIGURE_CENTERPIECE dan foto PNG Anggota Dewan tersedia:
    if (
      compositionMode === 'FIGURE_CENTERPIECE' &&
      subjectPhotoBuffer &&
      subjectPhotoBuffer.length > 0
    ) {
      if (archetype === 'STREET_JOURNALISM') {
        const targetW = Math.round(canvasWidth * 0.26);
        const targetH = Math.round(canvasHeight * 0.38);
        const harmonizedSubject = await SubjectHarmonizer.harmonizeSubjectPhoto(
          subjectPhotoBuffer,
          archetype,
          targetW,
          targetH
        );

        compositeLayers.push({
          input: harmonizedSubject,
          left: Math.round(canvasWidth * 0.24),
          top: Math.round(canvasHeight * 0.30),
        });
      } else {
        const targetW = Math.round(canvasWidth * 0.44);
        const targetH = Math.round(canvasHeight * 0.60);
        const harmonizedSubject = await SubjectHarmonizer.harmonizeSubjectPhoto(
          subjectPhotoBuffer,
          archetype,
          targetW,
          targetH
        );

        compositeLayers.push({
          input: harmonizedSubject,
          left: Math.round(canvasWidth * 0.28),
          top: Math.round(canvasHeight * 0.24),
        });
      }
    }

    // 5. Masukkan Layer Tipografi Vektor Satori (Z-Index paling depan / on top)
    compositeLayers.push({
      input: Buffer.from(svgString),
      top: 0,
      left: 0,
    });

    // 6. Eksekusi Komposisi Akhir
    const finalPipeline = baseCanvas.composite(compositeLayers);

    const outputBuffer =
      outputFormat === 'png'
        ? await finalPipeline.png().toBuffer()
        : await finalPipeline.webp({ quality: 92, effort: 4 }).toBuffer();

    return {
      buffer: outputBuffer,
      mimeType: outputFormat === 'png' ? 'image/png' : 'image/webp',
      sizeBytes: outputBuffer.length,
      width: canvasWidth,
      height: canvasHeight,
    };
  }
}
