import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import {
  db,
  eq,
  desc,
  tenantMembers,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  contentBriefs,
} from '@polaris/database';
import { PublicReviewRevisionDto } from '../dto/whatsapp.dto.js';
import { WhatsAppBotSessionService } from './whatsapp-bot-session.service.js';

@Injectable()
export class WhatsAppPublicReviewService {
  constructor(private readonly botSessionService: WhatsAppBotSessionService) {}

  public async getPublicReviewByToken(rawToken: string) {
    const brief = await this.findBriefByValidReviewToken(rawToken);
    const [tenant] = await db
      .select({ fullName: tenantMembers.fullName })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, brief.tenantId))
      .limit(1);

    let publicationData: Record<string, unknown> | null = null;
    if (brief.linkedPublicationId) {
      const [pub] = await db
        .select()
        .from(contentPublications)
        .where(eq(contentPublications.id, brief.linkedPublicationId))
        .limit(1);

      if (pub) {
        const assets = await db
          .select()
          .from(mediaAssets)
          .where(eq(mediaAssets.publicationId, pub.id))
          .orderBy(desc(mediaAssets.createdAt));

        const [syndication] = await db
          .select()
          .from(socialSyndicationPacks)
          .where(eq(socialSyndicationPacks.publicationId, pub.id))
          .limit(1);

        publicationData = {
          id: pub.id,
          title: pub.title,
          excerpt: pub.excerpt,
          bodyContentMarkdown: pub.bodyContentMarkdown,
          wordCount: pub.wordCount,
          status: pub.status,
          canonicalUrl: pub.canonicalUrl,
          posterUrl: assets[0]?.cdnPublicUrl || null,
          instagramCaption: syndication?.instagramCaption || null,
          whatsappBroadcastText: syndication?.whatsappBroadcastText || null,
        };
      }
    }

    return {
      briefCode: brief.briefCode,
      tenantFullName: tenant?.fullName || 'Anggota Dewan',
      status: brief.status,
      targetWindow: brief.targetWindow,
      clientUrgency: brief.clientUrgency,
      packageType: (brief as any).packageType || 'FULL_CAMPAIGN',
      revisionUsed: brief.revisionUsed,
      revisionLimit: brief.revisionLimit,
      revisionRemaining: Math.max(0, brief.revisionLimit - brief.revisionUsed),
      articleStatus: brief.articleStatus,
      imageStatus: brief.imageStatus,
      captionStatus: brief.captionStatus,
      publication: publicationData,
    };
  }

  public async approveBriefByToken(rawToken: string) {
    const brief = await this.findBriefByValidReviewToken(rawToken);
    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, brief.tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Data klien tidak ditemukan.');
    }

    await this.botSessionService.approveAndPublishBriefFromClient(
      tenant.id,
      brief.id,
      tenant.phoneNumber
    );
    return {
      success: true,
      briefCode: brief.briefCode,
      status: 'PUBLISHED',
    };
  }

  public async requestRevisionByToken(rawToken: string, dto: PublicReviewRevisionDto) {
    const brief = await this.findBriefByValidReviewToken(rawToken);
    if (['PUBLISHED', 'APPROVED', 'REJECTED'].includes(brief.status)) {
      throw new BadRequestException(
        `Tiket #${brief.briefCode} telah selesai/tayang dan terkunci permanen (tidak dapat direvisi kembali).`
      );
    }
    if (brief.revisionUsed >= brief.revisionLimit) {
      throw new BadRequestException(
        `Jatah revisi untuk tiket #${brief.briefCode} telah mencapai batas maksimal (${brief.revisionLimit} putaran).`
      );
    }

    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, brief.tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Data klien tidak ditemukan.');
    }

    await this.botSessionService.processClientRevisionSubmission(
      { id: tenant.id, fullName: tenant.fullName },
      tenant.phoneNumber,
      {
        briefId: brief.id,
        briefCode: brief.briefCode,
        tenantId: tenant.id,
        targetComponents: dto.targetComponents,
        createdAtMs: Date.now(),
      },
      {
        wamid: `web_rev_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        itemType: 'TEXT',
        extractedText: dto.feedbackText.trim(),
      }
    );

    return {
      success: true,
      briefCode: brief.briefCode,
      status: 'REVISION_REQUESTED',
      revisionUsed: brief.revisionUsed + 1,
      revisionLimit: brief.revisionLimit,
    };
  }

  private async findBriefByValidReviewToken(rawToken: string) {
    if (!rawToken || rawToken.length < 16) {
      throw new BadRequestException('Token review tidak valid.');
    }
    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.reviewTokenHash, tokenHash))
      .limit(1);

    if (!brief) {
      throw new NotFoundException('Tautan review tidak ditemukan atau sudah tidak berlaku.');
    }

    if (brief.reviewTokenExpiresAt && brief.reviewTokenExpiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Tautan review telah kedaluwarsa.');
    }

    return brief;
  }
}

