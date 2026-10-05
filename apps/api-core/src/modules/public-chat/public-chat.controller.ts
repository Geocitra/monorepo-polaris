import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { IpThrottleGuard } from './guards/ip-throttle.guard.js';
import { TokenCircuitBreakerGuard } from '../../common/guards/token-circuit-breaker.guard.js';
import { PublicChatService } from './public-chat.service.js';
import { SendPublicChatDto } from './dto/public-chat.dto.js';
import type { PublicChatResponseDto } from './dto/public-chat.dto.js';

@Controller('public/chat')
export class PublicChatController {
    constructor(private readonly publicChatService: PublicChatService) { }

    @Public()
    @UseGuards(IpThrottleGuard, TokenCircuitBreakerGuard)
    @Post()
    @HttpCode(HttpStatus.OK)
    chatWithConcierge(@Body() dto: SendPublicChatDto): Promise<PublicChatResponseDto> {
        return this.publicChatService.processVisitorMessage(dto);
    }
}