import { Page, Locator, expect } from '@playwright/test';

export class CitizenPortalPageModel {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly regencyInput: Locator;
  readonly districtInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[placeholder*="Budi Santoso"]');
    this.phoneInput = page.locator('input[placeholder*="08123456"]');
    this.regencyInput = page.locator('input[placeholder*="Kabupaten Cirebon"]');
    this.districtInput = page.locator('input[placeholder*="Waled"]');
    this.messageInput = page.locator('textarea[placeholder*="permasalahan secara jelas"], textarea[placeholder*="Permasalahan secara jelas"]');
    this.submitButton = page.locator('button:has-text("Kirim Laporan Resmi")');
  }

  async gotoLapor(subdomain: string = 'ahmad-fauzi') {
    await this.page.goto(`http://${subdomain}.localhost:3001/lapor`);
  }

  async submitAspiration(data: {
    name: string;
    phone: string;
    regency: string;
    district: string;
    message: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.phoneInput.fill(data.phone);
    await this.regencyInput.fill(data.regency);
    await this.districtInput.fill(data.district);
    await this.messageInput.fill(data.message);
    await this.submitButton.click();
  }

  async getGeneratedTicketCode(): Promise<string> {
    const ticketElement = this.page.locator('text=#CS-');
    await expect(ticketElement).toBeVisible({ timeout: 10000 });
    const text = await ticketElement.textContent();
    return text ? text.trim() : '';
  }
}
