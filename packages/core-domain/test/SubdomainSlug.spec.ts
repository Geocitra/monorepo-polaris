import { describe, it, expect } from 'vitest';
import { SubdomainSlug } from '../src/value-objects/SubdomainSlug.js';

describe('SubdomainSlug Value Object', () => {
  it('harus menerima subdomain yang valid dan menormalisasi ke huruf kecil', () => {
    const slug = new SubdomainSlug('Ahmad-Fauzi');
    expect(slug.getValue()).toBe('ahmad-fauzi');
  });

  it('harus menolak subdomain yang panjangnya kurang dari 3 karakter', () => {
    expect(() => new SubdomainSlug('ab')).toThrowError(/Panjang subdomain harus antara 3 - 63 karakter/);
  });

  it('harus menolak subdomain yang panjangnya lebih dari 63 karakter', () => {
    const longSlug = 'a'.repeat(64);
    expect(() => new SubdomainSlug(longSlug)).toThrowError(/Panjang subdomain harus antara 3 - 63 karakter/);
  });

  it('harus menolak subdomain yang mengandung karakter ilegal atau spasi', () => {
    expect(() => new SubdomainSlug('ahmad fauzi')).toThrowError(/tidak valid/);
    expect(() => new SubdomainSlug('ahmad_fauzi')).toThrowError(/tidak valid/);
    expect(() => new SubdomainSlug('ahmad.fauzi')).toThrowError(/tidak valid/);
    expect(() => new SubdomainSlug('-ahmad-')).toThrowError(/tidak valid/);
  });

  it('harus menolak kata-kata terlarang (Reserved Keywords)', () => {
    const reservedWords = ['admin', 'api', 'app', 'dashboard', 'portal', 'www', 'mail', 'polaris', 'billing'];

    for (const word of reservedWords) {
      expect(() => new SubdomainSlug(word)).toThrowError(/adalah kata terlarang/);
    }
  });

  it('harus membandingkan kesetaraan (equality) berdasarkan nilai slug', () => {
    const slug1 = new SubdomainSlug('budi-santoso');
    const slug2 = new SubdomainSlug('BUDI-SANTOSO');
    const slug3 = new SubdomainSlug('hendra-gunawan');

    expect(slug1.equals(slug2)).toBe(true);
    expect(slug1.equals(slug3)).toBe(false);
  });
});