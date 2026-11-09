import {
  Injectable,
  Logger,
  OnModuleInit,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  db,
  sql,
  eq,
  and,
  desc,
  tenantMembers,
  operatorTenantAssignments,
  operatorAuditLogs,
  contentBriefs,
  contentBriefMessages,
  tenantQuotaWallets,
  tenantQuotaTransactions,
  withTenantContext,
} from '@polaris/database';
import {
  ContentBriefDto,
  ContentBriefMessageDto,
  TenantWeeklyBriefQuotaDto,
  BriefPackageType,
} from '@polaris/shared-types';
import { RedisService } from '../../redis/redis.service.js';
import {
  normalizeIndonesianPhone,
  maskClientPhoneNumber,
  getCurrentWibWeeklyPeriod,
} from '../contact-sanitizer.util.js';

export interface DraftCartItem {
  waMessageId: string;
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT';
  textBody?: string;
  mediaR2Url?: string;
  mediaCdnUrl?: string;
  mediaMimeType?: string;
  mediaFileName?: string;
  mediaFileSizeBytes?: number;
  createdAtIso: string;
}

export interface DraftCartState {
  tenantId: string;
  tenantName: string;
  phoneE164: string;
  items: DraftCartItem[];
  packageType?: BriefPackageType;
  updatedAtMs: number;
}

export interface RevisionSessionState {
  briefId: string;
  briefCode: string;
  tenantId: string;
  targetComponents: ('ARTICLE' | 'IMAGE' | 'CAPTION')[];
  createdAtMs: number;
  updatedAtMs?: number;
  items?: DraftCartItem[];
}

export interface RequestAuditMeta {
  ipAddress?: string;
  userAgent?: string;
}

export const QUOTA_CONSUMING_STATUSES = [
  'SUBMITTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'NEED_CLARIFICATION',
  'READY_FOR_REVIEW',
  'REVISION_REQUESTED',
  'APPROVED',
  'PUBLISHED',
] as const;

const NOISE_GREETING_TOKENS = new Set([
  'hal',
  'halp',
  'halo',
  'hallo',
  'hi',
  'hai',
  'p',
  'ping',
  'tes',
  'test',
  'min',
  'admin',
  'pak',
  'bu',
  'pagi',
  'siang',
  'sore',
  'malam',
  'selamat pagi',
  'selamat siang',
  'selamat sore',
  'selamat malam',
  'assalamualaikum',
  'permisi',
]);

