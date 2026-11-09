'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Check, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface InfographicTemplateOption {
  id: string; // 'AUTO' | Archetype key
  name: string;
  tagline: string;
  number?: string;
  accentColor: string;
  thumbnailUrl?: string;
  archetype?: string;
  paperTone: 'LIGHT' | 'DARK';
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplateOption[] = [
  {
    id: 'AUTO',
    name: 'Rekomendasi AI Otomatis',
    tagline: 'AI menganalisis topik dan memilihkan template paling relevan & bervariasi',
    accentColor: '#3B82F6',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_NARRATIVE_WAVE',
    number: '01',
    name: 'Gelombang Naratif Merah',
    tagline: 'Pita S-Curve merah bergelombang dinamis membelah tahapan alur isu',
    accentColor: '#991B1B',
    thumbnailUrl: '/templates/infografis/template-01-red-wave-narrative.jpg',
    archetype: 'INFOGRAPHIC_NARRATIVE_WAVE',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_CHRONICLE_GRID',
    number: '02',
    name: 'Kronik Broadsheet Grid',
    tagline: 'Format pers investigasi dual-fase, masthead headline & kartu rekam jejak',
    accentColor: '#EA580C',
    thumbnailUrl: '/templates/infografis/template-02-biography-timeline-grid.jpg',
    archetype: 'INFOGRAPHIC_CHRONICLE_GRID',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_RADIAL_CLOCK',
    number: '03',
    name: 'Jam Melingkar Radial',
    tagline: 'Dial jam saku antik, sektor waktu radial memancar ke tonggak kebijakan',
    accentColor: '#D97706',
    thumbnailUrl: '/templates/infografis/template-03-radial-clock-chronicle.jpg',
    archetype: 'INFOGRAPHIC_RADIAL_CLOCK',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    number: '04',
    name: 'Advokasi Data & 5 Pilar',
    tagline: '5 pilar kapsul solusi vertikal, data statistik besar & aksen batik Nusantara',
    accentColor: '#2563EB',
    thumbnailUrl: '/templates/infografis/template-04-advocacy-data-pillars.jpg',
    archetype: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_VISIONARY_TIMELINE',
    number: '05',
    name: 'Garis Waktu Visioner',
    tagline: 'Profil modern minimalis monokrom, glassmorphism & pita milestone waktu',
    accentColor: '#0F172A',
    thumbnailUrl: '/templates/infografis/template-05-visionary-milestone-timeline.jpg',
    archetype: 'INFOGRAPHIC_VISIONARY_TIMELINE',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_EDITORIAL_COLLAGE',
    number: '06',
    name: 'Kolase Risograf Blok',
    tagline: 'Risograf zine edukatif-sains, tipografi bertingkat blok warna teal & mustard',
    accentColor: '#0D9488',
    thumbnailUrl: '/templates/infografis/template-06-Light bears shadow.jpg',
    archetype: 'INFOGRAPHIC_EDITORIAL_COLLAGE',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_HISTORICAL_EXPEDITION',
    number: '07',
    name: 'Ekspedisi & Perkamen Klasik',
    tagline: 'Catatan arsip sejarah vintage berlatar gulungan perkamen cokelat & kompas',
    accentColor: '#78350F',
    thumbnailUrl: '/templates/infografis/template-07-template-infografis.jpg',
    archetype: 'INFOGRAPHIC_HISTORICAL_EXPEDITION',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_PUNK_ZINE',
    number: '08',
    name: 'Zine Eco-Punk Halftone',
    tagline: 'Gaya zine punk risograf neon hot pink & lime, tekstur halftone kontras tinggi',
    accentColor: '#FF2E93',
    thumbnailUrl: '/templates/infografis/template-08-punk-zine-halftone.jpg',
    archetype: 'INFOGRAPHIC_PUNK_ZINE',
    paperTone: 'DARK',
  },
  {
    id: 'INFOGRAPHIC_HERITAGE_EDITORIAL',
    number: '09',
    name: 'Warisan Budaya Nusantara',
    tagline: 'Bingkai merah marun elegan, aksen pita Merah Putih & alur 4 langkah edukasi',
    accentColor: '#881337',
    thumbnailUrl: '/templates/infografis/template-09-cultural-heritage-card.jpg',
    archetype: 'INFOGRAPHIC_HERITAGE_EDITORIAL',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_INDIGENOUS_ADVOCACY',
    number: '10',
    name: 'Advokasi Budaya Scrapbook',
    tagline: 'Scrapbook organik serat bumi etnik nusantara & kotak tanya-jawab dialog',
    accentColor: '#10B981',
    thumbnailUrl: '/templates/infografis/template-10-indigenous-advocacy.jpg',
    archetype: 'INFOGRAPHIC_INDIGENOUS_ADVOCACY',
    paperTone: 'DARK',
  },
  {
    id: 'INFOGRAPHIC_CLASSICAL_MONUMENT',
    number: '11',
    name: 'Monumen Pualam Klasik',
    tagline: 'Pualam batu pasir antik, patung megah pahlawan & lengkungan marmer historis',
    accentColor: '#B45309',
    thumbnailUrl: '/templates/infografis/template-11-classical-monument.jpg',
    archetype: 'INFOGRAPHIC_CLASSICAL_MONUMENT',
    paperTone: 'LIGHT',
  },
  {
    id: 'INFOGRAPHIC_RETRO_SUNBURST',
    number: '12',
    name: 'Pancaran Surya Retro',
    tagline: 'Pancaran sinar retro oranye-amber, panel komik vintage & fakta sejarah',
    accentColor: '#EA580C',
    thumbnailUrl: '/templates/infografis/template-12-retro-sunburst-history.jpg',
    archetype: 'INFOGRAPHIC_RETRO_SUNBURST',
    paperTone: 'LIGHT',
  },
];

