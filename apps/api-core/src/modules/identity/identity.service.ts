import { Injectable, Logger } from '@nestjs/common';
import {
  RegisterRequestDto,
  LoginRequestDto,
  LoginInitiateResponseDto,
  AuthResponseDto,
  SendOtpRequestDto,
  VerifyOtpRequestDto,
  UpdateProfileDto,
  ForceChangeInitialPasswordDto,
  ChangePasswordDto,
  ChangeEmailDto,
} from './dto/auth.dto.js';
import {
  IdentityAuthService,
  IdentityProfileService,
  IdentitySecurityService,
} from './services/index.js';

/**
 * IdentityService (Facade Coordinator)
 *
 * Menerapkan pola Facade untuk mendelegasikan domain Identitas & Akses ke sub-services:
 * - IdentityAuthService (Registrasi Dewan, Login, dan Otorisasi OTP 2FA)
 * - IdentityProfileService (Profil Anggota Dewan, Kustomisasi Wilayah, Komisi)
 * - IdentitySecurityService (Pergantian Kata Sandi Awal/Mandiri, Update Email Login)
 */
@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly authService: IdentityAuthService,
    private readonly profileService: IdentityProfileService,
    private readonly securityService: IdentitySecurityService,
  ) {}

  // --- Domain: Autentikasi & Otorisasi 2FA ---
  async registerTenant(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return await this.authService.registerTenant(dto);
  }

  async login(dto: LoginRequestDto): Promise<LoginInitiateResponseDto> {
    return await this.authService.login(dto);
  }

  async sendOtp(dto: SendOtpRequestDto) {
    return await this.authService.sendOtp(dto);
  }

  async verifyOtp(dto: VerifyOtpRequestDto): Promise<AuthResponseDto> {
    return await this.authService.verifyOtp(dto);
  }

  // --- Domain: Profil & Data Komisi Parlemen ---
  async getProfile(tenantId: string) {
    return await this.profileService.getProfile(tenantId);
  }

  async updateProfile(tenantId: string, dto: UpdateProfileDto) {
    return await this.profileService.updateProfile(tenantId, dto);
  }

  async getCommissions(level?: string) {
    return await this.profileService.getCommissions(level);
  }

  // --- Domain: Keamanan Akun & Kredensial ---
  async forceChangeInitialPassword(tenantId: string, dto: ForceChangeInitialPasswordDto) {
    return await this.securityService.forceChangeInitialPassword(tenantId, dto);
  }

  async changePassword(tenantId: string, dto: ChangePasswordDto) {
    return await this.securityService.changePassword(tenantId, dto);
  }

  async changeEmail(tenantId: string, dto: ChangeEmailDto) {
    return await this.securityService.changeEmail(tenantId, dto);
  }
}
