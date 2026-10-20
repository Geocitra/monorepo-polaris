import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import {
  IdentityAuthService,
  IdentityProfileService,
  IdentitySecurityService,
} from './services/index.js';
import { EmailService } from '../../common/services/email.service.js';

@Module({
  controllers: [IdentityController],
  providers: [
    IdentityService,
    IdentityAuthService,
    IdentityProfileService,
    IdentitySecurityService,
    EmailService,
  ],
  exports: [
    IdentityService,
    IdentityAuthService,
    IdentityProfileService,
    IdentitySecurityService,
    EmailService,
  ],
})
export class IdentityModule {}
