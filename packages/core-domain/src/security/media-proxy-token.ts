import * as crypto from 'node:crypto';

export interface SignedProxyPayload {
  u: string; // Target URL
  e: number; // Expiry timestamp (ms)
}

export class MediaProxyToken {
  private static getSecretKey(): Buffer {
    const rawSecret =
      process.env.PII_ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'polaris-media-proxy-secret-key-32b';
    return Buffer.from(rawSecret.padEnd(32, '0').slice(0, 32), 'utf8');
  }

  /**
   * Menghasilkan token bertanda tangan HMAC (URL-safe base64)
   * Masa berlaku default: 2 jam (7200 detik)
   */
  public static signUrl(targetUrl: string, ttlSeconds: number = 7200): string {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      throw new Error('[MediaProxyError] URL harus berprotokol HTTP/HTTPS.');
    }

    const payload: SignedProxyPayload = {
      u: cleanUrl,
      e: Date.now() + ttlSeconds * 1000,
    };

    const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', this.getSecretKey());
    hmac.update(serialized);
    const signature = hmac.digest('base64url');

    return `${serialized}.${signature}`;
  }

  /**
   * Memverifikasi token tanda tangan dan mengembalikan target URL jika sah & belum kedaluwarsa
   */
  public static verifyToken(token: string): string {
    if (!token || typeof token !== 'string') {
      throw new Error('[MediaProxyError] Token tidak valid.');
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new Error('[MediaProxyError] Format token tidak sesuai.');
    }

    const [serialized, signature] = parts;

    // Verifikasi HMAC dengan timingSafeEqual untuk mencegah timing attack
    const hmac = crypto.createHmac('sha256', this.getSecretKey());
    hmac.update(serialized);
    const expectedSig = hmac.digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error('[MediaProxyError] Tanda tangan HMAC tidak sah (tampered token).');
    }

    let payload: SignedProxyPayload;
    try {
      payload = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8'));
    } catch {
      throw new Error('[MediaProxyError] Muatan token gagal diurai.');
    }

    if (!payload.u || !payload.e) {
      throw new Error('[MediaProxyError] Format payload tidak lengkap.');
    }

    if (Date.now() > payload.e) {
      throw new Error('[MediaProxyError] Token tanda tangan media telah kedaluwarsa.');
    }

    // SSRF Prevention: Hanya izinkan HTTPS/HTTP dan tolak IP privat / internal host
    const parsedUrl = new URL(payload.u);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error('[MediaProxyError] Protokol URL tidak diizinkan.');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '172.17.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      throw new Error('[MediaProxyError] Target URL berada di jaringan privat (SSRF dicegah).');
    }

    return payload.u;
  }
}
