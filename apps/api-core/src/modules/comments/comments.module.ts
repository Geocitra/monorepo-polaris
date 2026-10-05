import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { CitizenAuthGuard } from '../../common/guards/citizen-auth.guard.js';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CitizenAuthGuard],
  exports: [CommentsService],
})
export class CommentsModule {}
