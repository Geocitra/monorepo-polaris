import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { resolveTenantAccountClaims } from '../../modules/identity/services/account-mode.helper.js';

/**
 * Guard isolasi modul B2C (Portal Pribadi, Studio Konten, Billing Personal, Aspirasi, Datahub).
 * Menolak akses akun B2B_ONLY agar workspace Instansi B2B dan Perseorangan B2C tetap terisolasi.
 */
@Injectable()
export class B2cAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.tenantId) {
      return true;
    }

    if (user.isSuperadmin || user.isOperator) {
      return true;
    }

    let accountMode = user.accountMode;
    if (!accountMode) {
      const claims = await resolveTenantAccountClaims(user.tenantId);
      accountMode = claims.accountMode;
      user.accountMode = accountMode;
    }

    if (accountMode === 'B2B_ONLY') {
      throw new ForbiddenException(
        'Akses ditolak: Modul ini khusus akun Perseorangan (B2C) atau Hybrid. Akun Instansi B2B tidak memiliki akses ke portal pribadi.'
      );
    }

    return true;
  }
}
