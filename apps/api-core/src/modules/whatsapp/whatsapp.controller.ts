import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipRlsContext } from '../../common/decorators/skip-rls-context.decorator.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { WhatsAppService } from './whatsapp.service.js';
import {
  AcceptBriefDto,
  RejectBriefDto,
  SendClarificationDto,
  SubmitBriefReviewDto,
  MarkRevisionFaultDto,
  PublicReviewRevisionDto,
  UpdateTenantBriefLimitsDto,
  DispatchPackageDto,
  SendLiveChatMessageDto,
} from './dto/whatsapp.dto.js';

interface AuthenticatedRequest extends Request {
  rawBody?: string;
  user: {
    tenantId: string;
    operatorId?: string;
    email: string;
    role: string;
    isSuperadmin?: boolean;
    isOperator?: boolean;
  };
}

@Controller('whatsapp')
@SkipRlsContext()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  // =========================================================================
  // 1. META WHATSAPP CLOUD API WEBHOOK ENDPOINTS (PUBLIC & NON-BLOCKING)
  // =========================================================================

  /**
   * GET /api/v1/whatsapp/webhook
   * Endpoint verifikasi Callback URL resmi untuk Meta Developer Dashboard.
   */
  @Public()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.verify_token') token: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
    @Res() res: Response
  ) {
    const verifiedChallenge = this.whatsappService.verifyWebhookHandshake(mode, token, challenge);
    return res.status(HttpStatus.OK).contentType('text/plain').send(verifiedChallenge);
  }

  /**
   * POST /api/v1/whatsapp/webhook
   * Menerima event pesan masuk (teks, foto, dokumen, klik tombol interaktif) dari Meta Cloud API.
   * Wajib mengembalikan HTTP 200 OK secara instan agar Meta tidak melakukan retry berulang.
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleIncomingWebhook(@Req() req: AuthenticatedRequest) {
    const signatureHeader = req.headers['x-hub-signature-256'] as string | undefined;
    const isValidSig = this.whatsappService.verifySignature(req.rawBody, signatureHeader);
    if (!isValidSig) {
      throw new ForbiddenException('Signature X-Hub-Signature-256 tidak valid.');
    }

    const payload = (req.body || {}) as Record<string, any>;
    // Jalankan pemrosesan secara asinkron setelah mengembalikan 200 OK
    setImmediate(() => {
      void this.whatsappService.processIncomingWebhookPayload(payload);
    });

    return { status: 'EVENT_RECEIVED' };
  }

  // =========================================================================
  // 2. OPERATOR COCKPIT & BROKER INBOX ENDPOINTS (JWT + ASSIGNMENT GUARDED)
  // =========================================================================

  /**
   * GET /api/v1/whatsapp/briefs
   * Menampilkan daftar tiket Request Topik (Content Brief) untuk Operator / Superadmin.
   * Nomor HP klien selalu disamarkan (masked).
   */
  @UseGuards(AuthGuard)
  @Get('briefs')
  async listBriefs(
    @Req() req: AuthenticatedRequest,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.listBriefsForOperator(
      operatorId,
      Boolean(req.user.isSuperadmin),
      { tenantId, status }
    );
  }

  /**
   * GET /api/v1/whatsapp/briefs/quota/:tenantId
   * Mengambil status jatah request mingguan (default 3x/minggu, reset Senin 00:00 WIB) untuk suatu dewan.
   */
  @UseGuards(AuthGuard)
  @Get('briefs/quota/:tenantId')
  async getTenantWeeklyQuota(
    @Param('tenantId') tenantId: string,
    @Req() req: AuthenticatedRequest
  ) {
    // Baik Member sendiri, Operator yang ditugaskan, maupun Superadmin dapat mengecek sisa jatah mingguan
    if (!req.user.isOperator && !req.user.isSuperadmin && req.user.tenantId !== tenantId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kuota mingguan dewan ini.');
    }
    return await this.whatsappService.getTenantWeeklyQuota(tenantId);
  }

  /**
   * GET /api/v1/whatsapp/briefs/:briefId
   * Mengambil detail lengkap 1 tiket brief beserta seluruh lampiran foto/dokumen dan riwayat percakapan.
   */
  @UseGuards(AuthGuard)
  @Get('briefs/:briefId')
  async getBriefDetail(
    @Param('briefId') briefId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.getBriefDetailForOperator(
      operatorId,
      briefId,
      Boolean(req.user.isSuperadmin)
    );
  }

  /**
   * POST /api/v1/whatsapp/briefs/:briefId/hydrate-studio
   * Menyiapkan paket bahan dari tiket WhatsApp Brief (Topik Gabungan + Lampiran Media Base64)
   * untuk di-load 1-klik ke Pabrik Konten & Visual AI Operator.
   */
  @UseGuards(AuthGuard)
  @Post('briefs/:briefId/hydrate-studio')
  async hydrateBriefForStudio(
    @Param('briefId') briefId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.hydrateBriefForStudio(
      operatorId,
      briefId,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * POST /api/v1/whatsapp/briefs/:briefId/accept
   * Operator menerima tiket brief & menetapkan prioritas final (memotong 1 jatah mingguan,
   * atau masuk antrean minggu depan bila jatah penuh).
   */
  @UseGuards(AuthGuard)
  @Post('briefs/:briefId/accept')
  async acceptBrief(
    @Param('briefId') briefId: string,
    @Body() dto: AcceptBriefDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.acceptBrief(
      operatorId,
      briefId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * POST /api/v1/whatsapp/briefs/:briefId/reject
   * Operator menolak tiket yang tidak valid (tidak memotong jatah mingguan klien).
   */
  @UseGuards(AuthGuard)
  @Post('briefs/:briefId/reject')
  async rejectBrief(
    @Param('briefId') briefId: string,
    @Body() dto: RejectBriefDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.rejectBrief(
      operatorId,
      briefId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * POST /api/v1/whatsapp/briefs/:briefId/clarify
   * Broker Klarifikasi: Operator mengirim pertanyaan konfirmasi ke WhatsApp Klien sebagai "Tim Redaksi Polaris".
   * Dilengkapi filter pemblokir kontak pribadi (nomor HP, email, link, @username).
   */
  @UseGuards(AuthGuard)
  @Post('briefs/:briefId/clarify')
  async sendClarification(
    @Param('briefId') briefId: string,
    @Body() dto: SendClarificationDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.sendClarificationToClient(
      operatorId,
      briefId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * POST /api/v1/whatsapp/briefs/:briefId/submit-review
   * Operator menautkan hasil generate (Artikel + Poster + Caption) ke tiket brief
   * dan mengirimkannya ke WhatsApp Klien untuk ditinjau/disetujui.
   */
  @UseGuards(AuthGuard)
  @Post('briefs/:briefId/submit-review')
  async submitBriefForReview(
    @Param('briefId') briefId: string,
    @Body() dto: SubmitBriefReviewDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.submitBriefForClientReview(
      operatorId,
      briefId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * POST /api/v1/whatsapp/operator/dispatch-package
   * Mengirimkan paket konten siap tayang (poster HD + naskah multi-kanal)
   * langsung ke nomor WhatsApp Dewan melalui WhatsApp Cloud API Bot Resmi Polaris.
   * Terlindungi dalam Walled Garden tanpa mengekspos nomor pribadi operator maupun klien.
   */
  @UseGuards(AuthGuard)
  @Post('operator/dispatch-package')
  async dispatchPackageToClient(
    @Body() dto: DispatchPackageDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.dispatchPackageToClient(
      operatorId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * PATCH /api/v1/whatsapp/briefs/:briefId/revision-fault
   * Menandai putaran revisi sebagai kesalahan internal agar tidak memotong jatah revisi klien.
   */
  @UseGuards(AuthGuard)
  @Patch('briefs/:briefId/revision-fault')
  async markRevisionInternalFault(
    @Param('briefId') briefId: string,
    @Body() dto: MarkRevisionFaultDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.markRevisionInternalFault(
      operatorId,
      briefId,
      dto,
      Boolean(req.user.isSuperadmin),
      this.extractAuditMeta(req)
    );
  }

  /**
   * PATCH /api/v1/whatsapp/admin/limits/:tenantId
   * Superadmin: Mengatur batas request mingguan (3-4x) dan batas revisi per request (3-4x) untuk klien tertentu.
   */
  @UseGuards(AuthGuard, SuperadminGuard)
  @Patch('admin/limits/:tenantId')
  async updateTenantBriefLimits(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantBriefLimitsDto,
    @Req() req: AuthenticatedRequest
  ) {
    const adminId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.updateTenantBriefLimits(
      adminId,
      tenantId,
      dto,
      this.extractAuditMeta(req)
    );
  }

  // =========================================================================
  // 3. ZERO-LOGIN MAGIC LINK REVIEW ENDPOINTS (PUBLIC TOKENIZED)
  // =========================================================================

  @Public()
  @Get('public-review/:token')
  async getPublicReviewByToken(@Param('token') token: string) {
    return await this.whatsappService.getPublicReviewByToken(token);
  }

  @Public()
  @Post('public-review/:token/approve')
  async approveBriefByToken(@Param('token') token: string) {
    return await this.whatsappService.approveBriefByToken(token);
  }

  @Public()
  @Post('public-review/:token/revision')
  async requestRevisionByToken(
    @Param('token') token: string,
    @Body() dto: PublicReviewRevisionDto
  ) {
    return await this.whatsappService.requestRevisionByToken(token, dto);
  }

  // =========================================================================
  // 4. LIVE DISCUSSION (TWO-WAY CHAT) & OPERATOR KPI
  // =========================================================================

  /**
   * GET /api/v1/whatsapp/live-chat/sessions
   * Operator & Superadmin: Mengambil daftar sesi obrolan (antrean & aktif).
   */
  @UseGuards(AuthGuard)
  @Get('live-chat/sessions')
  async getLiveChatSessions(@Req() req: AuthenticatedRequest) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.whatsappService.getOperatorLiveChatSessions(operatorId);
  }

  /**
   * POST /api/v1/whatsapp/live-chat/sessions/:id/accept
   * Operator: Mengklaim sesi antrean obrolan secara atomik.
   */
  @UseGuards(AuthGuard)
  @Post('live-chat/sessions/:id/accept')
  async acceptLiveChatSession(
    @Param('id') sessionId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    const operatorName = (req.user as any).fullName || (req.user as any).name || req.user.email.split('@')[0];
    return await this.whatsappService.acceptLiveChatSession(sessionId, {
      id: operatorId,
      name: operatorName,
    });
  }

  /**
   * GET /api/v1/whatsapp/live-chat/sessions/:id/messages
   * Operator & Superadmin: Mengambil riwayat pesan untuk sebuah sesi obrolan.
   */
  @UseGuards(AuthGuard)
  @Get('live-chat/sessions/:id/messages')
  async getLiveChatSessionMessages(
    @Param('id') sessionId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    return await this.whatsappService.getLiveChatSessionMessages(sessionId);
  }

  /**
   * POST /api/v1/whatsapp/live-chat/sessions/:id/messages
   * Operator: Mengirim pesan balasan ke WhatsApp klien (dengan Broker Guard anti-leak).
   */
  @UseGuards(AuthGuard)
  @Post('live-chat/sessions/:id/messages')
  async sendOperatorLiveChatMessage(
    @Param('id') sessionId: string,
    @Body() dto: SendLiveChatMessageDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    const operatorId = req.user.operatorId || req.user.tenantId;
    const operatorName = (req.user as any).fullName || (req.user as any).name || req.user.email.split('@')[0];
    return await this.whatsappService.sendOperatorLiveChatMessage(sessionId, {
      id: operatorId,
      name: operatorName,
    }, dto.textBody);
  }

  /**
   * POST /api/v1/whatsapp/live-chat/sessions/:id/ask-completion
   * Operator: Menanyakan ke WhatsApp klien apakah sesi diskusi sudah selesai atau masih lanjut.
   */
  @UseGuards(AuthGuard)
  @Post('live-chat/sessions/:id/ask-completion')
  async askLiveChatCompletion(
    @Param('id') sessionId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    return await this.whatsappService.askLiveChatCompletion(sessionId);
  }

  /**
   * POST /api/v1/whatsapp/live-chat/sessions/:id/close
   * Operator: Menutup sesi obrolan dan memicu survei kepuasan (CSAT) ke WhatsApp klien.
   */
  @UseGuards(AuthGuard)
  @Post('live-chat/sessions/:id/close')
  async closeLiveChatSession(
    @Param('id') sessionId: string,
    @Req() req: AuthenticatedRequest
  ) {
    this.assertOperatorOrSuperadmin(req);
    return await this.whatsappService.closeLiveChatSession(sessionId);
  }

  /**
   * GET /api/v1/whatsapp/kpi/operators
   * Superadmin: Mendapatkan leaderboard metrik KPI operator (FRT, SLA, CSAT, Time to publish).
   */
  @UseGuards(AuthGuard, SuperadminGuard)
  @Get('kpi/operators')
  async getOperatorsKpiSummary(@Req() req: AuthenticatedRequest) {
    return await this.whatsappService.getOperatorsKpiSummary();
  }

  private assertOperatorOrSuperadmin(req: AuthenticatedRequest): void {
    if (!req.user?.isOperator && !req.user?.isSuperadmin) {
      throw new ForbiddenException(
        'Endpoint ini hanya dapat diakses oleh Operator Redaksi atau Superadmin Polaris.'
      );
    }
  }

  private extractAuditMeta(req: AuthenticatedRequest) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return { ipAddress, userAgent };
  }
}

