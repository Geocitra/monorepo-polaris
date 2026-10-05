import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';

describe('GlobalHttpExceptionFilter Sanitization (Sub-Fase E.4 / UU PDP & ISO 27001)', () => {
  let filter: GlobalHttpExceptionFilter;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockHost: ArgumentsHost;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    const mockResponse = {
      status: mockStatus,
    };

    const mockRequest = {
      method: 'POST',
      url: '/api/v1/billing/checkout',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('Invarian 1: Di lingkungan produksi, 500 error tidak boleh membocorkan stack trace atau query internal', () => {
    process.env.NODE_ENV = 'production';

    const fatalDatabaseError = new Error('FATAL: password authentication failed for user "polaris_admin" at postgres:5432');
    filter.catch(fatalDatabaseError, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        error: {
          message: 'Terjadi kendala internal pada server. Tim teknis telah menerima log insiden ini.',
        },
      })
    );
  });

  it('Invarian 2: Di lingkungan development, pesan error internal diizinkan untuk kemudahan debugging', () => {
    process.env.NODE_ENV = 'development';

    const devError = new Error('Query error in schema definition');
    filter.catch(devError, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        error: {
          message: 'Query error in schema definition',
        },
      })
    );
  });

  it('Invarian 3: HttpException standar (misal: 400 Bad Request) mengembalikan pesan validasi terstruktur', () => {
    const httpEx = new HttpException('Format email salah.', HttpStatus.BAD_REQUEST);
    filter.catch(httpEx, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        error: {
          message: 'Format email salah.',
        },
      })
    );
  });
});
