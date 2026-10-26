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

  if (onProgress) {
    onProgress({
      key: 'upscale_complete',
      current: 100,
      total: 100,
      percentage: 100,
      message: 'Foto HD transparan siap digunakan!',
    });
  }

  return finalCanvas.toDataURL('image/png');
}

/**
 * Menghapus background foto menggunakan AI (@imgly/background-removal)
 * dan secara otomatis meningkatkan kualitas foto ke resolusi HD.
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

  // Jika tidak di-upscale, kembalikan langsung sebagai Data URL
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
