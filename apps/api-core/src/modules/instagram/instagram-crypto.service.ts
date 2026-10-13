import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';

const CIPHERTEXT_PREFIX = Buffer.from('IGTK', 'ascii');
const GCM_AAD = Buffer.from('polaris-instagram-token:v1', 'utf8');
const TENANT_KEY_INFO = Buffer.from('polaris-social-token-hkdf', 'utf8');

@Injectable()
export class InstagramTokenCryptoService {
  private readonly logger = new Logger(InstagramTokenCryptoService.name);

  private getMasterKey(): Buffer {
    const rawSecret = process.env.PII_ENCRYPTION_KEY || process.env.JWT_SECRET || '12345678901234567890123456789012';
    const normalizedKey = Buffer.from(rawSecret.padEnd(32, '0').slice(0, 32), 'utf8');
    return normalizedKey;
  }

  public deriveTenantKey(tenantId: string): Buffer {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('[CryptoError] Tenant ID wajib ada untuk menurunkan kunci token media sosial.');
    }

    const key = crypto.hkdfSync(
      'sha256',
      this.getMasterKey(),
      Buffer.from(tenantId.trim(), 'utf8'),
      TENANT_KEY_INFO,
      32
    );
    return Buffer.from(key);
  }

  public encryptToken(
    plainToken: string,
    tenantId: string
  ): { encryptedBuffer: Buffer; ivHex: string } {
    const cleanToken = plainToken.trim();
    if (!cleanToken) {
      throw new Error('[CryptoError] Token OAuth tidak boleh kosong.');
    }

    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.deriveTenantKey(tenantId), nonce);
    cipher.setAAD(GCM_AAD);
    const ciphertext = Buffer.concat([cipher.update(cleanToken, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedBuffer: Buffer.concat([CIPHERTEXT_PREFIX, authTag, ciphertext]),
      ivHex: nonce.toString('hex'),
    };
  }

  public decryptToken(
    encryptedData: Buffer | Uint8Array | string,
    ivHex: string,
    tenantId: string
  ): string {
    if (!encryptedData || !ivHex) return '';

    const encryptedBuffer = Buffer.isBuffer(encryptedData)
      ? encryptedData
      : typeof encryptedData === 'string'
        ? Buffer.from(encryptedData, 'hex')
        : Buffer.from(encryptedData);

    if (encryptedBuffer.length < CIPHERTEXT_PREFIX.length + 16) {
      throw new Error('[CryptoError] Ciphertext token tidak valid atau terpotong.');
    }

    const nonce = Buffer.from(ivHex, 'hex');
    const tagStart = CIPHERTEXT_PREFIX.length;
    const authTag = encryptedBuffer.subarray(tagStart, tagStart + 16);
    const ciphertext = encryptedBuffer.subarray(tagStart + 16);

    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.deriveTenantKey(tenantId), nonce);
      decipher.setAAD(GCM_AAD);
      decipher.setAuthTag(authTag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch (err: any) {
      this.logger.error(`[CryptoError] Gagal mendekripsi token akses Instagram: ${err.message}`);
      throw new Error('[CryptoError] Autentikasi tag gagal; token korup atau milik tenant lain.');
    }
  }
}
