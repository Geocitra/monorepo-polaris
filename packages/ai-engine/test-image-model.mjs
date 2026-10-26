import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { OpenAI } from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  console.log('Testing chatgpt-image-latest with size 1024x1536...');
  try {
    const res = await client.images.generate({
      model: 'chatgpt-image-latest',
      prompt: 'A peaceful sunrise, no text',
      size: '1024x1536',
      n: 1,
    });
    console.log('SUCCESS with 1024x1536!');
  } catch (err) {
    console.error('FAILED 1024x1536:', err.message);
  }
}

test();
