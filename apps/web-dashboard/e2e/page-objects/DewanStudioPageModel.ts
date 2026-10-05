import { Page, Locator, expect } from '@playwright/test';

export class DewanStudioPageModel {
  readonly page: Page;
  readonly topicInput: Locator;
  readonly generateButton: Locator;
  readonly liveProgressBanner: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topicInput = page.locator('textarea[placeholder*="Contoh: Buatkan artikel"], textarea[placeholder*="Apa yang ingin Anda tulis"]');
    this.generateButton = page.locator('button:has-text("Buat Sekarang")');
    this.liveProgressBanner = page.locator('text=Polaris AI, text=Redis Queue');
    this.publishButton = page.locator('button:has-text("Terbitkan ke Website")');
  }

  async gotoStudio() {
    await this.page.goto('/studio/terpadu');
  }

  async submitNewTopic(topic: string) {
    await this.topicInput.fill(topic);
    await this.generateButton.click();
  }

  async waitForGenerationCompletion() {
    // Menunggu status selesai atau transisi artikel siap
    const readyBadge = this.page.locator('text=Siap Digunakan, text=Terbitkan ke Website');
    await expect(readyBadge.first()).toBeVisible({ timeout: 25000 });
  }

  async publishToWebsite() {
    await this.publishButton.click();
    const successToast = this.page.locator('text=Artikel Berhasil Tayang');
    await expect(successToast).toBeVisible({ timeout: 10000 });
  }
}
