import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { TokenCircuitBreakerGuard } from '../../common/guards/token-circuit-breaker.guard.js';
import {
  CurrentTenant,
  type AuthenticatedTenantPayload,
} from '../../common/decorators/current-tenant.decorator.js';
import {
  InstitutionalWorkspaceGuard,
  CurrentInstitutionalContext,
  type VerifiedInstitutionalContext,
} from './guards/institutional-workspace.guard.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import { InstitutionalKnowledgeService } from './institutional-knowledge.service.js';
import {
  CreateSharedNoteRequestDto,
  PromoteSharedNoteVisibilityRequestDto,
  InstitutionalDocumentUploadMetaDto,
  InstitutionalAiAssistBodyDto,
} from './dto/institutional-request.dto.js';
import { OrganizationMemberRole, OrganizationUnitMemberRole } from '@polaris/shared-types';

@Controller('institutional')
@UseGuards(AuthGuard)
export class InstitutionalWorkspaceController {
  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly knowledge: InstitutionalKnowledgeService
  ) {}

  @Get('my-workspaces')
  async getMyWorkspaces(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.governance.getMyWorkspaces(user.tenantId);
  }

  @Get('orgs/:orgId/units/:unitId/overview')
  @UseGuards(InstitutionalWorkspaceGuard)
  async getUnitOverview(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentInstitutionalContext() instCtx?: VerifiedInstitutionalContext
  ) {
    return await this.knowledge.getUnitWorkspaceOverview(
      orgId,
      unitId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || OrganizationUnitMemberRole.MEMBER
    );
  }

  @Get('orgs/:orgId/units/:unitId/documents')
  @UseGuards(InstitutionalWorkspaceGuard)
  async listUnitDocuments(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string
  ) {
    return await this.knowledge.listUnitAccessibleDocuments(orgId, unitId);
  }

  @Post('orgs/:orgId/units/:unitId/documents')
  @UseGuards(InstitutionalWorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    })
  )
  async uploadUnitDocument(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: InstitutionalDocumentUploadMetaDto
  ) {
    if (!file) {
      throw new BadRequestException('Berkas dokumen Bidang tidak ditemukan.');
    }
    return await this.knowledge.uploadUnitScopedDocument(
      orgId,
      unitId,
      user.tenantId,
      file,
      dto
    );
  }

  @Get('orgs/:orgId/units/:unitId/notes')
  @UseGuards(InstitutionalWorkspaceGuard)
  async listUnitNotes(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.knowledge.listUnitSharedNotes(orgId, unitId, user.tenantId);
  }

  @Post('orgs/:orgId/units/:unitId/notes')
  @UseGuards(InstitutionalWorkspaceGuard)
  @HttpCode(HttpStatus.CREATED)
  async createUnitNote(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: CreateSharedNoteRequestDto
  ) {
    return await this.knowledge.createSharedNote(orgId, unitId, user.tenantId, dto);
  }

  @Patch('orgs/:orgId/units/:unitId/notes/:noteId/visibility')
  @UseGuards(InstitutionalWorkspaceGuard)
  async promoteNoteVisibility(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('noteId') noteId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: PromoteSharedNoteVisibilityRequestDto
  ) {
    return await this.knowledge.promoteSharedNoteVisibility(
      orgId,
      unitId,
      noteId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || OrganizationUnitMemberRole.MEMBER,
      dto.targetVisibility
    );
  }

  @Post('orgs/:orgId/units/:unitId/ai-assist')
  @UseGuards(InstitutionalWorkspaceGuard, TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async executeBidangAiAssist(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: InstitutionalAiAssistBodyDto
  ) {
    return await this.knowledge.executeBidangScopedAiAssist(
      orgId,
      unitId,
      user.tenantId,
      dto
    );
  }
}
