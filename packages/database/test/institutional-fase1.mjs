import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  db,
  pgClient,
  sql,
  tenantContextStorage,
  withTenantContext,
  withInstitutionalContext,
  findInstitutionalScopedDatahubChunks,
  findSimilarDatahubChunks,
} from '../dist/index.mjs';

const testTenantA = crypto.randomUUID();
const testTenantB = crypto.randomUUID();
const testOrgId = crypto.randomUUID();
const fraksiAId = crypto.randomUUID();
const bidangA1Id = crypto.randomUUID(); // Fraksi A -> Bidang A (Infrastruktur)
const bidangA2Id = crypto.randomUUID(); // Fraksi A -> Bidang B (Kesehatan)
const fraksiBBidangId = crypto.randomUUID(); // Fraksi B -> Bidang Infrastruktur

console.log('=== RUNNING FASE 1 INSTITUTIONAL & SCOPED AI ISOLATION INTEGRATION TESTS ===');

try {
  // ---------------------------------------------------------------------------
  // TEST 1: RLS Context & Nested Transaction Connection Pool Protection
  // ---------------------------------------------------------------------------
  const rlsValues = await withTenantContext(testTenantA, async () => {
    // Nested call inside existing withTenantContext MUST reuse the active transaction
    return await withInstitutionalContext(
      {
        tenantId: testTenantA,
        organizationId: testOrgId,
        unitId: bidangA1Id,
      },
      async (tx) => {
        const [row] = await tx.execute(sql`
          SELECT
            polaris_current_tenant_id()::text AS tenant_id,
            polaris_current_org_id()::text AS org_id,
            polaris_current_unit_id()::text AS unit_id
        `);
        return row;
      }
    );
  });

  assert.equal(rlsValues.tenant_id, testTenantA);
  assert.equal(rlsValues.org_id, testOrgId);
  assert.equal(rlsValues.unit_id, bidangA1Id);

  const [afterTx] = await db.execute(sql`
    SELECT
      polaris_current_tenant_id() AS tenant_id,
      polaris_current_org_id() AS org_id,
      polaris_current_unit_id() AS unit_id
  `);
  assert.equal(afterTx.tenant_id, null);
  assert.equal(afterTx.org_id, null);
  assert.equal(afterTx.unit_id, null);
  console.log('  [PASS] Test 1: RLS Institutional Context & Nested Transaction Reuse verified.');

  // ---------------------------------------------------------------------------
  // TEST 2, 3, 4: Composite FK, Check Constraints, & Vector Scope Isolation
  // Executed inside a rolled-back transaction so production/dev DB stays clean
  // ---------------------------------------------------------------------------
  let rollbackTriggered = false;
  try {
    await db.transaction(async (tx) => {
      await tenantContextStorage.run({ tenantId: testTenantA, database: tx }, async () => {
      // 1. Seed two test tenant members
      await tx.execute(sql`
        INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, party_affiliation, legislative_level)
        VALUES
          (${testTenantA}::uuid, ${`test.a.${testTenantA.slice(0, 8)}@dprd.test`}, 'hash', 'Anggota Bidang A1', '0811111111', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA'),
          (${testTenantB}::uuid, ${`test.b.${testTenantB.slice(0, 8)}@dprd.test`}, 'hash', 'Anggota Non-Instansi', '0822222222', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA');
      `);

      // 2. Seed test Organization & Units (Fraksi A -> Bidang A1 & Bidang A2, Fraksi B -> Bidang)
      await tx.execute(sql`
        INSERT INTO organizations (id, code, name, legislative_level, region_name, province_name)
        VALUES (${testOrgId}::uuid, ${`DPRD-TEST-${testOrgId.slice(0, 6)}`}, 'DPRD Kabupaten Test', 'DPRD_KABUPATEN_KOTA', 'Kabupaten Test', 'Jawa Barat')
      `);

      await tx.execute(sql`
        INSERT INTO organization_units (id, organization_id, parent_unit_id, unit_type, code, name)
        VALUES
          (${fraksiAId}::uuid, ${testOrgId}::uuid, NULL, 'FRAKSI', 'FRAKSI-A', 'Fraksi Partai A'),
          (${bidangA1Id}::uuid, ${testOrgId}::uuid, ${fraksiAId}::uuid, 'BIDANG', 'FRAKSI-A-BID-INFRA', 'Bidang A Infrastruktur'),
          (${bidangA2Id}::uuid, ${testOrgId}::uuid, ${fraksiAId}::uuid, 'BIDANG', 'FRAKSI-A-BID-KES', 'Bidang B Kesehatan'),
          (${fraksiBBidangId}::uuid, ${testOrgId}::uuid, NULL, 'BIDANG', 'FRAKSI-B-BID-INFRA', 'Bidang Infrastruktur Fraksi B')
      `);

      // 3. Register testTenantA in organization_memberships (NOT testTenantB)
      await tx.execute(sql`
        INSERT INTO organization_memberships (organization_id, tenant_id, org_role, status)
        VALUES (${testOrgId}::uuid, ${testTenantA}::uuid, 'MEMBER', 'ACTIVE')
      `);

      await tx.execute(sql`
        INSERT INTO organization_unit_memberships (organization_id, unit_id, tenant_id, unit_role, status)
        VALUES (${testOrgId}::uuid, ${bidangA1Id}::uuid, ${testTenantA}::uuid, 'MEMBER', 'ACTIVE')
      `);

      // TEST 2: Composite Foreign Key must reject assigning testTenantB (not in organization_memberships) to a unit!
      await tx.execute(sql`SAVEPOINT sp_before_orphan_unit_member`);
      let compositeFkRejected = false;
      try {
        await tx.execute(sql`
          INSERT INTO organization_unit_memberships (organization_id, unit_id, tenant_id, unit_role, status)
          VALUES (${testOrgId}::uuid, ${bidangA1Id}::uuid, ${testTenantB}::uuid, 'MEMBER', 'ACTIVE');
        `);
      } catch (fkErr) {
        compositeFkRejected = true;
        await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_orphan_unit_member`);
      }
      assert.equal(
        compositeFkRejected,
        true,
        'Composite FK fk_unit_membership_org_member MUST reject assigning a user not in organization_memberships'
      );
      console.log('  [PASS] Test 2: Composite Foreign Key (Zero Orphan Unit Membership) enforced.');

      // 4. Create 5 test DataHub files & identical vector embeddings to test strict scope filtering
      const fileBidangA1 = crypto.randomUUID();
      const fileBidangA2 = crypto.randomUUID();
      const fileFraksiB = crypto.randomUUID();
      const fileOrgShared = crypto.randomUUID();
      const filePersonal = crypto.randomUUID();

      const unitVector = new Array(1536).fill(0).map((_, i) => (i === 0 ? 1.0 : 0.0));
      const vecLiteral = `[${unitVector.join(',')}]`;

      for (const [fId, label] of [
        [fileBidangA1, 'bidang-a1'],
        [fileBidangA2, 'bidang-a2'],
        [fileFraksiB, 'fraksi-b'],
        [fileOrgShared, 'org-shared'],
        [filePersonal, 'personal'],
      ]) {
        await tx.execute(sql`
          INSERT INTO datahub_files (id, content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status)
          VALUES (${fId}::uuid, ${crypto.createHash('sha256').update(`${fId}-${label}`).digest('hex')}, ${`${label}.pdf`}, 'application/pdf', 1024, '/uploads/test.pdf', 'COMPLETED')
        `);

        await tx.execute(sql`
          INSERT INTO datahub_document_chunks (file_id, chunk_index, section_title, chunk_content, token_count, vector_embedding)
          VALUES (${fId}::uuid, 0, 'Pasal 1', ${`Konten rahasia ${label}`}, 25, ${vecLiteral}::vector)
        `);
      }

      // TEST 3: Check constraint chk_datahub_refs_institutional_scope MUST reject invalid scope combinations
      await tx.execute(sql`SELECT set_config('app.is_superadmin', 'true', true)`);
      await tx.execute(sql`SAVEPOINT sp_before_invalid_scope`);
      let checkConstraintRejected = false;
      try {
        // UNIT_BIDANG without organization_unit_id MUST fail
        await tx.execute(sql`
          INSERT INTO datahub_document_refs (file_id, uploaded_by_tenant_id, organization_id, organization_unit_id, privacy_scope, category_tag)
          VALUES (${fileBidangA1}::uuid, ${testTenantA}::uuid, ${testOrgId}::uuid, NULL, 'UNIT_BIDANG', 'DOKUMEN_INTERNAL');
        `);
      } catch {
        checkConstraintRejected = true;
        await tx.execute(sql`ROLLBACK TO SAVEPOINT sp_before_invalid_scope`);
      }
      assert.equal(
        checkConstraintRejected,
        true,
        'CHECK constraint chk_datahub_refs_institutional_scope MUST reject UNIT_BIDANG with NULL organization_unit_id'
      );
      console.log('  [PASS] Test 3: Database CHECK Constraint (chk_datahub_refs_institutional_scope) enforced.');

      // 5. Insert valid document references across the 5 scopes
      await tx.execute(sql`
        INSERT INTO datahub_document_refs (file_id, uploaded_by_tenant_id, organization_id, organization_unit_id, custom_title, privacy_scope, category_tag, party_affiliation, legislative_level)
        VALUES
          -- 1. Dokumen Bidang A1 (Fraksi A -> Bidang Infrastruktur)
          (${fileBidangA1}::uuid, ${testTenantA}::uuid, ${testOrgId}::uuid, ${bidangA1Id}::uuid, 'Kajian Bidang A1 Infrastruktur', 'UNIT_BIDANG', 'KAJIAN_AKADEMIS', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA'),
          -- 2. Dokumen Bidang A2 (Fraksi A -> Bidang Kesehatan) - HARUS TERISOLASI DARI BIDANG A1!
          (${fileBidangA2}::uuid, ${testTenantA}::uuid, ${testOrgId}::uuid, ${bidangA2Id}::uuid, 'Kajian Bidang A2 Kesehatan', 'UNIT_BIDANG', 'KAJIAN_AKADEMIS', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA'),
          -- 3. Dokumen Fraksi B - HARUS TERISOLASI DARI FRAKSI A!
          (${fileFraksiB}::uuid, ${testTenantA}::uuid, ${testOrgId}::uuid, ${fraksiBBidangId}::uuid, 'Strategi Internal Fraksi B', 'UNIT_BIDANG', 'DOKUMEN_INTERNAL', 'PARTAI_B', 'DPRD_KABUPATEN_KOTA'),
          -- 4. Dokumen Resmi Sekretariat (ORG_SHARED) - BOLEH DIAKSES OLEH SEMUA BIDANG DI DPRD INI
          (${fileOrgShared}::uuid, ${testTenantA}::uuid, ${testOrgId}::uuid, NULL, 'LKPJ Resmi Sekretariat DPRD', 'ORG_SHARED', 'REGULASI_DAERAH', NULL, 'DPRD_KABUPATEN_KOTA'),
          -- 5. Dokumen Pribadi Mode Personal (PRIVATE_TENANT) - TIDAK BOLEH BOCOR KE MODE INSTANSI!
          (${filePersonal}::uuid, ${testTenantA}::uuid, NULL, NULL, 'Catatan Pribadi Dapil', 'PRIVATE_TENANT', 'DOKUMEN_INTERNAL', 'PARTAI_A', 'DPRD_KABUPATEN_KOTA');
      `);
      await tx.execute(sql`SELECT set_config('app.is_superadmin', '', true)`);

      // TEST 4A: Query RAG inside Bidang A1 (Fraksi A -> Bidang Infrastruktur)
      const bidangA1Chunks = await withInstitutionalContext(
        {
          tenantId: testTenantA,
          organizationId: testOrgId,
          unitId: bidangA1Id,
        },
        async () => {
          return await findInstitutionalScopedDatahubChunks({
            queryEmbedding: unitVector,
            organizationId: testOrgId,
            activeUnitId: bidangA1Id,
            includeOrgSharedDocuments: true,
            limit: 10,
            minSimilarityScore: 0.1,
          });
        }
      );

      const retrievedFileIds = bidangA1Chunks.map((c) => c.fileId);
      assert.equal(
        retrievedFileIds.includes(fileBidangA1),
        true,
        'AI in Bidang A1 MUST access Bidang A1 documents'
      );
      assert.equal(
        retrievedFileIds.includes(fileOrgShared),
        true,
        'AI in Bidang A1 MUST access ORG_SHARED Sekretariat documents of the same Institution'
      );
      assert.equal(
        retrievedFileIds.includes(fileBidangA2),
        false,
        'CRITICAL ISOLATION: AI in Bidang A1 MUST NOT access Bidang A2 documents!'
      );
      assert.equal(
        retrievedFileIds.includes(fileFraksiB),
        false,
        'CRITICAL ISOLATION: AI in Bidang A1 MUST NOT access Fraksi B documents!'
      );
      assert.equal(
        retrievedFileIds.includes(filePersonal),
        false,
        'CRITICAL ISOLATION: AI in Bidang A1 MUST NOT access personal PRIVATE_TENANT documents!'
      );
      console.log('  [PASS] Test 4A: Strict Bidang AI Vector RAG Isolation (Bidang A1 cannot see Bidang A2, Fraksi B, or Personal).');

      // TEST 4B: Query RAG in Personal Mode (findSimilarDatahubChunks)
      const personalChunks = await withTenantContext(testTenantA, async () => {
        return await findSimilarDatahubChunks({
          queryEmbedding: unitVector,
          tenantId: testTenantA,
          partyAffiliation: 'PARTAI_A',
          legislativeLevel: 'DPRD_KABUPATEN_KOTA',
          limit: 10,
          minSimilarityScore: 0.1,
        });
      });

      const personalFileIds = personalChunks.map((c) => c.fileId);
      assert.equal(
        personalFileIds.includes(filePersonal),
        true,
        'Personal mode MUST access tenant personal documents'
      );
      assert.equal(
        personalFileIds.includes(fileBidangA1),
        false,
        'Personal mode MUST NOT leak institutional UNIT_BIDANG documents'
      );
      assert.equal(
        personalFileIds.includes(fileOrgShared),
        false,
        'Personal mode MUST NOT leak institutional ORG_SHARED documents'
      );
      console.log('  [PASS] Test 4B: Personal Workspace RAG Isolation (zero leakage from Institutional documents).');

      // Force rollback so test data is cleaned up 100%
      throw new Error('__INTENTIONAL_TEST_ROLLBACK__');
      });
    });
  } catch (err) {
    if (err.message === '__INTENTIONAL_TEST_ROLLBACK__') {
      rollbackTriggered = true;
    } else {
      throw err;
    }
  }

  assert.equal(rollbackTriggered, true);
  console.log('=== ALL FASE 1 DATABASE & VECTOR ISOLATION TESTS PASSED (100%) ===');
} finally {
  await pgClient.end();
}
