import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { EmailService } from '../../common/services/email.service.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, EmailService],
  exports: [IdentityService, EmailService],
})
export class IdentityModule {}

