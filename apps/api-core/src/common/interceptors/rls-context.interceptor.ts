import {
    ForbiddenException,
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { defer, defaultIfEmpty, from, lastValueFrom, type Observable } from 'rxjs';
import { withTenantContext } from '@polaris/database';
import { SKIP_RLS_CONTEXT_KEY } from '../decorators/skip-rls-context.decorator.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class RlsContextInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const skipRlsContext = this.reflector.getAllAndOverride<boolean>(SKIP_RLS_CONTEXT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipRlsContext) return next.handle();

        const request = context.switchToHttp().getRequest<{
            user?: { tenantId?: string; isSuperadmin?: boolean; role?: string };
            headers?: { accept?: string };
        }>();
        const user = request.user;

        if (!user || user.isSuperadmin || user.role === 'SUPERADMIN') {
            return next.handle();
        }

        if (request.headers?.accept?.includes('text/event-stream')) {
            return next.handle();
        }

        if (!user.tenantId || !UUID_PATTERN.test(user.tenantId)) {
            throw new ForbiddenException('Sesi tenant tidak valid untuk mengakses data terlindungi.');
        }

        return defer(() =>
            from(
                withTenantContext(user.tenantId!, async () =>
                    lastValueFrom(next.handle().pipe(defaultIfEmpty(undefined)))
                )
            )
        );
    }
}