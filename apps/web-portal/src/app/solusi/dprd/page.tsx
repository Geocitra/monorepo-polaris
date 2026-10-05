'use client';

import Link from 'next/link';
import { 
  Landmark, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  BarChart3,
  Users,
  Vote,
  Sparkles
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function SolusiDPRDPage() {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-indigo-50/60 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Solusi Institusi</span>
              <span>/</span>
              <span className="text-indigo-600 font-bold">DPRD Provinsi & Kab/Kota</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <Landmark className="h-3.5 w-3.5" />
              <span>Tingkat Daerah Tingkat I & II</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Perkuat Advokasi Perda Inisiatif, Pengawasan APBD, dan Akuntabilitas Wakil Rakyat Daerah.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Bantu pimpinan dan anggota DPRD menyusun pandangan umum fraksi, telaah kritis LKPJ kepala daerah, serta materi visual transparansi penyerapan anggaran yang mudah dipahami warga pemilih di daerah pemilihan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
              >
                <span>Lihat Paket Harga DPRD</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`${DASHBOARD_URL}/register?plan=provinsi`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Daftar Akun Workspace</span>
              </a>
            </div>

          </div>
        </section>

        {/* 3 CORE PILLARS FOR DPRD */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Fokus Kinerja Dewan Daerah</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Menghubungkan Regulasi Daerah dengan Realitas Lapangan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Perda Inisiatif Dewan</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menyusun latar belakang filosofis, yuridis, dan sosiologis naskah raperda inisiatif dengan rujukan perda sejenis dari daerah percontohan nasional.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Telaah Kritis LKPJ & APBD</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menyandingkan target RPJMD kepala daerah dengan capaian riil per dinas untuk merumuskan catatan rekomendasi Badan Anggaran yang tajam.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Vote className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Laporan Akuntabilitas Reses</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mengubah tumpukan proposal pokir warga menjadi laporan infografis yang membuktikan anggota dewan memperjuangkan suara konstituennya.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* BOTTOM CTA FOR DPRD */}
        <section className="py-16 bg-slate-50 border-t border-slate-200/80 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-5">
            <h3 className="text-2xl font-black text-slate-900">
              Tingkatkan Wibawa dan Citra Representasi di Tingkat Daerah
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              POLARIS telah disesuaikan dengan nomenklatur Permendagri tentang pengelolaan keuangan daerah dan tata tertib dewan perwakilan rakyat daerah.
            </p>
            <div className="pt-2">
              <a
                href={`${DASHBOARD_URL}/register?plan=provinsi`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
              >
                <span>Daftarkan Akun DPRD Sekarang</span>
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
