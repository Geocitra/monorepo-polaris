import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationMemberRole } from '@polaris/shared-types';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import {
  CurrentTenant,
  type AuthenticatedTenantPayload,
} from '../../common/decorators/current-tenant.decorator.js';
import {
  InstitutionalWorkspaceGuard,
  RequireOrgRoles,
  AllowOrgAdminUnitManagement,
} from './guards/institutional-workspace.guard.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import { InstitutionalKnowledgeService } from './institutional-knowledge.service.js';
import {
  CreateOrganizationUnitRequestDto,
  UpdateOrganizationUnitRequestDto,
  AssignOrganizationMemberRequestDto,
  AssignUnitMemberRequestDto,
  InstitutionalDocumentUploadMetaDto,
} from './dto/institutional-request.dto.js';

@Controller('institutions/:orgId/admin')
@UseGuards(AuthGuard, InstitutionalWorkspaceGuard)
@RequireOrgRoles(OrganizationMemberRole.ORG_ADMIN, OrganizationMemberRole.LEADERSHIP)
@AllowOrgAdminUnitManagement()
export class OrgAdminInstitutionalController {
  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly knowledge: InstitutionalKnowledgeService
  ) {}

  @Post('units')
  @HttpCode(HttpStatus.CREATED)
  async createUnit(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: CreateOrganizationUnitRequestDto
  ) {
    return await this.governance.createOrganizationUnit(orgId, user.tenantId, dto);
  }

  @Get('units')
  async getUnitTree(@Param('orgId') orgId: string) {
    return await this.governance.getOrganizationUnitTree(orgId);
  }

  @Patch('units/:unitId')
  async updateUnit(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: UpdateOrganizationUnitRequestDto
  ) {
    return await this.governance.updateOrganizationUnit(
      orgId,
      unitId,
      user.tenantId,
      dto
    );
  }

  @Get('members')
  async listMembers(@Param('orgId') orgId: string) {
    return await this.governance.getOrganizationMembers(orgId);
  }

  @Post('members')
  @HttpCode(HttpStatus.OK)
  async assignOrgMember(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: AssignOrganizationMemberRequestDto
  ) {
    return await this.governance.assignOrganizationMember(
      orgId,
      { tenantId: user.tenantId },
      dto
    );
  }

  @Post('units/:unitId/members')
  @HttpCode(HttpStatus.OK)
  async assignUnitMember(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: AssignUnitMemberRequestDto
  ) {
    return await this.governance.assignUnitMember(
      orgId,
      unitId,
      { tenantId: user.tenantId },
      dto
    );
  }

  @Delete('units/:unitId/members/:tenantId')
  @HttpCode(HttpStatus.OK)
  async revokeUnitMember(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('tenantId') targetTenantId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.governance.revokeUnitMember(
      orgId,
      unitId,
      targetTenantId,
      { tenantId: user.tenantId }
    );
  }

  @Get('documents')
  async listOfficialDocuments(@Param('orgId') orgId: string) {
    return await this.governance.listOfficialOrgSharedDocuments(orgId);
  }

  @Post('documents')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    })
  )
  async uploadOfficialDocument(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: InstitutionalDocumentUploadMetaDto
  ) {
    if (!file) {
      throw new BadRequestException('Berkas dokumen resmi tidak ditemukan.');
    }
    return await this.knowledge.uploadOfficialOrgSharedDocument(
      orgId,
      user.tenantId,
      file,
      dto
    );
  }
}
