import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { db, eq, and, desc, tenantMembers, subscriptionPriceMatrices, subscriptions } from '@polaris/database';
import { RedisService } from '../../redis/redis.service.js';
import { WhatsAppCloudClient } from '../whatsapp-cloud.client.js';
import { BillingService } from '../../billing/billing.service.js';
import { QuotaWalletService } from '../../billing/quota-wallet.service.js';
import { normalizeIndonesianPhone } from '../contact-sanitizer.util.js';

export interface BuyPackageItem {
  matrixId: string;
  planTier: string;
  billingCycle: string;
  durationDays: number;
  quotaRequests: number;
  amountIdr: number;
  buttonTitle: string;
}

export interface BuyIntentSession {
  state: 'AWAITING_PACKAGE_CHOICE';
  tenantId: string;
  packages: BuyPackageItem[];
  createdAt: number;
}

export interface PaymentSettledPayload {
  tenantId: string;
  invoiceNumber: string;
  amountIdr: string;
  allocatedQuota: number;
  newPeriodEnd: string;
}

@Injectable()
export class WhatsAppBillingOrderService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppBillingOrderService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly waClient: WhatsAppCloudClient,
    private readonly billingService: BillingService,
    private readonly quotaWalletService: QuotaWalletService
  ) {}

  onModuleInit() {
    // Berlangganan event payment_settled dari Redis untuk push notifikasi WA otomatis
    this.redisService.subscribe('billing:payment_settled', async (data: PaymentSettledPayload) => {
      try {
        await this.handlePaymentSettledNotification(data);
      } catch (err: any) {
        this.logger.error(
          `[WhatsAppBillingOrder] Gagal mengirim notifikasi pelunasan invoice ${data?.invoiceNumber}: ${err.message}`,
          err.stack
        );
      }
    });
  }

  /**
   * Mengambil katalog paket resmi yang aktif untuk tingkat yurisdiksi dewan tertentu.
   */
  public async getAvailablePackages(tenantId: string): Promise<BuyPackageItem[]> {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        legislativeLevel: tenantMembers.legislativeLevel,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) return [];

    const [sub] = await db
      .select({ planTier: subscriptions.planTier })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const activeTier = sub?.planTier || 'PRO';

    let matrices = await db
      .select()
      .from(subscriptionPriceMatrices)
      .where(
        and(
          eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
          eq(subscriptionPriceMatrices.planTier, activeTier),
          eq(subscriptionPriceMatrices.isActive, true)
        )
      )
      .orderBy(subscriptionPriceMatrices.durationDays);

    if (matrices.length === 0) {
      matrices = await db
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
            eq(subscriptionPriceMatrices.isActive, true)
          )
        )
        .orderBy(subscriptionPriceMatrices.durationDays);
    }

    // Pastikan hanya 1 paket per durasi siklus (30 hari, 180 hari, 365 hari) agar tidak ada redundansi
    const uniqueByDuration = new Map<number, (typeof matrices)[0]>();
    for (const m of matrices) {
      if (!uniqueByDuration.has(m.durationDays)) {
        uniqueByDuration.set(m.durationDays, m);
      }
    }

    const distinctMatrices = Array.from(uniqueByDuration.values()).slice(0, 3);

    return distinctMatrices.map((m) => {
      let buttonTitle = '1 Bulan (+12)';
      if (m.durationDays >= 365) {
        buttonTitle = `1 Tahun (+${m.quotaRequests || 144})`;
      } else if (m.durationDays >= 180) {
        buttonTitle = `6 Bulan (+${m.quotaRequests || 72})`;
      } else {
        buttonTitle = `1 Bulan (+${m.quotaRequests || 12})`;
      }

      return {
        matrixId: m.id,
        planTier: m.planTier,
        billingCycle: m.billingCycle,
        durationDays: m.durationDays,
        quotaRequests: m.quotaRequests ?? (m.durationDays >= 365 ? 144 : m.durationDays >= 180 ? 72 : 12),
        amountIdr: Number(m.amountIdr),
        buttonTitle,
      };
    });
  }

  /**
   * Menampilkan katalog pilihan paket pembelian kuota di WhatsApp.
   */
  public async presentPackageCatalog(
    tenant: { id: string; fullName: string },
    phoneE164: string
  ): Promise<void> {
    const wallet = await this.quotaWalletService.getTenantQuotaWallet(tenant.id);
    const packages = await this.getAvailablePackages(tenant.id);

    if (!packages || packages.length === 0) {
      await this.waClient.sendTextMessage(
        phoneE164,
        `Halo Bapak/Ibu *${tenant.fullName}*, mohon maaf katalog paket lisensi untuk yurisdiksi Anda sedang dalam penyesuaian oleh Superadmin. Silakan hubungi admin redaksi kami.`
      );
      return;
    }

    // Simpan intent pembelian di Redis selama 15 menit (900 detik)
    const sessionKey = `whatsapp:buy_intent:${tenant.id}`;
    const sessionData: BuyIntentSession = {
      state: 'AWAITING_PACKAGE_CHOICE',
      tenantId: tenant.id,
      packages,
      createdAt: Date.now(),
    };
    await this.redisService.set(sessionKey, sessionData, 900);

    const formatIdr = (val: number) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(val);

    const packageLines = packages.map((pkg, idx) => {
      const cycleName =
        pkg.durationDays >= 365
          ? '1 Tahun Penuh (365 Hari)'
          : pkg.durationDays >= 180
          ? '1 Semester (180 Hari) — Terpopuler ⭐'
          : '1 Bulan (30 Hari)';
      return [
        `*${idx + 1}️⃣ Paket ${cycleName}*`,
        `   • Alokasi: *+${pkg.quotaRequests} Tiket Request*`,
        `   • Tarif Resmi: *${formatIdr(pkg.amountIdr)}*`,
      ].join('\n');
    });

    const bodyText = [
      `🤖 *KATALOG PAKET LISENSI & KUOTA POLARIS*`,
      `────────────────────────`,
      `Yth. Bapak/Ibu *${tenant.fullName}*`,
      ``,
      `📊 *Status Kuota Saat Ini:*`,
      `• Saldo Kuota: *${wallet.remainingQuota} dari ${wallet.totalQuotaAllocated} Request*`,
      `• Masa Aktif: *${wallet.currentPeriodEnd ? new Date(wallet.currentPeriodEnd).toLocaleDateString('id-ID') : 'Belum aktif'}*`,
      ``,
      `💡 *Info Akumulasi:* Kuota baru akan langsung ditambahkan ke saldo berjalan dan masa aktif diperpanjang tanpa ada kuota yang hangus.`,
      ``,
      `Pilihan Paket Resmi:`,
      packageLines.join('\n\n'),
      ``,
      `Tekan tombol pilihan paket di bawah, atau ketik angka (*1* / *2* / *3*) untuk memilih. Ketik *BATAL* untuk menutup menu.`,
    ].join('\n');

    const buttons = packages.slice(0, 3).map((pkg) => ({
      id: `BUY_PKG:${pkg.matrixId}`,
      title: pkg.buttonTitle.slice(0, 20),
    }));

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      bodyText,
      buttons,
      'Beli / Top-Up Kuota',
      'Asisten Redaksi Polaris'
    );
  }

  /**
   * Memproses pemilihan paket oleh dewan (baik via tombol interaktif maupun ketikan angka 1/2/3).
   */
  public async handlePackageSelection(
    tenant: { id: string; fullName: string; email?: string; phoneNumber?: string },
    phoneE164: string,
    choiceInput: string
  ): Promise<boolean> {
    const sessionKey = `whatsapp:buy_intent:${tenant.id}`;
    const session = await this.redisService.get<BuyIntentSession>(sessionKey);

    if (!session || session.state !== 'AWAITING_PACKAGE_CHOICE' || !session.packages) {
      return false;
    }

    let selectedPackage: BuyPackageItem | undefined;

    if (choiceInput.startsWith('BUY_PKG:')) {
      const matrixId = choiceInput.replace('BUY_PKG:', '').trim();
      selectedPackage = session.packages.find((p) => p.matrixId === matrixId);
    } else {
      const trimmed = choiceInput.trim();
      if (/^[1-9]$/.test(trimmed)) {
        const idx = parseInt(trimmed, 10) - 1;
        selectedPackage = session.packages[idx];
      }
    }

    if (!selectedPackage) {
      return false;
    }

    // Bersihkan sesi intent pembelian karena paket sudah valid dipilih
    await this.redisService.del(sessionKey);

    try {
      const checkoutRes = await this.billingService.createSubscriptionCheckout(tenant.id, {
        matrixId: selectedPackage.matrixId,
        planTier: selectedPackage.planTier as any,
        billingCycle: selectedPackage.billingCycle as any,
      });

      const formatIdr = (val: number) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(val);

      const cycleName =
        selectedPackage.durationDays >= 365
          ? '1 Tahun Penuh'
          : selectedPackage.durationDays >= 180
          ? '1 Semester (6 Bulan)'
          : '1 Bulan';

      const responseText = [
        `🧾 *TAGIHAN PEMBELIAN PAKET POLARIS TERBIT*`,
        `────────────────────────`,
        `Yth. Bapak/Ibu *${tenant.fullName}*,`,
        ``,
        `Rincian Pesanan:`,
        `• Paket: *PRO ${cycleName}*`,
        `• Tambahan Kuota: *+${selectedPackage.quotaRequests} Tiket Request*`,
        `• Durasi Masa Aktif: *+${selectedPackage.durationDays} Hari*`,
        `• Total Tagihan: *${formatIdr(checkoutRes.amountIdr)}*`,
        `• Nomor Invoice: *${checkoutRes.invoiceNumber}*`,
        ``,
        `Silakan selesaikan pembayaran aman melalui tautan Midtrans Snap berikut:`,
        `👉 ${checkoutRes.redirectUrl}`,
        ``,
        `💳 *Metode Pembayaran Tersedia:*`,
        `• QRIS (BCA, Mandiri, GoPay, OVO — scan langsung dari HP)`,
        `• Virtual Account Bank Dinas (BCA, Mandiri, BNI, BRI, Permata)`,
        `• Kartu Kredit / Debit Dinas Resmi`,
        ``,
        `⏱️ *Aktivasi Otomatis:* Begitu pembayaran berhasil, kuota *+${selectedPackage.quotaRequests} tiket* langsung aktif dan bertambah ke saldo Anda dalam 5 detik!`,
      ].join('\n');

      await this.waClient.sendInteractiveButtons(
        phoneE164,
        responseText,
        [
          { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
          { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
        ],
        'Invoice Resmi Midtrans',
        'Asisten Redaksi Polaris'
      );

      return true;
    } catch (err: any) {
      this.logger.error(
        `[WhatsAppBillingOrder] Gagal menerbitkan tagihan Midtrans untuk ${tenant.fullName}: ${err.message}`,
        err.stack
      );

      await this.waClient.sendTextMessage(
        phoneE164,
        `Mohon maaf Bapak/Ibu *${tenant.fullName}*, terjadi kendala saat menerbitkan tagihan pembayaran: ${err.message}. Silakan coba beberapa saat lagi atau hubungi admin redaksi kami.`
      );
      return true;
    }
  }

  /**
   * Menangani pembatalan sesi pembelian kuota di WhatsApp.
   */
  public async handleCancelBuy(tenantId: string, phoneE164: string): Promise<void> {
    await this.redisService.del(`whatsapp:buy_intent:${tenantId}`);
    await this.waClient.sendInteractiveButtons(
      phoneE164,
      '✅ Pembelian kuota telah dibatalkan. Saldo kuota dan layanan Anda tetap aman berjalan normal. Silakan pilih menu layanan:',
      [
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
        { id: 'MENU_CHECK_STATUS', title: '📊 Cek Kuota' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Batal Pembelian',
      'Asisten Redaksi Polaris'
    );
  }

  /**
   * Mengirim notifikasi sukses pembayaran via WhatsApp saat webhook Midtrans lunas (Settlement).
   */
  private async handlePaymentSettledNotification(data: PaymentSettledPayload): Promise<void> {
    if (!data?.tenantId) return;

    const [member] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, data.tenantId))
      .limit(1);

    if (!member || !member.phoneNumber) return;

    const phoneE164 = normalizeIndonesianPhone(member.phoneNumber);
    if (!phoneE164) return;

    const wallet = await this.quotaWalletService.getTenantQuotaWallet(member.id);

    const formatIdr = (val: string | number) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(Number(val));

    const dateFormatted = data.newPeriodEnd
      ? new Date(data.newPeriodEnd).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';

    const message = [
      `🎉 *PEMBAYARAN RESMI BERHASIL DIKONFIRMASI!*`,
      `────────────────────────`,
      `Terima kasih, Bapak/Ibu *${member.fullName}*.`,
      `Pembayaran invoice *${data.invoiceNumber}* sebesar *${formatIdr(data.amountIdr)}* telah kami terima secara sah.`,
      ``,
      `✅ *Paket Kuota Berhasil Diaktifkan:*`,
      `• Kuota Tambahan: *+${data.allocatedQuota} Tiket Request*`,
      `• Total Saldo Kuota Terkini: *${wallet.remainingQuota} Tiket Request*`,
      `• Masa Aktif Diperpanjang s.d.: *${dateFormatted}*`,
      ``,
      `Bapak/Ibu sudah bisa langsung mengirimkan bahan atau topik liputan terbaru sekarang. Selamat berkarya kembali untuk masyarakat! 🚀`,
    ].join('\n');

    await this.waClient.sendInteractiveButtons(
      phoneE164,
      message,
      [
        { id: 'MENU_NEW_BRIEF', title: '📝 Request Baru' },
        { id: 'MENU_CHECK_STATUS', title: '📊 Cek Status' },
        { id: 'MENU_OPEN_MAIN', title: '📋 Menu Utama' },
      ],
      'Konfirmasi Pembayaran Lunas',
      'Asisten Redaksi Polaris'
    );

    this.logger.log(
      `[WhatsAppBillingOrder] Notifikasi WhatsApp pelunasan invoice ${data.invoiceNumber} berhasil dikirim ke ${phoneE164} (${member.fullName})`
    );
  }
}

