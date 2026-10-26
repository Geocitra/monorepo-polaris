import { chromium } from 'playwright-core';

async function test() {
  console.log('Testing Native Chromium launch via playwright-core...');
  const start = Date.now();
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  console.log('Launched native Chromium in', Date.now() - start, 'ms!');
  
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;width:1080px;height:1350px;background:linear-gradient(135deg,#064e3b,#047857);color:white;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
        <h1 style="font-size:64px;letter-spacing:4px;">NATIVE PLAYWRIGHT CHROMIUM OK</h1>
      </body>
    </html>
  `);
  const buf = await page.screenshot({ type: 'webp', quality: 90 });
  console.log('Rendered screenshot, size:', buf.length, 'bytes');
  await page.close();
  await browser.close();
  console.log('Total time:', Date.now() - start, 'ms');
}

test().catch(console.error);
