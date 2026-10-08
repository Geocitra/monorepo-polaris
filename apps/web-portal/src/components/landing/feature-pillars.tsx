'use client';

import { ArrowRight } from 'lucide-react';
import { getLandingMediaUrl } from '@/lib/landing-media';

interface FeaturePillarsProps {
  onSelectCategory?: (category: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
}

const pillars = [
  {
    type: 'ARTIKEL' as const,
    title: 'Artikel Berkualitas',
    description: 'Ubah ide dan isu daerah menjadi narasi artikel yang bernas untuk publik.',
    cta: 'Jelajahi Artikel',
    image: getLandingMediaUrl('/images/showcase-artikel-pertanian.jpg'),
  },
  {
    type: 'INFOGRAFIS' as const,
    title: 'Infografis yang Jelas',
    description: 'Visualisasikan data APBD, statistik, dan fakta kebijakan publik.',
    cta: 'Jelajahi Infografis',
    image: getLandingMediaUrl('/images/showcase-infografis-apbd.jpg'),
  },
  {
    type: 'POSTER' as const,
    title: 'Poster Profesional',
    description: 'Sampaikan program kerja dan advokasi dengan visual poster menarik.',
    cta: 'Jelajahi Poster',
    image: getLandingMediaUrl('/images/showcase-poster-surya.jpg'),
  },
  {
    type: 'SOLUSI' as const,
    title: 'Eksekutif & Dewan',
    description: 'Dirancang sesuai standar kerja komunikasi publik tingkat pusat & daerah.',
    cta: 'Lihat Solusi',
    image: getLandingMediaUrl('/images/concierge/hero-poster.webp'),
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
    <section
      id="fitur"
      className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 lg:-mt-36 mb-10 sm:mb-12 scroll-mt-28"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {pillars.map((item, idx) => {
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleClick(item.type)}
              className="group flex items-center gap-3.5 rounded-2xl bg-white p-3 sm:p-3.5 text-left border border-slate-200/90 shadow-xl shadow-slate-950/10 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {/* Thumbnail persegi di sebelah kiri */}
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Konten teks di sebelah kanan */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-600 shrink-0" />
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal line-clamp-2">
                  {item.description}
                </p>
                <span className="text-[10px] font-bold text-blue-600 inline-flex items-center gap-0.5 pt-0.5 group-hover:underline">
                  {item.cta} &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
