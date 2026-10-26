'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
  ExternalLink,
  Target,
} from 'lucide-react';
import { XenonMintShell } from './XenonMintShell';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';

interface XenonMintProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function XenonMintProfileClient({
  member,
  theme,
  subdomain,
}: XenonMintProfileClientProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

  const keyMetrics = [
    {
      value: '100%',
      label: 'Kehadiran Sidang Paripurna',
      desc: 'Disiplin dan konsisten dalam setiap pengawalan agenda legislasi nasional.',
    },
    {
      value: '120+',
      label: 'Aspirasi Warga Tervalidasi',
      desc: 'Diserap melalui reses dan diperjuangkan dalam komisi perimbangan daerah.',
    },
    {
      value: '14',
      label: 'Inisiatif Regulasi Publik',
      desc: 'Mengawal rancangan regulasi pro-rakyat, kemandirian pangan, dan UMKM.',
    },
    {
      value: '98.4%',
      label: 'Indeks Akuntabilitas Terbuka',
      desc: 'Transparansi laporan kerja berkala yang dapat diakses publik secara daring.',
    },
  ];

  const careerTimeline = [
    {
      period: '2024 - Sekarang',
      role: info.title,
      institution: 'Dewan Perwakilan Rakyat Republik Indonesia (DPR RI)',
      description: `Menjalankan fungsi pengawasan alokasi belanja kementerian/lembaga, perumusan regulasi nasional, serta menyerap aspirasi masyarakat di Daerah Pemilihan ${info.dapil}.`,
    },
    {
      period: '2019 - 2024',
      role: 'Ketua Pokja Transformasi Kebijakan Publik',
      institution: 'Forum Kajian Strategis Daerah',
      description:
        'Mengawal harmonisasi regulasi perizinan usaha dan pendampingan serapan anggaran infrastruktur di tingkat kabupaten/kota.',
    },
    {
      period: '2014 - 2019',
      role: 'Konsultan Tata Kelola Organisasi & Manajemen Proyek',
      institution: 'Pusat Studi Akuntabilitas Publik',
      description:
        'Merumuskan sistem kendali mutu belanja daerah dan asistensi reformasi birokrasi pemerintahan daerah.',
    },
  ];

  const educationHistory = [
    {
      period: '2012 - 2014',
      degree: 'Magister Manajemen (M.M.)',
      institution: 'Universitas Indonesia',
      focus: 'Konsentrasi Manajemen Kebijakan Publik & Strategi Organisasi',
    },
    {
      period: '2006 - 2010',
      degree: 'Sarjana Teknik (S.T.)',
      institution: 'Institut Teknologi Bandung',
      focus: 'Fokus Perencanaan Infrastruktur & Rekayasa Wilayah',
    },
  ];

  const priorityPrograms = [
    {
      title: 'Transparansi Alokasi APBD/APBN Daerah',
      desc: 'Mendorong keterbukaan rincian anggaran proyek fisik daerah agar bebas kebocoran dan tepat mutu bagi masyarakat luas.',
    },
    {
      title: 'Kepastian Pupuk & Akses Pasar Petani',
      desc: 'Mengawal distribusi pupuk bersubsidi dan stabilitas harga gabah di tingkat petani lokal saat panen serentak.',
    },
    {
      title: 'Digitalisasi & Permodalan UMKM Daerah',
      desc: 'Mempermudah sertifikasi halal, NIB gratis, dan fasilitasi pinjaman lunak tanpa agunan memberatkan bagi wirausaha mikro.',
    },
    {
      title: 'Posko Respon Cepat Aspirasi Konstituen',
      desc: 'Menyediakan kanal terpadu pelaporan masalah jalan rusak, bantuan sosial, dan pendampingan hukum warga kurang mampu.',
    },
  ];

  return (
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="profil">
      <div className="space-y-16 py-10 sm:py-14">
        
        {/* ========================================================= */}
        {/* HERO PROFILE (Obsidian Dark with Arched Frame)            */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="relative rounded-[36px] sm:rounded-[48px] bg-[#081018] p-8 sm:p-12 lg:p-16 border border-slate-800 text-white overflow-hidden shadow-2xl">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-[#00E599]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Arched Photo Frame on Left */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[320px] aspect-[4/5] flex items-end justify-center">
                  <div className="absolute inset-0 rounded-t-[130px] rounded-b-[40px] bg-gradient-to-b from-[#00E599] via-[#00C074] to-[#009E60] p-1 shadow-[0_20px_50px_-10px_rgba(0,229,153,0.35)]">
                    <div className="w-full h-full rounded-t-[126px] rounded-b-[36px] bg-gradient-to-b from-[#00D084]/30 to-black/30" />
                  </div>
                  <div className="relative z-10 w-full h-[105%] flex items-end justify-center overflow-hidden rounded-b-[40px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={info.avatar}
                      alt={info.fullName}
                      className="w-full h-full object-contain object-bottom filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Official Role on Right */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-[#00E599]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Profil Resmi Anggota Parlemen</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {info.fullName}
                  </h1>

                  <div className="text-sm sm:text-base font-bold text-[#00E599]">
                    {info.title}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {info.bio}
                </p>

                {/* Key Badges */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#00E599]" />
                    <span>{info.party}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00E599]" />
                    <span>Daerah Pemilihan {info.dapil}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-xs font-bold text-[#00E599] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Fraksi Terbuka</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <Link
                    href={href('/kontak')}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#00E599] hover:bg-[#00D084] text-slate-950 font-black text-xs tracking-wider transition shadow-lg shadow-[#00E599]/20"
                  >
                    <span>HUBUNGI SAYA</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={info.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition"
                  >
                    <span>Instagram Resmi</span>
                    <ExternalLink className="w-3 h-3 text-[#00E599]" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 4 KEY METRICS (Performance Track Record)                  */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((met, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-2 group"
              >
                <div className="text-3xl sm:text-4xl font-black text-slate-950 group-hover:text-[#00A86B] transition-colors">
                  {met.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {met.label}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {met.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRIORITY PROGRAMS (Visi & Fokus Kerja)                     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Agenda Pengabdian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Program Prioritas Konstituen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {priorityPrograms.map((prog, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#00D084] transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center font-black text-sm">
                  0{idx + 1}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  {prog.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {prog.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* CAREER & EDUCATION TIMELINES                              */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            
            {/* Career Timeline */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#00A86B]" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  Riwayat Karier & Jabatan
                </h3>
              </div>

              <div className="space-y-6 border-l-2 border-slate-200 pl-6 ml-2.5">
                {careerTimeline.map((item, idx) => (
                  <div key={idx} className="relative space-y-1.5">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#00E599] border-2 border-white shadow-sm" />
                    <span className="text-[11px] font-bold text-[#00A86B] uppercase tracking-wider block">
                      {item.period}
                    </span>
                    <h4 className="text-base font-black text-slate-950">
                      {item.role}
                    </h4>
                    <div className="text-xs font-semibold text-slate-700">
                      {item.institution}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education History */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-[#00A86B]" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  Riwayat Pendidikan Formal
                </h3>
              </div>

              <div className="space-y-6 border-l-2 border-slate-200 pl-6 ml-2.5">
                {educationHistory.map((item, idx) => (
                  <div key={idx} className="relative space-y-1.5">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-white shadow-sm" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {item.period}
                    </span>
                    <h4 className="text-base font-black text-slate-950">
                      {item.degree}
                    </h4>
                    <div className="text-xs font-semibold text-slate-700">
                      {item.institution}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {item.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </XenonMintShell>
  );
}
