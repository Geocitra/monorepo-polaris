import { Module } from '@nestjs/common';
import { ConstituentController } from './constituent.controller.js';
import { ConstituentService } from './constituent.service.js';
import { PiiCryptoService } from './pii-crypto.service.js';

@Module({
  controllers: [ConstituentController],
  providers: [ConstituentService, PiiCryptoService],
  exports: [ConstituentService, PiiCryptoService],
})
export class ConstituentModule {}
