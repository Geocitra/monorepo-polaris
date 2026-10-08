import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, and, desc, sql, or, ne } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  portalConfigs,
  portalThemeSettings,
  subscriptions,
  electoralDistricts,
  emailOtps,
  masterCommissions,
} from '@polaris/database';
import { SubdomainSlug } from '@polaris/core-domain';
import { SubscriptionStatus, PlanTier } from '@polaris/shared-types';
import {
  RegisterRequestDto,
  LoginRequestDto,
  LoginInitiateResponseDto,
  AuthResponseDto,
  SendOtpRequestDto,
  VerifyOtpRequestDto,
  UpdateProfileDto,
  ForceChangeInitialPasswordDto,
} from './dto/auth.dto.js';
import { EmailService } from '../../common/services/email.service.js';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async registerTenant(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    let cleanSlug: string;
    if (dto.subdomainSlug && dto.subdomainSlug.trim()) {
      try {
        const validatedSlug = new SubdomainSlug(dto.subdomainSlug.trim());
        cleanSlug = validatedSlug.getValue();
      } catch (error: any) {
        throw new BadRequestException(error.message);
      }
    } else {
      const baseSlug =
        (dto.fullName || 'dewan')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 20) || 'dewan';
      cleanSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const [existingMember] = await db
      .select({ id: tenantMembers.id })
      .from(tenantMembers)
      .where(eq(tenantMembers.email, dto.email.toLowerCase().trim()))
      .limit(1);

    if (existingMember) {
      throw new ConflictException('Email ini sudah terdaftar.');
    }

    const [existingSlug] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.subdomainSlug, cleanSlug))
      .limit(1);

    if (existingSlug && dto.subdomainSlug) {
      throw new ConflictException(`Subdomain '${cleanSlug}' sudah digunakan oleh anggota dewan lain.`);
    } else if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Resolusi Dapil: Validasi ke Master KPU tanpa membuat fake master record
    let finalDapilId: string | null = null;
    let initialDapilName: string | null = null;
    let initialCoverage: string[] = [];

    const dapilCandidate = dto.dapilId?.trim();
    const isValidUuid = dapilCandidate
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dapilCandidate)
      : false;

    if (isValidUuid && dapilCandidate) {
      const [found] = await db
        .select({
          id: electoralDistricts.id,
          dapilName: electoralDistricts.dapilName,
          regencyCoverage: electoralDistricts.regencyCoverage,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, dapilCandidate))
        .limit(1);

      if (found) {
        finalDapilId = found.id;
        initialDapilName = found.dapilName;
        initialCoverage = found.regencyCoverage;
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await db.transaction(async (tx) => {
      const [newMember] = await tx
        .insert(tenantMembers)
        .values({
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          fullName: dto.fullName.trim(),
          phoneNumber: dto.phoneNumber.trim(),
          partyAffiliation: dto.partyAffiliation?.trim() || null,
          legislativeLevel: dto.legislativeLevel || 'DPRD_PROVINSI',
          electoralDistrictId: finalDapilId,
          customDapilName: initialDapilName,
          personalCoverage: initialCoverage,
        })
        .returning();

      const [newPortal] = await tx
        .insert(portalConfigs)
        .values({
          tenantId: newMember.id,
          subdomainSlug: cleanSlug,
          metaTitle: `${dto.fullName} - Portal Publik Resmi`,
          metaDescription: `Portal transparansi kinerja dan akuntabilitas publik ${dto.fullName}.`,
          isActive: true,
        })
        .returning();

      await tx.insert(portalThemeSettings).values({
        portalId: newPortal.id,
        primaryHexColor: '#1890ff',
        secondaryHexColor: '#001529',
        fontFamily: 'Inter, sans-serif',
        headlineTagline: `Mengabdi untuk Konstituen & Kemajuan Daerah`,
        bioBiography: `Anggota Dewan Representasi Rakyat.`,
      });

      await tx.insert(subscriptions).values({
        tenantId: newMember.id,
        planTier: dto.planTier || PlanTier.PRO,
        status: SubscriptionStatus.PENDING_PAYMENT,
      });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await tx.insert(emailOtps).values({
        email: dto.email.toLowerCase().trim(),
        otpCode,
        expiresAt,
        isUsed: false,
        attempts: 0,
      });

      return {
        member: newMember,
        subdomain: cleanSlug,
        otpCode,
      };
    });

    try {
      await this.emailService.sendOtpEmail(result.member.email, result.otpCode, result.member.fullName);
    } catch (err: any) {
      this.logger.error(`Gagal mengirim OTP pendaftaran: ${err.message}`);
    }

    const payload = {
      sub: result.member.id,
      email: result.member.email,
      subdomainSlug: result.subdomain,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: '7d',
      user: {
        id: result.member.id,
        email: result.member.email,
        fullName: result.member.fullName,
        partyAffiliation: result.member.partyAffiliation,
        subdomain: result.subdomain,
      },
    };
  }

  async login(dto: LoginRequestDto): Promise<LoginInitiateResponseDto> {
    const rawIdentifier = (dto.identifier || dto.email || '').toLowerCase().trim();
    if (!rawIdentifier) {
      throw new UnauthorizedException('Email atau username wajib diisi.');
    }

    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        username: tenantMembers.username,
        passwordHash: tenantMembers.passwordHash,
        fullName: tenantMembers.fullName,
        accountStatus: tenantMembers.accountStatus,
      })
      .from(tenantMembers)
      .where(or(eq(tenantMembers.email, rawIdentifier), eq(tenantMembers.username, rawIdentifier)))
      .limit(1);

    if (!member) {
      throw new UnauthorizedException('Kredensial atau kata sandi tidak sesuai.');
    }

    const cleanEmail = member.email;

    if (member.accountStatus === 'SUSPENDED') {
      throw new UnauthorizedException('Akun ini sedang ditangguhkan. Silakan hubungi Administrator.');
    }

    const isMatch = await bcrypt.compare(dto.password, member.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau kata sandi tidak sesuai.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .update(emailOtps)
      .set({ isUsed: true })
      .where(eq(emailOtps.email, cleanEmail));

    await db.insert(emailOtps).values({
      email: cleanEmail,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    await this.emailService.sendOtpEmail(cleanEmail, otpCode, member.fullName);

    return {
      step: '2FA_REQUIRED',
      requireOtp: true,
      email: cleanEmail,
      message: 'Kredensial terverifikasi. Kode OTP 2FA telah dikirimkan ke kotak masuk email Anda.',
    };
  }

  async sendOtp(dto: SendOtpRequestDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        fullName: tenantMembers.fullName,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.email, cleanEmail))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Email ini belum terdaftar sebagai anggota dewan di POLARIS Platform.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .update(emailOtps)
      .set({ isUsed: true })
      .where(eq(emailOtps.email, cleanEmail));

    await db.insert(emailOtps).values({
      email: cleanEmail,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    await this.emailService.sendOtpEmail(cleanEmail, otpCode, member.fullName);

    return {
      message: 'Kode OTP 6-digit berhasil dikirimkan ke email Anda. Berlaku selama 5 menit.',
      email: cleanEmail,
    };
  }

  async verifyOtp(dto: VerifyOtpRequestDto): Promise<AuthResponseDto> {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [otpRecord] = await db
      .select()
      .from(emailOtps)
      .where(and(eq(emailOtps.email, cleanEmail), eq(emailOtps.isUsed, false)))
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);

    if (!otpRecord) {
      throw new UnauthorizedException('Kode OTP tidak ditemukan atau sudah digunakan. Silakan minta kode baru.');
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.update(emailOtps).set({ isUsed: true }).where(eq(emailOtps.id, otpRecord.id));
      throw new UnauthorizedException('Kode OTP telah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.');
    }

    if (otpRecord.attempts >= 5) {
      await db.update(emailOtps).set({ isUsed: true }).where(eq(emailOtps.id, otpRecord.id));
      throw new UnauthorizedException('Batas percobaan verifikasi telah terlampaui. Silakan minta kode baru.');
    }

    if (otpRecord.otpCode !== dto.otpCode.trim()) {
      await db
        .update(emailOtps)
        .set({ attempts: sql`${emailOtps.attempts} + 1` })
        .where(eq(emailOtps.id, otpRecord.id));

      throw new UnauthorizedException(`Kode OTP salah. Sisa percobaan: ${4 - otpRecord.attempts} kali.`);
    }

    await db.update(emailOtps).set({ isUsed: true }).where(eq(emailOtps.id, otpRecord.id));

    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        username: tenantMembers.username,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        mustChangePassword: tenantMembers.mustChangePassword,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.email, cleanEmail))
      .limit(1);

    if (!member) {
      throw new UnauthorizedException('Akun dewan tidak ditemukan.');
    }

    const [portal] = await db
      .select({ subdomainSlug: portalConfigs.subdomainSlug })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, member.id))
      .limit(1);

    const subdomainSlug = portal?.subdomainSlug || '';

    const payload = {
      sub: member.id,
      email: member.email,
      subdomainSlug,
      mustChangePassword: member.mustChangePassword,
      role: 'MEMBER',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: '7d',
      user: {
        id: member.id,
        email: member.email,
        username: member.username,
        fullName: member.fullName,
        partyAffiliation: member.partyAffiliation,
        subdomain: subdomainSlug,
        mustChangePassword: member.mustChangePassword,
        legislativeLevel: member.legislativeLevel as any,
      },
    };
  }

  async getProfile(tenantId: string) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        username: tenantMembers.username,
        mustChangePassword: tenantMembers.mustChangePassword,
        passwordChangedAt: tenantMembers.passwordChangedAt,
        electoralDistrictId: tenantMembers.electoralDistrictId,
        customDapilName: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
        commissionId: tenantMembers.commissionId,
        commissionName: tenantMembers.commissionName,
        photoUrl: tenantMembers.photoUrl,
        gender: tenantMembers.gender,
        birthDate: tenantMembers.birthDate,
        education: tenantMembers.education,
        courses: tenantMembers.courses,
        issueInterests: tenantMembers.issueInterests,
        createdAt: tenantMembers.createdAt,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    // Resolusi Dapil Master (KPU Reference)
    let masterDapil = null;
    if (member.electoralDistrictId) {
      const [dapil] = await db
        .select({
          id: electoralDistricts.id,
          dapilCode: electoralDistricts.dapilCode,
          dapilName: electoralDistricts.dapilName,
          provinceName: electoralDistricts.provinceName,
          regencyCoverage: electoralDistricts.regencyCoverage,
          totalVoters: electoralDistricts.totalVoters,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.electoralDistrictId))
        .limit(1);
      masterDapil = dapil || null;
    }

    // Effective Representation Resolution: Prioritaskan personal override jika ada
    const effectiveDapilName = member.customDapilName || masterDapil?.dapilName || 'Dapil Belum Ditentukan';
    const effectiveProvinceName = masterDapil?.provinceName || 'Provinsi Wilayah';
    const effectiveCoverage =
      member.personalCoverage && member.personalCoverage.length > 0
        ? member.personalCoverage
        : masterDapil?.regencyCoverage || [];

    const effectiveElectoralDistrict = {
      id: masterDapil?.id || null,
      dapilCode: masterDapil?.dapilCode || 'DAPIL-PERSONAL',
      dapilName: effectiveDapilName,
      provinceName: effectiveProvinceName,
      regencyCoverage: effectiveCoverage,
      totalVoters: masterDapil?.totalVoters || null,
      isCustomized: Boolean(member.customDapilName || (member.personalCoverage && member.personalCoverage.length > 0)),
    };

    const [portal] = await db
      .select({
        id: portalConfigs.id,
        subdomainSlug: portalConfigs.subdomainSlug,
        customDomain: portalConfigs.customDomain,
      })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    let portalTheme = null;
    if (portal) {
      const [theme] = await db
        .select({
          officialPhotoUrl: portalThemeSettings.officialPhotoUrl,
        })
        .from(portalThemeSettings)
        .where(eq(portalThemeSettings.portalId, portal.id))
        .limit(1);
      portalTheme = theme || null;
    }

    const [sub] = await db
      .select({
        status: subscriptions.status,
        planTier: subscriptions.planTier,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const resolvedPhotoUrl = member.photoUrl || portalTheme?.officialPhotoUrl || null;

    return {
      ...member,
      photoUrl: resolvedPhotoUrl,
      institutionPartyName: member.partyAffiliation,
      officeRole: member.legislativeLevel,
      electoralDistrict: effectiveElectoralDistrict,
      masterElectoralDistrict: masterDapil,
      subdomain: portal?.subdomainSlug,
      customDomain: portal?.customDomain,
      subscription: sub,
    };
  }

  async updateProfile(tenantId: string, dto: UpdateProfileDto) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        electoralDistrictId: tenantMembers.electoralDistrictId,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (dto.fullName && dto.fullName.trim()) {
      updates.fullName = dto.fullName.trim();
    }
    if (dto.phoneNumber && dto.phoneNumber.trim()) {
      updates.phoneNumber = dto.phoneNumber.trim();
    }
    if (dto.partyAffiliation !== undefined || dto.institutionPartyName !== undefined) {
      const party = dto.partyAffiliation?.trim() || dto.institutionPartyName?.trim() || null;
      updates.partyAffiliation = party;
    }

    // =========================================================================
    // KEBIJAKAN ANTI-ARBITRASE (Craig Larman Protected Variations):
    // Atribut legislativeLevel bersifat IMMUTABLE bagi dewan dan tidak boleh
    // dimutasi melalui endpoint profil dewan. Hanya SUPERADMIN yang berwenang.
    // =========================================================================

    if (dto.username !== undefined) {
      const cleanUsername = dto.username?.trim().toLowerCase() || null;
      if (cleanUsername) {
        if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
          throw new BadRequestException('Username hanya boleh 3-30 karakter alphanumeric, minus, atau underscore.');
        }
        const [existing] = await db
          .select({ id: tenantMembers.id })
          .from(tenantMembers)
          .where(and(eq(tenantMembers.username, cleanUsername), ne(tenantMembers.id, tenantId)))
          .limit(1);

        if (existing) {
          throw new ConflictException('Username sudah digunakan oleh akun lain.');
        }
        updates.username = cleanUsername;
      } else {
        updates.username = null;
      }
    }

    if (dto.photoUrl !== undefined) {
      const cleanPhoto = dto.photoUrl?.trim() || null;
      updates.photoUrl = cleanPhoto;

      const [portal] = await db
        .select({ id: portalConfigs.id })
        .from(portalConfigs)
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);

      if (portal) {
        await db
          .update(portalThemeSettings)
          .set({ officialPhotoUrl: cleanPhoto })
          .where(eq(portalThemeSettings.portalId, portal.id));
      }
    }

    if (dto.gender !== undefined) {
      updates.gender = dto.gender?.trim() || null;
    }

    if (dto.birthDate !== undefined) {
      updates.birthDate = dto.birthDate?.trim() || null;
    }

    if (dto.education !== undefined) {
      updates.education = typeof dto.education === 'string' ? dto.education.trim() : JSON.stringify(dto.education);
    }

    if (dto.courses !== undefined) {
      if (Array.isArray(dto.courses)) {
        updates.courses = dto.courses.map((c: string) => (typeof c === 'string' ? c.trim() : '')).filter(Boolean);
      } else if (typeof dto.courses === 'string') {
        try {
          const parsed = JSON.parse(dto.courses);
          updates.courses = Array.isArray(parsed) ? parsed : [dto.courses.trim()];
        } catch {
          updates.courses = dto.courses.split(',').map((c: string) => c.trim()).filter(Boolean);
        }
      }
    }

    if (dto.issueInterests !== undefined) {
      if (Array.isArray(dto.issueInterests)) {
        updates.issueInterests = dto.issueInterests
          .map((i: string) => (typeof i === 'string' ? i.trim() : ''))
          .filter(Boolean);
      } else if (typeof dto.issueInterests === 'string') {
        try {
          const parsed = JSON.parse(dto.issueInterests);
          updates.issueInterests = Array.isArray(parsed) ? parsed : [dto.issueInterests.trim()];
        } catch {
          updates.issueInterests = dto.issueInterests.split(',').map((i: string) => i.trim()).filter(Boolean);
        }
      }
    }

    // =========================================================================
    // ISOLASI DATA WILAYAH: ZERO-MUTATION PADA ELECTORAL_DISTRICTS
    // =========================================================================
    // 1. Jika dewan memilih Dapil Master KPU baru lewat dapilId:
    if (dto.dapilId !== undefined) {
      const cleanDapilId = dto.dapilId?.trim();
      if (cleanDapilId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanDapilId)) {
        const [foundMaster] = await db
          .select({ id: electoralDistricts.id })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, cleanDapilId))
          .limit(1);

        if (foundMaster) {
          updates.electoralDistrictId = foundMaster.id;
        }
      } else if (cleanDapilId === '' || cleanDapilId === null) {
        updates.electoralDistrictId = null;
      }
    }

    // 2. Kustomisasi judul dapil personal dan cakupan wilayah kerja
    if (dto.dapilName !== undefined) {
      updates.customDapilName = dto.dapilName?.trim() || null;
    }

    if (dto.regencyCoverage !== undefined) {
      let parsedCoverage: string[] = [];
      if (Array.isArray(dto.regencyCoverage)) {
        parsedCoverage = dto.regencyCoverage.map((r: string) => r.trim()).filter(Boolean);
      } else if (typeof dto.regencyCoverage === 'string' && dto.regencyCoverage.trim()) {
        parsedCoverage = dto.regencyCoverage
          .split(',')
          .map((r: string) => r.trim())
          .filter(Boolean);
      }
      updates.personalCoverage = parsedCoverage;
    }

    if (dto.commissionId !== undefined) {
      updates.commissionId = dto.commissionId?.trim() || null;
    }
    if (dto.commissionName !== undefined) {
      updates.commissionName = dto.commissionName?.trim() || null;
    }

    // Eksekusi update HANYA pada tabel tenant_members
    if (Object.keys(updates).length > 0) {
      await db
        .update(tenantMembers)
        .set(updates)
        .where(eq(tenantMembers.id, tenantId));
    }

    return await this.getProfile(tenantId);
  }

  async getCommissions(level?: string) {
    const rows = await db
      .select()
      .from(masterCommissions)
      .orderBy(masterCommissions.code);

    if (level && level !== 'ALL') {
      return rows.filter((r) => r.legislativeLevel === level);
    }
    return rows;
  }

  async forceChangeInitialPassword(tenantId: string, dto: ForceChangeInitialPasswordDto) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        passwordHash: tenantMembers.passwordHash,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Akun pengguna tidak ditemukan.');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, member.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Kata sandi saat ini atau kata sandi sementara tidak cocok.');
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      throw new BadRequestException('Kata sandi baru minimal 8 karakter.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await db
      .update(tenantMembers)
      .set({
        passwordHash: newHash,
        mustChangePassword: false,
        temporaryPasswordPlaintextPreview: null,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tenantMembers.id, tenantId));

    return {
      success: true,
      message: 'Kata sandi akun Anda berhasil diperbarui. Akses dashboard telah dibuka penuh.',
    };
  }
}
