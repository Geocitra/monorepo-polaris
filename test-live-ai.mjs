import { OpenAIAIEngineAdapter } from './packages/ai-engine/dist/index.js';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new OpenAIAIEngineAdapter();

async function main() {
  console.log('Testing OpenAI live call...');
  const r1 = await adapter.generatePublicConcierge({
    userMessage: 'bagaimana dengan generate konten untuk policy brief. apakah aplikasi polaris bisa membuat konten tersebut?'
  });
  console.log('--- OUTPUT 1 (Policy Brief) ---');
  console.log('Reply:', r1.reply);
  console.log('isSafeRefusal:', r1.isSafeRefusal);
  console.log('Tokens:', r1.tokensUsed);

  const r2 = await adapter.generatePublicConcierge({
    userMessage: 'apakah polaris bisa digunakan untuk mengirimkan konten ke sosial media seperti telegram?'
  });
  console.log('\n--- OUTPUT 2 (Telegram) ---');
  console.log('Reply:', r2.reply);
  console.log('isSafeRefusal:', r2.isSafeRefusal);
  console.log('Tokens:', r2.tokensUsed);
}

main().catch(console.error);
