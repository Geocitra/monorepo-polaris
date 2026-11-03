import { describe, it, expect } from 'vitest';
import {
  normalizeIndonesianPhone,
  maskClientPhoneNumber,
  getCurrentWibWeeklyPeriod,
  detectOperatorContactLeak,
} from './contact-sanitizer.util.js';

describe('WhatsApp Contact Sanitizer & Broker Security Guard', () => {
  it('menormalisasi berbagai format nomor telepon Indonesia ke E.164 tanpa tanda tambah (628...)', () => {
    expect(normalizeIndonesianPhone('0831-8022-6507')).toBe('6283180226507');
    expect(normalizeIndonesianPhone('+62 831 8022 6507')).toBe('6283180226507');
    expect(normalizeIndonesianPhone('6283180226507')).toBe('6283180226507');
    expect(normalizeIndonesianPhone('82258790636')).toBe('6282258790636');
  });

  it('menyamarkan nomor telepon klien agar tidak pernah terlihat utuh oleh operator', () => {
    expect(maskClientPhoneNumber('083180226507')).toBe('0831-****-6507');
    expect(maskClientPhoneNumber('+6282258790636')).toBe('0822-****-0636');
  });

  it('menghitung periode kuota mingguan berbasis Senin WIB secara konsisten', () => {
    const period = getCurrentWibWeeklyPeriod(new Date('2026-11-03T14:00:00+07:00'));
    expect(period).toMatch(/^2026-W\d{2}$/);
  });

  it('memblokir pesan klarifikasi operator yang mengandung nomor telepon, email, link, atau handle medsos', () => {
    expect(detectOperatorContactLeak('Pak, apakah acara ini di RSUD Cibinong atau gedung DPRD?').hasLeak).toBe(false);
    expect(detectOperatorContactLeak('Hubungi saya di 0812-3456-7890 ya pak').hasLeak).toBe(true);
    expect(detectOperatorContactLeak('Kirim bahannya ke reno@gmail.com saja').hasLeak).toBe(true);
    expect(detectOperatorContactLeak('Klik wa.me/628123456789 untuk lanjut').hasLeak).toBe(true);
    expect(detectOperatorContactLeak('DM instagram saya di @operator_polaris').hasLeak).toBe(true);
    expect(detectOperatorContactLeak('Bisa japri atau wa pribadi saja pak').hasLeak).toBe(true);
  });
});

