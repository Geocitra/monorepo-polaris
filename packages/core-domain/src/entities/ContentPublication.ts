import { ContentStatus } from '@polaris/shared-types';
import { CanonicalUrl } from '../value-objects/CanonicalUrl.js';

export class ContentPublication {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public title: string,
    public readonly slug: string,
    public excerpt: string,
    public bodyContentMarkdown: string,
    public wordCount: number,
    public status: ContentStatus,
    public readonly canonicalUrl: string,
    public publishedAt?: Date | null,
    public dallePosterUrl?: string | null,
  ) {}

  public publish(canonicalUrl: CanonicalUrl): void {
    if (this.status === ContentStatus.PUBLISHED) {
      throw new Error('[InvalidStateTransitionError] Artikel ini sudah dalam status PUBLISHED.');
    }
    if (this.wordCount < 100) {
      throw new Error('[ContentValidationError] Konten terlalu pendek untuk dipublikasikan secara resmi.');
    }
    this.status = ContentStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  public unpublish(): void {
    if (this.status !== ContentStatus.PUBLISHED) {
      throw new Error('[InvalidStateTransitionError] Hanya artikel berstatus PUBLISHED yang dapat ditarik kembali.');
    }
    this.status = ContentStatus.UNPUBLISHED;
  }

  public attachDallePoster(r2PublicUrl: string): void {
    this.dallePosterUrl = r2PublicUrl;
  }

  public static generateSlug(rawTitle: string): string {
    return rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
