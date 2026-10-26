import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  portalConfigs,
  tenantActivityLogs,
  systemAdmins,
} from '@polaris/database';
import {
  ForceChangeInitialPasswordDto,
  ChangePasswordDto,
  ChangeEmailDto,
} from '../dto/auth.dto.js';

@Injectable()
export class IdentitySecurityService {
  private readonly logger = new Logger(IdentitySecurityService.name);

  constructor(private readonly jwtService: JwtService) {}

  async forceChangeInitialPassword(tenantId: string, dto: ForceChangeInitialPasswordDto) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        username: tenantMembers.username,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
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

    const [portal] = await db
      .select({ subdomainSlug: portalConfigs.subdomainSlug })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    const subdomainSlug = portal?.subdomainSlug || '';

    const payload = {
      sub: member.id,
      email: member.email,
      subdomainSlug,
      mustChangePassword: false,
      role: 'MEMBER',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      accessToken,
      user: {
        id: member.id,
        email: member.email,
        username: member.username,
        fullName: member.fullName,
        partyAffiliation: member.partyAffiliation,
        subdomain: subdomainSlug,
        mustChangePassword: false,
        legislativeLevel: member.legislativeLevel as any,
      },
      message:
        'Kata sandi akun Anda berhasil diperbarui. Akses dashboard telah dibuka penuh.',
    };
  }

  /**
   * Mengubah kata sandi mandiri dari profil anggota dewan
   */
  async changePassword(tenantId: string, dto: ChangePasswordDto) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        username: tenantMembers.username,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
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
      throw new BadRequestException('Kata sandi saat ini tidak cocok.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Kata sandi baru tidak boleh sama dengan kata sandi saat ini.');
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      throw new BadRequestException('Kata sandi baru minimal 8 karakter.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    const now = new Date();

    await db
      .update(tenantMembers)
      .set({
        passwordHash: newHash,
        mustChangePassword: false,
        temporaryPasswordPlaintextPreview: null,
        passwordChangedAt: now,
        updatedAt: now,
      })
      .where(eq(tenantMembers.id, tenantId));

    try {
      await db.insert(tenantActivityLogs).values({
        tenantId,
        activityType: 'PASSWORD_CHANGED',
        category: 'AUTH',
        description: 'Pengguna berhasil memperbarui kata sandi akun melalui profil dewan.',
      });
    } catch (err: any) {
      this.logger.warn(`Gagal mencatat log perubahan password: ${err.message}`);
    }

    const [portal] = await db
      .select({ subdomainSlug: portalConfigs.subdomainSlug })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    const subdomainSlug = portal?.subdomainSlug || '';

    const payload = {
      sub: member.id,
      email: member.email,
      subdomainSlug,
      mustChangePassword: false,
      role: 'MEMBER',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      accessToken,
      user: {
        id: member.id,
        email: member.email,
        username: member.username,
        fullName: member.fullName,
        partyAffiliation: member.partyAffiliation,
        subdomain: subdomainSlug,
        mustChangePassword: false,
        legislativeLevel: member.legislativeLevel as any,
      },
      message: 'Kata sandi akun Anda berhasil diperbarui.',
      passwordChangedAt: now.toISOString(),
    };
  }

  /**
   * Mengubah email login akun anggota dewan dengan otorisasi kata sandi
   */
  async changeEmail(tenantId: string, dto: ChangeEmailDto) {
    const cleanNewEmail = dto.newEmail.trim().toLowerCase();

    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        passwordHash: tenantMembers.passwordHash,
        fullName: tenantMembers.fullName,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Akun pengguna tidak ditemukan.');
    }

    // 1. Verifikasi kata sandi untuk otorisasi pergantian email
    const isMatch = await bcrypt.compare(dto.currentPassword, member.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Kata sandi tidak cocok. Otorisasi pergantian email ditolak.');
    }

    // 2. Cek apakah email baru sama dengan email lama
    if (member.email.toLowerCase() === cleanNewEmail) {
      throw new BadRequestException('Email baru tidak boleh sama dengan email akun saat ini.');
    }

    // 3. Cek apakah email baru sudah dipakai oleh tenant lain
    const [existingMember] = await db
      .select({ id: tenantMembers.id })
      .from(tenantMembers)
      .where(eq(tenantMembers.email, cleanNewEmail))
      .limit(1);

    if (existingMember && existingMember.id !== tenantId) {
      throw new ConflictException('Alamat email tersebut sudah terdaftar pada akun lain.');
    }

    // 4. Cek apakah email dipakai oleh admin sistem
    const [existingAdmin] = await db
      .select({ id: systemAdmins.id })
      .from(systemAdmins)
      .where(eq(systemAdmins.email, cleanNewEmail))
      .limit(1);

    if (existingAdmin) {
      throw new ConflictException('Alamat email tersebut dicadangkan untuk administrator sistem.');
    }

    const previousEmail = member.email;
    const now = new Date();

    // 5. Update email
    await db
      .update(tenantMembers)
      .set({
        email: cleanNewEmail,
        updatedAt: now,
      })
      .where(eq(tenantMembers.id, tenantId));

    // 6. Buat token JWT baru dengan email baru
    const [portal] = await db
      .select({ subdomainSlug: portalConfigs.subdomainSlug })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    const payload = {
      sub: member.id,
      email: cleanNewEmail,
      subdomainSlug: portal?.subdomainSlug,
    };
    const newAccessToken = await this.jwtService.signAsync(payload);

    // 7. Catat log aktivitas
    try {
      await db.insert(tenantActivityLogs).values({
        tenantId,
        activityType: 'EMAIL_CHANGED',
        category: 'AUTH',
        description: `Pengguna mengubah email login dari ${previousEmail} menjadi ${cleanNewEmail}.`,
      });
    } catch (err: any) {
      this.logger.warn(`Gagal mencatat log perubahan email: ${err.message}`);
    }

    return {
      success: true,
      message: 'Email login berhasil diperbarui.',
      email: cleanNewEmail,
      accessToken: newAccessToken,
    };
  }
}
