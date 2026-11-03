import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller.js';
import { StudioService } from './studio.service.js';
import {
  StudioRadarService,
  StudioGeneratorService,
  StudioArticleService,
  StudioResearchService,
  StudioMagicLayersService,
} from './services/index.js';
import { UrlScraperService } from './url-scraper.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  controllers: [StudioController],
  providers: [
    StudioService,
    StudioRadarService,
    StudioGeneratorService,
    StudioArticleService,
    StudioResearchService,
    StudioMagicLayersService,
    UrlScraperService,
  ],
  exports: [
    StudioService,
    StudioRadarService,
    StudioGeneratorService,
    StudioArticleService,
    StudioResearchService,
    StudioMagicLayersService,
    UrlScraperService,
  ],
})
export class StudioModule {}
