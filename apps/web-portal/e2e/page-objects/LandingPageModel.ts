import { Page, Locator, expect } from '@playwright/test';

export class LandingPageModel {
  readonly page: Page;
  readonly conciergeLauncher: Locator;
  readonly conciergeDialog: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messagesList: Locator;
  readonly pricingSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.conciergeLauncher = page.locator('button[aria-label*="Concierge"], button[aria-label*="POLARIS"], button:has-text("Tanya POLARIS")').first();
    this.conciergeDialog = page.locator('#public-concierge-panel, text=POLARIS Concierge').first();
    this.chatInput = page.locator('#public-concierge-input, input[placeholder*="pertanyaan"]').first();
    this.sendButton = page.locator('button[aria-label="Kirim pertanyaan"], button[title="Kirim"], button:has-text("Kirim")').first();
    this.messagesList = page.locator('.overflow-y-auto');
    this.pricingSection = page.locator('#pricing');
  }

  async goto() {
    await this.page.goto('/');
  }

  async openConcierge() {
    await this.conciergeLauncher.click();
    await expect(this.chatInput).toBeVisible();
  }

  async clickIcebreakerChip(chipText: string) {
    await this.page.locator(`button:has-text("${chipText}")`).first().click();
  }

  async askQuestion(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  async expectAssistantReply(containingText: string) {
    const assistantBubble = this.page.locator(`div:has-text("${containingText}"), p:has-text("${containingText}")`).last();
    await expect(assistantBubble).toBeVisible({ timeout: 10000 });
  }

  async clickPricingAction() {
    const actionBtn = this.page.locator('button:has-text("Lihat paket"), button:has-text("Lihat Rincian Paket Harga")').first();
    await actionBtn.click();
  }
}
