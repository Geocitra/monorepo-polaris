import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  db,
  pgClient,
  sql,
  withTenantContext,
  withInstitutionalContext,
} from '../dist/index.mjs';

const tenantA = crypto.randomUUID();
const tenantB = crypto.randomUUID();
const orgA = crypto.randomUUID();
const orgB = crypto.randomUUID();
const bidangA1 = crypto.randomUUID();
const bidangA2 = crypto.randomUUID();
const unitB1 = crypto.randomUUID();

console.log('=== RUNNING POSTGRESQL KERNEL RLS ENFORCEMENT TESTS (NON-SUPERUSER ROLE) ===');

let rollbackTriggered = false;
try {
  await db.transaction(async (tx) => {
    // Seed 2 tenants, 2 orgs, 3 units, memberships & cross-unit data as table owner before SET LOCAL ROLE
    await tx.execute(sql`
      INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, party_affiliation, legislative_level)
      VALUES
        (${tenantA}::uuid, ${`rls.a.${tenantA.slice(0, 8)}@dprd.test`}, 'hash', 'Anggota A1', '0811111111', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA'),
        (${tenantB}::uuid, ${`rls.b.${tenantB.slice(0, 8)}@dprd.test`}, 'hash', 'Anggota A2', '0822222222', 'PARTAI_B', 'DPRD_KABUPATEN_KOTA');
    `);

    await tx.execute(sql`
      INSERT INTO organizations (id, code, name, legislative_level, region_name, province_name)
      VALUES
        (${orgA}::uuid, ${`RLS-A-${orgA.slice(0, 6)}`}, 'DPRD Org A', 'DPRD_KABUPATEN_KOTA', 'Kab. A', 'Jawa Barat'),
        (${orgB}::uuid, ${`RLS-B-${orgB.slice(0, 6)}`}, 'DPRD Org B', 'DPRD_KABUPATEN_KOTA', 'Kab. B', 'Jawa Tengah');
    `);

    await tx.execute(sql`
      INSERT INTO organization_units (id, organization_id, unit_type, code, name)
      VALUES
        (${bidangA1}::uuid, ${orgA}::uuid, 'BIDANG', 'A1', 'Bidang A1'),
        (${bidangA2}::uuid, ${orgA}::uuid, 'BIDANG', 'A2', 'Bidang A2'),
        (${unitB1}::uuid, ${orgB}::uuid, 'BIDANG', 'B1', 'Bidang B1');
    `);

    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantA}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgA}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', ${bidangA1}, true)`);
    await tx.execute(sql`
      INSERT INTO institutional_shared_notes (organization_id, unit_id, author_tenant_id, title, content_markdown, visibility)
      VALUES (${orgA}::uuid, ${bidangA1}::uuid, ${tenantA}::uuid, 'Shared Bidang A1', 'Konten rahasia Bidang A1', 'UNIT_SHARED');
    `);

    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantB}, true)`);
    await tx.execute(sql`
      INSERT INTO institutional_shared_notes (organization_id, unit_id, author_tenant_id, title, content_markdown, visibility)
      VALUES (${orgA}::uuid, ${bidangA1}::uuid, ${tenantB}::uuid, 'Private Draft B di A1', 'Draf pribadi B', 'PRIVATE_DRAFT');
    `);

    await tx.execute(sql`SELECT set_config('app.current_unit_id', ${bidangA2}, true)`);
    await tx.execute(sql`
      INSERT INTO institutional_shared_notes (organization_id, unit_id, author_tenant_id, title, content_markdown, visibility)
      VALUES (${orgA}::uuid, ${bidangA2}::uuid, ${tenantB}::uuid, 'Shared Bidang A2', 'Konten rahasia Bidang A2', 'UNIT_SHARED');
    `);

    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgB}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', ${unitB1}, true)`);
    await tx.execute(sql`
      INSERT INTO institutional_shared_notes (organization_id, unit_id, author_tenant_id, title, content_markdown, visibility)
      VALUES (${orgB}::uuid, ${unitB1}::uuid, ${tenantB}::uuid, 'Shared Org B', 'Konten rahasia Org B', 'UNIT_SHARED');
    `);

    await tx.execute(sql`SELECT set_config('app.is_superadmin', 'true', true)`);
    await tx.execute(sql`
      INSERT INTO legal_knowledge_versions (organization_id, rule_code, title, hierarchy_layer, jurisdiction_region, effective_date, verification_status)
      VALUES
        (NULL, ${`UU-RLS-${orgA.slice(0, 6)}`}, 'UU Nasional Global', 'UU', 'NASIONAL', now(), 'VERIFIED_ACTIVE'),
        (${orgB}::uuid, ${`PERDA-RLS-${orgB.slice(0, 6)}`}, 'Perda Khusus Org B', 'PERDA', 'Kab. B', now(), 'VERIFIED_ACTIVE');
    `);

    // Reset all GUCs (polaris_admin obeys FORCE ROW LEVEL SECURITY directly)
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.current_org_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', '', true)`);
    await tx.execute(sql`SELECT set_config('app.is_superadmin', '', true)`);

    // 1. Query WITHOUT session GUCs MUST return 0 rows (fail-closed)
    const noCtxNotes = await tx.execute(sql`SELECT id, title FROM institutional_shared_notes`);
    assert.equal(noCtxNotes.length, 0, 'Unset RLS context MUST fail closed and return 0 rows');

    // 2. Query as Tenant A inside Org A + Bidang A1 MUST only return 'Shared Bidang A1'
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantA}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgA}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_unit_id', ${bidangA1}, true)`);

    const a1Visible = await tx.execute(sql`SELECT title FROM institutional_shared_notes`);
    assert.equal(a1Visible.length, 1);
    assert.equal(a1Visible[0].title, 'Shared Bidang A1');

    // 3. Cross-Bidang INSERT spoofing MUST throw PostgreSQL RLS error 42501
    let rlsBlockedInsert = false;
    await tx.execute(sql.raw('SAVEPOINT rls_insert_probe'));
    try {
      await tx.execute(sql`
        INSERT INTO institutional_shared_notes (organization_id, unit_id, author_tenant_id, title, content_markdown, visibility)
        VALUES (${orgA}::uuid, ${bidangA2}::uuid, ${tenantA}::uuid, 'Spoofed Insert', 'Hack', 'UNIT_SHARED')
      `);
    } catch (pgErr) {
      rlsBlockedInsert = true;
      await tx.execute(sql.raw('ROLLBACK TO SAVEPOINT rls_insert_probe'));
    }
    assert.equal(rlsBlockedInsert, true, 'PostgreSQL RLS kernel MUST reject cross-bidang INSERT');

    // 4. legal_knowledge_versions MUST expose global (NULL) rules and HIDE Org B's Perda when in Org A
    const visibleRules = await tx.execute(sql`
      SELECT rule_code, organization_id
      FROM legal_knowledge_versions
      WHERE rule_code IN (${`UU-RLS-${orgA.slice(0, 6)}`}, ${`PERDA-RLS-${orgB.slice(0, 6)}`})
    `);
    assert.equal(visibleRules.length, 1, 'Org A must ONLY see global rules and its own rules, NEVER Org B rules');
    assert.equal(visibleRules[0].organization_id, null);

    console.log('  [PASS] PostgreSQL FORCE RLS kernel enforced fail-closed read, Bidang note isolation, Private Draft hiding, and cross-Bidang insert blocking.');
    throw new Error('__INTENTIONAL_RLS_ROLLBACK__');
  });
} catch (err) {
  if (err.message === '__INTENTIONAL_RLS_ROLLBACK__') {
    rollbackTriggered = true;
  } else {
    throw err;
  }
} finally {
  await pgClient.end();
}
assert.equal(rollbackTriggered, true);
