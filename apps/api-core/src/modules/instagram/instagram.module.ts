import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller.js';
import { InstagramService } from './instagram.service.js';
import { InstagramTokenCryptoService } from './instagram-crypto.service.js';

@Module({
  controllers: [InstagramController],
  providers: [InstagramService, InstagramTokenCryptoService],
  exports: [InstagramService, InstagramTokenCryptoService],
})
export class InstagramModule {}
