import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import {
  db,
  eq,
  and,
  desc,
  asc,
  inArray,
  tenantMembers,
  operatorTenantAssignments,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  contentBriefs,
  contentBriefMessages,
  withTenantContext,
} from '@polaris/database';
import {
  ContentBriefDto,
  TenantWeeklyBriefQuotaDto,
  BriefUrgencyLevel,
} from '@polaris/shared-types';
import { RedisService } from '../../redis/redis.service.js';
import { WhatsAppCloudClient } from '../whatsapp-cloud.client.js';
import {
  getCurrentWibWeeklyPeriod,
  detectOperatorContactLeak,
} from '../contact-sanitizer.util.js';
import {
  AcceptBriefDto,
  RejectBriefDto,
  SendClarificationDto,
  SubmitBriefReviewDto,
  MarkRevisionFaultDto,
  UpdateTenantBriefLimitsDto,
} from '../dto/whatsapp.dto.js';
import {
  WhatsAppBriefHelperService,
  RequestAuditMeta,
  QUOTA_CONSUMING_STATUSES,
} from './whatsapp-brief-helper.service.js';

@Injectable()
export class WhatsAppOperatorBrokerService {
  private readonly logger = new Logger(WhatsAppOperatorBrokerService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly waClient: WhatsAppCloudClient,
    private readonly helper: WhatsAppBriefHelperService
  ) {}

  public async listBriefsForOperator(
    operatorId: string,
    isSuperadmin: boolean,
    filters: { tenantId?: string; status?: string }
  ): Promise<{
    briefs: ContentBriefDto[];
    weeklyQuota?: TenantWeeklyBriefQuotaDto;
  }> {
    let allowedTenantIds: string[] = [];

    if (isSuperadmin) {
      if (filters.tenantId) {
        allowedTenantIds = [filters.tenantId];
      } else {
        const allTenants = await db.select({ id: tenantMembers.id }).from(tenantMembers);
        allowedTenantIds = allTenants.map((t) => t.id);
      }
    } else {
      const assignments = await db
        .select({ tenantId: operatorTenantAssignments.tenantId })
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        );
      const assignedIds = assignments.map((a) => a.tenantId);
      if (filters.tenantId) {
        if (!assignedIds.includes(filters.tenantId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki penugasan aktif untuk mengakses request topik dewan ini.'
          );
        }
        allowedTenantIds = [filters.tenantId];
      } else {
        allowedTenantIds = assignedIds;
      }
    }

    if (allowedTenantIds.length === 0) {
      return { briefs: [] };
    }

    const rows = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(inArray(contentBriefs.tenantId, allowedTenantIds))
      .orderBy(desc(contentBriefs.createdAt))
      .limit(100);

    const filteredRows = filters.status
      ? rows.filter((r) => r.brief.status === filters.status)
      : rows;

    const briefs: ContentBriefDto[] = await Promise.all(
      filteredRows.map(async ({ brief, fullName, phoneNumber }) => {
        const msgs = await db
          .select()
          .from(contentBriefMessages)
          .where(eq(contentBriefMessages.briefId, brief.id))
          .orderBy(asc(contentBriefMessages.createdAt));

        return this.helper.mapBriefToSanitizedDto(brief, fullName, phoneNumber, msgs);
      })
    );

    const weeklyQuota = filters.tenantId
      ? await this.helper.getTenantWeeklyQuota(filters.tenantId)
      : undefined;

