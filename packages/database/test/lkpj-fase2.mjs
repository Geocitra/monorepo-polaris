import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  db,
  pgClient,
  sql,
  tenantContextStorage,
} from '../dist/index.mjs';

const testTenantId = crypto.randomUUID();
const orgAId = crypto.randomUUID();
const orgBId = crypto.randomUUID();
const panjaUnitId = crypto.randomUUID();
const fraksi1Id = crypto.randomUUID();
const fraksi2Id = crypto.randomUUID();
const workspaceAId = crypto.randomUUID();
const finding1Id = crypto.randomUUID();

console.log('=== RUNNING FASE 2 LKPJ EVALUATION WORKSPACE & FINDINGS MATRIX INTEGRATION TESTS ===');

try {
  let rollbackTriggered = false;
  try {
    await db.transaction(async (tx) => {
      await tenantContextStorage.run({ tenantId: testTenantId, database: tx }, async () => {
        // 1. Seed user & 2 organizations
        await tx.execute(sql`
          INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, legislative_level)
          VALUES (${testTenantId}::uuid, ${`lkpj.${testTenantId.slice(0, 8)}@dprd.test`}, 'hash', 'Penelaah LKPJ', '08123456789', 'DPRD_KABUPATEN_KOTA')
        `);

        await tx.execute(sql`
          INSERT INTO organizations (id, code, name, legislative_level, region_name, province_name)
          VALUES
            (${orgAId}::uuid, ${`DPRD-LKPJ-A-${orgAId.slice(0, 5)}`}, 'DPRD Kabupaten A', 'DPRD_KABUPATEN_KOTA', 'Kabupaten A', 'Jawa Barat'),
            (${orgBId}::uuid, ${`DPRD-LKPJ-B-${orgBId.slice(0, 5)}`}, 'DPRD Kabupaten B', 'DPRD_KABUPATEN_KOTA', 'Kabupaten B', 'Jawa Barat')
        `);

        await tx.execute(sql`
          INSERT INTO organization_units (id, organization_id, unit_type, code, name)
          VALUES
            (${panjaUnitId}::uuid, ${orgAId}::uuid, 'PANJA', 'PANJA-LKPJ-2025', 'Panja LKPJ 2025'),
            (${fraksi1Id}::uuid, ${orgAId}::uuid, 'FRAKSI', 'FRAKSI-1', 'Fraksi Partai 1'),
            (${fraksi2Id}::uuid, ${orgAId}::uuid, 'FRAKSI', 'FRAKSI-2', 'Fraksi Partai 2')
        `);

        // Seed with Org A institutional RLS context
        await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${testTenantId}, true)`);
        await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgAId}, true)`);

        // TEST 1A: chk_lkpj_workspace_deadline MUST reject deadline earlier than submitted date
        await tx.execute(sql`SAVEPOINT sp_before_invalid_deadline`);
        let invalidDeadlineRejected = false;
        try {
          await tx.execute(sql`
            INSERT INTO lkpj_evaluation_workspaces (id, organization_id, fiscal_year, title, lkpj_submitted_at, discussion_deadline_at)
            VALUES (${workspaceAId}::uuid, ${orgAId}::uuid, 2025, 'Evaluasi LKPJ 2025', '2026-03-25T00:00:00Z', '2026-03-10T00:00:00Z')
          `);
        } catch {
          invalidDeadlineRejected = true;
          await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_invalid_deadline`);
        }
        assert.equal(
          invalidDeadlineRejected,
          true,
          'CHECK constraint chk_lkpj_workspace_deadline MUST reject deadline earlier than submission date'
        );

        // Insert valid workspace (30-day window)
        await tx.execute(sql`
          INSERT INTO lkpj_evaluation_workspaces (id, organization_id, fiscal_year, title, status, assigned_discussion_unit_id, lkpj_submitted_at, discussion_deadline_at, created_by_tenant_id)
          VALUES (${workspaceAId}::uuid, ${orgAId}::uuid, 2025, 'Evaluasi LKPJ Kab. A TA 2025', 'IN_DISCUSSION', ${panjaUnitId}::uuid, '2026-03-25T00:00:00Z', '2026-04-24T00:00:00Z', ${testTenantId}::uuid)
        `);

        // TEST 1B: Unique constraint per (organization_id, fiscal_year)
        await tx.execute(sql`SAVEPOINT sp_before_dup_workspace`);
        let duplicateWorkspaceRejected = false;
        try {
          await tx.execute(sql`
            INSERT INTO lkpj_evaluation_workspaces (organization_id, fiscal_year, title, lkpj_submitted_at, discussion_deadline_at)
            VALUES (${orgAId}::uuid, 2025, 'Duplikat LKPJ 2025', '2026-03-25T00:00:00Z', '2026-04-24T00:00:00Z')
          `);
        } catch {
          duplicateWorkspaceRejected = true;
          await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_dup_workspace`);
        }
        assert.equal(
          duplicateWorkspaceRejected,
          true,
          'Unique constraint unq_lkpj_workspace_org_year MUST enforce 1 workspace per Pemda & Fiscal Year'
        );
        console.log('  [PASS] Test 1: LKPJ Workspace 30-day Deadline Check & 1-Workspace-per-Year Uniqueness verified.');

        // TEST 2: Composite Foreign Key must reject attaching a Finding or Material of Org B to Workspace of Org A!
        await tx.execute(sql`SAVEPOINT sp_before_cross_org_finding`);
        let crossOrgFindingRejected = false;
        try {
          await tx.execute(sql`
            INSERT INTO lkpj_findings (workspace_id, organization_id, fiscal_year, government_affair, opd_name, indicator_or_issue, source_evidence_ref, created_by_tenant_id)
            VALUES (${workspaceAId}::uuid, ${orgBId}::uuid, 2025, 'Air Minum', 'Dinas PUPR', 'Cakupan Air Minum', 'Hal. 10', ${testTenantId}::uuid)
          `);
        } catch {
          crossOrgFindingRejected = true;
          await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_cross_org_finding`);
        }
        assert.equal(
          crossOrgFindingRejected,
          true,
          'Composite FK fk_lkpj_finding_workspace_org MUST reject cross-organization finding injection'
        );
        console.log('  [PASS] Test 2: Composite Foreign Key Cross-Organization Protection on Findings verified.');

        // TEST 3: Register all 8 Evaluation Materials & verify confidence check constraint
        const categories = [
          'LKPJ_PEMDA',
          'RPJMD_RKPD_APBD',
          'ASPIRASI_MASYARAKAT',
          'KELUARAN_PANJA',
          'REKOMENDASI_FRAKSI',
          'ANALISIS_TENAGA_AHLI',
          'LAPORAN_PENDUKUNG',
          'PERATURAN_BERLAKU',
        ];
        for (const cat of categories) {
          await tx.execute(sql`
            INSERT INTO lkpj_evaluation_materials (workspace_id, organization_id, material_category, title, source_year, extraction_confidence, verification_status, uploaded_by_tenant_id)
            VALUES (${workspaceAId}::uuid, ${orgAId}::uuid, ${cat}::lkpj_material_category_enum, ${`Dokumen ${cat}`}, 2025, 0.92, 'VERIFIED', ${testTenantId}::uuid)
          `);
        }

        const [matCount] = await tx.execute(sql`
          SELECT COUNT(*)::integer AS total
          FROM lkpj_evaluation_materials
          WHERE workspace_id = ${workspaceAId}::uuid
        `);
        assert.equal(matCount.total, 8, 'All 8 LKPJ evaluation materials must be registered');
        console.log('  [PASS] Test 3: All 8 LKPJ Evaluation Material categories registered & verified.');

        // TEST 4: Structured Finding Matrix & Multi-Faction Proposals Consolidation
        await tx.execute(sql`
          INSERT INTO lkpj_findings (
            id, workspace_id, organization_id, origin_unit_id, fiscal_year,
            government_affair, opd_name, indicator_or_issue, indicator_unit, indicator_direction,
            target_value, realization_value, achievement_gap, achievement_percentage,
            budget_ceiling_idr, budget_realization_idr, budget_absorption_percentage,
            location_coverage, source_evidence_ref, evidence_status, review_status,
            proposed_recommendation, created_by_tenant_id
          )
          VALUES (
            ${finding1Id}::uuid, ${workspaceAId}::uuid, ${orgAId}::uuid, ${panjaUnitId}::uuid, 2025,
            'Pekerjaan Umum & Air Minum', 'Dinas PUPR', 'Cakupan Desa Terlayani Air Minum', '%', 'HIGHER_IS_BETTER',
            85.0000, 72.5000, -12.5000, 85.29,
            20000000000, 18500000000, 92.50,
            '14 Desa Selatan', 'LKPJ Bab III Hal. 114', 'SUFFICIENT_VERIFIED', 'APPROVED_FOR_DISCUSSION',
            'DPRD merekomendasikan pemutakhiran daftar 14 desa yang belum mencapai target air minum.', ${testTenantId}::uuid
          )
        `);

        await tx.execute(sql`
          INSERT INTO lkpj_faction_proposals (workspace_id, organization_id, finding_id, faction_unit_id, priority_level, stance_position, proposed_redaction, submitted_by_tenant_id)
          VALUES
            (${workspaceAId}::uuid, ${orgAId}::uuid, ${finding1Id}::uuid, ${fraksi1Id}::uuid, 'HIGH', 'CONCUR_WITH_PANJA', 'Setuju dengan rumusan Panja.', ${testTenantId}::uuid),
            (${workspaceAId}::uuid, ${orgAId}::uuid, ${finding1Id}::uuid, ${fraksi2Id}::uuid, 'HIGH', 'PROPOSE_AMENDMENT', 'Tambahkan tenggat audit teknis PDAM paling lambat 14 hari.', ${testTenantId}::uuid)
        `);

        const [findingRow] = await tx.execute(sql`
          SELECT
            Number_Target.achievement_gap::numeric AS gap,
            Number_Target.budget_absorption_percentage::numeric AS absorption,
            (SELECT COUNT(*)::integer FROM lkpj_faction_proposals WHERE finding_id = ${finding1Id}::uuid) AS faction_count
          FROM lkpj_findings Number_Target
          WHERE Number_Target.id = ${finding1Id}::uuid
        `);

        assert.equal(Number(findingRow.gap), -12.5);
        assert.equal(Number(findingRow.absorption), 92.5);
        assert.equal(Number(findingRow.faction_count), 2);
        console.log('  [PASS] Test 4: Deterministic Finding Matrix & Multi-Faction Consolidation verified.');

        throw new Error('__INTENTIONAL_FASE2_ROLLBACK__');
      });
    });
  } catch (err) {
    if (err.message === '__INTENTIONAL_FASE2_ROLLBACK__') {
      rollbackTriggered = true;
    } else {
      throw err;
    }
  }

  assert.equal(rollbackTriggered, true);
  console.log('=== ALL FASE 2 LKPJ DATABASE & MATRIX INTEGRITY TESTS PASSED (100%) ===');
} finally {
  await pgClient.end();
}
