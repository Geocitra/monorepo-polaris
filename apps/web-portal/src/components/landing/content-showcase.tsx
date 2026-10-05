'use client';

import { Sparkles, ArrowUpRight, BookOpen, Eye } from 'lucide-react';
import { ContentItemDetails } from './content-reader-modal';

export const showcaseItems: ContentItemDetails[] = [
  {
    type: 'ARTIKEL',
    title: 'Transformasi Subsidi Pupuk Organik & Modernisasi Pertanian Berkelanjutan di Jawa Barat',
    category: 'Kebijakan Pertanian & Pangan',
    author: 'Ahmad Fauzi, S.P., M.Si.',
    role: 'Anggota Komisi IV DPR RI',
    wordCount: '2.850 kata',
    excerpt: 'Analisis komprehensif mengenai pergeseran paradigma alokasi anggaran subsidi pupuk menuju mekanisasi presisi untuk menjamin kedaulatan pangan 2026-2030.',
    tags: ['APBN 2026', 'Perpres Pupuk', 'BPS Pertanian', 'Dapil Jabar VII'],
    previewImage: '/images/showcase-artikel-pertanian.jpg',
  },
  {
    type: 'INFOGRAFIS',
    title: 'Visualisasi Realisasi APBD Jawa Barat 2026: Alokasi Sektor Infrastruktur & Pendidikan',
    category: 'Transparansi Fiskal Daerah',
    author: 'Dra. Hj. Siti Nurhaliza',
    role: 'Pimpinan Badan Anggaran DPRD',
    wordCount: 'Data Grafik BPS',
    excerpt: 'Paparan visual multi-indikator yang membedah penyerapan anggaran per triwulan dan dampaknya terhadap penurunan angka kemiskinan ekstrem di 27 kabupaten/kota.',
    tags: ['Realisasi APBD', 'Data BPS', 'Infrastruktur Jalan', 'Dana Bagi Hasil'],
    previewImage: '/images/showcase-infografis-apbd.jpg',
  },
  {
    type: 'POSTER',
    title: 'Poster Advokasi: Akselerasi Pembangkit Surya Atap untuk Kemandirian Energi Komunitas',
    category: 'Transisi Energi Hijau',
    author: 'Ir. Budi Santoso, M.T.',
    role: 'Komisi VII DPR RI',
    wordCount: 'Format Siap Cetak & Medsos',
    excerpt: 'Materi grafis publikasi resmi fraksi yang merangkum poin-poin insentif tarif energi terbarukan dan tahapan instalasi panel surya untuk industri kecil menengah.',
    tags: ['RUU EBT', 'Net Zero 2060', 'Insentif Fiskal', 'Kampanye Hijau'],
    previewImage: '/images/showcase-poster-surya.jpg',
  },
];

interface ContentShowcaseProps {
  activeCategory?: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER';
  onCategoryChange?: (category: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
  onOpenReader: (item: ContentItemDetails) => void;
}

export function ContentShowcase({
  activeCategory = 'ALL',
  onCategoryChange,
  onOpenReader,
}: ContentShowcaseProps) {
  const filteredItems = activeCategory === 'ALL'
    ? showcaseItems
    : showcaseItems.filter((i) => i.type === activeCategory);

  return (
    <section id="contoh-konten" className="py-20 bg-slate-50 border-t border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Showcase Output Pemikiran Pemimpin</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Dari Gagasan Mentah Menjadi Konten Publikasi Berbobot Tinggi
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Klik pada salah satu kartu di bawah untuk membuka pratinjau naskah artikel lengkap, visualisasi data, dan materi poster resmi yang dihasilkan sistem.
          </p>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'ALL', label: 'Semua Format Konten' },
              { id: 'ARTIKEL', label: 'Artikel Kebijakan' },
              { id: 'INFOGRAFIS', label: 'Infografis Data' },
              { id: 'POSTER', label: 'Poster & Kampanye' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onCategoryChange?.(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-102'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpenReader(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenReader(item);
                }
              }}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div>
                {/* PREVIEW THUMBNAIL */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.previewImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      <span>Buka Ulasan Dokumen</span>
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/10">
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm">
                      {item.wordCount}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-6 space-y-3">
                  <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wide block">
                    {item.category}
                  </span>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {item.author}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {item.role}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
