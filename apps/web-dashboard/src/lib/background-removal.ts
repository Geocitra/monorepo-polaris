/**
 * Utility untuk menghapus background gambar otomatis menggunakan AI (@imgly/background-removal)
 * dan Super-Resolution HD Image Upscaler (Multi-pass resampling + smart edge sharpening & defringing).
 * Berjalan langsung di browser (client-side) tanpa memerlukan API key eksternal.
 */

export interface BackgroundRemovalProgress {
  key: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export type ProgressCallback = (progress: BackgroundRemovalProgress) => void;

export interface UpscaleOptions {
  targetMinHeight?: number; // default: 1600px
  maxDimension?: number;    // default: 2400px
  sharpen?: boolean;        // default: true
  sharpenStrength?: number; // default: 0.22
  defringe?: boolean;       // default: true
  standardizePortrait?: boolean; // default: true (format kanvas potret resmi 4:5 1280x1600 px)
  standardPortraitWidth?: number; // default: 1280
  standardPortraitHeight?: number; // default: 1600
}

export interface BackgroundRemovalOptions extends UpscaleOptions {
  autoUpscale?: boolean; // default: true
}

/**
 * Memuat gambar dari string (Data URL / URL), Blob, atau File ke HTMLImageElement
 */
function loadImageElement(source: string | Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (typeof source !== 'string') {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else {
      img.src = source;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar untuk diproses: ' + String(err)));
    };
  });
}

/**
 * Super-Resolution HD Image Upscaler:
 * Melakukan scale-up multi-pass berkualitas tinggi pada canvas,
 * dilengkapi Unsharp Mask (penajaman detail wajah/pakaian) dan Alpha Defringing.
 */
