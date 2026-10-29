'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Compass,
  Users,
  Camera,
  ArrowRight,
  MessageCircle,
  Phone,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface QurifolioProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function QurifolioProfileClient({
  member,
  theme,
  subdomain,
}: QurifolioProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#FF6B00',
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

  const primaryColor = theme?.primaryHexColor || '#FF6B00';
  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  const [activeTab, setActiveTab] = useState<
    'semua' | 'komisi' | 'visi' | 'pendidikan' | 'karier' | 'lapangan'
  >('semua');

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

  // 4. Custom Stats from theme layoutSchema (HANYA jika diisi dari dashboard)
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

  return (
    <div className="space-y-14 sm:space-y-16">

      {/* ─── 1. DUAL TONE HERO PROFILE CARD (SIRIUS CONTRAST STYLE) ─── */}
      <section className="rounded-3xl bg-[#181818] text-white p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-2xl border border-stone-800">
        
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Orange Geometric Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-20"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Bio, Telemetry & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-[11px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Mandat Parlemen &amp; Akuntabilitas Publik</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                {officialFullName}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-stone-300">
                {cleanLegislativeLevel} • {party} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl font-normal">
              {bio}
            </p>

            {/* Mandat Telemetry Diagnostics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#222222] border border-stone-800 text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Lembaga
                </span>
                <span className="text-xs font-black text-white truncate block mt-0.5">
                  {cleanLegislativeLevel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-stone-800 text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Penugasan
                </span>
                <span className="text-xs font-black text-[#FF6B00] truncate block mt-0.5">
                  {activeCommissionName || 'Komisi Terkait'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-stone-800 text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Fraksi
                </span>
                <span className="text-xs font-black text-white truncate block mt-0.5">
                  {party}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#222222] border border-stone-800 text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Status
                </span>
                <span className="text-xs font-black text-emerald-400 truncate block mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Aktif</span>
                </span>
              </div>
            </div>

            {/* Dynamic Custom Stats Ribbon (Hanya jika diatur riil di dashboard) */}
            {customStats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-800">
                {customStats.map((st: any, sIdx: number) => (
                  <div key={sIdx} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-white text-[#181818] flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#181818] fill-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {st.value}
                      </span>
                      <span className="text-xs font-semibold text-stone-400 truncate">
                        {st.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e65c00] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#FF6B00] text-[#FF6B00] font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF6B00]" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>

          </div>

          {/* Right Column: Photo Cutout with Orange Doodle Rays & Wavy Accent */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative max-w-sm w-full">
              
              {/* Playful Orange Doodle Rays (Above head) */}
              <div className="absolute -top-6 right-16 z-20 text-[#FF6B00] flex gap-1 select-none pointer-events-none">
                <span className="inline-block transform -rotate-12 text-xl font-black">/</span>
                <span className="inline-block transform rotate-0 text-xl font-black">|</span>
                <span className="inline-block transform rotate-12 text-xl font-black">\</span>
              </div>

              {/* Playful Orange Wavy Lines Accent (Bottom right) */}
              <div className="absolute bottom-12 -right-4 z-20 text-[#FF6B00] select-none pointer-events-none space-y-1">
                <div className="w-8 h-1 rounded-full bg-[#FF6B00] transform rotate-3" />
                <div className="w-10 h-1 rounded-full bg-[#FF6B00] transform -rotate-3" />
              </div>

              {/* Cutout Image Frame */}
              <div className="relative z-10 overflow-hidden rounded-2xl bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center min-h-[360px] sm:min-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-auto max-h-[440px] object-contain object-bottom filter grayscale contrast-115 drop-shadow-2xl select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/default-avatar.png')) {
                      target.src = '/images/default-avatar.png';
                    }
                  }}
                />
              </div>

              {/* Official Credential Pill */}
              <div className="absolute -bottom-4 left-4 right-4 z-20 bg-white text-[#161616] p-3 rounded-xl shadow-xl border border-stone-200 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] block">
                  Mandat Konstitusi Resmi
                </span>
                <span className="font-extrabold text-xs text-[#161616] block truncate">
                  {officialFullName}
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. TAB FILTER BUTTONS ─── */}
      <section className="space-y-10">
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
          {[
            { id: 'semua', label: 'Semua Rekam Jejak' },
            { id: 'komisi', label: 'Komisi & AKD' },
            { id: 'visi', label: '3 Pilar Pengabdian' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Karier & Organisasi' },
            { id: 'lapangan', label: 'Aksi Nyata Dapil' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
                activeTab === tab.id
                  ? 'bg-[#161616] text-white shadow-md'
                  : 'bg-white text-stone-600 hover:text-black hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── 3. PENUGASAN KOMISI & AKD ─── */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Tugas Komisi &amp; Alat Kelengkapan Dewan (AKD)</span>
            </h3>

            {hasAnyAkd ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#161616] text-[#FF6B00] flex items-center justify-center shrink-0">
                      <Landmark className="w-6 h-6 text-[#FF6B00]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] block">
                        Penugasan Komisi Parlemen
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-[#161616]">
                        {activeCommissionName || 'Komisi DPR'}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {commissionRole && (
                      <span className="px-3.5 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-black uppercase tracking-wider">
                        {commissionRole}
                      </span>
                    )}
                    {factionRole && (
                      <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-[#161616] border border-stone-200 text-xs font-bold">
                        {factionRole}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commissionScope && (
                    <div className="space-y-2 p-5 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2 text-[#FF6B00] font-black text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Ruang Lingkup &amp; Bidang Komisi</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-normal">
                        {commissionScope}
                      </p>
                    </div>
                  )}

                  {commissionPartners && (
                    <div className="space-y-2 p-5 rounded-xl bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2 text-[#FF6B00] font-black text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-normal">
                        {commissionPartners}
                      </p>
                    </div>
                  )}
                </div>

                {/* AKD Lainnya */}
                {akdBodies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#161616] block">
                      Penugasan Alat Kelengkapan Dewan (AKD) Lainnya:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {akdBodies.map((body: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-[#161616]">{body.name}</div>
                            {body.role && (
                              <div className="text-[11px] font-semibold text-[#FF6B00] mt-0.5">
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
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                <Landmark className="w-8 h-8 text-[#FF6B00] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#161616]">
                  Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── 4. PILAR VISI PENGABDIAN (TRIFUNGSI) ─── */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>3 Pilar Fokus Pengabdian Legislatif</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visionPillars.map((v: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm hover:border-[#FF6B00] transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-black text-base">
                    0{i + 1}
                  </div>
                  <h4 className="font-extrabold text-base text-[#161616]">
                    {v.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 5. RIWAYAT PENDIDIKAN AKADEMIK & PELATIHAN ─── */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Riwayat Pendidikan Akademik &amp; Pelatihan</span>
            </h3>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#FF6B00] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#161616] text-[#FF6B00] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6 text-[#FF6B00]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-[#161616]">
                          {edu}
                        </h4>
                        <p className="text-xs font-semibold text-[#FF6B00]">
                          Kredensial Pendidikan Terverifikasi
                        </p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-lg bg-stone-100 text-[#161616] font-black text-xs self-start sm:self-auto shrink-0 border border-stone-200">
                      Gelar Formal
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-[#FF6B00] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-[#161616]">
                    Informasi riwayat pendidikan belum ditambahkan
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF6B00]">
                    <Award className="w-4 h-4" />
                    <span>Pelatihan &amp; Sertifikasi Keparlemenan:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800"
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

        {/* ─── 6. KARIER & PENGABDIAN PUBLIK ─── */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Karier &amp; Rekam Pengabdian Publik</span>
            </h3>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#FF6B00] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 font-black text-base">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-[#161616]">
                          {c.role}
                        </h4>
                        {(c.organization || c.period) && (
                          <p className="text-xs font-bold text-[#FF6B00]">
                            {c.organization ? `${c.organization} ` : ''}
                            {c.period ? `(${c.period})` : ''}
                          </p>
                        )}
                        {c.description && (
                          <p className="text-xs text-stone-600 pt-1 leading-relaxed font-normal">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {c.period && (
                      <span className="px-3.5 py-1.5 rounded-lg bg-[#161616] text-white font-black text-xs self-start sm:self-auto shrink-0">
                        {c.period}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-[#FF6B00] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-[#161616]">
                    Informasi rekam jejak karier belum ditambahkan
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Riwayat jabatan publik, institusi parlemen, dan organisasi kemasyarakatan akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 7. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI NYATA LAPANGAN) ─── */}
        {(activeTab === 'semua' || activeTab === 'lapangan') && (
          <div className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                <span>Dokumentasi Kinerja Turun ke Dapil</span>
              </h3>
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full self-start sm:self-auto">
                Aksi Nyata Lapangan
              </span>
            </div>

            {displayActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map((act: any, aIdx: number) => (
                  <div
                    key={aIdx}
                    className="group rounded-2xl bg-white border border-stone-200 overflow-hidden hover:border-[#FF6B00] transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {act.photoUrl ? (
                        <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={act.photoUrl}
                            alt={act.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {act.date && (
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#FF6B00] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              <Calendar className="w-3 h-3 text-[#FF6B00]" />
                              <span>{act.date}</span>
                            </div>
                          )}

                          {act.location && (
                            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              <MapPin className="w-3 h-3 text-[#FF6B00]" />
                              <span className="truncate max-w-[150px]">{act.location}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-stone-100 flex flex-col items-center justify-center gap-2 text-stone-400">
                          <Camera className="w-8 h-8 text-[#FF6B00]/60" />
                          <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                        </div>
                      )}

                      <div className="p-5 space-y-2 text-left">
                        <h4 className="text-base font-bold text-[#161616] group-hover:text-[#FF6B00] transition-colors line-clamp-2 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 font-normal">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] text-[#FF6B00] font-bold">
                      <span className="uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#FF6B00] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#161616]">
                  Informasi dokumentasi kegiatan belum ditambahkan
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Dokumentasi aksi nyata dan kunjungan konstituen ke daerah pemilihan akan tampil di sini setelah diperbarui.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── 8. GALERI FOTO RESMI (JIKA TERSEDIA) ─── */}
        {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
          <div className="space-y-4 pt-2 text-left">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Galeri Foto Resmi Parlemen</span>
            </h3>
            <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
          </div>
        )}

        {/* ─── 9. CALL TO ACTION SALURAN ASPIRASI KONSTITUEN ─── */}
        <section className="rounded-3xl bg-[#181818] text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-stone-800 text-left">
          {/* Subtle Orange Asterisk in Background */}
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-64 h-64 opacity-10 pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FF6B00]">
              <g fill="#FF6B00">
                <rect x="41.75" y="4" width="16.5" height="92" />
                <rect x="4" y="41.75" width="92" height="16.5" />
                <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
                <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
              </g>
            </svg>
          </div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-[11px] font-black uppercase tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#e65c00] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#FF6B00] text-[#FF6B00] font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF6B00]" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>
          </div>
        </section>

      </section>

    </div>
  );
}
