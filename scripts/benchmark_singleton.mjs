import { chromium } from 'playwright-core';

async function testSingletonBenchmark() {
  console.log('1. Starting Singleton Chromium...');
  const tStart = Date.now();
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  console.log('Browser initialized in', Date.now() - tStart, 'ms');

  for (let i = 1; i <= 3; i++) {
    const tJob = Date.now();
    const context = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
    const page = await context.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin:0;width:1080px;height:1350px;background:#18181b;color:#facc15;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
          <h1>WARM RENDER #${i}</h1>
        </body>
      </html>
    `);
    const buf = await page.screenshot({ type: 'webp', quality: 90 });
    await page.close();
    await context.close();
    console.log(`Render #${i} finished in ${Date.now() - tJob} ms! Output bytes: ${buf.length}`);
  }

  await browser.close();
}

testSingletonBenchmark().catch(console.error);