    return { briefs, weeklyQuota };
  }

  public async getBriefDetailForOperator(
    operatorId: string,
    briefId: string,
    isSuperadmin = false
  ): Promise<ContentBriefDto> {
    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return this.helper.mapBriefToSanitizedDto(row.brief, row.fullName, row.phoneNumber, msgs);
  }

  public async hydrateBriefForStudio(
    operatorId: string,
    briefId: string,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<{
    brief: ContentBriefDto;
    weeklyQuota: TenantWeeklyBriefQuotaDto;
    topicPrompt: string;
    attachments: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      base64: string;
    }>;
  }> {
    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    let currentBriefDto: ContentBriefDto;
    let currentQuota: TenantWeeklyBriefQuotaDto;

    if (row.brief.status === 'SUBMITTED') {
      const accepted = await this.acceptBrief(
        operatorId,
        briefId,
        { operatorPriority: row.brief.clientUrgency as BriefUrgencyLevel },
        isSuperadmin,
        auditMeta
      );
      currentBriefDto = accepted.brief;
      currentQuota = accepted.weeklyQuota;
    } else {
      currentBriefDto = await this.getBriefDetailForOperator(operatorId, briefId, isSuperadmin);
      currentQuota = await this.helper.getTenantWeeklyQuota(row.brief.tenantId);
    }

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    const inboundTextParts = msgs
      .filter((m) => m.direction === 'INBOUND' && m.textBody && m.textBody.trim())
      .map((m) => {
        if (m.revisionRound > 0) {
          return `[Catatan Revisi Putaran #${m.revisionRound}]: ${m.textBody?.trim()}`;
        }
        return m.textBody?.trim() || '';
      })
      .filter(Boolean);

    const topicPrompt =
      inboundTextParts.length > 0
        ? inboundTextParts.join('\n\n')
        : currentBriefDto.topicSummary;

    const mediaMsgs = msgs.filter(
      (m) =>
        m.direction === 'INBOUND' &&
        (m.messageType === 'IMAGE' || m.messageType === 'DOCUMENT') &&
        (m.mediaCdnUrl || m.mediaR2Url)
    );

    const attachments: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      base64: string;
    }> = [];

    for (const m of mediaMsgs) {
      try {
        const buffer = await this.helper.resolveMediaMessageBuffer(m.mediaR2Url, m.mediaCdnUrl);
        if (!buffer || buffer.length === 0) continue;

        const mimeType = m.mediaMimeType || 'application/octet-stream';
        const fileName =
          m.mediaFileName ||
          `Lampiran_${m.messageType}_${m.id.slice(0, 6)}.${
            mimeType.includes('pdf') ? 'pdf' : 'jpg'
          }`;
        const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

        attachments.push({
          id: m.id,
          name: fileName,
          size: m.mediaFileSizeBytes || buffer.length,
          type: mimeType,
          base64: base64DataUrl,
        });
      } catch (err) {
        this.logger.warn(
          `[WhatsAppOperatorBrokerService] Gagal memuat binary lampiran ${m.id} untuk Studio: ${(err as Error).message}`
        );
      }
    }

    return {
      brief: currentBriefDto,
      weeklyQuota: currentQuota,
      topicPrompt,
      attachments,
    };
  }

  public async acceptBrief(
    operatorId: string,
    briefId: string,
    dto: AcceptBriefDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<{ brief: ContentBriefDto; weeklyQuota: TenantWeeklyBriefQuotaDto }> {
    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    const quotaBefore = await this.helper.getTenantWeeklyQuota(row.brief.tenantId);
    const alreadyConsumedQuota = (QUOTA_CONSUMING_STATUSES as readonly string[]).includes(
      row.brief.status
    );

    const finalPriority = dto.operatorPriority || row.brief.clientUrgency;
    let nextStatus: 'IN_PROGRESS' | 'QUEUED_NEXT_WEEK' = 'IN_PROGRESS';

    if (!alreadyConsumedQuota && quotaBefore.weeklyRemaining <= 0) {
      nextStatus = 'QUEUED_NEXT_WEEK';
    }

    const updatedBrief = await withTenantContext(row.brief.tenantId, async (tx) => {
      const [updated] = await tx
        .update(contentBriefs)
        .set({
          assignedOperatorId: operatorId,
          status: nextStatus,
          operatorPriority: finalPriority,
          operatorNotes: dto.operatorNotes ?? row.brief.operatorNotes,
          acceptedAt: row.brief.acceptedAt ?? new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      return updated;
    });

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: row.brief.tenantId,
      action: nextStatus === 'IN_PROGRESS' ? 'BRIEF_ACCEPT_IN_PROGRESS' : 'BRIEF_QUEUE_NEXT_WEEK',
      targetEntityId: briefId,
      details: {
        briefCode: row.brief.briefCode,
        operatorPriority: finalPriority,
        status: nextStatus,
      },
      auditMeta,
    });

    const quotaAfter = await this.helper.getTenantWeeklyQuota(row.brief.tenantId);

    if (nextStatus === 'IN_PROGRESS') {
      const scheduleMsg =
        finalPriority === 'URGENT'
          ? 'diprioritaskan untuk diproses *hari ini*.'
          : 'sedang dikerjakan oleh Tim Redaksi sesuai antrean.';
      await this.waClient.sendTextMessage(
        row.phoneNumber,
        `👨‍💻 *Update Tiket #${row.brief.briefCode}*\n\nRequest topik Anda telah diterima Tim Redaksi dan ${scheduleMsg}\n(Pemakaian jatah minggu ini: *${quotaAfter.weeklyUsed}/${quotaAfter.weeklyLimit}*).`
      );
    } else {
      await this.waClient.sendTextMessage(
        row.phoneNumber,
        `🗓️ *Update Tiket #${row.brief.briefCode}*\n\nJatah request topik minggu ini (*${quotaAfter.weeklyLimit}/${quotaAfter.weeklyLimit}*) telah terpakai. Request Anda telah kami amankan di antrean prioritas untuk mulai dikerjakan pada hari Senin depan.`
      );
    }

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return {
      brief: this.helper.mapBriefToSanitizedDto(updatedBrief, row.fullName, row.phoneNumber, msgs),
      weeklyQuota: quotaAfter,
    };
  }

  public async rejectBrief(
    operatorId: string,
    briefId: string,
    dto: RejectBriefDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<ContentBriefDto> {
    const leakCheck = detectOperatorContactLeak(dto.reason);
    if (leakCheck.hasLeak) {
      await this.helper.recordOperatorAudit({
        operatorId,
        action: 'BRIEF_CONTACT_LEAK_BLOCKED',
        targetEntityId: briefId,
        details: { reason: leakCheck.reason, snippet: leakCheck.matchedSnippet },
        auditMeta,
      });
      throw new ForbiddenException(
        `Alasan penolakan ditolak oleh Filter Keamanan Broker: ${leakCheck.reason}`
      );
    }

    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    const updatedBrief = await withTenantContext(row.brief.tenantId, async (tx) => {
      const [updated] = await tx
        .update(contentBriefs)
        .set({
          status: 'REJECTED',
          operatorNotes: dto.reason,
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      await tx.insert(contentBriefMessages).values({
        briefId,
        tenantId: row.brief.tenantId,
        senderOperatorId: operatorId,
        direction: 'OUTBOUND',
        messageType: 'SYSTEM',
        textBody: `Request tidak dapat diproses: ${dto.reason}`,
        revisionRound: row.brief.revisionUsed,
        targetComponents: [],
        isInternalFault: false,
      });

      return updated;
    });

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: row.brief.tenantId,
      action: 'BRIEF_REJECTED',
      targetEntityId: briefId,
      details: { briefCode: row.brief.briefCode, reason: dto.reason },
      auditMeta,
    });

    await this.waClient.sendTextMessage(
      row.phoneNumber,
      `ℹ️ *Informasi Tiket #${row.brief.briefCode}*\n\nMohon maaf, request ini belum dapat kami proses dengan catatan:\n_"${dto.reason}"_\n\n(Jatah request mingguan Anda *tidak terpotong*).`
    );

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return this.helper.mapBriefToSanitizedDto(updatedBrief, row.fullName, row.phoneNumber, msgs);
  }

  public async sendClarificationToClient(
    operatorId: string,
    briefId: string,
    dto: SendClarificationDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<ContentBriefDto> {
    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    const leakCheck = detectOperatorContactLeak(dto.questionText);
    if (leakCheck.hasLeak) {
      await this.helper.recordOperatorAudit({
        operatorId,
        tenantId: row.brief.tenantId,
        action: 'BRIEF_CLARIFICATION_BLOCKED_CONTACT_LEAK',
        targetEntityId: briefId,
        details: {
          briefCode: row.brief.briefCode,
          reason: leakCheck.reason,
          matchedSnippet: leakCheck.matchedSnippet,
        },
        auditMeta,
      });
      throw new ForbiddenException(
        `Pesan diblokir oleh Broker Security Polaris: ${leakCheck.reason} Komunikasi wajib melalui sistem resmi tanpa mencantumkan kontak pribadi.`
      );
    }

    const waResult = await this.waClient.sendInteractiveButtons(
      row.phoneNumber,
      [
        `👨‍💼 *Editor Redaksi Polaris — #${row.brief.briefCode}*`,
        '',
        dto.questionText.trim(),
        '',
        '_Silakan ketik balasan Anda secara langsung, atau pilih menu di bawah ini:_',
      ].join('\n'),
      [
        { id: 'LIVE_CHAT_END', title: '✅ Cukup / Selesai' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      `Pesan Redaksi #${row.brief.briefCode}`,
      'Asisten Redaksi Polaris'
    );

    const updatedBrief = await withTenantContext(row.brief.tenantId, async (tx) => {
      await tx.insert(contentBriefMessages).values({
        briefId,
        tenantId: row.brief.tenantId,
        senderOperatorId: operatorId,
        direction: 'OUTBOUND',
        messageType: 'TEXT',
        waMessageId: waResult.messageId ?? null,
        textBody: dto.questionText.trim(),
        revisionRound: row.brief.revisionUsed,
        targetComponents: [],
        isInternalFault: false,
      });

      const [updated] = await tx
        .update(contentBriefs)
        .set({
          status: 'NEED_CLARIFICATION',
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      return updated;
    });

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: row.brief.tenantId,
      action: 'BRIEF_CLARIFICATION_SENT',
      targetEntityId: briefId,
      details: {
        briefCode: row.brief.briefCode,
        deliveredToWhatsApp: waResult.delivered,
      },
      auditMeta,
    });

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return this.helper.mapBriefToSanitizedDto(updatedBrief, row.fullName, row.phoneNumber, msgs);
  }

  public async submitBriefForClientReview(
    operatorId: string,
    briefId: string,
    dto: SubmitBriefReviewDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<{ brief: ContentBriefDto; reviewUrl: string }> {
    if (dto.customNote) {
      const leakCheck = detectOperatorContactLeak(dto.customNote);
      if (leakCheck.hasLeak) {
        throw new ForbiddenException(
          `Catatan pengantar ditolak oleh Broker Security Polaris: ${leakCheck.reason}`
        );
      }
    }

    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    const assignment = await this.helper.assertOperatorCanAccessTenant(
      operatorId,
      row.brief.tenantId,
      isSuperadmin
    );

    const [publication] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, dto.publicationId),
          eq(contentPublications.tenantId, row.brief.tenantId)
        )
      )
      .limit(1);

    if (!publication) {
      throw new NotFoundException('Artikel publikasi tidak ditemukan untuk dewan ini.');
    }

    const assets = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.publicationId, publication.id))
      .orderBy(desc(mediaAssets.createdAt));

    const [syndication] = await db
      .select()
      .from(socialSyndicationPacks)
      .where(eq(socialSyndicationPacks.publicationId, publication.id))
      .limit(1);

    const posterUrl = assets[0]?.cdnPublicUrl || null;
    const captionPreview =
      syndication?.whatsappBroadcastText ||
      syndication?.instagramCaption ||
      publication.excerpt;

    const rawReviewToken = crypto.randomBytes(24).toString('hex');
    const reviewTokenHash = crypto.createHash('sha256').update(rawReviewToken).digest('hex');
    const reviewTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const dashboardBase = (
      process.env.DASHBOARD_URL ||
      process.env.NEXT_PUBLIC_DASHBOARD_URL ||
      'https://app.polarismedia.id'
    ).replace(/\/$/, '');
    const reviewUrl = `${dashboardBase}/review-brief/${rawReviewToken}`;

    const shouldDirectPublish =
      Boolean(dto.directPublishImmediately) &&
      (isSuperadmin || Boolean(assignment?.canDirectPublish));

    const now = new Date();
    const nextStatus = shouldDirectPublish ? 'PUBLISHED' : 'READY_FOR_REVIEW';

    const updatedBrief = await withTenantContext(row.brief.tenantId, async (tx) => {
      if (shouldDirectPublish) {
        await tx
          .update(contentPublications)
          .set({
            status: 'PUBLISHED',
            publishedAt: now,
            updatedAt: now,
          })
          .where(eq(contentPublications.id, publication.id));
      } else {
        await tx
          .update(contentPublications)
          .set({
            status: 'UNDER_REVIEW',
            updatedAt: now,
          })
          .where(eq(contentPublications.id, publication.id));
      }

      const [updated] = await tx
        .update(contentBriefs)
        .set({
          status: nextStatus,
          linkedPublicationId: publication.id,
          articleStatus: shouldDirectPublish ? 'APPROVED' : 'PENDING',
          imageStatus: shouldDirectPublish ? 'APPROVED' : 'PENDING',
          captionStatus: shouldDirectPublish ? 'APPROVED' : 'PENDING',
          reviewTokenHash,
          reviewTokenExpiresAt,
          submittedForReviewAt: now,
          ...(shouldDirectPublish ? { approvedAt: now, publishedAt: now } : {}),
          updatedAt: now,
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      await tx.insert(contentBriefMessages).values({
        briefId,
        tenantId: row.brief.tenantId,
        senderOperatorId: operatorId,
        direction: 'OUTBOUND',
        messageType: posterUrl ? 'IMAGE' : 'TEXT',
        textBody: dto.customNote || `Paket konten "${publication.title}" siap ditinjau.`,
        mediaCdnUrl: posterUrl,
        revisionRound: row.brief.revisionUsed,
        targetComponents: ['ARTICLE', 'IMAGE', 'CAPTION'],
        isInternalFault: false,
      });

      return updated;
    });

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: row.brief.tenantId,
      action: shouldDirectPublish ? 'BRIEF_DIRECT_PUBLISHED' : 'BRIEF_SUBMITTED_FOR_REVIEW',
      targetEntityId: briefId,
      details: {
        briefCode: row.brief.briefCode,
        publicationId: publication.id,
        title: publication.title,
      },
      auditMeta,
    });

    if (posterUrl && posterUrl.startsWith('http')) {
      await this.waClient.sendImageMessage(
        row.phoneNumber,
        posterUrl,
        `🖼️ *Poster Konten — #${row.brief.briefCode}*\n${publication.title}`
      );
    }

    const remainingRevs = Math.max(0, updatedBrief.revisionLimit - updatedBrief.revisionUsed);

    if (shouldDirectPublish) {
      await this.waClient.sendTextMessage(
        row.phoneNumber,
        [
          `✅ *Konten Anda Telah Selesai & Tayang — #${row.brief.briefCode}*`,
          `• 📰 Judul: *${publication.title}*`,
          `• 🔗 Link Artikel: ${publication.canonicalUrl}`,
          '',
          '*Caption Media Sosial:*',
          captionPreview.slice(0, 700),
        ].join('\n')
      );
    } else {
      const reviewBody = [
        `✨ *Konten Siap Ditinjau — #${row.brief.briefCode}*`,
        `• 📰 Judul: *${publication.title}*`,
        `• 💬 Ringkasan Caption: _"${captionPreview.slice(0, 280)}..."_`,
        `• 🔗 Baca Artikel Lengkap (Tanpa Login): ${reviewUrl}`,
        `• 🔄 Sisa Jatah Revisi: *${remainingRevs} dari ${updatedBrief.revisionLimit} putaran*`,
        dto.customNote ? `\n📌 Catatan Tim Redaksi: _"${dto.customNote}"_` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await this.waClient.sendInteractiveButtons(
        row.phoneNumber,
        reviewBody,
        [
          { id: `REV_APPROVE:${briefId}`, title: '✅ Setujui & Tayang' },
          { id: `REV_START:${briefId}`, title: '✏️ Minta Revisi' },
        ],
        `Review #${row.brief.briefCode}`,
        'Tim Redaksi Polaris'
      );
    }

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return {
      brief: this.helper.mapBriefToSanitizedDto(updatedBrief, row.fullName, row.phoneNumber, msgs),
      reviewUrl,
    };
  }

  public async markRevisionInternalFault(
    operatorId: string,
    briefId: string,
    dto: MarkRevisionFaultDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<ContentBriefDto> {
    const [row] = await db
      .select({
        brief: contentBriefs,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(contentBriefs)
      .innerJoin(tenantMembers, eq(contentBriefs.tenantId, tenantMembers.id))
      .where(eq(contentBriefs.id, briefId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Tiket Content Brief tidak ditemukan.');
    }

    await this.helper.assertOperatorCanAccessTenant(operatorId, row.brief.tenantId, isSuperadmin);

    const [msg] = await db
      .select()
      .from(contentBriefMessages)
      .where(
        and(
          eq(contentBriefMessages.id, dto.messageId),
          eq(contentBriefMessages.briefId, briefId)
        )
      )
      .limit(1);

    if (!msg) {
      throw new NotFoundException('Pesan revisi tidak ditemukan pada tiket ini.');
    }

    const updatedBrief = await withTenantContext(row.brief.tenantId, async (tx) => {
      await tx
        .update(contentBriefMessages)
        .set({ isInternalFault: dto.isInternalFault })
        .where(eq(contentBriefMessages.id, dto.messageId));

      const allRevMsgs = await tx
        .select()
        .from(contentBriefMessages)
        .where(
          and(
            eq(contentBriefMessages.briefId, briefId),
            eq(contentBriefMessages.direction, 'INBOUND')
          )
        );

      const distinctCountableRounds = new Set(
        allRevMsgs
          .filter((m) => m.revisionRound > 0 && !m.isInternalFault)
          .map((m) => m.revisionRound)
      );

      const [updated] = await tx
        .update(contentBriefs)
        .set({
          revisionUsed: distinctCountableRounds.size,
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      return updated;
    });

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: row.brief.tenantId,
      action: 'BRIEF_REVISION_FAULT_TOGGLED',
      targetEntityId: briefId,
      details: {
        briefCode: row.brief.briefCode,
        messageId: dto.messageId,
        isInternalFault: dto.isInternalFault,
        recalculatedRevisionUsed: updatedBrief.revisionUsed,
      },
      auditMeta,
    });

    const msgs = await db
      .select()
      .from(contentBriefMessages)
      .where(eq(contentBriefMessages.briefId, briefId))
      .orderBy(asc(contentBriefMessages.createdAt));

    return this.helper.mapBriefToSanitizedDto(updatedBrief, row.fullName, row.phoneNumber, msgs);
  }

  public async updateTenantBriefLimits(
    adminId: string,
    tenantId: string,
    dto: UpdateTenantBriefLimitsDto,
    auditMeta?: RequestAuditMeta
  ): Promise<TenantWeeklyBriefQuotaDto> {
    const configKey = `whatsapp:limits:${tenantId}`;
    const current = await this.helper.getTenantConfiguredLimits(tenantId);
    const updated = {
      weeklyRequestLimit: dto.weeklyRequestLimit ?? current.weeklyRequestLimit,
      revisionLimit: dto.revisionLimit ?? current.revisionLimit,
    };

    await this.redisService.set(configKey, updated);

    const currentWeek = getCurrentWibWeeklyPeriod();
    await withTenantContext(tenantId, async (tx) => {
      await tx
        .update(contentBriefs)
        .set({
          weeklyRequestLimit: updated.weeklyRequestLimit,
          revisionLimit: updated.revisionLimit,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(contentBriefs.tenantId, tenantId),
            eq(contentBriefs.weeklyQuotaPeriod, currentWeek)
          )
        );
    });

    await this.helper.recordOperatorAudit({
      operatorId: adminId,
      tenantId,
      action: 'BRIEF_LIMITS_UPDATED',
      details: updated,
      auditMeta,
    });

    return await this.helper.getTenantWeeklyQuota(tenantId);
  }
}

