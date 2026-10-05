export class HexColor {
  private readonly value: string;

  constructor(hex: string) {
    const sanitized = hex.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/i.test(sanitized)) {
      throw new Error(`[InvalidColorError] Format warna HEX '${hex}' tidak valid. Contoh valid: #1890FF`);
    }
    this.value = sanitized;
  }

  public getValue(): string {
    return this.value;
  }
}
