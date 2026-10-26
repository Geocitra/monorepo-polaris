import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { db, tenantMembers } from '@polaris/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class ForcePasswordChangeGuard implements CanActivate {
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

    // Jika user belum wajib ganti password atau adalah superadmin, izinkan
    if (!user || !user.mustChangePassword || user.isSuperadmin) {
      return true;
    }

    // Izinkan rute ganti sandi dan profil me
    const path = request.path || request.url || '';
    if (
      path.includes('/auth/force-change-password') ||
      path.includes('/auth/change-password') ||
      path.includes('/auth/me') ||
      path.includes('/auth/logout')
    ) {
      return true;
    }

    // Sinkronisasi status riil dari database: jika user telah mengganti sandi awal,
    // jangan blokir hanya karena JWT token klien masih menyimpan flag mustChangePassword: true
    if (user.tenantId) {
      const [member] = await db
        .select({ mustChangePassword: tenantMembers.mustChangePassword })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, user.tenantId))
        .limit(1);

      if (member && !member.mustChangePassword) {
        user.mustChangePassword = false;
        return true;
      }
    }

    throw new ForbiddenException({
      statusCode: 403,
      error: 'ForcePasswordChangeRequired',
      message: 'Demi keamanan akun Anda, silakan ubah kata sandi awal sebelum melanjutkan.',
      mustChangePassword: true,
    });
  }
}
