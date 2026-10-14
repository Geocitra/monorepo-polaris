'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface MetricsInfographicDockProps {
  member: any;
  theme?: any;
  config?: Record<string, any>;
  variant?: string;
}

export function MetricsInfographicDock({}: MetricsInfographicDockProps) {
  return (
    <section id="infografis" className="rounded-3xl bg-[#fbf8f3] p-6 sm:p-8 space-y-6 border border-amber-100/60 shadow-xs">
      {/* SECTION HEADER: INFOGRAFIS — & Lihat Semua Infografis -> */}
      <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Infografis
          </h2>
          <span className="w-8 h-0.5 bg-slate-400 rounded-full" />
        </div>

        <Link
          href="/infografis"
          className="text-xs sm:text-sm font-bold text-[#96702c] hover:text-[#836125] flex items-center gap-1.5 transition-colors group"
        >
          <span>Lihat Semua Infografis</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4 CARDS GRID (Sesuai Gambar 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KARTU 1: Realisasi Program Pembangunan */}
        <div className="p-5 rounded-2xl bg-white border border-amber-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Realisasi Program Pembangunan
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Data utama pembangunan di daerah pemilihan.
            </p>

            {/* Visualisasi Bar Chart Vertikal Emas (2022 - 2026) */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#d6bc8b] rounded-t h-[35%]" />
                <span className="text-[9px] font-mono text-slate-400">2022</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#c9ab73] rounded-t h-[48%]" />
                <span className="text-[9px] font-mono text-slate-400">2023</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#ba9858] rounded-t h-[65%]" />
                <span className="text-[9px] font-mono text-slate-400">2024</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#a98540] rounded-t h-[80%]" />
                <span className="text-[9px] font-mono text-slate-400">2025</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#96702c] rounded-t h-[100%] shadow-xs" />
                <span className="text-[9px] font-mono text-[#96702c] font-black">2026</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/infografis"
              className="text-[11px] font-bold text-slate-600 hover:text-[#96702c] inline-flex items-center gap-1 transition"
            >
              <span>Lihat Infografis</span>
              <ArrowRight className="w-3 h-3 text-[#96702c]" />
            </Link>
          </div>
        </div>

        {/* KARTU 2: Anggaran untuk Rakyat */}
        <div className="p-5 rounded-2xl bg-white border border-amber-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Anggaran untuk Rakyat
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Ringkasan alokasi dan realisasi anggaran.
            </p>

            {/* Donut Chart SVG dengan Legenda */}
            <div className="pt-3 flex items-center justify-between gap-3">
              {/* Donut Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segmen 1: Infrastruktur 40% (Navy) */}
                  <path
                    stroke="#1e3a8a"
                    strokeWidth="4.5"
                    strokeDasharray="40, 100"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segmen 2: Pendidikan 25% (Gold) */}
                  <path
                    stroke="#d97706"
                    strokeWidth="4.5"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-40"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segmen 3: Kesehatan 20% (Teal) */}
                  <path
                    stroke="#0d9488"
                    strokeWidth="4.5"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-65"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segmen 4: Ekonomi 15% (Indigo) */}
                  <path
                    stroke="#4338ca"
                    strokeWidth="4.5"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-85"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Text Center */}
                <div className="absolute text-center leading-tight">
                  <span className="block text-[9px] font-bold text-slate-400">Rp</span>
                  <span className="block text-xs font-black text-slate-800">12,4 T</span>
                </div>
              </div>

              {/* Legenda Donut */}
              <div className="space-y-1 text-[10px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                  <span>Infrastruktur 40%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                  <span>Pendidikan 25%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
                  <span>Kesehatan 20%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4338ca]" />
                  <span>Ekonomi 15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/infografis"
              className="text-[11px] font-bold text-slate-600 hover:text-[#96702c] inline-flex items-center gap-1 transition"
            >
              <span>Lihat Infografis</span>
              <ArrowRight className="w-3 h-3 text-[#96702c]" />
            </Link>
          </div>
        </div>

        {/* KARTU 3: Capaian Legislasi 2020–2026 */}
        <div className="p-5 rounded-2xl bg-white border border-amber-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Capaian Legislasi 2020–2026
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Produktivitas perancangan regulasi.
            </p>

            {/* List Pills Angka */}
            <div className="pt-3 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  12
                </span>
                <span className="text-[11px] font-semibold text-slate-700">RUU diinisiasi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#d97706] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  24
                </span>
                <span className="text-[11px] font-semibold text-slate-700">RUU dibahas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  18
                </span>
                <span className="text-[11px] font-semibold text-slate-700">RUU disahkan</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/infografis"
              className="text-[11px] font-bold text-slate-600 hover:text-[#96702c] inline-flex items-center gap-1 transition"
            >
              <span>Lihat Infografis</span>
              <ArrowRight className="w-3 h-3 text-[#96702c]" />
            </Link>
          </div>
        </div>

        {/* KARTU 4: Dampak Program untuk Masyarakat */}
        <div className="p-5 rounded-2xl bg-white border border-amber-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Dampak Program untuk Masyarakat
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Indikator utama kesejahteraan di daerah pemilihan.
            </p>

            {/* 3 Kotak Statistik Angka */}
            <div className="pt-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-black text-slate-900">125.000</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">Penerima Manfaat</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-black text-slate-900">320 km</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">Jalan Dibangun</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-black text-slate-900">85</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">Sekolah Direvitalisasi</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-right">
            <Link
              href="/infografis"
              className="text-[11px] font-bold text-slate-600 hover:text-[#96702c] inline-flex items-center gap-1 transition"
            >
              <span>Lihat Infografis</span>
              <ArrowRight className="w-3 h-3 text-[#96702c]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
