import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { normalizeIndonesianPhone } from './contact-sanitizer.util.js';

export interface WhatsAppReplyButton {
  id: string;
  title: string; // Maksimal 20 karakter sesuai spesifikasi resmi Meta Cloud API
}

export interface WhatsAppListRow {
  id: string;
  title: string; // Maksimal 24 karakter sesuai spesifikasi resmi Meta Cloud API
  description?: string; // Maksimal 72 karakter
}

export interface WhatsAppListSection {
  title: string; // Maksimal 24 karakter
  rows: WhatsAppListRow[];
}

export interface DownloadedWhatsAppMedia {
  r2StorageUrl: string;
  cdnPublicUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  fileName: string;
}

@Injectable()
export class WhatsAppCloudClient {
  private readonly logger = new Logger(WhatsAppCloudClient.name);
  private readonly storageAdapter = new CloudflareR2StorageAdapter();

  private get apiVersion(): string {
    return (process.env.WHATSAPP_API_VERSION || 'v25.0').trim();
  }

  private get phoneNumberId(): string {
    return (process.env.WHATSAPP_PHONE_NUMBER_ID || '1495802246941473').trim();
  }

  private get accessToken(): string {
    return (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  }

  private get appSecret(): string {
    return (process.env.WHATSAPP_APP_SECRET || '').trim();
  }

  public isConfigured(): boolean {
    return Boolean(this.phoneNumberId && this.accessToken);
  }

  /**
   * Memverifikasi signature HMAC-SHA256 pada header X-Hub-Signature-256 dari Meta
   * jika WHATSAPP_APP_SECRET dikonfigurasi di environment.
   */
  public verifyWebhookSignature(rawBody: string | undefined, signatureHeader: string | undefined): boolean {
    if (!this.appSecret) {
      // Jika WHATSAPP_APP_SECRET belum disetel, izinkan lewat namun catat peringatan
      return true;
    }
    if (!rawBody || !signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }
    const expectedHash = crypto
      .createHmac('sha256', this.appSecret)
      .update(rawBody, 'utf8')
      .digest('hex');
    const expectedSignature = `sha256=${expectedHash}`;
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Mengirim pesan teks standar ke nomor WhatsApp tujuan (dalam 24-hour service window).
   */
  public async sendTextMessage(
    toPhoneRaw: string,
    bodyText: string
  ): Promise<{ messageId?: string; delivered: boolean }> {
    const toPhone = normalizeIndonesianPhone(toPhoneRaw);
    if (!toPhone || !this.isConfigured()) {
      this.logger.warn(
        `[WhatsAppCloudClient] Melewati pengiriman pesan teks ke ${toPhone} karena kredensial belum lengkap.`
      );
      return { delivered: false };
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: bodyText.slice(0, 4096),
      },
    };

    return await this.dispatchGraphMessage(endpoint, payload);
  }

  /**
   * Mengirim pesan Interactive Reply Buttons (maksimal 3 tombol, judul maks 20 karakter).
   */
  public async sendInteractiveButtons(
    toPhoneRaw: string,
    bodyText: string,
    buttons: WhatsAppReplyButton[],
    headerText?: string,
    footerText?: string
  ): Promise<{ messageId?: string; delivered: boolean }> {
    const toPhone = normalizeIndonesianPhone(toPhoneRaw);
    if (!toPhone || !this.isConfigured()) {
      this.logger.warn(
        `[WhatsAppCloudClient] Melewati pengiriman interactive buttons ke ${toPhone} karena kredensial belum lengkap.`
      );
      return { delivered: false };
    }

    const safeButtons = buttons.slice(0, 3).map((btn) => ({
      type: 'reply',
      reply: {
        id: btn.id.slice(0, 256),
        title: btn.title.slice(0, 20),
      },
    }));

    const interactiveObj: Record<string, unknown> = {
      type: 'button',
      body: {
        text: bodyText.slice(0, 1024),
      },
      action: {
        buttons: safeButtons,
      },
    };

    if (headerText && headerText.trim()) {
      interactiveObj.header = {
        type: 'text',
        text: headerText.trim().slice(0, 60),
      };
    }

    if (footerText && footerText.trim()) {
      interactiveObj.footer = {
        text: footerText.trim().slice(0, 60),
      };
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'interactive',
      interactive: interactiveObj,
    };

    return await this.dispatchGraphMessage(endpoint, payload);
  }

  /**
   * Mengirim pesan Interactive List Drawer (Menu Geser Bawah asli WhatsApp hingga 10 pilihan).
   * User cukup tap tombol pembuka menu, lalu memilih item tanpa perlu mengetik perintah apa pun.
   */
  public async sendInteractiveList(
    toPhoneRaw: string,
    bodyText: string,
    buttonLabel: string,
    sections: WhatsAppListSection[],
    headerText?: string,
    footerText?: string
  ): Promise<{ messageId?: string; delivered: boolean }> {
    const toPhone = normalizeIndonesianPhone(toPhoneRaw);
    if (!toPhone || !this.isConfigured()) {
      this.logger.warn(
        `[WhatsAppCloudClient] Melewati pengiriman interactive list ke ${toPhone} karena kredensial belum lengkap.`
      );
      return { delivered: false };
    }

    const safeSections = sections.slice(0, 10).map((sec) => ({
      title: sec.title.slice(0, 24),
      rows: sec.rows.slice(0, 10).map((row) => ({
        id: row.id.slice(0, 200),
        title: row.title.slice(0, 24),
        ...(row.description ? { description: row.description.slice(0, 72) } : {}),
      })),
    }));

    const interactiveObj: Record<string, unknown> = {
      type: 'list',
      body: {
        text: bodyText.slice(0, 1024),
      },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: safeSections,
      },
    };

    if (headerText && headerText.trim()) {
      interactiveObj.header = {
        type: 'text',
        text: headerText.trim().slice(0, 60),
      };
    }

    if (footerText && footerText.trim()) {
      interactiveObj.footer = {
        text: footerText.trim().slice(0, 60),
      };
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'interactive',
      interactive: interactiveObj,
    };

    return await this.dispatchGraphMessage(endpoint, payload);
  }

