import { 
  Injectable, 
  UnauthorizedException, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
  db, 
  citizenUsers, 
  articleComments, 
  contentPublications 
} from '@polaris/database';
import { CreateCommentDto, ModerateCommentDto, GoogleCitizenLoginDto } from './dto/comment.dto.js';
import { ProfanityFilter } from '../../common/utils/profanity-filter.js';

@Injectable()
export class CommentsService {
  private readonly googleClient: OAuth2Client;

  constructor(private readonly jwtService: JwtService) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * verifyGoogleAndLogin memverifikasi ID Token Google dan mengembalikan JWT sesi warga
   */
  async verifyGoogleAndLogin(dto: GoogleCitizenLoginDto | string) {
    const payloadDto: GoogleCitizenLoginDto = typeof dto === 'string' ? { idToken: dto } : dto;
    const rawToken = payloadDto.idToken || payloadDto.credential;

    let googleId = '';
    let email = '';
    let fullName = '';
    let avatarUrl: string | null = null;

    if (rawToken) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: rawToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
          throw new UnauthorizedException('Data profil akun Google tidak lengkap.');
        }
        googleId = payload.sub;
        email = payload.email.toLowerCase().trim();
        fullName = payload.name || 'Warga Terverifikasi';
        avatarUrl = payload.picture || null;
      } catch (err: any) {
        // Fallback untuk fetch API jika Google Client ID offline atau mismatch clock
        try {
          const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${rawToken}`);
          if (res.ok) {
            const data = (await res.json()) as any;
            googleId = data.sub;
            email = data.email.toLowerCase().trim();
            fullName = data.name || 'Warga Terverifikasi';
            avatarUrl = data.picture || null;
          } else {
            throw new Error('Fallback failed');
          }
        } catch {
          throw new UnauthorizedException(`Verifikasi akun Google gagal: ${err.message}`);
        }
      }
    } else if (payloadDto.isDevMock || process.env.NODE_ENV !== 'production') {
      // Mode Pengembang / Demo: Memungkinkan pengujian instan
      const safeSuffix = payloadDto.mockEmail ? payloadDto.mockEmail.replace(/[^a-zA-Z0-9]/g, '') : 'demo';
      googleId = `mock-google-${safeSuffix}`;
      email = payloadDto.mockEmail || 'warga.demo@gmail.com';
      fullName = payloadDto.mockName || 'Budi Santoso (Warga Terverifikasi)';
      avatarUrl = payloadDto.mockAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    } else {
      throw new BadRequestException('Google ID Token wajib disertakan.');
    }

    // Upsert profil warga ke tabel citizen_users
    const [citizen] = await db
      .insert(citizenUsers)
      .values({
        googleId,
        email,
        fullName,
        avatarUrl,
        isBanned: false,
      })
      .onConflictDoUpdate({
        target: citizenUsers.googleId,
        set: {
          fullName,
          avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (citizen.isBanned) {
      throw new ForbiddenException('Akun Anda telah dinonaktifkan oleh administrator.');
    }

    // Terbitkan JWT khusus sesi warga
    const token = await this.jwtService.signAsync(
      {
        sub: citizen.id,
        email: citizen.email,
        fullName: citizen.fullName,
        avatarUrl: citizen.avatarUrl,
        role: 'CITIZEN',
      },
      { expiresIn: '30d' }
    );

    return {
      token,
      citizen: {
        id: citizen.id,
        email: citizen.email,
        fullName: citizen.fullName,
        avatarUrl: citizen.avatarUrl,
      },
    };
  }

  /**
   * Helper: Resolusi artikel berdasarkan ID (UUID) atau Slug
   */
  private async resolveArticle(publicationIdOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(publicationIdOrSlug);

    const [article] = await db
      .select({ id: contentPublications.id, status: contentPublications.status, tenantId: contentPublications.tenantId })
      .from(contentPublications)
      .where(isUuid ? eq(contentPublications.id, publicationIdOrSlug) : eq(contentPublications.slug, publicationIdOrSlug))
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    return article;
  }

  /**
   * getArticleComments mengambil komentar berstatus PUBLISHED dengan susunan balasan bertingkat
   */
  async getArticleComments(publicationIdOrSlug: string) {
    const article = await this.resolveArticle(publicationIdOrSlug);

    // 1. Ambil seluruh komentar berstatus PUBLISHED untuk artikel ini
    const rawComments = await db
      .select({
        id: articleComments.id,
        parentCommentId: articleComments.parentCommentId,
        commentText: articleComments.commentText,
        likesCount: articleComments.likesCount,
        createdAt: articleComments.createdAt,
        citizen: {
          id: citizenUsers.id,
          fullName: citizenUsers.fullName,
          avatarUrl: citizenUsers.avatarUrl,
        },
      })
      .from(articleComments)
      .innerJoin(citizenUsers, eq(articleComments.citizenId, citizenUsers.id))
      .where(
        and(
          eq(articleComments.publicationId, article.id),
          eq(articleComments.status, 'PUBLISHED')
        )
      )
      .orderBy(desc(articleComments.createdAt));

    // 2. Susun balasan bertingkat (Parent -> Replies) di memori
    const parentComments: any[] = [];
    const replyMap = new Map<string, any[]>();

    for (const c of rawComments) {
      if (c.parentCommentId) {
        const existing = replyMap.get(c.parentCommentId) || [];
        existing.push(c);
        replyMap.set(c.parentCommentId, existing);
      } else {
        parentComments.push({ ...c, replies: [] });
      }
    }

    // Pasangkan anak balasan ke induknya
    for (const p of parentComments) {
      p.replies = replyMap.get(p.id) || [];
    }

    return {
      totalCount: rawComments.length,
      comments: parentComments,
    };
  }

  /**
   * createComment mengirim komentar baru oleh warga yang telah terotentikasi
   */
  async createComment(
    publicationIdOrSlug: string, 
    citizenId: string, 
    dto: CreateCommentDto
  ) {
    const article = await this.resolveArticle(publicationIdOrSlug);

    if (article.status !== 'PUBLISHED') {
      throw new NotFoundException('Artikel belum dipublikasikan secara resmi.');
    }

    // Cek status banned warga
    const [citizen] = await db
      .select({ isBanned: citizenUsers.isBanned })
      .from(citizenUsers)
      .where(eq(citizenUsers.id, citizenId))
      .limit(1);

    if (!citizen || citizen.isBanned) {
      throw new ForbiddenException('Akun Anda tidak diizinkan mengirimkan komentar.');
    }

    // Sensor kata kasar & filter spam judi online
    const inspect = ProfanityFilter.inspectComment(dto.commentText);

    // Simpan komentar
    const [newComment] = await db
      .insert(articleComments)
      .values({
        publicationId: article.id,
        citizenId,
        parentCommentId: dto.parentCommentId || null,
        commentText: inspect.sanitizedText,
        status: inspect.status,
        likesCount: 0,
      })
      .returning();

    // Jika komentar PUBLISHED, naikkan counter artikel
    if (inspect.status === 'PUBLISHED') {
      await db
        .update(contentPublications)
        .set({ commentCount: sql`${contentPublications.commentCount} + 1` })
        .where(eq(contentPublications.id, article.id));
    }

    return {
      message: inspect.detectedSpam
        ? 'Komentar Anda ditandai untuk ditinjau oleh tim moderasi dewan.'
        : 'Komentar berhasil dikirimkan.',
      comment: newComment,
    };
  }

  /**
   * likeComment menaikkan jumlah suka secara atomik
   */
  async likeComment(commentId: string) {
    const [updated] = await db
      .update(articleComments)
      .set({ likesCount: sql`${articleComments.likesCount} + 1` })
      .where(eq(articleComments.id, commentId))
      .returning({ id: articleComments.id, likesCount: articleComments.likesCount });

    if (!updated) {
      throw new NotFoundException('Komentar tidak ditemukan.');
    }

    return updated;
  }

  /**
   * moderateComment memungkinkan dewan pemilik artikel menyembunyikan komentar melanggar hukum
   */
  async moderateComment(tenantId: string, commentId: string, dto: ModerateCommentDto) {
    // Verifikasi kepemilikan artikel oleh tenant ini (Tenant Isolation Guard)
    const [comment] = await db
      .select({
        id: articleComments.id,
        status: articleComments.status,
        publicationId: articleComments.publicationId,
        tenantId: contentPublications.tenantId,
      })
      .from(articleComments)
      .innerJoin(contentPublications, eq(articleComments.publicationId, contentPublications.id))
      .where(eq(articleComments.id, commentId))
      .limit(1);

    if (!comment) {
      throw new NotFoundException('Komentar tidak ditemukan.');
    }

    if (comment.tenantId !== tenantId) {
      throw new ForbiddenException('Anda tidak memiliki wewenang memoderasi komentar di portal dewan lain.');
    }

    const previousStatus = comment.status;

    await db
      .update(articleComments)
      .set({
        status: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(articleComments.id, commentId));

    // Sinkronkan counter artikel
    if (previousStatus !== 'PUBLISHED' && dto.status === 'PUBLISHED') {
      await db
        .update(contentPublications)
        .set({ commentCount: sql`${contentPublications.commentCount} + 1` })
        .where(eq(contentPublications.id, comment.publicationId));
    } else if (previousStatus === 'PUBLISHED' && dto.status !== 'PUBLISHED') {
      await db
        .update(contentPublications)
        .set({ commentCount: sql`GREATEST(0, ${contentPublications.commentCount} - 1)` })
        .where(eq(contentPublications.id, comment.publicationId));
    }

    return { message: `Status komentar berhasil diperbarui menjadi ${dto.status}.` };
  }

  /**
   * listTenantComments mengambil seluruh komentar yang masuk pada semua artikel milik dewan ini
   */
  async listTenantComments(tenantId: string) {
    return await db
      .select({
        id: articleComments.id,
        commentText: articleComments.commentText,
        status: articleComments.status,
        likesCount: articleComments.likesCount,
        createdAt: articleComments.createdAt,
        article: {
          id: contentPublications.id,
          title: contentPublications.title,
          slug: contentPublications.slug,
        },
        citizen: {
          id: citizenUsers.id,
          fullName: citizenUsers.fullName,
          avatarUrl: citizenUsers.avatarUrl,
          email: citizenUsers.email,
        },
      })
      .from(articleComments)
      .innerJoin(contentPublications, eq(articleComments.publicationId, contentPublications.id))
      .innerJoin(citizenUsers, eq(articleComments.citizenId, citizenUsers.id))
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(articleComments.createdAt));
  }

  /**
   * getCommentsForDewan mengambil semua komentar di bawah portal dewan ini
   */
  async getCommentsForDewan(tenantId: string, statusFilter: string = 'ALL', searchQuery?: string) {
    const raw = await db
      .select({
        id: articleComments.id,
        publicationId: articleComments.publicationId,
        articleTitle: contentPublications.title,
        articleSlug: contentPublications.slug,
        commentText: articleComments.commentText,
        status: articleComments.status,
        likesCount: articleComments.likesCount,
        createdAt: articleComments.createdAt,
        citizen: {
          id: citizenUsers.id,
          fullName: citizenUsers.fullName,
          email: citizenUsers.email,
          avatarUrl: citizenUsers.avatarUrl,
        },
      })
      .from(articleComments)
      .innerJoin(contentPublications, eq(articleComments.publicationId, contentPublications.id))
      .innerJoin(citizenUsers, eq(articleComments.citizenId, citizenUsers.id))
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(articleComments.createdAt));

    return raw.filter((item) => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSearch = !searchQuery || 
        item.commentText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citizen.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.articleTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  /**
   * deleteCommentByDewan menghapus komentar bermasalah secara permanen
   */
  async deleteCommentByDewan(tenantId: string, commentId: string) {
    const [comment] = await db
      .select({
        id: articleComments.id,
        status: articleComments.status,
        publicationId: articleComments.publicationId,
        tenantId: contentPublications.tenantId,
      })
      .from(articleComments)
      .innerJoin(contentPublications, eq(articleComments.publicationId, contentPublications.id))
      .where(eq(articleComments.id, commentId))
      .limit(1);

    if (!comment) {
      throw new NotFoundException('Komentar tidak ditemukan.');
    }

    if (comment.tenantId !== tenantId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    await db.delete(articleComments).where(eq(articleComments.id, commentId));

    if (comment.status === 'PUBLISHED') {
      await db
        .update(contentPublications)
        .set({ commentCount: sql`GREATEST(0, ${contentPublications.commentCount} - 1)` })
        .where(eq(contentPublications.id, comment.publicationId));
    }

    return { message: 'Komentar berhasil dihapus permanen oleh dewan.' };
  }
}
