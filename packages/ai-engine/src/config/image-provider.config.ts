/**
 * Konfigurasi Provider Generator Gambar (Layer 1 Background Canvas)
 * 
 * Pengaturan Hardcode:
 * Anda dapat mengubah konstanta HARDCODED_IMAGE_PROVIDER di bawah ini:
 * - 'GOOGLE_IMAGEN' : Menggunakan Google Imagen 3 (imagen-3.0-generate-002) - Default
 * - 'OPENAI_DALLE'   : Menggunakan OpenAI DALL-E 3 / chatgpt-image-latest
 * 
 * Sistem juga mendukung override dinamis via file .env:
 * IMAGE_GENERATOR_PROVIDER=GOOGLE_IMAGEN | OPENAI_DALLE
 */

export type ImageGeneratorProvider = 'GOOGLE_IMAGEN' | 'OPENAI_DALLE';

// ============================================================================
// HARDCODED SWITCH (Ubah nilai di bawah ini untuk mengganti AI utama gambar)
// ============================================================================
export const HARDCODED_IMAGE_PROVIDER: ImageGeneratorProvider = 'GOOGLE_IMAGEN';

/**
 * Menentukan provider gambar aktif dengan prioritas:
 * 1. Environment variable IMAGE_GENERATOR_PROVIDER (jika disetel valid)
 * 2. Nilai hardcode HARDCODED_IMAGE_PROVIDER
 */
export function getActiveImageProvider(): ImageGeneratorProvider {
  const envProvider = process.env.IMAGE_GENERATOR_PROVIDER?.toUpperCase() as ImageGeneratorProvider | undefined;
  if (envProvider === 'GOOGLE_IMAGEN' || envProvider === 'OPENAI_DALLE') {
    return envProvider;
  }
  return HARDCODED_IMAGE_PROVIDER;
}
