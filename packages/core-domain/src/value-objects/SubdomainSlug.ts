export class SubdomainSlug {
  private static readonly RESERVED_SLUGS = new Set([
    'admin', 'api', 'app', 'dashboard', 'portal', 'www', 'mail', 
    'staging', 'dev', 'root', 'auth', 'billing', 'support', 'polaris'
  ]);

  private readonly value: string;

  constructor(rawSlug: string) {
    const sanitized = rawSlug.trim().toLowerCase();
    this.validate(sanitized);
    this.value = sanitized;
  }

  private validate(slug: string): void {
    if (slug.length < 3 || slug.length > 63) {
      throw new Error(`[InvalidSubdomainError] Panjang subdomain harus antara 3 - 63 karakter. Diterima: ${slug.length}`);
    }
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!regex.test(slug)) {
      throw new Error(`[InvalidSubdomainError] Subdomain '${slug}' tidak valid. Hanya boleh huruf kecil, angka, dan tanda strip tunggal.`);
    }
    if (SubdomainSlug.RESERVED_SLUGS.has(slug)) {
      throw new Error(`[ReservedSubdomainError] Subdomain '${slug}' adalah kata terlarang dan tidak boleh digunakan.`);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SubdomainSlug): boolean {
    return this.value === other.value;
  }
}
