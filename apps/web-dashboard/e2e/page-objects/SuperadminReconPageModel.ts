import { Page, Locator, expect } from '@playwright/test';

export class SuperadminReconPageModel {
  readonly page: Page;
  readonly uploadCsvButton: Locator;
  readonly fileInput: Locator;
  readonly triggerProcessButton: Locator;
  readonly kpiGrossCard: Locator;
  readonly kpiNetCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadCsvButton = page.locator('button:has-text("Unggah File CSV Mutasi")');
    this.fileInput = page.locator('input[type="file"]');
    this.triggerProcessButton = page.locator('button:has-text("Proses Rekonsiliasi")');
    this.kpiGrossCard = page.locator('text=Total Tagihan (Gross)');
    this.kpiNetCard = page.locator('text=Kas Bersih Diterima (Net)');
  }

  async gotoReconciliation() {
    await this.page.goto('/superadmin/reconciliation');
  }

  async uploadSettlementCsv(csvContent: string) {
    await this.uploadCsvButton.click();
    // Membuka modal dan menyuntikkan file CSV virtual
    const buffer = Buffer.from(csvContent, 'utf-8');
    await this.fileInput.setInputFiles({
      name: 'settlement_test.csv',
      mimeType: 'text/csv',
      buffer,
    });
    await this.triggerProcessButton.click();
  }

  async expectAuditSummaryVisible() {
    await expect(this.kpiGrossCard).toBeVisible();
    await expect(this.kpiNetCard).toBeVisible();
  }
}
