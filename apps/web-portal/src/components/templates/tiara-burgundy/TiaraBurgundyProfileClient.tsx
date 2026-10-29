'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Scale,
  GraduationCap,
  Building2,
  Landmark,
  Camera,
  MessageCircle,
  BarChart3,
  Compass,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { getTiaraMemberInfo, useTiaraHref, TIARA_THEME, TIARA_DEFAULT_HERO_PORTRAIT } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface TiaraBurgundyProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function TiaraBurgundyProfileClient({
  member,
  theme,
  subdomain,
}: TiaraBurgundyProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

  const cleanLegislativeLevel = (info.legislativeLevel || 'DPR RI').replace(/_/g, ' ');

  // 2. AKD Resolvers
  const akdAssignment = theme?.layoutSchema?.akdAssignment || info.akdAssignment;
  const commissionData = akdAssignment?.commission;
  const activeCommissionName =
    commissionData?.name?.trim() ||
    info.commissionName?.trim() ||
    (member?.commissionName ? member.commissionName.trim() : '');
  const commissionRole =
    commissionData?.role?.trim() || (activeCommissionName ? 'Anggota Komisi' : '');
  const commissionScope = commissionData?.scope?.trim() || '';
  const commissionPartners = commissionData?.partners?.trim() || '';
  const factionRole = akdAssignment?.factionRole?.trim() || '';
  const akdBodies: any[] = Array.isArray(akdAssignment?.akdBodies)
    ? akdAssignment.akdBodies.filter((b: any) => b && b.name?.trim())
    : [];
  const hasAnyAkd = Boolean(activeCommissionName || factionRole || akdBodies.length > 0);

  // 3. Vision Pillars Resolvers
  const DEFAULT_VISION_PILLARS = [
    {
      title: 'Fungsi Legislasi',
      subtitle: 'Legislasikan Solusi Nyata',
      description:
        'Mengawal perumusan dan pengesahan regulasi perundang-undangan yang berpihak nyata kepada kesejahteraan rakyat, UMKM, dan kepastian hukum.',
    },
    {
      title: 'Fungsi Anggaran',
      subtitle: 'Pengawasan Anggaran Transparan',
      description:
        'Memastikan alokasi belanja negara dan transfer ke daerah terealisasi tepat sasaran, akuntabel, dan bebas dari inefisiensi anggaran.',
    },
    {
      title: 'Fungsi Representasi',
      subtitle: 'Pendampingan Konstituen Berkelanjutan',
      description:
        'Menjaga interaksi berkesinambungan bersama warga di daerah pemilihan melalui agenda reses berkala dan advokasi aspirasi nyata.',
    },
  ];

  const customPillars =
    Array.isArray(theme?.layoutSchema?.visionMission) &&
    theme.layoutSchema.visionMission.length > 0
      ? theme.layoutSchema.visionMission.filter(
          (p: any) => p && (p.title?.trim() || p.description?.trim())
        )
      : [];
  const visionPillars = customPillars.length > 0 ? customPillars : DEFAULT_VISION_PILLARS;
  const pillarIcons = [Compass, Building2, HeartHandshake];

  // 4. Education & Courses Resolvers
  const formalEduList: string[] = member?.education
    ? member.education
        .split(/[\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : Array.isArray(info.educationList) && info.educationList.length > 0
    ? info.educationList
    : [];

  const courses: string[] = Array.isArray(member?.courses)
    ? member.courses.filter(Boolean)
    : typeof member?.courses === 'string'
    ? member.courses.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // 5. Career & Organization Resolvers
  const customCareers: any[] =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && (c.role?.trim() || c.organization?.trim()))
      : Array.isArray(info.careersList) && info.careersList.length > 0
      ? info.careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  // 6. Field Activities Resolvers
  const verifiedActivities =
    theme?.layoutSchema?.verifiedActivities ||
    theme?.layoutSchema?.activities ||
    member?.activities;
  const displayActivities: any[] = Array.isArray(verifiedActivities)
    ? verifiedActivities.filter((a: any) => a && (a.title?.trim() || a.photoUrl?.trim()))
    : [];

  // 7. Custom Performance Stats (Only rendered if specifically configured in dashboard)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];

  const facts = [
    { label: 'LEMBAGA', value: cleanLegislativeLevel },
    { label: 'FRAKSI PARTAI', value: info.party },
    { label: 'KOMISI / AKD', value: activeCommissionName || 'Komisi Terkait' },
    {
      label: 'DAERAH PEMILIHAN',
      value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`,
    },
  ];

  return (
    <div className="space-y-16">
      
      {/* ========================================================= */}
      {/* SECTION 1: EDITORIAL HEADER & POLAROID CARD               */}
      {/* ========================================================= */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A] mb-8">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold text-[#6B1724]">Profil &amp; Rekam Jejak</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Title Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="font-serif italic text-2xl sm:text-3xl block text-[#852232]">
                Tentang &amp; Nilai Pengabdian
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#6B1724] tracking-tight leading-tight uppercase font-normal">
                {info.fullName}
              </h1>
              <p className="font-serif text-sm sm:text-base uppercase tracking-[0.2em] text-[#7A6F6A] font-semibold pt-1">
                {cleanLegislativeLevel} • Fraksi {info.party} • Dapil {info.dapil}
              </p>
              
              {/* Bio Narrative */}
              <div className="text-base text-[#5A524D] leading-relaxed max-w-2xl pt-2 space-y-3">
                {theme?.bioBiography ? (
                  theme.bioBiography
                    .split('\n\n')
                    .filter(Boolean)
                    .map((para: string, idx: number) => (
                      <p key={idx}>{para.trim()}</p>
                    ))
                ) : theme?.headlineTagline ? (
                  <p className="italic">&ldquo;{theme.headlineTagline}&rdquo;</p>
                ) : (
                  <p>{info.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center space-x-2.5 px-7 py-3 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#52101B] transition-all shadow-md group"
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-[#6B1724] border border-[#E5DED5] rounded-full font-serif text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#FAF8F5] transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#852232]" />
                  <span>Katalog Artikel</span>
                </Link>

                <Link
                  href={href('/infografis')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-[#6B1724] border border-[#E5DED5] rounded-full font-serif text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#FAF8F5] transition"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#852232]" />
                  <span>Infografis Kinerja</span>
                </Link>

                {info.waHotlineLink && (
                  <a
                    href={info.waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-700 text-white rounded-full font-serif text-xs font-semibold uppercase tracking-[0.15em] hover:bg-emerald-800 transition shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Langsung</span>
                  </a>
                )}
              </div>
            </div>

            {/* Profile Polaroid Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative bg-white p-4 shadow-xl border border-[#E5DED5] rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[280px]">
                {/* Tape Graphic */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#EADCC8]/80 border border-[#D5C6B0] rotate-[-2deg] shadow-sm z-20 backdrop-blur-xs pointer-events-none" />
                <div className="aspect-3/4 overflow-hidden bg-[#EFEBE4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.avatarUrl || TIARA_DEFAULT_HERO_PORTRAIT}
                    alt={info.fullName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = TIARA_DEFAULT_HERO_PORTRAIT;
                    }}
                  />
                </div>
                <div className="pt-3 text-center">
                  <span className="font-serif text-xs font-bold tracking-[0.15em] text-[#6B1724] uppercase block">
                    {info.fullName}
                  </span>
                  <span className="text-[11px] text-[#7A6F6A] font-medium block mt-0.5">
                    {info.roleTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FACTUAL METRICS STRIP (Mandat Parlemen Terverifikasi)     */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-[#E5DED5] py-10 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {facts.map((fact, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FBF9F5] border border-[#E5DED5] rounded-xs space-y-1 transition-all duration-300 hover:shadow-sm"
              >
                <div className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6F6A]">
                  {fact.label}
                </div>
                <div className="font-serif text-sm sm:text-base font-bold text-[#6B1724] truncate" title={fact.value}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Performance Stats (HANYA jika dikonfigurasi di dashboard) */}
          {customStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2">
              {customStats.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 bg-[#FBF9F5] border border-[#E5DED5] rounded-xs space-y-2 text-center sm:text-left transition-all duration-300 hover:shadow-md hover:border-[#6B1724]/30"
                >
                  <div className="font-serif text-3xl lg:text-4xl font-normal text-[#852232] tracking-tight">
                    {item.value}
                  </div>
                  <div className="font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#1E1B18]">
                    {item.label}
                  </div>
                  {item.sublabel && (
                    <p className="text-xs text-[#7A6F6A] leading-relaxed pt-1">
                      {item.sublabel}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
        <div className="border-b border-[#E5DED5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1B18] uppercase tracking-wide">
                Penugasan Komisi &amp; Alat Kelengkapan Dewan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A6F6A] mt-1 font-serif">
              Mandat resmi dan ruang lingkup pengawasan kenegaraan dalam menjalankan fungsi legislasi, anggaran, dan representasi.
            </p>
          </div>
          <span className="font-serif text-xs font-bold text-[#6B1724] bg-[#F7EFF1] border border-[#6B1724]/20 px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
            Mandat Parlemen Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Parlemen Utama */}
            {activeCommissionName ? (
              <div className="bg-[#6B1724] text-white p-8 sm:p-10 rounded-xs space-y-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-white/20">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider bg-white/15 text-[#EADCC8] border border-white/20">
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-serif font-semibold bg-white text-[#6B1724]">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-serif font-semibold bg-white/10 text-white border border-white/20">
                          Fraksi {info.party && info.party !== 'Fraksi Parlemen' ? info.party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                      {activeCommissionName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#EADCC8] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#EADCC8]">
                      <ShieldCheck className="w-4 h-4 text-[#EADCC8]" />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal bg-black/15 p-4 rounded-xs border border-white/10">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-white/60 italic bg-black/15 p-4 rounded-xs border border-white/10">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#EADCC8]">
                      <Users className="w-4 h-4 text-[#EADCC8]" />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 rounded-xs bg-black/15 border border-white/10">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-xs bg-white text-[#6B1724] text-xs font-serif font-bold shadow-xs"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-white/60 italic bg-black/15 p-4 rounded-xs border border-white/10">
                        Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Keanggotaan Alat Kelengkapan Dewan (AKD) Lainnya */}
            {akdBodies.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold uppercase tracking-widest text-[#6B1724]">
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-[#E5DED5] flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-xs bg-white border border-[#E5DED5] shadow-xs hover:border-[#6B1724]/40 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#F7EFF1] text-[#6B1724] border border-[#6B1724]/20 flex items-center justify-center font-black shrink-0">
                          <Landmark className="w-4.5 h-4.5 text-[#6B1724]" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold bg-[#6B1724] text-white shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif text-sm sm:text-base font-bold text-[#1E1B18] leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-[#7A6F6A] leading-relaxed pt-1">
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
          <div className="p-8 sm:p-12 rounded-xs bg-[#FBF9F5] border border-[#E5DED5] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F7EFF1] text-[#6B1724] border border-[#6B1724]/20 mx-auto flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-[#1E1B18]">
              Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
            </h3>
            <p className="text-xs text-[#7A6F6A] max-w-md mx-auto leading-relaxed font-serif">
              Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: TIGA PILAR KOMITMEN PENGABDIAN (CORE VALUES)   */}
      {/* ========================================================= */}
      <section className="bg-[#EFEBE4] py-16 sm:py-20 px-6 sm:px-10 lg:px-12 border-y border-[#E5DED5]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-serif italic text-2xl block text-[#852232]">
              Prinsip &amp; Landasan Pengabdian
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#6B1724] uppercase tracking-wide">
              PILAR FOKUS PENGABDIAN
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="bg-[#6B1724] text-white p-8 rounded-xs shadow-lg space-y-4 hover:translate-y-[-2px] transition-transform duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#EADCC8]">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#EADCC8] block border-b border-white/20 pb-2">
                      {pillar.title}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white pt-1">
                      {pillar.subtitle || pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#FBF9F5]/90 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: REKAM JEJAK PENDIDIKAN & KARIER PUBLIK          */}
      {/* ========================================================= */}
      <section className="bg-white py-16 sm:py-20 px-6 sm:px-10 lg:px-12 border-b border-[#E5DED5]">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-serif italic text-2xl block text-[#852232]">
              Jejak Langkah &amp; Rekam Jejak
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1B18] uppercase tracking-wide">
              PENGALAMAN &amp; LATAR BELAKANG PENDIDIKAN
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Education Timeline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E5DED5] pb-4">
                <GraduationCap className="w-5 h-5 text-[#6B1724]" />
                <h3 className="font-serif text-xl text-[#6B1724] uppercase tracking-wider font-semibold">
                  Riwayat Pendidikan Formal
                </h3>
              </div>

              <div className="space-y-8 pl-4 border-l-2 border-[#E5DED5]">
                {formalEduList.length > 0 ? (
                  formalEduList.map((edu: string, idx: number) => (
                    <div key={idx} className="relative space-y-2 pl-4">
                      <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ring-[#E5DED5] bg-[#852232]" />
                      <span className="text-[10px] font-serif font-bold uppercase tracking-[0.18em] text-[#7A6F6A] block">
                        Kredensial Pendidikan Terverifikasi #{idx + 1}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#1E1B18]">
                        {edu}
                      </h4>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center space-y-1.5">
                    <p className="font-serif text-xs font-semibold text-[#1E1B18]">
                      Informasi riwayat pendidikan belum ditambahkan.
                    </p>
                    <p className="text-[11px] text-[#7A6F6A]">
                      Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                    </p>
                  </div>
                )}

                {courses.length > 0 && (
                  <div className="pt-4 border-t border-[#E5DED5] space-y-2">
                    <span className="text-[10px] font-serif font-bold text-[#7A6F6A] uppercase tracking-wider block">
                      Pelatihan &amp; Sertifikasi Keparlemenan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {courses.map((course: string, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-xs bg-[#F7EFF1] text-[#6B1724] border border-[#6B1724]/20 text-[10px] font-serif font-semibold"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Career Timeline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E5DED5] pb-4">
                <Briefcase className="w-5 h-5 text-[#6B1724]" />
                <h3 className="font-serif text-xl text-[#6B1724] uppercase tracking-wider font-semibold">
                  Riwayat Pengabdian &amp; Karier
                </h3>
              </div>

              <div className="space-y-8 pl-4 border-l-2 border-[#E5DED5]">
                {customCareers.length > 0 ? (
                  customCareers.map((cItem: any, idx: number) => (
                    <div key={idx} className="relative space-y-2 pl-4">
                      <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#6B1724] border-2 border-white ring-2 ring-[#E5DED5]" />
                      {cItem.period && (
                        <span className="text-[11px] font-serif font-bold uppercase tracking-[0.18em] text-[#7A6F6A] block">
                          {cItem.period}
                        </span>
                      )}
                      <h4 className="font-serif text-base font-bold text-[#1E1B18]">
                        {cItem.role || cItem.title || 'Amanah Pengabdian'}
                      </h4>
                      {(cItem.organization || cItem.institution) && (
                        <p className="text-xs font-serif font-semibold text-[#852232]">
                          {cItem.organization || cItem.institution}
                        </p>
                      )}
                      {cItem.description && (
                        <p className="text-xs text-[#5A524D] leading-relaxed pt-1">
                          {cItem.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center space-y-1.5">
                    <p className="font-serif text-xs font-semibold text-[#1E1B18]">
                      Informasi rekam jejak penugasan dewan belum ditambahkan.
                    </p>
                    <p className="text-[11px] text-[#7A6F6A]">
                      Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: DOKUMENTASI KINERJA TURUN KE DAPIL             */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
        <div className="border-b border-[#E5DED5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1B18] uppercase tracking-wide">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A6F6A] mt-1 font-serif">
              Rekam jejak kehadiran nyata, penyerapan aspirasi warga, dan pengawasan kerja di daerah pemilihan.
            </p>
          </div>
          <span className="font-serif text-xs font-bold text-[#6B1724] bg-[#F7EFF1] border border-[#6B1724]/20 px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
            Aksi Nyata Lapangan
          </span>
        </div>

        {displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayActivities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-xs bg-white border border-[#E5DED5] shadow-xs hover:border-[#6B1724]/50 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Cover Foto Dokumentasi */}
                {act.photoUrl ? (
                  <div className="relative aspect-[16/10] bg-[#1E1B18] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.photoUrl}
                      alt={act.title || 'Dokumentasi Kinerja'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Pill Tanggal */}
                    {act.date && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-sm text-[10px] font-serif font-bold flex items-center gap-1.5 shadow-sm">
                        <Calendar className="w-3 h-3 text-[#EADCC8]" />
                        <span>{act.date}</span>
                      </div>
                    )}

                    {/* Pill Lokasi */}
                    {act.location && (
                      <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-serif font-semibold flex items-center gap-1.5 drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-[#EADCC8] shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] bg-[#FAF8F5] flex flex-col items-center justify-center text-[#7A6F6A] gap-1 p-4 border-b border-[#E5DED5]">
                    <Camera className="w-8 h-8 text-[#B8AEA8]" />
                    <span className="text-xs font-serif font-medium">Dokumentasi Lapangan</span>
                  </div>
                )}

                {/* Informasi Narasi Kinerja */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-serif text-base font-bold text-[#1E1B18] group-hover:text-[#6B1724] transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs text-[#5A524D] leading-relaxed line-clamp-3">
                        {act.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E5DED5] flex items-center justify-between text-[11px]">
                    <span className="text-[#6B1724] font-serif font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6B1724]" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-xs bg-[#FBF9F5] border border-[#E5DED5] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F7EFF1] text-[#6B1724] border border-[#6B1724]/20 mx-auto flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#6B1724]" />
            </div>
            <h3 className="font-serif text-sm font-bold text-[#1E1B18]">
              Informasi dokumentasi kinerja belum ditambahkan.
            </h3>
            <p className="text-xs text-[#7A6F6A] max-w-md mx-auto leading-relaxed font-serif">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: GALERI FOTO PARLEMEN                            */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
        <PortalPhotoGallery
          photos={member?.photoGallery}
          memberName={info.officialFullName}
        />
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: CALL TO ACTION ASPIRASI WARGA                  */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="bg-[#6B1724] text-white p-8 sm:p-14 rounded-xs shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#EADCC8] border border-white/20 text-xs font-serif font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#EADCC8]" />
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-white tracking-tight leading-tight uppercase font-normal">
              Ingin Menyampaikan Masukan Langsung Kepada {info.fullName}?
            </h3>

            <p className="text-xs sm:text-sm text-[#FBF9F5]/90 leading-relaxed font-light">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, fasilitas umum, atau usulan perbaikan layanan publik di Daerah Pemilihan {info.dapil}.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center space-x-2.5 px-8 py-3.5 bg-white text-[#6B1724] rounded-full font-serif text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#FAF8F5] transition-all shadow-md group"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-serif text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Hotline Dewan</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
