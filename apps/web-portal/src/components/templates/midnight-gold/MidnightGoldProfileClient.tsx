'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  GraduationCap,
  Briefcase,
  Camera,
  Landmark,
  Compass,
  HeartHandshake,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface MidnightGoldProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function MidnightGoldProfileClient({
  member,
  theme,
  subdomain,
}: MidnightGoldProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#FFBD39',
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

  const [activeTab, setActiveTab] = useState<'semua' | 'komisi' | 'visi' | 'pendidikan' | 'karier' | 'dokumentasi'>('semua');

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

  return (
    <div className="space-y-16 text-white font-sans">
      
      {/* ─── 1. HERO BIO CARD (SIGNATURE MIDNIGHT GOLD EXECUTIVE SUITE) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Portrait Photo in Dark Box */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/[0.1] shadow-2xl group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md p-3.5 rounded-xl border border-white/[0.1] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFBD39]">
                <ShieldCheck className="w-4 h-4 text-[#FFBD39]" />
                <span>Mandat Parlemen Terverifikasi</span>
              </div>
              <p className="text-[11px] text-white/80 truncate mt-0.5">
                {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Bio, Metadata Key-Values, Action */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FFBD39] block mb-2 font-mono">
              BIOGRAFI &amp; REKAM JEJAK RESMI
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {officialFullName}
            </h1>
            {headlineTagline && (
              <p className="text-sm sm:text-base text-[#FFBD39] font-medium italic mt-2">
                &ldquo;{headlineTagline}&rdquo;
              </p>
            )}
            <div className="text-[#999999] text-xs sm:text-sm leading-relaxed mt-4 space-y-2">
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
                  Mendedikasikan amanah pengabdian kenegaraan untuk mendampingi masyarakat di Daerah Pemilihan {dapil || 'daerah pemilihan'}. Dengan integritas, ketulusan mendengar, dan kecermatan merumuskan regulasi, beliau senantiasa hadir mengawal setiap aspirasi konstituen menuju kemakmuran bersama.
                </p>
              )}
            </div>
          </div>

          {/* 2-Column Metadata Key-Values (Real Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-xs sm:text-sm pt-2 border-t border-white/[0.08]">
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Lembaga:</span>
              <span className="text-[#999999]">{cleanLegislativeLevel}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Fraksi Parlemen:</span>
              <span className="text-[#999999]">{party}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Daerah Pemilihan:</span>
              <span className="text-[#999999]">{dapil || 'Nasional'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Penugasan Komisi:</span>
              <span className="text-[#999999]">{activeCommissionName || 'Komisi Parlemen'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Surel Parlemen:</span>
              <span className="text-[#999999] truncate">{officialEmail}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[130px]">Kanal Hotline:</span>
              <span className="text-[#999999]">{formattedPhoneNumber || 'Layanan Resmi Dewan'}</span>
            </div>
          </div>

          {/* Highlight Stats (HANYA jika ada data resmi dari theme layoutSchema) */}
          {customStats.length > 0 && (
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/[0.08]">
              {customStats.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
                  <span className="text-[10px] uppercase font-mono text-white/50 block truncate">{item.label}</span>
                  <span className="text-xl font-black text-[#FFBD39] block mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 bg-[#FFBD39] hover:bg-[#e5a823] text-black font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,189,57,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>SAMPAIKAN GAGASAN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent border border-white/25 hover:border-[#FFBD39] text-white hover:text-[#FFBD39] font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-white/[0.06] transition-all"
              >
                <Phone className="w-4 h-4 text-[#FFBD39]" />
                <span>HOTLINE WHATSAPP</span>
              </a>
            )}
          </div>

        </div>

      </div>

      {/* ─── 2. TAB SELECTION BUTTONS (SIGNATURE VEGA PILLS) ─── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-4">
        {[
          { id: 'semua', label: 'Semua Ikhtisar' },
          { id: 'komisi', label: 'Penugasan Komisi & AKD' },
          { id: 'visi', label: '3 Pilar Pengabdian' },
          { id: 'pendidikan', label: `Pendidikan (${educationList.length})` },
          { id: 'karier', label: `Karier (${customCareers.length})` },
          { id: 'dokumentasi', label: `Dokumentasi (${displayActivities.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#FFBD39] text-black shadow-[0_0_15px_rgba(255,189,57,0.3)]'
                : 'bg-[#0a0a0a] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 3. TAB CONTENT SECTIONS ─── */}
      <div className="space-y-14">
        
        {/* SECTION: PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
                <span>Penugasan Komisi &amp; Alat Kelengkapan Dewan</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#FFBD39] bg-[#FFBD39]/10 border border-[#FFBD39]/30 px-3 py-1 rounded-full shrink-0">
                Mandat Terverifikasi
              </span>
            </div>

            {hasAnyAkd ? (
              <div className="space-y-6">
                {activeCommissionName && (
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39]/60 transition-all space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFBD39] text-black">
                            Komisi Parlemen
                          </span>
                          {commissionRole && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                              {commissionRole}
                            </span>
                          )}
                          {factionRole && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFBD39]/10 text-[#FFBD39] border border-[#FFBD39]/30">
                              Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                            </span>
                          )}
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {activeCommissionName}
                        </h4>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-black border border-white/[0.1] text-[#FFBD39] flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-[#FFBD39]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
                          <ShieldCheck className="w-4 h-4 text-[#FFBD39]" />
                          <span>Ruang Lingkup Bidang Pengawasan</span>
                        </div>
                        {commissionScope ? (
                          <p className="text-xs sm:text-sm text-[#999999] leading-relaxed bg-black/60 p-4 rounded-xl border border-white/[0.06]">
                            {commissionScope}
                          </p>
                        ) : (
                          <p className="text-xs text-white/40 italic bg-black/60 p-4 rounded-xl border border-white/[0.06]">
                            Ruang lingkup bidang pengawasan belum dispesifikasikan.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
                          <Users className="w-4 h-4 text-[#FFBD39]" />
                          <span>Kementerian / Lembaga Mitra Kerja</span>
                        </div>
                        {commissionPartners ? (
                          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-black/60 border border-white/[0.06]">
                            {commissionPartners
                              .split(/[,;\n]+/)
                              .map((pt: string, pIdx: number) => {
                                const cleanPt = pt.trim();
                                if (!cleanPt) return null;
                                return (
                                  <span
                                    key={pIdx}
                                    className="px-3 py-1.5 rounded-lg bg-black border border-white/[0.1] text-xs font-semibold text-white/90"
                                  >
                                    {cleanPt}
                                  </span>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic bg-black/60 p-4 rounded-xl border border-white/[0.06]">
                            Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {akdBodies.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FFBD39] block">
                      Keanggotaan Badan &amp; AKD Lainnya:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {akdBodies.map((akd: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39]/60 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-9 h-9 rounded-xl bg-black text-[#FFBD39] border border-white/[0.1] flex items-center justify-center font-black shrink-0">
                              <Landmark className="w-4.5 h-4.5 text-[#FFBD39]" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFBD39] text-black shrink-0">
                              {akd.role || 'Anggota'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {akd.name}
                            </h4>
                            {akd.notes && (
                              <p className="text-xs text-[#999999] leading-relaxed pt-1">
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
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-2">
                <Building2 className="w-8 h-8 text-[#FFBD39] mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-white">Informasi penugasan komisi &amp; AKD belum ditambahkan</h4>
                <p className="text-xs text-[#999999] max-w-sm mx-auto">
                  Data komisi kerja dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
                </p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: 3 PILAR PENGABDIAN */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
                <span>3 Pilar Fokus Pengabdian Parlemen</span>
              </h3>
              <span className="text-xs font-mono text-white/50">Prinsip Kerja Parlemen</span>
            </div>

            {visionPillars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visionPillars.map((v: any, idx: number) => {
                  const IconComp = pillarIcons[idx % pillarIcons.length] || Compass;
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-[#FFBD39] block font-mono">0{idx + 1}</span>
                          <IconComp className="w-5 h-5 text-[#FFBD39]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#FFBD39] uppercase tracking-wider block font-mono">
                            {v.title}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                            {v.subtitle || v.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[#999999] leading-relaxed font-normal">
                          {v.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#FFBD39]">
                        <span className="font-bold uppercase tracking-wider font-mono text-[10px]">Pilar Terverifikasi</span>
                        <CheckCircle2 className="w-4 h-4 text-[#FFBD39]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-2">
                <Compass className="w-8 h-8 text-[#FFBD39] mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-white">Informasi pilar pengabdian belum ditambahkan</h4>
                <p className="text-xs text-[#999999] max-w-sm mx-auto">
                  Prinsip kerja keparlemenan akan tampil di sini setelah diperbarui melalui dashboard.
                </p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: PENDIDIKAN */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
                <span>Riwayat Pendidikan &amp; Keilmuan</span>
              </h3>
              <span className="text-xs font-mono text-white/50">Kredensial Studi Formal</span>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/[0.1] text-[#FFBD39] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-[#FFBD39]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-bold text-white">{edu}</h4>
                        <p className="text-xs font-semibold text-[#FFBD39] font-mono">
                          Pendidikan Formal Terverifikasi
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold font-mono px-3 py-1 rounded-full bg-black border border-white/[0.1] text-white/70 self-start">
                      Jenjang {idx + 1}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 sm:p-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-[#FFBD39] mx-auto opacity-80" />
                  <h4 className="text-sm font-bold text-white">Informasi riwayat pendidikan belum ditambahkan</h4>
                  <p className="text-xs text-[#999999] max-w-sm mx-auto">
                    Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {/* Pelatihan / Kursus Keparlemenan */}
              {courses.length > 0 && (
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono font-bold text-[#FFBD39] uppercase tracking-wide block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-lg bg-black border border-white/[0.1] text-xs font-mono text-white/90"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION: KARIER */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
                <span>Pengalaman Karier &amp; Advokasi Publik</span>
              </h3>
              <span className="text-xs font-mono text-white/50">Rekam Jejak Amanah</span>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((car: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/[0.1] text-[#FFBD39] flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-[#FFBD39]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-bold text-white">{car.role}</h4>
                        {(car.organization || car.period) && (
                          <p className="text-xs font-semibold text-[#FFBD39] font-mono">
                            {car.organization ? `${car.organization} ` : ''}
                            {car.period ? `(${car.period})` : ''}
                          </p>
                        )}
                        {car.description && (
                          <p className="text-xs text-[#999999] leading-relaxed pt-1 font-normal">
                            {car.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {car.period && (
                      <span className="shrink-0 text-xs font-bold font-mono px-3 py-1 rounded-full bg-black border border-white/[0.1] text-white/70 self-start">
                        {car.period}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 sm:p-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-[#FFBD39] mx-auto opacity-80" />
                  <h4 className="text-sm font-bold text-white">Informasi rekam jejak karier belum ditambahkan</h4>
                  <p className="text-xs text-[#999999] max-w-sm mx-auto">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION: DOKUMENTASI KINERJA TURUN KE DAPIL */}
        {(activeTab === 'semua' || activeTab === 'dokumentasi') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
                <span>Dokumentasi Kinerja Turun ke Dapil</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#FFBD39] bg-[#FFBD39]/10 border border-[#FFBD39]/30 px-3 py-1 rounded-full shrink-0">
                Aksi Nyata Lapangan
              </span>
            </div>

            {displayActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map((act: any, aIdx: number) => (
                  <div
                    key={aIdx}
                    className="group rounded-2xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden hover:border-[#FFBD39] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {act.photoUrl ? (
                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={act.photoUrl}
                            alt={act.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                          {act.date && (
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/[0.1] text-[#FFBD39] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                              <Calendar className="w-3 h-3 text-[#FFBD39]" />
                              <span>{act.date}</span>
                            </div>
                          )}

                          {act.location && (
                            <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                              <MapPin className="w-3.5 h-3.5 text-[#FFBD39] shrink-0" />
                              <span className="truncate">{act.location}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative aspect-[16/10] bg-black/60 flex flex-col items-center justify-center text-white/40 gap-1 p-4 border-b border-white/[0.06]">
                          <Camera className="w-8 h-8 text-[#FFBD39]/60" />
                          <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6 space-y-2">
                        <h4 className="text-base font-bold text-white group-hover:text-[#FFBD39] transition-colors line-clamp-2 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-[#999999] leading-relaxed line-clamp-3">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] mt-2 flex items-center justify-between text-[11px] font-mono text-[#FFBD39]">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFBD39]" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center space-y-2">
                <Camera className="w-8 h-8 text-[#FFBD39] mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
                <p className="text-xs text-[#999999] max-w-sm mx-auto">
                  Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
                </p>
              </div>
            )}
          </section>
        )}

      </div>

      {/* ─── 4. GALERI FOTO RESMI (JIKA ADA) ─── */}
      {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
              <span>Galeri Foto Resmi Parlemen</span>
            </h3>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ─── 5. CALL TO ACTION ASPIRASI KONSTITUEN ─── */}
      <section className="rounded-3xl bg-[#0a0a0a] border border-white/[0.1] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4 relative z-10 text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFBD39]/15 text-[#FFBD39] border border-[#FFBD39]/30 text-xs font-mono font-bold uppercase tracking-wider">
            <span>Saluran Aspirasi Langsung Konstituen</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
          </h3>
          <p className="text-xs sm:text-sm text-[#999999] leading-relaxed">
            Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 bg-[#FFBD39] hover:bg-[#e5a823] text-black font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,189,57,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>Buka Kanal Kontak &amp; Aspirasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent border border-white/25 hover:border-[#FFBD39] text-white hover:text-[#FFBD39] font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-white/[0.06] transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#FFBD39]" />
                <span>WhatsApp Hotline</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
