import { Module } from '@nestjs/common';
import { ConstituentController } from './constituent.controller.js';
import { ConstituentService } from './constituent.service.js';
import { PiiCryptoService } from './pii-crypto.service.js';
import { IpThrottleGuard } from '../public-chat/guards/ip-throttle.guard.js';

@Module({
  controllers: [ConstituentController],
  providers: [ConstituentService, PiiCryptoService, IpThrottleGuard],
  exports: [ConstituentService, PiiCryptoService],
})
export class ConstituentModule {}
