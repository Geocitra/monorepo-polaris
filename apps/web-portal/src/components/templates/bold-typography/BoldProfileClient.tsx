'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  ArrowRight,
  Quote,
  CheckCircle2,
  FileText,
  ExternalLink,
  Sparkles,
  Landmark,
  Scale,
  Compass,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { formatDateIndonesian } from '@/lib/utils';

interface BoldProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function BoldProfileClient({ member, theme, subdomain }: BoldProfileClientProps) {
  // 1. Resolve dynamic data from member & theme (sama persis seperti template profile polaris utama)
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#DC2626',
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

  // 3. Courses & Certifications
  const courses: string[] = Array.isArray(member?.courses)
    ? member.courses.filter(Boolean)
    : typeof member?.courses === 'string'
    ? member.courses.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // 4. Stats Counters from theme layoutSchema (tanpa data dummy fallback)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  // 5. Split name for signature stacked Bebas Neue style
  function getStackedName(fullName?: string): [string, string] {
    if (!fullName) return ['WAKIL', 'RAKYAT'];
    const clean = fullName
      .replace(/^(dr\.|ir\.|drs\.|dra\.|h\.|hj\.|prof\.)\s+/gi, '')
      .replace(/,\s*(m\.sc|s\.t|s\.e|m\.m|s\.h|m\.h|s\.ip|m\.ip|ph\.d|m\.a).*$/gi, '')
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [clean, ''];
    if (parts.length === 2) return [parts[0], parts[1]];
    return [parts[0], parts.slice(1).join(' ')];
  }

  const [firstName, lastName] = getStackedName(officialFullName);

  // 6. Active tab for rekam jejak
  const [activeTab, setActiveTab] = useState<'pendidikan' | 'karier' | 'diklat'>('pendidikan');

