import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { db, pgClient, sql, tenantContextStorage } from '../dist/index.mjs';

const testTenantId = crypto.randomUUID();
const orgAId = crypto.randomUUID();
const orgBId = crypto.randomUUID();
const draftAId = crypto.randomUUID();

console.log('=== RUNNING FASE 3 PARLIAMENTARY LEGISLATION, COMPLIANCE & EVIDENCE REGISTER TESTS ===');

try {
  // 1. Verifikasi Seed Basis Pengetahuan Hukum Standar Indonesia (termasuk UU 1/2026)
  const seededRules = await db.execute(sql`
    SELECT rule_code, verification_status
    FROM legal_knowledge_versions
    WHERE jurisdiction_region = 'NASIONAL'
  `);
  const ruleCodes = (seededRules.rows || seededRules).map((r) => r.rule_code);
  assert.equal(ruleCodes.includes('UUD-1945'), true);
  assert.equal(ruleCodes.includes('UU-12-2011-JO-UU-1-2026'), true);
  assert.equal(ruleCodes.includes('PP-12-2018'), true);
  assert.equal(ruleCodes.includes('PP-13-2019'), true);
  assert.equal(ruleCodes.includes('PERMENDAGRI-80-2015-JO-120-2018'), true);
  console.log('  [PASS] Test 1: National Legal Knowledge Versioning (incl. UU 1/2026) verified.');

  let rollbackTriggered = false;
  try {
    await db.transaction(async (tx) => {
      await tenantContextStorage.run({ tenantId: testTenantId, database: tx }, async () => {
        await tx.execute(sql`
          INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, legislative_level)
          VALUES (${testTenantId}::uuid, ${`parl.${testTenantId.slice(0, 8)}@dprd.test`}, 'hash', 'Perancang Raperda', '08123450000', 'DPRD_KABUPATEN_KOTA')
        `);

        await tx.execute(sql`
          INSERT INTO organizations (id, code, name, legislative_level, region_name, province_name)
          VALUES
            (${orgAId}::uuid, ${`DPRD-PARL-A-${orgAId.slice(0, 5)}`}, 'DPRD Kabupaten Parlemen A', 'DPRD_KABUPATEN_KOTA', 'Kabupaten A', 'Jawa Barat'),
            (${orgBId}::uuid, ${`DPRD-PARL-B-${orgBId.slice(0, 5)}`}, 'DPRD Kabupaten Parlemen B', 'DPRD_KABUPATEN_KOTA', 'Kabupaten B', 'Jawa Barat')
        `);

        await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${testTenantId}, true)`);
        await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgAId}, true)`);

        await tx.execute(sql`
          INSERT INTO legislation_drafts (id, organization_id, title, document_category, current_stage, created_by_tenant_id)
          VALUES (${draftAId}::uuid, ${orgAId}::uuid, 'Raperda Pelayanan Air Minum Bersih', 'PRODUK_HUKUM', 'PERUMUSAN_RANCANGAN', ${testTenantId}::uuid)
        `);

        // TEST 2: Composite FK fk_legislation_clause_draft_org MUST reject cross-org clause injection
        await tx.execute(sql`SAVEPOINT sp_before_cross_org_clause`);
        let crossOrgClauseRejected = false;
        try {
          await tx.execute(sql`
            INSERT INTO legislation_clauses (draft_id, organization_id, clause_number, clause_text)
            VALUES (${draftAId}::uuid, ${orgBId}::uuid, 'Pasal 1', 'Norma lintas organisasi')
          `);
        } catch {
          crossOrgClauseRejected = true;
          await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_cross_org_clause`);
        }
        assert.equal(
          crossOrgClauseRejected,
          true,
          'Composite FK fk_legislation_clause_draft_org MUST reject cross-organization clause'
        );

        // TEST 3: Composite FK fk_legislation_dim_draft_org MUST reject cross-org DIM entry
        await tx.execute(sql`SAVEPOINT sp_before_cross_org_dim`);
        let crossOrgDimRejected = false;
        try {
          await tx.execute(sql`
            INSERT INTO legislation_dim_entries (draft_id, organization_id, source_party_name, target_clause_ref, issue_summary, proposed_amendment, created_by_tenant_id)
            VALUES (${draftAId}::uuid, ${orgBId}::uuid, 'Fraksi Lain', 'Pasal 1', 'Isu', 'Usul', ${testTenantId}::uuid)
          `);
        } catch {
          crossOrgDimRejected = true;
          await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_cross_org_dim`);
        }
        assert.equal(
          crossOrgDimRejected,
          true,
          'Composite FK fk_legislation_dim_draft_org MUST reject cross-organization DIM entry'
        );
        console.log('  [PASS] Test 2 & 3: Composite FK Cross-Organization Protection on Clauses & DIM verified.');

        // TEST 4: Performance Evidence Register linked cleanly to Studio Publikasi (content_publications)
        // Must set app.current_tenant_id via RLS context (matching RlsContextInterceptor in api-core)
        await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${testTenantId}, true)`);
        const pubId = crypto.randomUUID();
        await tx.execute(sql`
          INSERT INTO content_publications (id, tenant_id, title, slug, excerpt, body_content_markdown, word_count, status, canonical_url, created_context)
          VALUES (${pubId}::uuid, ${testTenantId}::uuid, 'Rekomendasi Air Minum', ${`rekomendasi-air-${pubId.slice(0, 6)}`}, 'Ringkasan', 'Isi siaran pers terverifikasi', 5, 'DRAFT', '/publikasi/test', 'MEMBER')
        `);

        await tx.execute(sql`
          INSERT INTO performance_evidence_registers (
            organization_id, tenant_id, legislation_draft_id, title,
            achievement_level, contribution_scope, evidence_source_ref,
            summary_text, is_verified, linked_publication_id
          )
          VALUES (
            ${orgAId}::uuid, ${testTenantId}::uuid, ${draftAId}::uuid, 'Pengawalan Raperda Air Minum',
            'DIREKOMENDASIKAN', 'KONTRIBUSI_INDIVIDU', 'Risalah Rapat Komisi III Hal. 8',
            'Usulan perbaikan cakupan layanan air minum desa telah direkomendasikan kepada dinas terkait.',
            true, ${pubId}::uuid
          )
        `);

        const [evRow] = await tx.execute(sql`
          SELECT linked_publication_id::text AS pub_id, is_verified
          FROM performance_evidence_registers
          WHERE organization_id = ${orgAId}::uuid
        `);
        assert.equal(evRow.pub_id, pubId);
        assert.equal(evRow.is_verified, true);
        console.log('  [PASS] Test 4: Performance Evidence Register -> Studio Publikasi FK integration verified.');

        throw new Error('__INTENTIONAL_FASE3_ROLLBACK__');
      });
    });
  } catch (err) {
    if (err.message === '__INTENTIONAL_FASE3_ROLLBACK__') {
      rollbackTriggered = true;
    } else {
      throw err;
    }
  }

  assert.equal(rollbackTriggered, true);
  console.log('=== ALL FASE 3 PARLIAMENTARY LEGISLATION & EVIDENCE TESTS PASSED (100%) ===');
} finally {
  await pgClient.end();
}
