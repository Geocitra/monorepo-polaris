import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  UseGuards 
} from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { 
  GoogleCitizenLoginDto, 
  CreateCommentDto, 
  ModerateCommentDto 
} from './dto/comment.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CitizenAuthGuard } from './guards/citizen-auth.guard.js';
import { CurrentCitizen, AuthenticatedCitizenPayload } from './decorators/current-citizen.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Post('auth/google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(@Body() dto: GoogleCitizenLoginDto) {
    return await this.commentsService.verifyGoogleAndLogin(dto);
  }

  @Public()
  @Get('article/:publicationId')
  @HttpCode(HttpStatus.OK)
  async getComments(@Param('publicationId') publicationId: string) {
    return await this.commentsService.getArticleComments(publicationId);
  }

  @Public()
  @Post('article/:publicationId')
  @UseGuards(CitizenAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async postComment(
    @Param('publicationId') publicationId: string,
    @CurrentCitizen() citizen: AuthenticatedCitizenPayload,
    @Body() dto: CreateCommentDto
  ) {
    return await this.commentsService.createComment(publicationId, citizen.citizenId, dto);
  }

  @Public()
  @Post(':commentId/like')
  @HttpCode(HttpStatus.OK)
  async likeComment(@Param('commentId') commentId: string) {
    return await this.commentsService.likeComment(commentId);
  }

  @Patch(':commentId/moderate')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async moderateComment(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('commentId') commentId: string,
    @Body() dto: ModerateCommentDto
  ) {
    return await this.commentsService.moderateComment(user.tenantId, commentId, dto);
  }

  // Endpoint Khusus Anggota Dewan untuk Mengambil Semua Komentar Miliknya
  @Get('tenant/all')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getTenantComments(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.commentsService.listTenantComments(user.tenantId);
  }

  @Get('moderation')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsForDewan(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Query('status') statusFilter?: string,
    @Query('search') search?: string
  ) {
    return await this.commentsService.getCommentsForDewan(user.tenantId, statusFilter, search);
  }

  @Delete(':commentId')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async deleteCommentByDewan(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('commentId') commentId: string
  ) {
    return await this.commentsService.deleteCommentByDewan(user.tenantId, commentId);
  }
}
