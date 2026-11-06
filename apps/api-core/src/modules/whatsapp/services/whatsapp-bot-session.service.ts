import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ForbiddenException,
} from '@nestjs/common';
import { ilike, or } from 'drizzle-orm';
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
import { BriefUrgencyLevel, BriefPackageType } from '@polaris/shared-types';
import { RedisService } from '../../redis/redis.service.js';
import { WhatsAppCloudClient, WhatsAppListSection } from '../whatsapp-cloud.client.js';
import {
  normalizeIndonesianPhone,
  getCurrentWibWeeklyPeriod,
  getTimeHorizonInfo,
  isNewBriefExplicitTrigger,
} from '../contact-sanitizer.util.js';
import { QuotaWalletService } from '../../billing/quota-wallet.service.js';
import { WhatsAppBillingOrderService } from './whatsapp-billing-order.service.js';
import {
  WhatsAppBriefHelperService,
  DraftCartState,
  RevisionSessionState,
  DraftCartItem,
} from './whatsapp-brief-helper.service.js';

const SESSION_TTL_SECONDS = 259200; // 72 jam (3 hari) untuk mengakomodasi ritme kerja Anggota Dewan yang sibuk

/**
 * Memotong judul baris WhatsApp List Drawer secara cerdas pada batas kata (word boundary).
 * Meta WhatsApp Cloud API membatasi:
 * - row.title maksimal 24 karakter (jika >24 akan ditolak dengan HTTP 400 parameter violation).
 * - row.description maksimal 72 karakter.
 */
function formatSmartRowTitle(index: number | null, fullTitle: string, maxLen = 24): string {
  const prefix = index !== null ? `${index}. ` : '';
  const available = maxLen - prefix.length;
  const clean = fullTitle.trim().replace(/\s+/g, ' ');
  if (clean.length <= available) return `${prefix}${clean}`;
  const sub = clean.slice(0, available);
  const lastSpace = sub.lastIndexOf(' ');
  const wordTruncated =
    lastSpace > 4 ? sub.slice(0, lastSpace) : sub.slice(0, Math.max(available - 2, 4));
  return `${prefix}${wordTruncated}..`;
}

function formatSmartRowDesc(fullText: string, prefix = '', maxLen = 72): string {
  const cleanPrefix = prefix ? `${prefix} ` : '';
  const available = maxLen - cleanPrefix.length;
  const clean = fullText.trim().replace(/\s+/g, ' ');
  if (clean.length <= available) return `${cleanPrefix}${clean}`;
  const sub = clean.slice(0, available);
  const lastSpace = sub.lastIndexOf(' ');
  const wordTruncated =
    lastSpace > 12 ? sub.slice(0, lastSpace) : sub.slice(0, Math.max(available - 3, 5));
  return `${cleanPrefix}${wordTruncated}...`;
}

export interface SessionIntentState {
  mode: 'NEW_BRIEF' | 'REVISION' | 'CLARIFY';
  briefId?: string;
  briefCode?: string;
  packageType?: BriefPackageType;
  startedAtMs: number;
}

