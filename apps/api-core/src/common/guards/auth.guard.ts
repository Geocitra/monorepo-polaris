import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { db, operatorTenantAssignments, eq, and } from '@polaris/database';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.query && request.query.token) {
      token = request.query.token as string;
    }

    if (!token) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload?.sub || typeof payload.sub !== 'string' || !payload.sub.trim()) {
        throw new UnauthorizedException('Token autentikasi tidak valid.');
      }

      const role = payload.role || 'MEMBER';
      const isOperatorRole = role === 'CONTENT_OPERATOR' || role === 'SUPPORT_OPERATOR';
      const isSuperadminRole = role === 'SUPERADMIN' && payload.isSuperadmin === true;

      // Cek apakah request menyertakan header Delegated Context Switching
      const actingTenantId = (request.headers['x-acting-tenant-id'] || request.query?.actingTenantId) as string | undefined;

      if ((isOperatorRole || isSuperadminRole) && actingTenantId) {
        // Enforce Restriksi Keamanan Operator: Cegah modifikasi kredensial, billing, sosmed OAuth, dan PII
        const reqPath = (request.path || request.url || '').toLowerCase();
        const reqMethod = (request.method || 'GET').toUpperCase();

        const isRestrictedPath =
          (reqPath.includes('/identity') && reqMethod !== 'GET') ||
          (reqPath.includes('/billing') && reqMethod !== 'GET') ||
          reqPath.includes('/social/connect') ||
          reqPath.includes('/pii-vault') ||
          (reqPath.includes('/tenant') && reqMethod === 'DELETE');

        if (isRestrictedPath && !isSuperadminRole) {
          throw new ForbiddenException(
            'Akses Ditolak: Operator dilarang memodifikasi kredensial, struktur profil, paket billing, atau data privat dewan.'
          );
        }

        // Verifikasi penugasan aktif jika pemanggil adalah CONTENT_OPERATOR
        let canDirectPublish = false;
        if (isOperatorRole && !isSuperadminRole) {
          const [assignment] = await db
            .select()
            .from(operatorTenantAssignments)
            .where(
              and(
                eq(operatorTenantAssignments.operatorId, payload.sub),
                eq(operatorTenantAssignments.tenantId, actingTenantId),
                eq(operatorTenantAssignments.status, 'ACTIVE')
              )
            )
            .limit(1);

          if (!assignment) {
            throw new ForbiddenException(
              'Akses Ditolak: Anda tidak memiliki penugasan aktif untuk mengelola profil dewan ini.'
            );
          }
          canDirectPublish = assignment.canDirectPublish;
        } else if (isSuperadminRole) {
          canDirectPublish = true;
        }

        request.user = {
          tenantId: actingTenantId,
          operatorId: payload.sub,
          email: payload.email,
          role: role,
          isSuperadmin: isSuperadminRole,
          isOperator: true,
          canDirectPublish,
          mustChangePassword: false,
        };

        return true;
      }

      // Default Member atau Operator/Superadmin tanpa acting tenant context
      request.user = {
        tenantId: payload.sub,
        email: payload.email,
        subdomainSlug: payload.subdomainSlug,
        role: role,
        isSuperadmin: isSuperadminRole,
        isOperator: isOperatorRole,
        operatorId: isOperatorRole ? payload.sub : undefined,
        mustChangePassword: payload.mustChangePassword === true,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token autentikasi tidak valid atau telah kadaluwarsa.');
    }
  }
}
