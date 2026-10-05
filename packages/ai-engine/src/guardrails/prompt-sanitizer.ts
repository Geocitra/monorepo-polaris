export interface SanitizeResult {
    isValid: boolean;
    sanitizedText: string;
    rejectionReason?: string;
    preBakedReply?: string;
    suggestedAction: 'VIEW_PRICING' | 'REGISTER' | 'NONE';
}

export class PromptSanitizer {
    public static readonly MAX_INPUT_CHARS = 250;

    private static readonly INJECTION_PATTERNS: RegExp[] = [
        /ignore\s+(all\s+)?(previous\s+)?instructions/i,
        /abaikan\s+(semua\s+)?(instruksi|perintah|aturan)/i,
        /dan\s+mode/i,
        /jailbreak/i,
        /pretend\s+you\s+are/i,
        /bertindaklah\s+sebagai/i,
        /you\s+are\s+now\s+an?\s+unrestricted/i,
        /(system\s+prompt|instruksi\s+sistem)/i,
        /(prompt|system)\s+dump/i,
        /(tuliskan|cetak|print|show|bocorkan)\s+(system\s+prompt|instruksi\s+sistem)/i,
        /bikin(kan)?\s+(kode|script|program|python|javascript|sql)/i,
        /write\s+(a\s+)?(script|code|malware|exploit)/i,
    ];

    private static readonly OFF_TOPIC_PATTERNS: RegExp[] = [
        /\b(siapa|who\s+is)\s+(presiden|president|perdana\s+menteri|prime\s+minister)\b/i,
        /\b(resep|masak|recipe|cook(ing)?|cuaca|weather|matematika|mathematics|\bmath\b)\b/i,
        /\b(berapa\s+hasil|calculate|solve\s+this)\b/i,
    ];

    public static inspect(rawText: string): SanitizeResult {
        if (!rawText || rawText.trim().length === 0) {
            return {
                isValid: false,
                sanitizedText: '',
                rejectionReason: 'Pesan kosong.',
                preBakedReply: 'Halo! Ada yang bisa saya bantu terkait fitur, layanan, atau paket lisensi POLARIS?',
                suggestedAction: 'NONE',
            };
        }

        const clamped = rawText.trim().slice(0, this.MAX_INPUT_CHARS);
        if ([...this.INJECTION_PATTERNS, ...this.OFF_TOPIC_PATTERNS].some((pattern) => pattern.test(clamped))) {
            return {
                isValid: false,
                sanitizedText: clamped,
                rejectionReason: 'Pola manipulasi prompt atau pertanyaan di luar konteks terdeteksi.',
                preBakedReply:
                    'Mohon maaf, saya adalah asisten resmi POLARIS yang diprogram khusus untuk memberikan informasi seputar fitur, paket harga, dan layanan platform POLARIS.',
                suggestedAction: 'NONE',
            };
        }

        const lower = clamped.toLowerCase();
        let suggestedAction: SanitizeResult['suggestedAction'] = 'NONE';
        if (['harga', 'biaya', 'paket', 'tarif', 'bayar'].some((word) => lower.includes(word))) {
            suggestedAction = 'VIEW_PRICING';
        } else if (['daftar', 'register', 'buat akun', 'coba'].some((word) => lower.includes(word))) {
            suggestedAction = 'REGISTER';
        }

        return { isValid: true, sanitizedText: clamped, suggestedAction };
    }
}