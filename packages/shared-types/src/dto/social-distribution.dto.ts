import {
  SocialPlatform,
  SocialAccountStatus,
  PublishingJobStatus,
  SocialMediaFormat,
} from '../enums/index.js';

export interface ConnectedSocialAccountDto {
  id: string;
  tenantId: string;
  platform: SocialPlatform;
  accountType: 'BUSINESS' | 'CREATOR';
  externalAccountId: string;
  facebookPageId?: string | null;
  accountHandle: string;
  accountName?: string | null;
  profilePictureUrl?: string | null;
  status: SocialAccountStatus;
  tokenExpiresAt: string;
  tokenLastRefreshedAt?: string | null;
  createdAt: string;
}

export interface InitiateOAuthResponseDto {
  authorizationUrl: string;
  stateNonce: string;
}

export interface CreatePublishingJobDto {
  accountId: string;
  publicationId?: string;
  caption: string;
  mediaFormat?: SocialMediaFormat;
  originalMediaUrl: string;
  scheduledAt?: string;
}

export interface PublishingJobResponseDto {
  id: string;
  accountId: string;
  publicationId?: string | null;
  accountHandle: string;
  status: PublishingJobStatus;
  mediaFormat: SocialMediaFormat;
  originalMediaUrl: string;
  formattedMediaUrl?: string | null;
  caption: string;
  metaContainerId?: string | null;
  metaPostId?: string | null;
  metaPermalink?: string | null;
  scheduledAt: string;
  publishedAt?: string | null;
  lastErrorMessage?: string | null;
  retryCount: number;
}
