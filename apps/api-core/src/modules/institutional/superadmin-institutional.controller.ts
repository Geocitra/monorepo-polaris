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
import { INDONESIA_REGIONS } from '@polaris/shared-types';

@Controller('superadmin/institutions')
@UseGuards(AuthGuard, SuperadminGuard)
export class SuperadminInstitutionalController {
  constructor(private readonly governance: InstitutionalGovernanceService) {}

  @Get('regions')
  getIndonesiaRegions() {
    return INDONESIA_REGIONS;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInstitution(
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: CreateInstitutionRequestDto
  ) {
    const adminId = admin?.operatorId || admin?.tenantId;
    return await this.governance.createInstitution(adminId, dto);
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
    const adminId = admin?.operatorId || admin?.tenantId;
    return await this.governance.updateInstitution(orgId, adminId, dto);
  }

  @Post(':orgId/contracts')
  @HttpCode(HttpStatus.OK)
  async upsertContract(
    @Param('orgId') orgId: string,
    @CurrentTenant() admin: AuthenticatedTenantPayload,
    @Body() dto: UpsertOrganizationContractRequestDto
  ) {
    const adminId = admin?.operatorId || admin?.tenantId;
    return await this.governance.upsertOrganizationContract(
      orgId,
      adminId,
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
    const adminId = admin?.operatorId || admin?.tenantId;
    return await this.governance.assignOrganizationMember(
      orgId,
      { adminId },
      dto
    );
  }
}
