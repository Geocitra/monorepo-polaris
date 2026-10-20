import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, and, desc } from 'drizzle-orm';
import { db, systemAdmins, emailOtps } from '@polaris/database';
import {
  SuperadminLoginDto,
  SuperadminSendOtpDto,
  SuperadminVerifyOtpDto,
} from '../dto/superadmin.dto.js';
import { EmailService } from '../../../common/services/email.service.js';

@Injectable()
export class SuperadminAuthService {
  private readonly logger = new Logger(SuperadminAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Superadmin Login via Password (Langkah 1: Verifikasi Kredensial & Kirim OTP 2FA)
   */
  async login(dto: SuperadminLoginDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [admin] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.email, cleanEmail))
      .limit(1);

    if (!admin) {
      throw new UnauthorizedException('Kredensial Superadmin tidak ditemukan.');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Akun administrator ini telah dinonaktifkan.');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Kata sandi administrator salah.');
    }

    // Terbitkan OTP 6-Digit & Kirim ke email resmi Superadmin via SMTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

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

    await this.emailService.sendOtpEmail(cleanEmail, otpCode, admin.fullName);

    return {
      step: '2FA_REQUIRED',
      requireOtp: true,
      email: cleanEmail,
      message: `Kredensial valid. Kode OTP verifikasi 2FA telah dikirimkan ke email ${cleanEmail}.`,
    };
  }

  /**
   * Kirim Kode OTP ke Email Superadmin (menggunakan Real SMTP)
   */
  async sendOtp(dto: SuperadminSendOtpDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [admin] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.email, cleanEmail))
      .limit(1);

    if (!admin) {
      throw new NotFoundException('Email ini tidak terdaftar sebagai Superadmin POLARIS.');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Akun administrator ini telah dinonaktifkan.');
    }

    // Buat kode 6 digit OTP acak
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // Batalkan OTP sebelumnya yang belum dipakai
    await db
      .update(emailOtps)
      .set({ isUsed: true })
      .where(eq(emailOtps.email, cleanEmail));

    // Simpan OTP baru ke database
    await db.insert(emailOtps).values({
      email: cleanEmail,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // Kirim email lewat SMTP transport (Gmail)
    await this.emailService.sendOtpEmail(cleanEmail, otpCode, admin.fullName);

    return {
      message: `Kode otorisasi 6-digit berhasil dikirimkan ke inbox email ${cleanEmail}.`,
      expiresInMinutes: 5,
    };
  }

  /**
   * Verifikasi Kode OTP Email Superadmin
   */
  async verifyOtp(dto: SuperadminVerifyOtpDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [admin] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.email, cleanEmail))
      .limit(1);

    if (!admin) {
      throw new NotFoundException('Email administrator tidak ditemukan.');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Akun administrator ini telah dinonaktifkan.');
    }

    const [otpRecord] = await db
      .select()
      .from(emailOtps)
      .where(
        and(
          eq(emailOtps.email, cleanEmail),
          eq(emailOtps.otpCode, dto.otpCode.trim()),
          eq(emailOtps.isUsed, false),
        )
      )
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);

    if (!otpRecord) {
      throw new UnauthorizedException('Kode OTP salah atau sudah pernah digunakan.');
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new UnauthorizedException('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
    }

    // Tandai OTP telah digunakan
    await db
      .update(emailOtps)
      .set({ isUsed: true })
      .where(eq(emailOtps.id, otpRecord.id));

    // Update last login
    await db
      .update(systemAdmins)
      .set({ lastLoginAt: new Date() })
      .where(eq(systemAdmins.id, admin.id));

    const tokenPayload = {
      sub: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isSuperadmin: true,
    };

    const token = await this.jwtService.signAsync(tokenPayload, { expiresIn: '7d' });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  /**
   * Get Superadmin Profile
   */
  async getProfile(adminId: string) {
    const [admin] = await db
      .select({
        id: systemAdmins.id,
        email: systemAdmins.email,
        fullName: systemAdmins.fullName,
        role: systemAdmins.role,
        avatarUrl: systemAdmins.avatarUrl,
        lastLoginAt: systemAdmins.lastLoginAt,
      })
      .from(systemAdmins)
      .where(eq(systemAdmins.id, adminId))
      .limit(1);

    if (!admin) {
      throw new NotFoundException('Data administrator tidak ditemukan.');
    }

    return admin;
  }
}
