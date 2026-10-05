import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller.js';
import { SuperadminReconciliationController } from './superadmin-reconciliation.controller.js';
import { SuperadminService } from './superadmin.service.js';
import { EmailService } from '../../common/services/email.service.js';
import { BillingModule } from '../billing/billing.module.js';

@Module({
  imports: [BillingModule],
  controllers: [SuperadminController, SuperadminReconciliationController],
  providers: [SuperadminService, EmailService],
  exports: [SuperadminService],
})
export class SuperadminModule {}

