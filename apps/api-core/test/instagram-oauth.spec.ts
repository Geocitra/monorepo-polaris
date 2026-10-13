import { describe, it, expect, beforeEach } from 'vitest';
import { InstagramService } from '../src/modules/instagram/instagram.service.js';
import { InstagramTokenCryptoService } from '../src/modules/instagram/instagram-crypto.service.js';

describe('Instagram OAuth Handshake & State Security (Sub-Fase F.2)', () => {
  let service: InstagramService;
  let cryptoService: InstagramTokenCryptoService;
  const mockTenantId = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    process.env.INSTAGRAM_APP_ID = 'test-meta-app-123';
    process.env.INSTAGRAM_APP_SECRET = 'test-meta-secret-456';
    process.env.JWT_SECRET = 'super-secure-test-jwt-secret-2026';

    cryptoService = new InstagramTokenCryptoService();
    service = new InstagramService(cryptoService);
  });

  it('Invarian 1: Menghasilkan Authorization URL lengkap dengan scope dan signed state parameter', () => {
    const { authorizationUrl, state } = service.getAuthorizationUrl(mockTenantId);

    expect(authorizationUrl).toContain('https://www.instagram.com/oauth/authorize');
    expect(authorizationUrl).toContain('client_id=test-meta-app-123');
    expect(authorizationUrl).toContain('scope=instagram_business_basic%2Cinstagram_business_content_publish');
    expect(authorizationUrl).toContain(`state=${state}`);
    expect(state).toBeDefined();
  });

  it('Invarian 2: Berhasil memvalidasi signed state yang asli dan mengekstrak tenantId', () => {
    const state = service.generateSignedState(mockTenantId);
    const extracted = service.verifyAndExtractState(state);

    expect(extracted.tenantId).toBe(mockTenantId);
  });

  it('Invarian 3: Menolak state parameter yang telah dimanipulasi (Anti-Tampering / Anti-Hijacking)', () => {
    const validState = service.generateSignedState(mockTenantId);

    // Manipulasi signature di dalam payload
    const decoded = JSON.parse(Buffer.from(validState, 'base64url').toString('utf8'));
    decoded.signature = 'tampered_invalid_signature_hex';
    const tamperedState = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    expect(() => service.verifyAndExtractState(tamperedState)).toThrowError(
      /State parameter OAuth telah dimanipulasi/
    );

    // State berformat rusak juga wajib ditolak
    expect(() => service.verifyAndExtractState('corrupted_state_format')).toThrowError(
      /Format state parameter OAuth tidak valid/
    );
  });

  it('Invarian 4: Enkripsi AES-256-GCM berbasis HKDF terbukti aman dan dapat didekripsi dengan tenantId yang tepat', () => {
    const rawToken = 'IGQVJYtest_access_token_1234567890';
    const { encryptedBuffer, ivHex } = cryptoService.encryptToken(rawToken, mockTenantId);

    expect(encryptedBuffer).toBeInstanceOf(Buffer);
    expect(ivHex).toBeDefined();

    const decrypted = cryptoService.decryptToken(encryptedBuffer, ivHex, mockTenantId);
    expect(decrypted).toBe(rawToken);

    // Upaya dekripsi menggunakan tenant lain wajib gagal
    const wrongTenantId = '22222222-2222-4222-8222-222222222222';
    expect(() => cryptoService.decryptToken(encryptedBuffer, ivHex, wrongTenantId)).toThrowError(
      /Autentikasi tag gagal/
    );
  });
});
