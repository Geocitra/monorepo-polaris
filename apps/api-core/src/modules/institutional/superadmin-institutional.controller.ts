import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import {
  CurrentTenant,
  type AuthenticatedTenantPayload,
} from '../../common/decorators/current-tenant.decorator.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import {
  CreateInstitutionRequestDto,
  UpdateInstitutionRequestDto,
  UpsertOrganizationContractRequestDto,
  AssignOrganizationMemberRequestDto,
} from './dto/institutional-request.dto.js';

@Controller('superadmin/institutions')
@UseGuards(AuthGuard, SuperadminGuard)
export class SuperadminInstitutionalController {
  constructor(private readonly governance: InstitutionalGovernanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInstitution(
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: CreateInstitutionRequestDto
  ) {
    return await this.governance.createInstitution(admin?.tenantId, dto);
  }

  @Get()
  async listInstitutions() {
    return await this.governance.listSuperadminInstitutions();
  }

  @Get(':orgId')
  async getInstitutionDetail(@Param('orgId') orgId: string) {
    return await this.governance.getSuperadminInstitutionDetail(orgId);
  }

  @Patch(':orgId')
  async updateInstitution(
    @Param('orgId') orgId: string,
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: UpdateInstitutionRequestDto
  ) {
    return await this.governance.updateInstitution(orgId, admin?.tenantId, dto);
  }

  @Post(':orgId/contracts')
  @HttpCode(HttpStatus.OK)
  async upsertContract(
    @Param('orgId') orgId: string,
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: UpsertOrganizationContractRequestDto
  ) {
    return await this.governance.upsertOrganizationContract(
      orgId,
      admin?.tenantId,
      dto
    );
  }

  @Post(':orgId/admins')
  @HttpCode(HttpStatus.OK)
  async assignOrgAdmin(
    @Param('orgId') orgId: string,
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: AssignOrganizationMemberRequestDto
  ) {
    return await this.governance.assignOrganizationMember(
      orgId,
      { adminId: admin?.tenantId },
      dto
    );
  }
}
