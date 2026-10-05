import { describe, it, expect } from 'vitest';
import { PlatformFactsRegistry } from '../src/knowledge/platform-facts.js';

describe('PlatformFactsRegistry (Knowledge Expert)', () => {
  it('harus memuat seluruh rincian resmi paket harga dan kedaulatan data UU PDP', () => {
    const facts = PlatformFactsRegistry.getFacts();

    expect(facts).toContain('<polaris_facts>');
    expect(facts).toContain('Rp 2.000.000'); // 1 Bulan
    expect(facts).toContain('Rp 10.000.000'); // 6 Bulan
    expect(facts).toContain('Rp 20.000.000'); // 1 Tahun
    expect(facts).toContain('UU PDP No. 27/2022');
    expect(facts).toContain('AES-256');
    expect(facts).toContain('3.000 kata');
  });
});