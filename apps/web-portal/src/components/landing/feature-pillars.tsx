'use client';

import { FileText, BarChart3, Image as ImageIcon, Users, ArrowRight } from 'lucide-react';

interface FeaturePillarsProps {
  onSelectCategory?: (category: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
}

const pillars = [
  {
    type: 'ARTIKEL' as const,
    icon: FileText,
    title: 'Artikel Berkualitas',
    description: 'Ubah ide menjadi artikel yang efektif dan bernas untuk publik.',
    cta: 'Jelajahi Artikel',
  },
  {
    type: 'INFOGRAFIS' as const,
    icon: BarChart3,
    title: 'Infografis yang Jelas',
    description: 'Visualisasikan data statistik dan pesan agar mudah dipahami.',
    cta: 'Jelajahi Infografis',
  },
  {
    type: 'POSTER' as const,
    icon: ImageIcon,
    title: 'Poster Profesional',
    description: 'Sampaikan program, kegiatan, dan kampanye dengan desain menarik.',
    cta: 'Jelajahi Poster',
  },
  {
    type: 'SOLUSI' as const,
    icon: Users,
    title: 'Untuk Eksekutif & Legislatif',
    description: 'Dirancang sesuai kebutuhan komunikasi di tingkat pusat maupun daerah.',
    cta: 'Lihat Solusi',
  },
];

export function FeaturePillars({ onSelectCategory }: FeaturePillarsProps) {
  const handleClick = (type: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER' | 'SOLUSI') => {
    if (type === 'SOLUSI') {
      const el = document.getElementById('solusi');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (onSelectCategory) {
        onSelectCategory(type);
      }
      const el = document.getElementById('contoh-konten');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="fitur" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-16 scroll-mt-24">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleClick(item.type)}
                className={`flex items-start gap-4 pt-4 sm:pt-0 text-left group p-2 rounded-2xl hover:bg-slate-50/80 transition-all ${
                  idx !== 0 ? 'sm:pl-6 lg:pl-8' : ''
                }`}
              >
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-snug group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-600 shrink-0" />
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                  <span className="text-[11px] font-bold text-blue-600 inline-block group-hover:underline pt-0.5">
                    {item.cta} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
