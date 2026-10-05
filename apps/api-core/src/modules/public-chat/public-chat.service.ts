import { Injectable, Logger } from '@nestjs/common';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { SendPublicChatDto } from './dto/public-chat.dto.js';
import type { PublicChatResponseDto } from './dto/public-chat.dto.js';

@Injectable()
export class PublicChatService {
    private readonly logger = new Logger(PublicChatService.name);

    constructor(private readonly aiEngine: OpenAIAIEngineAdapter) { }

    async processVisitorMessage(dto: SendPublicChatDto): Promise<PublicChatResponseDto> {
        this.logger.log(`[PublicChat] Processing visitor message; length=${dto.message.length}`);

        const result = await this.aiEngine.generatePublicConcierge({
            userMessage: dto.message,
            history: dto.history,
        });

        return {
            reply: result.reply,
            suggestedAction: result.suggestedAction,
            isSafeRefusal: result.isSafeRefusal,
            tokensUsed: result.tokensUsed,
        };
    }
}