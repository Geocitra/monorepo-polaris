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
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle2,
  Award,
  MessageCircle,
  Landmark,
  BookOpen,
  Users,
  Camera,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface StudioEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function StudioEditorialProfileClient({
  member,
  theme,
  subdomain,
}: StudioEditorialProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#252422',
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
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-16 text-left font-sans">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO BIOGRAPHY CARD (STUDIO EDITORIAL SPLIT)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-stone-300 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          
          {/* Kolom Kiri: Foto Resmi dalam Frame Plaster Hangat */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#DDD7CD] border-2 border-stone-300 shadow-lg group flex items-end justify-center">
              {/* Daylight Soft Radial Highlight */}
              <div className="absolute inset-0 bg-gradient-to-bl from-white/45 via-transparent to-stone-900/10 pointer-events-none" />

              {/* Diagonal Window Shadow Effect */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(135deg, rgba(65,55,45,0.2) 0px, rgba(65,55,45,0.2) 80px, transparent 80px, transparent 180px)',
                  filter: 'blur(25px)',
                }}
              />

              {/* Foto Dewan */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-contain object-bottom filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500 relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Badge Pejabat Terverifikasi */}
              <div className="absolute top-4 right-4 z-20 bg-stone-950 text-white p-2 rounded-xl shadow-md">
                <ShieldCheck className="w-5 h-5 text-stone-200" />
              </div>

              {/* Floating Mandat Card */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/80">
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 block">
                  Mandat Konstituen Resmi
                </span>
                <span className="text-xs font-black text-stone-900 truncate block">
                  {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas & Visi Pernyataan */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                <Award className="w-3.5 h-3.5 text-stone-700" />
                <span>Wakil Rakyat Terpilih • Fraksi {party}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>{dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}</span>
              </span>
            </div>

            {/* Nama Lengkap & Gelar */}
            <div className="space-y-1.5">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight leading-tight">
                {officialFullName}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-stone-600 flex items-center gap-2 uppercase tracking-wide">
                <Building2 className="w-4 h-4 shrink-0 text-stone-700" />
                <span>{activeCommissionName || 'Komisi Terkait DPR'}</span>
              </p>
            </div>

            {/* Visi Pengabdian dalam Serif Blockquote */}
            <div className="p-6 rounded-2xl bg-[#F9F8F5] border-l-4 border-stone-950 border-y border-r border-stone-200 text-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500 block">
                VISI PENGABDIAN KENEGARAAN
              </span>
              <p className="font-serif text-base sm:text-lg italic text-stone-900 leading-relaxed font-normal">
                &ldquo;{bio}&rdquo;
              </p>
            </div>

            {/* Diagnostics Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Lembaga</div>
                <div className="font-serif text-base sm:text-lg font-bold text-stone-950 mt-0.5 truncate">
                  {cleanLegislativeLevel}
                </div>
                <div className="text-[9px] text-stone-600 font-semibold">Terpilih</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Penugasan</div>
                <div className="font-serif text-base sm:text-lg font-bold text-stone-950 mt-0.5 truncate">
                  {activeCommissionName || 'Komisi Terkait'}
                </div>
                <div className="text-[9px] text-stone-600 font-semibold truncate">{commissionRole}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Fraksi</div>
                <div className="font-serif text-base sm:text-lg font-bold text-stone-950 mt-0.5 truncate">
                  {party}
                </div>
                <div className="text-[9px] text-stone-600 font-semibold">Parlemen</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Status Mandat</div>
                <div className="font-serif text-base sm:text-lg font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Aktif</span>
                </div>
                <div className="text-[9px] text-stone-600 font-semibold">Terverifikasi</div>
              </div>
            </div>

            {/* Dynamic Custom Stats Ribbon (Hanya jika diatur riil di dashboard) */}
            {customStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
                {customStats.map((st: any, sIdx: number) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                    <div className="font-serif text-xl sm:text-2xl font-bold text-stone-950">
                      {st.value}
                    </div>
                    <div className="text-xs font-semibold text-stone-600 truncate">{st.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-950 border border-stone-300 text-[11px] font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-800" />
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
        <div className="flex items-center justify-between border-b border-stone-300 pb-3 flex-wrap gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
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
                className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer select-none ${
                  activeTab === tab.id
                    ? 'text-stone-950 font-black border-b-2 border-stone-950 -mb-[13px]'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Arsip Akuntabilitas
          </span>
        </div>

        {/* ─── TAB: KOMISI & AKD ─── */}
        {(activeTab === 'all' || activeTab === 'komisi') && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                    Penugasan Komisi Parlemen
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-950">
                    {activeCommissionName || 'Komisi Terkait DPR'}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {commissionRole && (
                  <span className="px-3.5 py-1.5 rounded-full bg-stone-950 text-white text-xs font-bold uppercase tracking-wider">
                    {commissionRole}
                  </span>
                )}
                {factionRole && (
                  <span className="px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold">
                    {factionRole}
                  </span>
                )}
              </div>
            </div>

            {hasAnyAkd ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commissionScope && (
                    <div className="space-y-2 p-5 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-stone-700" />
                        <span>Ruang Lingkup &amp; Bidang Komisi</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-normal">
                        {commissionScope}
                      </p>
                    </div>
                  )}

                  {commissionPartners && (
                    <div className="space-y-2 p-5 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4 text-stone-700" />
                        <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-normal">
                        {commissionPartners}
                      </p>
                    </div>
                  )}
                </div>

                {/* AKD Lainnya */}
                {akdBodies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block font-mono">
                      Penugasan Alat Kelengkapan Dewan (AKD) Lainnya:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {akdBodies.map((body: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-xl bg-[#F9F8F5] border border-stone-200/80 flex items-start gap-2.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-stone-900">{body.name}</div>
                            {body.role && (
                              <div className="text-[11px] font-semibold text-stone-600 mt-0.5">
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
              <div className="p-8 rounded-xl bg-[#F9F8F5] border border-stone-200 text-center space-y-2">
                <Landmark className="w-8 h-8 text-stone-600 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-stone-900">
                  Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
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
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-950">
                3 Pilar Fokus Pengabdian Legislatif
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visionPillars.map((v: any, i: number) => {
                const IconComp = pillarIcons[i % pillarIcons.length];
                return (
                  <div
                    key={i}
                    className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center font-black">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                        Pilar Ke-0{i + 1}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-stone-950">
                        {v.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
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
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-300 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-9 h-9 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-xs text-stone-500 font-sans">Landasan keilmuan perumusan kebijakan publik</p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                    <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-950">{edu}</h4>
                      <p className="text-xs font-semibold text-stone-600">
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-700">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wide block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-lg bg-[#EDEAE4] border border-stone-300 text-xs font-mono text-stone-800"
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
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-300 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-9 h-9 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950">
                  Penugasan Parlemen, Karier &amp; Organisasi
                </h3>
                <p className="text-xs text-stone-500 font-sans">Rekam jejak amanah publik &amp; kepemimpinan</p>
              </div>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((car: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                    <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-950">{car.role}</h4>
                      {(car.organization || car.period) && (
                        <p className="text-xs font-semibold text-stone-600">
                          {car.organization ? `${car.organization} ` : ''}
                          {car.period ? `(${car.period})` : ''}
                        </p>
                      )}
                      {car.description && (
                        <p className="text-xs text-stone-600 leading-relaxed pt-0.5 font-normal">
                          {car.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-700">
                    Informasi rekam jejak karier belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-500">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-300 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 font-mono">
                  Dokumentasi Lapangan
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-950">
                  Dokumentasi Kinerja Turun ke Dapil
                </h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-200/70 border border-stone-300 px-3.5 py-1 rounded-full self-start sm:self-auto">
                Aksi Nyata Lapangan
              </span>
            </div>

            {displayActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayActivities.map((act: any, aIdx: number) => (
                  <div
                    key={aIdx}
                    className="group rounded-2xl bg-white border border-stone-300 overflow-hidden hover:border-stone-600 transition-all duration-300 flex flex-col justify-between shadow-2xs"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />

                          {act.date && (
                            <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                              <Calendar className="w-3 h-3 text-stone-300" />
                              <span>{act.date}</span>
                            </div>
                          )}

                          {act.location && (
                            <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                              <MapPin className="w-3 h-3 text-stone-300" />
                              <span className="truncate max-w-[170px]">{act.location}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-[#EDEAE4] flex flex-col items-center justify-center gap-2 text-stone-500">
                          <Camera className="w-8 h-8 text-stone-600" />
                          <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6 space-y-2">
                        <h4 className="font-serif text-base font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] font-mono text-stone-700">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kinerja Terverifikasi</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-white border border-stone-300 text-center space-y-2">
                <Camera className="w-8 h-8 text-stone-400 mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-stone-900">Informasi dokumentasi kinerja belum ditambahkan</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
                </p>
              </div>
            )}
          </div>
        )}

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: GALERI FOTO KEGIATAN ASPIRASI (JIKA ADA)
          ────────────────────────────────────────────────────────────────────────── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-stone-300 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-stone-950 tracking-tight">
              Galeri Foto Resmi Parlemen
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Galeri Resmi
            </span>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: CALL TO ACTION BANNER (STUDIO EDITORIAL DARK CHARCOAL)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#252422] text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-stone-800">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 block">
            SALURAN ASPIRASI AKTIF
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Sampaikan Masukan &amp; Laporan Wilayah Langsung Kepada {officialFullName}.
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans font-light">
            Tim sekretariat dan staf ahli dewan senantiasa siap memproses pokok pikiran, telaah permasalahan daerah, dan permohonan audiensi konstituen.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-950 text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors shadow-sm"
            >
              <span>Buka Formulir Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-stone-300" />
                <span>WhatsApp Hotline</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
