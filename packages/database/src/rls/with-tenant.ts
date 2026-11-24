import { sql } from 'drizzle-orm';
import { db } from '../client.js';
import { tenantContextStorage, type InstitutionalRlsContext } from './tenant-context.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * withTenantContext mengeksekusi operasi database dalam isolasi Row-Level Security (RLS).
 * Perintah `SET LOCAL` memastikan tenant_id (dan opsional organization_id / unit_id)
 * disuntikkan hanya untuk transaksi saat ini dan otomatis dibersihkan saat transaksi selesai.
 *
 * Jika dipanggil di dalam transaksi RLS yang sudah aktif di tenantContextStorage,
 * fungsi ini menggunakan transaksi yang sudah terbuka untuk mencegah nested pool exhaustion (max: 10).
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>,
  institutionalContext?: InstitutionalRlsContext
): Promise<T> {
  if (!UUID_PATTERN.test(tenantId)) {
    throw new Error('A valid tenant UUID is required for an RLS transaction.');
  }

  const orgId = institutionalContext?.organizationId?.trim() || '';
  if (orgId && !UUID_PATTERN.test(orgId)) {
    throw new Error('A valid organization UUID is required for an institutional RLS transaction.');
  }

  const unitId = institutionalContext?.unitId?.trim() || '';
  if (unitId && !UUID_PATTERN.test(unitId)) {
    throw new Error('A valid organization unit UUID is required for an institutional RLS transaction.');
  }

  const existingStore = tenantContextStorage.getStore();
  if (existingStore?.database) {
    const activeTx = existingStore.database as typeof db;
    await activeTx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    await activeTx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
    await activeTx.execute(sql`SELECT set_config('app.current_unit_id', ${unitId}, true)`);
    await activeTx.execute(sql`SELECT set_config('app.public_feedback_ticket', '', true)`);
    await activeTx.execute(sql`SELECT set_config('app.is_superadmin', '', true)`);

    return await tenantContextStorage.run(
      {
        tenantId,
        organizationId: orgId || undefined,
        unitId: unitId || null,
        database: activeTx,
      },
      () => callback(activeTx)
    );
  }

  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', ${unitId}, true)`);
    await tx.execute(sql`SELECT set_config('app.public_feedback_ticket', '', true)`);
    await tx.execute(sql`SELECT set_config('app.is_superadmin', '', true)`);

    return await tenantContextStorage.run(
      {
        tenantId,
        organizationId: orgId || undefined,
        unitId: unitId || null,
        database: tx,
      },
      () => callback(tx as unknown as typeof db)
    );
  });
}

/**
 * withInstitutionalContext adalah wrapper eksplisit untuk mengeksekusi operasi
 * dalam ruang kerja Instansi & Bidang tertentu dengan isolasi RLS penuh.
 */
export async function withInstitutionalContext<T>(
  context: { tenantId: string; organizationId: string; unitId?: string | null },
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await withTenantContext(
    context.tenantId,
    callback,
    {
      organizationId: context.organizationId,
      unitId: context.unitId,
    }
  );
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
    await tx.execute(sql`SELECT set_config('app.current_org_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.public_feedback_ticket', ${ticketCode}, true)`);
    await tx.execute(sql`SELECT set_config('app.is_superadmin', '', true)`);

    return await tenantContextStorage.run(
      { publicFeedbackTicket: ticketCode, database: tx },
      () => callback(tx as unknown as typeof db)
    );
  });
}

/**
 * withSuperadminContext mengeksekusi operasi khusus Superadmin terautentikasi
 * untuk pemantauan lintas-instansi dan manajemen repositori DataHub.
 */
export async function withSuperadminContext<T>(
  adminId: string | undefined,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  const existingStore = tenantContextStorage.getStore();
  if (existingStore?.database) {
    const activeTx = existingStore.database as typeof db;
    await activeTx.execute(sql`SELECT set_config('app.is_superadmin', 'true', true)`);
    return await callback(activeTx);
  }

  return await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.current_org_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.public_feedback_ticket', '', true)`);
    await tx.execute(sql`SELECT set_config('app.is_superadmin', 'true', true)`);

    return await tenantContextStorage.run(
      { tenantId: adminId, database: tx },
      () => callback(tx as unknown as typeof db)
    );
  });
}
