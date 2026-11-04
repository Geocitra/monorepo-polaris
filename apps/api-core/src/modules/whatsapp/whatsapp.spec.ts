import { describe, it, expect } from 'vitest';
import {
  normalizeIndonesianPhone,
  maskClientPhoneNumber,
  getCurrentWibWeeklyPeriod,
  detectOperatorContactLeak,
  getWibHours,
  getTimeHorizonInfo,
  isNewBriefExplicitTrigger,
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

  it('menghitung jam WIB (UTC+7) dengan benar', () => {
    // 03:00 UTC = 10:00 WIB
    const morningDate = new Date('2026-11-04T03:00:00Z');
    expect(getWibHours(morningDate)).toBe(10);

    // 12:30 UTC = 19:30 WIB
    const eveningDate = new Date('2026-11-04T12:30:00Z');
    expect(getWibHours(eveningDate)).toBe(19);
  });

  it('menentukan horizon waktu komitmen pengerjaan (Time-Horizon SLA)', () => {
    // 1. Siang hari (10:00 WIB) dengan urgensi URGENT -> TODAY_PRIORITY
    const morningUrgent = new Date('2026-11-04T03:00:00Z');
    const horizon1 = getTimeHorizonInfo('URGENT', morningUrgent);
    expect(horizon1.target).toBe('TODAY_PRIORITY');
    expect(horizon1.badgeLabel).toBe('⚡ PRIORITAS HARI INI');
    expect(horizon1.isAfterCutoff).toBe(false);

    // 2. Siang hari (14:00 WIB) dengan urgensi NORMAL -> TODAY_REGULAR
    const daytimeNormal = new Date('2026-11-04T07:00:00Z');
    const horizon2 = getTimeHorizonInfo('NORMAL', daytimeNormal);
    expect(horizon2.target).toBe('TODAY_REGULAR');
    expect(horizon2.badgeLabel).toBe('🟢 TAYANG HARI INI');
    expect(horizon2.isAfterCutoff).toBe(false);

    // 3. Malam hari (20:00 WIB) baik URGENT maupun NORMAL -> NEXT_DAY_MORNING
    const nightTime = new Date('2026-11-04T13:00:00Z');
    const horizon3 = getTimeHorizonInfo('URGENT', nightTime);
    expect(horizon3.target).toBe('NEXT_DAY_MORNING');
    expect(horizon3.badgeLabel).toBe('🗓️ TARGET BESOK PAGI');
    expect(horizon3.isAfterCutoff).toBe(true);

    // 4. Subuh dini hari (05:00 WIB) -> NEXT_DAY_MORNING
    const earlyMorning = new Date('2026-11-04T22:00:00Z'); // 22:00 UTC kemarin = 05:00 WIB
    const horizon4 = getTimeHorizonInfo('NORMAL', earlyMorning);
    expect(horizon4.target).toBe('NEXT_DAY_MORNING');
    expect(horizon4.badgeLabel).toBe('🗓️ TARGET BESOK PAGI');
    expect(horizon4.isAfterCutoff).toBe(true);
  });

  it('mendeteksi pemicu eksplisit request brief baru agar tidak dibajak tiket klarifikasi/revisi', () => {
    // True cases (kasus Reno Sebastian dan variasi request baru)
    expect(isNewBriefExplicitTrigger('buatkan artikel untuk respon bencana alam gempa di papua.')).toBe(true);
    expect(isNewBriefExplicitTrigger('bikin konten tentang peresmian jembatan cisadane')).toBe(true);
    expect(isNewBriefExplicitTrigger('halo tolong buatkan artikel mengenai sosialisasi pilkada')).toBe(true);
    expect(isNewBriefExplicitTrigger('request konten infografis retribusi')).toBe(true);
    expect(isNewBriefExplicitTrigger('topik baru untuk rilis pers')).toBe(true);
    expect(isNewBriefExplicitTrigger('bisa tolong buatkan rilis berita')).toBe(true);

    // False cases (jawaban klarifikasi atau catatan revisi biasa)
    expect(isNewBriefExplicitTrigger('baik ditunggu ya pak')).toBe(false);
    expect(isNewBriefExplicitTrigger('coba gambar nya lebih ke bagaimana cara mengatasi dan cara retribusi sampah dengan benar')).toBe(false);
    expect(isNewBriefExplicitTrigger('iya datanya sudah dari bps')).toBe(false);
    expect(isNewBriefExplicitTrigger('ok siap')).toBe(false);
    expect(isNewBriefExplicitTrigger('fotonya yang ini ya pak')).toBe(false);
    expect(isNewBriefExplicitTrigger('')).toBe(false);
    expect(isNewBriefExplicitTrigger(null)).toBe(false);
  });
});


