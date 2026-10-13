import { describe, it, expect } from 'vitest';
import { ConnectedSocialAccount } from '../src/entities/ConnectedSocialAccount.js';
import { SocialPlatform, SocialAccountStatus } from '@polaris/shared-types';

describe('ConnectedSocialAccount Domain Entity (GRASP Information Expert)', () => {
  const dummyBuffer = Buffer.from('encrypted_payload_bytes');
  const now = new Date();

  it('harus berhasil menginisialisasi entitas dengan pembersihan handle @username', () => {
    const account = new ConnectedSocialAccount({
      id: 'acc-1',
      tenantId: 'tenant-1',
      platform: SocialPlatform.INSTAGRAM,
      accountType: 'CREATOR',
      externalAccountId: 'ig-123456789',
      accountHandle: '@ahmadfauzi_dpr',
      encryptedAccessToken: dummyBuffer,
      tokenIv: 'abcdef0123456789',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 hari
    });

    expect(account.accountHandle).toBe('ahmadfauzi_dpr'); // Bersih dari '@'
    expect(account.isOperational()).toBe(true);
    expect(account.isExpired()).toBe(false);
    expect(account.needsRefresh()).toBe(false);
  });

  it('harus mendeteksi needsRefresh = true saat token tersisa <= 15 hari', () => {
    const expiresSoon = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 hari lagi
    const account = new ConnectedSocialAccount({
      id: 'acc-2',
      tenantId: 'tenant-1',
      platform: SocialPlatform.INSTAGRAM,
      accountType: 'BUSINESS',
      externalAccountId: 'ig-987654321',
      accountHandle: 'budi_santoso',
      encryptedAccessToken: dummyBuffer,
      tokenIv: 'iv_vector_hex',
      tokenExpiresAt: expiresSoon,
    });

    expect(account.needsRefresh()).toBe(true);
    expect(account.isOperational()).toBe(true);
  });

  it('harus menandai status REAUTHORIZATION_REQUIRED saat terjadi pemutusan sesi', () => {
    const account = new ConnectedSocialAccount({
      id: 'acc-3',
      tenantId: 'tenant-1',
      platform: SocialPlatform.INSTAGRAM,
      accountType: 'BUSINESS',
      externalAccountId: 'ig-112233',
      accountHandle: 'dewan_jabar',
      encryptedAccessToken: dummyBuffer,
      tokenIv: 'iv_hex',
      tokenExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    });

    account.markReauthorizationRequired('Error 190: Password changed on Instagram mobile app');
    expect(account.status).toBe(SocialAccountStatus.REAUTHORIZATION_REQUIRED);
    expect(account.isOperational()).toBe(false);
    expect(account.lastErrorMessage).toContain('Password changed');
  });
});
