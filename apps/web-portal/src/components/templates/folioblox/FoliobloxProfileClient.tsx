'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Landmark,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface FoliobloxProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function FoliobloxProfileClient({
  member,
  theme,
  subdomain,
}: FoliobloxProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    `Sebagai wakil rakyat di ${legislativeLevel} (${party}), ${officialFullName} berkomitmen memperjuangkan keadilan sosial, transparansi anggaran daerah, dan mengawal regulasi pro-rakyat di Daerah Pemilihan ${dapil}.`;

  const [activeTab, setActiveTab] = useState<'semua' | 'pendidikan' | 'karier' | 'komisi'>('semua');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const educations = [
    {
      degree: 'Doktor Ilmu Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI)',
      year: '2016 - 2020',
      description: 'Kajian mendalam reformasi tata kelola anggaran daerah dan desentralisasi fiskal berorientasi kesejahteraan sosial.',
    },
    {
      degree: 'Magister Administrasi Publik (S2)',
      institution: 'Universitas Gadjah Mada (UGM)',
      year: '2009 - 2012',
      description: 'Fokus regulasi pembangunan infrastruktur konektivitas wilayah dan efisiensi birokrasi pemerintahan daerah.',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Politik (S1)',
      institution: 'Universitas Padjadjaran (UNPAD)',
      year: '2003 - 2007',
      description: 'Sosiologi politik dan penguatan partisipasi publik dalam pembentukan peraturan perundang-undangan.',
    },
  ];

  const careers = [
    {
      role: `Anggota ${legislativeLevel}`,
      institution: `${party} - Daerah Pemilihan ${dapil}`,
      period: '2024 - Sekarang',
      description: 'Mengawal amanah rakyat, inisiator regulasi perlindungan petani dan pelaku usaha mikro, serta anggota Badan Anggaran APBD.',
    },
    {
      role: 'Tenaga Ahli Madya Fraksi & Regulasi Daerah',
      institution: 'Dewan Perwakilan Rakyat Daerah',
      period: '2019 - 2024',
      description: 'Menyusun naskah akademik draf rancangan perda inisiatif serta telaah kritis pengawasan belanja modal pemerintah daerah.',
    },
    {
      role: 'Konsultan Kebijakan & Otonomi Daerah',
      institution: 'Lembaga Kajian Tata Kelola Publik',
      period: '2014 - 2019',
      description: 'Mendampingi pemerintah kabupaten/kota dalam audit efektivitas program pengentasan kemiskinan dan pelayanan terpadu.',
    },
  ];

  const focusPillars = [
    {
      num: '01',
      title: 'Advokasi Regulasi Pro-Rakyat',
      desc: 'Memperjuangkan peraturan daerah yang berpihak nyata pada hak-hak konstituen dan pemerataan ekonomi.',
    },
    {
      num: '02',
      title: 'Pengawasan Alokasi APBD',
      desc: 'Memastikan pos belanja modal daerah terserap secara transparan, akuntabel, dan bebas dari pemborosan anggaran.',
    },
    {
      num: '03',
      title: 'Serap Aspirasi Konstituen',
      desc: 'Membuka akses dialog langsung dua arah melalui kunjungan reses berkala di seluruh pelosok wilayah dapil.',
    },
    {
      num: '04',
      title: 'Pemberdayaan Sektor Riil',
      desc: 'Mendorong fasilitasi subsidi sarana tani, pelatihan wirausaha generasi muda, dan digitalisasi pasar rakyat.',
    },
  ];

  return (
    <div className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto space-y-20 select-text">
      
      {/* ─── 1. TOP PROFILE HERO: PORTRAIT CUTOUT WITH SUNSET ORANGE GLOW ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* Left Column: Portrait with Sunset Aura Hotspot */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] rounded-[32px] overflow-hidden bg-[#120402] border border-orange-500/30 shadow-2xl flex items-end justify-center">
            
            {/* Sunset Hotspot Radial Gradient Glow Behind Portrait */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 90% 80% at 50% 40%, rgba(255, 80, 10, 0.85) 0%, rgba(191, 30, 4, 0.5) 45%, rgba(18, 2, 1, 0.95) 85%)',
              }}
            />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF500A]/40 blur-[80px] rounded-full pointer-events-none" />

            {/* Dewans Photo Cutout */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="relative z-10 w-full h-[92%] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] filter contrast-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />

            {/* Bottom Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none" />
            
            {/* Top Right Orange Badge */}
            <div className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-orange-500/50 text-[11px] font-bold text-orange-400">
              Mandat Konstituen
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Parliamentary Credentials */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block">
            {legislativeLevel} • {party}
          </span>

          <h2 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-white leading-[1.08] tracking-tight">
            {officialFullName}
          </h2>

          <p className="text-xs sm:text-sm font-bold text-orange-400 tracking-wide uppercase">
            {commissionName} • Dapil {dapil}
          </p>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed font-normal">
            {bio}
          </p>

          {/* 3 High-Impact Stat Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-orange-500/40 transition-colors">
              <Award className="w-5 h-5 text-orange-500 mb-2" />
              <div className="font-outfit font-black text-3xl text-white">6+ Tahun</div>
              <div className="text-xs text-white/60 font-semibold mt-1">Pengabdian Parlemen</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-orange-500/40 transition-colors">
              <Users className="w-5 h-5 text-orange-500 mb-2" />
              <div className="font-outfit font-black text-3xl text-white">120+</div>
              <div className="text-xs text-white/60 font-semibold mt-1">Program Aspirasi Tuntas</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-orange-500/40 transition-colors">
              <ShieldCheck className="w-5 h-5 text-orange-500 mb-2" />
              <div className="font-outfit font-black text-3xl text-white">Rp 45M+</div>
              <div className="text-xs text-white/60 font-semibold mt-1">Alokasi APBD Kawalan</div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── 2. 4 PARLIAMENTARY FOCUS PILLARS (#01 - #04) ─── */}
      <section className="pt-4 border-t border-white/10">
        <div className="mb-12">
          <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-2">
            Komitmen Pengabdian Konstituen
          </span>
          <h3 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
            4 Pilar Fokus Parlemen Daerah
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusPillars.map((p) => (
            <div
              key={p.num}
              className="p-7 rounded-[28px] bg-[#141414] border border-white/10 hover:border-orange-500/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <span className="font-outfit font-black text-3xl sm:text-4xl text-orange-500 mb-4 block">
                  #{p.num}
                </span>
                <h4 className="font-outfit font-black text-xl text-white mb-2 leading-snug group-hover:text-orange-400 transition-colors">
                  {p.title}
                </h4>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-bold">
                <span>Dapil {dapil}</span>
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. INTERACTIVE TABS: PENDIDIKAN, KARIER, & PENUGASAN ─── */}
      <section className="p-8 sm:p-12 rounded-[32px] bg-[#121212] border border-white/10 space-y-10">
        
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10">
          {[
            { id: 'semua', label: 'Semua Rekam Jejak' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Pengalaman Karier' },
            { id: 'komisi', label: 'Tugas Komisi & AKD' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FF4500] text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-10">
          
          {/* Pendidikan */}
          {(activeTab === 'semua' || activeTab === 'pendidikan') && (
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                <h4 className="font-outfit font-black text-2xl text-white tracking-tight">
                  Riwayat Pendidikan Formal
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-orange-500/40 transition-colors"
                  >
                    <span className="text-xs font-bold text-orange-400 block mb-1">
                      {edu.year}
                    </span>
                    <h5 className="font-outfit font-black text-lg text-white leading-snug">
                      {edu.degree}
                    </h5>
                    <p className="text-xs font-semibold text-white/60 mt-1">
                      {edu.institution}
                    </p>
                    <p className="text-xs text-white/65 mt-3 leading-relaxed">
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Karier */}
          {(activeTab === 'semua' || activeTab === 'karier') && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5 mb-6">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <h4 className="font-outfit font-black text-2xl text-white tracking-tight">
                  Pengalaman &amp; Rekam Jejak Karier
                </h4>
              </div>

              <div className="space-y-4">
                {careers.map((car, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#181818] border border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div>
                      <h5 className="font-outfit font-black text-xl text-white leading-snug">
                        {car.role}
                      </h5>
                      <p className="text-xs font-semibold text-orange-400 mt-1">
                        {car.institution}
                      </p>
                      <p className="text-xs sm:text-sm text-white/65 mt-2.5 leading-relaxed max-w-3xl">
                        {car.description}
                      </p>
                    </div>
                    <span className="shrink-0 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white self-start">
                      {car.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tugas Komisi */}
          {(activeTab === 'semua' || activeTab === 'komisi') && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5 mb-6">
                <Landmark className="w-5 h-5 text-orange-500" />
                <h4 className="font-outfit font-black text-2xl text-white tracking-tight">
                  Penugasan Alat Kelengkapan Dewan (AKD)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#181818] border border-white/10">
                  <h5 className="font-outfit font-black text-xl text-white">
                    {commissionName}
                  </h5>
                  <p className="text-xs sm:text-sm text-white/65 mt-2 leading-relaxed">
                    Bertanggung jawab mengawasi jalannya roda pemerintahan daerah, penegakan peraturan perundang-undangan, tata kelola kepegawaian ASN, serta ketertiban umum konstituen.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#181818] border border-white/10">
                  <h5 className="font-outfit font-black text-xl text-white">
                    Badan Anggaran (Banggar) &amp; Bapemperda
                  </h5>
                  <p className="text-xs sm:text-sm text-white/65 mt-2 leading-relaxed">
                    Berperan aktif dalam sinkronisasi alokasi belanja modal APBD daerah agar pro-rakyat, serta harmonisasi penyusunan draf perda inisiatif perlindungan masyarakat.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ─── 4. BOTTOM ACTION BANNER ─── */}
      <section className="rounded-[32px] bg-gradient-to-r from-[#FF500A] via-[#EA3604] to-[#BF1E04] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="select-text text-center md:text-left">
          <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white leading-tight">
            Sampaikan Aspirasi Anda Secara Langsung
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl">
            Suara Anda adalah pedoman pengawasan kebijakan kami di parlemen. Kirimkan laporan atau ide pembangunan daerah.
          </p>
        </div>
        <Link
          href={getNavLinkHref('/kontak')}
          className="shrink-0 pl-6 pr-2 py-3 rounded-full bg-white text-stone-950 text-xs sm:text-sm font-bold hover:bg-stone-100 transition-all inline-flex items-center gap-2 shadow-lg group cursor-pointer"
        >
          <span>Kirim Aspirasi Sekarang</span>
          <div className="w-6 h-6 rounded-full bg-[#FF4500] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </section>

    </div>
  );
}
