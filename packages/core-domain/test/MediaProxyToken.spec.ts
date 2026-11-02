import { describe, it, expect } from 'vitest';
import { MediaProxyToken } from '../src/security/media-proxy-token.js';

describe('MediaProxyToken', () => {
  const sampleUrl = 'https://res.cloudinary.com/zvjx0rwj/image/upload/v1793340882/polaris/sample.webp';

  it('harus menandatangani dan memverifikasi URL yang sah', () => {
    const token = MediaProxyToken.signUrl(sampleUrl, 3600);
    expect(token).toBeDefined();
    expect(token.includes('.')).toBe(true);

    const verifiedUrl = MediaProxyToken.verifyToken(token);
    expect(verifiedUrl).toBe(sampleUrl);
  });

  it('harus menolak token yang dimodifikasi / di-tamper', () => {
    const token = MediaProxyToken.signUrl(sampleUrl, 3600);
    const tampered = token.slice(0, -4) + 'abcd';
    expect(() => MediaProxyToken.verifyToken(tampered)).toThrowError(/Tanda tangan HMAC tidak sah/);
  });

  it('harus menolak token yang telah kedaluwarsa', () => {
    // TTL -10 detik
    const expiredToken = MediaProxyToken.signUrl(sampleUrl, -10);
    expect(() => MediaProxyToken.verifyToken(expiredToken)).toThrowError(/telah kedaluwarsa/);
  });

  it('harus menolak target URL lokal / internal (Anti-SSRF)', () => {
    const localhostUrl = 'http://localhost:5432/evil';
    const token = MediaProxyToken.signUrl(localhostUrl, 3600);
    expect(() => MediaProxyToken.verifyToken(token)).toThrowError(/SSRF/);
  });
});

