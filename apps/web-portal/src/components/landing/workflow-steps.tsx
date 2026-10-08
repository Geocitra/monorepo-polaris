'use client';

import Link from 'next/link';
import { Sparkles, Brain, Share2, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Input Ide & Pokok Pikiran',
    desc: 'Cukup masukkan draf gagasan, catatan sidang komisi, atau isu aktual di daerah Anda tanpa perlu menyusun naskah formal dari awal.',
    badge: 'Teks, Notula, atau Isu',
    actionText: 'Lihat Contoh Masukan',
    href: '/platform/artikel',
  },
  {
    step: '02',
    title: 'Mesin AI Menganalisis & Menyusun',
    desc: 'Sistem menautkan gagasan Anda dengan undang-undang yang berlaku, data statistik BPS, dan angka APBD daerah secara otomatis.',
    badge: 'Konteks Regulasi Otentik',
    actionText: 'Uji Validasi Regulasi',
    href: '/tentang',
  },
  {
    step: '03',
    title: 'Konten Siap Disiarkan',
    desc: 'Hasilkan artikel 3.000 kata berstruktur jurnalistik dewan, infografis data visual interaktif, dan poster resolusi tinggi dalam 1 kali proses.',
    badge: 'Multi-Kanal Eksekutif',
    actionText: 'Lihat Hasil Publikasi',
    href: '/#contoh-konten',
  },
];

export function WorkflowSteps() {
  return (
    <section id="keunggulan" className="pt-6 sm:pt-8 pb-16 sm:pb-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 block">
            Alur Kerja Cepat & Presisi
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Bagaimana POLARIS Mengubah Ide Menjadi Konten Siap Bagikan
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Didesain khusus untuk ritme kerja pejabat publik dan staf ahli yang membutuhkan kecepatan tanpa mengorbankan kedalaman substansi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-5 hover:bg-blue-50/40 hover:border-blue-200 hover:shadow-lg transition-all relative group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-600/30 group-hover:text-blue-600 transition-colors">
                    {item.step}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={item.href}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:border-blue-300"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
