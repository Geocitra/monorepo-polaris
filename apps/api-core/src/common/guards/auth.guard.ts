import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

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
        throw new UnauthorizedException('Token autentikasi tidak valid atau tidak memiliki tenant aktif.');
      }

      request.user = {
        tenantId: payload.sub,
        email: payload.email,
        subdomainSlug: payload.subdomainSlug,
        role: payload.role || 'MEMBER',
        isSuperadmin: payload.isSuperadmin === true,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token autentikasi tidak valid atau telah kadaluwarsa.');
    }
  }
}
