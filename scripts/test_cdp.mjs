import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import http from 'node:http';

function checkCdpReady(port = 9222) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function testCDP() {
  console.log('Checking if Chrome CDP is running on port 9222...');
  let ready = await checkCdpReady(9222);
  let chromeProcess;

  if (!ready) {
    console.log('Launching persistent Chrome daemon with --remote-debugging-port=9222...');
    const chromePath = '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe';
    chromeProcess = spawn(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=0.0.0.0',
      '--no-first-run',
      '--no-default-browser-check',
      '--user-data-dir=C:\\Users\\PC\\AppData\\Local\\Temp\\polaris_chrome_profile',
    ], {
      detached: true,
      stdio: 'ignore',
    });
    chromeProcess.unref();

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (await checkCdpReady(9222)) {
        ready = true;
        break;
      }
    }
  }

  console.log('CDP Ready:', ready);
  if (!ready) {
    throw new Error('Chrome CDP failed to start on port 9222');
  }

  console.log('Connecting via Playwright connectOverCDP...');
  const t0 = Date.now();
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  console.log('Connected in', Date.now() - t0, 'ms! Creating isolated page...');

  const t1 = Date.now();
  const context = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
  const page = await context.newPage();
  console.log('Tab created in', Date.now() - t1, 'ms!');

  const t2 = Date.now();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;width:1080px;height:1350px;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
        <h1 style="font-size:54px;letter-spacing:4px;color:#38bdf8;">POLARIS SINGLETON CHROME WARM!</h1>
      </body>
    </html>
  `);
  const buf = await page.screenshot({ type: 'webp', quality: 90 });
  console.log('Rendered and captured screenshot in', Date.now() - t2, 'ms! Size:', buf.length, 'bytes');

  await page.close();
  await context.close();
  console.log('Ephemeral context closed cleanly! Chrome daemon stays alive.');
}

testCDP().catch(console.error);
