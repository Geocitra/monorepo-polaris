import { Module } from '@nestjs/common';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { RedisModule } from '../redis/redis.module.js';
import { IpThrottleGuard } from './guards/ip-throttle.guard.js';
import { PublicChatController } from './public-chat.controller.js';
import { PublicChatService } from './public-chat.service.js';

@Module({
    imports: [RedisModule],
    controllers: [PublicChatController],
    providers: [OpenAIAIEngineAdapter, PublicChatService, IpThrottleGuard],
    exports: [PublicChatService],
})
export class PublicChatModule { }