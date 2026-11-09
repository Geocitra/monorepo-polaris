import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Req,
  UseGuards 
} from '@nestjs/common';
import { ConstituentService } from './constituent.service.js';
import { SubmitAspirationDto, UpdateFeedbackStatusDto, AskCivicQuestionDto } from './dto/constituent.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';
import { TokenCircuitBreakerGuard } from '../../common/guards/token-circuit-breaker.guard.js';
import { IpThrottleGuard } from '../public-chat/guards/ip-throttle.guard.js';

@Controller('constituent')
export class ConstituentController {
  constructor(private readonly constituentService: ConstituentService) {}

  @Public()
  @UseGuards(IpThrottleGuard, TokenCircuitBreakerGuard)
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  async askCivic(@Body() dto: AskCivicQuestionDto, @Req() req?: any) {
    return await this.constituentService.askCivicAssistant(dto, req?.visitorIpHash);
  }

  @Public()
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submitAspiration(@Body() dto: SubmitAspirationDto) {
    return await this.constituentService.submitPublicAspiration(dto);
  }

  @Public()
  @Get('track/:ticket')
  @HttpCode(HttpStatus.OK)
  async trackTicket(@Param('ticket') ticket: string) {
    return await this.constituentService.trackTicketStatus(ticket);
  }

  @Get('inbox')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getInbox(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.constituentService.listDewanInbox(user.tenantId);
  }

  @Patch(':id/status')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackStatusDto
  ) {
    return await this.constituentService.updateFeedbackStatus(user.tenantId, id, dto.status);
  }
}
