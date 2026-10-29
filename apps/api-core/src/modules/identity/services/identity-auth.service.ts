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
import { eq, and, desc, sql, or } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  portalConfigs,
  portalThemeSettings,
  subscriptions,
  electoralDistricts,
  emailOtps,
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
} from '../dto/auth.dto.js';
import { EmailService } from '../../../common/services/email.service.js';

@Injectable()
export class IdentityAuthService {
  private readonly logger = new Logger(IdentityAuthService.name);

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
      throw new ConflictException(
        `Subdomain '${cleanSlug}' sudah digunakan oleh anggota dewan lain.`
      );
    } else if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

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
      await this.emailService.sendOtpEmail(
        result.member.email,
        result.otpCode,
        result.member.fullName
      );
    } catch (err: any) {
      this.logger.error(`Gagal mengirim OTP pendaftaran: ${err.message}`);
    }

    const payload = {
      sub: result.member.id,
      email: result.member.email,
      subdomainSlug: result.subdomain,
      mustChangePassword: false,
      role: 'MEMBER',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: '24h',
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

    const emailResult = await this.emailService.sendOtpEmail(cleanEmail, otpCode, member.fullName);

    return {
      step: '2FA_REQUIRED',
      requireOtp: true,
      email: cleanEmail,
      message: (emailResult as any)?.fallback
        ? 'Kredensial valid. Layanan email terkendala; gunakan kode OTP darurat yang tertera di konsol backend.'
        : 'Kredensial terverifikasi. Kode OTP 2FA telah dikirimkan ke kotak masuk email Anda.',
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
      throw new NotFoundException(
        'Email ini belum terdaftar sebagai anggota dewan di POLARIS Platform.'
      );
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

    const emailResult = await this.emailService.sendOtpEmail(cleanEmail, otpCode, member.fullName);

    return {
      message: (emailResult as any)?.fallback
        ? 'Kode OTP darurat tercatat di konsol server. Berlaku selama 5 menit.'
        : 'Kode OTP 6-digit berhasil dikirimkan ke email Anda. Berlaku selama 5 menit.',
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
      throw new UnauthorizedException(
        'Kode OTP tidak ditemukan atau sudah digunakan. Silakan minta kode baru.'
      );
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.update(emailOtps).set({ isUsed: true }).where(eq(emailOtps.id, otpRecord.id));
      throw new UnauthorizedException(
        'Kode OTP telah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.'
      );
    }

    if (otpRecord.attempts >= 5) {
      await db.update(emailOtps).set({ isUsed: true }).where(eq(emailOtps.id, otpRecord.id));
      throw new UnauthorizedException(
        'Batas percobaan verifikasi telah terlampaui. Silakan minta kode baru.'
      );
    }

    if (otpRecord.otpCode !== dto.otpCode.trim()) {
      await db
        .update(emailOtps)
        .set({ attempts: sql`${emailOtps.attempts} + 1` })
        .where(eq(emailOtps.id, otpRecord.id));

      throw new UnauthorizedException(
        `Kode OTP salah. Sisa percobaan: ${4 - otpRecord.attempts} kali.`
      );
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
      expiresIn: '24h',
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
}
