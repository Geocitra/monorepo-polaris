import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === 'production';

    // Logging internal aman (hanya ke log server, tidak dikirim ke client)
    if (status >= 500) {
      const errorStack = exception instanceof Error ? exception.stack : 'Unknown stack';
      this.logger.error(
        `[UnhandledException] ${request.method} ${request.url} - Status ${status} - Error: ${
          exception instanceof Error ? exception.message : 'Unknown'
        }\n${errorStack}`
      );
    }

    // Sanitasi pesan response untuk klien
    let clientMessage: any;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      clientMessage = typeof res === 'object' ? res : { message: res };
    } else {
      // PROTECTED VARIATIONS: Di mode produksi, jangan pernah membocorkan query error / stack trace!
      clientMessage = {
        message: isProduction
          ? 'Terjadi kendala internal pada server. Tim teknis telah menerima log insiden ini.'
          : (exception as Error).message || 'Terjadi kesalahan internal pada server.',
      };
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: clientMessage,
    });
  }
}
