import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { OpenAI } from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function check() {
  const models = await client.models.list();
  console.log('ALL models:', models.data.map(m => m.id));
}
check().catch(console.error);
