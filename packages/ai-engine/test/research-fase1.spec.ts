import { describe, it, expect } from 'vitest';
import {
  canonicalizeUrl,
  isPrivateOrReservedIp,
  assertSafePublicUrl,
} from '../src/research/utils/url-security.util.js';
import { resolveRegionScopes } from '../src/research/utils/region-hierarchy.util.js';
import { WebDiscoveryConnector } from '../src/research/connectors/web-discovery.connector.js';

describe('Fase 1 Research Foundation - Security, Region Hierarchy & Readability', () => {
  it('canonicalizeUrl harus menghapus parameter tracking dan menolak protokol non-HTTP', () => {
    const cleaned = canonicalizeUrl(
      'https://news.detik.com/berita/d-12345/pupuk-subsidi?utm_source=ig&fbclid=abc&page=2#komentar'
    );
    expect(cleaned).toBe('https://news.detik.com/berita/d-12345/pupuk-subsidi?page=2');
    expect(canonicalizeUrl('javascript:alert(1)')).toBeNull();
    expect(canonicalizeUrl('file:///etc/passwd')).toBeNull();
  });

  it('SSRF Guard harus memblokir IP privat, loopback, metadata cloud, dan hostname internal', async () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.12.0.5')).toBe(true);
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.10')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);

    await expect(assertSafePublicUrl('http://localhost:3000/api')).rejects.toThrow(/SSRF Guard/);
    await expect(assertSafePublicUrl('http://169.254.169.254/latest/meta-data')).rejects.toThrow(/SSRF Guard/);
    await expect(assertSafePublicUrl('http://10.0.0.1/admin')).rejects.toThrow(/SSRF Guard/);
  });

  it('resolveRegionScopes harus memetakan kabupaten/kota ke provinsi dan nasional', () => {
    const scopes = resolveRegionScopes('Kabupaten Bandung');
    expect(scopes).toContain('KABUPATEN_BANDUNG');
    expect(scopes).toContain('JAWA_BARAT');
    expect(scopes).toContain('NASIONAL');
    expect(scopes).toContain('ALL');
  });

  it('WebDiscoveryConnector.extractReadableArticle harus mengekstrak konten utama via Readability tanpa noise navigasi', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Distribusi Pupuk Subsidi di Jawa Barat Meningkat</title></head>
        <body>
          <nav><a href="/">Beranda</a> <a href="/olahraga">Liga Inggris</a></nav>
          <article>
            <h1>Distribusi Pupuk Subsidi di Jawa Barat Meningkat</h1>
            <p>Pemerintah Provinsi Jawa Barat mencatat peningkatan penyaluran pupuk bersubsidi sebesar 18 persen pada kuartal pertama tahun ini untuk mendukung produktivitas petani padi di Kabupaten Bandung dan Karawang.</p>
            <p>Kepala Dinas Pertanian menyampaikan bahwa integrasi kartu tani digital mempercepat verifikasi kelompok tani penerima manfaat di tingkat desa sehingga antrean distribusi berkurang signifikan.</p>
          </article>
          <footer>Copyright 2026 Portal Berita</footer>
        </body>
      </html>
    `;

    const result = WebDiscoveryConnector.extractReadableArticle(
      sampleHtml,
      'https://jabar.antaranews.com/berita/123/pupuk-subsidi'
    );

    expect(result.title).toContain('Distribusi Pupuk Subsidi');
    expect(result.extractedText).toContain('penyaluran pupuk bersubsidi sebesar 18 persen');
    expect(result.extractedText).not.toContain('Liga Inggris');
  });
});

