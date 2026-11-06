import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller.js';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppCloudClient } from './whatsapp-cloud.client.js';
import { WhatsAppBriefHelperService } from './services/whatsapp-brief-helper.service.js';
import { WhatsAppBotSessionService } from './services/whatsapp-bot-session.service.js';
import { WhatsAppOperatorBrokerService } from './services/whatsapp-operator-broker.service.js';
import { WhatsAppPublicReviewService } from './services/whatsapp-public-review.service.js';
import { WhatsAppBillingOrderService } from './services/whatsapp-billing-order.service.js';
import { WhatsAppLiveChatService } from './services/whatsapp-live-chat.service.js';
import { OperatorKpiService } from './services/operator-kpi.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppBriefHelperService,
    WhatsAppBotSessionService,
    WhatsAppOperatorBrokerService,
    WhatsAppPublicReviewService,
    WhatsAppBillingOrderService,
    WhatsAppLiveChatService,
    OperatorKpiService,
    WhatsAppService,
    WhatsAppCloudClient,
  ],
  exports: [
    WhatsAppService,
    WhatsAppCloudClient,
    WhatsAppBillingOrderService,
    WhatsAppLiveChatService,
    OperatorKpiService,
  ],
})
export class WhatsAppModule {}
