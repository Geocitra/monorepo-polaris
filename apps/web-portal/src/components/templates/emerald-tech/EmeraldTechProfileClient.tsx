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

interface EmeraldTechProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function EmeraldTechProfileClient({
  member,
  theme,
  subdomain,
}: EmeraldTechProfileClientProps) {
  // 1. Data Resolvers (Menggunakan pola yang sama dengan template polaris utama)
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#00DF82',
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

  // Pillar icon mapping
  const pillarIcons = [Compass, Building2, HeartHandshake, Scale];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ─── 1. HERO BIO CARD (ORION ONYX STYLE DENGAN CINCIN NEON ZAMRUD) ─── */}
      <section className="rounded-3xl bg-[#161616] border border-white/[0.08] p-6 sm:p-10 lg:p-12 overflow-hidden relative shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left Column: Portrait with overlapping green circle & 3D glowing neon ring */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex justify-center items-end">
              {/* Green Glow Circle */}
              <div
                className="absolute top-4 left-4 w-52 h-52 sm:w-60 sm:h-60 rounded-full z-0 opacity-80 transition-colors"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="absolute bottom-4 right-2 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white z-0 opacity-90" />

              {/* Cutout Photo */}
              <div className="relative z-10 w-full flex justify-center">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-auto max-h-[420px] sm:max-h-[460px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* Glowing Neon Green 3D Ring */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-16 rounded-[100%] border-[5px] -rotate-6 z-20 pointer-events-none"
                style={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 25px ${primaryColor}, inset 0 0 15px ${primaryColor}`,
                }}
              />
            </div>
          </div>

          {/* Right Column: Two-Tone Heading, Bio, Metadata, Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-xs font-black uppercase tracking-wider mb-3">
                <span style={{ color: primaryColor }}>PROFIL &amp; REKAM JEJAK</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                <span className="text-white block">ANGGOTA PARLEMEN</span>
                <span className="block mt-1" style={{ color: primaryColor }}>{officialFullName}</span>
              </h2>

              {headlineTagline && (
                <p className="text-xs sm:text-sm italic font-medium mt-3" style={{ color: primaryColor }}>
                  &ldquo;{headlineTagline}&rdquo;
                </p>
              )}

              <div className="text-stone-300 text-xs sm:text-sm leading-relaxed mt-4 space-y-3 font-normal">
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
                    Mendedikasikan amanah pengabdian kenegaraan untuk memperjuangkan aspirasi masyarakat melalui pelaksanaan fungsi legislasi yang berpihak kepada rakyat, pengawasan anggaran transparan, dan advokasi berkelanjutan di daerah pemilihan.
                  </p>
                )}
              </div>
            </div>

            {/* Custom Stats Ribbon (Hanya tampil jika ada data riil di theme.layoutSchema.stats) */}
            {customStats.length > 0 && (
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/[0.08]">
                {customStats.map((st: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08]"
                  >
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block truncate">
                      {st.label}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white block mt-0.5">
                      {st.value}
                    </span>
                    {st.sublabel && (
                      <span
                        className="text-[10px] font-bold block"
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

        </div>
      </section>

      {/* ─── 2. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="space-y-8">
        <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-xs font-black uppercase tracking-wider mb-2">
              <span style={{ color: primaryColor }}>MANDAT KENEGARAAN &amp; AKD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Penugasan Komisi &amp; Alat Kelengkapan Dewan
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Mandat resmi kedewanan dalam mengawal fungsi legislasi, penentuan anggaran, dan pengawasan mitra kementerian/instansi pemerintah.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-300 bg-[#161616] border border-white/[0.1] px-3.5 py-1.5 rounded-full shrink-0 self-start">
            AKD Parlemen Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Utama */}
            {activeCommissionName ? (
              <div className="rounded-2xl bg-[#161616] border border-white/[0.08] p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00DF82]/10 border border-[#00DF82]/30"
                        style={{ color: primaryColor }}
                      >
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#111111] text-stone-300 border border-white/[0.1]">
                          Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                      {activeCommissionName}
                    </h3>
                  </div>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: 'rgba(0, 223, 130, 0.1)',
                      borderColor: 'rgba(0, 223, 130, 0.3)',
                    }}
                  >
                    <Building2 className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                      <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal bg-[#111111] p-4 sm:p-5 rounded-xl border border-white/[0.08]">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500 italic bg-[#111111] p-4 sm:p-5 rounded-xl border border-white/[0.08]">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                      <Users className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 sm:p-5 rounded-xl bg-[#111111] border border-white/[0.08]">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-lg bg-[#161616] text-stone-200 border border-white/[0.1] text-xs font-semibold"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic bg-[#111111] p-4 sm:p-5 rounded-xl border border-white/[0.08]">
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
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-white/[0.08] flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82]/50 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: 'rgba(0, 223, 130, 0.1)',
                            borderColor: 'rgba(0, 223, 130, 0.3)',
                          }}
                        >
                          <Landmark className="w-4.5 h-4.5" style={{ color: primaryColor }} />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-black shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-stone-400 leading-relaxed pt-0.5">
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
          <div className="p-8 sm:p-12 rounded-2xl bg-[#161616] border border-dashed border-white/[0.1] text-center space-y-2">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center border"
              style={{
                backgroundColor: 'rgba(0, 223, 130, 0.1)',
                borderColor: 'rgba(0, 223, 130, 0.3)',
              }}
            >
              <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-sm font-bold text-white">
              Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 3. TIGA PILAR KOMITMEN PENGABDIAN ─── */}
      <section className="space-y-8">
        <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-xs font-black uppercase tracking-wider mb-2">
              <span style={{ color: primaryColor }}>PRINSIP KERJA PARLEMEN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Pilar Fokus Pengabdian
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Fondasi perjuangan kebijakan publik untuk mewujudkan pemerintahan yang akuntabel, transparan, dan berpihak kepada rakyat.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400 font-semibold self-start">
            Prinsip &amp; Nilai Integritas
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
                  className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black border"
                        style={{
                          backgroundColor: 'rgba(0, 223, 130, 0.1)',
                          borderColor: 'rgba(0, 223, 130, 0.3)',
                        }}
                      >
                        <IconComp className="w-6 h-6" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-3xl font-mono font-black text-stone-700">
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
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {pillar.subtitle || pillar.title}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono font-bold text-stone-500">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Komitmen Prioritas</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#161616] border border-dashed border-white/[0.1] text-center space-y-2">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center border"
              style={{
                backgroundColor: 'rgba(0, 223, 130, 0.1)',
                borderColor: 'rgba(0, 223, 130, 0.3)',
              }}
            >
              <Compass className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-sm font-bold text-white">
              Informasi pilar fokus pengabdian belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Fokus dan komitmen prinsip kerja parlemen akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 4. REKAM JEJAK PENDIDIKAN & PENGABDIAN HISTORIS ─── */}
      <section className="space-y-8">
        <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-xs font-black uppercase tracking-wider mb-2">
              <span style={{ color: primaryColor }}>REKAM JEJAK HISTORIS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Riwayat Pendidikan &amp; Pengabdian Publik
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Kredensial keilmuan akademis serta rekam jejak amanah kepemimpinan publik yang telah dijalani.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-300 bg-[#161616] border border-white/[0.1] px-3.5 py-1.5 rounded-full shrink-0 self-start">
            Kredensial Resmi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom 1: Riwayat Pendidikan Formal */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-white/[0.08] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'rgba(0, 223, 130, 0.1)',
                  borderColor: 'rgba(0, 223, 130, 0.3)',
                }}
              >
                <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-[11px] text-stone-500 font-mono">
                  Latar belakang keilmuan &amp; gelar akademik
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList && educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#111111] border border-white/[0.06]">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white leading-snug">
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
                  <p className="text-xs font-semibold text-stone-400">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-600">
                    Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {/* Pelatihan & Sertifikasi Keparlemenan */}
              {courses.length > 0 && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-md bg-[#111111] border border-white/[0.1] text-[10px] font-mono font-semibold"
                        style={{ color: primaryColor }}
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
          <div className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-white/[0.08] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'rgba(0, 223, 130, 0.1)',
                  borderColor: 'rgba(0, 223, 130, 0.3)',
                }}
              >
                <Briefcase className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Penugasan Parlemen &amp; Pengabdian
                </h3>
                <p className="text-[11px] text-stone-500 font-mono">
                  Rekam jejak amanah publik &amp; organisasi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {careersList && careersList.length > 0 ? (
                careersList.map((cItem: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#111111] border border-white/[0.06]">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-white leading-snug">
                          {cItem.role}
                        </div>
                        {cItem.period && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/[0.1] text-[10px] font-mono font-bold text-stone-300 shrink-0">
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
                        <p className="text-[11.5px] text-stone-400 leading-relaxed font-normal pt-0.5">
                          {cItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-400">
                    Informasi rekam jejak penugasan dewan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-600">
                    Riwayat amanah komisi, badan dewan, dan organisasi akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. DOKUMENTASI AKSI NYATA TURUN KE DAPIL ─── */}
      <section className="space-y-8">
        <div className="border-b border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-xs font-black uppercase tracking-wider mb-2">
              <span style={{ color: primaryColor }}>ADVOKASI &amp; AKSI LAPANGAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Dokumentasi Kinerja Turun ke Dapil
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Rekam jejak kehadiran nyata, penyerapan aspirasi langsung dari warga, dan monitoring program di daerah pemilihan.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-300 bg-[#161616] border border-white/[0.1] px-3.5 py-1.5 rounded-full shrink-0 self-start">
            Aksi Nyata Lapangan
          </span>
        </div>

        {activities && activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-2xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Cover Foto Dokumentasi */}
                {act.photoUrl ? (
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img
                      src={act.photoUrl}
                      alt={act.title || 'Dokumentasi Kinerja'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Pill Tanggal */}
                    {act.date && (
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" style={{ color: primaryColor }} />
                        <span>{act.date}</span>
                      </div>
                    )}

                    {/* Pill Lokasi */}
                    {act.location && (
                      <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                        <span className="truncate">{act.location}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] bg-black/60 flex flex-col items-center justify-center text-stone-500 gap-1.5 p-4 border-b border-white/[0.08]">
                    <Camera className="w-8 h-8 text-stone-600" />
                    <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                  </div>
                )}

                {/* Informasi Narasi Kinerja */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#00DF82] transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-3 font-normal">
                        {act.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
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
          <div className="p-8 sm:p-12 rounded-2xl bg-[#161616] border border-dashed border-white/[0.1] text-center space-y-2">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center border"
              style={{
                backgroundColor: 'rgba(0, 223, 130, 0.1)',
                borderColor: 'rgba(0, 223, 130, 0.3)',
              }}
            >
              <Camera className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-sm font-bold text-white">
              Informasi dokumentasi aksi nyata belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 6. CALL TO ACTION ASPIRASI & KONTAK KONSTITUEN ─── */}
      <section>
        <div className="rounded-2xl bg-gradient-to-r from-[#161616] via-[#1a221d] to-[#161616] border border-[#00DF82]/30 p-8 sm:p-12 shadow-[0_0_30px_rgba(0,223,130,0.1)] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#00DF82]/10 text-[#00DF82] border border-[#00DF82]/30 text-[11px] font-mono font-bold uppercase tracking-widest">
              <span>SALURAN ASPIRASI RESMI KONSTITUEN</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-normal">
              Staf ahli dan sekretariat kedewanan siap mencatat pengaduan fasilitas umum, usulan bantuan sosial, perbaikan jalan, maupun rancangan kebijakan untuk diperjuangkan di parlemen.
            </p>
          </div>

          <Link
            href={getNavLinkHref('/kontak')}
            className="px-8 py-4 rounded-xs text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shrink-0 inline-flex items-center gap-2 hover:scale-105 active:scale-95 hover:brightness-110"
            style={{ backgroundColor: primaryColor }}
          >
            <span>HUBUNGI SEKRETARIAT DEWAN</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
