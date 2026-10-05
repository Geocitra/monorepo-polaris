import { describe, it, expect } from 'vitest';
import { PiiCryptoService } from '../src/modules/constituent/pii-crypto.service.js';

describe('PiiCryptoService (HKDF Multi-Tenant Cryptography)', () => {
  const cryptoService = new PiiCryptoService();

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  it('harus menghasilkan kunci derivasi 256-bit yang berbeda untuk tenant yang berbeda', () => {
    const keyA = cryptoService.deriveTenantKey(tenantA);
    const keyB = cryptoService.deriveTenantKey(tenantB);

    expect(keyA.length).toBe(32); // 256-bit
    expect(keyB.length).toBe(32);
    expect(keyA.equals(keyB)).toBe(false);
  });

  it('harus berhasil mengenkripsi dan mendekripsi data warga pada tenant yang sama', () => {
    const originalPhone = '081234567890';
    const encrypted = cryptoService.encryptData(originalPhone, undefined, tenantA);

    const decrypted = cryptoService.decryptData(encrypted.encryptedBuffer, encrypted.ivHex, tenantA);
    expect(decrypted).toBe(originalPhone);
  });

  it('wajib gagal mendekripsi jika ciphertext Dewan A dibuka menggunakan konteks Dewan B (Isolasi UU PDP)', () => {
    const sensitiveName = 'Budi Santoso (Konstituen Rahasia)';
    const encryptedForDewanA = cryptoService.encryptData(sensitiveName, undefined, tenantA);

    // Upaya pembobolan: Dewan B mencoba mendekripsi data milik Dewan A
    const attemptByDewanB = cryptoService.decryptData(
      encryptedForDewanA.encryptedBuffer,
      encryptedForDewanA.ivHex,
      tenantB
    );

    // Dekripsi harus gagal atau mengembalikan label proteksi, TIDAK BOLEH mengembalikan teks asli
    expect(attemptByDewanB).not.toBe(sensitiveName);
    expect(attemptByDewanB).toBe('[Data Terproteksi / Gagal Dekripsi]');
  });
});
