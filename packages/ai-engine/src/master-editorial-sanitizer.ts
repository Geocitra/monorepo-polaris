/**
 * Master Editorial Sanitizer (POLARIS AI Pure Fabrication)
 *
 * Menegakkan Business Rule BR-04 (Zero-Tolerance Lexical & Punctuation Invariants):
 * 1. Anti Titik Dua & Em-Dash pada Judul/Heading
 * 2. Pembersihan Diksi Terlarang ("sekadar" & "nyata" -> "konkret")
 * 3. Pembersihan AI Slop Blacklist ("angin segar", "garda terdepan", "tonggak bersejarah", dll)
 * 4. Penghapusan Oxford Comma pada perincian elemen (dan/serta/atau)
 * 5. Penggantian Em-dash dengan tanda koma alami
 * 6. Normalisasi preposisi baku (di antaranya, di mana, ke sana, ke mana)
 */
export class MasterEditorialSanitizer {
  /**
   * Sanitizer khusus judul/headline agar bebas dari titik dua (:), em dash (—),
   * dan formula klise "Topik: Subjudul"
   */
  public static cleanHeadline(rawTitle?: string, fallback: string = ''): string {
    if (!rawTitle || typeof rawTitle !== 'string') {
      return (fallback || 'Analisis Kebijakan Strategis').trim();
    }

    let title = rawTitle.replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '').trim();

