import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  eq,
  and,
  desc,
  asc,
  inArray,
  sql,
  tenantMembers,
  systemAdmins,
  liveChatSessions,
  liveChatMessages,
  LiveChatSessionRecord,
  LiveChatMessageRecord,
  withTenantContext,
} from '@polaris/database';
import {
  LiveChatSessionStatus,
  LiveChatCsatRating,
  LiveChatSessionDto,
  LiveChatMessageDto,
} from '@polaris/shared-types';
import { RedisService } from '../../redis/redis.service.js';
import { WhatsAppCloudClient } from '../whatsapp-cloud.client.js';
import {
  detectOperatorContactLeak,
  maskClientPhoneNumber,
  normalizeIndonesianPhone,
} from '../contact-sanitizer.util.js';

@Injectable()
export class WhatsAppLiveChatService {
  private readonly logger = new Logger(WhatsAppLiveChatService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly waClient: WhatsAppCloudClient
  ) {}

  /**
   * Mengambil sesi obrolan aktif untuk tenant tertentu, atau membuat sesi baru jika belum ada.
   */
  public async requestOrGetActiveSession(
    tenant: { id: string; fullName: string; phoneNumber?: string },
    clientTopic?: string
  ): Promise<LiveChatSessionRecord> {
    const [existing] = await db
      .select()
      .from(liveChatSessions)
      .where(
        and(
          eq(liveChatSessions.tenantId, tenant.id),
          inArray(liveChatSessions.status, [
            LiveChatSessionStatus.WAITING_OPERATOR,
            LiveChatSessionStatus.ACTIVE,
          ])
        )
      )
      .orderBy(desc(liveChatSessions.createdAt))
      .limit(1);

    if (existing) {
      await this.redisService.set(`whatsapp:live_chat_session:${tenant.id}`, existing.id, 7200);
      return existing;
    }

    // Periksa jam kerja aktif redaksi WIB (08:00 - 17:00 WIB, UTC+7)
    const nowUtc = new Date();
    const wibHours = (nowUtc.getUTCHours() + 7) % 24;
    const isOffHours = wibHours < 8 || wibHours >= 17;

    const sessionCode = await this.generateUniqueSessionCode();

    const [created] = await withTenantContext(tenant.id, async (tx) => {
      return await tx
        .insert(liveChatSessions)
        .values({
          sessionCode,
          tenantId: tenant.id,
          status: LiveChatSessionStatus.WAITING_OPERATOR,
          isOffHours,
          clientInitialTopic: clientTopic || null,
          startedAt: new Date(),
          lastMessageAt: new Date(),
        })
        .returning();
    });

    await this.redisService.set(`whatsapp:live_chat_session:${tenant.id}`, created.id, 7200);

    // Broadcast notifikasi sesi masuk ke seluruh Operator Redaksi aktif
    await this.redisService.publish('polaris:events', JSON.stringify({
      type: 'LIVE_CHAT_INCOMING',
      sessionId: created.id,
      sessionCode: created.sessionCode,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      isOffHours,
      createdAt: created.startedAt.toISOString(),
    }));

    return created;
  }

