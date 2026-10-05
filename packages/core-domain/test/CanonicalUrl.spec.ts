import { describe, it, expect } from 'vitest';
import { CanonicalUrl } from '../src/value-objects/CanonicalUrl.js';
import { SubdomainSlug } from '../src/value-objects/SubdomainSlug.js';

describe('CanonicalUrl Value Object', () => {
  it('harus membentuk URL kanonikal yang valid sesuai subdomain dan slug artikel', () => {
    const subdomain = new SubdomainSlug('ahmad-fauzi');
    const canonical = new CanonicalUrl(subdomain, 'kajian-pupuk-subsidi-2026');

    expect(canonical.getValue()).toBe('https://ahmad-fauzi.polaris.id/artikel/kajian-pupuk-subsidi-2026');
  });

  it('harus membersihkan karakter ilegal pada slug artikel', () => {
    const subdomain = new SubdomainSlug('dewan-jabar');
    const canonical = new CanonicalUrl(subdomain, 'Kebijakan APBD 2026 & Evaluasi!');

    expect(canonical.getValue()).toBe('https://dewan-jabar.polaris.id/artikel/kebijakanapbd2026evaluasi');
  });
});