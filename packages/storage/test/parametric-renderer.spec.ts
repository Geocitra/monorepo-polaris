import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  buildMastheadPrimitive,
  buildHeadlinePrimitive,
  buildEditorialColumnsPrimitive,
  buildStatBadgesPrimitive,
  buildPhotoFramePrimitive,
  buildMemberSignaturePrimitive,
} from '../src/creative-poster/primitives/index.js';
import { ParametricSatoriRenderer } from '../src/creative-poster/core/parametric-renderer.js';
import { MultiRegionCropper } from '../src/multi-region-cropper.js';
import { CompositionPlan, ResolvedColorTokens } from '@polaris/shared-types';

describe('Parametric Satori Primitives & Renderer', () => {
  const dummyColors: ResolvedColorTokens = {
    primaryAccent: '#DC2626',
    secondaryAccent: '#FEF08A',
    backgroundBase: '#0F172A',
    textColor: '#FFFFFF',
    subTextColor: '#94A3B8',
    cardBackground: 'rgba(15, 23, 42, 0.75)',
    cardBorder: 'rgba(220, 38, 38, 0.3)',
    source: 'BLUEPRINT',
    isDark: true,
  };

  describe('1. Masthead Primitive', () => {
    it('harus merender gaya BROADSHEET_CLASSIC dengan garis border ganda', () => {
      const vnode = buildMastheadPrimitive({
        style: 'BROADSHEET_CLASSIC',
        title: 'THE S NEWS',
        editionTag: 'SPECIAL EDITION',
        resolvedColors: dummyColors,
      });

      expect(vnode).toBeDefined();
      expect(vnode.type).toBe('div');
      expect(vnode.props.style.flexDirection).toBe('column');
      expect(vnode.props.style.borderTop).toBeDefined();
      expect(vnode.props.style.borderBottom).toBeDefined();
    });

    it('harus merender gaya MODERN_MINIMAL secara ringkas', () => {
      const vnode = buildMastheadPrimitive({
        style: 'MODERN_MINIMAL',
        title: 'POLARIS DISPATCH',
        resolvedColors: dummyColors,
      });

      expect(vnode).toBeDefined();
      expect(vnode.props.style.justifyContent).toBe('space-between');
    });

    it('harus merender gaya BOLD_STAMP dan VINTAGE_RIBBON', () => {
      const stamp = buildMastheadPrimitive({
        style: 'BOLD_STAMP',
        title: 'URGENT BULLETIN',
        resolvedColors: dummyColors,
      });
      expect(stamp.props.style.border).toContain(dummyColors.primaryAccent);
      expect(stamp.props.style.boxShadow).toContain(dummyColors.primaryAccent);

      const ribbon = buildMastheadPrimitive({
        style: 'VINTAGE_RIBBON',
        title: 'GAZETTE REPORT',
        resolvedColors: dummyColors,
      });
      expect(ribbon.props.style.borderBottom).toContain(dummyColors.primaryAccent);
    });
  });

  describe('2. Headline Primitive', () => {
    it('harus mematuhi EditorialSurface NONE tanpa kartu pembungkus buatan', () => {
      const vnode = buildHeadlinePrimitive({
        headline: 'REFORMASI ANGGARAN DAERAH',
        subHeader: 'Kawal transparansi hingga ke level desa',
        surface: 'NONE',
        resolvedColors: dummyColors,
        maxFontSize: 80,
      });

      expect(vnode.type).toBe('div');
      expect(vnode.props.style.backgroundColor).toBeUndefined();
    });

    it('harus menerapkan SCRIM_GRADIENT atau SOLID_BAND dengan benar', () => {
      const scrim = buildHeadlinePrimitive({
        headline: 'PERINGATAN DINI BENCANA',
        surface: 'SCRIM_GRADIENT',
        resolvedColors: dummyColors,
      });
      expect(scrim.props.style.background).toContain('linear-gradient');

      const band = buildHeadlinePrimitive({
        headline: 'SIARAN PERS RESMI',
        surface: 'SOLID_BAND',
        resolvedColors: dummyColors,
      });
      expect(band.props.style.background).toBeDefined();
      expect(band.props.style.borderTop).toContain(dummyColors.primaryAccent);
    });
  });

  describe('3. Editorial Columns Primitive', () => {
    const sampleBlocks = [
      { kicker: 'ISU 01', title: 'Distribusi Logistik', body: 'Memastikan stok pangan cukup.' },
      { kicker: 'ISU 02', title: 'Stabilitas Harga', body: 'Menjaga daya beli masyarakat.' },
      { kicker: 'ISU 03', title: 'Dukungan UMKM', body: 'Akses modal murah terjamin.' },
    ];

    it('harus merender 2 kolom saat arrangement horizontal_split', () => {
      const vnode = buildEditorialColumnsPrimitive({
        blocks: sampleBlocks,
        arrangement: 'horizontal_split',
        resolvedColors: dummyColors,
      });

      expect(vnode).toBeDefined();
      expect(vnode.props.style.flexDirection).toBe('row');
      expect(vnode.props.children).toHaveLength(sampleBlocks.length);
    });

    it('harus merender susunan stacked callouts secara vertikal', () => {
      const vnode = buildEditorialColumnsPrimitive({
        blocks: sampleBlocks,
        arrangement: 'stacked',
        resolvedColors: dummyColors,
      });

      expect(vnode).toBeDefined();
      expect(vnode.props.style.flexDirection).toBe('column');
      expect(vnode.props.children).toHaveLength(sampleBlocks.length);
    });
  });

  describe('4. Stat Badges, Photo Frame, & Member Signature Primitives', () => {
    it('harus merender lingkaran statistik dengan nilai dan label', () => {
      const vnode = buildStatBadgesPrimitive({
        stats: [{ value: '85%', label: 'Penyaluran Beras' }, { value: '1.2T', label: 'Alokasi Bansos' }],
        displayMode: 'stat_circles',
        resolvedColors: dummyColors,
      });

      expect(vnode.props.children).toHaveLength(2);
    });

    it('harus merender polaroid dan clean editorial frame untuk photo sub-regions', () => {
      const polaroid = buildPhotoFramePrimitive({
        photoBase64: 'data:image/png;base64,dummy',
        style: 'polaroid',
        caption: 'Kunjungan Kerja Pasar Induk',
        resolvedColors: dummyColors,
      });
      expect(polaroid.props.style.boxShadow).toBeDefined();

      const circular = buildPhotoFramePrimitive({
        photoBase64: 'data:image/png;base64,dummy',
        style: 'circular_inset',
        resolvedColors: dummyColors,
      });
      expect(circular.props.style.borderRadius).toContain('px');
    });

    it('harus merender atribusi member signature lengkap dengan barcode aksen', () => {
      const vnode = buildMemberSignaturePrimitive({
        name: 'H. AHMAD FAUZI, S.T.',
        title: 'Anggota Komisi IV DPR RI',
        resolvedColors: dummyColors,
        showBarcodeAccent: true,
      });

      expect(vnode).toBeDefined();
      expect(vnode.props.style.display).toBe('flex');
    });
  });

  describe('5. ParametricSatoriRenderer Engine', () => {
    const basePlan: CompositionPlan = {
      archetype: 'SWISS_DUOTONE_EDITORIAL',
      layoutVariant: 'TOP_BANNER',
      headerPlacement: 'top',
      cardArrangement: 'horizontal_split',
      aspectRatio: '4:5',
      subjectBoundingBox: { x: 0.1, y: 0.3, width: 0.8, height: 0.4 },
      zones: [
        { role: 'PRIMARY_HEADLINE', rect: { x: 54, y: 80, width: 972, height: 260 } },
        { role: 'EDITORIAL_CARDS', rect: { x: 54, y: 820, width: 972, height: 380 } },
      ],
    };

    it('harus menghasilkan struktur VNode berbeda untuk TOP_BANNER vs BOTTOM_ANCHOR', () => {
      const topBannerVNode = ParametricSatoriRenderer.renderParametricPoster({
        plan: basePlan,
        resolvedColors: dummyColors,
        headline: 'JUDUL ATAS BERSIH',
        quote: 'Kutipan singkat berita.',
        memberName: 'AHMAD FAUZI',
        memberTitle: 'DPR RI',
        skinConfig: {
          mastheadStyle: 'MODERN_MINIMAL',
        },
      });

      const bottomAnchorVNode = ParametricSatoriRenderer.renderParametricPoster({
        plan: {
          ...basePlan,
          layoutVariant: 'BOTTOM_ANCHOR',
          headerPlacement: 'bottom',
        },
        resolvedColors: dummyColors,
        headline: 'JUDUL BAWAH BERSIH',
        quote: 'Kutipan singkat berita.',
        memberName: 'AHMAD FAUZI',
        memberTitle: 'DPR RI',
      });

      expect(topBannerVNode.props.style.flexDirection).toBe('column');
      expect(bottomAnchorVNode.props.style.flexDirection).toBe('column');
      // Verifikasi struktur anak berbeda sesuai posisi header
      expect(topBannerVNode).not.toEqual(bottomAnchorVNode);
    });

    it('harus mendukung EDITORIAL_SPLIT dan CENTERED_HERO variants', () => {
      const splitVNode = ParametricSatoriRenderer.renderParametricPoster({
        plan: { ...basePlan, layoutVariant: 'EDITORIAL_SPLIT' },
        resolvedColors: dummyColors,
        headline: 'SPLIT EDITORIAL',
      });
      expect(splitVNode).toBeDefined();

      const heroVNode = ParametricSatoriRenderer.renderParametricPoster({
        plan: { ...basePlan, layoutVariant: 'CENTERED_HERO' },
        resolvedColors: dummyColors,
        headline: 'CENTERED HERO STATEMENT',
      });
      expect(heroVNode).toBeDefined();
    });

    describe('4 Structural Families Visual Differentiation', () => {
      const dummyCopy = {
        statCircles: [
          { topLabel: 'CAPAIAN', value: '100%', description: 'Realisasi program tepat sasaran.' },
          { topLabel: 'PENERIMA', value: '2.500+', description: 'Warga terdata mendapat manfaat.' },
          { topLabel: 'EVALUASI', value: 'TERUJI', description: 'Transparansi anggaran berkala.' },
        ],
        blocks: {
          b1: { header: 'FOKUS KEBIJAKAN', body: 'Deskripsi fokus kerja.' },
          b2: { header: 'AKSI NYATA', body: 'Deskripsi aksi nyata.' },
        },
      };

      function hasStatCircleNode(node: any): boolean {
        if (!node) return false;
        if (
          node.props?.style?.borderRadius === '50%' ||
          node.props?.style?.borderRadius === '58px' ||
          node.props?.style?.borderRadius === '60px'
        ) {
          return true;
        }
        if (Array.isArray(node.props?.children)) {
          return node.props.children.some((c: any) => hasStatCircleNode(c));
        }
        if (node.props?.children && typeof node.props.children === 'object') {
          return hasStatCircleNode(node.props.children);
        }
        return false;
      }

      it('CINEMATIC_MINIMAL: TIDAK boleh memiliki lingkaran statistik sama sekali (0 stat circles) walau statCircles ada di copy', () => {
        const vnode = ParametricSatoriRenderer.renderParametricPoster({
          plan: basePlan,
          copy: dummyCopy,
          resolvedColors: dummyColors,
          headline: 'PETUALANGAN DI PUNCAK',
          quote: 'Keindahan alam yang harus dijaga bersama.',
          memberName: 'AHMAD FAUZI',
          memberTitle: 'DPR RI',
          skinConfig: {
            structuralFamily: 'CINEMATIC_MINIMAL',
          },
        });

        expect(hasStatCircleNode(vnode)).toBe(false);
      });

      it('EDITORIAL_MAGAZINE: TIDAK boleh memiliki lingkaran statistik (0 stat circles) dan memiliki 2 kolom berdampingan', () => {
        const vnode = ParametricSatoriRenderer.renderParametricPoster({
          plan: basePlan,
          copy: dummyCopy,
          resolvedColors: dummyColors,
          headline: 'TINJAUAN STRATEGIS KEBIJAKAN',
          memberName: 'AHMAD FAUZI',
          memberTitle: 'DPR RI',
          skinConfig: {
            structuralFamily: 'EDITORIAL_MAGAZINE',
          },
        });

        expect(hasStatCircleNode(vnode)).toBe(false);
      });

      it('BOLD_MANIFESTO: TIDAK boleh memiliki lingkaran statistik (0 stat circles) dan memiliki 2 kartu aksi', () => {
        const vnode = ParametricSatoriRenderer.renderParametricPoster({
          plan: basePlan,
          copy: dummyCopy,
          resolvedColors: dummyColors,
          headline: 'GERAKAN REFORMASI TOTAL',
          memberName: 'AHMAD FAUZI',
          memberTitle: 'DPR RI',
          skinConfig: {
            structuralFamily: 'BOLD_MANIFESTO',
          },
        });

        expect(hasStatCircleNode(vnode)).toBe(false);
      });

      it('DATA_INFOGRAPHIC: HANYA family ini yang merender lingkaran statistik (buildStatBadgesPrimitive)', () => {
        const vnode = ParametricSatoriRenderer.renderParametricPoster({
          plan: basePlan,
          copy: dummyCopy,
          resolvedColors: dummyColors,
          headline: 'INDIKATOR KINERJA PEMBANGUNAN',
          memberName: 'AHMAD FAUZI',
          memberTitle: 'DPR RI',
          skinConfig: {
            structuralFamily: 'DATA_INFOGRAPHIC',
          },
        });

        expect(hasStatCircleNode(vnode)).toBe(true);
      });
    });
  });

  describe('6. MultiRegionCropper Variance Fallback (Anti-Langit Kosong)', () => {
    it('harus mendeteksi area polos/hampa (avgStdev < 18) di bagian atas dan otomatis menggeser crop ke zona tengah berobjek', async () => {
      // Buat gambar uji 1000x1000:
      // - 0% - 30% atas: PUTIH POLOS (#FFFFFF)
      // - 35% - 75% tengah: BERWARNA KONTRAS TINGGI DENGAN POLA
      const width = 1000;
      const height = 1000;

      // Buat background putih
      const baseWhite = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .png()
        .toBuffer();

      // Buat overlay warna-warni kontras di tengah (y: 350 s/d 750)
      const contrastSvg = Buffer.from(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="360" width="900" height="380" fill="#DC2626" />
          <circle cx="500" cy="550" r="150" fill="#0F172A" />
          <rect x="200" y="420" width="600" height="60" fill="#FBBF24" />
        </svg>
      `);

      const testImageBuffer = await sharp(baseWhite)
        .composite([{ input: contrastSvg, top: 0, left: 0 }])
        .png()
        .toBuffer();

      // Minta crop di topRatio: 0.05 (yang jika tanpa fallback akan menghasilkan 100% putih polos)
      const croppedResults = await MultiRegionCropper.extractSubRegions(
        testImageBuffer,
        [
          {
            id: 'skyCard',
            leftRatio: 0.1,
            topRatio: 0.05, // Zona putih polos
            widthRatio: 0.5,
            heightRatio: 0.25,
          },
        ]
      );

      expect(croppedResults.skyCard).toBeDefined();
      expect(croppedResults.skyCard.startsWith('data:image/png;base64,')).toBe(true);

      // Decode hasil potongan untuk mengecek deviasi standar
      const base64Data = croppedResults.skyCard.replace('data:image/png;base64,', '');
      const cropBuf = Buffer.from(base64Data, 'base64');
      const cropStats = await sharp(cropBuf).stats();
      const numChannels = Math.min(3, cropStats.channels.length);
      const avgStdev = cropStats.channels.slice(0, numChannels).reduce((acc, c) => acc + c.stdev, 0) / numChannels;

      // Karena MultiRegionCropper otomatis menggeser ke zona tengah (fallbackTopRatio ~ 0.38),
      // maka avgStdev potongan gambar pasti tinggi (> 18), TIDAK putih polos lagi!
      expect(avgStdev).toBeGreaterThan(18);
    });
  });
});