const TEMPLATE_LAYOUT_SPECS: Record<
  string,
  Array<{ variant: number; title: string; subtitle: string; tag: string }>
> = {
  INFOGRAPHIC_NARRATIVE_WAVE: [
    {
      variant: 0,
      title: 'Varian 1 • Klasik S-Curve',
      subtitle: 'Pita Merah Asli + Bar 4 KPI Glass',
      tag: 'Referensi Asli',
    },
    {
      variant: 1,
      title: 'Varian 2 • Stepper Nodes',
      subtitle: 'Badge 01-04 + Matriks KPI 2×2',
      tag: 'Tahapan Isu',
    },
    {
      variant: 2,
      title: 'Varian 3 • Hero Metric Triad',
      subtitle: '1 Angka Raksasa + Aksen Emas',
      tag: 'Fokus Angka',
    },
    {
      variant: 3,
      title: 'Varian 4 • Scorecard Grid',
      subtitle: 'Tabel Matriks Indikator Kinerja',
      tag: 'Formal Dinas',
    },
  ],
  INFOGRAPHIC_CHRONICLE_GRID: [
    {
      variant: 0,
      title: 'Varian 1 • Broadsheet Grid',
      subtitle: 'Pilar Oranye + 3 Kartu Berita Koran',
      tag: 'Format Soedirman',
    },
    {
      variant: 1,
      title: 'Varian 2 • Investigasi Arsip',
      subtitle: 'Dual Faset Data & Garis Kronologi',
      tag: 'Rekam Jejak',
    },
    {
      variant: 2,
      title: 'Varian 3 • Headline Fokus',
      subtitle: 'Masthead Besar + Kartu Capaian',
      tag: 'Advokasi Warga',
    },
    {
      variant: 3,
      title: 'Varian 4 • Matriks Evaluasi',
      subtitle: 'Grid Perbandingan Program Daerah',
      tag: 'Audit Publik',
    },
  ],
};

const DEFAULT_LAYOUT_SPECS = [
  { variant: 0, title: 'Varian 1 • Standar Referensi', subtitle: 'Komposisi utama desain asli', tag: 'Desain Asli' },
  { variant: 1, title: 'Varian 2 • Sekuensial Tahapan', subtitle: 'Fokus pada kronologi & alur', tag: 'Kronologis' },
  { variant: 2, title: 'Varian 3 • Metrik Unggulan', subtitle: 'Penonjolan data statistik besar', tag: 'Data Fokus' },
  { variant: 3, title: 'Varian 4 • Matriks Ringkas', subtitle: 'Penyajian padat & terstruktur', tag: 'Eksekutif' },
];

interface InfographicTemplateSelectorProps {
  selectedArchetype: string;
  onSelectArchetype: (archetypeId: string) => void;
  selectedLayoutVariant?: number | 'AUTO';
  onSelectLayoutVariant?: (variant: number | 'AUTO') => void;
  disabled?: boolean;
}

