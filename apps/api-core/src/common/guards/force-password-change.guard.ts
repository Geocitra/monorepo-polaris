import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class ForcePasswordChangeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Jika user belum wajib ganti password atau adalah superadmin, izinkan
    if (!user || !user.mustChangePassword || user.isSuperadmin) {
      return true;
    }

    // Izinkan rute ganti sandi dan profil me
    const path = request.path || request.url || '';
    if (
      path.includes('/auth/force-change-password') ||
      path.includes('/auth/me') ||
      path.includes('/auth/logout')
    ) {
      return true;
    }

    throw new ForbiddenException({
      statusCode: 403,
      error: 'ForcePasswordChangeRequired',
      message: 'Demi keamanan akun Anda, silakan ubah kata sandi awal sebelum melanjutkan.',
      mustChangePassword: true,
    });
  }
}
