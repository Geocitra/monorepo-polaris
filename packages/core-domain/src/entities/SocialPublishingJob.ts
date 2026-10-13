import { PublishingJobStatus, SocialMediaFormat } from '@polaris/shared-types';

export interface SocialPublishingJobProps {
  id: string;
  tenantId: string;
  accountId: string;
  publicationId?: string | null;
  mediaFormat?: SocialMediaFormat;
  originalMediaUrl: string;
  formattedMediaUrl?: string | null;
  caption: string;
  scheduledAt?: Date;
  publishedAt?: Date | null;
  status?: PublishingJobStatus;
  metaContainerId?: string | null;
  metaPostId?: string | null;
  metaPermalink?: string | null;
  retryCount?: number;
  maxRetries?: number;
  lastErrorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SocialPublishingJob {
  public static readonly DEFAULT_MAX_RETRIES = 3;

  public readonly id: string;
  public readonly tenantId: string;
  public readonly accountId: string;
  public readonly publicationId: string | null;
  public readonly mediaFormat: SocialMediaFormat;
  public readonly originalMediaUrl: string;
  public formattedMediaUrl: string | null;
  public caption: string;
  public scheduledAt: Date;
  public publishedAt: Date | null;
  public status: PublishingJobStatus;
  public metaContainerId: string | null;
  public metaPostId: string | null;
  public metaPermalink: string | null;
  public retryCount: number;
  public maxRetries: number;
  public lastErrorMessage: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: SocialPublishingJobProps) {
    if (!props.originalMediaUrl || !props.originalMediaUrl.startsWith('http')) {
      throw new Error('[DomainInvariantError] URL media asli wajib berupa URL HTTPS valid.');
    }
    if (!props.caption || props.caption.trim().length === 0) {
      throw new Error('[DomainInvariantError] Caption postingan tidak boleh kosong.');
    }

    this.id = props.id;
    this.tenantId = props.tenantId;
    this.accountId = props.accountId;
    this.publicationId = props.publicationId || null;
    this.mediaFormat = props.mediaFormat || SocialMediaFormat.FEED_IMAGE;
    this.originalMediaUrl = props.originalMediaUrl;
    this.formattedMediaUrl = props.formattedMediaUrl || null;
    this.caption = props.caption;
    this.scheduledAt = props.scheduledAt || new Date();
    this.publishedAt = props.publishedAt || null;
    this.status = props.status || PublishingJobStatus.PENDING;
    this.metaContainerId = props.metaContainerId || null;
    this.metaPostId = props.metaPostId || null;
    this.metaPermalink = props.metaPermalink || null;
    this.retryCount = props.retryCount || 0;
    this.maxRetries = props.maxRetries || SocialPublishingJob.DEFAULT_MAX_RETRIES;
    this.lastErrorMessage = props.lastErrorMessage || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public markPreparingMedia(formattedUrl: string): void {
    this.assertNotFinished();
    this.formattedMediaUrl = formattedUrl;
    this.status = PublishingJobStatus.PREPARING_MEDIA;
    this.updatedAt = new Date();
  }

  public markContainerCreated(containerId: string): void {
    this.assertNotFinished();
    this.metaContainerId = containerId;
    this.status = PublishingJobStatus.CONTAINER_CREATED;
    this.updatedAt = new Date();
  }

  public markPublished(postId: string, permalink?: string): void {
    if (this.status === PublishingJobStatus.PUBLISHED) {
      return; // Idempotent pass
    }
    this.metaPostId = postId;
    this.metaPermalink = permalink || null;
    this.publishedAt = new Date();
    this.status = PublishingJobStatus.PUBLISHED;
    this.lastErrorMessage = null;
    this.updatedAt = new Date();
  }

  public markFailed(errorReason: string): void {
    this.retryCount += 1;
    this.lastErrorMessage = errorReason;
    if (this.retryCount >= this.maxRetries) {
      this.status = PublishingJobStatus.FAILED;
    } else {
      this.status = PublishingJobStatus.QUEUED; // Ready for retry
    }
    this.updatedAt = new Date();
  }

  private assertNotFinished(): void {
    if (this.status === PublishingJobStatus.PUBLISHED || this.status === PublishingJobStatus.CANCELLED) {
      throw new Error(`[InvalidStateTransitionError] Tidak dapat mengubah status pekerjaan yang sudah ${this.status}.`);
    }
  }
}