@Injectable()
export class WhatsAppBotSessionService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppBotSessionService.name);
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly revisionDebounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly redisService: RedisService,
    private readonly waClient: WhatsAppCloudClient,
    private readonly helper: WhatsAppBriefHelperService,
    private readonly quotaWalletService: QuotaWalletService,
    private readonly billingOrderService: WhatsAppBillingOrderService
  ) { }

  onModuleDestroy() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    for (const timer of this.revisionDebounceTimers.values()) {
      clearTimeout(timer);
    }
    this.revisionDebounceTimers.clear();
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

    // 6. Anti-Collision State Machine: Cek Session Intent & Explicit Trigger
    const sessionIntentKey = `whatsapp:session_intent:${tenant.id}`;
    const sessionIntent = await this.redisService.get<SessionIntentState>(sessionIntentKey);
    const isExplicitNewBrief = isNewBriefExplicitTrigger(extractedText);
    const lowerCmd = extractedText.toLowerCase().trim();

    // JIKA USER DALAM MODE DRAFT REQUEST BARU (Baik dari Tombol Menu Maupun Kalimat Eksplisit)
    if (sessionIntent?.mode === 'NEW_BRIEF' || isExplicitNewBrief) {
      if (!sessionIntent || sessionIntent.mode !== 'NEW_BRIEF') {
        await this.redisService.set(
          sessionIntentKey,
          { mode: 'NEW_BRIEF', startedAtMs: Date.now() },
          1800
        );
      }

      if (itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
        const draftKey = `whatsapp:draft:${tenant.id}`;
        const existingDraft = await this.redisService.get<DraftCartState>(draftKey);
        if (existingDraft && existingDraft.items.length > 0) {
          this.clearTenantDebounceTimer(tenant.id);
          await this.waClient.sendInteractiveButtons(
            normalizedSender,
            [
              `⚠️ *Konfirmasi Pembatalan Pengiriman Bahan*`,
              '',
              `Apakah Bapak/Ibu yakin ingin membatalkan draf request ini?`,
              `• Seluruh draf catatan & file lampiran sementara akan dibersihkan.`,
              `• *Saldo kuota Anda 100% AMAN (TIDAK TERPOTONG).*`,
            ].join('\n'),
            [
              { id: 'BRIEF_CANCEL_CONFIRMED', title: '🗑️ Ya, Hapus & Batal' },
              { id: 'BRIEF_CANCEL_ABORTED', title: '🔙 Lanjut Kirim' },
            ],
            'Konfirmasi Pembatalan',
            'Saldo kuota tidak akan terpotong'
          );
          return;
        }
        this.clearTenantDebounceTimer(tenant.id);
        await this.redisService.del(draftKey);
        await this.redisService.del(sessionIntentKey);
        await this.waClient.sendInteractiveButtons(
          normalizedSender,
          '✅ Keranjang request topik telah dibatalkan. Silakan pilih menu layanan di bawah ini atau kirim topik baru kapan saja:',
          [
            { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      const draftKey = `whatsapp:draft:${tenant.id}`;
      const existingDraft = await this.redisService.get<DraftCartState>(draftKey);
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

      // Socio-Engineering: Dukung respons teks langsung jika klien mengetik nomor/opsi format
      if (itemType === 'TEXT') {
        const trimmed = lowerCmd.trim();
        let matchedAction: string | null = null;
        const hasDraftItems = Boolean(existingDraft && existingDraft.items.length > 0);

        if (trimmed === '1' || trimmed === 'paket lengkap' || trimmed === 'lengkap' || trimmed === 'bundling') {
          matchedAction = hasDraftItems ? 'PKG_FULL_CAMPAIGN' : 'SET_FORMAT:FULL_CAMPAIGN';
        } else if (trimmed === '2' || trimmed === 'artikel' || trimmed === 'artikel saja' || trimmed === 'naskah') {
          matchedAction = hasDraftItems ? 'PKG_ARTICLE_ONLY' : 'SET_FORMAT:ARTICLE_ONLY';
        } else if (trimmed === '3' || trimmed === 'poster' || trimmed === 'poster saja' || trimmed === 'gambar') {
          matchedAction = hasDraftItems ? 'PKG_POSTER_ONLY' : 'SET_FORMAT:POSTER_ONLY';
        } else if (trimmed === '4' || trimmed === 'infografis' || trimmed === 'infografis data' || trimmed === 'infografik') {
          matchedAction = hasDraftItems ? 'PKG_INFOGRAPHIC_ONLY' : 'SET_FORMAT:INFOGRAPHIC_ONLY';
        } else if (trimmed === 'darurat' || trimmed === 'urgent') {
          matchedAction = 'SUBMIT_OVERQUOTA_URGENT';
        } else if (trimmed === 'antrean' || trimmed === 'senin' || trimmed === 'antre') {
          matchedAction = 'SUBMIT_OVERQUOTA_QUEUED';
        }

        if (matchedAction) {
          this.clearTenantDebounceTimer(tenant.id);
          await this.handleInteractiveButtonAction(tenant, normalizedSender, matchedAction);
          return;
        }
      }

      await this.collectDraftItem(
        tenant,
        normalizedSender,
        wamid,
        itemType,
        extractedText,
        mediaId,
        rawMimeType,
        rawFileName
      );
      return;
    }

    // 7. Cek Mode Catatan Revisi Aktif (Mendukung Multi-Bubble / "Tipsy-Tipsy")
    const revSessionKey = `whatsapp:rev_session:${tenant.id}`;
    const activeRevSession = await this.redisService.get<RevisionSessionState>(revSessionKey);
    if (activeRevSession || sessionIntent?.mode === 'REVISION') {
      const targetRevSession: RevisionSessionState = activeRevSession || {
        briefId: sessionIntent?.briefId || '',
        briefCode: sessionIntent?.briefCode || '',
        tenantId: tenant.id,
        targetComponents: ['ARTICLE', 'IMAGE', 'CAPTION'],
        createdAtMs: sessionIntent?.startedAtMs || Date.now(),
        updatedAtMs: Date.now(),
        items: [],
      };

      if (itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
        this.clearTenantDebounceTimer(tenant.id);
        await this.redisService.del(revSessionKey);
        await this.redisService.del(sessionIntentKey);
        await this.waClient.sendInteractiveButtons(
          normalizedSender,
          '✅ Pengisian revisi dibatalkan. Jatah revisi Anda tidak terpotong.',
          [
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      await this.appendClientRevisionBubble(tenant, normalizedSender, targetRevSession, {
        wamid,
        itemType,
        extractedText,
        mediaId,
        rawMimeType,
        rawFileName,
      });
      return;
    }

    // 8. Cek Jawaban Klarifikasi Operator
    // Prioritas A: Terkunci pada tiket tertentu via tombol "Jawab Klarifikasi"
    if (sessionIntent?.mode === 'CLARIFY' && sessionIntent.briefId) {
      const [specificBrief] = await db
        .select()
        .from(contentBriefs)
        .where(
          and(
            eq(contentBriefs.id, sessionIntent.briefId),
            eq(contentBriefs.tenantId, tenant.id)
          )
        )
        .limit(1);

      if (specificBrief) {
        await this.redisService.del(sessionIntentKey);
        await this.processClientClarificationReply(tenant, normalizedSender, specificBrief, {
          wamid,
          itemType,
          extractedText,
          mediaId,
          rawMimeType,
          rawFileName,
        });
        return;
      }
    }

    // Prioritas B: Tiket yang sedang menunggu klarifikasi
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

    // 9. Cek Mode Diskusi Langsung (Live Relay Chat) dengan Editor
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

    // 9b. Cek Sesi Pembelian Kuota WhatsApp Aktif
    const buyIntentKey = `whatsapp:buy_intent:${tenant.id}`;
    const activeBuySession = await this.redisService.get<any>(buyIntentKey);
    if (activeBuySession && activeBuySession.state === 'AWAITING_PACKAGE_CHOICE') {
      if (itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
        await this.billingOrderService.handleCancelBuy(tenant.id, normalizedSender);
        return;
      }
      if (itemType === 'TEXT' && /^[1-9]$/.test(lowerCmd)) {
        const handled = await this.billingOrderService.handlePackageSelection(
          tenant,
          normalizedSender,
          lowerCmd
        );
        if (handled) return;
      }
      await this.redisService.del(buyIntentKey);
    }

    // 9c. Perintah Pembelian Kuota Langsung (Beli Kapan Saja)
    if (
      itemType === 'TEXT' &&
      (lowerCmd === 'beli' ||
        lowerCmd === 'topup' ||
        lowerCmd === 'top up' ||
        lowerCmd === 'beli kuota' ||
        lowerCmd === 'tambah kuota' ||
        lowerCmd === 'beli paket' ||
        lowerCmd === 'isi kuota')
    ) {
      await this.billingOrderService.presentPackageCatalog(tenant, normalizedSender);
      return;
    }

    // 10. Perintah Cepat Teks, Pencarian Topik & Deteksi Sapaan Menu Utama
    if (
      itemType === 'TEXT' &&
      (lowerCmd === 'status' ||
        lowerCmd === 'cek status' ||
        lowerCmd === 'kuota' ||
        lowerCmd === 'cek kuota' ||
        lowerCmd === 'sisa kuota' ||
        lowerCmd === 'info kuota' ||
        lowerCmd === 'tiket' ||
        lowerCmd === 'riwayat' ||
        lowerCmd === 'daftar tiket')
    ) {
      await this.sendClientStatusOverview(tenant.id, tenant.fullName, normalizedSender);
      return;
    }

    if (
      itemType === 'TEXT' &&
      (lowerCmd === 'arsip' ||
        lowerCmd === 'konten' ||
        lowerCmd === 'draft' ||
        lowerCmd === 'draf' ||
        lowerCmd === 'artikel')
    ) {
      await this.sendLatestPublicationsMenu(tenant.id, tenant.fullName, normalizedSender, 1);
      return;
    }

    // Pencarian kata kunci: "cari sampah", "cari reses", "cari jalan rusak"
    if (itemType === 'TEXT' && lowerCmd.startsWith('cari ')) {
      const keyword = extractedText.slice(5).trim();
      if (keyword) {
        await this.handleClientKeywordSearch(tenant.id, tenant.fullName, normalizedSender, keyword);
        return;
      }
    }

    // Pencarian langsung kode tiket: "#BR-2611-7626", "BR-2611-7626", atau 4 digit angka "7626"
    if (
      itemType === 'TEXT' &&
      (lowerCmd.startsWith('#br-') || lowerCmd.startsWith('br-') || /^\d{4}$/.test(lowerCmd))
    ) {
      const isHandled = await this.handleClientDirectTicketLookup(
        tenant.id,
        tenant.fullName,
        normalizedSender,
        lowerCmd
      );
      if (isHandled) return;
    }

    // Pemilihan cepat nomor artikel (1-5) dari arsip naskah / hasil cari yang baru saja dibuka
    if (itemType === 'TEXT' && /^[1-5]$/.test(lowerCmd)) {
      const selectedIdx = parseInt(lowerCmd, 10) - 1;
      const cachedPubList = await this.redisService.get<string[]>(
        `whatsapp:active_pub_page:${tenant.id}`
      );
      if (cachedPubList && cachedPubList[selectedIdx]) {
        const pubId = cachedPubList[selectedIdx];
        await this.sendPublicationDetailPackage(
          tenant.id,
          pubId,
          normalizedSender
        );
        return;
      }
    }

    const draftKey = `whatsapp:draft:${tenant.id}`;
    const existingDraft = await this.redisService.get<DraftCartState>(draftKey);

    if (itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
      if (existingDraft && existingDraft.items.length > 0) {
        this.clearTenantDebounceTimer(tenant.id);
        await this.waClient.sendInteractiveButtons(
          normalizedSender,
          [
            `⚠️ *Konfirmasi Pembatalan Pengiriman Bahan*`,
            '',
            `Apakah Bapak/Ibu yakin ingin membatalkan draf request ini?`,
            `• Seluruh draf catatan & file lampiran sementara akan dibersihkan.`,
            `• *Saldo kuota Anda 100% AMAN (TIDAK TERPOTONG).*`,
          ].join('\n'),
          [
            { id: 'BRIEF_CANCEL_CONFIRMED', title: '🗑️ Ya, Hapus & Batal' },
            { id: 'BRIEF_CANCEL_ABORTED', title: '🔙 Lanjut Kirim' },
          ],
          'Konfirmasi Pembatalan',
          'Saldo kuota tidak akan terpotong'
        );
        return;
      }
      this.clearTenantDebounceTimer(tenant.id);
      await this.redisService.del(draftKey);
      await this.redisService.del(sessionIntentKey);
      await this.waClient.sendInteractiveButtons(
        normalizedSender,
        '✅ Keranjang request topik telah dibatalkan. Silakan pilih menu layanan di bawah ini atau kirim topik baru kapan saja:',
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
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

    // Jika keranjang masih kosong dan klien mengirim sapaan singkat ("halo", "hal", "halp", "p", "menu", dll.),
    // langsung tampilkan Menu Utama Interaktif (List Drawer) tanpa menunggu debounce.
    if (
      itemType === 'TEXT' &&
      (!existingDraft || existingDraft.items.length === 0) &&
      this.isGreetingOrMenuCommand(extractedText)
    ) {
      await this.sendMainMenuPrompt(tenant.id, tenant.fullName, normalizedSender);
      return;
    }

    // Fallback: Kiriman bebas teks/gambar/dokumen diperlakukan sebagai bahan brief baru
    await this.redisService.set(
      sessionIntentKey,
      { mode: 'NEW_BRIEF', startedAtMs: Date.now() },
      1800
    );
    await this.collectDraftItem(
      tenant,
      normalizedSender,
      wamid,
      itemType,
      extractedText,
      mediaId,
      rawMimeType,
      rawFileName
    );
  }

  private async collectDraftItem(
    tenant: { id: string; fullName: string },
    normalizedSender: string,
    wamid: string,
    itemType: 'TEXT' | 'IMAGE' | 'DOCUMENT',
    extractedText: string,
    mediaId?: string,
    rawMimeType?: string,
    rawFileName?: string
  ): Promise<void> {
    const draftKey = `whatsapp:draft:${tenant.id}`;
    const existingDraft = await this.redisService.get<DraftCartState>(draftKey);

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

    const sessionIntentKey = `whatsapp:session_intent:${tenant.id}`;
    const sessionIntent = await this.redisService.get<SessionIntentState>(sessionIntentKey);

    const draftState: DraftCartState = existingDraft || {
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      phoneE164: normalizedSender,
      items: [],
      packageType: sessionIntent?.packageType,
      updatedAtMs: Date.now(),
    };
    if (!draftState.packageType && sessionIntent?.packageType) {
      draftState.packageType = sessionIntent.packageType;
    }

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

    await this.redisService.set(draftKey, draftState, SESSION_TTL_SECONDS);
    this.scheduleDraftConfirmationPrompt(tenant.id);
  }

  private clearTenantDebounceTimer(tenantId: string): void {
    const existing = this.debounceTimers.get(tenantId);
    if (existing) {
      clearTimeout(existing);
      this.debounceTimers.delete(tenantId);
    }
    const existingRev = this.revisionDebounceTimers.get(tenantId);
    if (existingRev) {
      clearTimeout(existingRev);
      this.revisionDebounceTimers.delete(tenantId);
    }
  }

  private scheduleDraftConfirmationPrompt(tenantId: string): void {
    const existing = this.debounceTimers.get(tenantId);
    if (existing) {
      clearTimeout(existing);
      this.debounceTimers.delete(tenantId);
    }
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

  private scheduleRevisionConfirmationPrompt(tenantId: string, phoneE164: string): void {
    const existing = this.revisionDebounceTimers.get(tenantId);
    if (existing) {
      clearTimeout(existing);
      this.revisionDebounceTimers.delete(tenantId);
    }
    const revDebounceMs = Math.min(this.helper.draftDebounceMs, 15000);
    const timer = setTimeout(async () => {
      this.revisionDebounceTimers.delete(tenantId);
      try {
        const revKey = `whatsapp:rev_session:${tenantId}`;
        const revSession = await this.redisService.get<RevisionSessionState>(revKey);
        if (revSession && revSession.items && revSession.items.length > 0) {
          await this.sendRevisionConfirmationPrompt(revSession, phoneE164);
        }
      } catch (err) {
        this.logger.error(
          `[WhatsAppRevisionDebounce] Gagal mengirim rekap revisi untuk tenant ${tenantId}: ${(err as Error).message}`
        );
      }
    }, revDebounceMs);
    this.revisionDebounceTimers.set(tenantId, timer);
  }

  private async sendRevisionConfirmationPrompt(
    revSession: RevisionSessionState,
    phoneE164: string
  ): Promise<void> {
    const items = revSession.items || [];
    const photoCount = items.filter((i) => i.messageType === 'IMAGE').length;
    const docCount = items.filter((i) => i.messageType === 'DOCUMENT').length;
    const rawTexts = items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));
    const cleanedTexts = this.helper.cleanTopicParts(rawTexts);

    const combinedNotes =
      cleanedTexts.length > 0
        ? cleanedTexts.join(' | ').slice(0, 260)
        : 'Lampiran foto/dokumen pengganti (tanpa catatan teks)';

    const summaryLines = [
      `📋 *Rekap Catatan Revisi Anda — #${revSession.briefCode}*`,
      `• 🎯 Komponen Target: *${revSession.targetComponents.join(', ')}*`,
      `• 💬 Catatan Terkumpul (${cleanedTexts.length} pesan): _"${combinedNotes}"_`,
      photoCount > 0 || docCount > 0
        ? `• 📎 Lampiran Baru: *${photoCount} foto, ${docCount} dokumen*`
        : '',
      '',
      '💡 *Masih ada kalimat atau foto tambahan?*',
      'Silakan langsung ketik atau kirimkan lagi di bawah ini—sistem otomatis menggabungkannya ke dalam rekap revisi ini.',
      '',
      'Jika catatan revisi Anda sudah lengkap, tekan tombol *✅ Kirim Revisi* di bawah ini:',
    ]
      .filter(Boolean)
      .join('\n');

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      summaryLines,
      [
        { id: `REV_COMMIT:${revSession.briefId}`, title: '✅ Kirim Revisi' },
        { id: `REV_CLEAR:${revSession.briefId}`, title: '🔄 Ulangi Catatan' },
        { id: `REV_CANCEL:${revSession.briefId}`, title: '❌ Batalkan' },
      ],
      `Konfirmasi Revisi #${revSession.briefCode}`,
      'Belum memotong kuota revisi sampai Anda klik Kirim'
    );
  }

  private async sendDraftConfirmationPrompt(draft: DraftCartState): Promise<void> {
    const photoCount = draft.items.filter((i) => i.messageType === 'IMAGE').length;
    const docCount = draft.items.filter((i) => i.messageType === 'DOCUMENT').length;
    const rawSnippets = draft.items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));
    const textSnippets = this.helper.cleanTopicParts(rawSnippets);

    const combinedTopic =
      textSnippets.length > 0
        ? textSnippets.join(' | ').slice(0, 220)
        : 'Lampiran kegiatan/dokumen (tanpa catatan teks)';

    const quota = await this.helper.getTenantWeeklyQuota(draft.tenantId);
    const pendingReviewBrief = await this.helper.findBriefReadyForReview(draft.tenantId);
    const canAttachAsRevision =
      pendingReviewBrief && pendingReviewBrief.revisionUsed < pendingReviewBrief.revisionLimit;

    if (canAttachAsRevision && pendingReviewBrief) {
      const remRev = pendingReviewBrief.revisionLimit - pendingReviewBrief.revisionUsed;
      const summaryWithGuard = [
        `Halo Bapak/Ibu *${draft.tenantName}*, pesan Anda telah kami tampung:`,
        `• 📝 Isi Pesan: _"${combinedTopic}"_`,
        photoCount > 0 || docCount > 0
          ? `• 📎 Lampiran: *${photoCount} foto, ${docCount} dokumen*`
          : '',
        '',
        `⚠️ *Konfirmasi Konteks Tiket Aktif:*`,
        `Saat ini Anda masih memiliki tiket *#${pendingReviewBrief.briefCode}* yang sedang menunggu persetujuan/revisi (Sisa revisi: *${remRev}x*).`,
        '',
        `• Jika pesan di atas adalah *Catatan Revisi untuk #${pendingReviewBrief.briefCode}*, tekan *✏️ Revisi #${pendingReviewBrief.briefCode.slice(-4)}* _(tidak memotong kuota)_.`,
        `• Jika ini adalah *Request Topik Baru*, tekan *🟢 Kirim Topik Baru* _(Sisa jatah minggu ini: ${quota.weeklyRemaining}/${quota.weeklyLimit}, Kuota: ${quota.remainingQuota}/${quota.totalQuotaAllocated})_:`,
      ]
        .filter(Boolean)
        .join('\n');

      await this.waClient.sendInteractiveButtons(
        draft.phoneE164,
        summaryWithGuard,
        [
          {
            id: `DRAFT_TO_REV:${pendingReviewBrief.id}`,
            title: `✏️ Revisi #${pendingReviewBrief.briefCode.slice(-4)}`,
          },
          { id: 'BRIEF_SUBMIT_NORMAL', title: '🟢 Kirim Topik Baru' },
          { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan' },
        ],
        'Konfirmasi Revisi vs Topik Baru',
        'Masih ada tambahan? Langsung ketik lagi sebelum klik tombol'
      );
      return;
    }

    const horizonInfo = getTimeHorizonInfo(BriefUrgencyLevel.NORMAL);

    // KONDISI 1: KUOTA PAKET TELAH HABIS ATAU KEDALUWARSA (remainingQuota <= 0 ATAU isPeriodExpired)
    if (quota.remainingQuota <= 0 || quota.isPeriodExpired) {
      const expiryText = quota.isPeriodExpired
        ? 'Masa aktif paket lisensi Anda telah berakhir.'
        : `Saldo kuota request Anda telah habis (0 dari ${quota.totalQuotaAllocated} Request).`;

      const outOfQuotaSummary = [
        `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah terkumpul:`,
        `• 📝 Catatan Topik: _"${combinedTopic}"_`,
        photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
        docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
        '',
        `🚫 *KUOTA REQUEST TIDAK MENCUKUPI*`,
        expiryText,
        '',
        'Untuk melanjutkan pengiriman bahan konten, silakan perpanjang atau top-up paket kuota Anda melalui portal dashboard atau hubungi Admin Polaris.',
      ]
        .filter(Boolean)
        .join('\n');

      await this.waClient.sendInteractiveButtons(
        draft.phoneE164,
        outOfQuotaSummary,
        [
          { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan Draft' },
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Kuota Tidak Mencukupi',
        'Bahan tersimpan di draft sampai Anda batalkan'
      );
      return;
    }

    const afterHoursNote = horizonInfo.isAfterCutoff
      ? `• 🌙 Waktu Masuk: *Di luar jam kerja (>= 17:00 WIB) — Target produksi besok pagi (08:00 WIB)*`
      : `• ⏱️ Waktu Masuk: *Jam kerja aktif redaksi*`;

    // =========================================================================
    // KASUS 1: USER SUDAH MEMILIH FORMAT TERLEBIH DAHULU (draft.packageType terdefinisi)
    // =========================================================================
    if (draft.packageType) {
      const packageType = draft.packageType;
      const baseCost = this.helper.getPackageTypeBaseCost(packageType);
      const formatLabel = this.helper.getPackageTypeLabel(packageType);

      // 1A. Jatah Mingguan Penuh (weeklyRemaining <= 0)
      if (quota.weeklyRemaining <= 0) {
        const urgentCost = baseCost * 2;
        const queuedCost = baseCost;

        if (quota.remainingQuota >= urgentCost) {
          const overquotaSummary = [
            `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah terkumpul:`,
            `• 🎯 Format Konten: *${formatLabel}*`,
            `• 📝 Catatan Topik: _"${combinedTopic}"_`,
            photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
            docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
            `• 💳 Saldo Kuota Total: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} Request*`,
            afterHoursNote,
            '',
            `⚠️ *Jatah Request Minggu Ini Penuh (${quota.weeklyUsed}/${quota.weeklyLimit})*`,
            `Jatah reguler Anda untuk minggu ini (${quota.weeklyQuotaPeriod}) telah habis.`,
            '',
            `Pilihan pengiriman Anda:`,
            `1️⃣ *⚡ Darurat (Potong ${urgentCost} Kuota):* Pengajuan darurat over-quota langsung ke Editor Utama hari ini.`,
            `2️⃣ *🗓️ Antrean Senin (Potong ${queuedCost} Kuota):* Disimpan aman, mulai diproduksi Senin 00:00 WIB saat jatah mingguan di-reset.`,
          ]
            .filter(Boolean)
            .join('\n');

          await this.waClient.sendInteractiveButtons(
            draft.phoneE164,
            overquotaSummary,
            [
              { id: `SUBMIT_OVERQUOTA_URGENT:${packageType}`, title: `⚡ Darurat (${urgentCost})` },
              { id: `SUBMIT_OVERQUOTA_QUEUED:${packageType}`, title: `🗓️ Antrean Senin (${queuedCost})` },
              { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan' },
            ],
            'Konfirmasi Kuota Over-Quota',
            'Pilih Darurat (x2) atau Antrean Senin (x1)'
          );
          return;
        }

        // Saldo tidak cukup untuk Darurat (urgentCost), tapi cukup untuk Antrean Senin (queuedCost)
        if (quota.remainingQuota >= queuedCost) {
          const criticalSummary = [
            `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah terkumpul:`,
            `• 🎯 Format Konten: *${formatLabel}*`,
            `• 📝 Catatan Topik: _"${combinedTopic}"_`,
            photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
            docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
            `• 💳 Saldo Kuota Tersisa: *${quota.remainingQuota} Request*`,
            afterHoursNote,
            '',
            `⚠️ *Jatah Minggu Ini Penuh (${quota.weeklyUsed}/${quota.weeklyLimit})*`,
            `Karena saldo kuota Anda tersisa ${quota.remainingQuota} Request, pengajuan Darurat (biaya ${urgentCost} kuota) tidak dapat dipilih.`,
            '',
            `Bahan dapat diamankan di *Antrean Prioritas Senin Depan* (biaya ${queuedCost} kuota saat diproses).`,
          ]
            .filter(Boolean)
            .join('\n');

          await this.waClient.sendInteractiveButtons(
            draft.phoneE164,
            criticalSummary,
            [
              { id: `SUBMIT_OVERQUOTA_QUEUED:${packageType}`, title: `🗓️ Antrean Senin (${queuedCost})` },
              { id: 'MENU_BUY_QUOTA', title: '💳 Top-Up Kuota' },
              { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan' },
            ],
            'Konfirmasi Antrean Senin',
            'Saldo hanya cukup untuk Antrean Senin'
          );
          return;
        }
      }

      // 1B. Jatah Mingguan Masih Ada (weeklyRemaining > 0)
      if (quota.remainingQuota >= baseCost) {
        const afterHoursNotice = horizonInfo.isAfterCutoff
          ? `• 🌙 Waktu Masuk: *Di luar jam kerja (>= 17:00 WIB) — Dijadwalkan produksi besok pagi (mulai 08:00 WIB)*`
          : `• ⏱️ Waktu Masuk: *Jam kerja aktif — Diproses untuk siap tayang hari ini*`;

        const summaryLines = [
          `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah kami tampung:`,
          `• 🎯 Format Konten: *${formatLabel}*`,
          `• 📝 Catatan Topik: _"${combinedTopic}"_`,
          photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
          docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
          `• 🏷️ Biaya Kuota: *${baseCost} Kuota*`,
          `• 📊 Jatah Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
          `• 💳 Saldo Total Paket: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} request*`,
          afterHoursNotice,
          '',
          '💡 *Masih ada kalimat/foto tambahan?* Langsung kirim lagi di bawah ini, sistem otomatis menggabungkannya.',
          'Jika sudah lengkap, silakan tekan tombol di bawah untuk konfirmasi pengiriman:',
        ]
          .filter(Boolean)
          .join('\n');

        await this.waClient.sendInteractiveButtons(
          draft.phoneE164,
          summaryLines,
          [
            { id: `PKG_${packageType}`, title: `🟢 Kirim (${baseCost} Kuota)` },
            { id: 'MENU_CHANGE_FORMAT', title: '🔄 Ganti Format' },
            { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan' },
          ],
          'Konfirmasi Request Konten',
          'Tekan Kirim untuk memproses'
        );
        return;
      }
    }

    // =========================================================================
    // KASUS 2: USER BELUM MEMILIH FORMAT (Direct Dump Teks/Foto Bebas)
    // =========================================================================
    // 2A. Jatah Mingguan Penuh (weeklyRemaining <= 0)
    if (quota.weeklyRemaining <= 0) {
      const overquotaSummary = [
        `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah terkumpul:`,
        `• 📝 Catatan Topik: _"${combinedTopic}"_`,
        photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
        docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
        `• 💳 Saldo Kuota Total: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} Request*`,
        afterHoursNote,
        '',
        `⚠️ *Jatah Request Minggu Ini Penuh (${quota.weeklyUsed}/${quota.weeklyLimit})*`,
        `Jatah reguler Anda untuk minggu ini (${quota.weeklyQuotaPeriod}) telah habis.`,
        '',
        `📌 *Pilihan Pengiriman:*`,
        `• *⚡ Darurat:* Diproses hari ini oleh Editor Utama (Biaya x2 kuota)`,
        `• *🗓️ Antrean Senin:* Mulai diproduksi Senin 00:00 WIB (Biaya normal)`,
        '',
        'Silakan tekan tombol di bawah untuk memilih format dan prioritas pengerjaan:',
      ]
        .filter(Boolean)
        .join('\n');

      const sections: WhatsAppListSection[] = [
        {
          title: '⚡ DARURAT (HARI INI)',
          rows: [
            {
              id: 'SUBMIT_OVERQUOTA:FULL_CAMPAIGN:URGENT',
              title: '⚡ Paket Lengkap (4)',
              description: 'Artikel + Poster + Sosmed (Potong 4 Kuota, Tayang Hari Ini)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:POSTER_ONLY:URGENT',
              title: '⚡ Poster Visual (2)',
              description: 'Poster grafis resmi (Potong 2 Kuota, Tayang Hari Ini)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:ARTICLE_ONLY:URGENT',
              title: '⚡ Naskah Artikel (2)',
              description: 'Rilis pers & berita (Potong 2 Kuota, Tayang Hari Ini)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:INFOGRAPHIC_ONLY:URGENT',
              title: '⚡ Infografis Data (2)',
              description: 'Visualisasi data statistik (Potong 2 Kuota, Tayang Hari Ini)',
            },
          ],
        },
        {
          title: '🗓️ ANTREAN SENIN (HEMAT)',
          rows: [
            {
              id: 'SUBMIT_OVERQUOTA:FULL_CAMPAIGN:QUEUED',
              title: '🗓️ Paket Lengkap (2)',
              description: 'Mulai diproduksi Senin 00:00 WIB (Potong 2 Kuota)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:POSTER_ONLY:QUEUED',
              title: '🗓️ Poster Visual (1)',
              description: 'Mulai diproduksi Senin 00:00 WIB (Potong 1 Kuota)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:ARTICLE_ONLY:QUEUED',
              title: '🗓️ Naskah Artikel (1)',
              description: 'Mulai diproduksi Senin 00:00 WIB (Potong 1 Kuota)',
            },
            {
              id: 'SUBMIT_OVERQUOTA:INFOGRAPHIC_ONLY:QUEUED',
              title: '🗓️ Infografis Data (1)',
              description: 'Mulai diproduksi Senin 00:00 WIB (Potong 1 Kuota)',
            },
          ],
        },
        {
          title: 'OPSI LAIN',
          rows: [
            {
              id: 'BRIEF_CANCEL_ASK',
              title: '❌ Batalkan Draf',
              description: 'Hapus seluruh draf sementara (kuota 100% aman)',
            },
          ],
        },
      ];

      await this.waClient.sendInteractiveList(
        draft.phoneE164,
        overquotaSummary,
        '📋 Pilih Pengiriman',
        sections,
        'Konfirmasi Over-Quota',
        'Pilih format & jadwal produksi'
      );
      return;
    }

    // KONDISI 3: JATAH REQUEST MINGGU INI MASIH ADA (weeklyRemaining > 0 & remainingQuota > 0)
    const afterHoursNotice = horizonInfo.isAfterCutoff
      ? `• 🌙 Waktu Masuk: *Di luar jam kerja (>= 17:00 WIB) — Dijadwalkan produksi besok pagi (mulai 08:00 WIB)*`
      : `• ⏱️ Waktu Masuk: *Jam kerja aktif — Diproses untuk siap tayang hari ini*`;

    const summaryLines = [
      `Halo Bapak/Ibu *${draft.tenantName}*, bahan konten Anda telah kami tampung:`,
      `• 📝 Catatan Topik: _"${combinedTopic}"_`,
      photoCount > 0 ? `• 📷 Foto Kegiatan: *${photoCount} file*` : '',
      docCount > 0 ? `• 📄 Dokumen Lampiran: *${docCount} file*` : '',
      `• 📊 Jatah Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
      `• 💳 Saldo Total Paket: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} request*`,
      `• 🏷️ Biaya Kuota: *1 Kuota (Format Satuan) / 2 Kuota (Paket Lengkap)*`,
      afterHoursNotice,
      '',
      '💡 *Masih ada kalimat/foto tambahan?* Langsung kirim lagi di bawah ini, sistem otomatis menggabungkannya.',
      'Jika sudah lengkap, silakan tekan tombol di bawah untuk memilih format konten yang diinginkan:',
    ]
      .filter(Boolean)
      .join('\n');

    const bundleDesc = quota.remainingQuota >= 2
      ? 'Artikel + Poster Visual + Sosmed (Biaya: 2 Kuota)'
      : 'Membutuhkan 2 kuota (Saldo tersisa 1)';

    const formatRows = [
      {
        id: 'PKG_FULL_CAMPAIGN',
        title: '📦 Paket Lengkap (2)',
        description: bundleDesc.slice(0, 72),
      },
      {
        id: 'PKG_ARTICLE_ONLY',
        title: '📝 Naskah Artikel (1)',
        description: 'Rilis pers & naskah kebijakan mendalam (Biaya: 1 Kuota)',
      },
      {
        id: 'PKG_POSTER_ONLY',
        title: '🎨 Poster Visual (1)',
        description: 'Poster grafis resmi siap sebar di WA/grup (Biaya: 1 Kuota)',
      },
      {
        id: 'PKG_INFOGRAPHIC_ONLY',
        title: '📊 Infografis Data (1)',
        description: 'Visualisasi data statistik & regulasi (Biaya: 1 Kuota)',
      },
    ];

    const sections: WhatsAppListSection[] = [
      {
        title: 'PILIH FORMAT KONTEN',
        rows: formatRows,
      },
      {
        title: 'OPSI LAIN',
        rows: [
          {
            id: 'BRIEF_CANCEL_ASK',
            title: '❌ Batalkan Draf',
            description: 'Hapus seluruh catatan draf sementara (kuota 100% aman)',
          },
        ],
      },
    ];

    await this.waClient.sendInteractiveList(
      draft.phoneE164,
      summaryLines,
      '📋 Pilih Format',
      sections,
      'Konfirmasi Request Konten',
      'Pilih format hasil yang diinginkan'
    );
  }

  private async sendFormatSelectionPrompt(
    tenant: { id: string; fullName: string },
    phoneE164: string
  ): Promise<void> {
    await this.redisService.del(`whatsapp:live_chat:${tenant.id}`);
    await this.redisService.set(
      `whatsapp:session_intent:${tenant.id}`,
      {
        mode: 'NEW_BRIEF',
        startedAtMs: Date.now(),
      },
      1800
    );
    this.clearTenantDebounceTimer(tenant.id);

    const quota = await this.helper.getTenantWeeklyQuota(tenant.id);
    const horizonInfo = getTimeHorizonInfo(BriefUrgencyLevel.NORMAL);

    // KASUS 1: SALDO TOTAL HABIS / EXPIRED
    if (quota.remainingQuota < 1 || quota.isPeriodExpired) {
      const expiryText = quota.isPeriodExpired
        ? `Masa aktif paket lisensi Anda telah berakhir pada ${quota.periodEndIso ? new Date(quota.periodEndIso).toLocaleDateString('id-ID') : 'periode lalu'}.`
        : `Saldo kuota request Anda telah habis (0 dari ${quota.totalQuotaAllocated} Request).`;

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `🚫 *KUOTA REQUEST TIDAK MENCUKUPI*`,
          expiryText,
          '',
          'Untuk melanjutkan pengajuan request konten baru, silakan lakukan top-up paket kuota Anda:',
        ].join('\n'),
        [
          { id: 'MENU_BUY_QUOTA', title: '💳 Top-Up Kuota' },
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Kuota Tidak Mencukupi',
        'Top-up kuota untuk membuat konten baru'
      );
      return;
    }

    // KASUS 2: JATAH MINGGU INI PENUH (weeklyRemaining <= 0), TETAPI SALDO TOTAL MASIH ADA
    if (quota.weeklyRemaining <= 0) {
      const overquotaBody = [
        `⚠️ *Pemberitahuan Kuota: Jatah Minggu Ini Penuh (${quota.weeklyUsed}/${quota.weeklyLimit})*`,
        '',
        `Halo Bapak/Ibu *${tenant.fullName}*, seluruh jatah request konten Anda untuk minggu ini (${quota.weeklyQuotaPeriod}) telah terpakai.`,
        '',
        `📌 *Anda tetap dapat membuat request baru dari saldo kuota Anda (${quota.remainingQuota} tersisa):*`,
        `• *⚡ Darurat:* Diproses hari ini oleh Editor Utama (Biaya kuota x2)`,
        `• *🗓️ Antrean Senin:* Mulai diproduksi Senin 00:00 WIB (Biaya kuota normal)`,
        '',
        'Silakan pilih format konten yang ingin dibuat di bawah ini:',
      ].join('\n');

      const sections: WhatsAppListSection[] = [
        {
          title: 'PILIH FORMAT KONTEN',
          rows: [
            {
              id: 'SET_FORMAT:FULL_CAMPAIGN',
              title: '📦 Paket Lengkap',
              description: 'Artikel + Poster + Sosmed (Senin: 2 | Darurat: 4 Kuota)',
            },
            {
              id: 'SET_FORMAT:ARTICLE_ONLY',
              title: '📝 Naskah Artikel Saja',
              description: 'Siaran pers & naskah kebijakan (Senin: 1 | Darurat: 2 Kuota)',
            },
            {
              id: 'SET_FORMAT:POSTER_ONLY',
              title: '🎨 Poster Visual Saja',
              description: 'Poster visual resmi (Senin: 1 | Darurat: 2 Kuota)',
            },
            {
              id: 'SET_FORMAT:INFOGRAPHIC_ONLY',
              title: '📊 Infografis Data Saja',
              description: 'Infografis data & statistik (Senin: 1 | Darurat: 2 Kuota)',
            },
          ],
        },
        {
          title: 'OPSI LAIN',
          rows: [
            {
              id: 'MENU_OPEN_MAIN',
              title: '❌ Batalkan / Menu Utama',
              description: 'Kembali ke menu layanan utama',
            },
          ],
        },
      ];

      await this.waClient.sendInteractiveList(
        phoneE164,
        overquotaBody,
        '📋 Pilih Format',
        sections,
        'Jatah Mingguan Penuh',
        'Pilih format konten yang diinginkan'
      );
      return;
    }

    // KASUS 3: JATAH MINGGU INI MASIH ADA (weeklyRemaining > 0)
    const afterHoursNote = horizonInfo.isAfterCutoff
      ? `• 🌙 Saat ini di luar jam operasional aktif (>= 17:00 WIB) — Target produksi besok pagi.`
      : `• ⏱️ Jam operasional aktif redaksi — Target siap tayang hari ini.`;

    const normalBody = [
      `Halo Bapak/Ibu *${tenant.fullName}*, silakan tentukan format konten yang ingin Anda buat:`,
      `• 📊 Sisa Jatah Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
      `• 💳 Saldo Total Paket: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} request*`,
      afterHoursNote,
      '',
      'Silakan pilih format konten:',
    ].join('\n');

    const sections: WhatsAppListSection[] = [
      {
        title: 'PILIH FORMAT KONTEN',
        rows: [
          {
            id: 'SET_FORMAT:FULL_CAMPAIGN',
            title: '📦 Paket Lengkap (2)',
            description: 'Artikel Berita + Poster Visual + Caption Sosmed (2 Kuota)',
          },
          {
            id: 'SET_FORMAT:ARTICLE_ONLY',
            title: '📝 Naskah Artikel (1)',
            description: 'Rilis pers & naskah kebijakan mendalam (1 Kuota)',
          },
          {
            id: 'SET_FORMAT:POSTER_ONLY',
            title: '🎨 Poster Visual (1)',
            description: 'Poster grafis resmi siap sebar di WA/Medsos (1 Kuota)',
          },
          {
            id: 'SET_FORMAT:INFOGRAPHIC_ONLY',
            title: '📊 Infografis Data (1)',
            description: 'Visualisasi data statistik & regulasi informatif (1 Kuota)',
          },
        ],
      },
      {
        title: 'OPSI LAIN',
        rows: [
          {
            id: 'MENU_OPEN_MAIN',
            title: '❌ Batalkan / Menu Utama',
            description: 'Kembali ke menu layanan utama',
          },
        ],
      },
    ];

    await this.waClient.sendInteractiveList(
      phoneE164,
      normalBody,
      '📋 Pilih Format',
      sections,
      'Request Konten Baru',
      'Pilih format konten yang diinginkan'
    );
  }

  private async handleFormatSelection(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    buttonId: string
  ): Promise<void> {
    const rawPkg = buttonId.slice('SET_FORMAT:'.length).trim() as BriefPackageType;
    const validPackages: BriefPackageType[] = [
      BriefPackageType.FULL_CAMPAIGN,
      BriefPackageType.ARTICLE_ONLY,
      BriefPackageType.POSTER_ONLY,
      BriefPackageType.INFOGRAPHIC_ONLY,
    ];
    const packageType = validPackages.includes(rawPkg) ? rawPkg : BriefPackageType.FULL_CAMPAIGN;

    await this.redisService.set(
      `whatsapp:session_intent:${tenant.id}`,
      {
        mode: 'NEW_BRIEF',
        packageType,
        startedAtMs: Date.now(),
      },
      1800
    );

    const draftKey = `whatsapp:draft:${tenant.id}`;
    const existingDraft = await this.redisService.get<DraftCartState>(draftKey);
    if (existingDraft) {
      existingDraft.packageType = packageType;
      await this.redisService.set(draftKey, existingDraft, SESSION_TTL_SECONDS);

      // Jika draft sudah berisi bahan (misalnya dari pergantian format), langsung kirim konfirmasi baru!
      if (existingDraft.items && existingDraft.items.length > 0) {
        await this.sendDraftConfirmationPrompt(existingDraft);
        return;
      }
    }

    const quota = await this.helper.getTenantWeeklyQuota(tenant.id);
    const baseCost = this.helper.getPackageTypeBaseCost(packageType);
    const pkgLabel = this.helper.getPackageTypeLabel(packageType);

    const costNote =
      quota.weeklyRemaining <= 0
        ? `• ⚠️ Jatah minggu ini penuh. Saat kirim nanti, Anda dapat memilih *⚡ Darurat (${baseCost * 2} Kuota)* atau *🗓️ Antrean Senin (${baseCost} Kuota)*.`
        : `• 🏷️ Biaya Kuota: *${baseCost} Kuota* (Sisa jatah minggu ini: ${quota.weeklyRemaining} request)`;

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `✅ *Format Dipilih: ${pkgLabel}*`,
        costNote,
        '',
        `Silakan langsung kirimkan topik/isu atau foto/dokumen untuk materi *${pkgLabel}* Anda di bawah ini:`,
        '1️⃣ *Pesan Teks* berisi pokok topik/isu atau arahan materi',
        '2️⃣ *Foto Kegiatan* (bisa kirim beberapa foto sekaligus)',
        '3️⃣ *Dokumen Pendukung* (PDF/Word bila ada)',
        '',
        '💡 _Anda bisa kirim bertahap, sistem otomatis menampung seluruh bahan kegiatan Anda._',
      ].join('\n'),
      [
        { id: 'MENU_CHANGE_FORMAT', title: '🔄 Ganti Format' },
        { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Format Konten Terkunci',
      'Asisten Redaksi Polaris'
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

    if (buttonId === 'MENU_BUY_QUOTA') {
      await this.billingOrderService.presentPackageCatalog(tenant, phoneE164);
      return;
    }

    if (buttonId.startsWith('BUY_PKG:')) {
      await this.billingOrderService.handlePackageSelection(tenant, phoneE164, buttonId);
      return;
    }

    if (buttonId === 'MENU_NEW_BRIEF' || buttonId === 'MENU_CHANGE_FORMAT') {
      await this.sendFormatSelectionPrompt(tenant, phoneE164);
      return;
    }

    if (buttonId.startsWith('SET_FORMAT:')) {
      await this.handleFormatSelection(tenant, phoneE164, buttonId);
      return;
    }

    if (buttonId === 'MENU_CHECK_STATUS') {
      await this.sendClientStatusOverview(tenant.id, tenant.fullName, phoneE164);
      return;
    }

    if (buttonId === 'MENU_LATEST_LINKS') {
      await this.sendLatestPublicationsMenu(tenant.id, tenant.fullName, phoneE164, 1);
      return;
    }

    if (buttonId.startsWith('PUBS_PAGE:')) {
      const pageStr = buttonId.slice('PUBS_PAGE:'.length).trim();
      const pageNum = parseInt(pageStr, 10) || 1;
      await this.sendLatestPublicationsMenu(tenant.id, tenant.fullName, phoneE164, pageNum);
      return;
    }

    if (buttonId.startsWith('PUB_DETAIL:')) {
      const pubId = buttonId.slice('PUB_DETAIL:'.length).trim();
      await this.sendPublicationDetailPackage(tenant.id, pubId, phoneE164);
      return;
    }

    if (buttonId.startsWith('BRIEF_LOOKUP:')) {
      const briefId = buttonId.slice('BRIEF_LOOKUP:'.length).trim();
      await this.sendBriefDetailCard(tenant.id, briefId, phoneE164);
      return;
    }

    if (buttonId.startsWith('PUB_PUBLISH:')) {
      const pubId = buttonId.slice('PUB_PUBLISH:'.length).trim();
      await this.publishDraftPublicationFromClient(tenant.id, tenant.fullName, pubId, phoneE164);
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

    if (buttonId === 'BRIEF_CANCEL' || buttonId === 'BRIEF_CANCEL_ASK') {
      const draft = await this.redisService.get<DraftCartState>(draftKey);
      if (!draft || draft.items.length === 0) {
        await this.redisService.del(draftKey);
        await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          'Keranjang bahan Anda kosong. Apa yang ingin Anda lakukan selanjutnya?',
          [
            { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `⚠️ *Konfirmasi Pembatalan Pengiriman Bahan*`,
          '',
          `Apakah Bapak/Ibu yakin ingin membatalkan draf request ini?`,
          `• Seluruh draf catatan & file lampiran sementara akan dibersihkan.`,
          `• *Saldo kuota Anda 100% AMAN (TIDAK TERPOTONG).*`,
        ].join('\n'),
        [
          { id: 'BRIEF_CANCEL_CONFIRMED', title: '🗑️ Ya, Hapus & Batal' },
          { id: 'BRIEF_CANCEL_ABORTED', title: '🔙 Lanjut Kirim' },
        ],
        'Konfirmasi Pembatalan',
        'Saldo kuota tidak akan terpotong'
      );
      return;
    }

    if (buttonId === 'BRIEF_CANCEL_CONFIRMED') {
      this.clearTenantDebounceTimer(tenant.id);
      await this.redisService.del(draftKey);
      await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);

      const quota = await this.helper.getTenantWeeklyQuota(tenant.id);

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `✅ *Draf Request Berhasil Dibatalkan*`,
          '',
          `Bahan telah dibersihkan dari keranjang sementara.`,
          `• Saldo Kuota Total: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} Request*`,
          `• Jatah Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} Request tersisa*`,
          '',
          'Silakan pilih menu di bawah jika ingin mengajukan request baru atau melihat status:',
        ].join('\n'),
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Draf Dibatalkan',
        'Asisten Redaksi Polaris'
      );
      return;
    }

    if (buttonId === 'BRIEF_CANCEL_ABORTED') {
      const draft = await this.redisService.get<DraftCartState>(draftKey);
      if (draft && draft.items.length > 0) {
        await this.sendDraftConfirmationPrompt(draft);
      } else {
        await this.sendMainMenuPrompt(tenant.id, tenant.fullName, phoneE164);
      }
      return;
    }

    // POINT OF NO RETURN: Pembatalan Tiket yang Sudah Disubmit (Sebelum Dikerjakan Operator)
    if (buttonId.startsWith('BRIEF_TICKET_CANCEL:')) {
      const targetBriefId = buttonId.slice('BRIEF_TICKET_CANCEL:'.length).trim();
      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, targetBriefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) {
        await this.waClient.sendTextMessage(phoneE164, 'Tiket request tidak ditemukan.');
        return;
      }

      // Check Point of No Return: jika sudah diterima operator atau dalam proses produksi
      const lockedStatuses = ['ACCEPTED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'CANCELLED'];
      if (lockedStatuses.includes(brief.status)) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          [
            `⚠️ *Pembatalan Tidak Dapat Dilakukan*`,
            '',
            `Tiket *#${brief.briefCode}* saat ini berstatus *${brief.status}*.`,
            `Materi sudah masuk ke tahap produksi oleh Tim Redaksi, sehingga kuota tidak dapat ditarik kembali.`,
            '',
            `💡 *Solusi:* Anda memiliki hak *${brief.revisionLimit - brief.revisionUsed}x revisi* setelah draf materi selesai diracik untuk disesuaikan dengan keinginan Anda.`,
          ].join('\n'),
          [
            { id: `BRIEF_LOOKUP:${brief.id}`, title: '📋 Detail Tiket' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          'Tiket Sedang Diproduksi',
          'Point of No Return'
        );
        return;
      }

      // Tampilkan konfirmasi 2-step pembatalan tiket
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `⚠️ *Konfirmasi Pembatalan Tiket #${brief.briefCode}*`,
          '',
          `Apakah Bapak/Ibu yakin membatalkan tiket ini?`,
          `• Status saat ini: *${brief.status}* (Belum diproses operator)`,
          `• Kuota yang akan dikembalikan: *+${brief.quotaCostDeducted || 1} Request* (100% utuh)`,
        ].join('\n'),
        [
          { id: `BRIEF_TICKET_CONFIRM_CANCEL:${brief.id}`, title: '🗑️ Ya, Batalkan Tiket' },
          { id: `BRIEF_LOOKUP:${brief.id}`, title: '🔙 Kembali' },
        ],
        'Konfirmasi Pembatalan Tiket',
        'Kuota akan dikembalikan 100%'
      );
      return;
    }

    if (buttonId.startsWith('BRIEF_TICKET_CONFIRM_CANCEL:')) {
      const targetBriefId = buttonId.slice('BRIEF_TICKET_CONFIRM_CANCEL:'.length).trim();
      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, targetBriefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) {
        await this.waClient.sendTextMessage(phoneE164, 'Tiket request tidak ditemukan.');
        return;
      }

      if (['ACCEPTED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED'].includes(brief.status)) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `⚠️ Tiket *#${brief.briefCode}* baru saja diambil oleh Tim Redaksi. Pembatalan otomatis ditutup karena proses produksi telah berjalan.`,
          [
            { id: `BRIEF_LOOKUP:${brief.id}`, title: '📋 Detail Tiket' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      if (brief.status === 'CANCELLED') {
        await this.waClient.sendTextMessage(phoneE164, `Tiket #${brief.briefCode} sudah dibatalkan sebelumnya.`);
        return;
      }

      // Update status tiket jadi CANCELLED
      await db
        .update(contentBriefs)
        .set({
          status: 'CANCELLED',
          operatorNotes: 'Dibatalkan oleh klien via WhatsApp sebelum diambil operator',
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, brief.id));

      // Kembalikan kuota secara atomik
      const refundResult = await this.quotaWalletService.refundQuota({
        tenantId: tenant.id,
        briefId: brief.id,
        reason: 'Dibatalkan oleh klien via WhatsApp sebelum diambil operator',
        isCancelledByClient: true,
      });

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `✅ *Tiket #${brief.briefCode} Berhasil Dibatalkan*`,
          '',
          `Tiket telah dibatalkan sebelum masuk produksi.`,
          `• Kuota Dikembalikan: *+${refundResult.refundedCost} Request*`,
          `• Saldo Kuota Aktif Anda: *${refundResult.remainingQuota} Request*`,
        ].join('\n'),
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Tiket Dibatalkan & Refund Sukses',
        'Asisten Redaksi Polaris'
      );
      return;
    }

    const isSubmitAction =
      buttonId.startsWith('PKG_') ||
      buttonId.startsWith('SUBMIT_OVERQUOTA') ||
      buttonId.startsWith('SUBMIT_REGULAR') ||
      buttonId === 'BRIEF_SUBMIT_URGENT' ||
      buttonId === 'BRIEF_SUBMIT_NORMAL' ||
      buttonId === 'BRIEF_SUBMIT_QUEUED' ||
      buttonId === 'BRIEF_SUBMIT_URGENT_OVERQUOTA';

    if (isSubmitAction) {
      const draft = await this.redisService.get<DraftCartState>(draftKey);
      if (!draft || draft.items.length === 0) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          'Keranjang bahan Anda sudah kosong atau telah dikirim sebelumnya. Silakan kirim teks, foto, atau dokumen topik baru:',
          [
            { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      let packageType: BriefPackageType = draft.packageType || BriefPackageType.FULL_CAMPAIGN;
      let isUrgent = false;
      let isQueuedNextWeek = false;
      let isUrgentOverquota = false;

      if (buttonId.startsWith('SUBMIT_OVERQUOTA:')) {
        const parts = buttonId.split(':');
        const pkg = parts[1] as BriefPackageType;
        const disp = parts[2];
        if (pkg) packageType = pkg;
        if (disp === 'URGENT') {
          isUrgent = true;
          isUrgentOverquota = true;
        } else if (disp === 'QUEUED') {
          isQueuedNextWeek = true;
        }
      } else if (buttonId.startsWith('SUBMIT_OVERQUOTA_URGENT')) {
        if (buttonId.includes(':')) {
          const pkg = buttonId.split(':')[1] as BriefPackageType;
          if (pkg) packageType = pkg;
        }
        isUrgent = true;
        isUrgentOverquota = true;
      } else if (buttonId.startsWith('SUBMIT_OVERQUOTA_QUEUED')) {
        if (buttonId.includes(':')) {
          const pkg = buttonId.split(':')[1] as BriefPackageType;
          if (pkg) packageType = pkg;
        }
        isQueuedNextWeek = true;
      } else if (buttonId.startsWith('SUBMIT_REGULAR:')) {
        const pkg = buttonId.split(':')[1] as BriefPackageType;
        if (pkg) packageType = pkg;
      } else if (buttonId === 'PKG_ARTICLE_ONLY') {
        packageType = BriefPackageType.ARTICLE_ONLY;
      } else if (buttonId === 'PKG_POSTER_ONLY') {
        packageType = BriefPackageType.POSTER_ONLY;
      } else if (buttonId === 'PKG_INFOGRAPHIC_ONLY') {
        packageType = BriefPackageType.INFOGRAPHIC_ONLY;
      } else if (buttonId === 'PKG_FULL_CAMPAIGN') {
        packageType = BriefPackageType.FULL_CAMPAIGN;
      } else if (buttonId === 'BRIEF_SUBMIT_URGENT') {
        isUrgent = true;
      } else if (buttonId === 'BRIEF_SUBMIT_URGENT_OVERQUOTA') {
        isUrgent = true;
        isUrgentOverquota = true;
      } else if (buttonId === 'BRIEF_SUBMIT_QUEUED') {
        isQueuedNextWeek = true;
      }

      const formatLabel = this.helper.getPackageTypeLabel(packageType);
      const quota = await this.helper.getTenantWeeklyQuota(tenant.id);

      if (quota.weeklyRemaining <= 0 && !isUrgentOverquota && !isQueuedNextWeek) {
        isQueuedNextWeek = true;
      }

      const baseCost = this.helper.getPackageTypeBaseCost(packageType);
      const requiredCost = isUrgentOverquota ? baseCost * 2 : baseCost;

      // Server-side guard: periksa saldo kuota
      if (quota.remainingQuota < requiredCost || quota.isPeriodExpired) {
        if (packageType === BriefPackageType.FULL_CAMPAIGN && quota.remainingQuota === 1 && !quota.isPeriodExpired) {
          await this.waClient.sendInteractiveButtons(
            phoneE164,
            [
              `⚠️ *Saldo Kuota Tersisa 1 Request*`,
              '',
              `Paket Lengkap membutuhkan *2 Kuota*, namun saldo aktif Anda saat ini tersisa *1 Request*.`,
              '',
              `💡 *Solusi:* Anda tetap dapat memilih salah satu format satuan dengan sisa 1 kuota Anda:`,
            ].join('\n'),
            [
              { id: 'PKG_ARTICLE_ONLY', title: '📝 Artikel (1)' },
              { id: 'PKG_POSTER_ONLY', title: '🎨 Poster (1)' },
              { id: 'PKG_INFOGRAPHIC_ONLY', title: '📊 Infografis (1)' },
            ],
            'Format Satuan Tersedia',
            'Sisa 1 Kuota Aktif'
          );
          return;
        }

        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `🚫 *Saldo Kuota Tidak Mencukupi*\n\nPengajuan format ini membutuhkan *${requiredCost} kuota*, namun saldo kuota aktif Anda tersisa *${quota.remainingQuota} request*.\n\nSilakan perpanjang atau top-up paket kuota Anda di dashboard.`,
          [
            { id: 'BRIEF_CANCEL_ASK', title: '❌ Batalkan Draft' },
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      await this.redisService.del(draftKey);
      await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);

      const clientUrgency = isUrgent ? BriefUrgencyLevel.URGENT : BriefUrgencyLevel.NORMAL;

      // Tentukan target status berdasarkan kuota & pilihan tombol
      if (quota.weeklyRemaining <= 0 && !isUrgentOverquota) {
        isQueuedNextWeek = true;
      }

      const targetStatus: 'SUBMITTED' | 'QUEUED_NEXT_WEEK' = isQueuedNextWeek
        ? 'QUEUED_NEXT_WEEK'
        : 'SUBMITTED';

      const createdBrief = await this.commitDraftToBriefTicket(
        tenant,
        draft,
        clientUrgency,
        targetStatus,
        isUrgentOverquota,
        packageType,
        requiredCost
      );

      const walletAfter = await this.quotaWalletService.getTenantQuotaWallet(tenant.id);
      const horizonInfo = getTimeHorizonInfo(clientUrgency);

      // KASUS A: MASUK ANTREAN MINGGU DEPAN (KUOTA PENUH)
      if (targetStatus === 'QUEUED_NEXT_WEEK') {
        const nextWeekCount = (quota.queuedNextWeekCount || 0) + 1;
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          [
            `🗓️ *Request Diamankan: Antrean Minggu Depan #${createdBrief.briefCode}*`,
            `• Format Konten: *${formatLabel}*`,
            `• Target Pengerjaan: *Senin Pukul 08:00 WIB*`,
            `• Biaya Terpotong: *${createdBrief.quotaCostDeducted} Kuota*`,
            `• Sisa Saldo Total: *${walletAfter.remainingQuota} dari ${walletAfter.totalQuotaAllocated} Request*`,
            `• Status Jatah Minggu Ini: *${quota.weeklyUsed}/${quota.weeklyLimit} (Penuh)*`,
            `• Antrean Minggu Depan Anda: *${nextWeekCount} tiket tersimpan*`,
            '',
            '🔒 *Bahan kegiatan Anda telah aman tersimpan.* Tim Redaksi akan langsung memproses tiket ini pada giliran pertama hari Senin pagi mendatang saat jatah mingguan diperbarui.',
          ].join('\n'),
          [
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_LATEST_LINKS', title: '🔗 Arsip Konten' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          `Tiket #${createdBrief.briefCode} Masuk Antrean`,
          'Asisten Redaksi Polaris'
        );
        await this.checkAndSendLowQuotaAlert(tenant, phoneE164, walletAfter);
        return;
      }

      // KASUS B: PENGAJUAN DARURAT (OVER-QUOTA URGENT - BIAYA X2)
      if (isUrgentOverquota) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          [
            `⚡ *Pengajuan Darurat Diterima: #${createdBrief.briefCode}*`,
            `• Format Konten: *${formatLabel}*`,
            `• Status: *Prioritas Editor Utama (Over-Quota)*`,
            `• Biaya Kuota: *${createdBrief.quotaCostDeducted} Kuota Terpotong*`,
            `• Sisa Saldo Total: *${walletAfter.remainingQuota} dari ${walletAfter.totalQuotaAllocated} Request*`,
            `• Target Produksi: *${horizonInfo.badgeLabel}*`,
            horizonInfo.statusLine,
            `• Catatan: Jatah mingguan penuh (${quota.weeklyUsed}/${quota.weeklyLimit}). Darurat dialokasikan ke meja Editor.`,
            '',
            '🔒 *Bahan kegiatan Anda telah diteruskan ke Editor Utama.* Tim kami segera memproses konten Anda untuk tayang hari ini.',
          ].join('\n'),
          [
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_LATEST_LINKS', title: '🔗 Arsip Konten' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          `Tiket Darurat #${createdBrief.briefCode}`,
          'Asisten Redaksi Polaris'
        );
        await this.checkAndSendLowQuotaAlert(tenant, phoneE164, walletAfter);
        return;
      }

      // KASUS C: SUBMIT REGULER / URGENT NORMAL
      const quotaNotice = `• 📊 Jatah Minggu Ini: *${quota.weeklyUsed + createdBrief.quotaCostDeducted} dari ${quota.weeklyLimit} request*\n• 💳 Sisa Saldo Total: *${walletAfter.remainingQuota} dari ${walletAfter.totalQuotaAllocated} Request*`;

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `✅ *Request Resmi Diterima: #${createdBrief.briefCode}*`,
          `• Format Konten: *${formatLabel}*`,
          `• Target Produksi: *${horizonInfo.badgeLabel}*`,
          `• Biaya Terpotong: *${createdBrief.quotaCostDeducted} Kuota*`,
          horizonInfo.statusLine,
          quotaNotice,
          '',
          '🔒 *Bahan kegiatan Anda telah diamankan.* Tim Redaksi segera menyusun materi sesuai format pilihan Anda untuk ditinjau sebelum tayang. Sambil menunggu, silakan pilih menu layanan:',
        ].join('\n'),
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_LATEST_LINKS', title: '🔗 Arsip Konten' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        `Tiket #${createdBrief.briefCode} Diproses`,
        'Asisten Redaksi Polaris'
      );
      await this.checkAndSendLowQuotaAlert(tenant, phoneE164, walletAfter);
      return;
    }

    if (buttonId.startsWith('DRAFT_TO_REV:')) {
      const briefId = buttonId.slice('DRAFT_TO_REV:'.length).trim();
      const draft = await this.redisService.get<DraftCartState>(draftKey);
      if (!draft || draft.items.length === 0) {
        await this.waClient.sendTextMessage(
          phoneE164,
          'Pesan catatan Anda sudah tidak ditemukan di keranjang sementara. Silakan ketik ulang catatan revisi Anda.'
        );
        return;
      }
      await this.redisService.del(draftKey);

      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) {
        await this.waClient.sendTextMessage(phoneE164, 'Tiket tujuan revisi tidak ditemukan.');
        return;
      }

      const syntheticRevSession: RevisionSessionState = {
        briefId: brief.id,
        briefCode: brief.briefCode,
        tenantId: tenant.id,
        targetComponents: ['ARTICLE', 'IMAGE', 'CAPTION'],
        createdAtMs: Date.now(),
        items: draft.items,
      };

      await this.commitRevisionCart(tenant, phoneE164, syntheticRevSession);
      return;
    }

    if (buttonId.startsWith('REV_APPROVE:')) {
      const briefId = buttonId.slice('REV_APPROVE:'.length).trim();
      await this.redisService.del(`whatsapp:rev_session:${tenant.id}`);
      await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);
      await this.approveAndPublishBriefFromClient(tenant.id, briefId, phoneE164);
      return;
    }

    if (buttonId.startsWith('REV_CANCEL:')) {
      await this.redisService.del(`whatsapp:rev_session:${tenant.id}`);
      await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        '✅ Mode revisi telah dibatalkan (kuota revisi Anda *tidak terpotong*). Silakan pilih menu layanan di bawah ini:',
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    if (buttonId.startsWith('REV_CLEAR:')) {
      const revKey = `whatsapp:rev_session:${tenant.id}`;
      const existingRev = await this.redisService.get<RevisionSessionState>(revKey);
      if (existingRev) {
        existingRev.items = [];
        existingRev.updatedAtMs = Date.now();
        await this.redisService.set(revKey, existingRev, SESSION_TTL_SECONDS);
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `🔄 Catatan revisi sebelumnya untuk *#${existingRev.briefCode}* telah dikosongkan.\n\nSilakan ketik ulang catatan revisi Anda (bisa kirim beberapa pesan/foto beruntun, lalu tunggu 15 detik hingga rekap muncul):`,
          [
            { id: `REV_CANCEL:${existingRev.briefId}`, title: '❌ Batalkan Revisi' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
      }
      return;
    }

    if (buttonId.startsWith('REV_COMMIT:')) {
      const revKey = `whatsapp:rev_session:${tenant.id}`;
      const existingRev = await this.redisService.get<RevisionSessionState>(revKey);
      if (!existingRev || !existingRev.items || existingRev.items.length === 0) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          'Catatan revisi sudah dikirim atau masih kosong. Silakan cek status tiket Anda:',
          [
            { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }
      await this.commitRevisionCart(tenant, phoneE164, existingRev);
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

      // Guardrail 1: Tolak revisi jika tiket sudah PUBLISHED / APPROVED / REJECTED
      if (['PUBLISHED', 'APPROVED', 'REJECTED'].includes(brief.status)) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `🔒 *Tiket #${brief.briefCode} Telah Selesai (${brief.status})*\n\nKonten pada tiket ini sudah resmi disetujui/tayang sehingga tidak dapat direvisi kembali.\n\nJika Anda ingin membuat konten untuk topik baru, silakan pilih *Request Konten Baru*:`,
          [
            { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
            { id: 'MENU_LATEST_LINKS', title: '🔗 Arsip Konten' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          `Tiket #${brief.briefCode} Terkunci`,
          'Asisten Redaksi Polaris'
        );
        return;
      }

      // Guardrail 2: Tolak jika batas putaran revisi sudah habis
      if (brief.revisionUsed >= brief.revisionLimit) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `Mohon maaf, batas revisi untuk tiket *#${brief.briefCode}* telah habis (*${brief.revisionUsed}/${brief.revisionLimit} putaran*). Silakan setujui hasil saat ini untuk ditayangkan:`,
          [
            { id: `REV_APPROVE:${brief.id}`, title: '✅ Setujui & Tayang' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

      const remaining = brief.revisionLimit - brief.revisionUsed;
      const pkgType = (brief as any).packageType || 'FULL_CAMPAIGN';

      if (pkgType === 'POSTER_ONLY' || pkgType === 'INFOGRAPHIC_ONLY') {
        const revSession: RevisionSessionState = {
          briefId: brief.id,
          briefCode: brief.briefCode,
          tenantId: tenant.id,
          targetComponents: ['IMAGE'],
          createdAtMs: Date.now(),
          updatedAtMs: Date.now(),
          items: [],
        };
        await this.redisService.set(`whatsapp:rev_session:${tenant.id}`, revSession, SESSION_TTL_SECONDS);
        await this.redisService.set(
          `whatsapp:session_intent:${tenant.id}`,
          {
            mode: 'REVISION',
            briefId: brief.id,
            briefCode: brief.briefCode,
            startedAtMs: Date.now(),
          },
          SESSION_TTL_SECONDS
        );

        const visualFormatName = pkgType === 'POSTER_ONLY' ? 'Poster Visual' : 'Infografis Publik';
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          [
            `✏️ *Mode Catatan Revisi Aktif — #${brief.briefCode}*`,
            `• 🎯 Format: *${visualFormatName}*`,
            `• 🔄 Sisa Jatah Revisi: *${remaining} dari ${brief.revisionLimit} putaran*`,
            '',
            '*Cara Mengirim Catatan Revisi:*',
            '1️⃣ Silakan ketik poin perbaikan visual atau kirim foto/dokumen referensi baru.',
            '2️⃣ Setelah selesai mengetik, *tunggu sekitar 15 detik* hingga asisten menampilkan Rekap & Tombol Konfirmasi Kirim.',
          ].join('\n'),
          [
            { id: `REV_CANCEL:${brief.id}`, title: '❌ Batalkan Revisi' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          `Mode Revisi #${brief.briefCode}`,
          'Sesi revisi aktif hingga Anda menekan Kirim Revisi'
        );
        return;
      }

      if (pkgType === 'ARTICLE_ONLY') {
        const revSession: RevisionSessionState = {
          briefId: brief.id,
          briefCode: brief.briefCode,
          tenantId: tenant.id,
          targetComponents: ['ARTICLE', 'CAPTION'],
          createdAtMs: Date.now(),
          updatedAtMs: Date.now(),
          items: [],
        };
        await this.redisService.set(`whatsapp:rev_session:${tenant.id}`, revSession, SESSION_TTL_SECONDS);
        await this.redisService.set(
          `whatsapp:session_intent:${tenant.id}`,
          {
            mode: 'REVISION',
            briefId: brief.id,
            briefCode: brief.briefCode,
            startedAtMs: Date.now(),
          },
          SESSION_TTL_SECONDS
        );

        await this.waClient.sendInteractiveButtons(
          phoneE164,
          [
            `✏️ *Mode Catatan Revisi Aktif — #${brief.briefCode}*`,
            `• 🎯 Format: *Naskah Artikel*`,
            `• 🔄 Sisa Jatah Revisi: *${remaining} dari ${brief.revisionLimit} putaran*`,
            '',
            '*Cara Mengirim Catatan Revisi:*',
            '1️⃣ Silakan ketik poin-poin perbaikan naskah atau kirim data/kutipan tambahan.',
            '2️⃣ Setelah selesai mengetik, *tunggu sekitar 15 detik* hingga asisten menampilkan Rekap & Tombol Konfirmasi Kirim.',
          ].join('\n'),
          [
            { id: `REV_CANCEL:${brief.id}`, title: '❌ Batalkan Revisi' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ],
          `Mode Revisi #${brief.briefCode}`,
          'Sesi revisi aktif hingga Anda menekan Kirim Revisi'
        );
        return;
      }

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

      if (['PUBLISHED', 'APPROVED', 'REJECTED'].includes(brief.status)) {
        await this.waClient.sendInteractiveButtons(
          phoneE164,
          `🔒 Tiket *#${brief.briefCode}* telah resmi selesai/tayang dan tidak dapat direvisi lagi.`,
          [
            { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
            { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
          ]
        );
        return;
      }

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
        updatedAtMs: Date.now(),
        items: [],
      };

      await this.redisService.set(
        `whatsapp:rev_session:${tenant.id}`,
        revSession,
        SESSION_TTL_SECONDS
      );
      await this.redisService.set(
        `whatsapp:session_intent:${tenant.id}`,
        {
          mode: 'REVISION',
          briefId: brief.id,
          briefCode: brief.briefCode,
          startedAtMs: Date.now(),
        },
        SESSION_TTL_SECONDS
      );

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `✏️ *Mode Catatan Revisi Aktif — #${brief.briefCode}*`,
          `• 🎯 Komponen: *${label}*`,
          `• 🔄 Sisa Jatah Revisi: *${brief.revisionLimit - brief.revisionUsed} dari ${brief.revisionLimit} putaran*`,
          '',
          '*Cara Mengirim Catatan Revisi:*',
          '1️⃣ Silakan ketik poin-poin perbaikan Anda (boleh *1 pesan panjang* maupun *beberapa pesan/foto secara beruntun*).',
          '2️⃣ Setelah selesai mengetik, *tunggu sekitar 15 detik* hingga asisten menampilkan Rekap & Tombol Konfirmasi Kirim.',
        ].join('\n'),
        [
          { id: `REV_CANCEL:${brief.id}`, title: '❌ Batalkan Revisi' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        `Mode Revisi #${brief.briefCode}`,
        'Sesi revisi aktif hingga Anda menekan Kirim Revisi'
      );
      return;
    }

    if (buttonId.startsWith('CLARIFY_REPLY:')) {
      const briefId = buttonId.slice('CLARIFY_REPLY:'.length).trim();
      const [brief] = await db
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenant.id)))
        .limit(1);

      if (!brief) {
        await this.waClient.sendTextMessage(
          phoneE164,
          'Tiket tidak ditemukan atau sudah selesai diproses.'
        );
        return;
      }

      await this.redisService.set(
        `whatsapp:session_intent:${tenant.id}`,
        {
          mode: 'CLARIFY',
          briefId: brief.id,
          briefCode: brief.briefCode,
          startedAtMs: Date.now(),
        },
        1800
      );

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `💬 *Menjawab Klarifikasi Redaksi — #${brief.briefCode}*`,
          `Topik: *${brief.topicSummary || 'Brief Konten'}*`,
          '',
          'Silakan ketik jawaban atau kirimkan foto/dokumen pelengkap untuk Editor Redaksi.',
          'Pesan Anda langsung diteruskan ke tiket ini tanpa tertukar dengan tiket lain.',
        ].join('\n'),
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        `Klarifikasi #${brief.briefCode}`,
        'Asisten Redaksi Polaris'
      );
      return;
    }
  }

  private async commitDraftToBriefTicket(
    tenant: { id: string; fullName: string },
    draft: DraftCartState,
    clientUrgency: BriefUrgencyLevel,
    targetStatus: 'SUBMITTED' | 'QUEUED_NEXT_WEEK' = 'SUBMITTED',
    isUrgentOverquota = false,
    packageType: BriefPackageType = BriefPackageType.FULL_CAMPAIGN,
    overrideCost?: number
  ) {
    const defaultBaseCost = packageType === BriefPackageType.FULL_CAMPAIGN ? 2 : 1;
    const cost = overrideCost ?? (isUrgentOverquota ? defaultBaseCost * 2 : defaultBaseCost);
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

    const rawTextParts = draft.items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));

    const textParts = this.helper.cleanTopicParts(rawTextParts);

    const topicSummary =
      textParts.length > 0
        ? textParts.join('\n\n')
        : `Kiriman ${draft.items.length} file lampiran kegiatan dari ${tenant.fullName}`;

    const limits = await this.helper.getTenantConfiguredLimits(tenant.id);
    const horizonInfo = getTimeHorizonInfo(clientUrgency);

    let articleStatus = 'PENDING';
    let imageStatus = 'PENDING';
    let captionStatus = 'PENDING';

    if (packageType === BriefPackageType.ARTICLE_ONLY) {
      imageStatus = 'NOT_APPLICABLE';
    } else if (packageType === BriefPackageType.POSTER_ONLY) {
      articleStatus = 'NOT_APPLICABLE';
      captionStatus = 'NOT_APPLICABLE';
    } else if (packageType === BriefPackageType.INFOGRAPHIC_ONLY) {
      articleStatus = 'NOT_APPLICABLE';
      captionStatus = 'NOT_APPLICABLE';
    }

    const createdBrief = await withTenantContext(tenant.id, async (tx) => {
      const [insertedBrief] = await tx
        .insert(contentBriefs)
        .values({
          briefCode,
          tenantId: tenant.id,
          assignedOperatorId,
          status: targetStatus,
          packageType,
          clientUrgency,
          operatorPriority: clientUrgency,
          targetWindow: horizonInfo.target,
          topicSummary,
          weeklyQuotaPeriod,
          weeklyRequestLimit: limits.weeklyRequestLimit,
          revisionUsed: 0,
          revisionLimit: limits.revisionLimit,
          articleStatus,
          imageStatus,
          captionStatus,
          quotaCostDeducted: cost,
          isUrgentOverquota,
        })
        .returning();

      for (const item of draft.items) {
        await tx
          .insert(contentBriefMessages)
          .values({
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
          })
          .onConflictDoNothing();
      }

      return insertedBrief;
    });

    // Pemotongan kuota secara atomik dengan Row-Level Lock & Immutable Ledger
    await this.quotaWalletService.deductQuota({
      tenantId: tenant.id,
      cost,
      briefId: createdBrief.id,
      referenceCode: createdBrief.briefCode,
      isUrgentOverquota,
    });

    const notifTitle =
      targetStatus === 'QUEUED_NEXT_WEEK'
        ? `🗓️ Request Antrean Minggu Depan #${createdBrief.briefCode}`
        : clientUrgency === 'URGENT'
        ? `🔴 Request Topik MENDESAK #${createdBrief.briefCode}`
        : `📥 Request Topik Baru #${createdBrief.briefCode}`;
    const notifBody =
      targetStatus === 'QUEUED_NEXT_WEEK'
        ? `${tenant.fullName} mengirim request topik (dialokasikan ke antrean Senin depan karena jatah penuh).`
        : `${tenant.fullName} mengirim request topik via WhatsApp (${draft.items.length} pesan/lampiran).`;

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

    await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);

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

    const hasPendingRevisionWork =
      brief.revisionUsed > 0 &&
      (brief.articleStatus === 'REVISION' ||
        brief.imageStatus === 'REVISION' ||
        brief.captionStatus === 'REVISION');

    const nextStatusAfterReply = hasPendingRevisionWork ? 'REVISION_REQUESTED' : 'IN_PROGRESS';

    await withTenantContext(tenant.id, async (tx) => {
      await tx
        .insert(contentBriefMessages)
        .values({
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
        })
        .onConflictDoNothing();

      await tx
        .update(contentBriefs)
        .set({
          status: nextStatusAfterReply,
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, brief.id));
    });

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `✅ Terima kasih Bapak/Ibu *${tenant.fullName}*, pesan tambahan Anda untuk tiket *#${brief.briefCode}* telah diteruskan ke layar Editor Redaksi.`,
        '',
        '🔄 *Status Tiket:* Sedang Dikerjakan Tim Redaksi (Belum Selesai).',
        'Kami akan mengirimkan pratinjau terbaru ke WhatsApp ini segera setelah selesai diracik.',
      ].join('\n'),
      [
        { id: 'MENU_CHECK_STATUS', title: '📊 Status Pengerjaan' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      `Balasan Diterima #${brief.briefCode}`,
      'Tiket tetap aktif dalam pengerjaan'
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

    await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);
  }

  /**
   * Menampung bubble catatan revisi dari WhatsApp secara beruntun ("Tipsy-Tipsy" maupun "Bulk")
   * ke dalam keranjang revisi sebelum di-commit menjadi 1 putaran revisi utuh.
   */
  private async appendClientRevisionBubble(
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
    const revKey = `whatsapp:rev_session:${tenant.id}`;
    const lowerCmd = input.extractedText.trim().toLowerCase();

    if (input.itemType === 'TEXT' && (lowerCmd === 'batal' || lowerCmd === 'cancel')) {
      this.clearTenantDebounceTimer(tenant.id);
      await this.redisService.del(revKey);
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `✅ Mode revisi untuk tiket *#${revSession.briefCode}* telah dibatalkan (kuota revisi Anda tidak terpotong).`,
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    if (
      input.itemType === 'TEXT' &&
      (lowerCmd === 'kirim' || lowerCmd === 'selesai') &&
      revSession.items &&
      revSession.items.length > 0
    ) {
      this.clearTenantDebounceTimer(tenant.id);
      await this.commitRevisionCart(tenant, phoneE164, revSession);
      return;
    }

    // Jika keranjang revisi masih kosong dan klien hanya mengetik sapaan ("halo", "hal", "p"),
    // ingatkan dengan ramah bahwa ia sedang berada di Mode Revisi tanpa menganggapnya isi revisi.
    if (
      input.itemType === 'TEXT' &&
      (!revSession.items || revSession.items.length === 0) &&
      this.helper.isNoiseGreetingLine(input.extractedText)
    ) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `Halo Bapak/Ibu *${tenant.fullName}*, saat ini Anda sedang berada di *Mode Revisi #${revSession.briefCode}* (Komponen: *${revSession.targetComponents.join(', ')}*).\n\nSilakan langsung ketik poin perbaikan atau kirimkan foto pengganti di bawah ini, atau batalkan jika ingin kembali ke Menu Utama:`,
        [
          { id: `REV_CANCEL:${revSession.briefId}`, title: '❌ Batalkan Revisi' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
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

    const updatedItems: DraftCartItem[] = Array.isArray(revSession.items)
      ? [...revSession.items]
      : [];

    updatedItems.push({
      waMessageId: input.wamid,
      messageType: input.itemType,
      textBody: input.extractedText || undefined,
      mediaR2Url: uploaded.r2StorageUrl,
      mediaCdnUrl: uploaded.cdnPublicUrl,
      mediaMimeType: uploaded.mimeType,
      mediaFileName: uploaded.fileName,
      mediaFileSizeBytes: uploaded.fileSizeBytes,
      createdAtIso: new Date().toISOString(),
    });

    const updatedSession: RevisionSessionState = {
      ...revSession,
      items: updatedItems,
      updatedAtMs: Date.now(),
    };

    await this.redisService.set(revKey, updatedSession, SESSION_TTL_SECONDS);
    this.scheduleRevisionConfirmationPrompt(tenant.id, phoneE164);
  }

  /**
   * Mengeksekusi seluruh isi keranjang revisi (baik 1 bubble maupun banyak bubble + foto)
   * menjadi 1 putaran revisi utuh pada tiket Content Brief.
   */
  private async commitRevisionCart(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    revSession: RevisionSessionState
  ): Promise<void> {
    this.clearTenantDebounceTimer(tenant.id);
    await this.redisService.del(`whatsapp:rev_session:${tenant.id}`);
    await this.redisService.del(`whatsapp:session_intent:${tenant.id}`);

    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(and(eq(contentBriefs.id, revSession.briefId), eq(contentBriefs.tenantId, tenant.id)))
      .limit(1);

    if (!brief) return;

    if (['PUBLISHED', 'APPROVED', 'REJECTED'].includes(brief.status)) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `🔒 Tiket *#${brief.briefCode}* sudah berstatus *${brief.status}* sehingga tidak dapat direvisi kembali.`,
        [
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    if (brief.revisionUsed >= brief.revisionLimit) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `Batas revisi untuk tiket *#${brief.briefCode}* telah habis (${brief.revisionUsed}/${brief.revisionLimit} putaran).`,
        [
          { id: `REV_APPROVE:${brief.id}`, title: '✅ Setujui & Tayang' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ]
      );
      return;
    }

    const items = revSession.items || [];
    if (items.length === 0) return;

    const nextRound = brief.revisionUsed + 1;
    const comps = revSession.targetComponents;

    const rawTextParts = items
      .map((i) => i.textBody?.trim())
      .filter((t): t is string => Boolean(t));
    const cleanedTexts = this.helper.cleanTopicParts(rawTextParts);
    const combinedRevisionText =
      cleanedTexts.length > 0
        ? cleanedTexts.join('\n')
        : 'Permintaan revisi dengan lampiran media baru.';

    const mediaItems = items.filter((i) => i.mediaR2Url || i.mediaCdnUrl);

    await withTenantContext(tenant.id, async (tx) => {
      if (mediaItems.length > 0) {
        for (let idx = 0; idx < mediaItems.length; idx++) {
          const m = mediaItems[idx];
          await tx
            .insert(contentBriefMessages)
            .values({
              briefId: brief.id,
              tenantId: tenant.id,
              direction: 'INBOUND',
              messageType: m.messageType,
              waMessageId: m.waMessageId,
              textBody: idx === 0 ? combinedRevisionText : m.textBody || null,
              mediaR2Url: m.mediaR2Url ?? null,
              mediaCdnUrl: m.mediaCdnUrl ?? null,
              mediaMimeType: m.mediaMimeType ?? null,
              mediaFileName: m.mediaFileName ?? null,
              mediaFileSizeBytes: m.mediaFileSizeBytes ?? null,
              revisionRound: nextRound,
              targetComponents: comps,
              isInternalFault: false,
            })
            .onConflictDoNothing();
        }
      } else {
        await tx
          .insert(contentBriefMessages)
          .values({
            briefId: brief.id,
            tenantId: tenant.id,
            direction: 'INBOUND',
            messageType: 'TEXT',
            waMessageId: items[0].waMessageId,
            textBody: combinedRevisionText,
            revisionRound: nextRound,
            targetComponents: comps,
            isInternalFault: false,
          })
          .onConflictDoNothing();
      }

      const pkgType = (brief as any).packageType || 'FULL_CAMPAIGN';
      const hasArticle = pkgType === 'FULL_CAMPAIGN' || pkgType === 'ARTICLE_ONLY';
      const hasImage = pkgType === 'FULL_CAMPAIGN' || pkgType === 'POSTER_ONLY' || pkgType === 'INFOGRAPHIC_ONLY';
      const hasCaption = pkgType === 'FULL_CAMPAIGN' || pkgType === 'ARTICLE_ONLY';

      await tx
        .update(contentBriefs)
        .set({
          status: 'REVISION_REQUESTED',
          revisionUsed: nextRound,
          articleStatus: hasArticle ? (comps.includes('ARTICLE') ? 'REVISION' : 'APPROVED') : 'NOT_APPLICABLE',
          imageStatus: hasImage ? (comps.includes('IMAGE') ? 'REVISION' : 'APPROVED') : 'NOT_APPLICABLE',
          captionStatus: hasCaption ? (comps.includes('CAPTION') ? 'REVISION' : 'APPROVED') : 'NOT_APPLICABLE',
          updatedAt: new Date(),
        })
        .where(eq(contentBriefs.id, brief.id));
    });

    const remaining = Math.max(0, brief.revisionLimit - nextRound);
    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `✅ *Catatan Revisi Resmi Diterima — #${brief.briefCode}*`,
        `• 🎯 Komponen Diperbaiki: *${comps.join(', ')}*`,
        `• 🔄 Putaran Revisi: *${nextRound} dari ${brief.revisionLimit}* (Sisa kuota revisi: *${remaining}x*)`,
        `• 📊 Kuota Request Mingguan: *Tidak Terpotong*`,
        '',
        '🔒 *Sesi input revisi selesai.* Tim Redaksi sedang mengerjakan perbaikan sesuai arahan Anda dan akan mengirimkan pratinjau terbaru ke WhatsApp ini. Sambil menunggu, Anda bebas mengakses menu lain:',
      ].join('\n'),
      [
        { id: 'MENU_CHECK_STATUS', title: '📊 Status Pengerjaan' },
        { id: 'MENU_LATEST_LINKS', title: '🔗 Arsip Konten' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      `Revisi #${brief.briefCode} Diproses`,
      'Asisten Redaksi Polaris'
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

  /**
   * Digunakan untuk pengiriman revisi 1-langkah secara langsung (misalnya dari Form Web Magic Review).
   */
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

    const sessionWithSingleItem: RevisionSessionState = {
      ...revSession,
      items: [
        {
          waMessageId: input.wamid,
          messageType: input.itemType,
          textBody: input.extractedText,
          mediaR2Url: uploaded.r2StorageUrl,
          mediaCdnUrl: uploaded.cdnPublicUrl,
          mediaMimeType: uploaded.mimeType,
          mediaFileName: uploaded.fileName,
          mediaFileSizeBytes: uploaded.fileSizeBytes,
          createdAtIso: new Date().toISOString(),
        },
      ],
    };

    await this.commitRevisionCart(tenant, phoneE164, sessionWithSingleItem);
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
          .map((b) => {
            const h = getTimeHorizonInfo(b.clientUrgency as any, b.createdAt);
            const surgeBadge = b.isUrgentOverquota ? ' ⚡[Darurat x2]' : '';
            return `• *#${b.briefCode}* — ${h.shortLabel} (*${b.status}*${surgeBadge}, Rev: ${b.revisionUsed}/${b.revisionLimit})`;
          })
          .join('\n')
        : '• Belum ada tiket request aktif.';

    const expiryNote = quota.isPeriodExpired
      ? '🔴 *Kedaluwarsa*'
      : quota.currentPeriodEnd
        ? `Aktif s/d ${new Date(quota.currentPeriodEnd).toLocaleDateString('id-ID')}`
        : 'Aktif';

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `📊 *Status Layanan & Kuota — ${tenantName}*`,
        `• 💳 Saldo Kuota Total: *${quota.remainingQuota} dari ${quota.totalQuotaAllocated} Request*`,
        `• 📊 Jatah Minggu Ini: *${quota.weeklyUsed} dari ${quota.weeklyLimit} Request* (Reset tiap Senin 00:00 WIB)`,
        `• 🗓️ Masa Aktif Paket: *${expiryNote}*`,
        '',
        '*3 Request Terakhir:*',
        briefLines,
      ].join('\n'),
      [
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten' },
        { id: 'MENU_LATEST_LINKS', title: '🔗 Link & Arsip' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Status Kuota & Layanan',
      'Asisten Redaksi Polaris'
    );
  }

  private async sendLatestPublicationsMenu(
    tenantId: string,
    tenantName: string,
    phoneE164: string,
    page = 1
  ): Promise<void> {
    const limit = 5;
    const offset = Math.max(0, (page - 1) * limit);

    const pubs = await db
      .select()
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(contentPublications.createdAt))
      .limit(limit + 1)
      .offset(offset);

    if (pubs.length === 0 && page === 1) {
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

    const hasMore = pubs.length > limit;
    const displayPubs = pubs.slice(0, limit);

    // Cache publikasi aktif untuk navigasi angka cepat (1-5) via balasan chat
    await this.redisService.set(
      `whatsapp:active_pub_page:${tenantId}`,
      displayPubs.map((p) => p.id),
      3600
    );

    const draftPubs = displayPubs.filter((p) => p.status !== 'PUBLISHED');
    const publishedPubs = displayPubs.filter((p) => p.status === 'PUBLISHED');

    const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    // Susun daftar judul lengkap (100% tanpa potongan karakter) langsung di chat bubble
    const publicationLines = displayPubs.map((p, idx) => {
      const numEmoji = emojiNumbers[idx] || `${idx + 1}.`;
      const statusBadge =
        p.status === 'PUBLISHED'
          ? '✅ _Resmi Tayang di Portal_'
          : '⏳ _Draf Belum Terbit (Bisa Di-UP/Revisi)_';
      return `${numEmoji} *${p.title}*\n   ${statusBadge}`;
    });

    const bodyText = [
      `📚 *Arsip Konten & Naskah — Halaman ${page}*`,
      `Bapak/Ibu *${tenantName}*, berikut daftar judul publikasi Anda:`,
      '',
      ...publicationLines,
      '',
      '────────────────────────────',
      'Tekan tombol *Pilih Konten* di bawah untuk melihat poster HD, teks sebar, atau menindaklanjuti draf.',
      '',
      '_💡 Tips: Anda juga bisa langsung membalas dengan nomor (misal: ketik "1" atau "2") atau ketik "cari <kata>" (misal: "cari sampah")._',
    ].join('\n');

    const navRows: Array<{ id: string; title: string; description: string }> = [];
    if (hasMore) {
      navRows.push({
        id: `PUBS_PAGE:${page + 1}`,
        title: `➡️ Halaman ${page + 1}`,
        description: 'Buka daftar 5 konten berikutnya',
      });
    }
    if (page > 1) {
      navRows.push({
        id: `PUBS_PAGE:${page - 1}`,
        title: `◀️ Halaman ${page - 1}`,
        description: 'Kembali ke halaman sebelumnya',
      });
    }
    navRows.push({
      id: 'MENU_OPEN_MAIN',
      title: '📋 Menu Utama',
      description: 'Buka pilihan layanan utama Asisten Redaksi Polaris',
    });

    const sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description: string }>;
    }> = [];

    let itemNumber = 1;

    if (draftPubs.length > 0) {
      sections.push({
        title: `⏳ Draf Belum Terbit (${draftPubs.length})`,
        rows: draftPubs.map((p) => {
          const num = itemNumber++;
          return {
            id: `PUB_DETAIL:${p.id}`,
            title: formatSmartRowTitle(num, p.title),
            description: formatSmartRowDesc(p.title, '⏳ Draf:'),
          };
        }),
      });
    }

    if (publishedPubs.length > 0) {
      sections.push({
        title: `✅ Resmi Tayang (${publishedPubs.length})`,
        rows: publishedPubs.map((p) => {
          const num = itemNumber++;
          return {
            id: `PUB_DETAIL:${p.id}`,
            title: formatSmartRowTitle(num, p.title),
            description: formatSmartRowDesc(p.title, '✅ Tayang:'),
          };
        }),
      });
    }

    sections.push({
      title: 'Navigasi Halaman & Menu',
      rows: navRows,
    });

    await this.waClient.sendInteractiveList(
      phoneE164,
      bodyText,
      '📚 Pilih Konten',
      sections,
      'Arsip & Link Konten',
      'Asisten Redaksi Polaris'
    );
  }

  private async handleClientKeywordSearch(
    tenantId: string,
    tenantName: string,
    phoneE164: string,
    keyword: string
  ): Promise<void> {
    const pattern = `%${keyword.trim()}%`;
    const matchedPubs = await db
      .select()
      .from(contentPublications)
      .where(and(eq(contentPublications.tenantId, tenantId), ilike(contentPublications.title, pattern)))
      .orderBy(desc(contentPublications.createdAt))
      .limit(5);

    const matchedBriefs = await db
      .select()
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          or(ilike(contentBriefs.topicSummary, pattern), ilike(contentBriefs.briefCode, pattern))
        )
      )
      .orderBy(desc(contentBriefs.createdAt))
      .limit(3);

    if (matchedPubs.length === 0 && matchedBriefs.length === 0) {
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        `🔍 Tidak ditemukan artikel atau tiket dengan kata kunci *"${keyword}"*.\n\nTips: Anda bisa mencari kata umum (misal: _"cari sampah"_, _"cari reses"_) atau mencari kode tiket (misal: _"7626"_).`,
        [
          { id: 'MENU_LATEST_LINKS', title: '📚 Buka Semua Arsip' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Pencarian Tidak Ditemukan',
        'Asisten Redaksi Polaris'
      );
      return;
    }

    // Cache artikel pencarian agar bisa dibuka via ketik "1", "2", dst.
    if (matchedPubs.length > 0) {
      await this.redisService.set(
        `whatsapp:active_pub_page:${tenantId}`,
        matchedPubs.map((p) => p.id),
        3600
      );
    }

    const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const pubLines = matchedPubs.map((p, idx) => {
      const numEmoji = emojiNumbers[idx] || `${idx + 1}.`;
      const statusBadge = p.status === 'PUBLISHED' ? '✅ _Tayang_' : '⏳ _Draf_';
      return `${numEmoji} *${p.title}* (${statusBadge})`;
    });

    const briefLines = matchedBriefs.map(
      (b) => `• 🎫 *#${b.briefCode}* (${b.status}): _"${b.topicSummary.slice(0, 70)}..."_`
    );

    const bodyText = [
      `🔍 *Hasil Pencarian: "${keyword}"*`,
      `Akun: *${tenantName}*`,
      '',
      pubLines.length > 0 ? `*Artikel/Naskah Ditemukan:*\n${pubLines.join('\n')}` : '',
      briefLines.length > 0 ? `*Tiket Ditemukan:*\n${briefLines.join('\n')}` : '',
      '',
      'Silakan pilih judul dari menu drawer di bawah (atau ketik nomor artikel):',
    ]
      .filter(Boolean)
      .join('\n');

    const sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description: string }>;
    }> = [];

    if (matchedPubs.length > 0) {
      sections.push({
        title: `Artikel Ditemukan (${matchedPubs.length})`,
        rows: matchedPubs.map((p, idx) => ({
          id: `PUB_DETAIL:${p.id}`,
          title: formatSmartRowTitle(idx + 1, p.title),
          description: formatSmartRowDesc(
            p.title,
            p.status === 'PUBLISHED' ? '✅ Tayang:' : '⏳ Draf:'
          ),
        })),
      });
    }

    if (matchedBriefs.length > 0) {
      sections.push({
        title: `Tiket Request Ditemukan (${matchedBriefs.length})`,
        rows: matchedBriefs.map((b) => ({
          id: `BRIEF_LOOKUP:${b.id}`,
          title: formatSmartRowTitle(null, `#${b.briefCode}`),
          description: formatSmartRowDesc(b.topicSummary, `[${b.status}]`),
        })),
      });
    }

    sections.push({
      title: 'Navigasi',
      rows: [
        {
          id: 'MENU_OPEN_MAIN',
          title: '📋 Kembali ke Menu Utama',
          description: 'Buka pilihan layanan utama Asisten Redaksi Polaris',
        },
      ],
    });

    await this.waClient.sendInteractiveList(
      phoneE164,
      bodyText,
      '🔍 Lihat Hasil',
      sections,
      'Hasil Pencarian Polaris',
      'Asisten Redaksi Polaris'
    );
  }

  private async handleClientDirectTicketLookup(
    tenantId: string,
    tenantName: string,
    phoneE164: string,
    rawQuery: string
  ): Promise<boolean> {
    const cleanDigits = rawQuery.replace(/[^0-9]/g, '');
    const cleanCode = rawQuery.replace(/^#/, '').toUpperCase();

    const briefs = await db
      .select()
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          or(
            ilike(contentBriefs.briefCode, `%${cleanCode}%`),
            cleanDigits.length >= 4 ? ilike(contentBriefs.briefCode, `%${cleanDigits}%`) : undefined
          )
        )
      )
      .orderBy(desc(contentBriefs.createdAt))
      .limit(1);

    if (briefs.length === 0) {
      return false;
    }

    await this.sendBriefDetailCard(tenantId, briefs[0].id, phoneE164);
    return true;
  }

  private async sendBriefDetailCard(
    tenantId: string,
    briefId: string,
    phoneE164: string
  ): Promise<void> {
    const [brief] = await db
      .select()
      .from(contentBriefs)
      .where(and(eq(contentBriefs.id, briefId), eq(contentBriefs.tenantId, tenantId)))
      .limit(1);

    if (!brief) {
      await this.waClient.sendTextMessage(phoneE164, 'Tiket request tidak ditemukan.');
      return;
    }

    const buttons = [];
    if (brief.status === 'READY_FOR_REVIEW') {
      buttons.push(
        { id: `REV_APPROVE:${brief.id}`, title: '✅ Setujui & Tayang' },
        { id: `REV_START:${brief.id}`, title: '✏️ Minta Revisi' }
      );
    } else if (brief.status === 'SUBMITTED' || brief.status === 'QUEUED_NEXT_WEEK') {
      // Tiket belum dikerjakan operator: boleh dibatalkan klien dan kuota direfund 100%
      buttons.push({ id: `BRIEF_TICKET_CANCEL:${brief.id}`, title: '❌ Batalkan Tiket' });
    } else if (brief.linkedPublicationId) {
      buttons.push({ id: `PUB_DETAIL:${brief.linkedPublicationId}`, title: '📰 Buka Konten' });
    }
    buttons.push({ id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' });

    const horizon = getTimeHorizonInfo(brief.clientUrgency as any, brief.createdAt);

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `📋 *Detail Tiket Request #${brief.briefCode}*`,
        `• Target: *${horizon.badgeLabel}*`,
        `• Status: *${brief.status}*`,
        `• Revisi: *${brief.revisionUsed} dari ${brief.revisionLimit} putaran*`,
        '',
        `*Catatan Topik:*`,
        `"${brief.topicSummary}"`,
        '',
        `*Status Komponen:*`,
        `• 📰 Artikel: ${brief.articleStatus}`,
        `• 🖼️ Poster: ${brief.imageStatus}`,
        `• 💬 Caption: ${brief.captionStatus}`,
      ].join('\n'),
      buttons.slice(0, 3),
      `Tiket #${brief.briefCode}`,
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

    const [linkedBrief] = await db
      .select()
      .from(contentBriefs)
      .where(and(eq(contentBriefs.linkedPublicationId, pub.id), eq(contentBriefs.tenantId, tenantId)))
      .limit(1);

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
    const isPublished = pub.status === 'PUBLISHED';

    if (posterUrl && posterUrl.startsWith('http')) {
      await this.waClient.sendImageMessage(
        phoneE164,
        posterUrl,
        isPublished
          ? `🖼️ *Poster Resmi:* ${pub.title}`
          : `🖼️ *[Pratinjau Poster Draf]:* ${pub.title}`
      );
    }

    const shareableCaption =
      syndication?.whatsappBroadcastText ||
      syndication?.instagramCaption ||
      pub.excerpt;

    if (isPublished) {
      // KASUS A: KONTEN SUDAH TAYANG (Fokus pada Distribusi & Sebar)
      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `📰 *[RESMI TAYANG]*`,
          `*${pub.title}*`,
          '',
          `• Status: *✅ Telah Tayang di Portal Berita Publik*`,
          `• 🔗 Link Berita: ${pub.canonicalUrl}`,
          '',
          '*Teks Siap Sebar / Caption:*',
          shareableCaption.slice(0, 600),
        ].join('\n'),
        [
          { id: 'MENU_LATEST_LINKS', title: '📚 Arsip Lainnya' },
          { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Paket Konten Resmi Tayang',
        'Asisten Redaksi Polaris'
      );
    } else {
      // KASUS B: KONTEN MASIH DRAF (Fokus pada Tindak Lanjut: Minta Terbitkan vs Revisi vs Biarkan)
      const canRevise =
        linkedBrief && linkedBrief.revisionUsed < linkedBrief.revisionLimit;

      const buttons = [];
      buttons.push({ id: `PUB_PUBLISH:${pub.id}`, title: '🚀 Terbitkan Sekarang' });
      if (canRevise) {
        buttons.push({ id: `REV_START:${linkedBrief.id}`, title: '✏️ Minta Revisi' });
      }
      buttons.push({ id: 'MENU_OPEN_MAIN', title: '📁 Biarkan di Draf' });

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `📝 *[DRAF KONTEN — BELUM TAYANG]*`,
          `*${pub.title}*`,
          '',
          `• Status: *⏳ Draf Siap Tindak Lanjut*`,
          linkedBrief
            ? `• Tiket Terkait: *#${linkedBrief.briefCode}* (Sisa Revisi: *${Math.max(
              0,
              linkedBrief.revisionLimit - linkedBrief.revisionUsed
            )}x*)`
            : '',
          '',
          '*Ringkasan Naskah Draf:*',
          `"${pub.excerpt}"`,
          '',
          '💡 _Konten ini belum dipublikasikan ke portal publik._',
          '• Tekan *🚀 Terbitkan Sekarang* untuk langsung menayangkan naskah ini ke portal berita publik.',
          canRevise
            ? '• Tekan *✏️ Minta Revisi* jika ada bagian yang ingin disempurnakan.'
            : '',
          '• Tekan *📁 Biarkan di Draf* jika hanya ingin meninjau tanpa mengubah status.',
        ]
          .filter(Boolean)
          .join('\n'),
        buttons.slice(0, 3),
        'Tindak Lanjut Draf Konten',
        'Asisten Redaksi Polaris'
      );
    }
  }

  private async publishDraftPublicationFromClient(
    tenantId: string,
    tenantName: string,
    publicationId: string,
    phoneE164: string
  ): Promise<void> {
    const [pub] = await db
      .select()
      .from(contentPublications)
      .where(and(eq(contentPublications.id, publicationId), eq(contentPublications.tenantId, tenantId)))
      .limit(1);

    if (!pub) {
      await this.waClient.sendTextMessage(phoneE164, 'Draf konten tidak ditemukan.');
      return;
    }

    if (pub.status === 'PUBLISHED') {
      await this.waClient.sendTextMessage(
        phoneE164,
        `Konten "${pub.title}" sudah berstatus resmi tayang sebelumnya.`
      );
      return;
    }

    const now = new Date();
    await withTenantContext(tenantId, async (tx) => {
      await tx
        .update(contentPublications)
        .set({
          status: 'PUBLISHED',
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(contentPublications.id, pub.id));

      const [brief] = await tx
        .select()
        .from(contentBriefs)
        .where(and(eq(contentBriefs.linkedPublicationId, pub.id), eq(contentBriefs.tenantId, tenantId)))
        .limit(1);

      if (brief) {
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

        if (brief.assignedOperatorId) {
          await this.redisService.emitUserNotification(brief.assignedOperatorId, {
            id: `pub_up_${Date.now()}`,
            title: `🚀 Draf Diterbitkan Klien — #${brief.briefCode}`,
            message: `${tenantName} telah menyetujui dan menerbitkan draf "${pub.title}" via WhatsApp.`,
            category: 'ARTICLE',
            link: '/operator/workspace',
          });
        }
      }
    });

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      [
        `🎉 *KONTEN RESMI TAYANG DI PORTAL PUBLIK!*`,
        '',
        `Bapak/Ibu *${tenantName}*, draf artikel Anda telah resmi dipublikasikan secara live:`,
        `📰 *${pub.title}*`,
        `🔗 *Tautan Berita:* ${pub.canonicalUrl}`,
        '',
        'Tim Redaksi mengucapkan selamat! Paket konten siap sebar (poster & caption) dapat diambil kapan saja melalui menu arsip.',
      ].join('\n'),
      [
        { id: `PUB_DETAIL:${pub.id}`, title: '📦 Ambil Teks & Poster' },
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Konten Baru' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Publikasi Berhasil',
      'Portal Berita Resmi Polaris'
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
            targetWindow: getTimeHorizonInfo('NORMAL').target,
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
      await tx
        .insert(contentBriefMessages)
        .values({
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
        })
        .onConflictDoNothing();

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
      'hal',
      'halp',
      'hlp',
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
      'permisi',
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
    const pendingReviewBrief = await this.helper.findBriefReadyForReview(tenantId);

    const activeTicketLines = pendingReviewBrief
      ? [
        '',
        `📌 *Tiket Menunggu Tinjauan Anda:*`,
        `• *#${pendingReviewBrief.briefCode}* (Sisa revisi: *${Math.max(0, pendingReviewBrief.revisionLimit - pendingReviewBrief.revisionUsed)}/${pendingReviewBrief.revisionLimit}*)`,
      ]
      : [];

    const body = [
      `Halo Bapak/Ibu *${tenantName}*, selamat datang di *Asisten Redaksi Polaris*.`,
      '',
      `📊 Sisa Jatah Request Minggu Ini: *${quota.weeklyRemaining} dari ${quota.weeklyLimit} request*`,
      ...activeTicketLines,
      '',
      'Silakan tekan tombol *📋 Pilih Layanan* di bawah ini (atau langsung kirimkan foto kegiatan, dokumen, & catatan topik Anda):',
    ].join('\n');

    const serviceRows = [
      ...(pendingReviewBrief && pendingReviewBrief.revisionUsed < pendingReviewBrief.revisionLimit
        ? [
          {
            id: `REV_START:${pendingReviewBrief.id}`,
            title: `✏️ Revisi #${pendingReviewBrief.briefCode.slice(-4)}`,
            description: `Ajukan perbaikan untuk tiket #${pendingReviewBrief.briefCode} yang sedang ditinjau`,
          },
          {
            id: `REV_APPROVE:${pendingReviewBrief.id}`,
            title: `✅ Setujui #${pendingReviewBrief.briefCode.slice(-4)}`,
            description: `Setujui & tayangkan konten pada tiket #${pendingReviewBrief.briefCode}`,
          },
        ]
        : []),
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
      {
        id: 'MENU_BUY_QUOTA',
        title: '💳 Beli / Top-Up Kuota',
        description: 'Tambah kuota request & perpanjang masa aktif lisensi kapan saja',
      },
    ];

    await this.waClient.sendInteractiveList(
      phoneE164,
      body,
      '📋 Pilih Layanan',
      [
        {
          title: 'Layanan Konten & Redaksi',
          rows: serviceRows,
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
      'Pilih menu tanpa menghilangkan proses yang berjalan'
    );
  }

  private async checkAndSendLowQuotaAlert(
    tenant: { id: string; fullName: string },
    phoneE164: string,
    walletAfter: { remainingQuota: number; totalQuotaAllocated: number; currentPeriodEnd: Date | string | null; isExpired?: boolean }
  ): Promise<void> {
    if (walletAfter.remainingQuota <= 2 && !walletAfter.isExpired) {
      const dateFormatted = walletAfter.currentPeriodEnd
        ? new Date(walletAfter.currentPeriodEnd).toLocaleDateString('id-ID')
        : '-';

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        [
          `⚠️ *Pengingat Saldo Kuota Menipis*`,
          ``,
          `Bapak/Ibu *${tenant.fullName}*, saldo kuota request Anda tersisa *${walletAfter.remainingQuota} tiket* lagi.`,
          `Masa aktif paket berjalan s.d. *${dateFormatted}*.`,
          ``,
          `Agar pengajuan liputan atau materi aspirasi berikutnya tidak terputus, Anda dapat menambah kuota sekarang. Saldo baru akan diakumulasikan dan masa aktif diperpanjang otomatis.`,
        ].join('\n'),
        [
          { id: 'MENU_BUY_QUOTA', title: '💳 Beli Kuota Paket' },
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Nanti Saja' },
        ],
        'Peringatan Sisa Kuota',
        'Asisten Redaksi Polaris'
      );
    }
  }
}

    