export async function upscaleImageToHD(
  imageSource: string | Blob | File,
  onProgress?: ProgressCallback,
  options?: UpscaleOptions
): Promise<string> {
  if (onProgress) {
    onProgress({
      key: 'upscale_init',
      current: 70,
      total: 100,
      percentage: 70,
      message: 'Menyiapkan pemrosesan Super-Resolution HD...',
    });
  }

  const img = await loadImageElement(imageSource);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const targetMinH = options?.targetMinHeight ?? 1600;
  const maxDim = options?.maxDimension ?? 2400;

  // Hitung faktor perbesaran
  let scale = 1;
  if (srcH < targetMinH) {
    scale = targetMinH / srcH;
  }
  if (srcW * scale < 1200) {
    scale = Math.max(scale, 1200 / srcW);
  }

  // Batasi dimensi maksimal agar tidak membebani memori browser
  if (srcH * scale > maxDim || srcW * scale > maxDim) {
    scale = Math.min(maxDim / srcH, maxDim / srcW);
  }

  // Jika resolusi awal sudah sangat besar (misal >= 1600px), skala minimal 1.0x jika diminta
  if (scale < 1.05 && (options?.sharpen ?? true)) {
    scale = 1.0;
  }

  const targetW = Math.max(srcW, Math.round(srcW * scale));
  const targetH = Math.max(srcH, Math.round(srcH * scale));

  if (onProgress) {
    onProgress({
      key: 'upscale_scaling',
      current: 80,
      total: 100,
      percentage: 80,
      message: `Meningkatkan resolusi ke HD (${targetW}x${targetH}px)...`,
    });
  }

  // Canvas untuk target akhir
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const ctx = finalCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Gagal menginisialisasi context canvas 2D');
  }

  // Multi-pass scaling jika scale > 1.7x untuk hasil lebih halus tanpa artefak
  if (scale > 1.7) {
    const midScale = Math.sqrt(scale);
    const midW = Math.round(srcW * midScale);
    const midH = Math.round(srcH * midScale);

    const midCanvas = document.createElement('canvas');
    midCanvas.width = midW;
    midCanvas.height = midH;
    const midCtx = midCanvas.getContext('2d');
    if (midCtx) {
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = 'high';
      midCtx.drawImage(img, 0, 0, midW, midH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(midCanvas, 0, 0, targetW, targetH);
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);
  }

  // Detail Enhancement: Smart Edge Sharpening & Defringing
  const doSharpen = options?.sharpen ?? true;
  const doDefringe = options?.defringe ?? true;

  if (doSharpen || doDefringe) {
    if (onProgress) {
      onProgress({
        key: 'upscale_sharpen',
        current: 90,
        total: 100,
        percentage: 90,
        message: 'Menajamkan detail kontur, wajah, dan busana...',
      });
    }

    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const srcPixels = new Uint8ClampedArray(imgData.data);
    const dstPixels = imgData.data;

    const k = options?.sharpenStrength ?? 0.22;
    const w = targetW;
    const h = targetH;

    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const idx = (rowOffset + x) * 4;
        const alpha = srcPixels[idx + 3];

        // Lewati area transparan total
        if (alpha < 20) continue;

        // Smart Defringing pada batas pinggir transparan (menghilangkan halo/border hitam)
        if (doDefringe && alpha >= 20 && alpha < 235) {
          const rIdx = (rowOffset + (x + 1)) * 4;
          const lIdx = (rowOffset + (x - 1)) * 4;
          const bIdx = ((y + 1) * w + x) * 4;
          const tIdx = ((y - 1) * w + x) * 4;

          // Jika ada tetangga yang solid, serap warna tetangga agar tepi bersih
          if (srcPixels[rIdx + 3] > 240) {
            dstPixels[idx] = srcPixels[rIdx];
            dstPixels[idx + 1] = srcPixels[rIdx + 1];
            dstPixels[idx + 2] = srcPixels[rIdx + 2];
            continue;
          } else if (srcPixels[lIdx + 3] > 240) {
            dstPixels[idx] = srcPixels[lIdx];
            dstPixels[idx + 1] = srcPixels[lIdx + 1];
            dstPixels[idx + 2] = srcPixels[lIdx + 2];
            continue;
          } else if (srcPixels[bIdx + 3] > 240) {
            dstPixels[idx] = srcPixels[bIdx];
            dstPixels[idx + 1] = srcPixels[bIdx + 1];
            dstPixels[idx + 2] = srcPixels[bIdx + 2];
            continue;
          } else if (srcPixels[tIdx + 3] > 240) {
            dstPixels[idx] = srcPixels[tIdx];
            dstPixels[idx + 1] = srcPixels[tIdx + 1];
            dstPixels[idx + 2] = srcPixels[tIdx + 2];
            continue;
          }
        }

        // Unsharp Masking pada piksel dominan opaque
        if (doSharpen && alpha >= 180) {
          const topIdx = ((y - 1) * w + x) * 4;
          const btmIdx = ((y + 1) * w + x) * 4;
          const lftIdx = (rowOffset + (x - 1)) * 4;
          const rgtIdx = (rowOffset + (x + 1)) * 4;

          // Hanya tajamkan jika tetangga juga opaque (hindari noise pada batas luar)
          if (
            srcPixels[topIdx + 3] > 50 &&
            srcPixels[btmIdx + 3] > 50 &&
            srcPixels[lftIdx + 3] > 50 &&
            srcPixels[rgtIdx + 3] > 50
          ) {
            for (let c = 0; c < 3; c++) {
              const center = srcPixels[idx + c];
              const top = srcPixels[topIdx + c];
              const bottom = srcPixels[btmIdx + c];
              const left = srcPixels[lftIdx + c];
              const right = srcPixels[rgtIdx + c];

              const sharpVal = center + k * (4 * center - top - bottom - left - right);
              dstPixels[idx + c] = Math.min(255, Math.max(0, Math.round(sharpVal)));
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // Standarisasi Kanvas Portrait 4:5 (1280x1600 px) dengan Pemusatan & Grounding Subjek
  let processedCanvas: HTMLCanvasElement = finalCanvas;
  const doStandardize = options?.standardizePortrait ?? true;
  if (doStandardize && typeof document !== 'undefined') {
    if (onProgress) {
      onProgress({
        key: 'upscale_standardize',
        current: 95,
        total: 100,
        percentage: 95,
        message: 'Menstandarisasi format kanvas foto profil resmi (4:5 HD)...',
      });
    }
    const stdW = options?.standardPortraitWidth ?? 1280;
    const stdH = options?.standardPortraitHeight ?? 1600;
    processedCanvas = formatToStandardPortrait(finalCanvas, stdW, stdH);
  }

  if (onProgress) {
    onProgress({
      key: 'upscale_complete',
      current: 100,
      total: 100,
      percentage: 100,
      message: 'Foto HD transparan siap digunakan!',
    });
  }

  return processedCanvas.toDataURL('image/png');
}

/**
 * Standarisasi gambar ke format kanvas resmi 4:5 Portrait (1280 x 1600 px).
 * Dilengkapi deteksi otomatis bounding-box subjek (non-transparan) dengan histogram thresholding
 * untuk mengabaikan noise/debu pemotongan AI, penyesuaian tinggi subjek proporsional (~92% tinggi kanvas),
 * pemusatan horizontal, dan peletakan grounded di bagian bawah kanvas persis standar foto profil dewan.
 */
export function formatToStandardPortrait(
  canvas: HTMLCanvasElement,
  targetW = 1280,
  targetH = 1600
): HTMLCanvasElement {
  const srcW = canvas.width;
  const srcH = canvas.height;
  const srcCtx = canvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return canvas;

  // 1. Ekstraksi data piksel kanvas sumber
  const imgData = srcCtx.getImageData(0, 0, srcW, srcH);
  const pixels = imgData.data;

  // Buat histogram densitas baris dan kolom untuk filter noise
  const rowCounts = new Uint32Array(srcH);
  const colCounts = new Uint32Array(srcW);
  let totalOpaquePixels = 0;

  for (let y = 0; y < srcH; y++) {
    const rowOffset = y * srcW;
    for (let x = 0; x < srcW; x++) {
      const alpha = pixels[(rowOffset + x) * 4 + 3];
      if (alpha > 30) {
        rowCounts[y]++;
        colCounts[x]++;
        totalOpaquePixels++;
      }
    }
  }

  // Buat kanvas target 4:5 HD (1280 x 1600 px)
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetW;
  outCanvas.height = targetH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return canvas;

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';

  const totalPixels = srcW * srcH;
  // Jika gambar tidak transparan (> 98% piksel padat) atau terlalu kosong (< 100 piksel)
  const isTransparent = totalOpaquePixels < totalPixels * 0.98 && totalOpaquePixels > 100;

  if (!isTransparent) {
    // Foto solid tanpa background transparan: contain di tengah dan grounded di bawah
    const scale = Math.min(targetW / srcW, targetH / srcH);
    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);
    const drawX = Math.round((targetW - drawW) / 2);
    const drawY = targetH - drawH;
    outCtx.drawImage(canvas, 0, 0, srcW, srcH, drawX, drawY, drawW, drawH);
    return outCanvas;
  }

  // 2. Tentukan batas subjek (bounding-box) dengan mengabaikan noise partikel terisolasi
  const minPixelsPerRow = Math.max(3, Math.round(srcW * 0.003));
  const minPixelsPerCol = Math.max(3, Math.round(srcH * 0.003));

  let minY = 0;
  while (minY < srcH && rowCounts[minY] < minPixelsPerRow) minY++;

  let maxY = srcH - 1;
  while (maxY >= 0 && rowCounts[maxY] < minPixelsPerRow) maxY--;

  let minX = 0;
  while (minX < srcW && colCounts[minX] < minPixelsPerCol) minX++;

  let maxX = srcW - 1;
  while (maxX >= 0 && colCounts[maxX] < minPixelsPerCol) maxX--;

  if (maxX <= minX || maxY <= minY) {
    // Fallback jika deteksi bounding-box gagal
    const scale = Math.min(targetW / srcW, targetH / srcH);
    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);
    const drawX = Math.round((targetW - drawW) / 2);
    const drawY = targetH - drawH;
    outCtx.drawImage(canvas, 0, 0, srcW, srcH, drawX, drawY, drawW, drawH);
    return outCanvas;
  }

  const subW = maxX - minX + 1;
  const subH = maxY - minY + 1;

  // 3. Hitung skala penyesuaian ukuran subjek agar proporsional dan konsisten:
  // Maksimum tinggi subjek ~92% dari kanvas (sisakan ~5-8% margin atas agar kepala tidak terpotong)
  // Maksimum lebar subjek ~92% dari kanvas (sisakan margin kiri/kanan)
  const maxAllowedH = Math.round(targetH * 0.92);
  const maxAllowedW = Math.round(targetW * 0.92);

  const fitScale = Math.min(maxAllowedH / subH, maxAllowedW / subW);
  const drawW = Math.round(subW * fitScale);
  const drawH = Math.round(subH * fitScale);

  // 4. Posisi:
  // Dipusatkan secara horizontal
  const drawX = Math.round((targetW - drawW) / 2);

  // Grounded di bagian bawah kanvas:
  // Jika subjek asli menyentuh batas bawah (misal potongan badan/kaki), sentuhkan ke dasar (0 margin).
  // Jika foto floating (misal pasfoto dada), beri sedikit margin dasar (~1.5% dari targetH).
  const isOriginalGrounded = maxY >= srcH - Math.max(5, Math.round(srcH * 0.01));
  const bottomMargin = isOriginalGrounded ? 0 : Math.round(targetH * 0.015);
  const drawY = Math.max(0, targetH - drawH - bottomMargin);

  // 5. Gambar subjek ke kanvas 4:5
  outCtx.drawImage(
    canvas,
    minX,
    minY,
    subW,
    subH,
    drawX,
    drawY,
    drawW,
    drawH
  );

  return outCanvas;
}

/**
 * Format string/blob/file gambar langsung ke kanvas 4:5 Portrait standar (1280x1600 px)
 */
export async function formatImageSourceToStandardPortrait(
  imageSource: string | Blob | File,
  targetW = 1280,
  targetH = 1600
): Promise<string> {
  const img = await loadImageElement(imageSource);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return typeof imageSource === 'string' ? imageSource : canvas.toDataURL('image/png');
  ctx.drawImage(img, 0, 0);
  const stdCanvas = formatToStandardPortrait(canvas, targetW, targetH);
  return stdCanvas.toDataURL('image/png');
}

/**
 * Menghapus background foto menggunakan AI (@imgly/background-removal)
 * dan secara otomatis meningkatkan kualitas foto ke resolusi HD serta menstandarisasi rasio ke 4:5.
 */
export async function removeImageBackground(
  imageSource: string | Blob | File,
  onProgress?: ProgressCallback,
  options?: BackgroundRemovalOptions
): Promise<string> {
  const autoUpscale = options?.autoUpscale ?? true;

  // Dynamic import agar tidak dieksekusi di server/SSR
  const { removeBackground } = await import('@imgly/background-removal');

  const blobResult = await removeBackground(imageSource, {
    model: 'isnet_quint8', // Model terkuantisasi (~40MB), lebih cepat & hemat memori
    output: {
      format: 'image/png',
      quality: 0.95,
    },
    progress: (key: string, current: number, total: number) => {
      let percentage = 0;
      if (total > 0) {
        // Alokasikan 0-65% untuk penghapusan background
        const subPercent = Math.min(100, Math.round((current / total) * 100));
        percentage = autoUpscale ? Math.round(subPercent * 0.65) : subPercent;
      }

      let message = 'Memproses foto...';
      if (key.includes('fetch')) {
        message = `Mengunduh model AI background (${percentage}%)...`;
      } else if (key.includes('compute') || key.includes('onnx')) {
        message = `AI mendeteksi & memotong background (${percentage}%)...`;
      }

      if (onProgress) {
        onProgress({ key, current, total, percentage, message });
      }
    },
  });

  // Jika autoUpscale diaktifkan, lanjutkan ke Super-Resolution HD Upscaler
  if (autoUpscale && typeof window !== 'undefined') {
    return await upscaleImageToHD(blobResult, onProgress, options);
  }

  // Jika tidak di-upscale tapi standarisasi aktif, format kanvas ke 4:5 Portrait
  if ((options?.standardizePortrait ?? true) && typeof window !== 'undefined') {
    const rawImg = await loadImageElement(blobResult);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rawImg.naturalWidth || rawImg.width;
    tempCanvas.height = rawImg.naturalHeight || rawImg.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(rawImg, 0, 0);
      const stdCanvas = formatToStandardPortrait(tempCanvas, 1280, 1600);
      return stdCanvas.toDataURL('image/png');
    }
  }

  // Fallback: kembalikan langsung sebagai Data URL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal mengonversi hasil foto ke format URL'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca blob hasil foto'));
    reader.readAsDataURL(blobResult);
  });
}
