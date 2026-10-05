import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';

const CIPHERTEXT_V2_PREFIX = Buffer.from('PPI2', 'ascii');
const GCM_AAD = Buffer.from('polaris-citizen-pii:v2', 'utf8');
const TENANT_KEY_INFO = Buffer.from('polaris-citizen-pii-v1', 'utf8');
const DECRYPTION_FAILURE = '[Data Terproteksi / Gagal Dekripsi]';

@Injectable()
export class PiiCryptoService {
  private readonly logger = new Logger(PiiCryptoService.name);
  private readonly allowLegacyMasterKeyFallback = process.env.PII_ALLOW_LEGACY_MASTER_KEY_DECRYPTION === 'true';
  private cachedMasterKey?: Buffer;

  constructor() {
    if (this.allowLegacyMasterKeyFallback) {
      this.logger.warn('Legacy global-key PII decryption is enabled; disable it after legacy data migration.');
    }
  }

  private getMasterKey(): Buffer {
    if (this.cachedMasterKey) return this.cachedMasterKey;

    const rawSecret = process.env.PII_ENCRYPTION_KEY;
    if (!rawSecret || Buffer.byteLength(rawSecret, 'utf8') < 32) {
      throw new Error('PII_ENCRYPTION_KEY must be configured with at least 32 bytes of secret material.');
    }

    const normalizedKey = Buffer.from(rawSecret.padEnd(32, '0').slice(0, 32), 'utf8');
    if (normalizedKey.length !== 32) {
      throw new Error('PII_ENCRYPTION_KEY must normalize to exactly 32 UTF-8 bytes.');
    }
    this.cachedMasterKey = normalizedKey;
    return this.cachedMasterKey;
  }

  public deriveTenantKey(tenantId: string): Buffer {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('A tenant ID is required to derive a PII encryption key.');
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

  public encryptData(
    plainText: string,
    tenantIdOrOptions?: string | unknown,
    maybeTenantId?: string
  ): { encryptedBuffer: Buffer; ivHex: string } {
    const tenantId = (typeof maybeTenantId === 'string' && maybeTenantId)
      ? maybeTenantId
      : (typeof tenantIdOrOptions === 'string' ? tenantIdOrOptions : '');
    const cleanText = plainText.trim();
    if (!cleanText) throw new Error('PII plaintext must not be empty.');

    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.deriveTenantKey(tenantId), nonce);
    cipher.setAAD(GCM_AAD);
    const ciphertext = Buffer.concat([cipher.update(cleanText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedBuffer: Buffer.concat([CIPHERTEXT_V2_PREFIX, authTag, ciphertext]),
      ivHex: nonce.toString('hex'),
    };
  }

  public decryptData(
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
    if (encryptedBuffer.length === 0) return '';

    if (
      ivHex.length === 24 &&
      encryptedBuffer.subarray(0, CIPHERTEXT_V2_PREFIX.length).equals(CIPHERTEXT_V2_PREFIX)
    ) {
      return this.decryptV2(encryptedBuffer, ivHex, tenantId);
    }

    return this.decryptLegacyCbc(encryptedBuffer, ivHex, tenantId);
  }

  private decryptV2(encryptedBuffer: Buffer, nonceHex: string, tenantId: string): string {
    const nonce = this.parseHex(nonceHex, 12);
    if (!nonce || encryptedBuffer.length < CIPHERTEXT_V2_PREFIX.length + 16) {
      return this.failDecryption();
    }

    try {
      const tagStart = CIPHERTEXT_V2_PREFIX.length;
      const authTag = encryptedBuffer.subarray(tagStart, tagStart + 16);
      const ciphertext = encryptedBuffer.subarray(tagStart + 16);
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.deriveTenantKey(tenantId), nonce);
      decipher.setAAD(GCM_AAD);
      decipher.setAuthTag(authTag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch {
      return this.failDecryption();
    }
  }

  private decryptLegacyCbc(encryptedBuffer: Buffer, ivHex: string, tenantId: string): string {
    const iv = this.parseHex(ivHex, 16);
    if (!iv) return this.failDecryption();

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.deriveTenantKey(tenantId), iv);
      return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]).toString('utf8');
    } catch {
      if (!this.allowLegacyMasterKeyFallback) return this.failDecryption();
      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.getMasterKey(), iv);
        return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]).toString('utf8');
      } catch {
        return this.failDecryption();
      }
    }
  }

  private parseHex(value: string, expectedBytes: number): Buffer | null {
    if (value.length !== expectedBytes * 2 || !/^[0-9a-f]+$/i.test(value)) return null;
    return Buffer.from(value, 'hex');
  }

  private failDecryption(): string {
    this.logger.error('PII decryption failed authentication or key validation.');
    return DECRYPTION_FAILURE;
  }
}
