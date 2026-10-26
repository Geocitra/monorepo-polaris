import { chromium } from 'playwright-core';

async function test() {
  console.log('Testing Windows Chrome via executablePath from WSL...');
  const start = Date.now();
  const chromePath = '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe';
  try {
    const browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    console.log('Successfully launched Windows Chrome in', Date.now() - start, 'ms!');
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.setContent('<h1 style="color:red">POLARIS TEST</h1>');
    const buf = await page.screenshot({ type: 'webp' });
    console.log('Screenshot success! Buffer length:', buf.length);
    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Launch failed:', err.message);
  }
}

test();
