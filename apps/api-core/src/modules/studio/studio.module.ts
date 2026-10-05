import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller.js';
import { StudioService } from './studio.service.js';
import { UrlScraperService } from './url-scraper.service.js';
import { DocumentParserService } from './document-parser.service.js';

@Module({
  controllers: [StudioController],
  providers: [StudioService, UrlScraperService, DocumentParserService],
  exports: [StudioService, UrlScraperService, DocumentParserService],
})
export class StudioModule {}
