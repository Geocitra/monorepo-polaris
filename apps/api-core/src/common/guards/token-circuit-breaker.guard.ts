import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { TokenCircuitBreakerService } from '../../modules/billing/token-circuit-breaker.service.js';

@Injectable()
export class TokenCircuitBreakerGuard implements CanActivate {
  private readonly logger = new Logger(TokenCircuitBreakerGuard.name);

  constructor(@Optional() private readonly circuitBreakerService?: TokenCircuitBreakerService) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    if (!this.circuitBreakerService) {
      return true;
    }

    const isOpen = await this.circuitBreakerService.isCircuitOpen();

    if (isOpen) {
      this.logger.error('[CircuitBreakerBlock] Permintaan AI ditolak: Sirkuit berada dalam status OPEN (Saldo deposit habis).');
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          errorCode: 'AI_CIRCUIT_OPEN',
          message:
            'Layanan pemrosesan AI sedang dalam sinkronisasi pemeliharaan kapasitas berkala. Silakan coba sesaat lagi atau hubungi tim administrator.',
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return true;
  }
}
