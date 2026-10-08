import { describe, it, expect } from 'vitest';
import { PlatformFactsRegistry } from '../src/knowledge/platform-facts.js';

describe('PlatformFactsRegistry (Knowledge Expert)', () => {
  it('harus memuat seluruh rincian resmi paket harga proporsional dan kedaulatan data UU PDP tanpa membocorkan flat rate', () => {
    const facts = PlatformFactsRegistry.getFacts();

    expect(facts).toContain('<polaris_facts>');
    expect(facts).toContain('STRUKTUR HARGA LISENSI PROPORSIONAL & YURISDIKSI');
    expect(facts).toContain('DPR RI, DPD RI, DPRD Provinsi');
    expect(facts).toContain('Surat Penawaran Harga (SPH)');
    expect(facts).not.toContain('Rp 2.000.000');
    expect(facts).not.toContain('Rp 10.000.000');
    expect(facts).not.toContain('Rp 20.000.000');
    expect(facts).toContain('UU PDP No. 27/2022');
    expect(facts).toContain('AES-256');
    expect(facts).toContain('3.000 kata');
  });
});