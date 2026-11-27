import {
  Controller,
  Get,
  Post,
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
import { InstitutionalQuotaService } from './institutional-quota.service.js';
import {
  CreateSharedNoteRequestDto,
  PromoteSharedNoteVisibilityRequestDto,
  InstitutionalDocumentUploadMetaDto,
  InstitutionalAiAssistBodyDto,
  ReviseInstitutionalItemDto,
  CoordinatorChatRequestDto,
  AssignUnitMemberRequestDto,
} from './dto/institutional-request.dto.js';
import { OrganizationMemberRole, OrganizationUnitMemberRole } from '@polaris/shared-types';

@Controller('institutional')
@UseGuards(AuthGuard)
export class InstitutionalWorkspaceController {
  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly knowledge: InstitutionalKnowledgeService,
    private readonly quotaService: InstitutionalQuotaService
  ) { }

  @Get('my-workspaces')
  async getMyWorkspaces(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.governance.getMyWorkspaces(user.tenantId);
  }

  @Get('orgs/:orgId/my-quota')
  @UseGuards(InstitutionalWorkspaceGuard)
  async getMyOrgQuota(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.quotaService.getMemberQuota(orgId, user.tenantId);
  }

  @Get('orgs/:orgId/my-usage')
  @UseGuards(InstitutionalWorkspaceGuard)
  async getMyOrgUsage(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.quotaService.getMyUsageSummary(orgId, user.tenantId);
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

  @Get('orgs/:orgId/units/:unitId/proactive-prompts')
  @UseGuards(InstitutionalWorkspaceGuard)
  async getUnitProactivePrompts(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string
  ) {
    return await this.knowledge.getUnitProactivePrompts(orgId, unitId);
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

  @Post('orgs/:orgId/units/:unitId/prompt-autocomplete')
  @UseGuards(InstitutionalWorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async autocompleteUnitPrompt(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: { prefix: string; mode?: string }
  ) {
    return await this.knowledge.completeUnitPrompt(
      orgId,
      unitId,
      user.tenantId,
      dto?.prefix || '',
      dto?.mode
    );
  }

  @Post('orgs/:orgId/units/:unitId/coordinator-chat')
  @UseGuards(InstitutionalWorkspaceGuard, TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async executeCoordinatorChat(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: CoordinatorChatRequestDto
  ) {
    return await this.knowledge.executeCoordinatorChat(
      orgId,
      unitId,
      user.tenantId,
      dto
    );
  }

  @Get('orgs/:orgId/units/:unitId/chat-sessions')
  @UseGuards(InstitutionalWorkspaceGuard)
  async listUnitChatSessions(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.knowledge.listUnitChatSessions(orgId, unitId, user.tenantId);
  }

  @Get('orgs/:orgId/units/:unitId/chat-sessions/:sessionId')
  @UseGuards(InstitutionalWorkspaceGuard)
  async getUnitChatSessionDetail(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('sessionId') sessionId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.knowledge.getUnitChatSessionDetail(
      orgId,
      unitId,
      sessionId,
      user.tenantId
    );
  }

  @Delete('orgs/:orgId/units/:unitId/chat-sessions/:sessionId')
  @UseGuards(InstitutionalWorkspaceGuard)
  async deleteUnitChatSession(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('sessionId') sessionId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload
  ) {
    return await this.knowledge.deleteUnitChatSession(
      orgId,
      unitId,
      sessionId,
      user.tenantId
    );
  }

  @Get('orgs/:orgId/units/:unitId/members')
  @UseGuards(InstitutionalWorkspaceGuard)
  async listUnitMembers(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx?: VerifiedInstitutionalContext
  ) {
    await this.governance.assertUserIsUnitLeadOrOrgAdmin(
      orgId,
      unitId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER
    );
    return await this.governance.listUnitMembersForLead(orgId, unitId);
  }

  @Post('orgs/:orgId/units/:unitId/members')
  @UseGuards(InstitutionalWorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async assignMemberToUnitByLead(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: AssignUnitMemberRequestDto
  ) {
    await this.governance.assertUserIsUnitLeadOrOrgAdmin(
      orgId,
      unitId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER
    );
    return await this.governance.assignUnitMember(
      orgId,
      unitId,
      { tenantId: user.tenantId },
      dto
    );
  }

  @Delete('orgs/:orgId/units/:unitId/members/:memberTenantId')
  @UseGuards(InstitutionalWorkspaceGuard)
  async revokeUnitMemberByLead(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('memberTenantId') memberTenantId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx?: VerifiedInstitutionalContext
  ) {
    await this.governance.assertUserIsUnitLeadOrOrgAdmin(
      orgId,
      unitId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER
    );
    return await this.governance.revokeUnitMember(orgId, unitId, memberTenantId, {
      tenantId: user.tenantId,
    });
  }

  @Post('orgs/:orgId/units/:unitId/notes/:noteId/revise')
  @UseGuards(InstitutionalWorkspaceGuard, TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async reviseUnitNote(
    @Param('orgId') orgId: string,
    @Param('unitId') unitId: string,
    @Param('noteId') noteId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: ReviseInstitutionalItemDto
  ) {
    return await this.knowledge.reviseUnitSharedNote(
      orgId,
      unitId,
      noteId,
      user.tenantId,
      dto.revisionInstruction
    );
  }
}
