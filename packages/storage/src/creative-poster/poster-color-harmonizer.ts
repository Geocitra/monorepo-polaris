import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'node:path';
import type { PosterLayerManifest, PosterLayer } from './poster-layer-manifest.js';

/**
 * Mengecek apakah suatu warna (Hex, RGB, RGBA) tergolong gelap (luminance < 128).
 */
export function isColorDark(colorStr?: string | null): boolean {
  if (!colorStr) return false;
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
  }
  const m = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
  }
  return false;
}

/**
 * Mengecek apakah suatu warna adalah warna netral (hitam/abu-abu/slate)
 * dan bukan warna aksen kromat/jenuh (seperti hijau, merah, emas, oranye).
 */
export function isColorNeutral(colorStr?: string | null): boolean {
  if (!colorStr) return true;
  let r = 0;
  let g = 0;
  let b = 0;
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else {
    const m = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) {
      r = parseInt(m[1], 10);
      g = parseInt(m[2], 10);
      b = parseInt(m[3], 10);
    }
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 40;
}

export class PosterColorHarmonizer {
  private static resolveSafeLocalUpload(imageInput: string): string | null {
    const cleanRel = imageInput
      .replace(/^https?:\/\/[^/]+\//, '')
      .replace(/^file:\/\/\/?/, '')
      .replace(/[?#].*$/, '')
      .replace(/^\/+/, '');
    if (!cleanRel.startsWith('uploads/')) return null;

    let decodedRel = cleanRel;
    try {
      decodedRel = decodeURIComponent(cleanRel);
    } catch {
      return null;
    }

    const candidateRoots = Array.from(
      new Set([
        path.resolve(process.cwd(), 'uploads'),
        path.resolve(process.cwd(), '../../uploads'),
      ])
    );

    for (const uploadsRoot of candidateRoots) {
      const candidate = path.resolve(path.dirname(uploadsRoot), decodedRel);
      if (candidate.startsWith(uploadsRoot + path.sep) && fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  private static async loadSharp(imageInput: Buffer | string): Promise<sharp.Sharp | null> {
    if (typeof imageInput === 'string') {
      const localUpload = this.resolveSafeLocalUpload(imageInput);
      if (localUpload) {
        return sharp(localUpload);
      }
      if (imageInput.startsWith('data:')) {
        const b64 = imageInput.split(',')[1] || '';
        return sharp(Buffer.from(b64, 'base64'));
      }
      if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        try {
          const res = await fetch(imageInput);
          if (!res.ok) return null;
          const ab = await res.arrayBuffer();
          return sharp(Buffer.from(ab));
        } catch {
          return null;
        }
      }
      if (fs.existsSync(imageInput)) {
        return sharp(imageInput);
      }
      return null;
    }
    return sharp(imageInput);
  }

  /**
   * Memotong area tertentu dari gambar poster menjadi buffer PNG
   * untuk mengekstrak elemen foto/ilustrasi/logo menjadi layer gambar terpisah.
   */
  static async cropRegionToPng(
    imageInput: Buffer | string,
    box: { x: number; y: number; w: number; h: number; refWidth: number; refHeight: number }
  ): Promise<Buffer | null> {
    try {
      const imageSharp = await this.loadSharp(imageInput);
      if (!imageSharp) return null;

      const meta = await imageSharp.metadata();
      const imgW = meta.width || box.refWidth || 1080;
      const imgH = meta.height || box.refHeight || 1350;
      const scaleX = imgW / (box.refWidth || 1080);
      const scaleY = imgH / (box.refHeight || 1350);

      const left = Math.max(0, Math.min(imgW - 2, Math.round(box.x * scaleX)));
      const top = Math.max(0, Math.min(imgH - 2, Math.round(box.y * scaleY)));
      const width = Math.max(2, Math.min(imgW - left, Math.round(box.w * scaleX)));
      const height = Math.max(2, Math.min(imgH - top, Math.round(box.h * scaleY)));

      return await imageSharp.clone().extract({ left, top, width, height }).png().toBuffer();
    } catch {
      return null;
    }
  }

  /**
   * Memotong ornamen grafis (cipratan cat, panah, stiker) menjadi PNG RGBA transparan
   * dengan menghapus warna kertas di perimeter luar menggunakan Soft Alpha Matting.
   */
  static async cropOrnamentWithAlpha(
    imageInput: Buffer | string,
    box: { x: number; y: number; w: number; h: number; refWidth: number; refHeight: number }
  ): Promise<Buffer | null> {
    try {
      const imageSharp = await this.loadSharp(imageInput);
      if (!imageSharp) return null;

      const meta = await imageSharp.metadata();
      const imgW = meta.width || box.refWidth || 1080;
      const imgH = meta.height || box.refHeight || 1350;
      const scaleX = imgW / (box.refWidth || 1080);
      const scaleY = imgH / (box.refHeight || 1350);

      const left = Math.max(0, Math.min(imgW - 2, Math.round(box.x * scaleX)));
      const top = Math.max(0, Math.min(imgH - 2, Math.round(box.y * scaleY)));
      const width = Math.max(2, Math.min(imgW - left, Math.round(box.w * scaleX)));
      const height = Math.max(2, Math.min(imgH - top, Math.round(box.h * scaleY)));

      const { data: raw } = await imageSharp
        .clone()
        .extract({ left, top, width, height })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const borderR: number[] = [];
      const borderG: number[] = [];
      const borderB: number[] = [];
      const pushBorder = (x: number, y: number) => {
        const idx = (y * width + x) * 4;
        borderR.push(raw[idx]);
        borderG.push(raw[idx + 1]);
        borderB.push(raw[idx + 2]);
      };
      for (let x = 0; x < width; x++) {
        pushBorder(x, 0);
        pushBorder(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        pushBorder(0, y);
        pushBorder(width - 1, y);
      }
      borderR.sort((a, b) => a - b);
      borderG.sort((a, b) => a - b);
      borderB.sort((a, b) => a - b);
      const mid = Math.floor(borderR.length / 2);
      const bgR = borderR[mid] ?? 240;
      const bgG = borderG[mid] ?? 236;
      const bgB = borderB[mid] ?? 228;

      const SOFT_LOW = 26;
      const SOFT_HIGH = 50;
      for (let i = 0; i < raw.length; i += 4) {
        const dr = raw[i] - bgR;
        const dg = raw[i + 1] - bgG;
        const db = raw[i + 2] - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist <= SOFT_LOW) {
          raw[i + 3] = 0;
        } else if (dist < SOFT_HIGH) {
          raw[i + 3] = Math.round(((dist - SOFT_LOW) / (SOFT_HIGH - SOFT_LOW)) * 255);
        }
      }

      return await sharp(raw, { raw: { width, height, channels: 4 } }).png().toBuffer();
    } catch {
      return null;
    }
  }

  /**
   * Menyelaraskan seluruh warna frame dan teks dalam PosterLayerManifest 1:1 dengan piksel asli gambar.
   * Mendeteksi otomatis apakah kartu dan container di gambar poster aslinya berwarna gelap atau terang,
   * lalu mengoreksi fill frame dan warna teks secara presisi tanpa hardcoding.
   */
  static async harmonizeManifest(
    manifest: PosterLayerManifest,
    imageInput: Buffer | string
  ): Promise<PosterLayerManifest> {
    if (!manifest?.layers || manifest.layers.length === 0) {
      return manifest;
    }

    try {
      const imageSharp = await this.loadSharp(imageInput);
      if (!imageSharp) return manifest;

      const meta = await imageSharp.metadata();
      const imgW = meta.width || manifest.width || 1080;
      const imgH = meta.height || manifest.height || 1350;

      const scaleX = imgW / (manifest.width || 1080);
      const scaleY = imgH / (manifest.height || 1350);

      const harmonizedLayers: PosterLayer[] = JSON.parse(JSON.stringify(manifest.layers));
      const frameLayers = harmonizedLayers.filter((l) => l.kind === 'frame');
      const textLayers = harmonizedLayers.filter((l) => l.kind === 'text');

      for (const frame of frameLayers) {
        // Abaikan garis pembatas tipis (height <= 4 atau width <= 4)
        if (frame.w <= 4 || frame.h <= 4) continue;

        const fx = Math.round(frame.x * scaleX);
        const fy = Math.round(frame.y * scaleY);
        const fw = Math.round(frame.w * scaleX);
        const fh = Math.round(frame.h * scaleY);

        const padX = Math.round(fw * 0.15);
        const padY = Math.round(fh * 0.15);
        const sampleW = Math.max(10, Math.min(60, Math.round(fw * 0.4)));
        const sampleH = Math.max(10, Math.min(60, Math.round(fh * 0.4)));

        const left = Math.round(Math.max(0, Math.min(imgW - sampleW, fx + padX)));
        const top = Math.round(Math.max(0, Math.min(imgH - sampleH, fy + padY)));
        const sW = Math.round(sampleW);
        const sH = Math.round(sampleH);

        try {
          const patchStats = await imageSharp
            .clone()
            .extract({ left, top, width: sW, height: sH })
            .stats();

          const [r, g, b] = patchStats.channels.map((c) => Math.round(c.mean));
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const isDarkCard = luminance < 125 || isColorDark(frame.fill);

          if (isDarkCard) {
            // Latar kartu pada gambar ASLI adalah GELAP (misal #0F172B / #14201B / #DC2626)
            // Hanya isi jika belum ada fill khusus atau jika fill saat ini putih default
            if (!frame.fill || frame.fill === '#FFFFFF') {
              const sampledHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
              frame.fill = sampledHex;
            }

            // Sesuaikan border frame agar kontras dengan kartu gelap
            if (frame.borders) {
              const borderKeys: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
              for (const k of borderKeys) {
                const bSide = frame.borders[k];
                if (bSide && isColorNeutral(bSide.color) && isColorDark(bSide.color)) {
                  bSide.color = 'rgba(255, 255, 255, 0.12)';
                }
              }
            }

            // Selaraskan semua teks yang berada di dalam frame gelap ini
            for (const text of textLayers) {
              const tx = text.x;
              const ty = text.y;
              const isInside =
                tx >= frame.x - 12 &&
                tx + text.w <= frame.x + frame.w + 12 &&
                ty >= frame.y - 12 &&
                ty + text.h <= frame.y + frame.h + 12;

              if (isInside) {
                // Pertahankan badge tombol dengan background solid sendiri (misal DIMENSI 01 dengan box.fill aksen)
                if (text.box?.fill) continue;

                // Jangan ubah teks aksen berwarna cerah (seperti tahun hijau/emas atau kicker aksen)
                const isAccentRole = text.role.includes('year') || (text.role.includes('kicker') && !isColorNeutral(text.color));
                if (isAccentRole) continue;

                // Jika teks netral berwarna gelap, ubah menjadi TERANG agar kontras & 100% terbaca
                if (isColorDark(text.color) || text.role.includes('banner')) {
                  if (text.role.includes('headline') || text.role.includes('title') || text.role.includes('banner')) {
                    text.color = '#FFFFFF';
                  } else if (text.role.includes('desc') || text.role.includes('body')) {
                    text.color = '#F1F5F9';
                  } else if (text.role.includes('deck')) {
                    text.color = '#E2E8F0';
                  } else if (text.role.includes('lbl') || text.role.includes('label')) {
                    text.color = '#CBD5E1';
                  } else {
                    text.color = '#FFFFFF';
                  }
                }
              }
            }
          } else {
            // Latar kartu pada gambar ASLI adalah TERANG (misal #FFFFFF / cream)
            // Cek apakah frame ini sebenarnya menyatu dengan background kertas sekitar (tidak punya warna kartu berbeda)
            const outerY = Math.max(0, fy - 6);
            const outerX = Math.max(0, fx - 6);
            let isRedundantPaperFrame = false;
            if (!frame.role.includes('banner') && (outerY !== fy || outerX !== fx)) {
              try {
                const outerStats = await imageSharp
                  .clone()
                  .extract({ left: outerX, top: outerY, width: Math.min(20, imgW - outerX), height: 4 })
                  .stats();
                const [or, og, ob] = outerStats.channels.map((c) => Math.round(c.mean));
                const colorDiff = Math.abs(r - or) + Math.abs(g - og) + Math.abs(b - ob);
                if (colorDiff < 20) {
                  isRedundantPaperFrame = true;
                }
              } catch {}
            }

            if (isRedundantPaperFrame) {
              (frame as any)._dropRedundant = true;
            } else if (!frame.fill || frame.fill.startsWith('rgb(')) {
              frame.fill = `rgb(${r}, ${g}, ${b})`;
            }

            // Selaraskan semua teks yang berada di dalam frame terang ini
            for (const text of textLayers) {
              const tx = text.x;
              const ty = text.y;
              const isInside =
                tx >= frame.x - 12 &&
                tx + text.w <= frame.x + frame.w + 12 &&
                ty >= frame.y - 12 &&
                ty + text.h <= frame.y + frame.h + 12;

              if (isInside) {
                if (text.box?.fill) continue;
                const isAccentRole = text.role.includes('year') || (text.role.includes('kicker') && !isColorNeutral(text.color));
                if (isAccentRole) continue;

                if (!isColorDark(text.color)) {
                  if (text.role.includes('headline') || text.role.includes('title')) {
                    text.color = '#0F172A';
                  } else if (text.role.includes('desc') || text.role.includes('body')) {
                    text.color = '#1E293B';
                  } else if (text.role.includes('deck')) {
                    text.color = '#334155';
                  } else if (text.role.includes('lbl') || text.role.includes('label')) {
                    text.color = '#475569';
                  } else {
                    text.color = '#0F172A';
                  }
                }
              }
            }
          }
        } catch {
          // Lewatkan jika sampling patch tertentu gagal
        }
      }

      const finalLayers = harmonizedLayers.filter((l) => !(l as any)._dropRedundant);

      return {
        ...manifest,
        layers: finalLayers,
      };
    } catch {
      return manifest;
    }
  }
}
