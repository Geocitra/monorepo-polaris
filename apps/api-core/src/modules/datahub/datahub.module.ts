import { Module } from '@nestjs/common';
import { DatahubController } from './datahub.controller.js';
import { AdminDatahubController } from './admin-datahub.controller.js';
import { DatahubService } from './datahub.service.js';

@Module({
  controllers: [DatahubController, AdminDatahubController],
  providers: [DatahubService],
  exports: [DatahubService],
})
export class DatahubModule {}
