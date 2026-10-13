import { SocialPlatform, SocialAccountStatus } from '@polaris/shared-types';

export interface ConnectedSocialAccountProps {
  id: string;
  tenantId: string;
  platform: SocialPlatform;
  accountType: 'BUSINESS' | 'CREATOR';
  externalAccountId: string;
  facebookPageId?: string | null;
  accountHandle: string;
  accountName?: string | null;
  profilePictureUrl?: string | null;
  encryptedAccessToken: Buffer;
  tokenIv: string;
  tokenExpiresAt: Date;
  tokenLastRefreshedAt?: Date | null;
  status?: SocialAccountStatus;
  lastErrorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ConnectedSocialAccount {
  public static readonly REFRESH_THRESHOLD_DAYS = 15;

  public readonly id: string;
  public readonly tenantId: string;
  public readonly platform: SocialPlatform;
  public readonly accountType: 'BUSINESS' | 'CREATOR';
  public readonly externalAccountId: string;
  public facebookPageId: string | null;
  public accountHandle: string;
  public accountName: string | null;
  public profilePictureUrl: string | null;
  public encryptedAccessToken: Buffer;
  public tokenIv: string;
  public tokenExpiresAt: Date;
  public tokenLastRefreshedAt: Date | null;
  public status: SocialAccountStatus;
  public lastErrorMessage: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ConnectedSocialAccountProps) {
    if (!props.accountHandle || props.accountHandle.trim().length === 0) {
      throw new Error('[DomainInvariantError] Account handle (@username) tidak boleh kosong.');
    }
    if (!props.externalAccountId || props.externalAccountId.trim().length === 0) {
      throw new Error('[DomainInvariantError] External account ID Meta wajib disertakan.');
    }
    if (!props.encryptedAccessToken || props.encryptedAccessToken.length === 0) {
      throw new Error('[DomainInvariantError] Kredensial token terenkripsi wajib ada.');
    }

    this.id = props.id;
    this.tenantId = props.tenantId;
    this.platform = props.platform;
    this.accountType = props.accountType;
    this.externalAccountId = props.externalAccountId;
    this.facebookPageId = props.facebookPageId || null;
    this.accountHandle = props.accountHandle.replace(/^@/, '').trim();
    this.accountName = props.accountName || null;
    this.profilePictureUrl = props.profilePictureUrl || null;
    this.encryptedAccessToken = props.encryptedAccessToken;
    this.tokenIv = props.tokenIv;
    this.tokenExpiresAt = props.tokenExpiresAt;
    this.tokenLastRefreshedAt = props.tokenLastRefreshedAt || null;
    this.status = props.status || SocialAccountStatus.ACTIVE;
    this.lastErrorMessage = props.lastErrorMessage || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public isOperational(): boolean {
    return this.status === SocialAccountStatus.ACTIVE && !this.isExpired();
  }

  public isExpired(): boolean {
    return new Date() >= this.tokenExpiresAt;
  }

  public needsRefresh(): boolean {
    if (!this.isOperational()) return false;
    const thresholdMs = ConnectedSocialAccount.REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
    const timeUntilExpiry = this.tokenExpiresAt.getTime() - Date.now();
    return timeUntilExpiry <= thresholdMs;
  }

  public updateToken(newEncryptedToken: Buffer, newIv: string, newExpiresAt: Date): void {
    this.encryptedAccessToken = newEncryptedToken;
    this.tokenIv = newIv;
    this.tokenExpiresAt = newExpiresAt;
    this.tokenLastRefreshedAt = new Date();
    this.status = SocialAccountStatus.ACTIVE;
    this.lastErrorMessage = null;
    this.updatedAt = new Date();
  }

  public markReauthorizationRequired(reason: string): void {
    this.status = SocialAccountStatus.REAUTHORIZATION_REQUIRED;
    this.lastErrorMessage = reason;
    this.updatedAt = new Date();
  }

  public markRevoked(reason?: string): void {
    this.status = SocialAccountStatus.REVOKED;
    this.lastErrorMessage = reason || 'Koneksi dicabut oleh pengguna atau sistem Meta.';
    this.updatedAt = new Date();
  }
}
