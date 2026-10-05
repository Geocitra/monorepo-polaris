'use client';

import { Check, Sparkles, Shield, ArrowRight, Clock, Calendar, Crown, FileCheck2, Lock } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const plans = [
    {
      id: '1bulan',
      badge: 'Siklus Bulanan',
      name: 'Paket 1 Bulan',
      subtitle: 'Fleksibel tanpa komitmen panjang, cocok untuk evaluasi dan tugas masa sidang pendek.',
      price: 'Rp 2.000.000',
      period: '/ bulan',
      billedNote: 'Masa aktif 30 hari kalender (Rp 2 Juta / bln)',
      popular: false,
      icon: Clock,
      features: [
        '1 Akun Pejabat Publik / Anggota Dewan',
        '2 Akun Tenaga Ahli / Staf Komunikasi Fraksi',
        'Generator Artikel Parlemen 3.000 kata tak terbatas',
        'Visualisasi Infografis APBD & Data BPS Lengkap',
        'Desain Poster Program Siap Cetak (300 DPI) & Medsos',
        'Website Publik Resmi Subdomain (.polaris.id)',
        'Penyimpanan Naskah Terenkripsi 50 GB',
      ],
      ctaText: 'Daftar Paket 1 Bulan',
      ctaHref: `${DASHBOARD_URL}/register?plan=1bulan`,
    },
    {
      id: '6bulan',
      badge: 'Paling Banyak Dipilih',
      name: 'Paket 6 Bulan',
      subtitle: 'Dirancang pas untuk 1 siklus Masa Persidangan parlemen dan kegiatan Reses dapil.',
      price: 'Rp 10.000.000',
      period: '/ 6 bulan',
      billedNote: 'Potongan 1 Bulan (Hemat Rp 2 Jt dari Normal Rp 12 Jt)',
      popular: true,
      icon: Calendar,
      features: [
        '1 Akun Utama Pimpinan / Anggota Dewan',
        '5 Akun Tenaga Ahli (TA) & Staf Komunikasi',
        'Masa Aktif 180 Hari Penuh (1 Masa Sidang & Reses)',
        'Generator Artikel & Opini Kebijakan Prioritas',
        'Prioritas Antrian Pemrosesan Mesin AI & JDIH',
        'Dukungan Kustomisasi Domain Pribadi (.id / .go.id)',
        'Modul Naskah Penjelasan Perda Inisiatif & DIM RUU',
        'Penyimpanan Terenkripsi 250 GB + Onboarding Teknis',
      ],
      ctaText: 'Daftar Paket 6 Bulan',
      ctaHref: `${DASHBOARD_URL}/register?plan=6bulan`,
    },
    {
      id: '1tahun',
      badge: 'Nilai Terbaik',
      name: 'Paket 1 Tahun',
      subtitle: 'Proteksi dan diseminasi gagasan kepemimpinan penuh selama 1 Tahun Anggaran APBN/APBD.',
      price: 'Rp 20.000.000',
      period: '/ tahun',
      billedNote: 'Potongan 2 Bulan (Hemat Rp 4 Jt dari Normal Rp 24 Jt)',
      popular: false,
      icon: Crown,
      features: [
        '1 Akun Anggota Dewan / Pejabat Utama',
        '10 Akun Staf Ahli Komisi & Asisten Pribadi',
        'Masa Aktif 365 Hari Penuh (1 Tahun Anggaran)',
        'Telaah Naskah Akademik & DIM RUU Komparatif',
        'Bedah Nota Keuangan & Asumsi Makro Fiskal',
        'Fasilitasi Dokumen Resmi Pengadaan (SPK & Faktur Pajak PPN/PPh)',
        'Dedicated Cloud Storage 1 TB Terproteksi UU PDP',
        'Jaminan Ketersediaan Sistem SLA 99.9% & Tim Ahli 24/7',
      ],
      ctaText: 'Daftar Paket 1 Tahun',
      ctaHref: `${DASHBOARD_URL}/register?plan=1tahun`,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Paket Lisensi Resmi Workspace</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Investasi Transparan untuk Kedaulatan Komunikasi Kebijakan
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Pilihan paket durasi 1 Bulan, 6 Bulan, dan 1 Tahun. Tanpa biaya tersembunyi, langsung aktif setelah registrasi akun.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-white border-2 border-blue-600 shadow-2xl shadow-blue-500/10 scale-102 lg:-translate-y-2'
                    : 'bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {/* POPULAR BADGE */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* CARD TOP */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      {!plan.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[34px]">{plan.subtitle}</p>
                  </div>

                  {/* PRICE */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{plan.period}</span>
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold">{plan.billedNote}</div>
                  </div>

                  {/* FEATURES */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Fitur Termasuk:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA BUTTON */}
                <div className="pt-8">
                  <a
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 text-center ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 active:scale-95'
                        : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
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
              <strong>Pengadaan Resmi:</strong> Mendukung mekanisme Surat Perintah Kerja (SPK), e-Katalog, serta administrasi perpajakan (Faktur Pajak PPN & PPh resmi instansi pemerintah).
            </span>
          </div>

          <a
            href={`${DASHBOARD_URL}/register`}
            className="text-blue-600 font-extrabold hover:underline shrink-0"
          >
            Konsultasikan Mekanisme Pembayaran →
          </a>
        </div>

      </div>
    </section>
  );
}
