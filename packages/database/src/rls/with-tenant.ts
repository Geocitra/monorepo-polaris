import { sql } from 'drizzle-orm';
import { db } from '../client.js';
import { tenantContextStorage } from './tenant-context.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * withTenantContext mengeksekusi operasi database dalam isolasi Row-Level Security (RLS).
 * Perintah `SET LOCAL` memastikan tenant_id disuntikkan hanya untuk transaksi saat ini
 * dan otomatis dibersihkan saat transaksi selesai.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  if (!UUID_PATTERN.test(tenantId)) {
    throw new Error('A valid tenant UUID is required for an RLS transaction.');
  }

  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    await tx.execute(sql`SELECT set_config('app.public_feedback_ticket', '', true)`);

    return await tenantContextStorage.run(
      { tenantId, database: tx },
      () => callback(tx as unknown as typeof db)
    );
  });
}

export async function withPublicFeedbackTicket<T>(
  ticketCode: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  if (!ticketCode.trim() || ticketCode.length > 30) {
    throw new Error('A valid public feedback ticket is required.');
  }

  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.public_feedback_ticket', ${ticketCode}, true)`);

    return await tenantContextStorage.run(
      { publicFeedbackTicket: ticketCode, database: tx },
      () => callback(tx as unknown as typeof db)
    );
  });
}
