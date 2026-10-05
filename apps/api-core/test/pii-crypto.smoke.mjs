import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PiiCryptoService } from '../dist/modules/constituent/pii-crypto.service.js';

if (!process.env.PII_ENCRYPTION_KEY) {
  process.env.PII_ENCRYPTION_KEY = '12345678901234567890123456789012';
}

const service = new PiiCryptoService();
const tenantA = '11111111-1111-4111-8111-111111111111';
const tenantB = '22222222-2222-4222-8222-222222222222';

const encrypted = service.encryptData('Nama warga', tenantA);
assert.equal(service.decryptData(encrypted.encryptedBuffer, encrypted.ivHex, tenantA), 'Nama warga');
assert.equal(
    service.decryptData(encrypted.encryptedBuffer, encrypted.ivHex, tenantB),
    '[Data Terproteksi / Gagal Dekripsi]'
);

const tampered = Buffer.from(encrypted.encryptedBuffer);
tampered[tampered.length - 1] ^= 1;
assert.equal(
    service.decryptData(tampered, encrypted.ivHex, tenantA),
    '[Data Terproteksi / Gagal Dekripsi]'
);

const masterKey = Buffer.from(process.env.PII_ENCRYPTION_KEY);
const legacyTenantKey = Buffer.from(crypto.hkdfSync(
    'sha256',
    masterKey,
    Buffer.from(tenantA),
    'polaris-citizen-pii-v1',
    32
));
const legacyIv = crypto.randomBytes(16);
const legacyCipher = crypto.createCipheriv('aes-256-cbc', legacyTenantKey, legacyIv);
const legacyCiphertext = Buffer.concat([
    legacyCipher.update('Legacy PII', 'utf8'),
    legacyCipher.final(),
]);
assert.equal(service.decryptData(legacyCiphertext, legacyIv.toString('hex'), tenantA), 'Legacy PII');

console.log('PII GCM isolation, tamper rejection, and tenant-key legacy decrypt passed');