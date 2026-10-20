import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller.js';
import { StudioService } from './studio.service.js';
import {
  StudioRadarService,
  StudioGeneratorService,
  StudioArticleService,
  StudioResearchService,
} from './services/index.js';
import { UrlScraperService } from './url-scraper.service.js';
import { DocumentParserService } from './document-parser.service.js';
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
    UrlScraperService,
    DocumentParserService,
  ],
  exports: [
    StudioService,
    StudioRadarService,
    StudioGeneratorService,
    StudioArticleService,
    StudioResearchService,
    UrlScraperService,
    DocumentParserService,
  ],
})
export class StudioModule {}