  /**
   * Mengirim gambar poster disertai caption ke nomor WhatsApp tujuan.
   * Mengonversi format .webp ke JPEG standar secara otomatis agar sesuai dengan spesifikasi Meta Cloud API.
   */
  public async sendImageMessage(
    toPhoneRaw: string,
    imageUrl: string,
    captionText?: string
  ): Promise<{ messageId?: string; delivered: boolean }> {
    const toPhone = normalizeIndonesianPhone(toPhoneRaw);
    if (!toPhone || !this.isConfigured() || !imageUrl) {
      return { delivered: false };
    }

    let targetImageUrl = imageUrl.trim();

    // Validasi protokol URL (Meta Cloud API menolak data URI)
    if (!targetImageUrl.startsWith('http://') && !targetImageUrl.startsWith('https://')) {
      this.logger.warn(
        `[WhatsAppCloudClient] Melewati pengiriman gambar karena URL bukan HTTP(S): ${targetImageUrl.slice(0, 50)}`
      );
      return { delivered: false };
    }

    // Meta Cloud API hanya mendukung MIME image/jpeg dan image/png untuk pesan gambar.
    // Jika gambar di-host di Cloudinary, terapkan transformasi dinamis f_jpg,q_auto agar disajikan sebagai JPEG asli.
    if (targetImageUrl.includes('res.cloudinary.com')) {
      targetImageUrl = targetImageUrl.replace(/\.webp($|\?)/i, '.jpg$1');
      if (!targetImageUrl.includes('/f_jpg') && targetImageUrl.includes('/upload/')) {
        targetImageUrl = targetImageUrl.replace('/upload/', '/upload/f_jpg,q_auto/');
      }
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'image',
      image: {
        link: targetImageUrl,
        ...(captionText ? { caption: captionText.slice(0, 1024) } : {}),
      },
    };

    return await this.dispatchGraphMessage(endpoint, payload);
  }