    // 1. Transformasi formula klise "Topik: Subjudul"
    if (title.includes(':')) {
      const parts = title.split(':').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const first = parts[0];
        const second = parts[1];

        if (/^(jalan menuju|upaya|ikhtiar|langkah|menuju|mewujudkan|sebuah tinjauan)\s+/i.test(second)) {
          const connector = second.replace(/^(jalan|upaya|ikhtiar|langkah)\s+menuju/i, 'Menuju');
          title = `${first} ${connector}`;
        } else if (second.length >= 25 && !second.toLowerCase().startsWith('studi')) {
          title = second;
        } else {
          title = `${first} demi ${second}`;
        }
      }
    }

    // 2. Bersihkan karakter titik dua dan strip/dash pemisah sisa
    title = title.replace(/\s*:\s*/g, ' ').replace(/\s+-\s+/g, ' ');
    title = title.replace(/[:—–]/g, '').replace(/\s{2,}/g, ' ').trim();

    // 3. Bersihkan tanda kutip pembungkus
    title = title.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();

    // 4. Pastikan disucikan dari kata terlarang dan slop
    title = this.sanitizeForbiddenWords(title);
    title = this.removeAiSlop(title);

    return title || fallback;
  }

  /**
   * Menghapus kata terlarang sesuai Master Editorial Rules (Zero-Tolerance)
   * - "bukan sekadar" -> "tidak hanya"
   * - "sekadar" -> "hanya"
   * - "[kata] nyata" -> "[kata] konkret"
   * - "nyata" mandiri -> "konkret" (tanpa merusak 'menyatakan', 'pernyataan', 'kenyataan', 'ternyata')
   */
  public static sanitizeForbiddenWords(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    // 1. Substitusi "bukan sekadar" -> "tidak hanya"
    text = text.replace(/\bbukan\s+sekadar\b/gi, (match) =>
      match === match.toUpperCase() ? 'TIDAK HANYA' : 'tidak hanya'
    );

    // 2. Substitusi "sekadar" -> "hanya"
    text = text.replace(/\bsekadar\b/gi, (match) =>
      match === match.toUpperCase() ? 'HANYA' : 'hanya'
    );

    // 3. Kolokasi umum [verba/nomina] + "nyata" -> [kata] + "konkret"
    text = text.replace(
      /\b(langkah|dampak|bukti|ikhtiar|solusi|komitmen|kontribusi|perubahan|hasil|kerja|karya|tindakan|wujud|upaya|peran|aksi|manfaat|dukungan|terobosan|kebijakan|bantuan)\s+nyata\b/gi,
      (match, p1) => {
        const isAllUpper = match === match.toUpperCase();
        return `${p1} ${isAllUpper ? 'KONKRET' : 'konkret'}`;
      }
    );

    // 4. "yang nyata" / "secara nyata"
    text = text.replace(/\byang\s+nyata\b/gi, (match) =>
      match === match.toUpperCase() ? 'YANG KONKRET' : 'yang konkret'
    );
    text = text.replace(/\bsecara\s+nyata\b/gi, (match) =>
      match === match.toUpperCase() ? 'SECARA KONKRET' : 'secara konkret'
    );

    // 5. Bersihkan sisa kata mandiri 'nyata' tanpa merusak morfem kata turunan
    text = text.replace(/\bnyata\b/gi, (match) =>
      match === match.toUpperCase() ? 'KONKRET' : 'konkret'
    );

    return text;
  }

  /**
   * Menghilangkan metafora klise AI (AI Slop Blacklist)
   */
  public static removeAiSlop(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    text = text.replace(/\bangin\s+segar\b/gi, (match) =>
      match === match.toUpperCase() ? 'PELUANG BARU' : 'peluang baru'
    );
    text = text.replace(/\btonggak\s+(?:bersejarah|penting)\b/gi, (match) =>
      match === match.toUpperCase() ? 'CAPAIAN PENTING' : 'capaian penting'
    );
    text = text.replace(/\bgarda\s+terdepan\b/gi, (match) =>
      match === match.toUpperCase() ? 'LINI UTAMA' : 'lini utama'
    );
    text = text.replace(/\bmenatap\s+masa\s+depan\s+(?:yang\s+)?gemilang\b/gi, (match) =>
      match === match.toUpperCase() ? 'MEMBANGUN KEMAJUAN TERUKUR' : 'membangun kemajuan terukur'
    );
    text = text.replace(/\b(?:merajut|rajutan?)\s+asa\b/gi, (match) =>
      match === match.toUpperCase() ? 'MEMBANGUN OPTIMISME' : 'membangun optimisme'
    );
    text = text.replace(/\bmembuka\s+tabir\b/gi, (match) =>
      match === match.toUpperCase() ? 'MENGUNGKAP FAKTA' : 'mengungkap fakta'
    );
    text = text.replace(/\bsinergi\s+(?:yang\s+)?komprehensif\b/gi, (match) =>
      match === match.toUpperCase() ? 'KOLABORASI TERPADU' : 'kolaborasi terpadu'
    );
    text = text.replace(/\bpada\s+hakikatnya\b/gi, (match) =>
      match === match.toUpperCase() ? 'PADA DASARNYA' : 'pada dasarnya'
    );
    text = text.replace(/\bseyogianya\b/gi, (match) =>
      match === match.toUpperCase() ? 'SEHARUSNYA' : 'seharusnya'
    );
    text = text.replace(/\bniscaya\b/gi, (match) =>
      match === match.toUpperCase() ? 'PASTI' : 'pasti'
    );

    return text;
  }

  /**
   * Menghapus Oxford comma pada perincian 3 elemen atau lebih sebelum "dan", "serta", "atau"
   */
  public static removeOxfordComma(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+dan\s+([a-zA-Z0-9\(])/g, '$1 dan $2');
    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+serta\s+([a-zA-Z0-9\(])/g, '$1 serta $2');
    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+atau\s+([a-zA-Z0-9\(])/g, '$1 atau $2');

    return text;
  }

  /**
   * Menghapus em dash (— atau –) dan menggantinya dengan koma alami
   */
  public static removeEmDash(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText.replace(/\s*[—–]\s*/g, ', ');
  }

  /**
   * Normalisasi ejaan preposisi umum yang sering salah sambung
   */
  public static normalizePrepositions(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    text = text.replace(/\bdiantaranya\b/gi, 'di antaranya');
    text = text.replace(/\bdimana\b/gi, 'di mana');
    text = text.replace(/\bkesana\b/gi, 'ke sana');
    text = text.replace(/\bkemana\b/gi, 'ke mana');

    return text;
  }

  /**
   * Membersihkan format heading bab dari titik dua dan em-dash
   */
  public static cleanHeadings(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    // Heading bab bernomor: "## Bab I: Analisis" -> "## Bab I. Analisis"
    text = text.replace(/^(##\s+Bab\s+[IVXLCDM\d]+)\s*[:—–-]\s*/gim, '$1. ');

    // Heading subbab Markdown umum: "## Subbab: Analisis" -> "## Subbab Analisis"
    text = text.replace(/^(#{2,3}\s+[^:\n\r]+)\s*[:—–]\s*/gm, '$1 ');

    return text;
  }

  /**
   * Eksekusi seluruh sanitasi mikrolinguistik deterministik
   */
  public static sanitize(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText;

    text = this.cleanHeadings(text);
    text = this.removeEmDash(text);
    text = this.removeOxfordComma(text);
    text = this.normalizePrepositions(text);
    text = this.sanitizeForbiddenWords(text);
    text = this.removeAiSlop(text);

    return text;
  }
}