  // Helper parser for Education
  function parseEduItem(item: any, idx: number) {
    if (typeof item === 'string') {
      const match = item.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return {
          degree: match[2],
          institution: match[1],
          period: `Jenjang ${idx + 1}`,
          thesis: '',
        };
      }
      return {
        degree: item,
        institution: 'Lembaga Pendidikan Resmi',
        period: `Jenjang ${idx + 1}`,
        thesis: '',
      };
    }
    return {
      degree: item.degree || item.major || item.title || 'Pendidikan',
      institution: item.institution || item.school || item.university || '',
      period: item.period || item.year || `Jenjang ${idx + 1}`,
      thesis: item.thesis || item.desc || item.description || '',
    };
  }

  // Helper parser for Career
  function parseCareerItem(item: any, idx: number) {
    if (typeof item === 'string') {
      return {
        role: item,
        entity: 'Instansi / Lembaga',
        period: `Amanah ${idx + 1}`,
        desc: '',
      };
    }
    return {
      role: item.role || item.position || item.title || 'Amanah Pengabdian',
      entity: item.entity || item.institution || item.company || item.organization || '',
      period: item.period || item.year || `Periode ${idx + 1}`,
      desc: item.desc || item.description || '',
    };
  }

  // Helper parser for Courses / Diklat
  function parseCourseItem(item: any, idx: number) {
    if (typeof item === 'string') {
      return {
        title: item,
        organizer: 'Lembaga Penyelenggara Resmi',
        period: `Sertifikasi ${idx + 1}`,
      };
    }
    return {
      title: item.title || item.name || 'Pelatihan / Diklat',
      organizer: item.organizer || item.institution || item.entity || '',
      period: item.period || item.year || `Pelatihan ${idx + 1}`,
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* ─── SECTION 1: EXECUTIVE BIO CUTOUT HERO ─── */}
      <section className="rounded-3xl bg-[#0C0C0C] border border-white/10 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Ambient Red Glow in Card */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Kolom Kiri: Foto Pejabat dengan Ambient Glow */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#161616] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              {/* Background ambient lighting behind person */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40"
                style={{ backgroundColor: primaryColor }}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-700 relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Verified Parliamentary Badge */}
              <div
                className="absolute top-3.5 right-3.5 p-2 rounded-xl text-white shadow-xl z-20 border border-white/20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              {/* Bottom Label Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl p-3 z-20">
                <div
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{ color: primaryColor }}
                >
                  MANDAT KONSTITUSIONAL
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {cleanLegislativeLevel} • {dapil ? `DAPIL ${dapil.toUpperCase()}` : party}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas, Stacked Name & Narasi */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="font-script text-3xl sm:text-4xl text-rose-200/90 font-normal block leading-tight">
                Hello, I&apos;m
              </span>
              <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[0.88]">
                <span className="block">{firstName}</span>
                {lastName && (
                  <span className="block" style={{ color: primaryColor }}>
                    {lastName}
                  </span>
                )}
              </h1>
            </div>

            {/* Subtitle Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <span
                className="px-3 py-1 rounded-md font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {cleanLegislativeLevel} • {party}
              </span>
              {dapil && (
                <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5 font-bold uppercase">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>DAPIL {dapil}</span>
                </span>
              )}
              {activeCommissionName && (
                <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-bold uppercase tracking-wider">
                  {activeCommissionName}
                </span>
              )}
            </div>

            {/* Headline Tagline */}
            {headlineTagline && (
              <p
                className="font-bold text-xs sm:text-sm tracking-wider uppercase leading-snug"
                style={{ color: primaryColor }}
              >
                {headlineTagline}
              </p>
            )}

            {/* Biography Paragraph */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
              <p>
                <strong className="text-white font-bold">{officialFullName}</strong> {bio}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <span>KIRIM ASPIRASI RESMI</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#rekam-jejak"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>LIHAT REKAM JEJAK</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: MASSIVE STATS COUNTERS (HANYA JIKA ADA DATA RESMI) ─── */}
      {customStats.length > 0 && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {customStats.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-colors space-y-2 group"
            >
              <div
                className="font-bebas text-4xl sm:text-6xl font-black leading-none group-hover:scale-105 transition-transform"
                style={{ color: primaryColor }}
              >
                {item.value}
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-white uppercase leading-tight">
                {item.label}
                <br />
                <span className="text-slate-500 font-normal">{item.sublabel || item.sub || ''}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ─── SECTION 3: PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      {hasAnyAkd && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span>PENUGASAN KOMISI &amp; ALAT KELENGKAPAN DEWAN</span>
            </span>
            <span className="text-red-400 font-bold" style={{ color: primaryColor }}>
              MANDAT KENEGARAAN RESMI
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kartu Komisi Utama */}
            {activeCommissionName && (
              <div
                className={`${
                  factionRole || akdBodies.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
                } p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-colors space-y-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 block w-fit"
                      style={{ color: primaryColor }}
                    >
                      PENUGASAN KOMISI
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                      {activeCommissionName}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Jabatan:{' '}
                      <span className="text-white font-bold">{commissionRole}</span>
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5"
                    style={{ color: primaryColor }}
                  >
                    <Landmark className="w-6 h-6" />
                  </div>
                </div>

                {commissionScope && (
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                      Ruang Lingkup Tugas:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {commissionScope}
                    </p>
                  </div>
                )}

                {commissionPartners && (
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                      Mitra Kerja Kementerian / Lembaga:
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {commissionPartners}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Kartu Fraksi & Badan AKD */}
            {(factionRole || akdBodies.length > 0) && (
              <div className={`${activeCommissionName ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-6`}>
                {factionRole && (
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-colors space-y-3">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 block w-fit"
                      style={{ color: primaryColor }}
                    >
                      MANDAT FRAKSI
                    </span>
                    <h4 className="text-base font-bold text-white uppercase">{factionRole}</h4>
                    <p className="text-xs text-slate-400">
                      Fraksi {party} di {cleanLegislativeLevel}
                    </p>
                  </div>
                )}

                {akdBodies.length > 0 && (
                  <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-colors space-y-4">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 block w-fit"
                      style={{ color: primaryColor }}
                    >
                      BADAN ALAT KELENGKAPAN DEWAN
                    </span>
                    <div className="space-y-2.5 pt-1">
                      {akdBodies.map((body: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
                        >
                          <span className="text-white font-bold">{body.name}</span>
                          <span className="font-semibold" style={{ color: primaryColor }}>
                            {body.role || 'Anggota'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── SECTION 4: PILAR KOMITMEN KERAKYATAN & VISI PERJUANGAN ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>PILAR KOMITMEN &amp; VISI PERJUANGAN</span>
          </span>
          {dapil && (
            <span className="font-mono hidden sm:inline-block" style={{ color: primaryColor }}>
              DAPIL {dapil.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visionPillars.map((pillar: any, idx: number) => {
            const stepNum = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all duration-300 space-y-4 relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold flex items-center justify-between">
                    <span
                      className="text-2xl sm:text-3xl font-bebas tracking-normal"
                      style={{ color: primaryColor }}
                    >
                      {stepNum}
                    </span>
                    <span
                      className="w-8 h-[2px] group-hover:w-14 transition-all"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>

                  {pillar.subtitle && (
                    <div
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      {pillar.subtitle}
                    </div>
                  )}

                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[10.5px] font-mono text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Komitmen Teruji</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 5: TABBED REKAM JEJAK (PENDIDIKAN, KARIER, DIKLAT/SERTIFIKASI) ─── */}
      <section id="rekam-jejak" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="text-xs font-mono uppercase tracking-widest font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>REKAM JEJAK &amp; DEDIKASI KENEGARAAN</span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl bg-[#111111] border border-white/10 self-start">
            {[
              { id: 'pendidikan', label: `Pendidikan (${educationList.length})`, icon: GraduationCap },
              { id: 'karier', label: `Karier (${careersList.length})`, icon: Briefcase },
              { id: 'diklat', label: `Diklat (${courses.length})`, icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {activeTab === 'pendidikan' &&
            (educationList.length > 0 ? (
              educationList.map((item: any, idx: number) => {
                const parsed = parseEduItem(item, idx);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold" style={{ color: primaryColor }}>
                        {parsed.period}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase leading-snug">
                        {parsed.degree}
                      </h4>
                      <div className="text-xs text-slate-300 font-medium">{parsed.institution}</div>
                    </div>
                    {parsed.thesis && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                        {parsed.thesis}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                Belum ada data riwayat pendidikan formal yang ditambahkan.
              </div>
            ))}

          {activeTab === 'karier' &&
            (careersList.length > 0 ? (
              careersList.map((item: any, idx: number) => {
                const parsed = parseCareerItem(item, idx);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold" style={{ color: primaryColor }}>
                        {parsed.period}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase leading-snug">
                        {parsed.role}
                      </h4>
                      <div className="text-xs text-slate-300 font-medium">{parsed.entity}</div>
                    </div>
                    {parsed.desc && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                        {parsed.desc}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                Belum ada data riwayat karier dan rekam jejak pengabdian yang ditambahkan.
              </div>
            ))}

          {activeTab === 'diklat' &&
            (courses.length > 0 ? (
              courses.map((item: any, idx: number) => {
                const parsed = parseCourseItem(item, idx);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold" style={{ color: primaryColor }}>
                        {parsed.period}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase leading-snug">
                        {parsed.title}
                      </h4>
                      <div className="text-xs text-slate-300 font-medium">{parsed.organizer}</div>
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                      Sertifikasi Kompetensi
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                Belum ada data pendidikan non-formal atau diklat yang ditambahkan.
              </div>
            ))}
        </div>
      </section>

      {/* ─── SECTION 6: RED QUOTE CARD (SIGNATURE BOLD TYPOGRAPHY) ─── */}
      <section>
        <div
          className="p-8 sm:p-12 rounded-3xl text-white space-y-6 shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          <Quote className="w-12 h-12 text-white/30" />
          <p className="text-lg sm:text-2xl font-serif italic leading-relaxed font-semibold max-w-4xl">
            &ldquo;
            {member?.quote ||
              theme?.officialQuote ||
              'Amanah rakyat bukanlah sekadar retorika mimbar, melainkan mandat nyata yang harus diwujudkan dalam setiap rupiah alokasi anggaran, setiap butir pasal undang-undang, dan keadilan yang dirasakan langsung oleh warga.'}
            &rdquo;
          </p>

          <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="font-bold text-sm block uppercase tracking-wider">{officialFullName}</span>
              <span className="text-white/80 text-xs">
                {cleanLegislativeLevel} • Fraksi {party} • Dapil {dapil}
              </span>
            </div>
            <Link
              href={getNavLinkHref('/kontak')}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-black/80 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto"
            >
              SALURKAN ASPIRASI ANDA →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: DOKUMENTASI AKSI NYATA DI LAPANGAN ─── */}
      {activities && activities.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span>DOKUMENTASI AKSI NYATA &amp; KUNJUNGAN KERJA</span>
            </span>
            <span className="text-slate-500 font-mono">PARLEMEN BEKERJA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activities.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="group rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photoUrl || item.imageUrl || '/images/default-article.jpg'}
                    alt={item.title || 'Aksi Nyata'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/images/default-article.jpg')) {
                        target.src = '/images/default-article.jpg';
                      }
                    }}
                  />
                  {item.category && (
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{item.date ? formatDateIndonesian(item.date) : `Aksi #${idx + 1}`}</span>
                    <span className="font-bold" style={{ color: primaryColor }}>
                      0{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors uppercase font-mono line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.caption ||
                      item.description ||
                      'Dokumentasi pengawalan aspirasi warga secara langsung.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
