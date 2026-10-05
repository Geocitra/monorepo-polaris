import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isSuperadmin) {
      throw new ForbiddenException('Akses ditolak: Hanya Superadmin POLARIS yang diizinkan mengakses endpoint ini.');
    }

    return true;
  }
}
