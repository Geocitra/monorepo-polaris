'use client';

import Link from 'next/link';
import { 
  MapPin, 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  BarChart3,
  Image as ImageIcon,
  ShieldCheck,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function SolusiPemdaPage() {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-emerald-50/60 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Solusi Institusi</span>
              <span>/</span>
              <span className="text-emerald-600 font-bold">Kepala Daerah & OPD Pemda</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5" />
              <span>Eksekutif Daerah & Dinas Teknis</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Solusi Diseminasi Capaian Kinerja dan Komunikasi Program Strategis Daerah.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Membantu Gubernur, Bupati, Walikota, serta Kepala Dinas/OPD menerjemahkan bahasa teknokratis RPJMD menjadi artikel inspiratif, infografis kemajuan pembangunan yang akuntabel, dan materi sosialisasi layanan publik yang simpatik.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
              >
                <span>Lihat Paket Harga Eksekutif</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Ajukan Konsultasi Lisensi</span>
              </Link>
            </div>

          </div>
        </section>

        {/* 3 CORE PILLARS FOR PEMDA */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Arsitektur Komunikasi Eksekutif</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Membangun Kepercayaan Publik atas Pembangunan Daerah
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Opini Kepemimpinan Daerah</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menyusun artikel opini berkala kepala daerah untuk media cetak/online nasional guna memaparkan arah transformasi ekonomi, iklim investasi, dan reformasi birokrasi.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Infografis Capaian IKU & SPM</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Visualisasi kemantapan infrastruktur jalan, penurunan angka kemiskinan ekstrem, dan peningkatan Indeks Pembangunan Manusia (IPM) kabupaten/kota.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Manajemen Isu & Klarifikasi</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menghasilkan tanggapan resmi dan lembar fakta (factsheet) visual cepat dalam waktu kurang dari 15 menit ketika terjadi krisis atau disinformasi kebijakan publik.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-16 bg-slate-50 border-t border-slate-200/80 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-5">
            <h3 className="text-2xl font-black text-slate-900">
              Modernisasi Hubungan Masyarakat Pemerintah Daerah
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tingkatkan standar komunikasi Dinas Kominfo, Bagian Protokol & Komunikasi Pimpinan (Prokopim), serta OPD teknis dengan sistem terpadu POLARIS.
            </p>
            <div className="pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
              >
                <span>Ajukan Permohonan Lisensi Pemda</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
