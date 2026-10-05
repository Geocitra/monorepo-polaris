import { CommentStatus } from '@polaris/shared-types';

export class ProfanityFilter {
  // Daftar kata kunci spam judi online & promosi ilegal
  private static readonly GAMBLING_SPAM_PATTERNS = [
    /\bslot\b/i,
    /judi\s*online/i,
    /\bgacor\b/i,
    /\bmaxwin\b/i,
    /\bzeus\b/i,
    /\btogel\b/i,
    /depo\s*\d+/i,
    /deposit\s*pulsa/i,
    /pragmatic\s*play/i,
    /link\s*alternatif/i,
    /daftar\s*sekarang.*(klik|link)/i,
    /whatsapp\s*:\s*\+?\d{8,}/i,
    /wa\s*:\s*\+?\d{8,}/i,
  ];

  // Daftar kata kasar, makian, dan pelecehan verbal SARA
  private static readonly PROFANITY_WORDS = [
    'anjing',
    'babi',
    'bangsat',
    'bajingan',
    'kontol',
    'memek',
    'pantek',
    'itil',
    'ngentot',
    'ngewe',
    'jembut',
    'perek',
    'lonte',
    'pelacur',
    'goblok',
    'tolol',
    'idiot',
    'bego',
    'kampret',
    'kadrun',
    'cebong',
    'fuck',
    'shit',
    'asshole',
    'bitch',
  ];

  /**
   * Menganalisis teks komentar dan menentukan status publikasi serta menyensor kata kasar jika ada
   */
  public static inspectComment(rawText: string): {
    status: CommentStatus;
    sanitizedText: string;
    detectedSpam: boolean;
    detectedProfanity: boolean;
  } {
    const text = rawText.trim();

    // 1. Cek Pola Spam Judi Online
    for (const pattern of this.GAMBLING_SPAM_PATTERNS) {
      if (pattern.test(text)) {
        return {
          status: CommentStatus.FLAGGED_SPAM,
          sanitizedText: text,
          detectedSpam: true,
          detectedProfanity: false,
        };
      }
    }

    // 2. Cek Kata Kasar & Lakukan Masking (misal: "k****l")
    let sanitizedText = text;
    let detectedProfanity = false;

    for (const word of this.PROFANITY_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(sanitizedText)) {
        detectedProfanity = true;
        sanitizedText = sanitizedText.replace(regex, (match) => {
          if (match.length <= 2) return '**';
          return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
        });
      }
    }

    return {
      status: CommentStatus.PUBLISHED,
      sanitizedText,
      detectedSpam: false,
      detectedProfanity,
    };
  }
}
