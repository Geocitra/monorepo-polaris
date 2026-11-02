import { openaiClient } from '../../client.js';

export interface GenerateInfographicContentParams {
  topic: string;
  dapilName?: string;
  targetRegion?: string;
  memberName?: string;
  memberTitle?: string;
  ragContextSummary?: string;
}

export interface GeneratedInfographicContent {
  mainTitle: string;
  subtitle: string;
  categoryTag: string;
  sections: Array<{
    id: string;
    phaseTag: string;
    periodLabel?: string;
    title: string;
    bullets: string[];
    visualPrompt: string;
    badgeColor?: string;
    sectorBg?: string;
  }>;
  profile: {
    name: string;
    title: string;
  };
}

export class DynamicContentArchitect {
  public static async generateContent(
    params: GenerateInfographicContentParams
  ): Promise<GeneratedInfographicContent> {
    const {
      topic,
      dapilName = 'Dapil',
      targetRegion = 'NASIONAL',
      memberName = 'Dr. Jonanda P. A. B',
      memberTitle = 'ANGGOTA DEWAN',
      ragContextSummary = '',
    } = params;

    const systemPrompt = `Kamu adalah pakar arsitektur konten redaksional dan infografis kebijakan publik / historis.
Tugasmu adalah merumuskan naskah infografis yang padat, berbasis data/kebijakan, dan berbobot tinggi.
Format keluaran HARUS selalu JSON murni tanpa markdown/penjelasan pembuka/penutup.`;

    const userPrompt = `Topik: "${topic}"
Wilayah: ${dapilName} (${targetRegion})
Tokoh Representatif: ${memberName} (${memberTitle})
${ragContextSummary ? `\nKonteks Data & Regulasi:\n${ragContextSummary}` : ''}

Susunlah konten infografis komprehensif dalam 6 fase kronologis / tematik (dari inisiasi awal, regulasi, mobilisasi, modernisasi, kolaborasi hingga kontemporer).

Skema JSON yang wajib dipatuhi:
{
  "mainTitle": "Judul Utama Singkat & Gagah (1-2 kata, misal: KESEHATAN, REKAM JEJAK, PERBAIKAN)",
  "subtitle": "Subjudul penjelasan kebijakan konkrit (1 kalimat jelas)",
  "categoryTag": "POLARIS GOV",
  "sections": [
    {
      "id": "sec-1",
      "phaseTag": "ERA AWAL",
      "periodLabel": "2015-2017",
      "title": "Judul Fase 1 Singkat",
      "bullets": [
        "Poin fakta/kebijakan konkret pertama.",
        "Poin fakta/kebijakan konkret kedua.",
        "Poin fakta/kebijakan konkret ketiga."
      ],
      "visualPrompt": "Prompt deskripsi ilustrasi visual untuk fase ini (bahasa Inggris, photorealistic / vintage editorial, no text)",
      "badgeColor": "#7B1FA2"
    },
    {
      "id": "sec-2",
      "phaseTag": "REGULASI",
      "periodLabel": "2018-2019",
      "title": "Judul Fase 2 Singkat",
      "bullets": [
        "Poin regulasi/anggaran konkret pertama.",
        "Poin regulasi/anggaran konkret kedua.",
        "Poin regulasi/anggaran konkret ketiga."
      ],
      "visualPrompt": "Prompt ilustrasi fase 2",
      "badgeColor": "#2E7D32"
    },
    {
      "id": "sec-3",
      "phaseTag": "MOBILISASI",
      "periodLabel": "2020-2022",
      "title": "Judul Fase 3 Singkat",
      "bullets": [
        "Poin aksi lapangan pertama.",
        "Poin aksi lapangan kedua."
      ],
      "visualPrompt": "Prompt ilustrasi fase 3",
      "badgeColor": "#0288D1"
    },
    {
      "id": "sec-4",
      "phaseTag": "MODERNISASI",
      "periodLabel": "2023-2024",
      "title": "Judul Fase 4 Singkat",
      "bullets": [
        "Poin digitalisasi/modernisasi pertama.",
        "Poin digitalisasi/modernisasi kedua."
      ],
      "visualPrompt": "Prompt ilustrasi fase 4",
      "badgeColor": "#E65100"
    },
    {
      "id": "sec-5",
      "phaseTag": "KOLABORASI",
      "periodLabel": "2025",
      "title": "Judul Fase 5 Singkat",
      "bullets": [
        "Poin kemitraan/relawan pertama.",
        "Poin kemitraan/relawan kedua."
      ],
      "visualPrompt": "Prompt ilustrasi fase 5",
      "badgeColor": "#C2185B"
    },
    {
      "id": "sec-6",
      "phaseTag": "KONTEMPORER",
      "periodLabel": "2026-FUTURE",
      "title": "Judul Fase 6 Singkat",
      "bullets": [
        "Poin capaian berkelanjutan pertama.",
        "Poin capaian berkelanjutan kedua."
      ],
      "visualPrompt": "Prompt ilustrasi fase 6",
      "badgeColor": "#37474F"
    }
  ],
  "profile": {
    "name": "${memberName}",
    "title": "${memberTitle}"
  }
}`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    return {
      mainTitle: (parsed.mainTitle || topic.slice(0, 20)).toUpperCase(),
      subtitle: parsed.subtitle || topic,
      categoryTag: parsed.categoryTag || 'POLARIS GOV',
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      profile: {
        name: memberName,
        title: memberTitle,
      },
    };
  }
}

