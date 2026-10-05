'use client';

import Link from 'next/link';
import { 
  Building2, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  BarChart3,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function SolusiDPRPage() {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-blue-50/60 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Solusi Institusi</span>
              <span>/</span>
              <span className="text-blue-600 font-bold">Anggota DPR RI & DPD RI</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5" />
              <span>Tingkat Nasional & Senayan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Solusi Intelijen Legislasi & Diseminasi Pemikiran Parlemen Nasional.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Membantu Anggota DPR RI dan DPD RI merumuskan pandangan komisi, telaah kritis atas RUU inisiatif pemerintah, serta pengawasan alokasi APBN dengan standar naskah ilmiah yang siap diuji di ruang sidang dan panggung media nasional.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
              >
                <span>Lihat Paket Harga DPR / DPD RI</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`${DASHBOARD_URL}/register?plan=nasional`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Daftar Akun Workspace</span>
              </a>
            </div>

          </div>
        </section>

        {/* WORKFLOW MATURITY FOR SENAYAN */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Fokus Fungsi Konstitusional</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Menjawab Tantangan Kerja Parlemen Modern
              </h2>
              <p className="text-sm text-slate-500">
                Dari rapat dengar pendapat umum (RDPU) hingga penyusunan laporan akuntabilitas dapil masa reses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Fungsi Legislasi (RUU)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menelaah Naskah Akademik dan Daftar Inventarisasi Masalah (DIM) RUU secara komparatif dengan undang-undang eksisting dan konvensi internasional.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Fungsi Anggaran (APBN)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Membedah Nota Keuangan, postur Transfer ke Daerah (TKD), serta alokasi Dana Bagi Hasil (DBH) agar tepat sasaran bagi masyarakat daerah pemilihan.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Fungsi Pengawasan & Reses</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mengolah ratusan catatan kunjungan kerja dan aspirasi masyarakat menjadi laporan komisi resmi serta siaran pers yang berbobot.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* PROTOKOL KERAHASIAAN DAN STAF AHLI */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Kolaborasi Dewan & Tenaga Ahli (TA)</h3>
                  <p className="text-xs text-slate-500">Alur persetujuan berjenjang dengan keamanan dokumen tingkat tinggi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <strong className="text-slate-900 block font-extrabold">1. Ruang Draf Terproteksi</strong>
                  <p className="text-xs">
                    Tenaga Ahli menyusun draf awal di workspace, menambahkan data statistik, dan menyematkan kutipan pasal regulasi tanpa publikasi langsung.
                  </p>
                </div>
                <div className="space-y-2">
                  <strong className="text-slate-900 block font-extrabold">2. Tanda Tangan & Persetujuan Anggota</strong>
                  <p className="text-xs">
                    Anggota Dewan melakukan peninjauan akhir (*review*), penyesuaian tone politik fraksi, dan memberikan otorisasi rilis ke portal publik.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Kerahasiaan naskah dewan dijamin sesuai UU Perlindungan Data Pribadi (UU PDP).
                </span>
                <a
                  href={`${DASHBOARD_URL}/register?plan=nasional`}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <span>Daftarkan Akun Kantor Dewan</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

            </div>

          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
