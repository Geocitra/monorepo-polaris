import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CreateCheckoutDto, CheckoutResponseDto, BillingStatusDto } from './dto/billing.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    return await this.billingService.createSubscriptionCheckout(user.tenantId, dto);
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<BillingStatusDto> {
    return await this.billingService.getBillingStatus(user.tenantId);
  }

  @Post('sync/:orderId')
  @HttpCode(HttpStatus.OK)
  async syncStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('orderId') orderId: string
  ): Promise<BillingStatusDto> {
    return await this.billingService.syncTransactionStatus(user.tenantId, orderId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleMidtransWebhook(@Body() payload: Record<string, any>) {
    return await this.billingService.handleMidtransWebhook(payload);
  }
}
