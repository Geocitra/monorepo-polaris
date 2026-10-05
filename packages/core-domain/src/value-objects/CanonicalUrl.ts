import { SubdomainSlug } from './SubdomainSlug.js';

export class CanonicalUrl {
  private readonly value: string;

  constructor(subdomain: SubdomainSlug, articleSlug: string, rootDomain: string = 'polaris.id') {
    const cleanArticleSlug = articleSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '');
    this.value = `https://${subdomain.getValue()}.${rootDomain}/artikel/${cleanArticleSlug}`;
  }

  public getValue(): string {
    return this.value;
  }
}
