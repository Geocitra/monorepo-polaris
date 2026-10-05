'use client';

import { Shield, Sparkles, Database, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onRequestDemo: () => void;
}

export function AboutSection({ onRequestDemo }: AboutSectionProps) {
  return (
    <section id="tentang" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white border-t border-slate-200/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADER */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Misi dan Filosofi POLARIS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Membangun Kedaulatan Wacana Publik Melalui Diseminasi Pemikiran Bermutu Tinggi
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            POLARIS bukan sekadar sarana komunikasi biasa, melainkan sistem operasi kecerdasan legislatif dan eksekutif yang menjembatani kedalaman telaah kebijakan dengan daya jangkau publik modern.
          </p>
        </div>

        {/* 3 CORE PILLARS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Berbasis Data & Regulasi Sah
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Setiap telaah ditopang oleh basis data statistik BPS, dokumen APBD/APBN, dan repositori hukum JDIH resmi sehingga argumen yang disajikan kokoh di mata publik maupun forum parlemen.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Standar Narasi 3.000 Kata
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Mendorong budaya literasi kebijakan yang mendalam. Menjaga gagasan para pemimpin agar tidak tereduksi menjadi sekadar sensasi singkat, melainkan pandangan komprehensif berwibawa.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Kedaulatan & Keamanan Tertinggi
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Infrastruktur berlokasi di Indonesia dengan kepatuhan penuh terhadap UU PDP (Undang-Undang Perlindungan Data Pribadi) dan standar keamanan informasi lembaga negara.
            </p>
          </div>
        </div>

        {/* METRICS COUNTER BAR */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">3.000+</div>
              <div className="text-xs text-slate-400 font-semibold">Kata Analisis per Artikel</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">&lt; 3 Mnt</div>
              <div className="text-xs text-slate-400 font-semibold">Transformasi Pokok Pikiran</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">100%</div>
              <div className="text-xs text-slate-400 font-semibold">Kedaulatan Server Domestik</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">3 Format</div>
              <div className="text-xs text-slate-400 font-semibold">Artikel, Infografis & Poster</div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
              Ingin mengimplementasikan ekosistem POLARIS di institusi atau fraksi Anda?
            </span>
            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Lihat Paket Harga & Lisensi</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
