'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Award,
  Users,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface NeonGlowProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NeonGlowProfileClient({
  member,
  theme,
  subdomain,
}: NeonGlowProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName ||
    member?.customDapilName ||
    member?.customDapil ||
    'Jawa Barat I';
  const commission = member?.commissionName || 'Komisi IX DPR RI';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';

  const [activeTab, setActiveTab] = useState<'pendidikan' | 'karier'>('pendidikan');

  const educationHistory = [
    {
      degree: 'Doktor Ilmu Pemerintahan & Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI), Jakarta',
      year: '2016 – 2020',
      description:
        'Disertasi mengkaji reformasi tata kelola anggaran publik daerah dan optimalisasi pengawasan partisipatif masyarakat terhadap implementasi APBD.',
      tag: 'DOC_S3_CUM_LAUDE',
    },
    {
      degree: 'Magister Kebijakan Publik (M.Si / S2)',
      institution: 'Universitas Gadjah Mada (UGM), Yogyakarta',
      year: '2010 – 2013',
      description:
        'Fokus telaah regulasi ketenagakerjaan, perlindungan jaminan sosial ketenagakerjaan bagi sektor informal, dan penguatan ekonomi kerakyatan.',
      tag: 'MGR_S2_PUBLIC_POLICY',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Ilmu Politik (S.IP / S1)',
      institution: 'Universitas Padjadjaran (UNPAD), Bandung',
      year: '2004 – 2008',
      description:
        'Lulus dengan predikat Cum Laude. Aktif dalam organisasi kemahasiswaan Senat Mahasiswa dan Forum Diskusi Kebijakan Publik Regional Jawa Barat.',
      tag: 'BAC_S1_POLITICAL_SCI',
    },
  ];

  const careerHistory = [
    {
      role: 'Anggota DPR RI – Komisi IX',
      organization: 'Dewan Perwakilan Rakyat Republik Indonesia',
      period: '2024 – Sekarang',
      description:
        'Mengemban amanah mengawasi kebijakan sektor kesehatan, ketenagakerjaan, kependudukan, serta BPJS Ketenagakerjaan dan Kesehatan.',
      tag: 'SYS_ROLE_NATIONAL_REP',
    },
    {
      role: 'Wakil Ketua Komisi Kebijakan Publik',
      organization: 'Dewan Perwakilan Rakyat Daerah (DPRD) Provinsi',
      period: '2019 – 2024',
      description:
        'Menginisiasi pembentukan Peraturan Daerah tentang pemberdayaan UMKM lokal dan jaminan keterbukaan informasi publik pembangunan daerah.',
      tag: 'SYS_ROLE_PROVINCIAL_REP',
    },
    {
      role: 'Penasihat Kebijakan Strategis & Tenaga Ahli Parlemen',
      organization: 'Pusat Kajian Kebijakan Legislasi Nasional',
      period: '2014 – 2019',
      description:
        'Menyusun naskah akademik dan daftar inventarisasi masalah (DIM) untuk 12 RUU strategis di bidang ketenagakerjaan dan jaminan sosial.',
      tag: 'SYS_ROLE_SENIOR_ADVISOR',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* ─── 1. CYBER HERO PROFILE ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Signature Neon Halo & Dewan Photo (Clean with no overlay badge) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 lg:w-80 aspect-square flex items-center justify-center">
                <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 opacity-80 blur-[2px] shadow-2xl shadow-purple-600/50" />
                <div className="absolute inset-4 sm:inset-5 rounded-full bg-[#070913]/90 backdrop-blur-sm" />

                <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden rounded-b-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-full object-cover object-top filter contrast-[1.05] drop-shadow-2xl select-none"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Cyber Details & Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="px-3 py-1 rounded-full font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    DPR RI • {party}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                    DAPIL: {dapil}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30">
                    {commission}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {officialFullName}
                </h1>
                <p className="text-sm sm:text-base text-cyan-300 font-semibold italic">
                  &quot;{theme?.headlineTagline || 'Membangun ekosistem legislasi modern yang adaptif terhadap masa depan digital.'}&quot;
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>
                  {theme?.bioBiography ||
                    `${officialFullName} memadukan sains kebijakan, keterbukaan data, dan aksi advokasi nyata untuk Daerah Pemilihan ${dapil}. Berbekal latar belakang akademik ilmu kebijakan publik dan komitmen kenegaraan, beliau aktif mendorong reformasi tata kelola parlemen yang berbasis sains dan akuntabel.`}
                </p>
                <p className="text-slate-400">
                  Dalam menjalankan tugas keparlemenan di {commission}, fokus utama diarahkan pada penguatan jaminan sosial nasional, perlindungan tenaga kerja era transformasi digital, dan peningkatan mutu layanan kesehatan terpadu.
                </p>
              </div>

              {/* Cyber Diagnostics Cards */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">KEMITRAAN</span>
                  <span className="text-xs font-bold text-cyan-300">Kemenaker &amp; Kemenkes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">MASA JABATAN</span>
                  <span className="text-xs font-bold text-purple-300">2024 – 2029</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-900/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">INTEGRITAS</span>
                  <span className="text-xs font-bold text-emerald-400">LHKPN VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. 4 NEON GLASS STATS CARDS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-mono uppercase text-purple-400 tracking-widest font-bold">
            TELEMETRI KINERJA KENEGARAAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Indikator &amp; Capaian Nyata
          </h2>
          <p className="text-xs text-slate-400">
            Data akuntabilitas tugas legislasi dan advokasi warga yang terekam pada sistem POLARIS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-lg space-y-2 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">10+</div>
            <div className="text-xs font-bold text-slate-300">Tahun Pengabdian</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dedikasi berkelanjutan memperjuangkan hak dan perlindungan warga daerah pemilihan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-lg space-y-2 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">50+</div>
            <div className="text-xs font-bold text-slate-300">Rilis Telaah Kebijakan</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Catatan kritis terhadap kebijakan publik dan evaluasi efektivitas anggaran kementerian.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-lg space-y-2 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">1,200+</div>
            <div className="text-xs font-bold text-slate-300">Konstituen Terdampingi</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Penerima manfaat program advokasi, beasiswa, bantuan sarana dan fasilitas umum.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-lg space-y-2 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">100%</div>
            <div className="text-xs font-bold text-slate-300">Indeks Akuntabilitas</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Seluruh aktivitas dan naskah kerja tercatat secara digital pada sistem POLARIS.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. PROGRESS GAUGES BIDANG KEBIJAKAN UTAMA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#090C1A] border border-purple-900/40 space-y-8">
          <div className="border-b border-purple-900/40 pb-4">
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              BIDANG ADVOKASI &amp; KOMPETENSI
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Fokus Pengawasan &amp; Regulasi Utama Parlemen
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Pendidikan &amp; Kesejahteraan Guru</span>
                <span className="text-purple-400 font-mono">95%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden border border-purple-900/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500"
                  style={{ width: '95%' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Pengawasan APBN &amp; Anggaran Pro-Rakyat</span>
                <span className="text-cyan-400 font-mono">90%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden border border-purple-900/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: '90%' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Pengembangan Ekonomi Kreatif &amp; Pemuda</span>
                <span className="text-indigo-400 font-mono">88%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden border border-purple-900/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: '88%' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>Advokasi Fasilitas Publik &amp; Lapangan Kerja</span>
                <span className="text-emerald-400 font-mono">92%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden border border-purple-900/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: '92%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. REKAM JEJAK HISTORIS DENGAN TAB CYBER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              REKAM JEJAK HISTORIS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Latar Belakang Pendidikan &amp; Karier Publik
            </h3>
          </div>

          {/* Cyber Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-purple-900/40 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('pendidikan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'pendidikan'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pendidikan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('karier')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'karier'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Karier Parlemen</span>
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-4">
          {activeTab === 'pendidikan'
            ? educationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {item.institution}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.degree}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-950/80 text-cyan-400 text-xs font-mono font-bold shrink-0 self-start border border-cyan-500/30">
                    {item.year}
                  </div>
                </div>
              ))
            : careerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {item.organization}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.role}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-950/80 text-cyan-400 text-xs font-mono font-bold shrink-0 self-start border border-cyan-500/30">
                    {item.period}
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ─── 5. STRIP MITRA KERJA & LEMBAGA PARLEMEN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs font-mono font-bold uppercase tracking-widest">
          <span className="text-purple-400">MITRA STRATEGIS:</span>
          <span>DPR RI SENAYAN</span>
          <span>KOMISI {member?.commissionName || 'PARLEMEN'}</span>
          <span>DAPIL {dapil}</span>
          <span>BADAN LEGISLASI NASIONAL</span>
        </div>
      </section>
    </div>
  );
}
