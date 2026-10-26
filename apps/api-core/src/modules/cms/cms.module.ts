import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller.js';
import { CmsService } from './cms.service.js';
import {
  CmsDomainDnsService,
  CmsPortalConfigService,
  CmsPublicPortalService,
  CmsDocumentVaultService,
} from './services/index.js';

@Module({
  controllers: [CmsController],
  providers: [
    CmsService,
    CmsDomainDnsService,
    CmsPortalConfigService,
    CmsPublicPortalService,
    CmsDocumentVaultService,
  ],
  exports: [
    CmsService,
    CmsDomainDnsService,
    CmsPortalConfigService,
    CmsPublicPortalService,
    CmsDocumentVaultService,
  ],
})
export class CmsModule {}
