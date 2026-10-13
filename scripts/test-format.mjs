import { InstagramMediaFormatter } from '../packages/storage/dist/index.mjs';

async function run() {
  try {
    const res = await InstagramMediaFormatter.formatForFeed({
      sourceUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      tenantId: 'a28b7732-8960-4dff-a3c9-be70c15492b6',
      jobId: 'test-job-1'
    });
    console.log('RESULT:', res);
  } catch (err) {
    console.error('ERROR IN FORMATTER:', err);
  }
}

run();
