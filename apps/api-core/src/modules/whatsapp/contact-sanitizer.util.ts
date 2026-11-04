/**
 * Utilitas Sanitasi Kontak, Normalisasi Nomor E.164 Indonesia,
 * dan Perhitungan Periode Kuota Mingguan (Senin 00:00 WIB).
 */

/**
 * Menormalisasi nomor telepon Indonesia dari berbagai format ('0812...', '+62812...', '62-812...')
 * menjadi format standar WhatsApp Cloud API ('62812...').
 */
export function normalizeIndonesianPhone(rawPhone: string | null | undefined): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('08')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

/**
 * Menyamarkan nomor telepon client agar tidak pernah terlihat utuh oleh Operator.
 * Contoh: '6283180226507' -> '0831-****-6507'
 */
export function maskClientPhoneNumber(rawPhone: string | null | undefined): string {
  const norm = normalizeIndonesianPhone(rawPhone);
  if (!norm || norm.length < 8) return '08**-****-****';
  const localPrefix = norm.startsWith('62') ? `0${norm.slice(2, 5)}` : norm.slice(0, 4);
  const tail = norm.slice(-4);
  return `${localPrefix}-****-${tail}`;
}

/**
 * Menghitung kode minggu kalender berbasis waktu WIB (UTC+7), reset setiap Senin 00:00 WIB.
 * Contoh output: '2026-W45'
 */
export function getCurrentWibWeeklyPeriod(referenceDate: Date = new Date()): string {
  // Geser ke WIB (UTC+7)
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(referenceDate.getTime() + wibOffsetMs);

  // ISO-8601 week calculation (Senin = hari pertama)
  const target = new Date(Date.UTC(wibDate.getUTCFullYear(), wibDate.getUTCMonth(), wibDate.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Senin = 0, Minggu = 6
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const isoYear = new Date(firstThursday).getUTCFullYear();
  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
}

export type TimeHorizonTarget = 'TODAY_PRIORITY' | 'TODAY_REGULAR' | 'NEXT_DAY_MORNING';

export interface TimeHorizonInfo {
  target: TimeHorizonTarget;
  shortLabel: string;
  badgeLabel: string;
  wibHours: number;
  isAfterCutoff: boolean;
  statusLine: string;
  slaDescription: string;
}

/**
 * Menghitung jam WIB (UTC+7) dari suatu tanggal UTC/ISO.
 */
export function getWibHours(referenceDate: Date = new Date()): number {
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(referenceDate.getTime() + wibOffsetMs);
  return wibDate.getUTCHours();
}

/**
 * Menentukan target horizon pengerjaan berdasarkan waktu WIB dan sinyal urgensi:
 * - Jika masuk di luar jam kerja (>= 17:00 WIB atau < 07:00 WIB) -> NEXT_DAY_MORNING
 * - Jika masuk di jam kerja dan urgensi URGENT -> TODAY_PRIORITY
 * - Jika masuk di jam kerja dan normal -> TODAY_REGULAR
 */
export function getTimeHorizonInfo(
  urgency: 'URGENT' | 'NORMAL' = 'NORMAL',
  referenceDate: Date = new Date()
): TimeHorizonInfo {
  const hours = getWibHours(referenceDate);
  const isAfterCutoff = hours >= 17 || hours < 7;

  if (isAfterCutoff) {
    return {
      target: 'NEXT_DAY_MORNING',
      shortLabel: 'Target Besok Pagi',
      badgeLabel: '🗓️ TARGET BESOK PAGI',
      wibHours: hours,
      isAfterCutoff: true,
      statusLine:
        '🗓️ *Status Pengerjaan:* Dijadwalkan untuk diproduksi pertama pada jam kerja redaksi besok pagi (mulai pukul 08:00 WIB).',
      slaDescription:
        'Bahan kegiatan Anda telah kami amankan dalam antrean produksi prioritas besok pagi.',
    };
  }

  if (urgency === 'URGENT') {
    return {
      target: 'TODAY_PRIORITY',
      shortLabel: 'Prioritas Hari Ini',
      badgeLabel: '⚡ PRIORITAS HARI INI',
      wibHours: hours,
      isAfterCutoff: false,
      statusLine:
        '⚡ *Status Pengerjaan:* Dialokasikan ke Tim Editor Utama sebagai prioritas tayang hari ini.',
      slaDescription:
        'Tim kami sedang memprioritaskan peracikan naskah berita, poster visual, dan caption Anda untuk segera ditayangkan hari ini.',
    };
  }

  return {
    target: 'TODAY_REGULAR',
    shortLabel: 'Tayang Hari Ini',
    badgeLabel: '🟢 TAYANG HARI INI',
    wibHours: hours,
    isAfterCutoff: false,
    statusLine:
      '🟢 *Status Pengerjaan:* Sudah di meja pengerjaan Tim Redaksi untuk diproses tayang hari ini.',
    slaDescription:
      'Pratinjau draf artikel, poster visual, dan caption medsos akan kami kirimkan ke WhatsApp ini segera setelah siap ditinjau.',
  };
}

export interface ContactLeakCheckResult {
  hasLeak: boolean;
  reason?: string;
  matchedSnippet?: string;
}

/**
 * Memeriksa apakah pesan klarifikasi dari Operator mengandung upaya pembocoran kontak langsung
 * (nomor telepon, alamat email, tautan wa.me/t.me, atau handle media sosial).
 */
export function detectOperatorContactLeak(text: string): ContactLeakCheckResult {
  if (!text || !text.trim()) {
    return { hasLeak: false };
  }

  // 1. Deteksi nomor telepon (format +62, 628, 08xx, atau deretan >= 9 digit angka meski dipisah spasi/strip)
  const phoneRegex = /(?:\+?62|0)\s*8[\d\s.\-]{7,14}\d|\b\d[\d\s.\-]{8,15}\d\b/i;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    return {
      hasLeak: true,
      reason: 'Pesan mengandung pola nomor telepon pribadi.',
      matchedSnippet: phoneMatch[0].trim(),
    };
  }

  // 2. Deteksi alamat email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    return {
      hasLeak: true,
      reason: 'Pesan mengandung alamat email.',
      matchedSnippet: emailMatch[0],
    };
  }

  // 3. Deteksi tautan kontak eksternal / direct chat (wa.me, t.me, bit.ly, http/https)
  const linkRegex = /\b(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|telegram\.me\/|line\.me\/)\S+/i;
  const linkMatch = text.match(linkRegex);
  if (linkMatch) {
    return {
      hasLeak: true,
      reason: 'Pesan mengandung tautan eksternal atau link chat langsung.',
      matchedSnippet: linkMatch[0],
    };
  }

  // 4. Deteksi handle @username atau ajakan pindah jalur komunikasi
  const handleRegex = /(?:^|\s)@[a-zA-Z0-9_.]{3,30}\b|\b(?:hubungi\s+nomor|chat\s+pribadi|japri|wa\s+pribadi)\b/i;
  const handleMatch = text.match(handleRegex);
  if (handleMatch) {
    return {
      hasLeak: true,
      reason: 'Pesan mengandung handle akun atau ajakan komunikasi di luar sistem resmi Polaris.',
      matchedSnippet: handleMatch[0].trim(),
    };
  }

  return { hasLeak: false };
}

