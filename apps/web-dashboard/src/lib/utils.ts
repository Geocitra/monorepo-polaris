import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndonesian(dateString?: string | Date | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} menit baca`;
}

/**
 * Mengunduh berkas gambar secara andal ke perangkat lokal pengguna.
 * Mengatasi batasan browser HTML5 dimana URL lintas domain (cross-origin CDN/S3/R2)
 * pada tag <a download> diabaikan oleh browser dan hanya membuka tab baru.
 */
export async function downloadImageFile(url: string, filename: string): Promise<boolean> {
  if (!url || typeof window === 'undefined') return false;

  const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.webp')
    ? filename
    : `${filename}.jpg`;

  // 1. Jika URL sudah berupa blob: atau data: URL, trigger link download langsung
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  // 2. Strategi Direct fetch -> blob (memaksa unduh langsung ke folder Downloads)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      return true;
    }
  } catch {
    // Abaikan dan lanjut ke fallback canvas
  }

  // 3. Strategi Canvas Draw (jika fetch terhalang CORS direct)
  try {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95)
      );
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = cleanFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
        return true;
      }
    }
  } catch {
    // Canvas tainted atau CORS error
  }

  // 4. Fallback Terakhir: Buka link download langsung di browser
  const fallbackLink = document.createElement('a');
  fallbackLink.href = url;
  fallbackLink.download = cleanFilename;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener noreferrer';
  document.body.appendChild(fallbackLink);
  fallbackLink.click();
  document.body.removeChild(fallbackLink);
  return true;
}
