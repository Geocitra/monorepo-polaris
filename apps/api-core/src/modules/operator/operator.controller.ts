import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { OperatorService } from './operator.service.js';
import {
  AssignOperatorDto,
  UnassignOperatorDto,
  CreateOperatorAccountDto,
  UpdateOperatorAccountDto,
} from './dto/operator.dto.js';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    tenantId: string;
    operatorId?: string;
    email: string;
    role: string;
    isSuperadmin?: boolean;
    isOperator?: boolean;
  };
}

@Controller('operator')
@UseGuards(AuthGuard)
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  /**
   * Mengambil daftar seluruh tokoh / anggota dewan yang ditugaskan ke operator ini.
   */
  @Get('my-assignments')
  async getMyAssignments(@Req() req: AuthenticatedRequest) {
    const operatorId = req.user.operatorId || req.user.tenantId;
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Endpoint ini khusus diakses oleh Tim Operator Polaris.');
    }
    return await this.operatorService.getMyAssignments(operatorId);
  }

  /**
   * Mengambil konteks aktif suatu dewan (tanpa mengekspos data kredensial/PII)
   */
  @Get('tenant-context/:tenantId')
  async getTenantContext(
    @Param('tenantId') tenantId: string,
    @Req() req: AuthenticatedRequest
  ) {
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.operatorService.getTenantContext(
      operatorId,
      tenantId,
      req.user.isSuperadmin
    );
  }

  /**
   * Operator: Memperbarui profil publik tokoh binaan (nama, bio, partai, komisi, dapil, foto)
   */
  @Patch('tenant-profile/:tenantId')
  async updateTenantProfile(
    @Param('tenantId') tenantId: string,
    @Body() dto: {
      fullName?: string;
      partyAffiliation?: string;
      customDapilName?: string;
      commissionName?: string;
      photoUrl?: string;
      education?: string;
      issueInterests?: string[];
    },
    @Req() req: AuthenticatedRequest
  ) {
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.operatorService.updateTenantProfile(
      operatorId,
      tenantId,
      dto,
      req.user.isSuperadmin
    );
  }

  /**
   * Mengambil riwayat log audit untuk operator saat ini
   */
  @Get('audit-logs')
  async getAuditLogs(@Req() req: AuthenticatedRequest) {
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.operatorService.getAuditLogs(operatorId);
  }

  // =========================================================================
  // SUPERADMIN ENDPOINTS (TOWER KONTROL PENUGASAN)
  // =========================================================================

  /**
   * Superadmin: Menampilkan daftar seluruh staf operator dan status penugasannya
   */
  @Get('admin/list')
  @UseGuards(SuperadminGuard)
  async listOperators() {
    return await this.operatorService.listOperators();
  }

  /**
   * Superadmin: Membuat akun operator baru
   */
  @Post('admin/create-account')
  @UseGuards(SuperadminGuard)
  async createOperatorAccount(@Body() dto: CreateOperatorAccountDto) {
    return await this.operatorService.createOperatorAccount(dto);
  }

  /**
   * Superadmin: Menugaskan dewan ke operator
   */
  @Post('admin/assign')
  @UseGuards(SuperadminGuard)
  async assignTenant(
    @Body() dto: AssignOperatorDto,
    @Req() req: AuthenticatedRequest
  ) {
    const adminId = req.user.operatorId || req.user.tenantId;
    return await this.operatorService.assignTenant(adminId, dto);
  }

  /**
   * Superadmin: Mencabut akses dewan dari operator (Revoke)
   */
  @Post('admin/unassign')
  @UseGuards(SuperadminGuard)
  async unassignTenant(@Body() dto: UnassignOperatorDto) {
    return await this.operatorService.unassignTenant(dto);
  }

  /**
   * Superadmin: Mengambil daftar seluruh tokoh/dewan aktif untuk kemudahan penugasan
   */
  @Get('admin/tenants-list')
  @UseGuards(SuperadminGuard)
  async listAvailableTenants() {
    return await this.operatorService.listAvailableTenants();
  }

  /**
   * Superadmin: Mengambil detail lengkap operator dan daftar dewan yang ditugaskan
   */
  @Get('admin/:operatorId')
  @UseGuards(SuperadminGuard)
  async getOperatorDetail(@Param('operatorId') operatorId: string) {
    return await this.operatorService.getOperatorDetail(operatorId);
  }

  /**
   * Superadmin: Memperbarui data profil/status/password operator
   */
  @Patch('admin/:operatorId')
  @UseGuards(SuperadminGuard)
  async updateOperatorAccount(
    @Param('operatorId') operatorId: string,
    @Body() dto: UpdateOperatorAccountDto
  ) {
    return await this.operatorService.updateOperatorAccount(operatorId, dto);
  }

  /**
   * Superadmin: Menghapus akun staf operator
   */
  @Delete('admin/:operatorId')
  @UseGuards(SuperadminGuard)
  async deleteOperatorAccount(@Param('operatorId') operatorId: string) {
    return await this.operatorService.deleteOperatorAccount(operatorId);
  }
}
