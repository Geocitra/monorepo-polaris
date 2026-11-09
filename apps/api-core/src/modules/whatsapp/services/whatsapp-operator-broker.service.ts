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
import { QuotaWalletService } from '../../billing/quota-wallet.service.js';
import { WhatsAppCloudClient } from '../whatsapp-cloud.client.js';
import {
  getCurrentWibWeeklyPeriod,
  detectOperatorContactLeak,
  getTimeHorizonInfo,
} from '../contact-sanitizer.util.js';
import {
  AcceptBriefDto,
  RejectBriefDto,
  SendClarificationDto,
  SubmitBriefReviewDto,
  MarkRevisionFaultDto,
  UpdateTenantBriefLimitsDto,
  DispatchPackageDto,
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
    private readonly helper: WhatsAppBriefHelperService,
    private readonly quotaWalletService: QuotaWalletService
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

    const initialTextsRaw = msgs
      .filter(
        (m) =>
          m.direction === 'INBOUND' &&
          m.messageType !== 'INTERACTIVE' &&
          m.revisionRound === 0 &&
          m.textBody &&
          m.textBody.trim()
      )
      .map((m) => m.textBody!.trim());

    const cleanedInitialTexts = this.helper.cleanTopicParts(initialTextsRaw);

    const revisionTextParts = msgs
      .filter(
        (m) =>
          m.direction === 'INBOUND' &&
          m.messageType !== 'INTERACTIVE' &&
          m.revisionRound > 0 &&
          m.textBody &&
          m.textBody.trim()
      )
      .map((m) => {
        const compLabel =
          m.targetComponents && m.targetComponents.length > 0
            ? ` (${m.targetComponents.join(', ')})`
            : '';
        return `[Catatan Revisi Putaran #${m.revisionRound}${compLabel}]: ${m.textBody?.trim()}`;
      });

    const combinedParts = [...cleanedInitialTexts, ...revisionTextParts].filter(Boolean);

    const topicPrompt =
      combinedParts.length > 0
        ? combinedParts.join('\n\n')
        : this.helper.cleanTopicParts([currentBriefDto.topicSummary]).join('\n\n') ||
          currentBriefDto.topicSummary;

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
      const horizon = getTimeHorizonInfo(finalPriority as 'URGENT' | 'NORMAL', new Date());
      const scheduleMsg =
        finalPriority === 'URGENT'
          ? 'dialokasikan ke Tim Editor Utama sebagai prioritas tayang hari ini.'
          : horizon.isAfterCutoff
            ? 'dijadwalkan untuk diproduksi pertama pada jam kerja redaksi besok pagi (mulai pukul 08:00 WIB).'
            : 'sudah di meja pengerjaan Tim Redaksi untuk diproses tayang hari ini.';
      await this.waClient.sendTextMessage(
        row.phoneNumber,
        `👨‍💻 *Update Tiket #${row.brief.briefCode}*\n\nRequest topik Anda telah diterima Tim Redaksi dan ${scheduleMsg}\n(Sisa jatah minggu ini: *${quotaAfter.weeklyRemaining} request*).`
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

        const refundResult = await this.quotaWalletService.refundQuota({
      tenantId: row.brief.tenantId,
      briefId: row.brief.id,
      reason: dto.reason,
      isCancelledByClient: false,
    });

    await this.waClient.sendTextMessage(
      row.phoneNumber,
      `ℹ️ *Informasi Tiket #${row.brief.briefCode}*\n\nMohon maaf, request ini belum dapat kami proses dengan catatan:\n_"${dto.reason}"_\n\nSaldo kuota Anda sebesar *+${refundResult.refundedCost} Request* telah dikembalikan 100% ke akun Anda. Saldo sekarang: *${refundResult.remainingQuota} Request*.`
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

    const isRevisionInProgress = row.brief.status === 'REVISION_REQUESTED';
    const isTerminalStatus = ['PUBLISHED', 'APPROVED', 'REJECTED'].includes(row.brief.status);
    const requiresAnswer = Boolean(dto.requiresClientAnswer);

    const statusLine = isRevisionInProgress
      ? `🔄 *Status Tiket:* Sedang Dikerjakan Revisi (Putaran #${row.brief.revisionUsed}/${row.brief.revisionLimit})`
      : requiresAnswer
        ? `❓ *Status Tiket:* Menunggu Konfirmasi / Jawaban Anda`
        : `📌 *Status Tiket:* Informasi / Perkembangan Redaksi`;

    const instructionFooter = isRevisionInProgress
      ? '_Tim Redaksi sedang mengerjakan perbaikan konten Anda. Jika ada detail tambahan untuk revisi ini, silakan balas pesan ini secara langsung._'
      : requiresAnswer
        ? '_Mohon balas pesan ini untuk memberikan konfirmasi kepada Editor Redaksi agar pengerjaan dapat dilanjutkan._'
        : '_Pesan informasi dari Tim Redaksi Polaris. Tiket Anda tetap aktif berjalan di meja redaksi._';

    const waButtons = [
      ...(requiresAnswer
        ? [{ id: `CLARIFY_REPLY:${row.brief.id}`, title: '💬 Jawab Klarifikasi' }]
        : []),
      { id: 'MENU_CHECK_STATUS', title: '📊 Status Pengerjaan' },
      { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
    ];

    const waResult = await this.waClient.sendInteractiveButtons(
      row.phoneNumber,
      [
        `👨‍💼 *Editor Redaksi Polaris — #${row.brief.briefCode}*`,
        statusLine,
        '',
        dto.questionText.trim(),
        '',
        instructionFooter,
      ].join('\n'),
      waButtons,
      `Pesan Redaksi #${row.brief.briefCode}`,
      'Tim Redaksi Polaris'
    );

    const nextBriefStatus = isRevisionInProgress
      ? 'REVISION_REQUESTED'
      : isTerminalStatus
        ? row.brief.status
        : requiresAnswer
          ? 'NEED_CLARIFICATION'
          : row.brief.status;

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
          status: nextBriefStatus,
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
    const pkgType = (row.brief as any).packageType || 'FULL_CAMPAIGN';

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

      const hasArticle = pkgType === 'FULL_CAMPAIGN' || pkgType === 'ARTICLE_ONLY';
      const hasImage = pkgType === 'FULL_CAMPAIGN' || pkgType === 'POSTER_ONLY' || pkgType === 'INFOGRAPHIC_ONLY';
      const hasCaption = pkgType === 'FULL_CAMPAIGN' || pkgType === 'ARTICLE_ONLY';

      const [updated] = await tx
        .update(contentBriefs)
        .set({
          status: nextStatus,
          linkedPublicationId: publication.id,
          articleStatus: hasArticle ? (shouldDirectPublish ? 'APPROVED' : 'PENDING') : 'NOT_APPLICABLE',
          imageStatus: hasImage ? (shouldDirectPublish ? 'APPROVED' : 'PENDING') : 'NOT_APPLICABLE',
          captionStatus: hasCaption ? (shouldDirectPublish ? 'APPROVED' : 'PENDING') : 'NOT_APPLICABLE',
          reviewTokenHash,
          reviewTokenExpiresAt,
          submittedForReviewAt: now,
          ...(shouldDirectPublish ? { approvedAt: now, publishedAt: now } : {}),
          updatedAt: now,
        })
        .where(eq(contentBriefs.id, briefId))
        .returning();

      const outboundTargetComps: ('ARTICLE' | 'IMAGE' | 'CAPTION')[] = [];
      if (hasArticle) outboundTargetComps.push('ARTICLE');
      if (hasImage) outboundTargetComps.push('IMAGE');
      if (hasCaption) outboundTargetComps.push('CAPTION');

      await tx.insert(contentBriefMessages).values({
        briefId,
        tenantId: row.brief.tenantId,
        senderOperatorId: operatorId,
        direction: 'OUTBOUND',
        messageType: posterUrl ? 'IMAGE' : 'TEXT',
        textBody: dto.customNote || `Paket konten "${publication.title}" siap ditinjau.`,
        mediaCdnUrl: posterUrl,
        revisionRound: row.brief.revisionUsed,
        targetComponents: outboundTargetComps,
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

    const isVisualOnly = pkgType === 'POSTER_ONLY' || pkgType === 'INFOGRAPHIC_ONLY';
    const isArticleOnly = pkgType === 'ARTICLE_ONLY';

    // Kirim naskah siaran WhatsApp sebagai 1 balon pesan bersih terpisah (siap langsung 1-klik FORWARD ke grup dapil)
    if (syndication?.whatsappBroadcastText && !isVisualOnly) {
      try {
        await this.waClient.sendTextMessage(
          row.phoneNumber,
          syndication.whatsappBroadcastText.trim()
        );
      } catch (waBroadcastErr) {
        this.logger.warn(`Gagal mengirim balon naskah siaran WA: ${waBroadcastErr}`);
      }
    }

    const remainingRevs = Math.max(0, updatedBrief.revisionLimit - updatedBrief.revisionUsed);
    const formatBadge =
      pkgType === 'POSTER_ONLY'
        ? '🎨 Poster Visual'
        : pkgType === 'INFOGRAPHIC_ONLY'
        ? '📊 Infografis Publik'
        : pkgType === 'ARTICLE_ONLY'
        ? '📝 Naskah Artikel'
        : '📦 Paket Lengkap';

    if (shouldDirectPublish) {
      await this.waClient.sendTextMessage(
        row.phoneNumber,
        [
          `✅ *Konten Anda Telah Selesai & Tayang — #${row.brief.briefCode}*`,
          `• 📦 Format: *${formatBadge}*`,
          `• 📰 Judul: *${publication.title}*`,
          publication.canonicalUrl ? `• 🔗 Link Publikasi: ${publication.canonicalUrl}` : '',
          captionPreview && !isVisualOnly ? '\n*Caption Media Sosial:*' : '',
          captionPreview && !isVisualOnly ? captionPreview.slice(0, 700) : '',
        ].filter(Boolean).join('\n')
      );
    } else {
      await this.redisService.del(`whatsapp:rev_session:${row.brief.tenantId}`);

      const linkLabel = isVisualOnly
        ? 'Pratinjau Desain Visual (Tanpa Login)'
        : 'Baca Naskah & Pratinjau (Tanpa Login)';

      const reviewBody = [
        `✨ *Konten Siap Ditinjau — #${row.brief.briefCode}*`,
        `• 📦 Format: *${formatBadge}*`,
        `• 📰 Judul: *${publication.title}*`,
        captionPreview && !isVisualOnly ? `• 💬 Ringkasan Caption: _"${captionPreview.slice(0, 280)}..."_` : '',
        `• 🔗 ${linkLabel}: ${reviewUrl}`,
        remainingRevs > 0
          ? `• 🔄 Sisa Jatah Revisi: *${remainingRevs} dari ${updatedBrief.revisionLimit} putaran*`
          : `• 🔒 Jatah Revisi: *Telah terpakai penuh (${updatedBrief.revisionUsed}/${updatedBrief.revisionLimit} putaran)*`,
        dto.customNote ? `\n📌 Catatan Tim Redaksi: _"${dto.customNote}"_` : '',
        '',
        remainingRevs > 0
          ? '_Silakan pilih *Setujui & Tayang* jika sudah sesuai, atau *Minta Revisi* jika ada bagian yang perlu diperbaiki:_'
          : '_Seluruh putaran revisi telah selesai dikerjakan. Silakan tekan *Setujui & Tayang* untuk menerbitkan konten:_',
      ]
        .filter(Boolean)
        .join('\n');

      const reviewButtons =
        remainingRevs > 0
          ? [
              { id: `REV_APPROVE:${briefId}`, title: '✅ Setujui & Tayang' },
              { id: `REV_START:${briefId}`, title: '✏️ Minta Revisi' },
              { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
            ]
          : [
              { id: `REV_APPROVE:${briefId}`, title: '✅ Setujui & Tayang' },
              { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
            ];

      await this.waClient.sendInteractiveButtons(
        row.phoneNumber,
        reviewBody,
        reviewButtons,
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

  /**
   * Mengirimkan paket konten siap tayang (poster HD + naskah siaran + caption)
   * langsung ke nomor WhatsApp Dewan melalui Cloud API Bot Resmi Polaris.
   * Terlindungi dalam Walled Garden tanpa mengekspos nomor pribadi operator maupun klien.
   */
  public async dispatchPackageToClient(
    operatorId: string,
    dto: DispatchPackageDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ): Promise<{ success: boolean; message: string; recipientName: string }> {
    await this.helper.assertOperatorCanAccessTenant(operatorId, dto.tenantId, isSuperadmin);

    const [tenant] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
        partyAffiliation: tenantMembers.partyAffiliation,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, dto.tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Data dewan/klien tidak ditemukan.');
    }

    if (!tenant.phoneNumber) {
      throw new ForbiddenException(
        `Dewan "${tenant.fullName}" belum memiliki nomor WhatsApp terdaftar di sistem. Harap lengkapi di profil dewan.`
      );
    }

    // 1. Kirim Poster Visual jika tersedia
    if (dto.posterUrl && dto.posterUrl.startsWith('http')) {
      try {
        await this.waClient.sendImageMessage(
          tenant.phoneNumber,
          dto.posterUrl,
          `🖼️ *Poster Visual Siap Tayang*\nUntuk: ${tenant.fullName}`
        );
      } catch (err) {
        this.logger.error(`Gagal mengirim poster via WA Bot: ${err}`);
      }
    }

    // 2. Kirim Naskah Paket Konten Lengkap
    if (dto.packageText && dto.packageText.trim()) {
      await this.waClient.sendTextMessage(tenant.phoneNumber, dto.packageText.trim());
    }

    await this.helper.recordOperatorAudit({
      operatorId,
      tenantId: dto.tenantId,
      action: 'OPERATOR_DISPATCHED_PACKAGE_TO_CLIENT',
      targetEntityId: dto.publicationId || dto.tenantId,
      details: {
        recipientName: tenant.fullName,
        hasPoster: Boolean(dto.posterUrl),
      },
      auditMeta,
    });

    return {
      success: true,
      message: `Paket konten berhasil dikirim ke WhatsApp resmi ${tenant.fullName} melalui Bot Polaris.`,
      recipientName: tenant.fullName,
    };
  }
}