  /**
   * Operator mengklaim/menerima sesi obrolan dari antrean.
   * Menggunakan kuncian atomik Postgres untuk mencegah race-condition multi-operator.
   */
  public async acceptSession(
    sessionId: string,
    operator: { id: string; name: string }
  ): Promise<LiveChatSessionRecord> {
    const [accepted] = await db
      .update(liveChatSessions)
      .set({
        status: LiveChatSessionStatus.ACTIVE,
        assignedOperatorId: operator.id,
        acceptedAt: new Date(),
        firstResponseSeconds: sql`EXTRACT(EPOCH FROM (NOW() - ${liveChatSessions.startedAt}))::integer`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(liveChatSessions.id, sessionId),
          eq(liveChatSessions.status, LiveChatSessionStatus.WAITING_OPERATOR)
        )
      )
      .returning();

    if (!accepted) {
      throw new BadRequestException(
        'Sesi diskusi ini sudah diterima oleh operator lain atau telah ditutup.'
      );
    }

    // Ambil data tenant untuk menyapa ke WhatsApp
    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, accepted.tenantId))
      .limit(1);

    if (tenant?.phoneNumber) {
      const normPhone = normalizeIndonesianPhone(tenant.phoneNumber);
      await this.waClient.sendInteractiveButtons(
        normPhone,
        [
          `Halo Bapak/Ibu *${tenant.fullName}*, saya *Editor Redaksi Polaris* yang menangani akun Anda.`,
          '',
          'Ada yang bisa kami bantu atau diskusikan mengenai materi konten Anda hari ini?',
          'Identitas & nomor Anda tetap terlindungi',
        ].join('\n'),
        [
          { id: `LIVE_CHAT_COMPLETED:${accepted.id}`, title: '✅ Selesai Diskusi' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Diskusi Redaksi Terhubung',
        'Sesi Obrolan Langsung Aktif'
      );
    }

    // Catat pesan sistem awal di log pesan
    await db.insert(liveChatMessages).values({
      sessionId: accepted.id,
      tenantId: accepted.tenantId,
      senderType: 'SYSTEM',
      textBody: `Sesi diskusi diterima oleh Editor: ${operator.name}`,
    });

    // Broadcast status perubahan sesi ke Operator
    await this.redisService.publish('polaris:events', JSON.stringify({
      type: 'LIVE_CHAT_ACCEPTED',
      sessionId: accepted.id,
      operatorId: operator.id,
      operatorName: operator.name,
    }));

    return accepted;
  }

  /**
   * Menerima pesan inbound dari WhatsApp Klien dan menyimpannya ke sesi live chat.
   */
  public async handleClientIncomingMessage(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    input: {
      wamid: string;
      itemType: 'TEXT' | 'IMAGE' | 'DOCUMENT';
      extractedText: string;
      mediaId?: string;
      rawMimeType?: string;
      rawFileName?: string;
    }
  ): Promise<void> {
    let [activeSession] = await db
      .select()
      .from(liveChatSessions)
      .where(
        and(
          eq(liveChatSessions.tenantId, tenant.id),
          inArray(liveChatSessions.status, [
            LiveChatSessionStatus.WAITING_OPERATOR,
            LiveChatSessionStatus.ACTIVE,
          ])
        )
      )
      .orderBy(desc(liveChatSessions.createdAt))
      .limit(1);

    if (!activeSession) {
      activeSession = await this.requestOrGetActiveSession(tenant, input.extractedText);
    }

    let uploaded: {
      r2StorageUrl?: string;
      cdnPublicUrl?: string;
      mimeType?: string;
      fileSizeBytes?: number;
      fileName?: string;
    } = {};

    if (input.mediaId) {
      uploaded = await this.waClient.downloadMediaToR2(
        input.mediaId,
        tenant.id,
        input.rawMimeType,
        input.rawFileName
      );
    }

    const [savedMsg] = await withTenantContext(tenant.id, async (tx) => {
      const [msg] = await tx
        .insert(liveChatMessages)
        .values({
          sessionId: activeSession.id,
          tenantId: tenant.id,
          senderType: 'CLIENT',
          waMessageId: input.wamid,
          messageType: input.itemType,
          textBody: input.extractedText || null,
          mediaR2Url: uploaded.r2StorageUrl ?? null,
          mediaCdnUrl: uploaded.cdnPublicUrl ?? null,
          mediaMimeType: uploaded.mimeType ?? null,
          mediaFileName: uploaded.fileName ?? null,
        })
        .returning();

      await tx
        .update(liveChatSessions)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(liveChatSessions.id, activeSession.id));

      return [msg];
    });

    // Broadcast pesan masuk ke Operator UI
    await this.redisService.publish('polaris:events', JSON.stringify({
      type: 'LIVE_CHAT_MESSAGE',
      sessionId: activeSession.id,
      messageId: savedMsg.id,
      senderType: 'CLIENT',
      textBody: input.extractedText,
      mediaUrl: uploaded.cdnPublicUrl,
      createdAt: savedMsg.createdAt.toISOString(),
    }));

    // Jika operator sudah ada, kirim notifikasi user ke operator
    if (activeSession.assignedOperatorId) {
      await this.redisService.emitUserNotification(activeSession.assignedOperatorId, {
        id: `chat_msg_${Date.now()}`,
        title: `💬 Pesan dari ${tenant.fullName}`,
        message: input.extractedText
          ? input.extractedText.slice(0, 100)
          : 'Klien mengirimkan lampiran berkas.',
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }
  }

  /**
   * Operator mengirimkan pesan balasan ke WhatsApp Klien melalui Dashboard.
   */
  public async sendOperatorMessage(
    sessionId: string,
    operator: { id: string; name: string },
    textBody: string
  ): Promise<LiveChatMessageRecord> {
    const leakCheck = detectOperatorContactLeak(textBody);
    if (leakCheck.hasLeak) {
      throw new ForbiddenException(
        `Pesan diblokir oleh Broker Guard: ${leakCheck.reason || 'Dilarang mencantumkan kontak pribadi.'}`
      );
    }

    const [session] = await db
      .select()
      .from(liveChatSessions)
      .where(eq(liveChatSessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Sesi obrolan tidak ditemukan.');
    }

    if (session.status !== LiveChatSessionStatus.ACTIVE) {
      throw new BadRequestException('Sesi obrolan ini sudah tidak aktif.');
    }

    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, session.tenantId))
      .limit(1);

    if (!tenant?.phoneNumber) {
      throw new BadRequestException('Nomor WhatsApp klien tidak ditemukan.');
    }

    const normPhone = normalizeIndonesianPhone(tenant.phoneNumber);

    // Kirim pesan ke WhatsApp Klien via Meta Cloud API
    const sent = await this.waClient.sendTextMessage(normPhone, textBody);

    const isFirstOperatorResponse = !session.firstOperatorResponseAt;

    // Verifikasi validitas operator ID di tabel systemAdmins untuk foreign key
    let verifiedOperatorId: string | null = null;
    if (operator?.id) {
      const [adminUser] = await db
        .select({ id: systemAdmins.id })
        .from(systemAdmins)
        .where(eq(systemAdmins.id, operator.id))
        .limit(1);
      if (adminUser) {
        verifiedOperatorId = adminUser.id;
      }
    }

    const [savedMsg] = await withTenantContext(session.tenantId, async (tx) => {
      const [msg] = await tx
        .insert(liveChatMessages)
        .values({
          sessionId: session.id,
          tenantId: session.tenantId,
          senderType: 'OPERATOR',
          senderOperatorId: verifiedOperatorId,
          waMessageId: sent?.messageId || null,
          messageType: 'TEXT',
          textBody,
        })
        .returning();

      await tx
        .update(liveChatSessions)
        .set({
          firstOperatorResponseAt: isFirstOperatorResponse
            ? new Date()
            : session.firstOperatorResponseAt,
          firstResponseSeconds: isFirstOperatorResponse
            ? sql`EXTRACT(EPOCH FROM (NOW() - ${liveChatSessions.startedAt}))::integer`
            : session.firstResponseSeconds,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(liveChatSessions.id, session.id));

      return [msg];
    });

    // Broadcast ke frontend Operator
    await this.redisService.publish('polaris:events', JSON.stringify({
      type: 'LIVE_CHAT_MESSAGE',
      sessionId: session.id,
      messageId: savedMsg.id,
      senderType: 'OPERATOR',
      senderOperatorId: verifiedOperatorId,
      textBody,
      createdAt: savedMsg.createdAt.toISOString(),
    }));

    return savedMsg;
  }

  /**
   * Operator menanyakan kesiapan selesai ke Klien di WhatsApp.
   */
  public async askSessionCompletion(sessionId: string): Promise<void> {
    const [session] = await db
      .select()
      .from(liveChatSessions)
      .where(eq(liveChatSessions.id, sessionId))
      .limit(1);

    if (!session) throw new NotFoundException('Sesi obrolan tidak ditemukan.');

    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, session.tenantId))
      .limit(1);

    if (!tenant?.phoneNumber) return;

    const normPhone = normalizeIndonesianPhone(tenant.phoneNumber);
    await this.waClient.sendInteractiveButtons(
      normPhone,
      [
        `Halo Bapak/Ibu *${tenant.fullName}*, apakah sesi diskusi kita sudah cukup, atau masih ada yang ingin Anda tanyakan?`,
      ].join('\n'),
      [
        { id: `LIVE_CHAT_COMPLETED:${session.id}`, title: '✅ Sudah Cukup / Selesai' },
        { id: `LIVE_CHAT_CONTINUE:${session.id}`, title: '💬 Masih Ada Pertanyaan' },
      ],
      'Konfirmasi Selesai Diskusi',
      'Pilih status kelanjutan sesi'
    );
  }

  /**
   * Mengakhiri sesi diskusi dan mengirimkan formulir survei kepuasan (CSAT).
   */
  public async completeSessionAndTriggerCsat(sessionId: string): Promise<void> {
    const [session] = await db
      .select()
      .from(liveChatSessions)
      .where(eq(liveChatSessions.id, sessionId))
      .limit(1);

    if (!session) return;

    await db
      .update(liveChatSessions)
      .set({
        status: LiveChatSessionStatus.AWAITING_FEEDBACK,
        updatedAt: new Date(),
      })
      .where(eq(liveChatSessions.id, sessionId));

    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, session.tenantId))
      .limit(1);

    if (!tenant?.phoneNumber) return;

    const normPhone = normalizeIndonesianPhone(tenant.phoneNumber);

    // Tampilkan survei kepuasan 1-klik ala blu BCA (Gambar 4)
    await this.waClient.sendInteractiveButtons(
      normPhone,
      [
        `Terima kasih telah menggunakan layanan diskusi redaksi *Polaris*.`,
        '',
        `Mohon kesediaan Bapak/Ibu *${tenant.fullName}* untuk memberikan penilaian singkat:`,
        `*Seberapa puas Anda terhadap respon dan bantuan Editor kami?*`,
      ].join('\n'),
      [
        { id: `CSAT_RATING:${session.id}:SATISFIED`, title: '⭐ Puas' },
        { id: `CSAT_RATING:${session.id}:DISSATISFIED`, title: 'Kurang Puas' },
      ],
      'Survei Kepuasan Layanan',
      'Masukan Anda sangat berarti bagi kami'
    );
  }

  /**
   * Menyimpan feedback kepuasan klien (CSAT) dan menutup sesi secara permanen.
   */
  public async recordCsatFeedback(
    sessionId: string,
    rating: LiveChatCsatRating,
    feedbackText?: string
  ): Promise<void> {
    const [session] = await db
      .select()
      .from(liveChatSessions)
      .where(eq(liveChatSessions.id, sessionId))
      .limit(1);

    if (!session) return;

    await db
      .update(liveChatSessions)
      .set({
        status: LiveChatSessionStatus.CLOSED,
        csatRating: rating,
        csatFeedbackText: feedbackText ?? null,
        endedAt: new Date(),
        totalDurationSeconds: sql`EXTRACT(EPOCH FROM (NOW() - ${liveChatSessions.startedAt}))::integer`,
        updatedAt: new Date(),
      })
      .where(eq(liveChatSessions.id, sessionId));

    await this.redisService.del(`whatsapp:session_intent:${session.tenantId}`);
    await this.redisService.del(`whatsapp:live_chat_session:${session.tenantId}`);

    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, session.tenantId))
      .limit(1);

    if (tenant?.phoneNumber) {
      const normPhone = normalizeIndonesianPhone(tenant.phoneNumber);
      await this.waClient.sendInteractiveButtons(
        normPhone,
        [
          `✅ *Terima kasih banyak atas waktu dan penilaian Bapak/Ibu!*`,
          '',
          'Tanggapan Anda sangat berarti bagi peningkatan kualitas layanan Redaksi Polaris.',
          'Semoga harinya menyenangkan!',
        ].join('\n'),
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten Baru' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Sesi Diskusi Selesai',
        'Asisten Redaksi Polaris'
      );
    }
  }

  /**
   * Mengambil daftar sesi antrean dan aktif untuk layar kerja Operator.
   */
  public async getOperatorSessions(operatorId?: string): Promise<LiveChatSessionDto[]> {
    const sessions = await db
      .select({
        session: liveChatSessions,
        tenantName: tenantMembers.fullName,
        tenantPhone: tenantMembers.phoneNumber,
        operatorName: systemAdmins.fullName,
      })
      .from(liveChatSessions)
      .innerJoin(tenantMembers, eq(liveChatSessions.tenantId, tenantMembers.id))
      .leftJoin(systemAdmins, eq(liveChatSessions.assignedOperatorId, systemAdmins.id))
      .where(
        inArray(liveChatSessions.status, [
          LiveChatSessionStatus.WAITING_OPERATOR,
          LiveChatSessionStatus.ACTIVE,
          LiveChatSessionStatus.AWAITING_FEEDBACK,
          LiveChatSessionStatus.CLOSED,
        ])
      )
      .orderBy(desc(liveChatSessions.lastMessageAt), desc(liveChatSessions.startedAt))
      .limit(100);

    return sessions.map(({ session, tenantName, tenantPhone, operatorName }) => ({
      id: session.id,
      sessionCode: session.sessionCode,
      tenantId: session.tenantId,
      tenantFullName: tenantName,
      tenantPhoneNumber: maskClientPhoneNumber(tenantPhone),
      assignedOperatorId: session.assignedOperatorId,
      assignedOperatorName: operatorName ?? null,
      status: session.status as LiveChatSessionStatus,
      isOffHours: session.isOffHours,
      clientInitialTopic: session.clientInitialTopic,
      startedAt: session.startedAt.toISOString(),
      acceptedAt: session.acceptedAt?.toISOString() ?? null,
      firstOperatorResponseAt: session.firstOperatorResponseAt?.toISOString() ?? null,
      endedAt: session.endedAt?.toISOString() ?? null,
      lastMessageAt: session.lastMessageAt.toISOString(),
      firstResponseSeconds: session.firstResponseSeconds,
      totalDurationSeconds: session.totalDurationSeconds,
      csatRating: session.csatRating as LiveChatCsatRating | null,
      csatFeedbackText: session.csatFeedbackText,
      convertedToBriefId: session.convertedToBriefId,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }));
  }

  /**
   * Mengambil riwayat pesan untuk sebuah sesi.
   */
  public async getSessionMessages(sessionId: string): Promise<LiveChatMessageDto[]> {
    const msgs = await db
      .select({
        msg: liveChatMessages,
        operatorName: systemAdmins.fullName,
      })
      .from(liveChatMessages)
      .leftJoin(systemAdmins, eq(liveChatMessages.senderOperatorId, systemAdmins.id))
      .where(eq(liveChatMessages.sessionId, sessionId))
      .orderBy(asc(liveChatMessages.createdAt));

    return msgs.map(({ msg, operatorName }) => ({
      id: msg.id,
      sessionId: msg.sessionId,
      tenantId: msg.tenantId,
      senderType: msg.senderType as 'CLIENT' | 'OPERATOR' | 'SYSTEM',
      senderOperatorId: msg.senderOperatorId,
      senderName: msg.senderType === 'OPERATOR' ? (operatorName || 'Editor Redaksi') : undefined,
      waMessageId: msg.waMessageId,
      messageType: msg.messageType as 'TEXT' | 'IMAGE' | 'DOCUMENT',
      textBody: msg.textBody,
      mediaR2Url: msg.mediaR2Url,
      mediaCdnUrl: msg.mediaCdnUrl,
      mediaMimeType: msg.mediaMimeType,
      mediaFileName: msg.mediaFileName,
      createdAt: msg.createdAt.toISOString(),
    }));
  }

  private async generateUniqueSessionCode(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `CS-${yy}${mm}`;

    const [latest] = await db
      .select({ sessionCode: liveChatSessions.sessionCode })
      .from(liveChatSessions)
      .orderBy(desc(liveChatSessions.createdAt))
      .limit(1);

    let nextNumber = 1001;
    if (latest && latest.sessionCode && latest.sessionCode.startsWith(prefix)) {
      const parts = latest.sessionCode.split('-');
      const numPart = parseInt(parts[2], 10);
      if (!isNaN(numPart)) nextNumber = numPart + 1;
    }

    return `${prefix}-${nextNumber}`;
  }
}

