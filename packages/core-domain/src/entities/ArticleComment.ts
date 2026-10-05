import { CommentStatus } from '@polaris/shared-types';

export class ArticleComment {
  constructor(
    public readonly id: string,
    public readonly publicationId: string,
    public readonly citizenId: string,
    public readonly parentCommentId: string | null,
    public commentText: string,
    public status: CommentStatus = CommentStatus.PUBLISHED,
    public likesCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    if (!commentText || commentText.trim().length === 0) {
      throw new Error('[DomainInvariantError] Teks komentar tidak boleh kosong.');
    }
    if (commentText.length > 1000) {
      throw new Error('[DomainInvariantError] Teks komentar melebihi batas 1.000 karakter.');
    }
  }

  public hide(): void {
    this.status = CommentStatus.HIDDEN;
    this.updatedAt = new Date();
  }

  public publish(): void {
    this.status = CommentStatus.PUBLISHED;
    this.updatedAt = new Date();
  }

  public flagSpam(): void {
    this.status = CommentStatus.FLAGGED_SPAM;
    this.updatedAt = new Date();
  }

  public incrementLike(): void {
    this.likesCount += 1;
  }

  public decrementLike(): void {
    this.likesCount = Math.max(0, this.likesCount - 1);
  }

  public isVisiblePublicly(): boolean {
    return this.status === CommentStatus.PUBLISHED;
  }
}