export function InfographicTemplateSelector({
  selectedArchetype,
  onSelectArchetype,
  selectedLayoutVariant = 'AUTO',
  onSelectLayoutVariant,
  disabled = false,
}: InfographicTemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeOption =
    INFOGRAPHIC_TEMPLATES.find((t) => t.id === selectedArchetype) ||
    INFOGRAPHIC_TEMPLATES[0];

  const currentArchetypeKey = activeOption.archetype || selectedArchetype;
  const layoutSpecs =
    (currentArchetypeKey && TEMPLATE_LAYOUT_SPECS[currentArchetypeKey]) ||
    DEFAULT_LAYOUT_SPECS;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 sm:p-4 space-y-3">
      {/* HEADER BAR: INFORMASI TEMPLATE AKTIF & TOMBOL TOGGLE GALERI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Template Desain Infografis (12 Referensi)
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300">
                {activeOption.number ? `Template ${activeOption.number}` : 'AI Otomatis'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Aktif: <strong className="text-slate-900 dark:text-slate-100">{activeOption.name}</strong> — {activeOption.tagline}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="h-8 gap-1.5 text-xs font-bold self-start sm:self-auto border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {isExpanded ? (
            <>
              Tutup Katalog <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Pilih dari 12 Template <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {/* HORIZONTAL CAROUSEL PREVIEW KETIKA COLLAPSED */}
      {!isExpanded && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {INFOGRAPHIC_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedArchetype;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onSelectArchetype(tmpl.id)}
                disabled={disabled}
                className={`group flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-left transition-all shrink-0 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50'
                }`}
              >
                {tmpl.thumbnailUrl ? (
                  <div className="relative h-7 w-6 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200">
                    <Image
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.name}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-7 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {tmpl.number ? `${tmpl.number} • ${tmpl.name}` : tmpl.name}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* GRID EXPANDED: 12 KARTU TEMPLATE LENGKAP DENGAN THUMBNAIL BESAR */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {INFOGRAPHIC_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedArchetype;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  onSelectArchetype(tmpl.id);
                  // Tetap expand agar user bisa melihat detail atau klik lain
                }}
                disabled={disabled}
                className={`group relative flex flex-col rounded-2xl border text-left overflow-hidden transition-all ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/30 shadow-md bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                {/* THUMBNAIL 4:5 */}
                <div className="relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {tmpl.thumbnailUrl ? (
                    <Image
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/40">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-300">
                        Pilihan Otomatis
                      </span>
                    </div>
                  )}

                  {/* BADGE NOMOR TEMPLATE */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="rounded-lg bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                      {tmpl.number ? `T-${tmpl.number}` : 'AUTO'}
                    </span>
                  </div>

                  {/* ACTIVE INDICATOR OVERLAY */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* INFO METADATA */}
                <div className="p-2.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tmpl.tagline}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-1.5 text-[10px]">
                    <span
                      className="h-2 w-2 rounded-full inline-block"
                      style={{ backgroundColor: tmpl.accentColor }}
                    />
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">
                      {tmpl.paperTone === 'DARK' ? 'Dark Paper' : 'Light Paper'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SELEKTOR VARIAN LAYOUT (UNTUK TESTING & EVALUASI DESAIN) */}
      {onSelectLayoutVariant && selectedArchetype !== 'AUTO' && (
        <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pilih Varian Tata Letak ({activeOption.name})
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                Mode Uji Coba
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Pilih 1 dari 4 tata letak dinamis untuk evaluasi komposisi
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {/* OPSI OTOMATIS */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectLayoutVariant('AUTO')}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedLayoutVariant === 'AUTO'
                  ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 ring-2 ring-blue-500/20 text-blue-950 dark:text-blue-100'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] font-black uppercase">Otomatis AI</span>
                {selectedLayoutVariant === 'AUTO' && (
                  <Check className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
                )}
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                Rotasi dinamis acak
              </div>
            </button>

            {/* 4 VARIAN SPESIFIK */}
            {layoutSpecs.map((spec) => {
              const isSelected = selectedLayoutVariant === spec.variant;
              return (
                <button
                  key={spec.variant}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectLayoutVariant(spec.variant)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-black uppercase truncate">
                      {spec.title}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    {spec.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

