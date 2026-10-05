import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface CitizenJwtPayload {
  sub: string; // citizen user id
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: 'CITIZEN';
}

@Injectable()
export class CitizenAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Sesi masuk akun warga tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync<CitizenJwtPayload>(token);
      if (payload.role !== 'CITIZEN') {
        throw new ForbiddenException('Akses ditolak: Token bukan merupakan identitas warga.');
      }
      request.citizen = payload;
      return true;
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Sesi login warga telah kadaluwarsa. Silakan masuk kembali.');
    }
  }
}
