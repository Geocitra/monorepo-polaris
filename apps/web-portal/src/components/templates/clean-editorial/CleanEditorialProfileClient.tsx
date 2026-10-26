'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Award,
  Users,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface CleanEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CleanEditorialProfileClient({
  member,
  theme,
  subdomain,
}: CleanEditorialProfileClientProps) {
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

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) return { cleanName: 'Ahmad Fauzi' };
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    return { cleanName: clean || 'Ahmad Fauzi' };
  }

  const { cleanName } = parseCleanIdentity(member?.fullName);

  const educationHistory = [
    {
      degree: 'Doktor Ilmu Pemerintahan & Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI), Jakarta',
      year: '2016 – 2020',
      description:
        'Disertasi mengkaji reformasi tata kelola anggaran publik daerah dan optimalisasi pengawasan partisipatif masyarakat terhadap implementasi APBD.',
      tag: 'Doktor Kebijakan Publik',
    },
    {
      degree: 'Magister Kebijakan Publik (M.Si / S2)',
      institution: 'Universitas Gadjah Mada (UGM), Yogyakarta',
      year: '2010 – 2013',
      description:
        'Fokus riset formulasi kebijakan jaminan sosial, perlindungan buruh migran, dan ketahanan fasilitas kesehatan daerah 3T.',
      tag: 'Magister Sains',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Ilmu Politik (S.IP / S1)',
      institution: 'Universitas Padjadjaran (UNPAD), Bandung',
      year: '2004 – 2008',
      description:
        'Lulus dengan predikat Cum Laude. Aktif dalam organisasi kemahasiswaan Senat Mahasiswa dan advokasi kebijakan publik regional Jawa Barat.',
      tag: 'Sarjana Ilmu Politik',
    },
  ];

  const careerHistory = [
    {
      role: 'Anggota DPR RI – Komisi IX',
      organization: 'Dewan Perwakilan Rakyat Republik Indonesia',
      period: '2024 – Sekarang',
      description:
        'Mengemban amanah mengawasi kebijakan sektor kesehatan, ketenagakerjaan, kependudukan, serta BPJS Ketenagakerjaan dan Kesehatan.',
      tag: 'Parlemen Nasional',
    },
    {
      role: 'Wakil Ketua Komisi Kebijakan Publik',
      organization: 'Dewan Perwakilan Rakyat Daerah (DPRD) Provinsi',
      period: '2019 – 2024',
      description:
        'Menginisiasi pembentukan Peraturan Daerah tentang pemberdayaan UMKM lokal dan jaminan keterbukaan informasi publik pembangunan daerah.',
      tag: 'Parlemen Daerah',
    },
    {
      role: 'Penasihat Kebijakan Strategis & Tenaga Ahli Parlemen',
      organization: 'Pusat Kajian Kebijakan Legislasi Nasional',
      period: '2014 – 2019',
      description:
        'Menyusun naskah akademik dan daftar inventarisasi masalah (DIM) untuk 12 RUU strategis di bidang ketenagakerjaan dan jaminan sosial.',
      tag: 'Konsultan Ahli',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* ─── 1. CLEAN EDITORIAL HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#F8F9FD] border border-slate-200/80 p-6 sm:p-10 lg:p-14 overflow-hidden relative shadow-xs">
          
          {/* Upper Right Dotted Grid Texture */}
          <div
            aria-hidden="true"
            className="absolute top-6 right-6 w-44 h-44 opacity-40 pointer-events-none select-none"
            style={{
              backgroundImage: 'radial-gradient(#94A3B8 2px, transparent 2px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left: Bio, Quote, Signature & Diagnostics */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="px-3 py-1 rounded-full font-bold bg-purple-100/80 text-[#6366F1] border border-purple-200 uppercase">
                    DPR RI • {party}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-white text-slate-700 border border-slate-200 uppercase">
                    DAPIL: {dapil}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-white text-slate-700 border border-slate-200 uppercase">
                    {commission}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial-serif font-black text-slate-900 tracking-tight leading-tight">
                  {officialFullName}
                </h1>

                <p className="text-base sm:text-lg text-[#6366F1] font-editorial-serif italic font-medium leading-snug">
                  &quot;{theme?.headlineTagline || 'Mendedikasikan kerja parlemen yang berdampak nyata bagi kemakmuran dan martabat rakyat.'}&quot;
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-normal">
                <p>
                  {theme?.bioBiography ||
                    `${officialFullName} mendedikasikan pengabdian keparlemenan dengan memadukan risalah kebijakan berbasis bukti ilmiah, pengawasan anggaran yang ketat, dan advokasi langsung di Daerah Pemilihan ${dapil}.`}
                </p>
                <p>
                  Dalam menjalankan tugas kedewanan di {commission}, fokus utama diarahkan pada penguatan sistem ketenagakerjaan inklusif, perluasan perlindungan jaminan sosial bagi pekerja rentan, serta peningkatan mutu faskes primer di pelosok daerah pemilihan.
                </p>
              </div>

              {/* Script Signature */}
              <div className="pt-2">
                <span className="font-script-signature text-3xl sm:text-4xl text-[#6366F1] block select-none">
                  {cleanName}
                </span>
              </div>

              {/* Editorial Diagnostics Bar */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono border-t border-slate-200/80">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MITRA KERJA</span>
                  <span className="text-xs font-bold text-slate-900">Kemenaker &amp; BPJS</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MASA JABATAN</span>
                  <span className="text-xs font-bold text-[#6366F1]">2024 – 2029</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AKUNTABILITAS</span>
                  <span className="text-xs font-bold text-emerald-600">LHKPN VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Right: Signature Soft Lavender Disc with Clean Cutout Portrait (NO BADGE OVERLAY) */}
            <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
              <div className="relative w-64 sm:w-72 lg:w-80 aspect-square flex items-center justify-center">
                {/* Soft Lavender Circular Disc */}
                <div className="absolute inset-2 sm:inset-3 rounded-full bg-[#EDE9FE] shadow-inner" />
                
                {/* Clean Photo standing in circle without badge overlay */}
                <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden rounded-b-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-full object-cover object-top filter contrast-[1.03] drop-shadow-xl select-none"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. 4 EDITORIAL PERFORMANCE METRICS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-mono uppercase text-[#6366F1] tracking-widest font-bold">
            INDIKATOR KINERJA LEGISLATIF
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900">
            Bukti Nyata Komitmen &amp; Keterbukaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Catatan akuntabilitas pengabdian wakil rakyat yang dapat diaudit secara transparan oleh seluruh masyarakat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-editorial-serif">98.4%</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Tingkat Kehadiran Sidang</div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Konsistensi menghadiri rapat komisi, dengar pendapat umum, dan sidang paripurna legislasi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-editorial-serif">42 Naskah</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">RUU &amp; Telaah Kritis</div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Penyusunan daftar inventarisasi masalah regulasi yang mengedepankan hak perlindungan rakyat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-editorial-serif">1,420+</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Aspirasi Terdampingi</div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Pengaduan warga dapil terkait ketenagakerjaan, kesehatan, dan beasiswa yang telah difollow-up.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-editorial-serif">100%</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Transparansi Dana Reses</div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              Laporan pertanggungjawaban kegiatan kunjungan daerah pemilihan terpublikasi secara terbuka.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. POLICY PROGRESS GAUGES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FD] border border-slate-200/80 space-y-8">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase text-[#6366F1] tracking-widest block font-bold">
                PILAR KOMPETENSI PARLEMEN
              </span>
              <h3 className="text-xl sm:text-2xl font-editorial-serif font-black text-slate-900 mt-1">
                Fokus Pengawasan &amp; Regulasi Utama
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Periode Masa Sidang 2024–2029</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Pendidikan &amp; Kesejahteraan Guru</span>
                <span className="text-[#6366F1] font-mono">95%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#6366F1]" style={{ width: '95%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Pengawasan APBN &amp; Anggaran Pro-Rakyat</span>
                <span className="text-[#6366F1] font-mono">90%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-slate-900" style={{ width: '90%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Pengembangan Ekonomi Kreatif &amp; UMKM</span>
                <span className="text-[#6366F1] font-mono">88%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#818CF8]" style={{ width: '88%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Advokasi Fasilitas Publik &amp; Lapangan Kerja</span>
                <span className="text-[#6366F1] font-mono">92%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. REKAM JEJAK HISTORIS (TAB PILIH PENDIDIKAN / KARIER) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-mono uppercase text-[#6366F1] tracking-widest block font-bold">
              REKAM JEJAK HISTORIS
            </span>
            <h3 className="text-xl sm:text-2xl font-editorial-serif font-black text-slate-900 mt-1">
              Latar Belakang Pendidikan &amp; Pengabdian Publik
            </h3>
          </div>

          {/* Clean Editorial Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('pendidikan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'pendidikan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
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
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
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
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-300 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6366F1] font-mono">
                        {item.institution}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-editorial-serif font-bold text-slate-900">{item.degree}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold shrink-0 self-start border border-slate-200">
                    {item.year}
                  </div>
                </div>
              ))
            : careerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-300 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6366F1] font-mono">
                        {item.organization}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-editorial-serif font-bold text-slate-900">{item.role}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold shrink-0 self-start border border-slate-200">
                    {item.period}
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ─── 5. STRIP MITRA KERJA & LEMBAGA PARLEMEN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6 text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">
          <span className="text-slate-800">LEMBAGA &amp; MITRA RESMI:</span>
          <span>🏛️ DPR RI SENAYAN</span>
          <span>📋 KOMISI {member?.commissionName || 'PARLEMEN'}</span>
          <span>🇮🇩 DAPIL {dapil}</span>
          <span>⚖️ BADAN LEGISLASI NASIONAL</span>
        </div>
      </section>
    </div>
  );
}
