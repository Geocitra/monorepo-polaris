import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  subscriptions,
  electoralDistricts,
  portalConfigs,
  portalThemeSettings,
  subscriptionPriceMatrices,
  invoiceTransactions,
  tenantQuotaLedgers,
  licenseInquiries,
  withTenantContext,
} from '@polaris/database';
import {
  SubscriptionStatus,
  PlanTier,
  PaymentStatus,
  InquiryStatus,
} from '@polaris/shared-types';
import { MidtransPaymentAdapter } from '@polaris/payment';
import {
  VerifyTenantDto,
  UpdateTenantStatusDto,
  ManualLicenseGrantDto,
  AdminCreateTenantDto,
  AdminUpdateLegislativeLevelDto,
  AdminResetTenantPasswordDto,
} from '../dto/superadmin.dto.js';

@Injectable()
export class SuperadminTenantService {
  private readonly logger = new Logger(SuperadminTenantService.name);

  /**
   * Helper: Generate kata sandi acak kuat dengan entropi tinggi
   */
  private generateSecureTempPassword(): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = '';
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 0; i < 6; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * List all registered dewan/tenants with subscription & portal info
   */
  async getTenants(search?: string, party?: string) {
    const query = db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        username: tenantMembers.username,
        mustChangePassword: tenantMembers.mustChangePassword,
        temporaryPasswordPlaintextPreview: tenantMembers.temporaryPasswordPlaintextPreview,
        passwordChangedAt: tenantMembers.passwordChangedAt,
        phoneNumber: tenantMembers.phoneNumber,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        isVerified: tenantMembers.isVerified,
        accountStatus: tenantMembers.accountStatus,
        internalNotes: tenantMembers.internalNotes,
        createdAt: tenantMembers.createdAt,
        subscriptionStatus: subscriptions.status,
        planTier: subscriptions.planTier,
        periodEnd: subscriptions.currentPeriodEnd,
        dapilName: electoralDistricts.dapilName,
        provinceName: electoralDistricts.provinceName,
        commissionId: tenantMembers.commissionId,
        commissionName: tenantMembers.commissionName,
      })
      .from(tenantMembers)
      .leftJoin(subscriptions, eq(subscriptions.tenantId, tenantMembers.id))
      .leftJoin(electoralDistricts, eq(electoralDistricts.id, tenantMembers.electoralDistrictId))
      .orderBy(desc(tenantMembers.createdAt));

    const rows = await query;
    const withPortals = [];
    for (const row of rows) {
      const [portal] = await withTenantContext(row.id, (tx) =>
        tx
          .select({
            subdomainSlug: portalConfigs.subdomainSlug,
            customDomain: portalConfigs.customDomain,
          })
          .from(portalConfigs)
          .where(eq(portalConfigs.tenantId, row.id))
          .limit(1)
      );
      withPortals.push({
        ...row,
        subdomainSlug: portal?.subdomainSlug ?? null,
        customDomain: portal?.customDomain ?? null,
      });
    }

    // Filter in-memory if query params provided
    let filtered = withPortals;
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.subdomainSlug?.toLowerCase().includes(s)
      );
    }
    if (party && party !== 'ALL') {
      filtered = filtered.filter((r) => r.partyAffiliation?.toLowerCase() === party.toLowerCase());
    }

    return filtered;
  }

  /**
   * 1-Click Verification Toggle for Tenant
   */
  async verifyTenant(tenantId: string, dto: VerifyTenantDto) {
    const [updated] = await db
      .update(tenantMembers)
      .set({ isVerified: dto.isVerified, updatedAt: new Date() })
      .where(eq(tenantMembers.id, tenantId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Anggota dewan tidak ditemukan.');
    }

    return {
      message: dto.isVerified ? 'Akun dewan berhasil diverifikasi resmi.' : 'Status verifikasi dicabut.',
      tenant: updated,
    };
  }

  /**
   * Update Tenant Account Status (e.g. SUSPENDED or ACTIVE)
   */
  async updateTenantStatus(tenantId: string, dto: UpdateTenantStatusDto) {
    const [updated] = await db
      .update(tenantMembers)
      .set({
        accountStatus: dto.status,
        internalNotes: dto.internalNotes !== undefined ? dto.internalNotes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(tenantMembers.id, tenantId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Anggota dewan tidak ditemukan.');
    }

    return {
      message: `Status akun berhasil diubah menjadi ${dto.status}.`,
      tenant: updated,
    };
  }

  /**
   * Manual License Bypass / Grant for B2B Parlemen (SPK / Invoice Kas Daerah)
   */
  async grantManualLicense(tenantId: string, dto: ManualLicenseGrantDto) {
    const [member] = await db
      .select({ id: tenantMembers.id, fullName: tenantMembers.fullName })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Anggota dewan tidak ditemukan.');
    }

    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const now = new Date();
    let newStart = now;
    let newEnd = new Date(now.getTime() + dto.additionalDays * 24 * 60 * 60 * 1000);

    // If subscription is already active and period end is in the future, accumulate time!
    if (existingSub && existingSub.currentPeriodEnd && new Date(existingSub.currentPeriodEnd) > now) {
      newStart = new Date(existingSub.currentPeriodStart || now);
      newEnd = new Date(new Date(existingSub.currentPeriodEnd).getTime() + dto.additionalDays * 24 * 60 * 60 * 1000);
    }

    let subId: string;
    if (existingSub) {
      subId = existingSub.id;
      await db
        .update(subscriptions)
        .set({
          status: SubscriptionStatus.ACTIVE,
          planTier: dto.planTier || existingSub.planTier || PlanTier.PRO,
          currentPeriodStart: newStart,
          currentPeriodEnd: newEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existingSub.id));
    } else {
      const [insertedSub] = await db
        .insert(subscriptions)
        .values({
          tenantId,
          status: SubscriptionStatus.ACTIVE,
          planTier: dto.planTier || PlanTier.PRO,
          currentPeriodStart: newStart,
          currentPeriodEnd: newEnd,
        })
        .returning();
      subId = insertedSub.id;
    }

    // Log manual offline settlement invoice
    const invNumber = `INV-SPK-${Date.now().toString().slice(-6)}`;
    await db.insert(invoiceTransactions).values({
      subscriptionId: subId,
      invoiceNumber: invNumber,
      amountIdr: '0.00',
      gatewayOrderId: `MANUAL-${Date.now()}`,
      paymentMethod: 'OFFLINE_SPK_B2B',
      paymentStatus: PaymentStatus.SETTLEMENT,
      paidAt: now,
    });

    return {
      message: `Lisensi berhasil diaktifkan/ditambahkan (+${dto.additionalDays} hari) s.d. ${newEnd.toLocaleDateString('id-ID')}.`,
      validUntil: newEnd,
    };
  }

  /**
   * Membuat akun anggota dewan baru oleh Admin dengan generator kredensial aman
   * Mendukung opsi bayar di muka via Midtrans (Prepaid Order) atau bayar mandiri di dashboard.
   */
  async createTenantWithCredentials(dto: AdminCreateTenantDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // 1. Sanitasi Custom Domain jika ada
    let cleanCustomDomain: string | null = null;
    if (dto.customDomain && dto.customDomain.trim()) {
      cleanCustomDomain = dto.customDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');

      const [existingCustom] = await db
        .select({ id: portalConfigs.id })
        .from(portalConfigs)
        .where(eq(portalConfigs.customDomain, cleanCustomDomain))
        .limit(1);

      if (existingCustom) {
        throw new ConflictException(`Custom domain '${cleanCustomDomain}' sudah digunakan oleh portal lain.`);
      }
    }

    // 2. Sanitasi & Auto-generate Subdomain Slug (Toleran terhadap '-', string kosong, dll)
    let cleanSlug = (dto.subdomainSlug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug || cleanSlug.length < 3) {
      if (cleanCustomDomain) {
        cleanSlug = cleanCustomDomain.split('.')[0].replace(/[^a-z0-9]/g, '');
      }
      if (!cleanSlug || cleanSlug.length < 3) {
        cleanSlug = dto.fullName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 30);
      }
      if (!cleanSlug || cleanSlug.length < 3) {
        cleanSlug = `portal-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    // Cek keunikan email
    const [existingEmail] = await db
      .select({ id: tenantMembers.id })
      .from(tenantMembers)
      .where(eq(tenantMembers.email, cleanEmail))
      .limit(1);

    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar pada akun lain.');
    }

    // Cek keunikan subdomain, jika konflik otomatis beri akhiran angka
    const [existingPortal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.subdomainSlug, cleanSlug))
      .limit(1);

    if (existingPortal) {
      cleanSlug = `${cleanSlug.slice(0, 20)}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 2. Generate username jika belum diisi
    let cleanUsername = dto.username?.trim().toLowerCase();
    if (!cleanUsername) {
      const prefix = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '-').slice(0, 15);
      const randNum = Math.floor(100 + Math.random() * 900);
      cleanUsername = `${prefix}-${randNum}`;
    }

    const [existingUsername] = await db
      .select({ id: tenantMembers.id })
      .from(tenantMembers)
      .where(eq(tenantMembers.username, cleanUsername))
      .limit(1);

    if (existingUsername) {
      cleanUsername = `${cleanUsername}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 3. Generate kata sandi sementara yang aman
    const tempPassword = this.generateSecureTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Smart Fallbacks untuk non-parlemen / eksekutif / tokoh publik
    let resolvedParty = dto.partyAffiliation?.trim() || null;
    let resolvedDapil = dto.customDapilName?.trim() || null;

    const parliamentLevels = ['DPR_RI', 'DPD_RI', 'MPR_RI', 'DPRD_PROVINSI', 'DPRD_KABUPATEN_KOTA'];
    if (!parliamentLevels.includes(dto.legislativeLevel)) {
      if (!resolvedParty) {
        resolvedParty = 'Non-Partai / Independen';
      }
      if (!resolvedDapil) {
        if (dto.legislativeLevel === 'KEPALA_DAERAH_GUBERNUR') resolvedDapil = 'Pemerintah Provinsi';
        else if (dto.legislativeLevel === 'KEPALA_DAERAH_WALIKOTA_BUPATI') resolvedDapil = 'Pemerintah Kabupaten / Kota';
        else if (dto.legislativeLevel === 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD') resolvedDapil = 'Instansi & OPD';
        else if (dto.legislativeLevel === 'PIMPINAN_LEMBAGA_REKTOR_SWASTA') resolvedDapil = 'Nasional / Independen';
      }
    }

    const isPrepaid = dto.generatePrepaidInvoice === true;

    // 4. Inisialisasi atomik data dewan, portal, dan langganan
    let createdMember: any;
    let createdSub: any;

    await db.transaction(async (tx) => {
      const [member] = await tx
        .insert(tenantMembers)
        .values({
          email: cleanEmail,
          username: cleanUsername,
          passwordHash,
          fullName: dto.fullName.trim(),
          phoneNumber: dto.phoneNumber.trim(),
          partyAffiliation: resolvedParty,
          legislativeLevel: dto.legislativeLevel, // DIKUNCI OLEH ADMIN
          electoralDistrictId: dto.electoralDistrictId || null,
          customDapilName: resolvedDapil,
          isVerified: true,
          mustChangePassword: true,
          temporaryPasswordPlaintextPreview: tempPassword,
          accountStatus: isPrepaid ? 'PENDING_PAYMENT' : 'ACTIVE',
        })
        .returning();

      createdMember = member;

      const [portal] = await tx
        .insert(portalConfigs)
        .values({
          tenantId: member.id,
          subdomainSlug: cleanSlug,
          customDomain: cleanCustomDomain,
          customDomainStatus: cleanCustomDomain ? 'VERIFIED' : 'UNVERIFIED',
          domainVerifiedAt: cleanCustomDomain ? new Date() : null,
          isActive: true,
          metaTitle: `${member.fullName} - Portal Aspirasi & Akuntabilitas Publik`,
        })
        .returning();

      await tx.insert(portalThemeSettings).values({
        portalId: portal.id,
        primaryHexColor: '#1890ff',
        secondaryHexColor: '#001529',
        fontFamily: 'Inter, sans-serif',
        layoutTemplateId: 'standard-default',
      });

      const now = new Date();
      let durationDays = 365;
      if (dto.billingCycle === 'MONTHLY') durationDays = 30;
      else if (dto.billingCycle === 'SEMESTER') durationDays = 180;
      else if (dto.billingCycle === 'ANNUAL') durationDays = 365;

      const [sub] = await tx
        .insert(subscriptions)
        .values({
          tenantId: member.id,
          planTier: dto.planTier || PlanTier.PRO,
          status: isPrepaid ? SubscriptionStatus.PENDING_PAYMENT : SubscriptionStatus.ACTIVE,
          currentPeriodStart: isPrepaid ? null : now,
          currentPeriodEnd: isPrepaid ? null : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
        })
        .returning();

      createdSub = sub;

      if (!isPrepaid) {
        const invNumber = `INV-ADM-${Date.now().toString().slice(-6)}`;
        await tx.insert(invoiceTransactions).values({
          subscriptionId: sub.id,
          invoiceNumber: invNumber,
          amountIdr: '0.00',
          gatewayOrderId: `ADMIN-GRANT-${Date.now()}`,
          paymentMethod: 'SUPERADMIN_DIRECT_GRANT',
          paymentStatus: PaymentStatus.SETTLEMENT,
          paidAt: now,
        });
      }

      const currentMonth = now.toISOString().slice(0, 7);
      await tx
        .insert(tenantQuotaLedgers)
        .values({
          tenantId: member.id,
          billingCycleMonth: currentMonth,
          articleLimit: 0,
          articleUsed: 0,
          dalleLimit: 0,
          dalleUsed: 0,
          totalTokensConsumed: 0,
          estimatedCostUsd: '0.0000',
        })
        .onConflictDoNothing();

      // Jika akun ini dibuat dari konversi inquiry lead resmi
      if (dto.inquiryId) {
        await tx
          .update(licenseInquiries)
          .set({
            status: InquiryStatus.DEAL_CONVERTED,
            convertedTenantId: member.id,
            updatedAt: new Date(),
          })
          .where(eq(licenseInquiries.id, dto.inquiryId));
      }
    });

    let prepaidInvoiceInfo = null;

    // 5. Jika admin memilih jalur pra-bayar (terbitkan tagihan Midtrans sebelum dewan aktif)
    if (isPrepaid) {
      const selectedCycle = (dto.billingCycle || 'SEMESTER').toUpperCase();
      const [matrix] = await db
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.legislativeLevel, dto.legislativeLevel),
            eq(subscriptionPriceMatrices.planTier, dto.planTier || PlanTier.PRO),
            eq(subscriptionPriceMatrices.billingCycle, selectedCycle),
            eq(subscriptionPriceMatrices.isActive, true)
          )
        )
        .limit(1);

      const amountIdr = matrix ? Number(matrix.amountIdr) : 10000000;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

      const paymentGateway = new MidtransPaymentAdapter();
      const snapResult = await paymentGateway.createInvoice({
        invoiceNumber,
        amountIdr,
        customerName: dto.fullName,
        customerEmail: cleanEmail,
        customerPhone: dto.phoneNumber,
      });

      await db.insert(invoiceTransactions).values({
        subscriptionId: createdSub.id,
        invoiceNumber,
        amountIdr: amountIdr.toString(),
        grossAmountIdr: amountIdr.toString(),
        gatewayOrderId: invoiceNumber,
        paymentStatus: PaymentStatus.PENDING,
        reconciliationStatus: 'UNRECONCILED',
      });

      prepaidInvoiceInfo = {
        invoiceNumber,
        amountIdr,
        snapToken: snapResult.snapToken,
        redirectUrl: snapResult.redirectUrl,
      };
    }

    this.logger.log(
      `[SuperadminTenantService] Akun dewan dibuat: ${createdMember.fullName} (${cleanUsername}) - Tingkat: ${dto.legislativeLevel} - Sandi: ${tempPassword}`
    );

    return {
      success: true,
      message: 'Akun anggota dewan berhasil dibuat. Kredensial siap diserahkan.',
      data: {
        id: createdMember.id,
        email: createdMember.email,
        username: createdMember.username,
        fullName: createdMember.fullName,
        temporaryPasswordPlaintext: tempPassword,
        subdomainSlug: cleanSlug,
        customDomain: cleanCustomDomain,
        legislativeLevel: dto.legislativeLevel,
        planTier: dto.planTier || PlanTier.PRO,
        accountStatus: createdMember.accountStatus,
        prepaidInvoice: prepaidInvoiceInfo,
      },
    };
  }

  /**
   * Superadmin Authority: Update legislative_level dewan (Anti-arbitrage gate)
   */
  async updateTenantLegislativeLevel(tenantId: string, dto: AdminUpdateLegislativeLevelDto) {
    const [updated] = await db
      .update(tenantMembers)
      .set({
        legislativeLevel: dto.legislativeLevel,
        internalNotes: dto.verificationNotes
          ? sql`CONCAT(COALESCE(${tenantMembers.internalNotes}, ''), '\n[LevelChange by Admin]: ', ${dto.verificationNotes})`
          : tenantMembers.internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(tenantMembers.id, tenantId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    return {
      success: true,
      message: `Tingkat legislatif anggota dewan ${updated.fullName} berhasil diperbarui menjadi ${dto.legislativeLevel}.`,
      data: updated,
    };
  }

  /**
   * Superadmin Authority: Reset password dewan secara manual atau acak
   */
  async resetTenantPassword(tenantId: string, dto: AdminResetTenantPasswordDto) {
    const [member] = await db
      .select({ id: tenantMembers.id, fullName: tenantMembers.fullName, email: tenantMembers.email })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data dewan tidak ditemukan.');
    }

    const newPassword = dto.newPassword?.trim() || this.generateSecureTempPassword();
    const hash = await bcrypt.hash(newPassword, 10);

    await db
      .update(tenantMembers)
      .set({
        passwordHash: hash,
        mustChangePassword: true,
        temporaryPasswordPlaintextPreview: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(tenantMembers.id, tenantId));

    return {
      success: true,
      message: `Kata sandi untuk ${member.fullName} berhasil direset. Silakan catat kata sandi baru ini.`,
      temporaryPasswordPlaintext: newPassword,
    };
  }
}
