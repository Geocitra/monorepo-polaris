import { test, expect } from '@playwright/test';
import { CitizenPortalPageModel } from './page-objects/CitizenPortalPageModel.js';

test.describe('E2E Journey 2: Public Civic Interaction (/lapor & Tiket #CS)', () => {
  test('warga dapat mengirimkan aspirasi dan menerima nomor tiket pelacakan', async ({ page }) => {
    const portalPage = new CitizenPortalPageModel(page);

    // Mock API submit aspirasi
    await page.route('**/api/v1/constituent/submit', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Aspirasi Anda berhasil dicatat secara resmi oleh sistem POLARIS.',
          trackingTicketCode: '#CS-20261005-AB12',
          submittedAt: new Date().toISOString(),
          status: 'RECEIVED',
        }),
      });
    });

    await portalPage.gotoLapor('ahmad-fauzi');

    await portalPage.submitAspiration({
      name: 'Budi Santoso',
      phone: '081234567890',
      regency: 'Kabupaten Cirebon',
      district: 'Kecamatan Waled',
      message: 'Jalan poros penghubung desa ambles akibat luapan sungai, mohon ditinjau komisi.',
    });

    const ticketCode = await portalPage.getGeneratedTicketCode();
    expect(ticketCode).toContain('#CS-20261005-AB12');

    // Verifikasi tombol lacak status tiket tersedia
    const trackButton = page.locator('a:has-text("Lacak Status Tiket")');
    await expect(trackButton).toBeVisible();
  });
});
