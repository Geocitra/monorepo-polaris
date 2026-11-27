import { Module } from '@nestjs/common';
import { DatahubModule } from '../datahub/datahub.module.js';
import { BillingModule } from '../billing/billing.module.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import { InstitutionalQuotaService } from './institutional-quota.service.js';
import { InstitutionalKnowledgeService } from './institutional-knowledge.service.js';
import { LkpjEvaluationService } from './lkpj-evaluation.service.js';
import { ParliamentaryLegislationService } from './parliamentary-legislation.service.js';
import { InstitutionalWorkspaceGuard } from './guards/institutional-workspace.guard.js';
import { SuperadminInstitutionalController } from './superadmin-institutional.controller.js';
import { OrgAdminInstitutionalController } from './org-admin-institutional.controller.js';
import { InstitutionalWorkspaceController } from './institutional-workspace.controller.js';
import { LkpjEvaluationController } from './lkpj-evaluation.controller.js';
import { ParliamentaryLegislationController } from './parliamentary-legislation.controller.js';

@Module({
  imports: [DatahubModule, BillingModule],
  controllers: [
    SuperadminInstitutionalController,
    OrgAdminInstitutionalController,
    InstitutionalWorkspaceController,
    LkpjEvaluationController,
    ParliamentaryLegislationController,
  ],
  providers: [
    InstitutionalGovernanceService,
    InstitutionalQuotaService,
    InstitutionalKnowledgeService,
    LkpjEvaluationService,
    ParliamentaryLegislationService,
    InstitutionalWorkspaceGuard,
  ],
  exports: [
    InstitutionalGovernanceService,
    InstitutionalQuotaService,
    InstitutionalKnowledgeService,
    LkpjEvaluationService,
    ParliamentaryLegislationService,
    InstitutionalWorkspaceGuard,
  ],
})
export class InstitutionalModule {}
