import { SubdomainSlug } from './SubdomainSlug.js';

export class CanonicalUrl {
  private readonly value: string;

  constructor(
    subdomainOrCustomDomain: SubdomainSlug | string,
    articleSlug: string,
    rootDomain: string = 'polarismedia.id'
  ) {
    const cleanArticleSlug = articleSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '');
    const identifier =
      typeof subdomainOrCustomDomain === 'string'
        ? subdomainOrCustomDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
        : subdomainOrCustomDomain.getValue();

    if (identifier.includes('.')) {
      // Custom Domain (misal: opinitaru.com atau polarismedia.space)
      this.value = `https://${identifier}/artikel/${cleanArticleSlug}`;
    } else {
      // Subdomain Polaris (misal: opinitaru.polarismedia.id)
      this.value = `https://${identifier}.${rootDomain}/artikel/${cleanArticleSlug}`;
    }
  }

  public getValue(): string {
    return this.value;
  }
}
