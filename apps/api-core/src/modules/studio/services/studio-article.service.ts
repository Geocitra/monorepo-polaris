import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq, and, desc } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  subscriptions,
} from '@polaris/database';
import { ContentStatus, AssetType, SubscriptionStatus } from '@polaris/shared-types';
import { UpdateDraftArticleDto, UploadArticleImageDto } from '../dto/studio.dto.js';

@Injectable()
export class StudioArticleService {
  private readonly logger = new Logger(StudioArticleService.name);

  async listArticles(tenantId: string) {
    return await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        slug: contentPublications.slug,
        excerpt: contentPublications.excerpt,
        status: contentPublications.status,
        wordCount: contentPublications.wordCount,
        publishedAt: contentPublications.publishedAt,
        createdAt: contentPublications.createdAt,
      })
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(contentPublications.createdAt));
  }

  async getArticleDetail(tenantId: string, articleId: string) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.publicationId, article.id),
          eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
        )
      )
      .orderBy(desc(mediaAssets.createdAt))
      .limit(1);

    const [social] = await db
      .select()
      .from(socialSyndicationPacks)
      .where(eq(socialSyndicationPacks.publicationId, article.id))
      .limit(1);

    let infographicData = null;
    if (asset?.promptUsed) {
      try {
        const parsed = JSON.parse(asset.promptUsed);
        if (parsed?.infographicSpec) {
          infographicData = parsed.infographicSpec;
        }
      } catch {
        // promptUsed is plain prompt string
      }
    }

    return {
      article,
      asset,
      socialPack: social,
      infographicData,
    };
  }

  async updateDraftArticle(tenantId: string, articleId: string, dto: UpdateDraftArticleDto) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    const updates: Partial<typeof contentPublications.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.title) updates.title = dto.title;
    if (dto.excerpt) updates.excerpt = dto.excerpt;
    if (dto.bodyContentMarkdown) {
      updates.bodyContentMarkdown = dto.bodyContentMarkdown;
      updates.wordCount = dto.bodyContentMarkdown.split(/\s+/).filter(Boolean).length;
    }

    await db
      .update(contentPublications)
      .set(updates)
      .where(eq(contentPublications.id, article.id));

    return { message: 'Draf artikel berhasil diperbarui.' };
  }

  async publishArticle(tenantId: string, articleId: string) {
    const [sub] = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException(
        'Publikasi ke portal resmi dibatasi: Akun Anda belum diaktivasi. Silakan selesaikan pembayaran lisensi di menu Billing.'
      );
    }

    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    await db
      .update(contentPublications)
      .set({
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, article.id));

    return {
      message: 'Artikel resmi dipublikasikan ke Website Pribadi Dewan.',
      canonicalUrl: article.canonicalUrl,
    };
  }

  async unpublishArticle(tenantId: string, articleId: string) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    await db
      .update(contentPublications)
      .set({
        status: ContentStatus.UNPUBLISHED,
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, article.id));

    return { message: 'Artikel berhasil ditarik dari tayangan publik (Status: UNPUBLISHED).' };
  }

  async deleteArticle(tenantId: string, articleId: string) {
    const [article] = await db
      .select({ id: contentPublications.id })
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Sesi artikel tidak ditemukan.');
    }

    await db
      .delete(contentPublications)
      .where(
        and(
          eq(contentPublications.id, article.id),
          eq(contentPublications.tenantId, tenantId)
        )
      );

    return { message: 'Sesi pembuatan konten berhasil dihapus.' };
  }

  async uploadArticleImage(tenantId: string, dto: UploadArticleImageDto) {
    if (!dto.base64) {
      throw new BadRequestException('Data gambar base64 wajib diisi.');
    }

    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');

      let mimeType = 'image/jpeg';
      let buffer: Buffer;

      if (dto.base64.startsWith('data:')) {
        const matches = dto.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          const parts = dto.base64.split(',');
          buffer = Buffer.from(parts[1] || '', 'base64');
        }
      } else {
        buffer = Buffer.from(dto.base64, 'base64');
      }

      if (buffer.length > 10 * 1024 * 1024) {
        throw new BadRequestException('Ukuran gambar melebihi batas 10MB.');
      }

      const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

      const rootDir = process.cwd().includes('apps')
        ? path.resolve(process.cwd(), '../../')
        : process.cwd();
      const rootUploadDir = path.resolve(rootDir, 'uploads', 'articles', tenantId);
      await fs.mkdir(rootUploadDir, { recursive: true });
      await fs.writeFile(path.join(rootUploadDir, filename), buffer);

      const localUploadDir = path.resolve(process.cwd(), 'uploads', 'articles', tenantId);
      if (localUploadDir !== rootUploadDir) {
        await fs.mkdir(localUploadDir, { recursive: true });
        await fs.writeFile(path.join(localUploadDir, filename), buffer);
      }

      const apiHost =
        process.env.PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:4000';
      const cleanHost = apiHost.replace(/\/api\/v1\/?$/, '');
      const publicUrl = `${cleanHost}/uploads/articles/${tenantId}/${filename}`;

      return {
        success: true,
        url: publicUrl,
        relativePath: `/uploads/articles/${tenantId}/${filename}`,
        filename,
        caption: dto.caption || '',
      };
    } catch (err: any) {
      this.logger.error(`Failed to upload article image: ${err.message}`);
      throw new BadRequestException(`Gagal mengunggah foto: ${err.message}`);
    }
  }
}
