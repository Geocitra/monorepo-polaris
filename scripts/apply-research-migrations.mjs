import postgres from '../packages/database/node_modules/postgres/src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let dbUrl = 'postgresql://postgres:admin123@localhost:5432/polaris';
if (fs.existsSync(path.join(rootDir, '.env'))) {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) dbUrl = match[1];
  }
}

const cleanUrl = dbUrl.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
console.log('Connecting to database:', cleanUrl.replace(/:[^:@]+@/, ':****@'));

const sql = postgres(cleanUrl);

async function run() {
  try {
    console.log('\n[1/3] Applying migrations_operator.sql...');
    const operatorSqlPath = path.join(rootDir, 'scripts/migrations_operator.sql');
    if (fs.existsSync(operatorSqlPath)) {
      const operatorSql = fs.readFileSync(operatorSqlPath, 'utf-8');
      await sql.unsafe(operatorSql);
      console.log('  -> migrations_operator.sql applied successfully.');
    } else {
      console.log('  -> Warning: scripts/migrations_operator.sql not found.');
    }

    console.log('\n[2/3] Applying migrations_research.sql...');
    const researchSqlPath = path.join(rootDir, 'packages/database/src/migrations_research.sql');
    if (fs.existsSync(researchSqlPath)) {
      const researchSql = fs.readFileSync(researchSqlPath, 'utf-8');
      await sql.unsafe(researchSql);
      console.log('  -> migrations_research.sql applied successfully.');
    } else {
      console.log('  -> Warning: packages/database/src/migrations_research.sql not found.');
    }

    console.log('\n[3/3] Verifying content_publications columns...');
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_publications'
      ORDER BY column_name;
    `;
    console.log('Current content_publications columns:');
    cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

    const hasResearchJobId = cols.some(c => c.column_name === 'research_job_id');
    const hasOperatorId = cols.some(c => c.column_name === 'created_by_operator_id');
    const hasContext = cols.some(c => c.column_name === 'created_context');

    if (hasResearchJobId && hasOperatorId && hasContext) {
      console.log('\nSUCCESS: All required columns (research_job_id, created_by_operator_id, created_context) are present!');
    } else {
      console.error('\nERROR: Missing columns!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
