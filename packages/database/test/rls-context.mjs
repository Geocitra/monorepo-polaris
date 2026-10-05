import assert from 'node:assert/strict';
import { sql } from 'drizzle-orm';
import { db, pgClient, withPublicFeedbackTicket, withTenantContext } from '../dist/index.mjs';

const tenantId = '11111111-1111-4111-8111-111111111111';

try {
    const inScopeValues = await withTenantContext(tenantId, async (transaction) => {
        const [transactionValue] = await transaction.execute(
            sql`SELECT current_setting('app.current_tenant_id', true) AS tenant_id`
        );
        const [routedValue] = await db.execute(
            sql`SELECT current_setting('app.current_tenant_id', true) AS tenant_id`
        );
        return [transactionValue.tenant_id, routedValue.tenant_id];
    });

    assert.deepEqual(inScopeValues, [tenantId, tenantId]);

    const ticketValues = await withPublicFeedbackTicket('#CS-RLS-ONLY-A', async (transaction) => {
        const [transactionValue] = await transaction.execute(
            sql`SELECT current_setting('app.public_feedback_ticket', true) AS ticket`
        );
        const [routedValue] = await db.execute(
            sql`SELECT current_setting('app.public_feedback_ticket', true) AS ticket`
        );
        return [transactionValue.ticket, routedValue.ticket];
    });
    assert.deepEqual(ticketValues, ['#CS-RLS-ONLY-A', '#CS-RLS-ONLY-A']);

    const [afterTransaction] = await db.execute(
        sql`SELECT NULLIF(current_setting('app.current_tenant_id', true), '') AS tenant_id,
               NULLIF(current_setting('app.public_feedback_ticket', true), '') AS ticket`
    );
    assert.equal(afterTransaction.tenant_id, null);
    assert.equal(afterTransaction.ticket, null);

    console.log('RLS transaction routing and local setting cleanup passed');
} finally {
    await pgClient.end();
}