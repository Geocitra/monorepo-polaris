import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller.js';
import { SuperadminReconciliationController } from './superadmin-reconciliation.controller.js';
import { SuperadminService } from './superadmin.service.js';
import {
  SuperadminAuthService,
  SuperadminDashboardService,
  SuperadminTenantService,
  SuperadminMasterDataService,
  SuperadminObservabilityService,
  SuperadminAuditService,
  SuperadminDomainService,
} from './services/index.js';
import { EmailService } from '../../common/services/email.service.js';
import { BillingModule } from '../billing/billing.module.js';

@Module({
  imports: [BillingModule],
  controllers: [SuperadminController, SuperadminReconciliationController],
  providers: [
    SuperadminService,
    SuperadminAuthService,
    SuperadminDashboardService,
    SuperadminTenantService,
    SuperadminMasterDataService,
    SuperadminObservabilityService,
    SuperadminAuditService,
    SuperadminDomainService,
    EmailService,
  ],
  exports: [
    SuperadminService,
    SuperadminAuthService,
    SuperadminDashboardService,
    SuperadminTenantService,
    SuperadminMasterDataService,
    SuperadminObservabilityService,
    SuperadminAuditService,
    SuperadminDomainService,
  ],
})
export class SuperadminModule {}
