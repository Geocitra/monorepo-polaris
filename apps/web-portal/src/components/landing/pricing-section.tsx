'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Shield, ArrowRight, Clock, Calendar, Crown, Video } from 'lucide-react';
import { ConsultationLeadModal } from './ConsultationLeadModal';

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('PRO');
  const [selectedCycle, setSelectedCycle] = useState('SEMIANNUAL');

  const plans = [
    {
      id: 'starter',
      tier: 'STARTER',
      cycle: 'MONTHLY',
      badge: 'Standar Parlemen Efisien',
      name: 'Paket Standar Parlemen (Starter)',
      subtitle: 'Dirancang untuk evaluasi operasional awal fraksi dan akselerasi komunikasi masa sidang.',
      priceTitle: 'Tarif Terstandar',
      period: 'per Siklus Parlemen',
      billedNote: 'Besaran tarif disesuaikan dengan yurisdiksi: DPR RI, DPD RI, atau DPRD Provinsi & Kab/Kota',
      popular: false,
      icon: Clock,
      features: [
        '1 Akun Pejabat Publik / Anggota Dewan',
        '2 Akun Tenaga Ahli / Staf Komunikasi Fraksi',
        'Generator Artikel Parlemen & Opini Kebijakan AI',
        'Visualisasi Infografis APBD & Data BPS Lengkap',
        'Desain Poster Program Siap Cetak (300 DPI) & Medsos',
        'Website Publik Resmi Tata Letak Standar (.polaris.id)',
        'Penyimpanan Naskah Terenkripsi 50 GB',
        'Pembayaran Mandiri Cepat via VA Bank & QRIS',
      ],
      ctaText: 'Ajukan Lisensi Starter & Demo',
    },
    {
      id: 'pro',
      tier: 'PRO',
      cycle: 'ANNUAL',
      badge: 'Rekomendasi Utama Fraksi',
      name: 'Paket Eksekutif Parlemen (Pro Suite)',
      subtitle: 'Solusi paripurna kepemimpinan dewan: layout tematik, custom domain, serta fasilitas resmi SPK & Faktur Pajak.',
      priceTitle: 'Tarif Terstandar',
      period: 'per Siklus Parlemen',
      billedNote: 'Mendukung layout tematik (Editorial, Baliho Hero, Newsroom), custom domain, dan SPK Setwan',
      popular: true,
      icon: Crown,
      features: [
        '1 Akun Utama Pimpinan / Anggota Dewan',
        '5 Akun Tenaga Ahli (TA) & Staf Komunikasi',
        'Masa Aktif Fleksibel (Pilihan 1 Bulan, 6 Bulan, atau 1 Tahun)',
        'Bebas Pilih Seluruh Layout Tematik (Editorial, Baliho, Newsroom)',
        'Dukungan Custom Domain Pribadi (namadewan.id / .com)',
        'Fasilitasi Dokumen Resmi Pengadaan (SPK Setwan)',
        'Faktur Pajak Resmi Negara (PPN 11% & PPh Instansi)',
        'Prioritas Antrean AI & Pendampingan Eksekutif 24/7',
      ],
      ctaText: 'Ajukan Lisensi PRO & Demo GMeet',
    },
  ];

  const handleOpenLeadModal = (tier: string, cycle: string) => {
    setSelectedTier(tier);
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Paket Lisensi Resmi Workspace Parlemen</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Investasi Akuntabel untuk Kedaulatan Komunikasi Kebijakan
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Sistem lisensi B2B/B2G POLARIS diatur transparan sesuai tingkatan yurisdiksi (DPR RI, DPD RI, DPRD Provinsi, dan DPRD Kabupaten/Kota). Hubungi kami untuk demonstrasi langsung dan penawaran resmi.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10 scale-102 lg:-translate-y-2'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* POPULAR BADGE */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* TITLE & ICON */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {plan.badge}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        {plan.name}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${plan.popular ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.subtitle}
                  </p>

                  {/* PRICE CONTAINER (CONSULTATIVE / JURISDICTION-ISOLATED) */}
                  <div className="py-4 border-y border-slate-100 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {plan.priceTitle}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-600 font-semibold leading-relaxed">
                      {plan.billedNote}
                    </p>
                  </div>

                  {/* FEATURES */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Spesifikasi & Hak Akses:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA BUTTON */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => handleOpenLeadModal(plan.tier, plan.cycle)}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center cursor-pointer ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 active:scale-95'
                        : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* INSTITUTIONAL PAYMENT & CONTRACT NOTE */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 shrink-0" />
            <span>
              <strong>Kepatuhan Pengadaan Pemerintah:</strong> Mendukung mekanisme Surat Perintah Kerja (SPK), e-Katalog, serta kelengkapan perpajakan (Faktur Pajak PPN & PPh resmi instansi sekwan/pemda).
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenLeadModal('PRO', 'ANNUAL')}
            className="text-blue-600 font-extrabold hover:underline shrink-0 cursor-pointer"
          >
            Konsultasikan Mekanisme Pengadaan →
          </button>
        </div>

      </div>

      {/* LEAD CONSULTATION MODAL */}
      <ConsultationLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTier={selectedTier}
        defaultCycle={selectedCycle}
      />
    </section>
  );
}
