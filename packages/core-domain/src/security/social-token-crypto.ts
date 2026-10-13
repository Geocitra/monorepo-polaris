import * as crypto from 'node:crypto';

const CIPHERTEXT_PREFIX = Buffer.from('IGTK', 'ascii');
const GCM_AAD = Buffer.from('polaris-instagram-token:v1', 'utf8');
const TENANT_KEY_INFO = Buffer.from('polaris-social-token-hkdf', 'utf8');

export class SocialTokenCrypto {
  private static getMasterKey(): Buffer {
    const rawSecret =
      process.env.PII_ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      '12345678901234567890123456789012';
    return Buffer.from(rawSecret.padEnd(32, '0').slice(0, 32), 'utf8');
  }

  public static deriveTenantKey(tenantId: string): Buffer {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('[CryptoError] Tenant ID wajib disertakan.');
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

  public static encrypt(
    plainToken: string,
    tenantId: string
  ): { encryptedBuffer: Buffer; ivHex: string } {
    const cleanToken = plainToken.trim();
    if (!cleanToken) throw new Error('[CryptoError] Token tidak boleh kosong.');

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

  public static decrypt(
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
      throw new Error('[CryptoError] Ciphertext token tidak valid.');
    }

    const nonce = Buffer.from(ivHex, 'hex');
    const tagStart = CIPHERTEXT_PREFIX.length;
    const authTag = encryptedBuffer.subarray(tagStart, tagStart + 16);
    const ciphertext = encryptedBuffer.subarray(tagStart + 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.deriveTenantKey(tenantId), nonce);
    decipher.setAAD(GCM_AAD);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}
