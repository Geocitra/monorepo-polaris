'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  CheckCircle2,
  Compass,
  ArrowRight,
  BookOpen,
  BarChart3,
  Mail,
  MapPin,
  Calendar,
  Users,
  Landmark,
  Camera,
  MessageCircle,
  Sparkles,
  HeartHandshake,
  FileText,
  Phone,
} from 'lucide-react';
import { getNexoraMemberInfo, useNexoraHref, NEXORA_THEME } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface NexoraVioletProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function NexoraVioletProfileClient({
  member,
  theme,
  subdomain,
}: NexoraVioletProfileClientProps) {
  // 1. Data Resolvers
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);

  const cleanLegislativeLevel = (info.legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  // 2. AKD Resolvers
  const akdAssignment = theme?.layoutSchema?.akdAssignment || info.akdAssignment;
  const commissionData = akdAssignment?.commission;
  const activeCommissionName =
    commissionData?.name?.trim() ||
    info.commissionName?.trim() ||
    (member?.commissionName ? member.commissionName.trim() : '');
  const commissionRole =
    commissionData?.role?.trim() || (activeCommissionName ? 'Anggota Komisi' : '');
  const commissionScope = commissionData?.scope?.trim() || '';
  const commissionPartners = commissionData?.partners?.trim() || '';
  const factionRole = akdAssignment?.factionRole?.trim() || '';
  const akdBodies: any[] = Array.isArray(akdAssignment?.akdBodies)
    ? akdAssignment.akdBodies.filter((b: any) => b && b.name?.trim())
    : [];
  const hasAnyAkd = Boolean(activeCommissionName || factionRole || akdBodies.length > 0);

  // 3. Vision Pillars Resolvers
  const DEFAULT_VISION_PILLARS = [
    {
      title: 'Fungsi Legislasi',
      subtitle: 'Legislasikan Solusi Nyata',
      description:
        'Mengawal perumusan dan pengesahan regulasi perundang-undangan yang berpihak nyata kepada kesejahteraan rakyat, UMKM, dan kepastian hukum.',
    },
    {
      title: 'Fungsi Anggaran',
      subtitle: 'Pengawasan Anggaran Transparan',
      description:
        'Memastikan alokasi belanja negara dan transfer ke daerah terealisasi tepat sasaran, akuntabel, dan bebas dari inefisiensi anggaran.',
    },
    {
      title: 'Fungsi Representasi',
      subtitle: 'Pendampingan Konstituen Berkelanjutan',
      description:
        'Menjaga interaksi berkesinambungan bersama warga di daerah pemilihan melalui agenda reses berkala dan advokasi aspirasi nyata.',
    },
  ];

  const customPillars =
    Array.isArray(theme?.layoutSchema?.visionMission) &&
    theme.layoutSchema.visionMission.length > 0
      ? theme.layoutSchema.visionMission.filter(
          (p: any) => p && (p.title?.trim() || p.description?.trim())
        )
      : [];
  const visionPillars = customPillars.length > 0 ? customPillars : DEFAULT_VISION_PILLARS;
  const pillarIcons = [Compass, Building2, HeartHandshake];

  // 4. Education & Courses Resolvers
  const formalEduList: string[] = member?.education
    ? member.education
        .split(/[\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : Array.isArray(info.educationList) && info.educationList.length > 0
    ? info.educationList
    : [];

  const courses: string[] = Array.isArray(member?.courses)
    ? member.courses.filter(Boolean)
    : typeof member?.courses === 'string'
    ? member.courses.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // 5. Careers & Organization Resolvers
  const customCareers: any[] =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && (c.role?.trim() || c.organization?.trim()))
      : Array.isArray(info.careersList) && info.careersList.length > 0
      ? info.careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  // 6. Activities Resolvers (Real field documentation only)
  const verifiedActivities =
    theme?.layoutSchema?.verifiedActivities ||
    theme?.layoutSchema?.activities ||
    member?.activities;
  const displayActivities: any[] = Array.isArray(verifiedActivities)
    ? verifiedActivities.filter((a: any) => a && (a.title?.trim() || a.photoUrl?.trim()))
    : [];

  // 7. Custom Performance Stats (Only rendered if specifically configured in dashboard)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  const facts = [
    { label: 'LEMBAGA', value: cleanLegislativeLevel },
    { label: 'FRAKSI PARTAI', value: info.party },
    { label: 'KOMISI / AKD', value: activeCommissionName || 'Komisi Terkait' },
    {
      label: 'DAERAH PEMILIHAN',
      value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`,
    },
  ];

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* HEADER: TYPOGRAPHY & HERO BANNER (NEXORA VIOLET THEME)   */}
      {/* ========================================================= */}
      <div className="w-full bg-gradient-to-b from-[#ECE6FD] via-[#F4F0FF] to-white border-b border-purple-100/90 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-purple-200/80 text-[#7048E8] text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Profil Resmi Anggota Dewan • Terverifikasi</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Rekam Jejak & Pengabdian
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                BIOGRAFI DEWAN
              </h1>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 max-w-sm">
              Mandat kenegaraan dan komitmen pengabdian memperjuangkan kesejahteraan rakyat di Daerah Pemilihan {info.dapil}.
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-6 sm:px-10 lg:px-16 py-12 sm:py-16 max-w-6xl mx-auto space-y-16">

        {/* ========================================================= */}
        {/* SECTION 1: PROFILE CARD (Executive Portrait + Bio + Facts) */}
        {/* ========================================================= */}
        <div className="rounded-[32px] bg-gradient-to-br from-purple-50 via-white to-purple-50/60 p-6 sm:p-10 border border-purple-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Cutout / Portrait with Violet Aura */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.avatar || info.photoUrl || '/images/dewan-standing-full.png'}
                  alt={info.fullName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-standing-full.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {info.party}
                  </div>
                  <div className="text-sm font-black">{info.dapil}</div>
                </div>
              </div>
            </div>

            {/* Right: Full Details & Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {info.fullName}
                </h2>
                <p className="text-sm font-bold text-[#7048E8] flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>
                    Anggota {cleanLegislativeLevel}
                    {info.party && info.party !== 'Fraksi Parlemen' ? ` • Fraksi ${info.party}` : ''}
                  </span>
                </p>
              </div>

              {/* Bio Statement Quote */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100/90 shadow-sm text-slate-700 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#7048E8]">
                  Visi & Komitmen Kebangsaan
                </div>
                {theme?.bioBiography ? (
                  <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800">
                    {theme.bioBiography
                      .split('\n\n')
                      .filter(Boolean)
                      .map((para: string, idx: number) => (
                        <p key={idx} className="leading-relaxed">
                          {para.trim()}
                        </p>
                      ))}
                  </div>
                ) : theme?.headlineTagline ? (
                  <p className="text-xs sm:text-sm italic leading-relaxed text-slate-800">
                    &ldquo;{theme.headlineTagline}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm italic leading-relaxed text-slate-800">
                    &ldquo;{info.bio}&rdquo;
                  </p>
                )}
              </div>

              {/* Factual Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm flex flex-col justify-center"
                  >
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {fact.label}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate" title={fact.value}>
                      {fact.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Performance Stats (Only if configured in dashboard) */}
              {customStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {customStats.map((stat: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 shadow-xs"
                    >
                      <div className="text-[10px] font-semibold text-slate-600 truncate">{stat.label}</div>
                      <div className="text-base sm:text-lg font-black text-[#7048E8] mt-0.5">{stat.value}</div>
                      {stat.sublabel && (
                        <div className="text-[9px] text-slate-500 font-bold truncate">{stat.sublabel}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                  <span>Katalog Artikel</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>

                <Link
                  href={href('/infografis')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-[#7048E8] border border-purple-200 text-xs font-bold transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Infografis Kinerja</span>
                </Link>

                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition"
                >
                  <span>Kontak Staf Ahli</span>
                </Link>

                {info.waHotlineLink && (
                  <a
                    href={info.waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Langsung</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="border-b border-purple-100 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Penugasan Komisi &amp; Alat Kelengkapan Dewan
                </h2>
                <span className="w-8 h-0.5 bg-[#7048E8] rounded-full" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Mandat resmi dan ruang lingkup pengawasan kenegaraan dalam menjalankan fungsi legislasi, anggaran, dan representasi.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#7048E8] bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-full shrink-0">
              Mandat Parlemen Terverifikasi
            </span>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-6">
              {/* Kartu Komisi Parlemen Utama */}
              {activeCommissionName ? (
                <div className="rounded-3xl bg-white border border-purple-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-purple-50">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-[#7048E8] border border-purple-200">
                          Komisi Parlemen
                        </span>
                        {commissionRole && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0F0B1E] text-white">
                            {commissionRole}
                          </span>
                        )}
                        {factionRole && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 text-[#7048E8] border border-purple-200">
                            Fraksi {info.party && info.party !== 'Fraksi Parlemen' ? info.party : ''} • {factionRole}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {activeCommissionName}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-[#7048E8] flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ruang Lingkup Bidang Pengawasan */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-[#7048E8]" />
                        <span>Ruang Lingkup Bidang Pengawasan</span>
                      </div>
                      {commissionScope ? (
                        <p className="text-sm text-slate-700 leading-relaxed font-normal bg-purple-50/50 p-4 rounded-2xl border border-purple-100/80">
                          {commissionScope}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic bg-purple-50/30 p-4 rounded-2xl border border-purple-100/60">
                          Ruang lingkup bidang pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>

                    {/* Mitra Kerja Terkait */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <Users className="w-4 h-4 text-[#7048E8]" />
                        <span>Kementerian / Lembaga Mitra Kerja</span>
                      </div>
                      {commissionPartners ? (
                        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80">
                          {commissionPartners
                            .split(/[,;\n]+/)
                            .map((pt: string, pIdx: number) => {
                              const cleanPt = pt.trim();
                              if (!cleanPt) return null;
                              return (
                                <span
                                  key={pIdx}
                                  className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-purple-200/80 text-xs font-semibold shadow-2xs"
                                >
                                  {cleanPt}
                                </span>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic bg-purple-50/30 p-4 rounded-2xl border border-purple-100/60">
                          Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Keanggotaan Alat Kelengkapan Dewan (AKD) Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#7048E8]">
                      Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                    </span>
                    <div className="h-px bg-purple-100 flex-1 max-w-[120px]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {akdBodies.map((akd: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-[#7048E8]/50 hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7048E8] border border-purple-200/60 flex items-center justify-center font-black shrink-0">
                            <Landmark className="w-4.5 h-4.5 text-[#7048E8]" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F0B1E] text-white shrink-0">
                            {akd.role || 'Anggota'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {akd.name}
                          </h4>
                          {akd.notes && (
                            <p className="text-xs text-slate-600 leading-relaxed pt-1">
                              {akd.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-2xl bg-purple-50/40 border border-purple-100 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7048E8] border border-purple-200 mx-auto flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: TIGA PILAR KOMITMEN PENGABDIAN (OUR MISSION)   */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="border-b border-purple-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Pilar Fokus Pengabdian
              </h2>
              <span className="w-8 h-0.5 bg-[#7048E8] rounded-full" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Prinsip Kerja Parlemen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 rounded-3xl p-6 border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shadow-xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#7048E8]">
                      {pillar.title}
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      {pillar.subtitle || pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: REKAM JEJAK PENDIDIKAN & KARIER PUBLIK          */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="border-b border-purple-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Riwayat Pengabdian &amp; Pendidikan
              </h2>
              <span className="w-8 h-0.5 bg-[#7048E8] rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Kartu Riwayat Pendidikan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-purple-50">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7048E8] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-[#7048E8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Riwayat Pendidikan Formal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Latar belakang keilmuan &amp; kepakaran
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {formalEduList.length > 0 ? (
                  formalEduList.map((edu: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7048E8] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{edu}</div>
                        <div className="text-[10px] text-[#7048E8] font-semibold mt-0.5">
                          Kredensial Pendidikan Terverifikasi
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600">
                      Informasi riwayat pendidikan belum ditambahkan.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                    </p>
                  </div>
                )}

                {courses.length > 0 && (
                  <div className="pt-3 border-t border-purple-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Pelatihan &amp; Sertifikasi Keparlemenan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {courses.map((course: string, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#7048E8] border border-purple-200 text-[10px] font-semibold"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kartu Riwayat Karir & Pengabdian */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-purple-50">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7048E8] flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5 text-[#7048E8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Penugasan Parlemen &amp; Pengabdian
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Alat kelengkapan dewan &amp; rekam jejak amanah
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {customCareers.length > 0 ? (
                  customCareers.map((cItem: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7048E8] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="text-xs font-bold text-slate-900">
                          {cItem.role || cItem.title || 'Amanah Pengabdian'}
                        </div>
                        {(cItem.organization || cItem.institution) && (
                          <div className="text-[11px] font-semibold text-[#7048E8]">
                            {cItem.organization || cItem.institution}
                          </div>
                        )}
                        {cItem.period && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            {cItem.period}
                          </div>
                        )}
                        {cItem.description && (
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {cItem.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600">
                      Informasi rekam jejak penugasan dewan belum ditambahkan.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: DOKUMENTASI KINERJA TURUN KE DAPIL             */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="border-b border-purple-100 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Dokumentasi Kinerja Turun ke Dapil
                </h2>
                <span className="w-8 h-0.5 bg-[#7048E8] rounded-full" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Rekam jejak kehadiran nyata, penyerapan aspirasi warga, dan pengawasan kerja di daerah pemilihan.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#7048E8] bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-full shrink-0">
              Aksi Nyata Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="group rounded-3xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Cover Foto Dokumentasi */}
                  {act.photoUrl ? (
                    <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={act.photoUrl}
                        alt={act.title || 'Dokumentasi Kinerja'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                      {/* Pill Tanggal */}
                      {act.date && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <Calendar className="w-3 h-3 text-purple-300" />
                          <span>{act.date}</span>
                        </div>
                      )}

                      {/* Pill Lokasi */}
                      {act.location && (
                        <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] bg-purple-50/50 flex flex-col items-center justify-center text-slate-400 gap-1 p-4 border-b border-purple-100">
                      <Camera className="w-8 h-8 text-purple-300" />
                      <span className="text-xs font-medium text-slate-500">Dokumentasi Lapangan</span>
                    </div>
                  )}

                  {/* Informasi Narasi Kinerja */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7048E8] transition-colors line-clamp-2 leading-snug">
                        {act.title}
                      </h3>
                      {act.description && (
                        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-[11px]">
                      <span className="text-[#7048E8] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7048E8]" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-2xl bg-purple-50/40 border border-purple-100 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7048E8] border border-purple-200 mx-auto flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#7048E8]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Informasi dokumentasi kinerja belum ditambahkan.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: GALERI FOTO PARLEMEN                            */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <PortalPhotoGallery
            photos={member?.photoGallery}
            memberName={info.officialFullName}
          />
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: CALL TO ACTION ASPIRASI WARGA                  */}
        {/* ========================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#0F0B1E] via-[#1A1435] to-[#0F0B1E] text-white p-8 sm:p-12 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {info.fullName}?
            </h3>

            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, fasilitas umum, atau usulan perbaikan layanan publik di Daerah Pemilihan {info.dapil}.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7048E8] hover:bg-[#5F3DC4] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Hotline Dewan</span>
                </a>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
