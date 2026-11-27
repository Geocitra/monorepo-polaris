import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve(process.cwd(), 'package.json'));
const postgres = require('postgres');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const dir of [process.cwd(), path.resolve(process.cwd(), '../..')]) {
    const envPath = path.resolve(dir, '.env');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      const m = raw.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (m) return m[1];
    }
  }
  throw new Error('DATABASE_URL tidak ditemukan di env atau .env');
}

const sql = postgres(loadDatabaseUrl(), { max: 1 });
const dummyOrgId = '00000000-0000-4000-8000-000000000001';
const dummyUnitId = '00000000-0000-4000-8000-000000000002';
const dummyTenantId = '00000000-0000-4000-8000-000000000003';

const checks = [
  {
    name: 'lkpj_findings + lkpj_evaluation_workspaces join',
    run: () => sql`
      SELECT f.opd_name AS "opdName", f.indicator_or_issue AS "indicatorOrIssue",
             f.target_value AS "targetValue", f.realization_value AS "realizationValue",
             f.budget_ceiling_idr AS "budgetCeilingIdr", f.budget_realization_idr AS "budgetRealizationIdr",
             f.proposed_recommendation AS "recommendationDraft"
      FROM lkpj_findings f
      JOIN lkpj_evaluation_workspaces w ON f.workspace_id = w.id
      WHERE w.organization_id = ${dummyOrgId}::uuid
        AND (w.assigned_discussion_unit_id IS NULL OR w.assigned_discussion_unit_id = ${dummyUnitId}::uuid)
      ORDER BY f.updated_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'lkpj_evaluation_workspaces proactive lookup',
    run: () => sql`
      SELECT title, fiscal_year AS "fiscalYear"
      FROM lkpj_evaluation_workspaces
      WHERE organization_id = ${dummyOrgId}::uuid
        AND (assigned_discussion_unit_id IS NULL OR assigned_discussion_unit_id = ${dummyUnitId}::uuid)
      ORDER BY updated_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'legislation_drafts lookup',
    run: () => sql`
      SELECT title, document_category AS "documentCategory", current_stage AS "currentStage", problem_statement AS "problemStatement"
      FROM legislation_drafts
      WHERE organization_id = ${dummyOrgId}::uuid
      ORDER BY updated_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'datahub_document_refs proactive lookup',
    run: () => sql`
      SELECT COALESCE(custom_title, category_tag) AS title
      FROM datahub_document_refs
      WHERE organization_id = ${dummyOrgId}::uuid AND organization_unit_id = ${dummyUnitId}::uuid
      ORDER BY created_at DESC
      LIMIT 1;
    `,
  },
  {
    name: 'organization_units lookup',
    run: () => sql`
      SELECT u.id, u.code, u.name, u.focus_sectors AS "focusSectors", u.partner_opds AS "partnerOpds",
             pu.name AS "parentUnitName", pu.unit_type AS "parentUnitType"
      FROM organization_units u
      LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
      WHERE u.id = ${dummyUnitId}::uuid AND u.organization_id = ${dummyOrgId}::uuid;
    `,
  },
  {
    name: 'institutional_chat_sessions + institutional_chat_messages lookup',
    run: () => sql`
      SELECT s.id, m.detected_mode, m.routed_agents, m.used_citations, m.generated_image_url
      FROM institutional_chat_sessions s
      LEFT JOIN institutional_chat_messages m ON m.session_id = s.id
      WHERE s.organization_id = ${dummyOrgId}::uuid AND s.unit_id = ${dummyUnitId}::uuid AND s.tenant_id = ${dummyTenantId}::uuid
      LIMIT 1;
    `,
  },
];

let failed = 0;
try {
  for (const chk of checks) {
    try {
      await chk.run();
      console.log(`✓ [DB-SMOKE] ${chk.name}`);
    } catch (err) {
      failed++;
      console.error(`✗ [DB-SMOKE] ${chk.name} GAGAL: ${err.message}`);
    }
  }
} finally {
  await sql.end();
}

if (failed > 0) {
  process.exit(1);
}
console.log('✓ Semua query SQL B2B Chat-First terverifikasi terhadap PostgreSQL nyata.');
