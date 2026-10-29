'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  FileCheck,
  Calendar,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Phone,
  Sparkles,
  BookOpen,
  Landmark,
  Camera,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface AmberPortfolioProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function AmberPortfolioProfileClient({
  member,
  theme,
  subdomain,
}: AmberPortfolioProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#EA580C',
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

  const primaryColor = theme?.primaryHexColor || '#EA580C';
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
  const pillarIcons = [FileCheck, Award, ShieldCheck];

  return (
    <div className="py-12 sm:py-16 bg-[#0A0908] text-stone-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* ─── 1. HERO OVERVIEW (PHOTO CUTOUT WITH AMBER GLOW & MANDATE) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden bg-[#141210] border border-white/10 shadow-2xl flex items-end justify-center group">
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-40"
                style={{ backgroundColor: primaryColor }}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-auto max-h-[92%] object-contain object-bottom filter contrast-105 select-none relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Verified Badge */}
              <div
                className="absolute top-4 right-4 p-2.5 rounded-2xl text-white shadow-xl z-20 border border-white/20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              {/* Mandate Pill di Bawah Foto */}
              <div className="absolute bottom-3 left-4 right-4 bg-stone-950/85 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 text-white z-20 shadow-lg text-left">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                  Mandat Konstitusi Resmi
                </div>
                <div className="text-xs font-bold truncate">
                  {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </div>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Mandat Konstitusional Terverifikasi</span>
              </div>
              <h1 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
                {officialFullName}
              </h1>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {cleanLegislativeLevel}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-stone-300 border border-white/10">
                  {party}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-stone-300 border border-white/10">
                  {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans font-normal">
              {bio}
            </p>

            {/* Diagnostics Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Penugasan Komisi</span>
                <span className="font-bold text-xs sm:text-sm text-orange-400 mt-1 block truncate">
                  {activeCommissionName || 'Komisi Terkait'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Fraksi Parlemen</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block truncate">
                  {party}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Status Mandat</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-400 mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Aktif Bertugas</span>
                </span>
              </div>
            </div>

            {/* Dynamic Custom Stats Ribbon (Hanya jika diatur riil di dashboard) */}
            {customStats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                {customStats.map((st: any, sIdx: number) => (
                  <div key={sIdx} className="p-4 rounded-2xl bg-[#141210] border border-white/10">
                    <span className="text-2xl font-black text-orange-400 block font-bebas tracking-wide">
                      {st.value}
                    </span>
                    <span className="text-xs font-semibold text-stone-400 mt-0.5 block truncate">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#141210] border border-white/10 hover:border-orange-500 text-orange-400 font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-orange-400" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>

          </div>

        </div>

        {/* ─── 2. PENUGASAN KOMISI & AKD ─── */}
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Alat Kelengkapan Dewan (AKD)
            </span>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Penugasan Komisi &amp; Badan Parlemen
            </h2>
          </div>

          {hasAnyAkd ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141210] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Landmark className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 block">
                      Komisi Dewan Terpilih
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {activeCommissionName || 'Komisi Terkait'}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {commissionRole && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold uppercase tracking-wider">
                      {commissionRole}
                    </span>
                  )}
                  {factionRole && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-stone-300 text-xs font-semibold">
                      {factionRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commissionScope && (
                  <div className="space-y-2 p-5 rounded-2xl bg-[#12100E] border border-white/5">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Ruang Lingkup &amp; Bidang Komisi</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-normal">
                      {commissionScope}
                    </p>
                  </div>
                )}

                {commissionPartners && (
                  <div className="space-y-2 p-5 rounded-2xl bg-[#12100E] border border-white/5">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <Users className="w-4 h-4" />
                      <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-normal">
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
                        className="p-3.5 rounded-2xl bg-[#12100E] border border-white/5 flex items-start gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">{body.name}</div>
                          {body.role && (
                            <div className="text-[11px] font-semibold text-orange-400 mt-0.5">
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
            <div className="p-8 rounded-3xl bg-[#141210] border border-white/10 text-center space-y-2">
              <Landmark className="w-8 h-8 text-orange-400 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD sedang dimutakhirkan
              </h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Data komisi, mitra kementerian, dan badan kelengkapan dewan akan tampil di sini setelah diperbarui.
              </p>
            </div>
          )}
        </div>

        {/* ─── 3. 3 PILAR KOMITMEN & FUNGSI PARLEMEN (TRIFUNGSI) ─── */}
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Trifungsi Parlemen</span>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Pilar Pengabdian Konstitusi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((v: any, i: number) => {
              const IconComp = pillarIcons[i % pillarIcons.length];
              return (
                <div
                  key={i}
                  className="p-6 sm:p-8 rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/40 transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <IconComp className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {v.title}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-normal">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. RIWAYAT PENDIDIKAN & KARIER ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Kartu Pendidikan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141210] border border-white/10 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl text-white uppercase tracking-tight">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-xs font-mono text-stone-400">
                  Latar belakang studi &amp; keilmuan
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">{edu}</div>
                      <div className="text-[11px] font-mono text-orange-400 font-semibold">
                        Kredensial Pendidikan Terverifikasi
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-300">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wide block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-stone-300"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kartu Karier */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141210] border border-white/10 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl text-white uppercase tracking-tight">
                  Penugasan Parlemen &amp; Pengabdian
                </h3>
                <p className="text-xs font-mono text-stone-400">
                  Amanah publik &amp; rekam jejak institusi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((car: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-white">{car.role}</div>
                      {(car.organization || car.period) && (
                        <div className="text-[11px] font-mono text-orange-400 font-semibold">
                          {car.organization ? `${car.organization} ` : ''}
                          {car.period ? `(${car.period})` : ''}
                        </div>
                      )}
                      {car.description && (
                        <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed font-normal">
                          {car.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-300">
                    Informasi rekam jejak karier belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─── 5. DOKUMENTASI KINERJA TURUN KE DAPIL ─── */}
        <div className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400 font-mono">
                Dokumentasi Lapangan
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shrink-0">
              Aksi Nyata Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="group rounded-3xl bg-[#141210] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent pointer-events-none" />

                        {act.date && (
                          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-orange-400 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                            <Calendar className="w-3 h-3 text-orange-400" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                            <MapPin className="w-3 h-3 text-orange-400" />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-black/40 flex flex-col items-center justify-center gap-2 text-stone-500">
                        <Camera className="w-8 h-8 text-orange-400/60" />
                        <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 space-y-2">
                      <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[11px] font-mono text-orange-400">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#141210] border border-white/10 text-center space-y-2">
              <Camera className="w-8 h-8 text-orange-400 mx-auto opacity-80" />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>

        {/* ─── 6. GALERI FOTO RESMI (JIKA TERSEDIA) ─── */}
        {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
          <div className="space-y-4 pt-2 text-left">
            <h3 className="font-bebas text-3xl text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Galeri Foto Resmi Parlemen</span>
            </h3>
            <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
          </div>
        )}

        {/* ─── 7. CALL TO ACTION SALURAN ASPIRASI KONSTITUEN ─── */}
        <section className="rounded-3xl bg-[#141210] border border-white/10 p-8 sm:p-12 relative overflow-hidden shadow-2xl text-left">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-20"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan infrastruktur jalan, bantuan sosial, pupuk subsidi, atau usulan kebijakan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all font-mono"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-orange-500 text-orange-400 font-bold text-xs uppercase tracking-wider transition-all font-mono"
                >
                  <MessageCircle className="w-4 h-4 text-orange-400" />
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
