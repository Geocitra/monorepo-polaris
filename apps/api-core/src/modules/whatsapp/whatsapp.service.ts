import { Injectable } from '@nestjs/common';
import {
  ContentBriefDto,
  TenantWeeklyBriefQuotaDto,
} from '@polaris/shared-types';
import {
  AcceptBriefDto,
  RejectBriefDto,
  SendClarificationDto,
  SubmitBriefReviewDto,
  MarkRevisionFaultDto,
  PublicReviewRevisionDto,
  UpdateTenantBriefLimitsDto,
  DispatchPackageDto,
} from './dto/whatsapp.dto.js';
import {
  WhatsAppBriefHelperService,
  RequestAuditMeta,
} from './services/whatsapp-brief-helper.service.js';
import { WhatsAppBotSessionService } from './services/whatsapp-bot-session.service.js';
import { WhatsAppOperatorBrokerService } from './services/whatsapp-operator-broker.service.js';
import { WhatsAppPublicReviewService } from './services/whatsapp-public-review.service.js';

/**
 * Facade Service untuk modul WhatsApp Intake & Blind Broker.
 * Mendelegasikan logika ke 4 sub-service modular sesuai Single Responsibility Principle (SRP):
 * 1. WhatsAppBriefHelperService    -> Skema DB, Kalkulasi Kuota Mingguan WIB, Sanitasi DTO, & Audit
 * 2. WhatsAppBotSessionService     -> State Machine Bot WA (Interactive List, Draft Debounce, Live Relay Chat)
 * 3. WhatsAppOperatorBrokerService -> Inbox Operator, Hydrate Studio Base64, Klarifikasi, & Pengiriman Review
 * 4. WhatsAppPublicReviewService   -> Magic Link Pratinjau Tanpa Login (/review-brief/[token])
 */
@Injectable()
export class WhatsAppService {
  constructor(
    private readonly helperService: WhatsAppBriefHelperService,
    private readonly botSessionService: WhatsAppBotSessionService,
    private readonly operatorBrokerService: WhatsAppOperatorBrokerService,
    private readonly publicReviewService: WhatsAppPublicReviewService
  ) { }

  // =========================================================================
  // 1. META CLOUD API WEBHOOK HANDSHAKE & INGESTION
  // =========================================================================

  public verifyWebhookHandshake(
    mode: string | undefined,
    token: string | undefined,
    challenge: string | undefined
  ): string {
    return this.botSessionService.verifyWebhookHandshake(mode, token, challenge);
  }

  public verifySignature(
    rawBody: string | undefined,
    signatureHeader: string | undefined
  ): boolean {
    return this.botSessionService.verifySignature(rawBody, signatureHeader);
  }

  public async processIncomingWebhookPayload(payload: Record<string, any>): Promise<void> {
    return await this.botSessionService.processIncomingWebhookPayload(payload);
  }

  // =========================================================================
  // 2. OPERATOR COCKPIT & BROKER INBOX ENDPOINTS
  // =========================================================================

  public async getTenantWeeklyQuota(tenantId: string): Promise<TenantWeeklyBriefQuotaDto> {
    return await this.helperService.getTenantWeeklyQuota(tenantId);
  }

  public async listBriefsForOperator(
    operatorId: string,
    isSuperadmin: boolean,
    filters: { tenantId?: string; status?: string }
  ): Promise<{
    briefs: ContentBriefDto[];
    weeklyQuota?: TenantWeeklyBriefQuotaDto;
  }> {
    return await this.operatorBrokerService.listBriefsForOperator(
      operatorId,
      isSuperadmin,
      filters
    );
  }

  public async getBriefDetailForOperator(
    operatorId: string,
    briefId: string,
    isSuperadmin = false
  ): Promise<ContentBriefDto> {
    return await this.operatorBrokerService.getBriefDetailForOperator(
      operatorId,
      briefId,
      isSuperadmin
    );
  }

  public async hydrateBriefForStudio(
    operatorId: string,
    briefId: string,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.hydrateBriefForStudio(
      operatorId,
      briefId,
      isSuperadmin,
      auditMeta
    );
  }

  public async acceptBrief(
    operatorId: string,
    briefId: string,
    dto: AcceptBriefDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.acceptBrief(
      operatorId,
      briefId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  public async rejectBrief(
    operatorId: string,
    briefId: string,
    dto: RejectBriefDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.rejectBrief(
      operatorId,
      briefId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  public async sendClarificationToClient(
    operatorId: string,
    briefId: string,
    dto: SendClarificationDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.sendClarificationToClient(
      operatorId,
      briefId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  public async submitBriefForClientReview(
    operatorId: string,
    briefId: string,
    dto: SubmitBriefReviewDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.submitBriefForClientReview(
      operatorId,
      briefId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  public async markRevisionInternalFault(
    operatorId: string,
    briefId: string,
    dto: MarkRevisionFaultDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.markRevisionInternalFault(
      operatorId,
      briefId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  public async updateTenantBriefLimits(
    adminId: string,
    tenantId: string,
    dto: UpdateTenantBriefLimitsDto,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.updateTenantBriefLimits(
      adminId,
      tenantId,
      dto,
      auditMeta
    );
  }

  public async dispatchPackageToClient(
    operatorId: string,
    dto: DispatchPackageDto,
    isSuperadmin = false,
    auditMeta?: RequestAuditMeta
  ) {
    return await this.operatorBrokerService.dispatchPackageToClient(
      operatorId,
      dto,
      isSuperadmin,
      auditMeta
    );
  }

  // =========================================================================
  // 3. ZERO-LOGIN MAGIC LINK REVIEW ENDPOINTS
  // =========================================================================

  public async getPublicReviewByToken(rawToken: string) {
    return await this.publicReviewService.getPublicReviewByToken(rawToken);
  }

  public async approveBriefByToken(rawToken: string) {
    return await this.publicReviewService.approveBriefByToken(rawToken);
  }

  public async requestRevisionByToken(rawToken: string, dto: PublicReviewRevisionDto) {
    return await this.publicReviewService.requestRevisionByToken(rawToken, dto);
  }
}
