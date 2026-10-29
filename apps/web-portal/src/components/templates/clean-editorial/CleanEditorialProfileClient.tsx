'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users,
  Compass,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  MapPin,
  Camera,
  Landmark,
  ArrowRight,
  Scale,
  Sparkles,
  Award,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';

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
  // 1. Resolve dynamic data from member & theme (sama seperti template polaris utama)
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#6366F1',
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
    primaryColor,
  } = resolved;

  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  const getNavLinkHref = (path: string) => {
    return subdomain ? `/${subdomain}${path}` : path;
  };

  // 2. AKD Resolvers
  const commissionData = akdAssignment?.commission;
  const activeCommissionName =
    commissionData?.name?.trim() || commissionName?.trim() || '';
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
  const courses: string[] = Array.isArray(member?.courses) ? member.courses : [];

  // 4. Stats Counters from theme layoutSchema
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  // 5. Clean Name for script signature & monogram stamp
  function parseCleanIdentity(fullName?: string) {
    if (!fullName) return { cleanName: 'Ahmad Fauzi', initial: 'A' };
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
    };
  }

  const { cleanName, initial } = parseCleanIdentity(officialFullName);

  // Pillar icon mapping
  const pillarIcons = [Compass, Building2, HeartHandshake, Scale];

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* ─── 1. EXECUTIVE BIO CARD (ZENIT EDITORIAL STUDIO STYLE) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#F8F9FD] border border-slate-200/80 p-6 sm:p-10 lg:p-14 overflow-hidden relative shadow-xs">
          
          {/* Upper Right Dotted Grid Texture (Khas POLARIS Zenit) */}
          <div
            aria-hidden="true"
            className="absolute top-6 right-6 w-48 h-48 opacity-40 pointer-events-none select-none"
            style={{
              backgroundImage: 'radial-gradient(#94A3B8 2px, transparent 2px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left: Bio, Mandat Pills, Tagline, Signature & Counters */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1 text-left">
              <div className="space-y-3">
                {/* Mandat Badges */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span
                    className="px-3 py-1 rounded-full font-bold bg-purple-100/80 border border-purple-200 uppercase"
                    style={{ color: primaryColor }}
                  >
                    {cleanLegislativeLevel} • {party}
                  </span>
                  {dapil && (
                    <span className="px-3 py-1 rounded-full font-bold bg-white text-slate-700 border border-slate-200 uppercase">
                      DAPIL: {dapil}
                    </span>
                  )}
                  {activeCommissionName && (
                    <span className="px-3 py-1 rounded-full font-bold bg-white text-slate-700 border border-slate-200 uppercase">
                      {activeCommissionName}
                    </span>
                  )}
                </div>

                {/* Nama Lengkap & Gelar Resmi */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial-serif font-black text-slate-900 tracking-tight leading-tight">
                  {officialFullName}
                </h1>

                {/* Tagline / Headline */}
                {headlineTagline && (
                  <p
                    className="text-base sm:text-lg font-editorial-serif italic font-medium leading-snug"
                    style={{ color: primaryColor }}
                  >
                    &ldquo;{headlineTagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Bio Narasi Dinamis */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-normal">
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
                    Mendedikasikan amanah pengabdian kenegaraan untuk memperjuangkan aspirasi masyarakat melalui pelaksanaan fungsi legislasi yang pro-rakyat, pengawasan alokasi anggaran transparan, dan pendampingan nyata warga di daerah pemilihan.
                  </p>
                )}
              </div>

              {/* Script Signature */}
              <div className="pt-1">
                <span
                  className="font-script-signature text-3xl sm:text-4xl block select-none"
                  style={{ color: primaryColor }}
                >
                  {cleanName}
                </span>
              </div>

              {/* Counter Ribbon (Hanya tampil jika ada di layoutSchema stats dewan) */}
              {customStats.length > 0 && (
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono border-t border-slate-200/80">
                  {customStats.map((st: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {st.label}
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5 font-editorial-serif">
                        {st.value}
                      </span>
                      {st.sublabel && (
                        <span
                          className="text-[9.5px] font-bold block"
                          style={{ color: primaryColor }}
                        >
                          {st.sublabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Signature Soft Lavender Disc with Clean Cutout Portrait */}
            <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
              <div className="relative w-64 sm:w-76 lg:w-84 aspect-square flex items-center justify-center">
                {/* Soft Lavender Circular Disc */}
                <div
                  className="absolute inset-2 sm:inset-3 rounded-full shadow-inner"
                  style={{ backgroundColor: '#EDE9FE' }}
                />

                {/* Circular Stamp Badge */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 pointer-events-none select-none">
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22">
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_40s_linear_infinite]">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                      <path
                        id="zenitProfileArc"
                        d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                        fill="none"
                      />
                      <text className="text-[7.5px] font-mono uppercase tracking-[0.2em] fill-slate-500 font-bold">
                        <textPath href="#zenitProfileArc" startOffset="0%">
                          • {cleanName.toUpperCase()} • PARLEMEN
                        </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-serif font-black text-xs text-slate-800"
                        style={{ color: primaryColor }}
                      >
                        {initial}\
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Clean Photo standing in circle without badge overlay */}
                <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden rounded-b-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-full object-cover object-top filter contrast-[1.03] drop-shadow-xl select-none"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-mono uppercase tracking-widest block font-bold"
              style={{ color: primaryColor }}
            >
              MANDAT RESMI KENEGARAAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 mt-1">
              Penugasan Komisi &amp; Alat Kelengkapan Dewan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
              Mandat resmi kedewanan dalam mengawal fungsi legislasi, penentuan anggaran, dan pengawasan mitra kementerian/instansi pemerintah.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-purple-50 border border-purple-200/80 px-3.5 py-1.5 rounded-full shrink-0 self-start">
            AKD Parlemen Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Utama */}
            {activeCommissionName ? (
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-9 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-50 border border-purple-200"
                        style={{ color: primaryColor }}
                      >
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white font-mono">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                          Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 tracking-tight">
                      {activeCommissionName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-[#6366F1] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-[#F8F9FD] p-4 sm:p-5 rounded-2xl border border-slate-100">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-[#F8F9FD] p-4 sm:p-5 rounded-2xl border border-slate-100">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      <Users className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 sm:p-5 rounded-2xl bg-[#F8F9FD] border border-slate-100">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-[#F8F9FD] p-4 sm:p-5 rounded-2xl border border-slate-100">
                        Daftar kementerian dan lembaga mitra pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Keanggotaan Badan & AKD Lainnya */}
            {akdBodies.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center shrink-0">
                          <Landmark className="w-4.5 h-4.5" style={{ color: primaryColor }} />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-editorial-serif font-bold text-slate-900 leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FD] border border-dashed border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 mx-auto flex items-center justify-center">
              <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
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

      {/* ─── 3. TIGA PILAR KOMITMEN PENGABDIAN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-mono uppercase tracking-widest block font-bold"
              style={{ color: primaryColor }}
            >
              PRINSIP KERJA PARLEMEN
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 mt-1">
              Pilar Fokus Pengabdian
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
              Fondasi perjuangan kebijakan publik untuk mewujudkan pemerintahan yang akuntabel, transparan, dan berpihak kepada rakyat.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold self-start">
            Fokus &amp; Nilai Integritas
          </span>
        </div>

        {visionPillars && visionPillars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              const stepNumber = String(pIdx + 1).padStart(2, '0');
              return (
                <div
                  key={pIdx}
                  className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/70 flex items-center justify-center font-black">
                        <IconComp className="w-6 h-6" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-2xl font-mono font-bold text-slate-300">
                        {stepNumber}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div
                        className="text-[10.5px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: primaryColor }}
                      >
                        {pillar.title}
                      </div>
                      <h3 className="text-base sm:text-lg font-editorial-serif font-bold text-slate-900 leading-snug">
                        {pillar.subtitle || pillar.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Komitmen Prioritas</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FD] border border-dashed border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 mx-auto flex items-center justify-center">
              <Compass className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Informasi pilar fokus pengabdian belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Fokus dan komitmen prinsip kerja parlemen akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 4. REKAM JEJAK PENDIDIKAN & PENGABDIAN HISTORIS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-mono uppercase tracking-widest block font-bold"
              style={{ color: primaryColor }}
            >
              REKAM JEJAK HISTORIS
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 mt-1">
              Riwayat Pendidikan &amp; Pengabdian Publik
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
              Kredensial keilmuan akademis serta rekam jejak amanah kepemimpinan publik yang telah dijalani.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full shrink-0 self-start">
            Kredensial Resmi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom 1: Riwayat Pendidikan Formal */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-sm font-editorial-serif font-bold text-slate-900 uppercase tracking-wide">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Latar belakang keilmuan &amp; gelar akademik
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList && educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8F9FD] border border-slate-100">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {edu}
                      </div>
                      <div
                        className="text-[10.5px] font-mono font-bold"
                        style={{ color: primaryColor }}
                      >
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

              {/* Pelatihan & Sertifikasi Keparlemenan */}
              {courses.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#6366F1] border border-purple-200/80 text-[10px] font-mono font-semibold"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kolom 2: Penugasan Parlemen & Organisasi */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-sm font-editorial-serif font-bold text-slate-900 uppercase tracking-wide">
                  Penugasan Parlemen &amp; Pengabdian
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Rekam jejak amanah publik &amp; organisasi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {careersList && careersList.length > 0 ? (
                careersList.map((cItem: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8F9FD] border border-slate-100">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {cItem.role}
                        </div>
                        {cItem.period && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 shrink-0">
                            {cItem.period}
                          </span>
                        )}
                      </div>
                      {cItem.organization && (
                        <div
                          className="text-[10.5px] font-mono font-bold"
                          style={{ color: primaryColor }}
                        >
                          {cItem.organization}
                        </div>
                      )}
                      {cItem.description && (
                        <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal pt-0.5">
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
                    Riwayat amanah komisi, badan dewan, dan organisasi akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. DOKUMENTASI AKSI NYATA TURUN KE DAPIL ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-mono uppercase tracking-widest block font-bold"
              style={{ color: primaryColor }}
            >
              ADVOKASI &amp; AKSI LAPANGAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 mt-1">
              Dokumentasi Kinerja Turun ke Dapil
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
              Rekam jejak kehadiran nyata, penyerapan aspirasi langsung dari warga, dan monitoring fasilitas publik di daerah pemilihan.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-purple-50 border border-purple-200/80 px-3.5 py-1.5 rounded-full shrink-0 self-start">
            Aksi Nyata Lapangan
          </span>
        </div>

        {activities && activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
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
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
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
                  <div className="relative aspect-[16/10] bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 border-b border-slate-100">
                    <Camera className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                  </div>
                )}

                {/* Informasi Narasi Kinerja */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-editorial-serif font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-normal">
                        {act.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span
                      className="font-bold uppercase tracking-wider flex items-center gap-1"
                      style={{ color: primaryColor }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FD] border border-dashed border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 mx-auto flex items-center justify-center">
              <Camera className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Informasi dokumentasi aksi nyata belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 6. CALL TO ACTION ASPIRASI & KONTAK KONSTITUEN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#EDE9FE] border border-purple-200/80 p-8 sm:p-12 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 text-[#6366F1] border border-purple-200 text-[11px] font-mono font-bold uppercase tracking-widest">
              <span>SALURAN ASPIRASI RESMI KONSTITUEN</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-editorial-serif font-black text-slate-950 tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {cleanName}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Staf ahli dan sekretariat kedewanan siap mencatat pengaduan fasilitas umum, usulan bantuan sosial, perbaikan jalan, maupun rancangan kebijakan untuk diperjuangkan di parlemen.
            </p>
          </div>

          <Link
            href={getNavLinkHref('/kontak')}
            className="px-7 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shrink-0 inline-flex items-center gap-2"
          >
            <span>HUBUNGI SEKRETARIAT DEWAN</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
