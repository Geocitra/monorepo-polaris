import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Hanya pengguna dengan role SUPERADMIN murni yang boleh mengakses
    if (
      !user ||
      !user.isSuperadmin ||
      user.role !== 'SUPERADMIN' ||
      user.isOperator === true ||
      user.role === 'CONTENT_OPERATOR' ||
      user.role === 'SUPPORT_OPERATOR'
    ) {
      throw new ForbiddenException('Akses ditolak: Hanya Superadmin POLARIS yang diizinkan mengakses kontrol ini.');
    }

    return true;
  }
}
