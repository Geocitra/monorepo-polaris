'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Database, 
  Award, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Lock,
  Server,
  FileCheck
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function TentangPage() {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-blue-50/50 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-blue-600 font-bold">Tentang Kami</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sistem Operasi Komunikasi Kebijakan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Membangun Kedaulatan Wacana Publik Melalui Diseminasi Pemikiran Bermutu Tinggi.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              POLARIS lahir dari kebutuhan mendesak para pengambil keputusan di Indonesia. Kami bukan sekadar platform digital, melainkan infrastruktur teknologi yang mentransformasikan telaah regulasi, pokok pikiran dewan, dan rencana strategis eksekutif menjadi karya publikasi berwibawa.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
              >
                <span>Lihat Paket Harga Lisensi</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`${DASHBOARD_URL}/register`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Daftar Akun Workspace</span>
              </a>
            </div>

          </div>
        </section>

        {/* 3 CORE PILLARS OF INTEGRITY */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Pondasi Nilai Kelembagaan</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tiga Prinsip Utama POLARIS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Kedaulatan & Keamanan Data Domestik</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Seluruh server dan basis data berlokasi di dalam negeri dengan enkripsi sekelas perbankan (AES-256). Kami patuh 100% pada Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Keabsahan Data & Rujukan Hukum</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Terintegrasi langsung dengan katalog hukum Jaringan Dokumentasi dan Informasi Hukum (JDIH) serta basis data statistik Badan Pusat Statistik (BPS) untuk memastikan narasi tidak mengandung disinformasi.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Menjaga Martabat Pemimpin Publik</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menjaga agar pemikiran pejabat negara tidak direduksi menjadi konten pendek yang memicu polarisasi destruktif, melainkan wacana bernas yang mendidik dan menginspirasi masyarakat.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* METRICS BANNER */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">Efisiensi Ekosistem</span>
              <h2 className="text-3xl font-black tracking-tight">Kinerja Nyata di Seluruh Wilayah</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-4xl font-black text-blue-400">3.000+</div>
                <div className="text-xs text-slate-400 font-semibold">Kata Analisis per Artikel</div>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-4xl font-black text-emerald-400">&lt; 3 Mnt</div>
                <div className="text-xs text-slate-400 font-semibold">Konversi Catatan Sidang</div>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-4xl font-black text-blue-400">100%</div>
                <div className="text-xs text-slate-400 font-semibold">Server di Wilayah Hukum RI</div>
              </div>

              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-4xl font-black text-amber-400">27+</div>
                <div className="text-xs text-slate-400 font-semibold">Kategori Regulasi Nasional</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ KELEMBAGAAN */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Pertanyaan Umum</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">FAQ Kelembagaan</h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Apakah POLARIS aplikasi pengaduan warga atau media sosial umum?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bukan. POLARIS bukan sarana keluhan konstituen atau media sosial instan. POLARIS adalah sistem operasi pembuatan dan diseminasi konten pemikiran (artikel 3.000 kata, infografis data APBD, dan poster advokasi) yang menempatkan pejabat publik sebagai rujukan wacana terpercaya.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Bagaimana status hak cipta atas artikel dan infografis yang dibuat?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Seluruh naskah, grafik, dan materi visual yang dihasilkan sepenuhnya merupakan hak milik intelektual Pejabat Publik dan Institusi terkait. Pengguna bebas mempublikasikan ulang ke koran, jurnal, atau media massa tanpa royalti tambahan.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Bagaimana staf ahli atau tim komunikasi berkolaborasi di dalam sistem?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Setiap kantor dewan atau dinas mendapatkan akun berjenjang (*role-based access control*). Staf ahli dapat membuat draf awal, sementara tombol persetujuan publikasi akhir berada di tangan pejabat pemilik akun.
                </p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <a
                href={`${DASHBOARD_URL}/register`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
              >
                <span>Daftar Akun Workspace Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
