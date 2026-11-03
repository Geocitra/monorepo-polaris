import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  eq,
  and,
  desc,
  operatorTenantAssignments,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  contentBriefs,
  contentBriefMessages,
  withTenantContext,
} from '@polaris/database';
import { BriefUrgencyLevel } from '@polaris/shared-types';
import { RedisService } from '../../redis/redis.service.js';
import { WhatsAppCloudClient } from '../whatsapp-cloud.client.js';
import {
  normalizeIndonesianPhone,
  getCurrentWibWeeklyPeriod,
} from '../contact-sanitizer.util.js';
import {
  WhatsAppBriefHelperService,
  DraftCartState,
  RevisionSessionState,
} from './whatsapp-brief-helper.service.js';

@Injectable()
export class WhatsAppBotSessionService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppBotSessionService.name);
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly redisService: RedisService,
    private readonly waClient: WhatsAppCloudClient,
    private readonly helper: WhatsAppBriefHelperService
  ) {}

  onModuleDestroy() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  public verifyWebhookHandshake(
    mode: string | undefined,
    token: string | undefined,
    challenge: string | undefined
  ): string {
    const expectedToken = (
      process.env.WHATSAPP_VERIFY_TOKEN || 'polaris-wa-webhook-verify-2026'
    ).trim();
    if (mode === 'subscribe' && token === expectedToken && challenge) {
      this.logger.log('[WhatsAppWebhook] Handshake verifikasi Meta berhasil.');
      return challenge;
    }
    throw new ForbiddenException('Token verifikasi webhook WhatsApp tidak cocok.');
  }

  public verifySignature(rawBody: string | undefined, signatureHeader: string | undefined): boolean {
    return this.waClient.verifyWebhookSignature(rawBody, signatureHeader);
  }

  /**
   * Memproses payload webhook dari Meta secara asinkron (setelah HTTP 200 OK dikembalikan).
   */
  public async processIncomingWebhookPayload(payload: Record<string, any>): Promise<void> {
    if (
      !payload ||
      payload.object !== 'whatsapp_business_account' ||
      !Array.isArray(payload.entry)
    ) {
      return;
    }

    for (const entry of payload.entry) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        if (change?.field !== 'messages') continue;
        const value = change?.value;
        const messages = Array.isArray(value?.messages) ? value.messages : [];
        for (const msg of messages) {
          try {
            await this.handleSingleWhatsAppMessage(msg);
          } catch (err) {
            this.logger.error(
              `[WhatsAppWebhook] Gagal memproses pesan wamid=${msg?.id}: ${(err as Error).message}`,
              (err as Error).stack
            );
          }
        }
      }
    }
  }

  private async handleSingleWhatsAppMessage(msg: Record<string, any>): Promise<void> {
    const wamid: string | undefined = msg?.id;
    const rawFrom: string | undefined = msg?.from;
    const msgType: string | undefined = msg?.type;

    if (!wamid || !rawFrom || !msgType) return;

    // 1. Idempotency Guard (mencegah webhook retry dari Meta diproses ganda)
    const idempKey = `whatsapp:wamid:${wamid}`;
    const alreadySeen = await this.redisService.get<string>(idempKey);
    if (alreadySeen) {
      return;
    }
    await this.redisService.set(idempKey, '1', 86400);

    // 2. Identifikasi Tenant berdasarkan nomor HP (E.164 Normalized)
    const normalizedSender = normalizeIndonesianPhone(rawFrom);
    const tenant = await this.helper.findActiveTenantByPhone(normalizedSender);

    if (!tenant) {
      const unknownRateKey = `whatsapp:unknown_reply:${normalizedSender}`;
      const count = await this.redisService.incrementRateLimit(unknownRateKey, 3600);
      if (count === 1) {
        await this.waClient.sendTextMessage(
          normalizedSender,
          'Halo, nomor WhatsApp ini belum terdaftar sebagai akun klien aktif di Polaris Platform. Silakan pastikan nomor WhatsApp Anda telah terdaftar pada profil akun Anda.'
        );
      }
      return;
    }

    // 3. Tolak jenis pesan yang tidak didukung (Voice Note / Audio / Video / Sticker / Location)
    const unsupportedTypes = ['audio', 'voice', 'video', 'sticker', 'location', 'contacts'];
    if (unsupportedTypes.includes(msgType)) {
      await this.waClient.sendTextMessage(
        normalizedSender,
        `Halo Bapak/Ibu *${tenant.fullName}*,\n\nMohon maaf, saat ini sistem Redaksi Polaris hanya menerima instruksi berupa *Pesan Teks*, *Foto*, dan *Dokumen (PDF/Word)*.\n\nSilakan ketik pokok topik atau isu yang ingin dibuatkan konten (cukup 1–3 paragraf ringkas).`
      );
      return;
    }

    // 4. Tangani Balasan Interaktif (Interactive Button Reply & Interactive List Drawer Reply)
    if (msgType === 'interactive') {
      const actionId: string | undefined =
        msg?.interactive?.button_reply?.id || msg?.interactive?.list_reply?.id;
      if (actionId) {
        await this.handleInteractiveButtonAction(tenant, normalizedSender, actionId);
      }
      return;
    }

    // 5. Ekstrak konten Teks / Gambar / Dokumen
    let extractedText = '';
    let itemType: 'TEXT' | 'IMAGE' | 'DOCUMENT' = 'TEXT';
    let mediaId: string | undefined;
    let rawMimeType: string | undefined;
    let rawFileName: string | undefined;

    if (msgType === 'text') {
      extractedText = (msg?.text?.body || '').trim();
      itemType = 'TEXT';
    } else if (msgType === 'image') {
      itemType = 'IMAGE';
      mediaId = msg?.image?.id;
      rawMimeType = msg?.image?.mime_type || 'image/jpeg';
      extractedText = (msg?.image?.caption || '').trim();
    } else if (msgType === 'document') {
      itemType = 'DOCUMENT';
      mediaId = msg?.document?.id;
      rawMimeType = msg?.document?.mime_type || 'application/pdf';
      rawFileName = msg?.document?.filename;
      extractedText = (msg?.document?.caption || '').trim();
    } else {
      return;
    }

    // 6. Cek apakah Client sedang dalam sesi mengisi Catatan Revisi
    const revSessionKey = `whatsapp:rev_session:${tenant.id}`;
    const activeRevSession = await this.redisService.get<RevisionSessionState>(revSessionKey);
    if (activeRevSession) {
      await this.processClientRevisionSubmission(tenant, normalizedSender, activeRevSession, {
        wamid,
        itemType,
        extractedText,
        mediaId,
        rawMimeType,
        rawFileName,
      });
      return;
    }

    // 7. Cek apakah ada Tiket Brief milik Client yang sedang menunggu jawaban Klarifikasi Operator
    // atau apakah Client sedang dalam Mode Diskusi Langsung (Live Relay Chat) dengan Editor
    const clarifyingBrief = await this.helper.findBriefAwaitingClarification(tenant.id);
    if (clarifyingBrief) {
      await this.processClientClarificationReply(tenant, normalizedSender, clarifyingBrief, {
        wamid,
        itemType,
        extractedText,
        mediaId,
        rawMimeType,
        rawFileName,
      });
      return;
    }

    const liveChatActive = await this.redisService.get<string>(`whatsapp:live_chat:${tenant.id}`);
    if (liveChatActive) {
      await this.processClientLiveChatMessage(tenant, normalizedSender, {
        wamid,
        itemType,
        extractedText,
        mediaId,
        rawMimeType,
        rawFileName,
      });
      return;
    }

    // 8. Perintah Cepat Teks & Deteksi Sapaan Menu Utama
    const lowerCmd = extractedText.toLowerCase();
    if (
      itemType === 'TEXT' &&
      (lowerCmd === 'status' || lowerCmd === 'cek status' || lowerCmd === 'kuota')
    ) {
      await this.sendClientStatusOverview(tenant.id, tenant.fullName, normalizedSender);
      return;
    }

    const draftKey = `whatsapp:draft:${tenant.id}`;
    const existingDraft = await this.redisService.get<DraftCartState>(draftKey);

    if (itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
      this.clearTenantDebounceTimer(tenant.id);
      await this.redisService.del(draftKey);
      await this.waClient.sendTextMessage(
        normalizedSender,
        'Keranjang request topik telah dibatalkan. Silakan kirim topik, foto, atau dokumen baru kapan saja.'
      );
      return;
    }

    if (
      itemType === 'TEXT' &&
      (lowerCmd === 'kirim' || lowerCmd === 'selesai') &&
      existingDraft &&
      existingDraft.items.length > 0
    ) {
      this.clearTenantDebounceTimer(tenant.id);
      await this.sendDraftConfirmationPrompt(existingDraft);
      return;
    }

    // Jika keranjang masih kosong dan klien mengirim sapaan singkat ("halo", "p", "menu", dll.),
    // langsung tampilkan Menu Utama Interaktif (List Drawer) tanpa menunggu debounce.
    if (
      itemType === 'TEXT' &&
      (!existingDraft || existingDraft.items.length === 0) &&
      this.isGreetingOrMenuCommand(extractedText)
    ) {
      await this.sendMainMenuPrompt(tenant.id, tenant.fullName, normalizedSender);
      return;
    }

    // 9. Unduh Media (Foto / Dokumen) ke Cloudflare R2 bila ada
    let uploadedMedia: {
      r2StorageUrl?: string;
      cdnPublicUrl?: string;
      mimeType?: string;
      fileSizeBytes?: number;
      fileName?: string;
    } = {};

    if (mediaId) {
      const downloaded = await this.waClient.downloadMediaToR2(
        mediaId,
        tenant.id,
        rawMimeType,
        rawFileName
      );
      uploadedMedia = {
        r2StorageUrl: downloaded.r2StorageUrl,
        cdnPublicUrl: downloaded.cdnPublicUrl,
        mimeType: downloaded.mimeType,
        fileSizeBytes: downloaded.fileSizeBytes,
        fileName: downloaded.fileName,
      };
    }

    // 10. Masukkan ke Keranjang Draft (Bulk Message Aggregation) & Jadwalkan Debounce
    const draftState: DraftCartState = existingDraft || {
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      phoneE164: normalizedSender,
      items: [],
      updatedAtMs: Date.now(),
    };

    draftState.items.push({
      waMessageId: wamid,
      messageType: itemType,
      textBody: extractedText || undefined,
      mediaR2Url: uploadedMedia.r2StorageUrl,
      mediaCdnUrl: uploadedMedia.cdnPublicUrl,
      mediaMimeType: uploadedMedia.mimeType,
      mediaFileName: uploadedMedia.fileName,
      mediaFileSizeBytes: uploadedMedia.fileSizeBytes,
      createdAtIso: new Date().toISOString(),
    });
    draftState.updatedAtMs = Date.now();

    await this.redisService.set(draftKey, draftState, 7200);
    this.scheduleDraftConfirmationPrompt(tenant.id);
  }

  private clearTenantDebounceTimer(tenantId: string): void {
    const existing = this.debounceTimers.get(tenantId);
    if (existing) {
      clearTimeout(existing);
      this.debounceTimers.delete(tenantId);
    }
  }

  private scheduleDraftConfirmationPrompt(tenantId: string): void {
    this.clearTenantDebounceTimer(tenantId);
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(tenantId);
      try {
        const draftKey = `whatsapp:draft:${tenantId}`;
        const draft = await this.redisService.get<DraftCartState>(draftKey);
        if (draft && draft.items.length > 0) {
          await this.sendDraftConfirmationPrompt(draft);
        }
      } catch (err) {
        this.logger.error(
          `[WhatsAppDebounce] Gagal mengirim konfirmasi draft untuk tenant ${tenantId}: ${(err as Error).message}`
        );
      }
    }, this.helper.draftDebounceMs);
    this.debounceTimers.set(tenantId, timer);
  }

  private async sendDraftConfirmationPrompt(draft: DraftCartState): Promise<void> {
    const photoCount = draft.items.filter((i) => i.messageType === 'IMAGE').length;
    const docCount = draft.items.filter((i) => i.messageType === 'DOCUMENT').length;
    const textSnippets = draft.items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));

    const combinedTopic =
      textSnippets.length > 0
        ? textSnippets.join(' | ').slice(0, 220)
        : 'Lampiran kegiatan/dokumen (tanpa catatan teks)';

    const quota = await this.helper.getTenantWeeklyQuota(draft.tenantId);

    const summaryLines = [
      `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah kami tampung:`,
      `• 📝 Catatan Topik: _"${combinedTopic}"_`,
      `• 📷 Foto Kegiatan: *${photoCount} file*`,
      `• 📄 Dokumen Lampiran: *${docCount} file*`,
      `• 📊 Sisa Jatah Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
      '',
      'Jika masih ada foto/dokumen tambahan, silakan langsung kirim lagi. Jika sudah lengkap, pilih tingkat urgensi di bawah untuk diteruskan ke Tim Redaksi:',
    ].join('\n');

    await this.waClient.sendInteractiveButtons(
      draft.phoneE164,
      summaryLines,
      [
        { id: 'BRIEF_SUBMIT_URGENT', title: '🔴 Kirim Mendesak' },
        { id: 'BRIEF_SUBMIT_NORMAL', title: '🟢 Kirim Biasa' },
        { id: 'BRIEF_CANCEL', title: '❌ Batal' },
      ],
      'Konfirmasi Request Konten',
      'Tim Redaksi Polaris'
    );
  }

  private async handleInteractiveButtonAction(
    tenant: { id: string; fullName: string; phoneNumber: string },
    phoneE164: string,
    buttonId: string
  ): Promise<void> {
    this.clearTenantDebounceTimer(tenant.id);
    const draftKey = `whatsapp:draft:${tenant.id}`;

    if (buttonId === 'MENU_OPEN_MAIN') {
      await this.redisService.del(`whatsapp:live_chat:${tenant.id}`);
      await this.sendMainMenuPrompt(tenant.id, tenant.fullName, phoneE164);
      return;
    }

    if (buttonId === 'MENU_NEW_BRIEF') {
      await this.redisService.del(`whatsapp:live_chat:${tenant.id}`);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `📝 *Mode Pengiriman Bahan Konten Aktif*`,
          '',
          'Silakan langsung kirimkan secara beruntun ke chat ini:',
          '1️⃣ *Pesan Teks* berisi pokok topik/isu atau kegiatan (1–3 paragraf)',
          '2️⃣ *Foto Kegiatan* (bisa kirim beberapa foto sekaligus)',
          '3️⃣ *Dokumen Pendukung* (PDF/Word bila ada)',
          '',
          '_Sistem otomatis menggabungkan seluruh kiriman Anda dan memunculkan tombol konfirmasi setelah Anda selesai mengirim._',
        ].join('\n'),
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Request Konten Baru',
        'Asisten Redaksi Polaris'
      );
      return;
    }

    if (buttonId === 'MENU_CHECK_STATUS') {
      await this.sendClientStatusOverview(tenant.id, tenant.fullName, phoneE164);
      return;
    }

    if (buttonId === 'MENU_LATEST_LINKS') {
      await this.sendLatestPublicationsMenu(tenant.id, tenant.fullName, phoneE164);
      return;
    }

    if (buttonId.startsWith('PUB_DETAIL:')) {
      const pubId = buttonId.slice('PUB_DETAIL:'.length).trim();
      await this.sendPublicationDetailPackage(tenant.id, pubId, phoneE164);
      return;
    }

    if (buttonId === 'MENU_LIVE_CHAT') {
      await this.redisService.set(`whatsapp:live_chat:${tenant.id}`, 'ACTIVE', 3600);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `💬 *Mode Diskusi Langsung dengan Tim Redaksi Aktif*`,
          '',
          `Halo Bapak/Ibu *${tenant.fullName}*, silakan tulis pesan, arahan sudut pandang (angle), atau pertanyaan Anda di bawah ini.`,
          '',
          'Pesan Anda langsung diteruskan ke layar Editor Redaksi yang menangani profil Anda, dan balasan Editor akan masuk ke WhatsApp ini.',
        ].join('\n'),
        [
          { id: 'LIVE_CHAT_END', title: '✅ Akhiri Diskusi' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Diskusi Tim Redaksi',
        'Identitas & nomor Anda tetap terlindungi'
      );
      return;
    }

    if (buttonId === 'LIVE_CHAT_END') {
      await this.redisService.del(`whatsapp:live_chat:${tenant.id}`);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        '✅ Sesi diskusi langsung dengan Tim Redaksi telah diakhiri. Silakan pilih layanan lainnya di bawah ini:',
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten' },
          { id: 'MENU_LATEST_LINKS', title: '🔗 Link & Arsip' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    if (buttonId === 'MENU_HELP') {
      const quota = await this.helper.getTenantWeeklyQuota(tenant.id);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `📖 *Panduan Layanan Asisten Redaksi Polaris*`,
          '',
          `• *Jatah Request Topik:* ${quota.weeklyLimit}x per minggu (reset otomatis setiap Senin 00:00 WIB).`,
          `• *Jatah Revisi:* Maksimal ${this.helper.defaultRevisionLimit} putaran revisi per request (mencakup Artikel, Gambar Poster, dan Caption).`,
          '• *Cara Request:* Cukup kirimkan foto kegiatan, dokumen, dan teks topik ke WhatsApp ini tanpa perlu login.',
          '• *Persetujuan Tayang:* Pratinjau dikirim ke WhatsApp ini dan hanya tayang setelah Anda menekan tombol *Setujui & Tayang*.',
        ].join('\n'),
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten' },
          { id: 'MENU_LATEST_LINKS', title: '🔗 Link & Arsip' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Panduan Layanan',
        'Asisten Redaksi Polaris'
      );
      return;
    }

    if (buttonId === 'BRIEF_CANCEL') {
      await this.redisService.del(draftKey);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        '✅ Draft request topik telah dibatalkan. Apa yang ingin Anda lakukan selanjutnya?',
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    if (buttonId === 'BRIEF_SUBMIT_URGENT' || buttonId === 'BRIEF_SUBMIT_NORMAL') {
      const draft = await this.redisService.get<DraftCartState>(draftKey);
      if (!draft || draft.items.length === 0) {
        await this.waClient.sendTextMessage(
          phoneE164,
          'Keranjang bahan Anda sudah kosong atau telah dikirim sebelumnya. Silakan kirim teks, foto, atau dokumen topik baru.'
        );
        return;
      }

      const clientUrgency =
        buttonId === 'BRIEF_SUBMIT_URGENT' ? BriefUrgencyLevel.URGENT : BriefUrgencyLevel.NORMAL;
      await this.redisService.del(draftKey);

      const createdBrief = await this.commitDraftToBriefTicket(tenant, draft, clientUrgency);
      const quota = await this.helper.getTenantWeeklyQuota(tenant.id);

      const quotaNotice =
        quota.weeklyRemaining > 0
          ? `Request ini akan diproses oleh Tim Redaksi (sisa jatah minggu ini sebelum diproses: *${quota.weeklyRemaining}/${quota.weeklyLimit}*).`
          : `Jatah request minggu ini (*${quota.weeklyLimit}/${quota.weeklyLimit}*) telah penuh. Request Anda tetap kami simpan dan dijadwalkan otomatis untuk slot Senin depan.`;

      await this.waClient.sendTextMessage(
        phoneE164,
        [
          `✅ *Request Diterima: #${createdBrief.briefCode}*`,
          `• Sinyal Urgensi: *${clientUrgency === 'URGENT' ? 'Mendesak (Hari Ini)' : 'Biasa'}*`,
          `• Status: *Menunggu Verifikasi Tim Redaksi*`,
          '',
          quotaNotice,
          'Kami akan mengirimkan pratinjau Artikel, Poster, dan Caption langsung ke WhatsApp ini setelah selesai dibuat.',
        ].join('\n')
      );
      return;
    }

    if (buttonId.startsWith('REV_APPROVE:')) {
      const briefId = buttonId.slice('REV_APPROVE:'.length).trim();
      await this.approveAndPublishBriefFromClient(tenant.id, briefId, phoneE164);
      return;
    }

    if (buttonId.startsWith('REV_START:')) {
      const briefId = buttonId.slice('REV_START:'.length).trim();
      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) {
        await this.waClient.sendTextMessage(phoneE164, 'Data tiket tidak ditemukan.');
        return;
      }

      if (brief.revisionUsed >= brief.revisionLimit) {
        await this.waClient.sendTextMessage(
          phoneE164,
          `Mohon maaf, batas revisi untuk tiket *#${brief.briefCode}* telah habis (*${brief.revisionUsed}/${brief.revisionLimit} putaran*). Silakan setujui hasil saat ini atau kirim topik sebagai request baru.`
        );
        return;
      }

      const remaining = brief.revisionLimit - brief.revisionUsed;
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `Pilih bagian yang ingin direvisi untuk tiket *#${brief.briefCode}* (Sisa jatah revisi: *${remaining} dari ${brief.revisionLimit} putaran*):`,
        [
          { id: `REV_COMP_ART:${brief.id}`, title: '📝 Artikel Saja' },
          { id: `REV_COMP_IMG:${brief.id}`, title: '🖼️ Gambar & Caption' },
          { id: `REV_COMP_ALL:${brief.id}`, title: '✏️ Revisi Semua' },
        ],
        `Revisi #${brief.briefCode}`,
        'Satu putaran revisi mencakup seluruh catatan Anda'
      );
      return;
    }

    if (
      buttonId.startsWith('REV_COMP_ART:') ||
      buttonId.startsWith('REV_COMP_IMG:') ||
      buttonId.startsWith('REV_COMP_ALL:')
    ) {
      const [prefix, briefId] = buttonId.split(':');
      if (!briefId) return;

      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) return;

      let targetComponents: ('ARTICLE' | 'IMAGE' | 'CAPTION')[] = ['ARTICLE', 'IMAGE', 'CAPTION'];
      let label = 'Artikel, Gambar & Caption';
      if (prefix === 'REV_COMP_ART') {
        targetComponents = ['ARTICLE'];
        label = 'Artikel Saja';
      } else if (prefix === 'REV_COMP_IMG') {
        targetComponents = ['IMAGE', 'CAPTION'];
        label = 'Gambar & Caption';
      }

      const revSession: RevisionSessionState = {
        briefId: brief.id,
        briefCode: brief.briefCode,
        tenantId: tenant.id,
        targetComponents,
        createdAtMs: Date.now(),
      };

      await this.redisService.set(`whatsapp:rev_session:${tenant.id}`, revSession, 1800);

      await this.waClient.sendTextMessage(
        phoneE164,
        `✏️ *Mode Revisi (${label}) — #${brief.briefCode}*\n\nSilakan balas pesan ini dengan *catatan revisi lengkap Anda dalam 1 pesan* (Anda juga boleh melampirkan 1 foto pengganti beserta keterangannya).`
      );
      return;
    }
  }

  private async commitDraftToBriefTicket(
    tenant: { id: string; fullName: string },
    draft: DraftCartState,
    clientUrgency: BriefUrgencyLevel
  ) {
    const [assignment] = await db
      .select()
      .from(operatorTenantAssignments)
      .where(
        and(
          eq(operatorTenantAssignments.tenantId, tenant.id),
          eq(operatorTenantAssignments.status, 'ACTIVE')
        )
      )
      .orderBy(desc(operatorTenantAssignments.createdAt))
      .limit(1);

    const assignedOperatorId = assignment?.operatorId ?? null;
    const weeklyQuotaPeriod = getCurrentWibWeeklyPeriod();
    const briefCode = await this.helper.generateUniqueBriefCode();

    const textParts = draft.items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));

    const topicSummary =
      textParts.length > 0
        ? textParts.join('\n\n')
        : `Kiriman ${draft.items.length} file lampiran kegiatan dari ${tenant.fullName}`;

    const limits = await this.helper.getTenantConfiguredLimits(tenant.id);

    const createdBrief = await withTenantContext(tenant.id, async (tx) => {
      const [insertedBrief] = await tx
        .insert(contentBriefs)
        .values({
          briefCode,
          tenantId: tenant.id,
          assignedOperatorId,
          status: 'SUBMITTED',
          clientUrgency,
          operatorPriority: clientUrgency,
          topicSummary,
          weeklyQuotaPeriod,
          weeklyRequestLimit: limits.weeklyRequestLimit,
          revisionUsed: 0,
          revisionLimit: limits.revisionLimit,
        })
        .returning();

      for (const item of draft.items) {
        await tx.insert(contentBriefMessages).values({
          briefId: insertedBrief.id,
          tenantId: tenant.id,
          direction: 'INBOUND',
          messageType: item.messageType,
          waMessageId: item.waMessageId,
          textBody: item.textBody ?? null,
          mediaR2Url: item.mediaR2Url ?? null,
          mediaCdnUrl: item.mediaCdnUrl ?? null,
          mediaMimeType: item.mediaMimeType ?? null,
          mediaFileName: item.mediaFileName ?? null,
          mediaFileSizeBytes: item.mediaFileSizeBytes ?? null,
          revisionRound: 0,
          targetComponents: [],
          isInternalFault: false,
        });
      }

      return insertedBrief;
    });

    const notifTitle =
      clientUrgency === 'URGENT'
        ? `🔴 Request Topik MENDESAK #${createdBrief.briefCode}`
        : `📥 Request Topik Baru #${createdBrief.briefCode}`;
    const notifBody = `${tenant.fullName} mengirim request topik via WhatsApp (${draft.items.length} pesan/lampiran).`;

    await this.redisService.emitUserNotification(tenant.id, {
      id: `brief_${createdBrief.id}`,
      title: notifTitle,
      message: notifBody,
      category: 'ARTICLE',
      link: '/operator/workspace',
    });

    if (assignedOperatorId) {
      await this.redisService.emitUserNotification(assignedOperatorId, {
        id: `brief_op_${createdBrief.id}`,
        title: notifTitle,
        message: notifBody,
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }

    return createdBrief;
  }

  private async processClientClarificationReply(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    brief: typeof contentBriefs.$inferSelect,
    input: {
      wamid: string;
      itemType: 'TEXT' | 'IMAGE' | 'DOCUMENT';
      extractedText: string;
      mediaId?: string;
      rawMimeType?: string;
      rawFileName?: string;
    }
  ): Promise<void> {
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

    await withTenantContext(tenant.id, async (tx) => {
      await tx.insert(contentBriefMessages).values({
        briefId: brief.id,
        tenantId: tenant.id,
        direction: 'INBOUND',
        messageType: input.itemType,
        waMessageId: input.wamid,
        textBody: input.extractedText || null,
        mediaR2Url: uploaded.r2StorageUrl ?? null,
        mediaCdnUrl: uploaded.cdnPublicUrl ?? null,
        mediaMimeType: uploaded.mimeType ?? null,
        mediaFileName: uploaded.fileName ?? null,
        mediaFileSizeBytes: uploaded.fileSizeBytes ?? null,
        revisionRound: brief.revisionUsed,
        targetComponents: [],
        isInternalFault: false,
      });

      await tx
        .update(contentBriefs)
        .set({
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, brief.id));
    });

    await this.waClient.sendTextMessage(
      phoneE164,
      `✅ Terima kasih Bapak/Ibu *${tenant.fullName}*, jawaban konfirmasi Anda untuk tiket *#${brief.briefCode}* telah diteruskan ke Tim Redaksi.`
    );

    if (brief.assignedOperatorId) {
      await this.redisService.emitUserNotification(brief.assignedOperatorId, {
        id: `clarify_reply_${Date.now()}`,
        title: `💬 Balasan Klarifikasi #${brief.briefCode}`,
        message: `${tenant.fullName} telah membalas pertanyaan klarifikasi Anda.`,
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }
  }

  public async processClientRevisionSubmission(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    revSession: RevisionSessionState,
    input: {
      wamid: string;
      itemType: 'TEXT' | 'IMAGE' | 'DOCUMENT';
      extractedText: string;
      mediaId?: string;
      rawMimeType?: string;
      rawFileName?: string;
    }
  ): Promise<void> {
    await this.redisService.del(`whatsapp:rev_session:${tenant.id}`);

    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(and(eq(contentBriefs.id, revSession.briefId), eq(contentBriefs.tenantId, tenant.id)))
      .limit(1);

    if (!brief) return;

    if (brief.revisionUsed >= brief.revisionLimit) {
      await this.waClient.sendTextMessage(
        phoneE164,
        `Batas revisi untuk tiket *#${brief.briefCode}* telah habis (${brief.revisionUsed}/${brief.revisionLimit}).`
      );
      return;
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

    const nextRound = brief.revisionUsed + 1;
    const comps = revSession.targetComponents;

    await withTenantContext(tenant.id, async (tx) => {
      await tx.insert(contentBriefMessages).values({
        briefId: brief.id,
        tenantId: tenant.id,
        direction: 'INBOUND',
        messageType: input.itemType,
        waMessageId: input.wamid,
        textBody: input.extractedText || 'Permintaan revisi dengan lampiran media baru.',
        mediaR2Url: uploaded.r2StorageUrl ?? null,
        mediaCdnUrl: uploaded.cdnPublicUrl ?? null,
        mediaMimeType: uploaded.mimeType ?? null,
        mediaFileName: uploaded.fileName ?? null,
        mediaFileSizeBytes: uploaded.fileSizeBytes ?? null,
        revisionRound: nextRound,
        targetComponents: comps,
        isInternalFault: false,
      });

      await tx
        .update(contentBriefs)
        .set({
          status: 'REVISION_REQUESTED',
          revisionUsed: nextRound,
          articleStatus: comps.includes('ARTICLE') ? 'REVISION' : 'APPROVED',
          imageStatus: comps.includes('IMAGE') ? 'REVISION' : 'APPROVED',
          captionStatus: comps.includes('CAPTION') ? 'REVISION' : 'APPROVED',
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, brief.id));
    });

    const remaining = Math.max(0, brief.revisionLimit - nextRound);
    await this.waClient.sendTextMessage(
      phoneE164,
      [
        `✅ *Catatan Revisi Diterima — #${brief.briefCode}*`,
        `• Komponen: *${comps.join(', ')}*`,
        `• Putaran Revisi: *${nextRound} dari ${brief.revisionLimit}* (Sisa revisi: *${remaining}x*)`,
        '',
        'Tim Redaksi sedang mengerjakan perbaikan sesuai arahan Anda.',
      ].join('\n')
    );

    if (brief.assignedOperatorId) {
      await this.redisService.emitUserNotification(brief.assignedOperatorId, {
        id: `rev_req_${Date.now()}`,
        title: `✏️ Revisi Putaran #${nextRound} — #${brief.briefCode}`,
        message: `${tenant.fullName} meminta revisi pada komponen: ${comps.join(', ')}.`,
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }
  }

  public async approveAndPublishBriefFromClient(
    tenantId: string,
    briefId: string,
    phoneE164: string
  ): Promise<void> {
    const { brief, publishedUrl } = await this.helper.approveAndPublishBriefData(
      tenantId,
      briefId
    );

    if (!brief) {
      await this.waClient.sendTextMessage(phoneE164, 'Tiket request tidak ditemukan.');
      return;
    }

    await this.waClient.sendTextMessage(
      phoneE164,
      [
        `🎉 *Konten Resmi Tayang — #${brief.briefCode}*`,
        '',
        'Terima kasih, paket konten Anda telah disetujui dan diterbitkan.',
        publishedUrl ? `🔗 Link Artikel: ${publishedUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );

    if (brief.assignedOperatorId) {
      await this.redisService.emitUserNotification(brief.assignedOperatorId, {
        id: `brief_pub_${Date.now()}`,
        title: `✅ Disetujui & Tayang — #${brief.briefCode}`,
        message: `Client telah menyetujui hasil generate melalui WhatsApp.`,
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }
  }

  private async sendClientStatusOverview(
    tenantId: string,
    tenantName: string,
    phoneE164: string
  ): Promise<void> {
    const quota = await this.helper.getTenantWeeklyQuota(tenantId);
    const recentBriefs = await db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.tenantId, tenantId))
      .orderBy(desc(contentBriefs.createdAt))
      .limit(3);

    const briefLines =
      recentBriefs.length > 0
        ? recentBriefs
            .map(
              (b) =>
                `• *#${b.briefCode}* — Status: *${b.status}* (Revisi: ${b.revisionUsed}/${b.revisionLimit})`
            )
            .join('\n')
        : '• Belum ada tiket request aktif.';

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `📊 *Status Layanan Redaksi — ${tenantName}*`,
        `• Periode Minggu Ini: *${quota.weeklyQuotaPeriod}*`,
        `• Jatah Terpakai: *${quota.weeklyUsed} dari ${quota.weeklyLimit} request*`,
        `• Sisa Jatah Minggu Ini: *${quota.weeklyRemaining} request*`,
        '',
        '*3 Request Terakhir:*',
        briefLines,
      ].join('\n'),
      [
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten' },
        { id: 'MENU_LATEST_LINKS', title: '🔗 Link & Arsip' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Status & Kuota Mingguan',
      'Asisten Redaksi Polaris'
    );
  }

  private async sendLatestPublicationsMenu(
    tenantId: string,
    tenantName: string,
    phoneE164: string
  ): Promise<void> {
    const pubs = await db
      .select()
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(contentPublications.createdAt))
      .limit(5);

    if (pubs.length === 0) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `Halo Bapak/Ibu *${tenantName}*, saat ini belum ada arsip artikel yang diterbitkan. Silakan ajukan request konten pertama Anda:`,
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    await this.waClient.sendInteractiveList(
      phoneE164,
      `Berikut adalah *${pubs.length} konten terakhir* Bapak/Ibu *${tenantName}*.\n\nSilakan tekan tombol di bawah lalu pilih judul konten untuk menerima *Link Artikel, Poster, dan Teks Siap Sebar*:`,
      '📚 Pilih Konten',
      [
        {
          title: 'Arsip Konten Terbaru',
          rows: pubs.map((p) => ({
            id: `PUB_DETAIL:${p.id}`,
            title: p.title.slice(0, 24),
            description: `${
              p.status === 'PUBLISHED' ? '✅ Tayang' : '📝 Draft'
            } • ${p.title.slice(0, 55)}`,
          })),
        },
        {
          title: 'Navigasi',
          rows: [
            {
              id: 'MENU_OPEN_MAIN',
              title: '📋 Kembali ke Menu Utama',
              description: 'Buka pilihan layanan utama Asisten Redaksi Polaris',
            },
          ],
        },
      ],
      'Arsip & Link Konten',
      'Asisten Redaksi Polaris'
    );
  }

  private async sendPublicationDetailPackage(
    tenantId: string,
    publicationId: string,
    phoneE164: string
  ): Promise<void> {
    const [pub] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, publicationId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!pub) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        'Data konten tidak ditemukan.',
        [{ id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' }]
      );
      return;
    }

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

    const posterUrl = assets[0]?.cdnPublicUrl;
    if (posterUrl && posterUrl.startsWith('http')) {
      await this.waClient.sendImageMessage(
        phoneE164,
        posterUrl,
        `🖼️ *Poster Resmi:* ${pub.title}`
      );
    }

    const shareableCaption =
      syndication?.whatsappBroadcastText ||
      syndication?.instagramCaption ||
      pub.excerpt;

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `📰 *${pub.title}*`,
        `• Status: *${pub.status === 'PUBLISHED' ? '✅ Sudah Tayang' : pub.status}*`,
        `• 🔗 Link Artikel: ${pub.canonicalUrl}`,
        '',
        '*Teks Siap Sebar / Caption:*',
        shareableCaption.slice(0, 650),
      ].join('\n'),
      [
        { id: 'MENU_LATEST_LINKS', title: '📚 Konten Lainnya' },
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Paket Konten Siap Sebar',
      'Asisten Redaksi Polaris'
    );
  }

  private async processClientLiveChatMessage(
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
    let [activeBrief] = await db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.tenantId, tenant.id))
      .orderBy(desc(contentBriefs.updatedAt))
      .limit(1);

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

    if (!activeBrief) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.tenantId, tenant.id),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .orderBy(desc(operatorTenantAssignments.createdAt))
        .limit(1);

      const briefCode = await this.helper.generateUniqueBriefCode();
      const limits = await this.helper.getTenantConfiguredLimits(tenant.id);

      activeBrief = await withTenantContext(tenant.id, async (tx) => {
        const [inserted] = await tx
          .insert(contentBriefs)
          .values({
            briefCode,
            tenantId: tenant.id,
            assignedOperatorId: assignment?.operatorId ?? null,
            status: 'SUBMITTED',
            clientUrgency: 'NORMAL',
            operatorPriority: 'NORMAL',
            topicSummary: input.extractedText || `Diskusi Redaksi — ${tenant.fullName}`,
            weeklyQuotaPeriod: getCurrentWibWeeklyPeriod(),
            weeklyRequestLimit: limits.weeklyRequestLimit,
            revisionUsed: 0,
            revisionLimit: limits.revisionLimit,
          })
          .returning();
        return inserted;
      });
    }

    await withTenantContext(tenant.id, async (tx) => {
      await tx.insert(contentBriefMessages).values({
        briefId: activeBrief.id,
        tenantId: tenant.id,
        direction: 'INBOUND',
        messageType: input.itemType,
        waMessageId: input.wamid,
        textBody: input.extractedText || null,
        mediaR2Url: uploaded.r2StorageUrl ?? null,
        mediaCdnUrl: uploaded.cdnPublicUrl ?? null,
        mediaMimeType: uploaded.mimeType ?? null,
        mediaFileName: uploaded.fileName ?? null,
        mediaFileSizeBytes: uploaded.fileSizeBytes ?? null,
        revisionRound: activeBrief.revisionUsed,
        targetComponents: [],
        isInternalFault: false,
      });

      await tx
        .update(contentBriefs)
        .set({ updatedAt: new Date() })
        .where(eq(contentBriefs.id, activeBrief.id));
    });

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      `✅ Pesan Anda telah diteruskan ke layar Editor Redaksi (Tiket *#${activeBrief.briefCode}*). Balasan Editor akan langsung tampil di chat ini.`,
      [
        { id: 'LIVE_CHAT_END', title: '✅ Akhiri Diskusi' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ]
    );

    if (activeBrief.assignedOperatorId) {
      await this.redisService.emitUserNotification(activeBrief.assignedOperatorId, {
        id: `live_chat_${Date.now()}`,
        title: `💬 Pesan Diskusi dari ${tenant.fullName}`,
        message: input.extractedText
          ? input.extractedText.slice(0, 120)
          : 'Mengirim lampiran media pada sesi diskusi.',
        category: 'ARTICLE',
        link: '/operator/workspace',
      });
    }
  }

  private isGreetingOrMenuCommand(text: string): boolean {
    const clean = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (!clean) return true;
    const greetings = new Set([
      'halo',
      'hallo',
      'hi',
      'hai',
      'p',
      'ping',
      'tes',
      'test',
      'menu',
      'mulai',
      'start',
      'info',
      'bantuan',
      'help',
      'pagi',
      'siang',
      'sore',
      'malam',
      'selamat pagi',
      'selamat siang',
      'selamat sore',
      'selamat malam',
      'assalamualaikum',
      'min',
      'admin',
      'polaris',
      '1',
      '2',
      '3',
    ]);
    return greetings.has(clean);
  }

  private async sendMainMenuPrompt(
    tenantId: string,
    tenantName: string,
    phoneE164: string
  ): Promise<void> {
    const quota = await this.helper.getTenantWeeklyQuota(tenantId);
    const body = [
      `Halo Bapak/Ibu *${tenantName}*, selamat datang di *Asisten Redaksi Polaris*.`,
      '',
      `📊 Sisa Jatah Request Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
      '',
      'Silakan tekan tombol *📋 Pilih Layanan* di bawah ini (atau langsung kirimkan foto kegiatan, dokumen, & catatan topik Anda):',
    ].join('\n');

    await this.waClient.sendInteractiveList(
      phoneE164,
      body,
      '📋 Pilih Layanan',
      [
        {
          title: 'Layanan Konten & Redaksi',
          rows: [
            {
              id: 'MENU_NEW_BRIEF',
              title: '📝 Request Konten Baru',
              description: 'Kirim topik/isu, foto kegiatan, atau dokumen PDF/Word',
            },
            {
              id: 'MENU_LATEST_LINKS',
              title: '🔗 Link & Arsip Konten',
              description: 'Ambil link artikel tayang, poster, & caption siap sebar',
            },
            {
              id: 'MENU_CHECK_STATUS',
              title: '📊 Status & Sisa Kuota',
              description: 'Lihat progres pengerjaan konten & sisa jatah minggu ini',
            },
          ],
        },
        {
          title: 'Diskusi & Panduan',
          rows: [
            {
              id: 'MENU_LIVE_CHAT',
              title: '💬 Diskusi Tim Redaksi',
              description: 'Ngobrol dua arah dengan Editor yang menangani akun Anda',
            },
            {
              id: 'MENU_HELP',
              title: '📖 Panduan Layanan',
              description: 'Informasi aturan jatah mingguan, revisi, & persetujuan',
            },
          ],
        },
      ],
      'Asisten Redaksi Polaris',
      'Pilih menu tanpa perlu mengetik perintah'
    );
  }
}

