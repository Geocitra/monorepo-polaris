'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, FileCheck, Users, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { PolarisLogo } from '@/components/auth/PolarisLogo';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

function EnterpriseRegisterGate() {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#070A12] overflow-hidden">
      {/* SISI KIRI: BRANDING & ATMOSFER INSTITUSIONAL */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden select-none">
        <Image
          src="/images/auth-backdrop.webp"
          alt="POLARIS Legislative Platform"
          fill
          priority
          className="object-cover object-center opacity-40 brightness-90 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="p-5 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/10 shadow-xl space-y-2.5 max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Penerbitan Terverifikasi Institusi
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
              Akses Eksklusif Anggota Parlemen & Pimpinan Daerah
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Setiap akun POLARIS diterbitkan melalui verifikasi mandat KPU dan penetapan yurisdiksi resmi, menjamin kedaulatan data aspirasi dan keamanan publikasi fraksi.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🛡️ Verifikasi Mandat KPU
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                📄 Fasilitasi SPK & SPH
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🏛️ Pendampingan Tenaga Ahli
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI KANAN: GATE INFORMATIF */}
      <div className="flex-1 flex flex-col justify-between h-full p-4 sm:p-6 lg:px-10 lg:py-6 max-w-lg mx-auto w-full overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full shrink-0 pb-2">
          <a
            href={LANDING_PAGE_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kembali ke Landing Page</span>
          </a>

          <Link
            href="/login"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            Masuk ke Akun
          </Link>
        </div>

        {/* Center Card Content */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4 space-y-5">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <PolarisLogo size="sm" />
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 text-amber-600" />
                Alur Akses Terbimbing (B2G Enterprise)
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
                Pendaftaran Akun Terverifikasi
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                Pendaftaran mandiri publik telah dialihkan ke alur konsultasi resmi untuk mencegah kesalahan penetapan tarif yurisdiksi dan memastikan kesiapan integrasi lembaga.
              </p>
            </div>
          </div>

          {/* Three Enterprise Highlights */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Kesesuaian Tarif Yurisdiksi Parlemen
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Tarif resmi disesuaikan secara proporsional berdasarkan tingkat jabatan (DPR RI, DPD RI, DPRD Provinsi, DPRD Kab/Kota, Kepala Daerah, dan OPD Pemda).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileCheck className="h-4 w-4" />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Dukungan Surat Penawaran & Dokumen SPK
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Penyediaan Surat Penawaran Harga (SPH), Surat Perintah Kerja (SPK), dan Faktur Pajak resmi untuk pertanggungjawaban APBD/APBN.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Pendampingan & Sesi Presentasi Langsung
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Tim konsultan POLARIS siap memfasilitasi sesi simulasi online (Google Meet) atau kunjungan tatap muka bersama pimpinan dewan dan staf ahli.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <a
              href={`${LANDING_PAGE_URL}/pricing`}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ajukan Permohonan Lisensi & Sesi Demo</span>
              <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
            </a>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors text-center block cursor-pointer"
            >
              Sudah Memiliki Akun? Masuk ke Workspace
            </Link>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            © 2026 POLARIS. Kepatuhan Keamanan Data Pemerintah & Standar ISO 27001.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white dark:bg-[#070A12]" />}>
      <EnterpriseRegisterGate />
    </Suspense>
  );
}
