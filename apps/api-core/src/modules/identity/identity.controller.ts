import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { IdentityService } from './identity.service.js';
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
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';

@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.FORBIDDEN)
  async register(): Promise<never> {
    throw new ForbiddenException(
      'Pendaftaran publik mandiri telah ditutup. Pembukaan akun dewan resmi difasilitasi melalui jalur representasi institusi POLARIS. Silakan ajukan permohonan konsultasi lisensi di portal resmi.'
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginInitiateResponseDto> {
    return await this.identityService.login(dto);
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpRequestDto) {
    return await this.identityService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpRequestDto): Promise<AuthResponseDto> {
    return await this.identityService.verifyOtp(dto);
  }

  @Post('force-change-password')
  @HttpCode(HttpStatus.OK)
  async forceChangePassword(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: ForceChangeInitialPasswordDto,
  ) {
    return await this.identityService.forceChangeInitialPassword(user.tenantId, dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.identityService.getProfile(user.tenantId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.identityService.updateProfile(user.tenantId, dto);
  }

  @Public()
  @Get('commissions')
  @HttpCode(HttpStatus.OK)
  async getCommissions() {
    return await this.identityService.getCommissions();
  }
}
