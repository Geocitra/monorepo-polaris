'use client';

import React from 'react';
import {
  ShieldCheck,
  Scale,
  Activity,
  Landmark,
  Briefcase,
  GraduationCap,
  Building,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Trophy,
  Globe,
  FileCheck,
  BadgeCheck,
} from 'lucide-react';

interface PlatinumSlateProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function PlatinumSlateProfileClient({
  member,
  theme,
  subdomain,
}: PlatinumSlateProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const legislativeLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const commissionName = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    `${officialFullName} mendedikasikan pengabdian penuh untuk memperjuangkan keadilan sosial, transparansi anggaran APBD, dan penguatan layanan publik bagi masyarakat di ${dapil}.`;

  const stats = [
    { label: 'TAHUN PENGABDIAN', value: '10+', icon: Sparkles },
    { label: 'PERDA & RUU DIKAWAL', value: '42+', icon: Users },
    { label: 'ASPIRASI TERDISTRIBUSI', value: '99.8%', icon: Trophy },
    { label: 'KECAMATAN TERJANGKAU', value: '18', icon: Globe },
  ];

  const capabilities = [
    {
      title: 'LEGISLASI & PERANCANGAN PERDA',
      desc: 'Merumuskan dan menyempurnakan produk hukum daerah yang adil, pro-rakyat, dan berkepastian hukum.',
      icon: Scale,
    },
    {
      title: 'PENGAWASAN ANGGARAN APBD',
      desc: 'Memastikan alokasi pos belanja tepat sasaran tanpa kebocoran demi kesejahteraan masyarakat.',
      icon: Landmark,
    },
    {
      title: 'ADVOKASI & PENYERAPAN ASPIRASI',
      desc: 'Mendengar dan mengawal keluhan warga dari musrenbang tingkat desa hingga penetapan paripurna.',
      icon: HeartHandshake,
    },
    {
      title: 'DIPLOMASI KEBIJAKAN PUBLIK',
      desc: 'Membangun sinergi lintas institusi sipil, kementerian teknis, dan mitra pembangunan strategis.',
      icon: Activity,
    },
    {
      title: 'TATA KELOLA TRANSPARAN',
      desc: 'Mendorong akuntabilitas digital dan keterbukaan risalah persidangan agar mudah diakses publik.',
      icon: FileCheck,
    },
    {
      title: 'PENGUATAN EKONOMI KERAKYATAN',
      desc: 'Inkubasi regulasi perlindungan UMKM, modernisasi pasar rakyat, dan pembukaan akses permodalan.',
      icon: Briefcase,
    },
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#0D1117] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ROW 1: PROFILE SUMMARY WITH CUTOUT & PLATINUM GLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden bg-[#151B23] border border-white/10 shadow-2xl flex items-end justify-center group">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-20 bg-white" />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-auto max-h-[92%] object-contain object-bottom filter contrast-105 select-none relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              <div
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-white text-slate-950 shadow-xl z-20"
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Mandat Konstitusi Resmi
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight">
                {officialFullName}
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                  {legislativeLevel}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {party}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {dapil}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {bio}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#151B23] border border-white/5 flex items-start gap-3">
                <Building className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Penugasan Komisi</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{commissionName}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#151B23] border border-white/5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cakupan Wilayah</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{dapil}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: 4-COLUMN STAT DOCK */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151B23] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className={`space-y-1 ${
                  idx < 3 ? 'md:border-r border-white/10' : ''
                } flex flex-col items-center justify-center p-2`}
              >
                <Icon className="w-5 h-5 text-slate-400 mb-1" />
                <div className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
                  {st.value}
                </div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ROW 3: CORE CAPABILITIES (6-GRID MATCHING REFERENCE) */}
        <div className="space-y-8 text-left">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Fokus Utama Pengabdian
            </span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
              KOMPETENSI &amp; TUGAS POKOK KEPARLEMENAN
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#151B23] border border-white/10 hover:border-white/30 transition-all duration-300 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {cap.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 4: EDUCATION & CERTIFICATIONS (MATCHING REFERENCE BOTTOM-RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-3xl bg-[#151B23] border border-white/10 space-y-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-slate-300" />
              <h4 className="font-bebas text-2xl text-white tracking-wider">
                PENDIDIKAN AKADEMIK
              </h4>
            </div>

            <div className="space-y-4">
              <div className="border-l-2 border-white/20 pl-4 py-1 space-y-1">
                <span className="text-[10px] font-mono text-slate-400">2018 - 2022</span>
                <h5 className="text-sm font-bold text-white">Doktor Ilmu Kebijakan Publik (Dr.)</h5>
                <p className="text-xs text-slate-400">Universitas Indonesia • Disertasi Transparansi APBD & Tata Kelola Daerah</p>
              </div>
              <div className="border-l-2 border-white/20 pl-4 py-1 space-y-1">
                <span className="text-[10px] font-mono text-slate-400">2013 - 2016</span>
                <h5 className="text-sm font-bold text-white">Magister Manajemen Kebijakan Publik (M.M.)</h5>
                <p className="text-xs text-slate-400">Institut Pemerintahan Dalam Negeri (IPDN)</p>
              </div>
              <div className="border-l-2 border-white/20 pl-4 py-1 space-y-1">
                <span className="text-[10px] font-mono text-slate-400">2008 - 2012</span>
                <h5 className="text-sm font-bold text-white">Sarjana Ilmu Pemerintahan (S.IP.)</h5>
                <p className="text-xs text-slate-400">Universitas Gadjah Mada</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#151B23] border border-white/10 space-y-6">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-slate-300" />
              <h4 className="font-bebas text-2xl text-white tracking-wider">
                SERTIFIKASI &amp; KEPEMIMPINAN NASIONAL
              </h4>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Program Pendidikan Reguler Angkatan (PPRA)</h5>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">2023</span>
                </div>
                <p className="text-xs text-slate-400">Lembaga Ketahanan Nasional Republik Indonesia (Lemhannas RI)</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Sertifikasi Legal Drafter Parlemen (BNSP)</h5>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">2021</span>
                </div>
                <p className="text-xs text-slate-400">Badan Nasional Sertifikasi Profesi • Perancangan Peraturan Daerah</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Diklat Kepemimpinan Dewan & Tata Anggaran</h5>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">2019</span>
                </div>
                <p className="text-xs text-slate-400">Badan Pengembangan Sumber Daya Manusia (BPSDM) Kemendagri</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
