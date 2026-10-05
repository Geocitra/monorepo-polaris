import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, HttpStatus, HttpException } from '@nestjs/common';
import { TokenCircuitBreakerGuard } from '../src/common/guards/token-circuit-breaker.guard.js';
import { TokenCircuitBreakerService } from '../src/modules/billing/token-circuit-breaker.service.js';

describe('TokenCircuitBreakerGuard & Service (Sub-Fase D.2 Pre-Flight Protection)', () => {
  let mockRedisService: any;
  let mockEmailService: any;
  let circuitBreakerService: TokenCircuitBreakerService;
  let guard: TokenCircuitBreakerGuard;

  beforeEach(() => {
    mockRedisService = {
      get: vi.fn(),
      set: vi.fn(),
      publish: vi.fn(),
    };
    mockEmailService = {
      sendSystemAlertEmail: vi.fn(),
    };

    circuitBreakerService = new TokenCircuitBreakerService(
      mockRedisService as any,
      mockEmailService as any,
    );

    guard = new TokenCircuitBreakerGuard(circuitBreakerService);
  });

  it('harus mengizinkan akses (canActivate -> true) saat sirkuit berada pada status CLOSED', async () => {
    mockRedisService.get.mockResolvedValue('CLOSED');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRedisService.get).toHaveBeenCalledWith(TokenCircuitBreakerService.REDIS_CIRCUIT_KEY);
  });

  it('harus melempar HTTP 503 Service Unavailable saat sirkuit berstatus OPEN (Pre-Flight Fail-Fast)', async () => {
    mockRedisService.get.mockResolvedValue('OPEN');

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(mockContext);
      expect.unreachable('Harus melempar HttpException 503');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = err.getResponse();
      expect(response.errorCode).toBe('AI_CIRCUIT_OPEN');
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    }
  });

  it('harus mengizinkan akses jika redis gagal (fail-safe fallback)', async () => {
    mockRedisService.get.mockRejectedValue(new Error('Redis connection lost'));

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('harus mereset status sirkuit ke CLOSED di Redis saat resetCircuitOnTopup dipanggil', async () => {
    await circuitBreakerService.resetCircuitOnTopup();

    expect(mockRedisService.set).toHaveBeenCalledWith(
      TokenCircuitBreakerService.REDIS_CIRCUIT_KEY,
      'CLOSED',
      86400
    );
  });
});
