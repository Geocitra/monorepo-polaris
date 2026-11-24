import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
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
import { LkpjEvaluationService } from './lkpj-evaluation.service.js';
import {
  CreateLkpjWorkspaceRequestDto,
  UpdateLkpjWorkspaceStatusRequestDto,
  RegisterLkpjMaterialRequestDto,
  VerifyLkpjMaterialRequestDto,
  UpsertLkpjFindingRequestDto,
  ReviewLkpjFindingRequestDto,
  UpdateLkpjFindingFollowupRequestDto,
  SubmitLkpjFactionProposalRequestDto,
  RunLkpjSpecialistAiRequestDto,
  GenerateLkpjMeetingPackageQueryDto,
  UploadLkpjMaterialMetaRequestDto,
} from './dto/lkpj-request.dto.js';
import { OrganizationMemberRole } from '@polaris/shared-types';

@Controller('institutional/orgs/:orgId/lkpj')
@UseGuards(AuthGuard, InstitutionalWorkspaceGuard)
export class LkpjEvaluationController {
  constructor(private readonly lkpjService: LkpjEvaluationService) {}

  @Get('workspaces')
  async listWorkspaces(@Param('orgId') orgId: string) {
    return await this.lkpjService.listWorkspaces(orgId);
  }

  @Post('workspaces')
  @HttpCode(HttpStatus.OK)
  async createOrGetWorkspace(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: CreateLkpjWorkspaceRequestDto
  ) {
    return await this.lkpjService.createOrGetWorkspace(
      orgId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Get('workspaces/:workspaceId/dashboard')
  async getWorkspaceDashboard(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string
  ) {
    return await this.lkpjService.getWorkspaceDashboard(orgId, workspaceId);
  }

  @Patch('workspaces/:workspaceId/status')
  async updateWorkspaceStatus(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpdateLkpjWorkspaceStatusRequestDto
  ) {
    return await this.lkpjService.updateWorkspaceStatus(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Post('workspaces/:workspaceId/materials')
  @HttpCode(HttpStatus.CREATED)
  async registerMaterial(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: RegisterLkpjMaterialRequestDto
  ) {
    return await this.lkpjService.registerMaterial(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Post('workspaces/:workspaceId/materials/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    })
  )
  async uploadMaterialFile(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadLkpjMaterialMetaRequestDto
  ) {
    if (!file) {
      throw new BadRequestException('Berkas dokumen LKPJ/RPJMD/CSV tidak ditemukan.');
    }
    return await this.lkpjService.uploadAndAnalyzeMaterial(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      file,
      dto
    );
  }

  @Patch('workspaces/:workspaceId/materials/:materialId/verify')
  async verifyMaterial(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('materialId') materialId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: VerifyLkpjMaterialRequestDto
  ) {
    return await this.lkpjService.verifyMaterialInQueue(
      orgId,
      workspaceId,
      materialId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || null,
      dto
    );
  }

  @Post('workspaces/:workspaceId/findings')
  @HttpCode(HttpStatus.OK)
  async upsertFinding(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpsertLkpjFindingRequestDto
  ) {
    return await this.lkpjService.upsertFinding(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Patch('workspaces/:workspaceId/findings/:findingId/review')
  async reviewFinding(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('findingId') findingId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: ReviewLkpjFindingRequestDto
  ) {
    return await this.lkpjService.reviewFinding(
      orgId,
      workspaceId,
      findingId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || null,
      dto
    );
  }

  @Patch('workspaces/:workspaceId/findings/:findingId/followup')
  async updateFollowup(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('findingId') findingId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpdateLkpjFindingFollowupRequestDto
  ) {
    return await this.lkpjService.updateFindingFollowup(
      orgId,
      workspaceId,
      findingId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Post('workspaces/:workspaceId/faction-proposals')
  @HttpCode(HttpStatus.OK)
  async submitFactionProposal(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: SubmitLkpjFactionProposalRequestDto
  ) {
    return await this.lkpjService.submitFactionProposal(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Post('workspaces/:workspaceId/specialist-ai')
  @UseGuards(TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async runSpecialistAi(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: RunLkpjSpecialistAiRequestDto
  ) {
    return await this.lkpjService.runSpecialistAi(
      orgId,
      workspaceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Get('workspaces/:workspaceId/meeting-packages')
  async generateMeetingPackage(
    @Param('orgId') orgId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Query() query: GenerateLkpjMeetingPackageQueryDto
  ) {
    return await this.lkpjService.generateMeetingPackage(
      orgId,
      workspaceId,
      query.packageType,
      user.tenantId,
      instCtx?.unitId || null
    );
  }
}
