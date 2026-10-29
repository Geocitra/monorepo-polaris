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
  FileText,
  Clock,
  HeartHandshake,
  Camera,
  MessageCircle,
  Landmark,
  FileCheck,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface WarmPortfolioProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function WarmPortfolioProfileClient({
  member,
  theme,
  subdomain,
}: WarmPortfolioProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#F59E0B',
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

  const primaryColor = theme?.primaryHexColor || '#F59E0B';
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

  return (
    <div className="space-y-12 text-left font-sans">
      
      {/* ─── 1. HERO PROFILE CARD WITH CHAMFERED CORNERS ─── */}
      <div
        className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-6 sm:p-10 transition-all"
        style={{
          clipPath: 'polygon(24px 0%, 100% 0%, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0% 100%, 0% 24px)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          
          {/* Portrait with Warm Frame */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden bg-stone-100 border-2 border-stone-200/90 shadow-inner group flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181311]/70 via-transparent to-transparent pointer-events-none" />
              
              {/* Verified Mandate Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  <span>Mandat Resmi Terverifikasi</span>
                </div>
                <p className="text-[11px] font-semibold text-stone-600 truncate mt-0.5">
                  {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </p>
              </div>
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/70">
                <span>{party}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-stone-950 tracking-tight leading-tight">
                {officialFullName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-stone-600 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Mewakili Amanah Rakyat: {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}</span>
              </p>
            </div>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal">
              {bio}
            </p>

            {/* Mandate Diagnostics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Lembaga</span>
                <span className="font-bold text-xs sm:text-sm text-stone-900 mt-0.5 block truncate">
                  {cleanLegislativeLevel}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Penugasan</span>
                <span className="font-bold text-xs sm:text-sm text-[#F59E0B] mt-0.5 block truncate">
                  {activeCommissionName || 'Komisi Terkait'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Fraksi</span>
                <span className="font-bold text-xs sm:text-sm text-stone-900 mt-0.5 block truncate">
                  {party}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Status</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-600 mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Aktif</span>
                </span>
              </div>
            </div>

            {/* Dynamic Custom Stats (HANYA jika ada di dashboard) */}
            {customStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
                {customStats.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 text-center"
                  >
                    <p className="font-serif font-black text-xl text-stone-950">{m.value}</p>
                    <p className="text-[11px] font-bold text-stone-700 truncate">{m.label}</p>
                    {m.note && <p className="text-[10px] text-stone-500 truncate">{m.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#181311] text-white font-bold text-xs shadow-md hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Sampaikan Aspirasi ke Dewan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FAF7F2] text-stone-800 font-bold text-xs border border-stone-300 hover:bg-stone-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TAB SELECTION BUTTONS ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        {[
          { id: 'semua', label: 'Semua Ikhtisar' },
          { id: 'komisi', label: 'Mandat & Komisi (AKD)' },
          { id: 'visi', label: '3 Pilar Pengabdian' },
          { id: 'pendidikan', label: 'Riwayat Pendidikan' },
          { id: 'karier', label: 'Karier & Pengalaman' },
          { id: 'lapangan', label: 'Aksi Nyata Dapil' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all select-none ${
              activeTab === tab.id
                ? 'bg-[#181311] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 3. TAB CONTENT SECTIONS ─── */}
      <div className="space-y-12">
        
        {/* SECTION: MANDAT & KOMISI (AKD) */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Penugasan Komisi &amp; Alat Kelengkapan Dewan (AKD)
              </h3>
            </div>

            {hasAnyAkd ? (
              <div
                className="p-6 sm:p-8 rounded-3xl bg-[#181311] text-white border border-stone-800 shadow-xl space-y-6"
                style={{
                  clipPath: 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
                      <Landmark className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] block">
                        Penugasan Komisi Parlemen
                      </span>
                      <h4 className="text-lg sm:text-xl font-serif font-bold text-white">
                        {activeCommissionName || 'Komisi DPR'}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {commissionRole && (
                      <span className="px-3.5 py-1.5 rounded-full bg-[#F59E0B] text-stone-950 text-xs font-bold uppercase tracking-wider">
                        {commissionRole}
                      </span>
                    )}
                    {factionRole && (
                      <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-stone-300 border border-white/10 text-xs font-semibold">
                        {factionRole}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commissionScope && (
                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Ruang Lingkup &amp; Bidang Komisi</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed font-light">
                        {commissionScope}
                      </p>
                    </div>
                  )}

                  {commissionPartners && (
                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed font-light">
                        {commissionPartners}
                      </p>
                    </div>
                  )}
                </div>

                {/* AKD Lainnya */}
                {akdBodies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block font-mono">
                      Penugasan AKD Tambahan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {akdBodies.map((body: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{body.name}</div>
                            {body.role && (
                              <div className="text-[11px] font-semibold text-[#F59E0B] mt-0.5">
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
              <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
                <Landmark className="w-8 h-8 text-[#F59E0B] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-stone-900">
                  Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan.
                </p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: VISI & MISI (3 PILAR PENGABDIAN) */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                3 Pilar Fokus Pengabdian Legislatif
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {visionPillars.map((v: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3"
                  style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold">
                    0{i + 1}
                  </div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    {v.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: RIWAYAT PENDIDIKAN */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Riwayat Pendidikan Akademik &amp; Pelatihan
              </h3>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-[#F59E0B] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base sm:text-lg text-stone-950">
                          {edu}
                        </h4>
                        <p className="text-xs font-semibold text-[#F59E0B]">
                          Kredensial Pendidikan Terverifikasi
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-3.5 py-1 rounded-full bg-[#FAF7F2] text-stone-700 border border-stone-200 self-start">
                      Gelar Formal
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-[#F59E0B] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-stone-900">
                    Informasi riwayat pendidikan belum ditambahkan
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                    <Award className="w-4 h-4" />
                    <span>Pelatihan &amp; Sertifikasi Keparlemenan:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-stone-200 text-xs font-semibold text-stone-800"
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

        {/* SECTION: KARIER & PENGALAMAN */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Pengalaman Karier &amp; Advokasi Publik
              </h3>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((car: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-[#F59E0B] flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-base sm:text-lg text-stone-950">
                          {car.role}
                        </h4>
                        {(car.organization || car.period) && (
                          <p className="text-xs font-semibold text-[#F59E0B]">
                            {car.organization ? `${car.organization} ` : ''}
                            {car.period ? `(${car.period})` : ''}
                          </p>
                        )}
                        {car.description && (
                          <p className="text-xs text-stone-600 leading-relaxed pt-1 font-normal">
                            {car.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {car.period && (
                      <span className="shrink-0 text-xs font-bold px-3.5 py-1 rounded-full bg-[#FAF7F2] text-stone-700 border border-stone-200 self-start">
                        {car.period}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-[#F59E0B] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-stone-900">
                    Informasi rekam jejak karier belum ditambahkan
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION: DOKUMENTASI KINERJA TURUN KE DAPIL */}
        {(activeTab === 'semua' || activeTab === 'lapangan') && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                  Dokumentasi Kinerja Turun ke Dapil
                </h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full self-start sm:self-auto">
                Aksi Nyata Lapangan
              </span>
            </div>

            {displayActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map((act: any, aIdx: number) => (
                  <div
                    key={aIdx}
                    className="group rounded-3xl bg-white border border-stone-200/90 overflow-hidden hover:border-[#F59E0B] transition-all shadow-sm flex flex-col justify-between"
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
                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#F59E0B] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              <Calendar className="w-3 h-3 text-[#F59E0B]" />
                              <span>{act.date}</span>
                            </div>
                          )}

                          {act.location && (
                            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              <MapPin className="w-3 h-3 text-[#F59E0B]" />
                              <span className="truncate max-w-[150px]">{act.location}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-[#FAF7F2] flex flex-col items-center justify-center gap-2 text-stone-400">
                          <Camera className="w-8 h-8 text-[#F59E0B]/60" />
                          <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                        </div>
                      )}

                      <div className="p-5 space-y-2 text-left">
                        <h4 className="font-serif text-base font-bold text-stone-950 group-hover:text-[#F59E0B] transition-colors line-clamp-2 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 font-normal">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] text-[#F59E0B] font-bold">
                      <span className="uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#F59E0B] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-stone-900">
                  Informasi dokumentasi kegiatan belum ditambahkan
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Dokumentasi aksi nyata dan kunjungan konstituen ke daerah pemilihan akan tampil di sini setelah diperbarui.
                </p>
              </div>
            )}
          </section>
        )}

        {/* SECTION: GALERI FOTO RESMI (JIKA TERSEDIA) */}
        {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Galeri Foto Resmi Parlemen
              </h3>
            </div>
            <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
          </section>
        )}

        {/* SECTION: CALL TO ACTION SALURAN ASPIRASI */}
        <section
          className="rounded-3xl bg-[#181311] text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-stone-800"
          style={{
            clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
          }}
        >
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-bold uppercase tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#F59E0B] hover:bg-[#d97706] text-stone-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/10 hover:border-[#F59E0B] text-[#F59E0B] font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