@Injectable()
export class WhatsAppBriefHelperService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppBriefHelperService.name);

  constructor(private readonly redisService: RedisService) { }

  async onModuleInit() {
    await this.ensureBriefSchema();
  }

  public get defaultWeeklyLimit(): number {
    const parsed = Number(process.env.WHATSAPP_WEEKLY_REQUEST_LIMIT || '3');
    return Number.isInteger(parsed) && parsed >= 1 ? parsed : 3;
  }

  public get defaultRevisionLimit(): number {
    const parsed = Number(process.env.WHATSAPP_MAX_REVISION_ROUNDS || '3');
    return Number.isInteger(parsed) && parsed >= 1 ? parsed : 3;
  }

  public get draftDebounceMs(): number {
    const parsed = Number(process.env.WHATSAPP_DRAFT_DEBOUNCE_SECONDS || '25');
    const seconds = Number.isFinite(parsed) && parsed >= 3 ? parsed : 25;
    return seconds * 1000;
  }

  /**
   * Memastikan tabel dan enum Content Brief tersedia di PostgreSQL saat aplikasi menyala.
   */
  public async ensureBriefSchema(): Promise<void> {
    try {
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE content_brief_status_enum AS ENUM (
            'DRAFT', 'SUBMITTED', 'ACCEPTED', 'QUEUED_NEXT_WEEK', 'IN_PROGRESS',
            'NEED_CLARIFICATION', 'READY_FOR_REVIEW', 'REVISION_REQUESTED',
            'APPROVED', 'PUBLISHED', 'REJECTED', 'CANCELLED', 'CLOSED_UNPUBLISHED'
          );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        DO $$ BEGIN
          CREATE TYPE brief_urgency_level_enum AS ENUM ('NORMAL', 'URGENT');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        DO $$ BEGIN
          CREATE TYPE brief_message_direction_enum AS ENUM ('INBOUND', 'OUTBOUND');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        DO $$ BEGIN
          CREATE TYPE brief_message_type_enum AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'INTERACTIVE', 'SYSTEM');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        CREATE TABLE IF NOT EXISTS content_briefs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          brief_code VARCHAR(30) NOT NULL UNIQUE,
          tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
          assigned_operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
          status content_brief_status_enum NOT NULL DEFAULT 'SUBMITTED',
          client_urgency brief_urgency_level_enum NOT NULL DEFAULT 'NORMAL',
          operator_priority brief_urgency_level_enum NOT NULL DEFAULT 'NORMAL',
          target_window VARCHAR(30) NOT NULL DEFAULT 'TODAY_REGULAR',
          topic_summary TEXT NOT NULL,
          weekly_quota_period VARCHAR(15) NOT NULL,
          weekly_request_limit INT NOT NULL DEFAULT 3,
          revision_used INT NOT NULL DEFAULT 0,
          revision_limit INT NOT NULL DEFAULT 3,
          article_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
          image_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
          caption_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
          linked_publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
          review_token_hash VARCHAR(128) UNIQUE,
          review_token_expires_at TIMESTAMPTZ,
          accepted_at TIMESTAMPTZ,
          submitted_for_review_at TIMESTAMPTZ,
          approved_at TIMESTAMPTZ,
          published_at TIMESTAMPTZ,
          operator_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_content_briefs_tenant_status ON content_briefs(tenant_id, status, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_content_briefs_operator_status ON content_briefs(assigned_operator_id, status, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_content_briefs_weekly_quota ON content_briefs(tenant_id, weekly_quota_period);

        ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS target_window VARCHAR(30) NOT NULL DEFAULT 'TODAY_REGULAR';
        ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS quota_cost_deducted INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS is_urgent_overquota BOOLEAN NOT NULL DEFAULT false;

        DO $$ BEGIN
          CREATE TYPE brief_package_type_enum AS ENUM (
            'FULL_CAMPAIGN', 'ARTICLE_ONLY', 'POSTER_ONLY', 'INFOGRAPHIC_ONLY'
          );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS package_type brief_package_type_enum NOT NULL DEFAULT 'FULL_CAMPAIGN';

        DO $$ BEGIN
          CREATE TYPE quota_transaction_type_enum AS ENUM (
            'PACKAGE_PURCHASE', 'REGULAR_CONSUME', 'URGENT_SURGE_CONSUME',
            'REFUND_CANCELLED', 'REFUND_REJECTED', 'EXPIRED_FLUSH', 'ADMIN_ADJUSTMENT'
          );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;

        CREATE TABLE IF NOT EXISTS tenant_quota_wallets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL UNIQUE REFERENCES tenant_members(id) ON DELETE CASCADE,
          total_quota_allocated INTEGER NOT NULL DEFAULT 12,
          remaining_quota INTEGER NOT NULL DEFAULT 0,
          weekly_allowance_limit INTEGER NOT NULL DEFAULT 3,
          current_period_end TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_quota_wallet_tenant ON tenant_quota_wallets(tenant_id);

        CREATE TABLE IF NOT EXISTS tenant_quota_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
          brief_id UUID REFERENCES content_briefs(id) ON DELETE SET NULL,
          invoice_id UUID REFERENCES invoice_transactions(id) ON DELETE SET NULL,
          reference_code VARCHAR(100),
          transaction_type quota_transaction_type_enum NOT NULL,
          amount_delta INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_quota_tx_tenant_created ON tenant_quota_transactions(tenant_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_quota_tx_brief ON tenant_quota_transactions(brief_id);

        ALTER TABLE tenant_quota_transactions ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL;
        ALTER TABLE tenant_quota_transactions ADD COLUMN IF NOT EXISTS ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL;
        ALTER TABLE tenant_quota_transactions ADD COLUMN IF NOT EXISTS channel VARCHAR(30) NOT NULL DEFAULT 'WHATSAPP';
        ALTER TABLE tenant_quota_transactions ADD COLUMN IF NOT EXISTS weekly_quota_period VARCHAR(15);
        CREATE INDEX IF NOT EXISTS idx_quota_tx_publication ON tenant_quota_transactions(publication_id);
        CREATE INDEX IF NOT EXISTS idx_quota_tx_ledger ON tenant_quota_transactions(ledger_id);
        CREATE INDEX IF NOT EXISTS idx_quota_tx_tenant_week ON tenant_quota_transactions(tenant_id, weekly_quota_period);

        ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS revision_used INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS revision_limit INTEGER NOT NULL DEFAULT 3;
        ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS quota_cost_deducted INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS generation_checkpoints JSONB NOT NULL DEFAULT '{}'::jsonb;

        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS openai_input_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS openai_output_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS openai_total_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS openai_image_calls INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS openai_cost_idr BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS gemini_input_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS gemini_output_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS gemini_total_tokens BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS gemini_image_calls INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS gemini_cost_idr BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE tenant_quota_ledgers ADD COLUMN IF NOT EXISTS total_cost_idr BIGINT NOT NULL DEFAULT 0;

        CREATE TABLE IF NOT EXISTS ai_trace_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trace_id VARCHAR(100) NOT NULL,
          tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
          publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
          ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL,
          provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
          operation VARCHAR(100) NOT NULL,
          model VARCHAR(50) NOT NULL,
          input_tokens INTEGER NOT NULL DEFAULT 0,
          output_tokens INTEGER NOT NULL DEFAULT 0,
          total_tokens INTEGER NOT NULL DEFAULT 0,
          image_calls INTEGER NOT NULL DEFAULT 0,
          latency_ms INTEGER NOT NULL DEFAULT 0,
          cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
          fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00,
          cost_idr BIGINT NOT NULL DEFAULT 0,
          visitor_ip_hash VARCHAR(64),
          status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
          error_message TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL;
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL;
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI';
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS image_calls INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00;
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS cost_idr BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE ai_trace_logs ADD COLUMN IF NOT EXISTS visitor_ip_hash VARCHAR(64);

        CREATE TABLE IF NOT EXISTS platform_token_pools (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
          total_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 61.16,
          total_budget_idr BIGINT NOT NULL DEFAULT 1000000,
          consumed_budget_idr BIGINT NOT NULL DEFAULT 0,
          total_tokens_allocated BIGINT NOT NULL DEFAULT 10000000,
          total_tokens_consumed BIGINT NOT NULL DEFAULT 0,
          total_images_generated INTEGER NOT NULL DEFAULT 0,
          alert_threshold_percent INTEGER NOT NULL DEFAULT 20,
          circuit_state VARCHAR(20) NOT NULL DEFAULT 'CLOSED',
          last_alert_sent_at TIMESTAMPTZ,
          last_topup_date TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE platform_token_pools ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI';
        ALTER TABLE platform_token_pools ADD COLUMN IF NOT EXISTS total_budget_idr BIGINT NOT NULL DEFAULT 1000000;
        ALTER TABLE platform_token_pools ADD COLUMN IF NOT EXISTS consumed_budget_idr BIGINT NOT NULL DEFAULT 0;
        ALTER TABLE platform_token_pools ADD COLUMN IF NOT EXISTS total_images_generated INTEGER NOT NULL DEFAULT 0;

        DO $$ BEGIN
          ALTER TABLE platform_token_pools ADD CONSTRAINT unq_platform_token_pools_provider UNIQUE (provider);
        EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
        END $$;

        INSERT INTO platform_token_pools (provider, total_budget_usd, total_budget_idr, consumed_budget_idr, total_tokens_allocated, total_tokens_consumed, total_images_generated, alert_threshold_percent, circuit_state)
        VALUES
          ('OPENAI', 61.16, 1000000, 0, 10000000, 0, 0, 20, 'CLOSED'),
          ('GEMINI', 61.16, 1000000, 0, 25000000, 0, 0, 20, 'CLOSED')
        ON CONFLICT (provider) DO NOTHING;

        CREATE TABLE IF NOT EXISTS platform_topup_histories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          pool_id UUID REFERENCES platform_token_pools(id) ON DELETE SET NULL,
          provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
          amount_usd NUMERIC(10, 2) NOT NULL,
          amount_idr NUMERIC(12, 2) NOT NULL,
          fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00,
          tokens_added BIGINT NOT NULL,
          payment_reference VARCHAR(150) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE platform_topup_histories ADD COLUMN IF NOT EXISTS pool_id UUID REFERENCES platform_token_pools(id) ON DELETE SET NULL;
        ALTER TABLE platform_topup_histories ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI';
        ALTER TABLE platform_topup_histories ADD COLUMN IF NOT EXISTS fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00;

        ALTER TABLE subscription_price_matrices ADD COLUMN IF NOT EXISTS quota_requests INTEGER NOT NULL DEFAULT 12;

        CREATE TABLE IF NOT EXISTS content_brief_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          brief_id UUID NOT NULL REFERENCES content_briefs(id) ON DELETE CASCADE,
          tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
          sender_operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
          direction brief_message_direction_enum NOT NULL,
          message_type brief_message_type_enum NOT NULL,
          wa_message_id VARCHAR(128) UNIQUE,
          text_body TEXT,
          media_r2_url TEXT,
          media_cdn_url TEXT,
          media_mime_type VARCHAR(100),
          media_file_name VARCHAR(255),
          media_file_size_bytes BIGINT,
          revision_round INT NOT NULL DEFAULT 0,
          target_components TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          is_internal_fault BOOLEAN NOT NULL DEFAULT false,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_content_brief_messages_brief ON content_brief_messages(brief_id, created_at ASC);
      `);
      this.logger.log('[WhatsAppBriefHelperService] Skema database Content Brief & Broker siap.');
    } catch (err) {
      this.logger.error(
        `[WhatsAppBriefHelperService] Gagal memastikan skema database Content Brief: ${(err as Error).message}`
      );
    }
  }

  /**
   * Menghitung jatah request mingguan untuk suatu tenant pada minggu berjalan (Senin 00:00 WIB).
   */
  public async getTenantWeeklyQuota(tenantId: string): Promise<TenantWeeklyBriefQuotaDto> {
    const currentWeek = getCurrentWibWeeklyPeriod();
    const limits = await this.getTenantConfiguredLimits(tenantId);

    const rows = await db
      .select({
        status: contentBriefs.status,
        quotaCostDeducted: contentBriefs.quotaCostDeducted,
      })
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          eq(contentBriefs.weeklyQuotaPeriod, currentWeek)
        )
      );

    const whatsappWeeklyUsed = rows
      .filter((r) => (QUOTA_CONSUMING_STATUSES as readonly string[]).includes(r.status))
      .reduce((acc, r) => acc + (r.quotaCostDeducted || 1), 0);

    const queuedNextWeekCount = rows.filter((r) => r.status === 'QUEUED_NEXT_WEEK').length;

    const studioTxRows = await db
      .select({
        amountDelta: tenantQuotaTransactions.amountDelta,
        briefId: tenantQuotaTransactions.briefId,
        channel: tenantQuotaTransactions.channel,
      })
      .from(tenantQuotaTransactions)
      .where(
        and(
          eq(tenantQuotaTransactions.tenantId, tenantId),
          eq(tenantQuotaTransactions.weeklyQuotaPeriod, currentWeek)
        )
      );

    const rawWebStudioDelta = studioTxRows
      .filter((tx) => !tx.briefId && tx.channel === 'WEB_STUDIO')
      .reduce((acc, tx) => acc + (-1 * (Number(tx.amountDelta) || 0)), 0);

    const webStudioWeeklyUsed = Math.max(0, rawWebStudioDelta);
    const weeklyUsed = whatsappWeeklyUsed + webStudioWeeklyUsed;

    const [wallet] = await db
      .select()
      .from(tenantQuotaWallets)
      .where(eq(tenantQuotaWallets.tenantId, tenantId))
      .limit(1);

    const now = new Date();
    const isPeriodExpired = wallet?.currentPeriodEnd ? new Date(wallet.currentPeriodEnd) <= now : false;
    const remainingQuota = isPeriodExpired ? 0 : (wallet?.remainingQuota ?? 12);
    const totalQuotaAllocated = wallet?.totalQuotaAllocated ?? 12;
    const currentPeriodEnd = wallet?.currentPeriodEnd ? wallet.currentPeriodEnd.toISOString() : null;
    const weeklyLimit = wallet?.weeklyAllowanceLimit || limits.weeklyRequestLimit;

    return {
      tenantId,
      weeklyQuotaPeriod: currentWeek,
      weeklyLimit,
      weeklyUsed,
      weeklyRemaining: Math.max(0, weeklyLimit - weeklyUsed),
      whatsappWeeklyUsed,
      webStudioWeeklyUsed,
      totalQuotaAllocated,
      remainingQuota,
      currentPeriodEnd,
      isPeriodExpired,
      queuedNextWeekCount,
    };
  }

  public async getTenantConfiguredLimits(tenantId: string): Promise<{
    weeklyRequestLimit: number;
    revisionLimit: number;
  }> {
    const configKey = `whatsapp:limits:${tenantId}`;
    const cached = await this.redisService.get<{
      weeklyRequestLimit?: number;
      revisionLimit?: number;
    }>(configKey);

    return {
      weeklyRequestLimit: cached?.weeklyRequestLimit || this.defaultWeeklyLimit,
      revisionLimit: cached?.revisionLimit || this.defaultRevisionLimit,
    };
  }

  public async findActiveTenantByPhone(normalizedPhoneE164: string) {
    if (!normalizedPhoneE164) return null;
    const allActiveTenants = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
        accountStatus: tenantMembers.accountStatus,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.accountStatus, 'ACTIVE'));

    return (
      allActiveTenants.find(
        (t) => normalizeIndonesianPhone(t.phoneNumber) === normalizedPhoneE164
      ) || null
    );
  }

  public async findBriefAwaitingClarification(tenantId: string) {
    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          eq(contentBriefs.status, 'NEED_CLARIFICATION')
        )
      )
      .orderBy(desc(contentBriefs.updatedAt))
      .limit(1);

    return brief || null;
  }

  public async findBriefReadyForReview(tenantId: string) {
    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          eq(contentBriefs.status, 'READY_FOR_REVIEW')
        )
      )
      .orderBy(desc(contentBriefs.updatedAt))
      .limit(1);

    return brief || null;
  }

  /**
   * Memeriksa apakah suatu baris chat hanyalah sapaan singkat / typo ("hal", "halp", "halo", "p", dll.)
   * agar tidak mengotori ringkasan topik dan prompt AI di Studio.
   */
  public isNoiseGreetingLine(raw: string | null | undefined): boolean {
    if (!raw) return true;
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
    if (!clean) return true;
    return NOISE_GREETING_TOKENS.has(clean);
  }

  /**
   * Membersihkan deretan pesan teks dari sapaan pendek ("hal", "halp", "halo")
   * apabila sudah ada kalimat topik utama yang lebih berbobot.
   */
  public cleanTopicParts(parts: string[]): string[] {
    const trimmed = parts.map((p) => p.trim()).filter(Boolean);
    const meaningful = trimmed.filter((p) => !this.isNoiseGreetingLine(p));
    return meaningful.length > 0 ? meaningful : trimmed;
  }

  public async generateUniqueBriefCode(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const rand = crypto.randomInt(1000, 9999);
    return `BR-${yy}${mm}-${rand}`;
  }

  public async assertOperatorCanAccessTenant(
    operatorId: string,
    tenantId: string,
    isSuperadmin = false
  ) {
    if (isSuperadmin) return null;
    const [assignment] = await db
      .select()
      .from(operatorTenantAssignments)
      .where(
        and(
          eq(operatorTenantAssignments.operatorId, operatorId),
          eq(operatorTenantAssignments.tenantId, tenantId),
          eq(operatorTenantAssignments.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (!assignment) {
      throw new ForbiddenException(
        'Akses Ditolak: Anda tidak memiliki penugasan aktif untuk mengelola dewan ini.'
      );
    }
    return assignment;
  }

  public async recordOperatorAudit(params: {
    operatorId: string;
    tenantId?: string;
    action: string;
    targetEntityId?: string;
    details?: Record<string, unknown>;
    auditMeta?: RequestAuditMeta;
  }): Promise<void> {
    try {
      await db.insert(operatorAuditLogs).values({
        operatorId: params.operatorId,
        tenantId: params.tenantId ?? null,
        action: params.action,
        targetEntity: 'CONTENT_BRIEF',
        targetEntityId: params.targetEntityId ?? null,
        details: params.details ?? {},
        ipAddress: params.auditMeta?.ipAddress ?? null,
        userAgent: params.auditMeta?.userAgent ?? null,
      });
    } catch (err) {
      this.logger.error(
        `[WhatsAppBriefHelperService] Gagal mencatat operator_audit_logs: ${(err as Error).message}`
      );
    }
  }

  public mapBriefToSanitizedDto(
    brief: typeof contentBriefs.$inferSelect,
    fullName: string,
    rawPhone: string,
    messages: Array<typeof contentBriefMessages.$inferSelect>
  ): ContentBriefDto {
    const mappedMessages: ContentBriefMessageDto[] = messages.map((m) => ({
      id: m.id,
      briefId: m.briefId,
      tenantId: m.tenantId,
      direction: m.direction,
      messageType: m.messageType,
      waMessageId: m.waMessageId,
      textBody: m.textBody,
      mediaCdnUrl: m.mediaCdnUrl,
      mediaMimeType: m.mediaMimeType,
      mediaFileName: m.mediaFileName,
      mediaFileSizeBytes: m.mediaFileSizeBytes,
      revisionRound: m.revisionRound,
      targetComponents: m.targetComponents || [],
      isInternalFault: m.isInternalFault,
      createdAt: m.createdAt.toISOString(),
    }));

    return {
      id: brief.id,
      briefCode: brief.briefCode,
      tenantId: brief.tenantId,
      tenantFullName: fullName,
      tenantMaskedPhone: maskClientPhoneNumber(rawPhone), // NOMOR ASLI TIDAK PERNAH DIEKSPOS KE OPERATOR
      assignedOperatorId: brief.assignedOperatorId,
      status: brief.status,
      packageType: (brief as any).packageType || BriefPackageType.FULL_CAMPAIGN,
      clientUrgency: brief.clientUrgency,
      operatorPriority: brief.operatorPriority,
      targetWindow: ((brief as any).targetWindow || 'TODAY_REGULAR') as any,
      topicSummary: brief.topicSummary,
      weeklyQuotaPeriod: brief.weeklyQuotaPeriod,
      weeklyRequestLimit: brief.weeklyRequestLimit,
      quotaCostDeducted: brief.quotaCostDeducted ?? 1,
      isUrgentOverquota: brief.isUrgentOverquota ?? false,
      revisionUsed: brief.revisionUsed,
      revisionLimit: brief.revisionLimit,
      articleStatus: brief.articleStatus,
      imageStatus: brief.imageStatus,
      captionStatus: brief.captionStatus,
      linkedPublicationId: brief.linkedPublicationId,
      acceptedAt: brief.acceptedAt?.toISOString() ?? null,
      submittedForReviewAt: brief.submittedForReviewAt?.toISOString() ?? null,
      approvedAt: brief.approvedAt?.toISOString() ?? null,
      publishedAt: brief.publishedAt?.toISOString() ?? null,
      operatorNotes: brief.operatorNotes,
      createdAt: brief.createdAt.toISOString(),
      updatedAt: brief.updatedAt.toISOString(),
      messages: mappedMessages,
    };
  }

  public async resolveMediaMessageBuffer(
    mediaR2Url: string | null,
    mediaCdnUrl: string | null
  ): Promise<Buffer | null> {
    if (mediaR2Url) {
      const cleanRel = mediaR2Url.replace(/^\//, '');
      const localCandidates = [
        path.resolve(process.cwd(), 'uploads', cleanRel),
        path.resolve(process.cwd(), '../../uploads', cleanRel),
        path.resolve('/home/pc/projects/polaris-platform/uploads', cleanRel),
      ];
      for (const candidate of localCandidates) {
        if (fs.existsSync(candidate)) {
          return fs.readFileSync(candidate);
        }
      }
    }

    if (mediaCdnUrl) {
      if (mediaCdnUrl.startsWith('data:')) {
        const base64Part = mediaCdnUrl.split(',')[1] || '';
        return Buffer.from(base64Part, 'base64');
      }
      if (mediaCdnUrl.startsWith('http://') || mediaCdnUrl.startsWith('https://')) {
        const response = await fetch(mediaCdnUrl);
        if (response.ok) {
          const arr = await response.arrayBuffer();
          return Buffer.from(arr);
        }
      }
    }

    return null;
  }

  /**
   * Menyetujui dan menayangkan publikasi saat Client klik Setujui (baik dari WA maupun Magic Link).
   */
  public async approveAndPublishBriefData(
    tenantId: string,
    briefId: string
  ): Promise<{
    brief: typeof contentBriefs.$inferSelect | null;
    publishedUrl: string;
  }> {
    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenantId)))
      .limit(1);

    if (!brief) {
      return { brief: null, publishedUrl: '' };
    }

    let publishedUrl = '';
    const now = new Date();
    const { contentPublications } = await import('@polaris/database');

    await withTenantContext(tenantId, async (tx) => {
      if (brief.linkedPublicationId) {
        const [pub] = await tx
          .update(contentPublications)
          .set({
            status: 'PUBLISHED',
            publishedAt: now,
            updatedAt: now,
          })
          .where(eq(contentPublications.id, brief.linkedPublicationId))
          .returning();

        if (pub) {
          publishedUrl = pub.canonicalUrl;
        }
      }

      await tx
        .update(contentBriefs)
        .set({
          status: 'PUBLISHED',
          articleStatus: 'APPROVED',
          imageStatus: 'APPROVED',
          captionStatus: 'APPROVED',
          approvedAt: now,
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(contentBriefs.id, brief.id));

      await tx.insert(contentBriefMessages).values({
        briefId: brief.id,
        tenantId,
        direction: 'INBOUND',
        messageType: 'INTERACTIVE',
        textBody: 'Client menyetujui seluruh paket konten untuk ditayangkan.',
        revisionRound: brief.revisionUsed,
        targetComponents: [],
        isInternalFault: false,
      });
    });

    return { brief, publishedUrl };
  }

  public getPackageTypeLabel(packageType: BriefPackageType | string): string {
    switch (packageType) {
      case BriefPackageType.ARTICLE_ONLY:
        return '📝 Naskah Artikel Berita Saja';
      case BriefPackageType.POSTER_ONLY:
        return '🎨 Poster Visual Saja';
      case BriefPackageType.INFOGRAPHIC_ONLY:
        return '📊 Infografis Data Saja';
      case BriefPackageType.FULL_CAMPAIGN:
      default:
        return '📦 Paket Lengkap (Artikel + Poster + Sosmed)';
    }
  }

  public getPackageTypeBaseCost(packageType: BriefPackageType | string): number {
    return packageType === BriefPackageType.FULL_CAMPAIGN ? 2 : 1;
  }
}


