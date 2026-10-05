import { test, expect } from '@playwright/test';
import { DewanStudioPageModel } from './page-objects/DewanStudioPageModel.js';

test.describe('E2E Journey 3: Dewan Executive Studio & 1-Click Publishing', () => {
  test('dewan memasukkan topik kebijakan, memantau progres, dan menerbitkan naskah', async ({ page }) => {
    // 1. Set cookie session auth dewan terverifikasi
    await page.context().addCookies([
      {
        name: 'polaris_session',
        value: 'mock-valid-dewan-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock endpoint profil dewan
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'tenant-uuid-1',
          fullName: 'Dr. H. Ahmad Fauzi, M.Si.',
          partyAffiliation: 'Golkar',
          subdomain: 'ahmad-fauzi',
        }),
      });
    });

    // Mock billing status aktif
    await page.route('**/api/v1/billing/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          subscriptionStatus: 'ACTIVE',
          planTier: 'PRO',
          currentPeriodEnd: '2027-01-01T00:00:00Z',
          quota: { isUnlimited: true },
        }),
      });
    });

    // Mock trigger generate artikel (HTTP 202)
    await page.route('**/api/v1/studio/generate', async (route) => {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: 'job-mock-123',
          publicationId: 'pub-mock-456',
          status: 'GENERATING',
        }),
      });
    });

    // Mock publish artikel
    await page.route('**/api/v1/studio/articles/*/publish', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Artikel resmi dipublikasikan ke Website Pribadi Dewan.',
          canonicalUrl: 'https://ahmad-fauzi.polaris.id/artikel/kajian-pupuk',
        }),
      });
    });

    const studioPage = new DewanStudioPageModel(page);
    await studioPage.gotoStudio();

    await studioPage.submitNewTopic('Optimalisasi Penyaluran Pupuk Subsidi Sektor Pertanian');

    // Simulasi respons konten siap dari worker
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mock-job-completed'));
    });

    // Publikasi naskah ke website publik dewan
    await studioPage.publishToWebsite();
  });
});
