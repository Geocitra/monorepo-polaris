import { Module } from '@nestjs/common';
import { XController } from './x.controller.js';
import { XService } from './x.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  controllers: [XController],
  providers: [XService],
  exports: [XService],
})
export class XModule {}

