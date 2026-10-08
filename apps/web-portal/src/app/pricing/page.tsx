'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  FileCheck2, 
  Lock, 
  Video,
  ArrowRight,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PricingSection } from '@/components/landing/pricing-section';
import { ConsultationLeadModal } from '@/components/landing/ConsultationLeadModal';

export default function PricingPage() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-8 bg-gradient-to-b from-blue-50/60 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-blue-600 font-bold">Daftar Paket & Kemitraan Lisensi</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transparansi Lisensi Workspace Parlemen</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
              Paket Lisensi Resmi & Kemitraan Parlemen POLARIS
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Struktur lisensi B2B/B2G yang terstandardisasi dan akuntabel sesuai tingkat yurisdiksi: DPR RI, DPD RI, DPRD Provinsi, serta DPRD Kabupaten/Kota.
            </p>

            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsLeadModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all text-center cursor-pointer"
              >
                <Video className="w-5 h-5" />
                <span>Ajukan Permohonan Lisensi & Sesi Demo GMeet</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </section>

        {/* PRICING SECTION COMPONENT (3 TIERS WITH JURISDICTION ISOLATION & LEAD MODAL) */}
        <PricingSection />

        {/* PROCUREMENT & INVOICING COMPLIANCE BANNER */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">Tata Kelola Pengadaan & Administrasi Keuangan Negara</h3>
                <p className="text-xs text-slate-400">Dirancang memenuhi standar akuntansi, perbendaharaan, dan regulasi perlindungan data pribadi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="space-y-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold">
                  <FileCheck2 className="h-4 w-4 text-blue-400" />
                  <span>Dukungan SPK & Kontrak Sekwan</span>
                </div>
                <p>Dapat difasilitasi melalui mekanisme Surat Perintah Kerja (SPK) Sekretariat Dewan atau anggaran belanja non-APBD fraksi.</p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Faktur Pajak PPN & PPh Resmi</span>
                </div>
                <p>Penerbitan faktur pajak resmi badan usaha berbadan hukum PT untuk kemudahan pertanggungjawaban SPJ.</p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Onboarding & Sesi Pengenalan GMeet</span>
                </div>
                <p>Tim implementasi POLARIS akan memandu langsung tenaga ahli dan staf komunikasi fraksi untuk integrasi akun 100% tuntas.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Perlu diskusi teknis dengan pimpinan fraksi atau telaah kerangka acuan kerja (KAK)?
              </span>
              <button
                type="button"
                onClick={() => setIsLeadModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Jadwalkan Diskusi Teknis Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* LEAD CONSULTATION MODAL */}
      <ConsultationLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultTier="PRO"
        defaultCycle="SEMIANNUAL"
      />
    </div>
  );
}
