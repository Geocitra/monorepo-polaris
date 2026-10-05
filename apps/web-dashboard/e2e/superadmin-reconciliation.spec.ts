import { test, expect } from '@playwright/test';
import { SuperadminReconPageModel } from './page-objects/SuperadminReconPageModel.js';

test.describe('E2E Journey 4: Superadmin Financial Reconciliation Console', () => {
  test('superadmin mengunggah file CSV mutasi Midtrans dan melihat ringkasan kas seimbang', async ({ page }) => {
    // 1. Set cookie session auth superadmin
    await page.context().addCookies([
      {
        name: 'polaris_admin_session',
        value: 'mock-valid-superadmin-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock API batches rekonsiliasi
    await page.route('**/api/v1/admin/reconciliation/batches*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'batch-1',
              batchNumber: 'REC-20261005-A1B2',
              reconDate: '2026-10-04',
              sourceGateway: 'MIDTRANS_CSV',
              totalGrossAmountIdr: '12000000.00',
              totalMdrFeeIdr: '74440.00',
              totalNetAmountIdr: '11925560.00',
              totalMatchedTransactions: 2,
              totalDiscrepancies: 0,
              status: 'BALANCED',
            },
          ],
          pagination: { page: 1, totalPages: 1, totalItems: 1 },
        }),
      });
    });

    // Mock upload CSV
    await page.route('**/api/v1/admin/reconciliation/upload-csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          batchNumber: 'REC-20261005-A1B2',
          status: 'BALANCED',
          totalMatchedTransactions: 2,
          totalDiscrepancies: 0,
        }),
      });
    });

    const reconPage = new SuperadminReconPageModel(page);
    await reconPage.gotoReconciliation();

    const sampleCsv = `Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time
INV-20261004-001,2000000,bank_transfer,settlement,2026-10-04 10:00:00
INV-20261004-002,10000000,qris,settlement,2026-10-04 14:30:00`;

    await reconPage.uploadSettlementCsv(sampleCsv);
    await reconPage.expectAuditSummaryVisible();

    // Verifikasi badge status BALANCED ter-render
    const balancedBadge = page.locator('span:has-text("BALANCED")').first();
    await expect(balancedBadge).toBeVisible();
  });
});
