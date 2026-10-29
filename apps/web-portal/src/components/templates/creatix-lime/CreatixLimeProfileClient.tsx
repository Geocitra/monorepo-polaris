'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Compass,
  HeartHandshake,
  BarChart3,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  Camera,
  MessageCircle,
  Landmark,
  BookOpen,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { LimeStarburst, LimeSparkle } from './CreatixLimeShell';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface CreatixLimeProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreatixLimeProfileClient({
  member,
  theme,
  subdomain,
}: CreatixLimeProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#84CC16',
  });

  const {
    officialFullName,
    firstName,
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

  const primaryColor = theme?.primaryHexColor || '#84CC16';
  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  const [activeTab, setActiveTab] = useState<
    'all' | 'komisi' | 'pillars' | 'education' | 'experience' | 'activities'
  >('all');

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

  // 4. Custom Stats from theme layoutSchema (HANYA jika diatur dari dashboard)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  // 5. Verified activities resolver
  const verifiedActivities =
    theme?.layoutSchema?.verifiedActivities ||
    theme?.layoutSchema?.activities ||
    member?.activities;
  const displayActivities: any[] = Array.isArray(verifiedActivities)
    ? verifiedActivities.filter((a: any) => a && a.title?.trim())
    : [];

  // 6. Career list resolver
  const customCareers =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && c.role?.trim())
      : Array.isArray(careersList) && careersList.length > 0
      ? careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  // 7. Pillar icons
  const pillarIcons = [Compass, Building2, HeartHandshake, BarChart3];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 text-left font-sans">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: MONOLITHIC WHITE HERO PROFILE CARD (CREATIX RIGEL SIGNATURE)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl bg-white text-slate-900 p-6 sm:p-10 lg:p-14 shadow-2xl border border-white/20 overflow-hidden">
        {/* Top-Right Starburst */}
        <div className="absolute top-6 right-8 hidden sm:block pointer-events-none opacity-90">
          <LimeStarburst className="w-14 h-14 text-[#84CC16]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Kolom Kiri: Foto Resmi di atas Circular Disc */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] flex items-end justify-center">
              
              {/* Circular Disc Background */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#F3F4F6] border border-slate-200 pointer-events-none z-0" />

              {/* Foto Dewan */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="max-h-[360px] sm:max-h-[420px] w-auto object-contain object-bottom drop-shadow-2xl relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Badge Verifikasi */}
              <div className="absolute top-3 right-3 z-20 bg-slate-950 text-[#84CC16] p-2.5 rounded-2xl shadow-lg border border-slate-800">
                <ShieldCheck className="w-5 h-5" />
              </div>

              {/* Floating Mandat Capsule */}
              <div className="absolute bottom-2 inset-x-2 z-20 bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/10 text-white text-center">
                <span className="text-[10px] font-bold text-[#84CC16] uppercase tracking-wider block">
                  Mandat Konstituen Resmi
                </span>
                <span className="text-xs font-black truncate block">
                  {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas, Visi Kenegaraan & Ribbon Metrik */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <Award className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Wakil Rakyat Terpilih • Fraksi {party}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}</span>
              </span>
            </div>

            {/* Nama & Gelar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#84CC16] rounded-full rotate-[20deg]" />
                <span className="w-1.5 h-4 bg-[#84CC16] rounded-full rotate-[20deg]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profil Pejabat Publik
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {officialFullName}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0 text-[#84CC16]" />
                <span>{activeCommissionName || 'Komisi Terkait DPR'}</span>
              </p>
            </div>

            {/* Visi Pengabdian dalam Kotak Khusus */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0E0B] text-white border border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#84CC16]">
                <span>Visi &amp; Komitmen Pengabdian</span>
                <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
              </div>
              <p className="text-xs sm:text-sm italic leading-relaxed text-slate-300 font-normal">
                &ldquo;{bio}&rdquo;
              </p>
            </div>

            {/* Diagnostics Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Lembaga</div>
                <div className="text-xs sm:text-sm font-black text-slate-950 mt-0.5 truncate">
                  {cleanLegislativeLevel}
                </div>
                <div className="text-[9px] text-[#84CC16] font-extrabold uppercase">Terpilih</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Penugasan</div>
                <div className="text-xs sm:text-sm font-black text-slate-950 mt-0.5 truncate">
                  {activeCommissionName || 'Komisi Terkait'}
                </div>
                <div className="text-[9px] text-slate-600 font-semibold truncate">{commissionRole}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Fraksi</div>
                <div className="text-xs sm:text-sm font-black text-slate-950 mt-0.5 truncate">
                  {party}
                </div>
                <div className="text-[9px] text-slate-600 font-semibold">Parlemen</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Status Mandat</div>
                <div className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Aktif</span>
                </div>
                <div className="text-[9px] text-[#84CC16] font-extrabold uppercase">Terverifikasi</div>
              </div>
            </div>

            {/* Dynamic Custom Stats Ribbon (Hanya jika diatur riil di dashboard) */}
            {customStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                {customStats.map((st: any, sIdx: number) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-lg sm:text-xl font-black text-slate-950">{st.value}</div>
                    <div className="text-xs font-bold text-slate-600 truncate">{st.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#84CC16]" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 border border-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: TABBED REKAM JEJAK & PILAR PENGABDIAN
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        
        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[
              { id: 'all', label: 'Semua Rekam Jejak' },
              { id: 'komisi', label: 'Komisi & AKD' },
              { id: 'pillars', label: '3 Pilar Pengabdian' },
              { id: 'education', label: 'Pendidikan Formal' },
              { id: 'experience', label: 'Karier & Organisasi' },
              { id: 'activities', label: 'Aksi Nyata Dapil' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                  activeTab === tab.id
                    ? 'bg-[#84CC16] text-slate-950 shadow-md font-black'
                    : 'bg-[#0E150E] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#84CC16] font-bold">
            <LimeSparkle className="w-4 h-4 text-[#84CC16]" />
            <span>Arsip Rekam Jejak Terverifikasi</span>
          </div>
        </div>

        {/* ─── TAB: KOMISI & AKD ─── */}
        {(activeTab === 'all' || activeTab === 'komisi') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D120D] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#84CC16] flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6 text-[#84CC16]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#84CC16] block">
                    Penugasan Komisi Parlemen
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {activeCommissionName || 'Komisi Terkait DPR'}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {commissionRole && (
                  <span className="px-3.5 py-1.5 rounded-full bg-[#84CC16] text-slate-950 text-xs font-black uppercase tracking-wider">
                    {commissionRole}
                  </span>
                )}
                {factionRole && (
                  <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                    {factionRole}
                  </span>
                )}
              </div>
            </div>

            {hasAnyAkd ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commissionScope && (
                    <div className="space-y-2 p-5 rounded-2xl bg-[#080B08] border border-white/5">
                      <div className="flex items-center gap-2 text-[#84CC16] font-bold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Ruang Lingkup &amp; Bidang Komisi</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {commissionScope}
                      </p>
                    </div>
                  )}

                  {commissionPartners && (
                    <div className="space-y-2 p-5 rounded-2xl bg-[#080B08] border border-white/5">
                      <div className="flex items-center gap-2 text-[#84CC16] font-bold text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {commissionPartners}
                      </p>
                    </div>
                  )}
                </div>

                {/* AKD Lainnya */}
                {akdBodies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Penugasan Alat Kelengkapan Dewan (AKD) Lainnya:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {akdBodies.map((body: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-2xl bg-[#080B08] border border-white/5 flex items-start gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#84CC16] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{body.name}</div>
                            {body.role && (
                              <div className="text-[11px] font-semibold text-[#84CC16] mt-0.5">
                                {body.role}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#080B08] border border-white/5 text-center space-y-2">
                <Landmark className="w-8 h-8 text-[#84CC16] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-white">
                  Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: 3 PILAR FOKUS PENGABDIAN ─── */}
        {(activeTab === 'all' || activeTab === 'pillars') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]" />
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                3 Pilar Fokus Pengabdian Legislatif
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visionPillars.map((v: any, i: number) => {
                const IconComp = pillarIcons[i % pillarIcons.length];
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center font-black">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
                        Pilar Ke-0{i + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        {v.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB: PENDIDIKAN FORMAL ─── */}
        {(activeTab === 'all' || activeTab === 'education') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D120D] border border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#84CC16] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-xs text-slate-400">Landasan keilmuan perumusan kebijakan publik</p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{edu}</h4>
                      <p className="text-xs font-semibold text-[#84CC16]">
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-300">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-[#84CC16] uppercase tracking-wide block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-slate-300"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: KARIER & ORGANISASI ─── */}
        {(activeTab === 'all' || activeTab === 'experience') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D120D] border border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#84CC16] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Penugasan Parlemen, Karier &amp; Organisasi
                </h3>
                <p className="text-xs text-slate-400">Rekam jejak amanah publik &amp; kepemimpinan</p>
              </div>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((car: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{car.role}</h4>
                      {(car.organization || car.period) && (
                        <p className="text-xs font-semibold text-[#84CC16]">
                          {car.organization ? `${car.organization} ` : ''}
                          {car.period ? `(${car.period})` : ''}
                        </p>
                      )}
                      {car.description && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-0.5 font-normal">
                          {car.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-300">
                    Informasi rekam jejak karier belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: AKSI NYATA LAPANGAN & DAPIL ─── */}
        {(activeTab === 'all' || activeTab === 'activities') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#84CC16] font-mono">
                  Dokumentasi Lapangan
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Dokumentasi Kinerja Turun ke Dapil
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/30 px-3.5 py-1 rounded-full shrink-0">
                Aksi Nyata Lapangan
              </span>
            </div>

            {displayActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map((act: any, aIdx: number) => (
                  <div
                    key={aIdx}
                    className="group rounded-3xl bg-[#0D120D] border border-white/10 overflow-hidden hover:border-[#84CC16]/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {act.photoUrl ? (
                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={act.photoUrl}
                            alt={act.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0D120D] via-transparent to-transparent pointer-events-none" />

                          {act.date && (
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-[#84CC16] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                              <Calendar className="w-3 h-3 text-[#84CC16]" />
                              <span>{act.date}</span>
                            </div>
                          )}

                          {act.location && (
                            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                              <MapPin className="w-3 h-3 text-[#84CC16]" />
                              <span className="truncate max-w-[170px]">{act.location}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-black/40 flex flex-col items-center justify-center gap-2 text-slate-500">
                          <Camera className="w-8 h-8 text-[#84CC16]/60" />
                          <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6 space-y-2">
                        <h4 className="text-base font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[11px] font-mono text-[#84CC16]">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16]" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0D120D] border border-white/10 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#84CC16] mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
                </p>
              </div>
            )}
          </div>
        )}

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: GALERI DOKUMENTASI KEGIATAN (JIKA ADA)
          ────────────────────────────────────────────────────────────────────────── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Galeri Foto Resmi Parlemen
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">
              Dokumentasi Visual
            </span>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: CALL TO ACTION ASPIRASI (DUAL PILL MOTIF)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-gradient-to-r from-[#0E150E] via-[#121C12] to-[#0A0F0A] text-white p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <LimeStarburst className="w-48 h-48 text-[#84CC16]" />
        </div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16]">
            <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Saluran Pengaduan Langsung</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Staf ahli dewan senantiasa menerima telaah persoalan lingkungan, masalah bansos, jalan rusak, pupuk subsidi, dan usulan pokok pikiran masyarakat Daerah Pemilihan {dapil}.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full bg-[#84CC16] text-slate-950 font-black text-xs sm:text-[13px] hover:bg-[#74BC12] transition-colors shadow-sm"
              >
                <span>Kirim Aspirasi Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>
            </div>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/80 border border-white/15 hover:border-[#84CC16] text-[#84CC16] font-bold text-xs uppercase tracking-wider transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#84CC16]" />
                <span>WhatsApp Hotline</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
