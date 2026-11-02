import { Global, Module } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service.js';
import { PlatformSettingsController } from './platform-settings.controller.js';

@Global()
@Module({
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}

