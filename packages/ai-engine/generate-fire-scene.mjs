import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';

dotenv.config({ path: '../../.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  console.log('Generating AI fire disaster documentary scene with DALL-E 3...');

  const prompt = `
A dramatic, high-impact photojournalistic documentary photograph in the style of Time Magazine / Reuters of an urban fire disaster aftermath in an authentic dense Indonesian neighborhood (pemukiman padat).
In the center foreground, emotional Indonesian community residents and emergency responders wearing soot-stained gear are consoling each other with deep human empathy amidst smoking charred wooden ruins, glowing embers, and fire hoses on the ground.
Behind them in the upper background, dark moody smoke-filled night sky with glowing crimson red and amber concentric heatwave ripple rings radiating outwards.
Gritty 35mm film documentary texture, authentic cinematic lighting with orange fire embers and cool twilight contrast.
CRITICAL MANDATE: Absolutely ZERO text, ZERO letters, ZERO words, ZERO headlines, ZERO numbers, ZERO newspaper clippings, ZERO logos, and ZERO watermarks anywhere on the image. Pure dramatic documentary photography only.
  `.trim();

  const response = await openai.images.generate({
    model: 'chatgpt-image-latest',
    prompt,
    n: 1,
  });

  const first = response.data?.[0];
  let buffer;

  if (first?.b64_json) {
    console.log('Received b64_json from chatgpt-image-latest');
    buffer = Buffer.from(first.b64_json, 'base64');
  } else if (first?.url) {
    console.log('Got URL:', first.url);
    const fetchRes = await fetch(first.url);
    buffer = Buffer.from(await fetchRes.arrayBuffer());
  } else {
    throw new Error('No image data returned: ' + JSON.stringify(response));
  }

  await fs.writeFile('../../uploads/fire_disaster_raw_ai.png', buffer);
  console.log('SUCCESS: Saved raw AI scene to ../../uploads/fire_disaster_raw_ai.png (size:', buffer.length, 'bytes)');
}

run().catch(console.error);
