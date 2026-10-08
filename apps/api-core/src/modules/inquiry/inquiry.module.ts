import { Module, forwardRef } from '@nestjs/common';
import { InquiryController } from './inquiry.controller.js';
import { InquiryService } from './inquiry.service.js';
import { EmailService } from '../../common/services/email.service.js';
import { SuperadminModule } from '../superadmin/superadmin.module.js';

@Module({
  imports: [forwardRef(() => SuperadminModule)],
  controllers: [InquiryController],
  providers: [InquiryService, EmailService],
  exports: [InquiryService],
})
export class InquiryModule {}
