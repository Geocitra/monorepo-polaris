'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  Activity,
  Landmark,
  Briefcase,
  GraduationCap,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  FileCheck,
  BadgeCheck,
  Clock,
  Award,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';

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
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#A0AFB7',
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
  } = resolved;

  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  const getNavLinkHref = (path: string) => {
    return subdomain ? `/${subdomain}${path}` : path;
  };

  // AKD Resolvers
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

  // Courses & Certifications
  const courses: string[] = Array.isArray(member?.courses) ? member.courses : [];

  // Pillar icon mapping
  const pillarIcons = [Scale, Landmark, HeartHandshake, Compass];

  return (
    <div className="py-10 sm:py-16 bg-[#0D1117] text-slate-100 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* ========================================================= */}
        {/* SECTION 1: EXECUTIVE BIO CARD (METALLIC SLATE DISPLAY)   */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl bg-[#151B23]/90 border border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
          {/* Subtle liquid chrome ambient glare */}
          <div className="absolute -top-32 right-1/4 w-96 h-64 bg-gradient-to-b from-white/10 via-slate-400/5 to-transparent rounded-full blur-[90px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left: Official Portrait in Platinum Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#080B0F] border border-white/10 shadow-2xl group flex items-end justify-center">
                {/* Radial ambient background light behind photo */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20 bg-white" />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-auto max-h-[94%] object-contain object-bottom filter contrast-[1.04] select-none relative z-10 group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/default-avatar.png')) {
                      target.src = '/images/default-avatar.png';
                    }
                  }}
                />

                {/* Verified Shield Badge */}
                <div
                  className="absolute top-4 right-4 p-2.5 rounded-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 font-bold shadow-xl z-20 flex items-center justify-center"
                  title="Pejabat Publik Terverifikasi Parlemen"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.2]" />
                </div>

                {/* Bottom Mandate Chip */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-black/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 z-20">
                  <div className="text-[9.5px] font-bold uppercase tracking-widest text-[#B4BECB] font-mono">
                    Mandat Konstitusi Resmi
                  </div>
                  <div className="text-xs font-bold text-white truncate pt-0.5">
                    {cleanLegislativeLevel} • {dapil}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Executive Identity & Full Paragraphed Biography */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center px-3 py-1 rounded-[2px] bg-white/5 border border-white/15 text-slate-300 font-sans uppercase tracking-[0.2em] text-[10.5px] font-bold">
                  <span>Mandat Konstitusi Resmi • Fraksi {party}</span>
                </div>

                <h1 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white tracking-wider leading-[0.92]">
                  {officialFullName}
                </h1>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-[3px] bg-white text-slate-950 uppercase tracking-wider font-sans">
                    {cleanLegislativeLevel}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-[3px] bg-white/10 text-white border border-white/15 font-sans">
                    Fraksi {party}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-[3px] bg-white/5 text-slate-300 border border-white/10 font-sans">
                    {dapil}
                  </span>
                </div>

                {/* Metallic Chrome Divider Accent */}
                <div className="w-24 h-0.5 bg-gradient-to-r from-white via-slate-400 to-transparent pt-0.5" />
              </div>

              {/* Biography Body */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A0AFB7]">
                    Biografi &amp; Narasi Pengabdian
                  </span>
                  <div className="h-px bg-white/10 flex-1 max-w-[120px]" />
                </div>

                {bio ? (
                  <div className="space-y-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-300 font-sans font-normal">
                    {bio
                      .split('\n\n')
                      .filter(Boolean)
                      .map((para: string, idx: number) => (
                        <p key={idx} className="leading-relaxed">
                          {para.trim()}
                        </p>
                      ))}
                  </div>
                ) : headlineTagline ? (
                  <p className="text-sm sm:text-base italic leading-relaxed text-slate-300 font-sans">
                    &ldquo;{headlineTagline}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm italic leading-relaxed text-slate-500 font-sans">
                    Biografi pengabdian kenegaraan belum ditambahkan.
                  </p>
                )}
              </div>

              {/* Quick Detail Dock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#080B0F]/60 border border-white/10 flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Penugasan Komisi
                    </h4>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {activeCommissionName || 'Komisi Terkait Parlemen'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080B0F]/60 border border-white/10 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Wilayah Konstituensi
                    </h4>
                    <p className="text-xs font-bold text-white mt-0.5">{dapil}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ALAT KELENGKAPAN DEWAN (AKD)                   */}
        {/* ========================================================= */}
        <section className="space-y-6 text-left">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400 uppercase font-mono">
                Mandat &amp; Struktur Parlemen
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wider">
                PENUGASAN KOMISI &amp; ALAT KELENGKAPAN DEWAN
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-bold bg-white/5 border border-white/15 text-slate-200 uppercase tracking-wider self-start sm:self-auto shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
              <span>Mandat Terverifikasi</span>
            </span>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-6">
              {/* Main Commission Card */}
              {activeCommissionName && (
                <div className="rounded-3xl bg-[#151B23] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-[2px] text-xs font-black uppercase tracking-wider bg-white text-slate-950 font-sans">
                          Komisi Parlemen
                        </span>
                        {commissionRole && (
                          <span className="px-3 py-1 rounded-[2px] text-xs font-bold bg-white/10 text-white border border-white/15 font-sans">
                            {commissionRole}
                          </span>
                        )}
                        {factionRole && (
                          <span className="px-3 py-1 rounded-[2px] text-xs font-bold bg-white/5 text-slate-300 border border-white/10 font-sans">
                            Fraksi {party} • {factionRole}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
                        {activeCommissionName}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-200 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scope */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-slate-300" />
                        <span>Ruang Lingkup Bidang Pengawasan</span>
                      </div>
                      {commissionScope ? (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#080B0F]/70 p-4 rounded-xl border border-white/5">
                          {commissionScope}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 italic bg-[#080B0F]/70 p-4 rounded-xl border border-white/5 font-sans">
                          Ruang lingkup bidang pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>

                    {/* Partners */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                        <Users className="w-4 h-4 text-slate-300" />
                        <span>Kementerian &amp; Lembaga Mitra Kerja</span>
                      </div>
                      {commissionPartners ? (
                        <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-[#080B0F]/70 border border-white/5">
                          {commissionPartners
                            .split(/[,;\n]+/)
                            .map((pt: string, pIdx: number) => {
                              const cleanPt = pt.trim();
                              if (!cleanPt) return null;
                              return (
                                <span
                                  key={pIdx}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-200 border border-white/10 text-xs font-semibold shadow-2xs"
                                >
                                  {cleanPt}
                                </span>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic bg-[#080B0F]/70 p-4 rounded-xl border border-white/5 font-sans">
                          Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Other AKD Bodies */}
              {akdBodies.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A0AFB7]">
                      Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                    </span>
                    <div className="h-px bg-white/10 flex-1 max-w-[120px]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {akdBodies.map((akd: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-5 rounded-2xl bg-[#151B23] border border-white/10 hover:border-white/25 transition-all space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-9 h-9 rounded-xl bg-white/5 text-slate-200 border border-white/10 flex items-center justify-center shrink-0">
                            <Landmark className="w-4 h-4 text-slate-200" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-bold bg-white text-slate-950 uppercase tracking-wider shrink-0 font-sans">
                            {akd.role || 'Anggota'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {akd.name}
                          </h4>
                          {akd.notes && (
                            <p className="text-xs text-slate-400 leading-relaxed pt-1 font-sans">
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
            <div className="p-8 sm:p-12 rounded-3xl bg-[#151B23] border border-white/10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-300">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD dewan belum ditambahkan.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: TIGA PILAR FOKUS PENGABDIAN (VISION & MISSION) */}
        {/* ========================================================= */}
        <section className="space-y-6 text-left">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400 uppercase font-mono">
                Prinsip Kerja Parlemen
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wider">
                PILAR FOKUS PENGABDIAN LEGISLATIF
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              INTEGRITAS • TRANSPARANSI • KEBIJAKAN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="p-6 sm:p-7 rounded-2xl bg-[#151B23] border border-white/10 hover:border-white/25 transition-all duration-300 space-y-4 shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 group-hover:bg-white group-hover:text-slate-950 transition-colors">
                      <IconComp className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {pillar.title}
                      </div>
                      <h3 className="font-bebas text-2xl text-white tracking-wide leading-tight group-hover:text-slate-200">
                        {pillar.subtitle || pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: RIWAYAT PENDIDIKAN & KARIER PUBLIK             */}
        {/* ========================================================= */}
        <section className="space-y-6 text-left">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400 uppercase font-mono">
                Rekam Jejak Kenegaraan
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wider">
                RIWAYAT PENDIDIKAN &amp; PENGABDIAN PUBLIK
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kartu Riwayat Pendidikan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151B23] border border-white/10 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wider">
                      PENDIDIKAN AKADEMIK
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Latar belakang keilmuan &amp; kepakaran formal
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {educationList.length > 0 ? (
                    educationList.map((edu: string, idx: number) => (
                      <div key={idx} className="border-l-2 border-white/20 pl-4 py-1 space-y-0.5">
                        <div className="text-sm font-bold text-white font-sans">{edu}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          Kredensial Pendidikan Terverifikasi
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-400 font-sans">
                        Informasi riwayat pendidikan belum ditambahkan.
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Data studi dan gelar formal akan tampil di sini setelah diperbarui.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pelatihan / Kursus Keparlemenan */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded bg-white/5 text-slate-200 border border-white/10 text-[10.5px] font-semibold"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kartu Riwayat Karier & Penugasan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#151B23] border border-white/10 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-200 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-wider">
                      PENGABDIAN &amp; KARIER PUBLIK
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Alat kelengkapan dewan &amp; rekam jejak amanah
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {careersList.length > 0 ? (
                    careersList.map((cItem: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-white/20 pl-4 py-1 space-y-1">
                        <div className="text-sm font-bold text-white font-sans">{cItem.role}</div>
                        {(cItem.period || cItem.organization) && (
                          <div className="text-[11px] text-slate-300 font-mono">
                            {cItem.period ? cItem.period : ''}
                            {cItem.period && cItem.organization ? ' • ' : ''}
                            {cItem.organization ? cItem.organization : ''}
                          </div>
                        )}
                        {cItem.description && (
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                            {cItem.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-400 font-sans">
                        Informasi rekam jejak penugasan dewan belum ditambahkan.
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-300" />
                <span>Pengabdian Berkelanjutan untuk {dapil}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: DOKUMENTASI KINERJA TURUN KE DAPIL             */}
        {/* ========================================================= */}
        {activities.length > 0 && (
          <section className="space-y-6 text-left">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-[0.24em] text-slate-400 uppercase font-mono">
                  Aksi Nyata Lapangan
                </span>
                <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white tracking-wider">
                  DOKUMENTASI KINERJA TURUN KE DAPIL
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                PENYERAPAN ASPIRASI WARGA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-2xl overflow-hidden bg-[#151B23] border border-white/10 hover:border-white/25 transition-all shadow-xl group space-y-4 p-4"
                >
                  {act.photoUrl && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/40 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={act.photoUrl}
                        alt={act.title || 'Dokumentasi Dewan'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {act.date && (
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {act.date} {act.location ? `• ${act.location}` : ''}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                      {act.title}
                    </h4>
                    {act.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                        {act.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 6: QUICK CALLOUT / KONTAK ADVOKASI                */}
        {/* ========================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#151B23] via-[#1B222D] to-[#151B23] border border-white/10 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
              INGIN MENYAMPAIKAN ASPIRASI ATAU MENGUNDANG AGENDA DEWAN?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
              Tim perwakilan rakyat siap menerima aduan, dokumen usulan program daerah, maupun undangan temu konstituen di wilayah pemilihan Anda.
            </p>
          </div>
          <Link
            href={getNavLinkHref('/kontak')}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[2px] bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
          >
            <span>KIRIM ASPIRASI SEKARANG</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </Link>
        </section>

      </div>
    </div>
  );
}