  /**
   * Mengunduh file media (Gambar / Dokumen PDF/Word) dari server Meta Graph API
   * dan menyimpannya secara permanen ke Cloudflare R2 (atau fallback penyimpanan lokal).
   */
  public async downloadMediaToR2(
    mediaId: string,
    tenantId: string,
    fallbackMimeType = 'application/octet-stream',
    originalFileName?: string
  ): Promise<DownloadedWhatsAppMedia> {
    if (!this.accessToken) {
      throw new Error('WHATSAPP_ACCESS_TOKEN belum dikonfigurasi untuk mengunduh media.');
    }

    // 1. Ambil metadata URL unduhan sementara dari Graph API
    const metaEndpoint = `https://graph.facebook.com/${this.apiVersion}/${encodeURIComponent(mediaId)}`;
    const metaRes = await fetch(metaEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!metaRes.ok) {
      const errText = await metaRes.text();
      throw new Error(`Gagal mengambil metadata media WhatsApp (${metaRes.status}): ${errText}`);
    }

    const metaData = (await metaRes.json()) as {
      url?: string;
      mime_type?: string;
      file_size?: number;
    };

    if (!metaData.url) {
      throw new Error(`Meta Graph API tidak mengembalikan download URL untuk mediaId ${mediaId}`);
    }

    // 2. Unduh binary file dari URL sementara Meta
    const binaryRes = await fetch(metaData.url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!binaryRes.ok) {
      throw new Error(`Gagal mengunduh binary media WhatsApp (${binaryRes.status})`);
    }

    const arrayBuffer = await binaryRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = metaData.mime_type || fallbackMimeType;
    const ext = this.resolveExtensionFromMime(mimeType, originalFileName);
    const safeBaseName = originalFileName
      ? originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^/.]+$/, '')
      : `wa_${mediaId.slice(-10)}`;
    const finalFileName = `${safeBaseName}.${ext}`;
    const destinationPath = `tenants/${tenantId}/wa-briefs/${Date.now()}_${finalFileName}`;

    // 3. Unggah secara permanen ke Cloudflare R2 / Storage Adapter
    const uploaded = await this.storageAdapter.uploadBuffer(buffer, {
      destinationPath,
      contentType: mimeType,
      contentLength: buffer.length,
    });

    return {
      r2StorageUrl: destinationPath,
      cdnPublicUrl: uploaded.publicUrl,
      mimeType,
      fileSizeBytes: buffer.length,
      fileName: finalFileName,
    };
  }

  private resolveExtensionFromMime(mimeType: string, originalFileName?: string): string {
    if (originalFileName && originalFileName.includes('.')) {
      const ext = originalFileName.split('.').pop()?.toLowerCase();
      if (ext && ext.length <= 5) return ext;
    }
    const lower = mimeType.toLowerCase();
    if (lower.includes('jpeg') || lower.includes('jpg')) return 'jpg';
    if (lower.includes('png')) return 'png';
    if (lower.includes('webp')) return 'webp';
    if (lower.includes('pdf')) return 'pdf';
    if (lower.includes('wordprocessingml') || lower.includes('msword')) return 'docx';
    if (lower.includes('plain')) return 'txt';
    return 'bin';
  }

  private async dispatchGraphMessage(
    endpoint: string,
    payload: Record<string, unknown>
  ): Promise<{ messageId?: string; delivered: boolean }> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = (await response.json()) as {
        messages?: Array<{ id?: string }>;
        error?: { message?: string; code?: number };
      };

      if (!response.ok) {
        this.logger.error(
          `[WhatsAppCloudClient] Gagal mengirim pesan ke Graph API (${response.status}): ${JSON.stringify(
            responseData.error || responseData
          )}`
        );
        return { delivered: false };
      }

      const messageId = responseData.messages?.[0]?.id;
      return {
        messageId,
        delivered: true,
      };
    } catch (error) {
      this.logger.error(
        `[WhatsAppCloudClient] Eksepsi jaringan saat memanggil Graph API: ${(error as Error).message}`
      );
      return { delivered: false };
    }
  }
}

