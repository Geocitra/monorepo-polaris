import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CitizenAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Silakan login dengan akun Google terlebih dahulu untuk mengirim komentar.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Verifikasi peran: Wajib bertipe CITIZEN
      if (payload.role !== 'CITIZEN') {
        throw new UnauthorizedException('Sesi tidak valid untuk pengguna publik.');
      }

      request.citizen = {
        citizenId: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Sesi akun Google Anda telah berakhir. Silakan login kembali.');
    }
  }
}
