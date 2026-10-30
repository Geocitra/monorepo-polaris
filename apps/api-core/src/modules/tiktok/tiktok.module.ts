import { Module } from '@nestjs/common';
import { TikTokController } from './tiktok.controller.js';
import { TikTokService } from './tiktok.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  controllers: [TikTokController],
  providers: [TikTokService],
  exports: [TikTokService],
})
export class TikTokModule {}

