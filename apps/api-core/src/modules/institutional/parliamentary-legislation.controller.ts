import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import { ParliamentaryLegislationService } from './parliamentary-legislation.service.js';
import {
  UpsertLegalKnowledgeVersionRequestDto,
  CreateLegislationDraftRequestDto,
  UpdateLegislationStageRequestDto,
  UpsertLegislationClauseRequestDto,
  AddLegislationDimEntryRequestDto,
  UpdateLegislationDimEntryRequestDto,
  GenerateDailyBriefingRequestDto,
  RegisterPerformanceEvidenceRequestDto,
  DraftPerformancePublicationBodyDto,
} from './dto/parliamentary-request.dto.js';
import { OrganizationMemberRole } from '@polaris/shared-types';

@Controller('institutional/orgs/:orgId/parliamentary')
@UseGuards(AuthGuard, InstitutionalWorkspaceGuard)
export class ParliamentaryLegislationController {
  constructor(private readonly parliamentaryService: ParliamentaryLegislationService) { }

  // 1. BASIS PENGETAHUAN HUKUM TERVERSI
  @Get('legal-rules')
  async listLegalRules(@Param('orgId') orgId: string) {
    return await this.parliamentaryService.listApplicableLegalRules(orgId);
  }

  @Post('legal-rules')
  @HttpCode(HttpStatus.OK)
  async upsertOrgLegalRule(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpsertLegalKnowledgeVersionRequestDto
  ) {
    return await this.parliamentaryService.upsertOrgLegalRule(
      orgId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  // 2. RUANG KERJA LEGISLASI (9 TAHAP, PASAL, CRITIC & DIM)
  @Get('drafts')
  async listDrafts(@Param('orgId') orgId: string) {
    return await this.parliamentaryService.listLegislationDrafts(orgId);
  }

  @Post('drafts')
  @HttpCode(HttpStatus.CREATED)
  async createDraft(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: CreateLegislationDraftRequestDto
  ) {
    return await this.parliamentaryService.createLegislationDraft(
      orgId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Get('drafts/:draftId')
  async getDraftDetail(@Param('orgId') orgId: string, @Param('draftId') draftId: string) {
    return await this.parliamentaryService.getLegislationDraftDetail(orgId, draftId);
  }

  @Patch('drafts/:draftId/stage')
  async updateStage(
    @Param('orgId') orgId: string,
    @Param('draftId') draftId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpdateLegislationStageRequestDto
  ) {
    return await this.parliamentaryService.updateLegislationStage(
      orgId,
      draftId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || null,
      dto
    );
  }

  @Post('drafts/:draftId/clauses')
  @HttpCode(HttpStatus.OK)
  async upsertClause(
    @Param('orgId') orgId: string,
    @Param('draftId') draftId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpsertLegislationClauseRequestDto
  ) {
    return await this.parliamentaryService.upsertLegislationClause(
      orgId,
      draftId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Post('drafts/:draftId/clauses/:clauseId/compliance-critic')
  @UseGuards(TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async runClauseComplianceCritic(
    @Param('orgId') orgId: string,
    @Param('draftId') draftId: string,
    @Param('clauseId') clauseId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined
  ) {
    return await this.parliamentaryService.runClauseComplianceCritic(
      orgId,
      draftId,
      clauseId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER
    );
  }

  @Post('drafts/:draftId/dim')
  @HttpCode(HttpStatus.CREATED)
  async addDimEntry(
    @Param('orgId') orgId: string,
    @Param('draftId') draftId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: AddLegislationDimEntryRequestDto
  ) {
    return await this.parliamentaryService.addDimEntry(
      orgId,
      draftId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Patch('drafts/:draftId/dim/:dimId')
  async updateDimEntry(
    @Param('orgId') orgId: string,
    @Param('draftId') draftId: string,
    @Param('dimId') dimId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: UpdateLegislationDimEntryRequestDto
  ) {
    return await this.parliamentaryService.updateDimEntry(
      orgId,
      draftId,
      dimId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || null,
      dto
    );
  }

  // 3. BRIEFING HARIAN ANGGOTA DEWAN
  @Post('daily-briefing')
  @UseGuards(TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async generateDailyBriefing(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: GenerateDailyBriefingRequestDto
  ) {
    return await this.parliamentaryService.generateDailyBriefing(
      orgId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  // 4. REGISTER BUKTI KINERJA & STUDIO PUBLIKASI
  @Get('performance-evidences')
  async listPerformanceEvidences(@Param('orgId') orgId: string) {
    return await this.parliamentaryService.listPerformanceEvidence(orgId);
  }

  @Post('performance-evidences')
  @HttpCode(HttpStatus.CREATED)
  async registerPerformanceEvidence(
    @Param('orgId') orgId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined,
    @Body() dto: RegisterPerformanceEvidenceRequestDto
  ) {
    return await this.parliamentaryService.registerPerformanceEvidence(
      orgId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      dto
    );
  }

  @Patch('performance-evidences/:evidenceId/verify')
  async verifyPerformanceEvidence(
    @Param('orgId') orgId: string,
    @Param('evidenceId') evidenceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @CurrentInstitutionalContext() instCtx: VerifiedInstitutionalContext | undefined
  ) {
    return await this.parliamentaryService.verifyPerformanceEvidence(
      orgId,
      evidenceId,
      user.tenantId,
      instCtx?.orgRole || OrganizationMemberRole.MEMBER,
      instCtx?.unitRole || null
    );
  }

  @Post('performance-evidences/:evidenceId/draft-publication')
  @UseGuards(TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.OK)
  async draftPerformancePublication(
    @Param('orgId') orgId: string,
    @Param('evidenceId') evidenceId: string,
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: DraftPerformancePublicationBodyDto
  ) {
    return await this.parliamentaryService.draftAndSyncPublicationFromEvidence(
      orgId,
      evidenceId,
      user.tenantId,
      dto.createStudioDraft ?? true
    );
  }
}
