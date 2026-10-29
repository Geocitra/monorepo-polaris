'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Award,
  Users,
  CheckCircle,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Building2,
  Compass,
  HeartHandshake,
  Landmark,
  MapPin,
  Camera,
  ArrowRight,
  MessageCircle,
  Phone,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

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
  // 1. Resolve dynamic data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#8B5CF6',
  });

  const {
    officialFullName,
    photoUrl,
    party,
    dapil,
    legislativeLevel,
    commissionName,
    bio,
    headlineTagline,
    visionPillars,
    educationList,
    careersList,
    akdAssignment,
    activities,
    waNumber,
    waHotlineLink,
    formattedPhoneNumber,
    officialEmail,
  } = resolved;

  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const getNavLinkHref = (path: string) => {
    let base = subdomain ? `/${subdomain}${path}` : path;
    const sp = new URLSearchParams();
    if (previewTemplate) sp.set('preview_template', previewTemplate);
    if (previewColor) sp.set('preview_color', previewColor);
    const qs = sp.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
  };

  // 2. AKD Resolvers
  const commissionData = akdAssignment?.commission;
  const activeCommissionName =
    commissionData?.name?.trim() || commissionName?.trim() || (member?.commissionName ? member.commissionName.trim() : '');
  const commissionRole =
    commissionData?.role?.trim() || (activeCommissionName ? 'Anggota Komisi' : '');
  const commissionScope = commissionData?.scope?.trim() || '';
  const commissionPartners = commissionData?.partners?.trim() || '';
  const factionRole = akdAssignment?.factionRole?.trim() || '';
  const akdBodies: any[] = Array.isArray(akdAssignment?.akdBodies)
    ? akdAssignment.akdBodies.filter((b: any) => b && b.name?.trim())
    : [];
  const hasAnyAkd = Boolean(activeCommissionName || factionRole || akdBodies.length > 0);

  // 3. Courses / Certifications
  const courses: string[] = Array.isArray(member?.courses)
    ? member.courses.filter(Boolean)
    : typeof member?.courses === 'string'
    ? member.courses.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // 4. Custom Stats from theme layoutSchema (HANYA jika ada data resmi)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  // 5. Pillar icon mapping
  const pillarIcons = [Compass, Building2, HeartHandshake, Award];

  // 6. Verified activities resolver
  const verifiedActivities =
    theme?.layoutSchema?.verifiedActivities ||
    theme?.layoutSchema?.activities ||
    member?.activities;
  const displayActivities: any[] = Array.isArray(verifiedActivities)
    ? verifiedActivities.filter((a: any) => a && a.title?.trim())
    : [];

  // 7. Career list resolver
  const customCareers =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && c.role?.trim())
      : Array.isArray(careersList) && careersList.length > 0
      ? careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  const [activeHistoryTab, setActiveHistoryTab] = useState<'pendidikan' | 'karier'>('pendidikan');

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16 text-slate-100">
      
      {/* ─── 1. CYBER HERO PROFILE (SIGNATURE NEON HALO & GLASS DETAILS) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-25"
            style={{
              background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left: Signature Neon Halo & Cutout Photo */}
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

                {/* Cyber Verification Pill */}
                <div className="absolute bottom-2 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 rounded-xl px-3 py-1.5 text-center z-20 shadow-lg">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                    Mandat Parlemen Terverifikasi
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Cyber Details & Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="px-3 py-1 rounded-full font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {cleanLegislativeLevel} • {party}
                  </span>
                  {dapil && (
                    <span className="px-3 py-1 rounded-full font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                      DAPIL: {dapil}
                    </span>
                  )}
                  {activeCommissionName && (
                    <span className="px-3 py-1 rounded-full font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30">
                      {activeCommissionName}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {officialFullName}
                </h1>
                
                {headlineTagline && (
                  <p className="text-sm sm:text-base text-cyan-300 font-semibold italic">
                    &ldquo;{headlineTagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Bio Narrative */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
                {bio ? (
                  bio
                    .split('\n\n')
                    .filter(Boolean)
                    .map((para: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">
                        {para.trim()}
                      </p>
                    ))
                ) : (
                  <p>
                    Mendedikasikan amanah pengabdian kenegaraan untuk memperjuangkan aspirasi masyarakat di Daerah Pemilihan {dapil || 'daerah pemilihan'} melalui pelaksanaan fungsi legislasi yang pro-rakyat, pengawasan alokasi anggaran transparan, dan pendampingan nyata warga.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. STATS COUNTERS (HANYA TAMPIL JIKA DIINPUT DARI DASHBOARD) ─── */}
      {customStats.length > 0 && (
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
            {customStats.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-lg space-y-2 hover:border-purple-500/50 transition-all"
              >
                <div className="text-3xl font-black text-white font-mono">{item.value}</div>
                <div className="text-xs font-bold text-slate-300">{item.label}</div>
                {(item.desc || item.sublabel) && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.desc || item.sublabel}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-purple-900/40 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              MANDAT KENEGARAAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Penugasan Komisi &amp; Alat Kelengkapan Dewan
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full shrink-0">
            Mandat Resmi Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Parlemen Utama */}
            {activeCommissionName && (
              <div className="rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-purple-900/30">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full font-bold bg-slate-900 text-cyan-300 border border-cyan-500/30">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                          Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {activeCommissionName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-lg">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-purple-900/40">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-950/70 p-4 rounded-2xl border border-purple-900/40">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-950/70 border border-purple-900/40">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-xl bg-purple-950/50 text-cyan-300 border border-purple-900/60 text-xs font-mono font-semibold"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-950/70 p-4 rounded-2xl border border-purple-900/40">
                        Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Keanggotaan Badan & AKD Lainnya */}
            {akdBodies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-300">
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-purple-900/40 flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 shadow-md hover:border-purple-500/50 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black shrink-0">
                          <Landmark className="w-4.5 h-4.5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-cyan-300 border border-cyan-500/30 shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-slate-400 leading-relaxed pt-1">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 4. PILAR FOKUS PENGABDIAN (3 CYBER CARDS) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-purple-900/40 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              FOKUS &amp; KOMITMEN PENGABDIAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              3 Pilar Fungsi Keparlemenan
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Amanah Legislasi 2024 - 2029
          </span>
        </div>

        {visionPillars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="p-6 sm:p-7 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 hover:border-purple-500/80 transition-all duration-300 space-y-4 shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        {pillar.title}
                      </span>
                      <h3 className="font-bold text-lg text-white leading-snug">
                        {pillar.subtitle || pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs font-mono text-purple-300">
                    <span className="font-bold uppercase tracking-wider">Pilar Terverifikasi</span>
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center">
              <Compass className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              Informasi pilar fokus pengabdian belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Fokus dan komitmen prinsip kerja parlemen akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 5. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              REKAM JEJAK KENEGARAAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Latar Belakang Pendidikan &amp; Karier Publik
            </h2>
          </div>

          {/* Cyber Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-purple-900/40 self-start">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('pendidikan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeHistoryTab === 'pendidikan'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pendidikan ({educationList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryTab('karier')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                activeHistoryTab === 'karier'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Karier ({customCareers.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeHistoryTab === 'pendidikan' ? (
          <div className="space-y-4">
            {educationList.length > 0 ? (
              educationList.map((edu: string, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        Pendidikan Formal Terverifikasi
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        KREDENSIAL RESMI
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{edu}</h4>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-950/80 text-cyan-400 text-xs font-mono font-bold shrink-0 self-start border border-cyan-500/30">
                    Jenjang {idx + 1}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 text-center space-y-2">
                <GraduationCap className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Informasi pendidikan belum ditambahkan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                </p>
              </div>
            )}

            {/* Courses / Certifications */}
            {courses.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 space-y-3">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wide block">
                  Pelatihan &amp; Sertifikasi Keparlemenan:
                </span>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course: string, cIdx: number) => (
                    <span
                      key={cIdx}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/80 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {customCareers.length > 0 ? (
              customCareers.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {item.organization || 'Amanah Parlemen'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        REKAM JEJAK
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.role}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.period && (
                    <div className="px-3 py-1 rounded-full bg-slate-950/80 text-cyan-400 text-xs font-mono font-bold shrink-0 self-start border border-cyan-500/30">
                      {item.period}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Informasi rekam jejak karier belum ditambahkan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI NYATA LAPANGAN) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-purple-900/40 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
              DOKUMENTASI LAPANGAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Dokumentasi Kinerja Turun ke Dapil
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full shrink-0">
            Aksi Nyata Lapangan
          </span>
        </div>

        {displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayActivities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 overflow-hidden shadow-xl hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {act.photoUrl ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={act.photoUrl}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1022] via-transparent to-transparent pointer-events-none" />

                      {/* Pill Tanggal */}
                      {act.date && (
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-purple-500/30 text-cyan-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          <span>{act.date}</span>
                        </div>
                      )}

                      {/* Pill Lokasi */}
                      {act.location && (
                        <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] bg-slate-950/70 flex flex-col items-center justify-center text-slate-500 gap-1 p-4 border-b border-purple-900/40">
                      <Camera className="w-8 h-8 text-purple-400/60" />
                      <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed line-clamp-3">
                        {act.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 border-t border-purple-900/30 mt-2 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kinerja Terverifikasi</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              Informasi dokumentasi kinerja belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 7. GALERI FOTO RESMI (JIKA TERSEDIA) ─── */}
      {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-purple-900/40 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
                ARSIP VISUAL PARLEMEN
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Galeri Foto Resmi
              </h2>
            </div>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION ASPIRASI KONSTITUEN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#0C1022] to-indigo-950/80 border border-purple-900/50 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-purple-500/20 text-cyan-300 border border-purple-500/40 text-xs font-mono font-bold tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950/80 border border-purple-900/60 hover:border-cyan-400 text-cyan-300 text-xs font-bold font-mono uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
