import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class IpThrottleGuard implements CanActivate {
    private readonly logger = new Logger(IpThrottleGuard.name);
    private static readonly MAX_REQUESTS = 10;
    private static readonly WINDOW_SECONDS = 120;

    constructor(private readonly redisService: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();
        const clientIp = this.extractClientIp(request);
        const ipHash = createHash('sha256').update(clientIp).digest('hex');
        const redisKey = `ratelimit:public_chat:${ipHash}`;

        try {
            const currentCount = await this.redisService.incrementRateLimit(
                redisKey,
                IpThrottleGuard.WINDOW_SECONDS
            );

            if (currentCount > IpThrottleGuard.MAX_REQUESTS) {
                response.setHeader('Retry-After', String(IpThrottleGuard.WINDOW_SECONDS));
                this.logger.warn(`[PublicChatThrottle] Rate limit reached; ipHash=${ipHash}; hits=${currentCount}`);
                throw new HttpException(
                    {
                        success: false,
                        statusCode: HttpStatus.TOO_MANY_REQUESTS,
                        message: 'Anda telah mencapai batas frekuensi obrolan (maksimal 10 pesan per 2 menit). Silakan coba kembali nanti.',
                        retryAfterSeconds: IpThrottleGuard.WINDOW_SECONDS,
                    },
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }

            return true;
        } catch (error: unknown) {
            if (error instanceof HttpException) throw error;

            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`[PublicChatThrottleError] Redis rate limiter unavailable: ${message}`);
            throw new ServiceUnavailableException('Layanan obrolan sementara tidak tersedia. Silakan coba kembali.');
        }
    }

    private extractClientIp(request: Request): string {
        const candidates = [
            this.firstHeaderValue(request.headers['cf-connecting-ip']),
            this.firstHeaderValue(request.headers['x-forwarded-for']),
            this.firstHeaderValue(request.headers['x-real-ip']),
            request.ip,
            request.socket.remoteAddress,
        ];

        for (const candidate of candidates) {
            if (candidate && isIP(candidate)) return candidate;
        }

        return 'unknown';
    }

    private firstHeaderValue(value: string | string[] | undefined): string | undefined {
        const header = Array.isArray(value) ? value[0] : value;
        return header?.split(',')[0]?.trim();
    }
}