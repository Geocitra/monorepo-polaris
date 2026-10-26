import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { db, subscriptions } from '@polaris/database';
import { eq } from 'drizzle-orm';
import { SubscriptionStatus } from '@polaris/shared-types';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      return true; // Diteruskan ke AuthGuard
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
      const statusLabel = sub?.status || 'TIDAK TERDAFTAR';
      const msg = request.user?.isOperator
        ? `Akses AI dibatasi: Status langganan tokoh "${request.user?.tenantId}" saat ini adalah "${statusLabel}". Mohon pastikan paket langganan dewan telah aktif.`
        : 'Akses fitur terkunci. Status langganan Anda sedang tidak aktif atau dalam penangguhan (Suspended).';
      throw new ForbiddenException(msg);
    }

    return true;
  }
}
