import { GoogleGenAI } from '@google/genai';
import dns from 'node:dns';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';
import { PartyIdeologyResolver } from '../party/party-ideology.resolver.js';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

export interface RefinePromptOptions {
  rawPrompt: string;
  style?: 'poster' | 'infographic' | 'article_agenda';
  dapilName?: string;
  memberName?: string;
  partyAffiliation?: string;
  commissionName?: string;
  tenantId?: string;
}

export interface GenerateDapilTopicsOptions {
  memberName: string;
  dapilName: string;
  provinceName?: string;
  regencyCoverage?: string[];
  partyAffiliation?: string;
  legislativeLevel?: string;
  commissionName?: string;
  issueInterests?: string[];
  recentNewsHeadlines?: string[];
  tenantId?: string;
}

export class PromptRefinerService {
  /**
   * Menyempurnakan ide kasar pengguna menjadi prompt kebijakan editorial yang berwibawa
   * menggunakan model Google Gemini paling hemat (gemini-3.1-flash-lite).
   * Biaya per eksekusi: < Rp 1 (fraksi sen per prompt).
   */
  public static async refinePrompt(options: RefinePromptOptions): Promise<{ refinedPrompt: string }> {
    const { rawPrompt, style = 'poster', dapilName, memberName, partyAffiliation, commissionName } = options;
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey || !rawPrompt || !rawPrompt.trim()) {
      return { refinedPrompt: rawPrompt || '' };
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_LITE_MODEL || 'gemini-3.1-flash-lite';

      let instruction = '';
      if (style === 'article_agenda') {
        instruction = `Kamu adalah asisten perumus agenda kerja & pernyataan pers kebijakan publik POLARIS untuk wakil rakyat / pejabat publik ${memberName ? `bernama ${memberName}` : ''}.
Tugasmu adalah menyempurnakan catatan kasar lapangan, ide singkat, atau laporan mentah dari operator menjadi 1-2 kalimat rumusan agenda/isu kebijakan yang terstruktur, elegan, berwibawa, dan sarat advokasi kepentingan warga di wilayah ${dapilName || 'Dapil'}.
Aturan:
1. Formulasikan aksi nyata (misal: meninjau langsung, mengawal kepastian alokasi anggaran, menyerap aspirasi kelompok warga, mendesak percepatan regulasi/infrastruktur).
2. Gunakan nada bicara negarawan yang solutif, konstruktif, dan berorientasi pada kepentingan konstituen daerah.
3. JANGAN gunakan tanda kutip, JANGAN berikan kalimat pembuka seperti "Berikut hasilnya:", langsung berikan rumusan agenda dalam Bahasa Indonesia yang siap pakai.`;
      } else if (style === 'poster') {
        instruction = `Kamu adalah asisten perumus prompt poster advokasi kebijakan publik POLARIS. Ubah ide kasar pengguna menjadi 1-2 kalimat prompt poster editorial kebijakan yang berwibawa, tajam, dan memiliki konteks visual yang jelas untuk digenerate menjadi poster resmi. MANDAT MUTLAK: DILARANG KERAS menyertakan nama tokoh, politisi, nama pejabat, atau instruksi melukis orang/wajah manusia. Fokus 100% pada tema kebijakan, lanskap daerah, arsitektur publik, atau konsep simbolik pembangunan. Jangan gunakan tanda kutip, jangan gunakan pengantar pembuka atau penutup, langsung berikan kalimat prompt yang sudah disempurnakan dalam bahasa Indonesia.`;
      } else {
        instruction = `Kamu adalah asisten perumus prompt infografis data publik POLARIS. Ubah ide kasar pengguna menjadi 1-2 kalimat prompt infografis yang kaya data, indikator capaian, dan ringkasan kebijakan terstruktur. MANDAT MUTLAK: DILARANG KERAS menyertakan nama tokoh, politisi, nama pejabat, atau instruksi melukis orang/wajah manusia. Jangan gunakan tanda kutip, jangan gunakan pengantar pembuka atau penutup, langsung berikan kalimat prompt yang sudah disempurnakan dalam bahasa Indonesia.`;
      }

      const contextParts: string[] = [];
      if (memberName) contextParts.push(`Tokoh: ${memberName}`);
      if (dapilName) contextParts.push(`Dapil: ${dapilName}`);
      if (commissionName) contextParts.push(`Komisi: ${commissionName}`);
      if (partyAffiliation) {
        try {
          const resolved = await PartyIdeologyResolver.resolveDirective({
            partyAffiliation,
            topic: rawPrompt,
          });
          contextParts.push(`Fraksi: ${resolved.partyName} (${resolved.ideologySpectrum})`);
          if (resolved.preferredVocabulary.length > 0) {
            contextParts.push(`Diksi Fraksi: ${resolved.preferredVocabulary.slice(0, 3).join(', ')}`);
          }
        } catch {
          contextParts.push(`Fraksi/Partai: ${partyAffiliation}`);
        }
      }
      const contextStr = contextParts.length > 0 ? ` (Konteks Tokoh: ${contextParts.join(', ')})` : '';

      const fullPrompt = `${instruction}\n\nIde Kasar Pengguna: "${rawPrompt}"${contextStr}\n\nHasil Sempurna:`;
      const telemetry = AiTelemetryService.startTrace({
        operation: 'prompt-refiner-gemini',
        model,
        tenantId: options.tenantId,
        inputPayload: { style, rawPromptLength: rawPrompt.length },
      });

      try {
        const response = await client.models.generateContent({
          model,
          contents: fullPrompt,
        });

        const refined = response.text?.trim();
        const usage = AiTelemetryService.extractGeminiUsage(response, fullPrompt.length, (refined || '').length);
        await telemetry.endTrace({
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          status: 'SUCCESS',
          outputSummary: (refined || rawPrompt).slice(0, 200),
        });
        return { refinedPrompt: refined || rawPrompt };
      } catch (innerErr: any) {
        await telemetry.endTrace({
          inputTokens: Math.ceil(fullPrompt.length / 4),
          outputTokens: 0,
          status: 'FAILED',
          errorMessage: innerErr?.message,
        });
        throw innerErr;
      }
    } catch (err: any) {
      console.warn('[PromptRefinerService] Fallback ke prompt asli:', err.message);
      return { refinedPrompt: rawPrompt };
    }
  }

  /**
   * Menghasilkan 4-5 topik isu hangat daerah yang relevan dengan dapil & komisi tokoh
   * menggunakan Google Gemini Flash Lite (Ultra-Cepat & Realistis).
   */
  public static async generateTrendingTopics(options: GenerateDapilTopicsOptions): Promise<string[]> {
    const {
      memberName,
      dapilName,
      provinceName,
      regencyCoverage = [],
      partyAffiliation,
      legislativeLevel,
      commissionName,
      issueInterests = [],
      recentNewsHeadlines = [],
    } = options;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // Fallback cerdas jika API key belum dikonfigurasi
    const fallbackTopics = [
      `Distribusi Pupuk Bersubsidi & Bantuan Petani di ${dapilName || 'Dapil'}`,
      `Perbaikan Jalan Rusak & Infrastruktur Desa di ${dapilName || 'Dapil'}`,
      `Layanan Rujukan BPJS & Kualitas Faskes Daerah di ${dapilName || 'Dapil'}`,
      `Akses Modal Usaha UMKM & Lapangan Kerja Pemuda di ${dapilName || 'Dapil'}`,
    ];

    if (!apiKey) return fallbackTopics;

    try {
      const client = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_LITE_MODEL || 'gemini-3.1-flash-lite';

      let partyIdeologyHint = '';
      if (partyAffiliation) {
        try {
          const resolved = await PartyIdeologyResolver.resolveDirective({
            partyAffiliation,
            topic: dapilName,
          });
          partyIdeologyHint = `- Haluan Ideologi Fraksi: ${resolved.partyName} (${resolved.ideologySpectrum}). Fokus: ${resolved.corePhilosophies.slice(0, 3).join(', ')}`;
        } catch {}
      }

      const prompt = `Kamu adalah analis intelijen kebijakan publik dan komunikasi politik POLARIS.
Buatlah 4 topik isu hangat daerah yang paling relevan, mendesak, dan realistis untuk disuarakan oleh:
- Tokoh: ${memberName}
- Jabatan: ${legislativeLevel || 'Anggota DPRD'}
- Dapil: ${dapilName} ${provinceName ? `(${provinceName})` : ''}
${regencyCoverage.length > 0 ? `- Cakupan Wilayah: ${regencyCoverage.slice(0, 4).join(', ')}` : ''}
${commissionName ? `- Penugasan Komisi: ${commissionName}` : ''}
${partyAffiliation ? `- Fraksi Partai: ${partyAffiliation}` : ''}
${issueInterests.length > 0 ? `- Minat Kebijakan & Isu Fokus Tokoh: ${issueInterests.join(', ')}` : ''}
${partyIdeologyHint ? `${partyIdeologyHint}\n` : ''}${recentNewsHeadlines.length > 0 ? `- Sinyal Berita Daerah Terbaru: ${recentNewsHeadlines.slice(0, 3).join('; ')}` : ''}

Aturan:
1. Setiap topik harus spesifik ke nama wilayah atau permasalahan riil di daerah tersebut (bukan isu generik nasional).
2. Panjang tiap topik antara 6 sampai 10 kata.
3. Kembalikan HANYA format JSON array murni tanpa markdown, tanpa backticks, contoh format:
["Topik 1", "Topik 2", "Topik 3", "Topik 4"]`;

      const telemetry = AiTelemetryService.startTrace({
        operation: 'trending-dapil-topics-gemini',
        model,
        tenantId: options.tenantId,
        inputPayload: { dapilName, memberName },
      });

      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
        });

        const text = (response.text || '').trim();
        const usage = AiTelemetryService.extractGeminiUsage(response, prompt.length, text.length);
        await telemetry.endTrace({
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          status: 'SUCCESS',
          outputSummary: text.slice(0, 200),
        });

        const cleanJson = text.replace(/^```(json)?|```$/gi, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.slice(0, 4).map((t) => String(t).trim());
        }
        return fallbackTopics;
      } catch (innerErr: any) {
        await telemetry.endTrace({
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: 0,
          status: 'FAILED',
          errorMessage: innerErr?.message,
        });
        throw innerErr;
      }
    } catch (err: any) {
      console.warn('[PromptRefinerService] Gagal generate trending topics, fallback:', err.message);
      return fallbackTopics;
    }
  }
}
