import { Global, Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { ReconciliationEngineService } from './reconciliation-engine.service.js';
import { TokenCircuitBreakerService } from './token-circuit-breaker.service.js';
import { TokenCircuitBreakerGuard } from '../../common/guards/token-circuit-breaker.guard.js';
import { EmailService } from '../../common/services/email.service.js';

@Global()
@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    ReconciliationEngineService,
    TokenCircuitBreakerService,
    TokenCircuitBreakerGuard,
    EmailService,
  ],
  exports: [
    BillingService,
    ReconciliationEngineService,
    TokenCircuitBreakerService,
    TokenCircuitBreakerGuard,
  ],
})
export class BillingModule {}
