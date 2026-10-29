'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Scale,
  Activity,
  Landmark,
  Briefcase,
  GraduationCap,
  Building,
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
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface MidnightLimeProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function MidnightLimeProfileClient({
  member,
  theme,
  subdomain,
}: MidnightLimeProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#D4F63D',
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

  const primaryColor = theme?.primaryHexColor || '#D4F63D';
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

  // 4. Custom Stats from theme layoutSchema (HANYA jika diisi dari dashboard)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  // 5. Pillar icon mapping
  const pillarIcons = [Scale, Activity, Landmark, Compass];

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
    <div className="py-10 sm:py-16 bg-[#0C111F] text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* ─── 1. PROFILE SUMMARY WITH CUTOUT & LIME GLOW ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden bg-[#131B2D] border border-white/10 shadow-2xl flex items-end justify-center group">
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-30"
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

              <div
                className="absolute top-4 right-4 p-2.5 rounded-xl text-black shadow-xl z-20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>

              {/* Mandat Tag di Bawah Foto */}
              <div className="absolute bottom-3 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 text-white z-20 shadow-lg">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4F63D]">
                  Mandat Konstitusi Resmi
                </div>
                <div className="text-xs font-bold truncate">
                  {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] font-mono">
                Mandat Konstitusi Resmi
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight">
                {officialFullName}
              </h1>
              <div className="flex flex-wrap gap-2 pt-1 font-mono">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30">
                  {cleanLegislativeLevel}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {party}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {dapil || 'Nasional'}
                </span>
                {activeCommissionName && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {activeCommissionName}
                  </span>
                )}
              </div>
            </div>

            {headlineTagline && (
              <p className="text-sm sm:text-base text-[#D4F63D] font-medium italic">
                &ldquo;{headlineTagline}&rdquo;
              </p>
            )}

            <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans space-y-2">
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
                  Mendedikasikan pengabdian penuh untuk memperjuangkan keadilan sosial, transparansi anggaran, dan penguatan layanan publik bagi masyarakat di Daerah Pemilihan {dapil || 'daerah pemilihan'}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono">
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Lembaga Dewan</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block truncate">{cleanLegislativeLevel}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Komisi Dewan</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block truncate">{activeCommissionName || 'Parlemen'}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Status Mandat</span>
                <span className="font-bold text-xs sm:text-sm text-[#D4F63D] mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4F63D]" />
                  <span>Aktif Bertugas</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4F63D] hover:bg-[#c2e22c] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,246,61,0.25)] hover:scale-105 active:scale-95 transition-all font-mono"
              >
                <MessageCircle className="w-4 h-4 text-black" />
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#131B2D] border border-white/10 hover:border-[#D4F63D] text-[#D4F63D] font-bold text-xs uppercase tracking-wider transition-all font-mono"
                >
                  <Phone className="w-4 h-4 text-[#D4F63D]" />
                  <span>WhatsApp Staf Ahli</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* ─── 2. STATS HIGHLIGHT RIBBON (HANYA JIKA ADA DATA RESMI DARI DASHBOARD) ─── */}
        {customStats.length > 0 && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {customStats.map((st: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#131B2D] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block truncate">{st.label}</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#D4F63D] block font-mono">{st.value}</span>
                  {st.sublabel && <span className="text-[10px] text-slate-400 block">{st.sublabel}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
        <section className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] font-mono">
                Mandat Parlemen Terverifikasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Penugasan Komisi &amp; Alat Kelengkapan Dewan
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#D4F63D] bg-[#D4F63D]/10 border border-[#D4F63D]/30 px-3 py-1 rounded-full shrink-0">
              Mandat Resmi
            </span>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-6">
              {activeCommissionName && (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#131B2D] border border-white/10 hover:border-[#D4F63D]/40 transition-all space-y-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-[#D4F63D] text-black">
                          Komisi Parlemen
                        </span>
                        {commissionRole && (
                          <span className="px-3 py-1 rounded-full font-bold bg-white/10 text-white border border-white/20">
                            {commissionRole}
                          </span>
                        )}
                        {factionRole && (
                          <span className="px-3 py-1 rounded-full font-bold bg-[#D4F63D]/10 text-[#D4F63D] border border-[#D4F63D]/30">
                            Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeCommissionName}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#D4F63D]/15 border border-[#D4F63D]/30 text-[#D4F63D] flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-[#D4F63D]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                        <ShieldCheck className="w-4 h-4 text-[#D4F63D]" />
                        <span>Ruang Lingkup Bidang Pengawasan</span>
                      </div>
                      {commissionScope ? (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0C111F] p-4 rounded-2xl border border-white/5">
                          {commissionScope}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 italic bg-[#0C111F] p-4 rounded-2xl border border-white/5">
                          Ruang lingkup bidang pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                        <Users className="w-4 h-4 text-[#D4F63D]" />
                        <span>Kementerian / Lembaga Mitra Kerja</span>
                      </div>
                      {commissionPartners ? (
                        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[#0C111F] border border-white/5">
                          {commissionPartners
                            .split(/[,;\n]+/)
                            .map((pt: string, pIdx: number) => {
                              const cleanPt = pt.trim();
                              if (!cleanPt) return null;
                              return (
                                <span
                                  key={pIdx}
                                  className="px-3 py-1.5 rounded-xl bg-[#131B2D] border border-white/10 text-xs font-mono font-semibold text-slate-200"
                                >
                                  {cleanPt}
                                </span>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic bg-[#0C111F] p-4 rounded-2xl border border-white/5">
                          Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {akdBodies.length > 0 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] block font-mono">
                    Keanggotaan Badan &amp; AKD Lainnya:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {akdBodies.map((akd: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-5 rounded-2xl bg-[#131B2D] border border-white/10 hover:border-[#D4F63D]/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-9 h-9 rounded-xl bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30 flex items-center justify-center font-black shrink-0">
                            <Landmark className="w-4.5 h-4.5 text-[#D4F63D]" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D4F63D] text-black shrink-0">
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
            <div className="p-8 sm:p-12 rounded-3xl bg-[#131B2D] border border-white/10 text-center space-y-2">
              <Building className="w-8 h-8 text-[#D4F63D] mx-auto opacity-80" />
              <h4 className="text-sm font-bold text-white">Informasi penugasan komisi &amp; AKD belum ditambahkan</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Data komisi kerja dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </section>

        {/* ─── 4. TRIFUNGSI PARLEMEN (3 PILAR PENGABDIAN LEGISLATIF) ─── */}
        <div className="space-y-6 text-left">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] font-mono">Trifungsi Parlemen</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              3 Pilar Fokus Pengabdian Legislatif
            </h2>
          </div>

          {visionPillars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visionPillars.map((v: any, idx: number) => {
                const IconComp = pillarIcons[idx % pillarIcons.length] || Scale;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] flex items-center justify-center font-bold">
                        <IconComp className="w-5 h-5 text-[#D4F63D]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#D4F63D] uppercase tracking-wider block">
                          {v.title}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          {v.subtitle || v.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        {v.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#D4F63D] font-mono">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Pilar Terverifikasi</span>
                      <CheckCircle2 className="w-4 h-4 text-[#D4F63D]" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#131B2D] border border-white/10 text-center space-y-2">
              <Scale className="w-8 h-8 text-[#D4F63D] mx-auto opacity-80" />
              <h4 className="text-sm font-bold text-white">Informasi pilar pengabdian belum ditambahkan</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Prinsip kerja keparlemenan akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>

        {/* ─── 5. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER ─── */}
        <section className="space-y-6 text-left">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] font-mono">
              Rekam Jejak Kenegaraan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Riwayat Pendidikan &amp; Pengalaman Karier
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu Pendidikan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#131B2D] border border-white/10 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/15 text-[#D4F63D] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-[#D4F63D]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Riwayat Pendidikan Formal
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Latar belakang studi &amp; keilmuan
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {educationList.length > 0 ? (
                  educationList.map((edu: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D4F63D] mt-1.5 shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">{edu}</div>
                        <div className="text-[11px] font-mono text-[#D4F63D] font-semibold">
                          Kredensial Pendidikan Terverifikasi
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-slate-300">
                      Informasi riwayat pendidikan belum ditambahkan.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                    </p>
                  </div>
                )}

                {courses.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-[#D4F63D] uppercase tracking-wide block">
                      Pelatihan &amp; Sertifikasi Keparlemenan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {courses.map((course: string, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-slate-300"
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
            <div className="p-6 sm:p-8 rounded-3xl bg-[#131B2D] border border-white/10 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/15 text-[#D4F63D] flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5 text-[#D4F63D]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Penugasan Parlemen &amp; Pengabdian
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Amanah publik &amp; rekam jejak institusi
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {customCareers.length > 0 ? (
                  customCareers.map((car: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D4F63D] mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-bold text-white">{car.role}</div>
                        {(car.organization || car.period) && (
                          <div className="text-[11px] font-mono text-[#D4F63D] font-semibold">
                            {car.organization ? `${car.organization} ` : ''}
                            {car.period ? `(${car.period})` : ''}
                          </div>
                        )}
                        {car.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-normal">
                            {car.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-1.5">
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
          </div>
        </section>

        {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL ─── */}
        <section className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D] font-mono">
                Dokumentasi Lapangan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#D4F63D] bg-[#D4F63D]/10 border border-[#D4F63D]/30 px-3 py-1 rounded-full shrink-0">
              Aksi Nyata Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="group rounded-3xl bg-[#131B2D] border border-white/10 overflow-hidden hover:border-[#D4F63D]/50 transition-all duration-300 flex flex-col justify-between"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131B2D] via-transparent to-transparent pointer-events-none" />

                        {act.date && (
                          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-[#D4F63D] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                            <Calendar className="w-3 h-3 text-[#D4F63D]" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                            <MapPin className="w-3.5 h-3.5 text-[#D4F63D] shrink-0" />
                            <span className="truncate">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative aspect-[16/10] bg-black/40 flex flex-col items-center justify-center text-slate-500 gap-1 p-4 border-b border-white/5">
                        <Camera className="w-8 h-8 text-[#D4F63D]/60" />
                        <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 space-y-2">
                      <h4 className="text-base font-bold text-white group-hover:text-[#D4F63D] transition-colors line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[11px] font-mono text-[#D4F63D]">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4F63D]" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#131B2D] border border-white/10 text-center space-y-2">
              <Camera className="w-8 h-8 text-[#D4F63D] mx-auto opacity-80" />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </section>

        {/* ─── 7. GALERI FOTO RESMI (JIKA ADA) ─── */}
        {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
          <section className="space-y-6 pt-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D4F63D]" />
                <span>Galeri Foto Resmi Parlemen</span>
              </h3>
            </div>
            <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
          </section>
        )}

        {/* ─── 8. CALL TO ACTION ASPIRASI KONSTITUEN ─── */}
        <section className="rounded-3xl bg-[#131B2D] border border-white/10 p-8 sm:p-12 relative overflow-hidden shadow-2xl text-left">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-20"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4F63D] hover:bg-[#c2e22c] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,246,61,0.25)] hover:scale-105 active:scale-95 transition-all font-mono"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#D4F63D] text-[#D4F63D] font-bold text-xs uppercase tracking-wider transition-all font-mono"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4F63D]" />
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
