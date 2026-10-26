import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(__dirname, scriptName)], {
      stdio: 'inherit',
    });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} failed with code ${code}`));
    });
  });
}

async function main() {
  console.log('>>> RUNNING COMPLETE DATABASE SETUP (MIGRATE & SEED) <<<\n');
  await runScript('db-migrate.mjs');
  console.log('\n>>> MIGRATION COMPLETE, STARTING SEEDERS <<<\n');
  await runScript('db-seed.mjs');
  console.log('\n>>> DATABASE SETUP COMPLETED WITH 100% SUCCESS <<<\n');
}

main().catch((err) => {
  console.error('\nDATABASE SETUP FAILED:', err.message);
  process.exit(1);
});
