import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SocialFeatureFlagsResponse } from '@polaris/shared-types';

@Controller('social')
export class PlatformSettingsController {
  constructor(private readonly settingsService: PlatformSettingsService) {}

  @Public()
  @Get('feature-flags')
  @HttpCode(HttpStatus.OK)
  async getSocialFeatureFlags(): Promise<SocialFeatureFlagsResponse> {
    return await this.settingsService.getSocialFeatureFlags();
  }
}

