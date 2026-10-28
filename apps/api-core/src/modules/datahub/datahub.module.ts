import { Module } from '@nestjs/common';
import { DatahubController } from './datahub.controller.js';
import { AdminDatahubController } from './admin-datahub.controller.js';
import { OperatorDatahubController } from './operator-datahub.controller.js';
import { DatahubService } from './datahub.service.js';

@Module({
  controllers: [DatahubController, AdminDatahubController, OperatorDatahubController],
  providers: [DatahubService],
  exports: [DatahubService],
})
export class DatahubModule {}
