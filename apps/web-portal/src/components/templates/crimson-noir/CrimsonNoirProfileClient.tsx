'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Flag,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  Quote,
  Scale,
  Wallet,
  Megaphone,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Award,
  Users,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { CrimsonLabel, CrimsonButton, CrimsonPortrait } from './CrimsonNoirShell';
import { getCrimsonMemberInfo, useCrimsonHref } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface CrimsonNoirProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CrimsonNoirProfileClient({
  member,
  theme,
  subdomain,
}: CrimsonNoirProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const href = useCrimsonHref(subdomain);

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

  // 3. Courses / Certifications
  const courses: string[] = Array.isArray(member?.courses)
    ? member.courses.filter(Boolean)
    : typeof member?.courses === 'string'
    ? member.courses.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  // 4. Custom Stats from dashboard layoutSchema (HANYA jika diatur dari dashboard)
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
    ? verifiedActivities.filter((a: any) => a && (a.title?.trim() || a.photoUrl?.trim()))
    : [];

  // 6. Career list resolver
  const customCareers: any[] =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && (c.role?.trim() || c.organization?.trim()))
      : Array.isArray(info.careersList) && info.careersList.length > 0
      ? info.careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  // 7. Vision Pillars icons
  const pillarIcons = [Compass, Building2, HeartHandshake];

  const facts = [
    { icon: Landmark, label: 'Lembaga', value: cleanLegislativeLevel },
    { icon: Flag, label: 'Fraksi', value: info.party },
    { icon: Building2, label: 'Alat Kelengkapan', value: activeCommissionName || 'Komisi Terkait' },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}` },
  ];

  return (
    <div className="bg-[#0B0B0B] text-white">
      
      {/* ─── 1. ABOUT SPLIT: BIOGRAFI & IDENTITAS KENEGARAAN ─── */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5 flex flex-col items-center">
          <CrimsonPortrait
            src={info.photoUrl}
            alt={info.officialFullName}
            color={info.primaryColor}
            className="w-full max-w-[340px] aspect-[3/4]"
          />
          <div className="mt-3.5 w-full max-w-[340px] p-3 rounded-[4px] bg-[#141414] border border-white/5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
              Mandat Perwakilan Rakyat
            </span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate">
              {cleanLegislativeLevel} • {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 select-text">
          <CrimsonLabel color={info.primaryColor}>Biografi &amp; Profil Resmi</CrimsonLabel>
          <h1 className="mt-1 font-outfit font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-white leading-tight uppercase tracking-tight">
            {info.officialFullName}
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wider uppercase" style={{ color: info.primaryColor }}>
            {activeCommissionName || 'Komisi Terkait DPR'} {commissionRole ? `(${commissionRole})` : ''} • {info.party}
          </p>

          <p className="mt-5 text-xs sm:text-sm text-white/70 leading-[1.9]">
            {info.bio ||
              `${info.officialFullName} adalah anggota ${cleanLegislativeLevel} dari ${info.party}. Dikenal sebagai legislator yang turun langsung ke lapangan, ia menjadikan aspirasi warga ${info.dapil} sebagai kompas utama dalam setiap pembahasan regulasi dan anggaran. Komitmennya: parlemen yang terbuka, kebijakan yang berbasis data, dan pelayanan yang cepat tanggap.`}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#141414] border border-white/5">
                <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: info.primaryColor }} />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
                  <div className="text-xs font-semibold text-white truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CrimsonButton href={href('/kontak')} color={info.primaryColor}>
              Sampaikan Aspirasi
            </CrimsonButton>

            {info.waHotlineLink && (
              <a
                href={info.waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[3px] bg-white/10 hover:bg-white/15 text-white text-xs font-semibold shadow-md transition-all border border-white/10"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hotline WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ─── 2. STATS (HANYA DITAMPILKAN JIKA DIATUR MELALUI DASHBOARD) ─── */}
      {customStats.length > 0 && (
        <section className="bg-[#121212] border-y border-white/5">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {customStats.map((s: any, idx: number) => (
              <div key={idx} className="text-center">
                <div className="font-outfit font-extrabold text-3xl sm:text-4xl text-[#E04848]">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/55">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="bg-[#0E0E0E] border-t border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20 space-y-8">
          <div>
            <CrimsonLabel color={info.primaryColor}>Tugas &amp; Tanggung Jawab</CrimsonLabel>
            <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">
              Penugasan Alat Kelengkapan Dewan (AKD)
            </h2>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-6">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div className="p-6 sm:p-7 rounded-[4px] bg-[#141414] border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-outfit font-bold text-xl sm:text-2xl text-white">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span className="px-3 py-1 rounded-[3px] bg-[#D62828]/20 border border-[#D62828]/40 text-[#E04848] text-xs font-bold self-start sm:self-auto">
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-4 rounded-[4px] bg-[#1A1A1A] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-[#D62828]" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs text-white/65 leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-4 rounded-[4px] bg-[#1A1A1A] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-[#D62828]" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs text-white/65 leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi alokasi anggaran APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-4 rounded-[4px] bg-[#1A1A1A] border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5 text-[#D62828]" />
                          <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                        </div>
                        <p className="text-xs text-white/65 leading-relaxed font-normal">
                          {commissionPartners}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraksi Role */}
              {factionRole && (
                <div className="p-4 sm:p-5 rounded-[4px] bg-[#141414] border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-[3px] bg-white/10 text-xs font-bold text-white">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/40 block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-[4px] bg-[#141414] border border-white/5 flex items-start gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D62828] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">{body.name}</div>
                          {body.role && (
                            <div className="text-[11px] font-semibold text-[#E04848] mt-0.5">
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
            <div className="p-8 rounded-[4px] bg-[#141414] border border-white/5 text-center space-y-2">
              <Landmark className="w-8 h-8 text-[#D62828]/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. 3 PILAR FOKUS PENGABDIAN LEGISLATIF ─── */}
      <section className="bg-[#121212] border-t border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20">
          <CrimsonLabel color={info.primaryColor}>Visi &amp; Komitmen</CrimsonLabel>
          <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">
            3 Pilar Haluan Kerja Parlemen
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {info.visionPillars.map((pillar: any, idx: number) => {
              const Icon = pillarIcons[idx % pillarIcons.length];
              const num = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={idx}
                  className="bg-[#1A1A1A] rounded-[4px] border border-white/5 p-6 hover:border-[#D62828]/50 hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-outfit font-extrabold text-2xl text-[#E04848]">
                        #{num}
                      </span>
                      <Icon className="w-5 h-5 text-[#D62828]" />
                    </div>

                    <h3 className="font-outfit font-bold text-base text-white mb-1.5 leading-snug">
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div className="text-[11px] font-semibold text-[#E04848] mb-2">
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-white/60 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-semibold">
                    <span>Mandat {info.dapil}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D62828]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. TIMELINE PENGABDIAN (PENDIDIKAN & KARIER) + QUOTE BOX ─── */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7 space-y-10">
          
          {/* Riwayat Pendidikan Formal */}
          <div>
            <CrimsonLabel color={info.primaryColor}>Pendidikan</CrimsonLabel>
            <h2 className="mt-1 font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Riwayat Pendidikan Formal
            </h2>

            {info.educationList.length > 0 ? (
              <ol className="mt-6 relative border-l border-white/10 space-y-6">
                {info.educationList.map((edu: string, idx: number) => (
                  <li key={idx} className="pl-7 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#D62828] flex items-center justify-center shadow-[0_0_14px_rgba(214,40,40,0.6)]">
                      <GraduationCap className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="text-sm font-bold text-white">{edu}</h3>
                    <p className="mt-0.5 text-[11px] text-[#E04848] font-semibold">
                      Kredensial Pendidikan Terverifikasi
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 p-5 rounded-[4px] bg-[#141414] border border-white/5 text-xs text-white/50">
                Informasi riwayat pendidikan akademik belum ditambahkan.
              </div>
            )}

            {/* Pelatihan & Sertifikasi */}
            {courses.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Pelatihan &amp; Sertifikasi Keparlemenan:
                </span>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course: string, cIdx: number) => (
                    <span
                      key={cIdx}
                      className="px-3 py-1.5 rounded-[3px] bg-[#141414] border border-white/10 text-[11px] text-white/80"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rekam Jejak Karier */}
          <div className="pt-6 border-t border-white/5">
            <CrimsonLabel color={info.primaryColor}>Pengalaman</CrimsonLabel>
            <h2 className="mt-1 font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Rekam Jejak Karier &amp; Organisasi
            </h2>

            {customCareers.length > 0 ? (
              <ol className="mt-6 relative border-l border-white/10 space-y-7">
                {customCareers.map((car: any, idx: number) => (
                  <li key={idx} className="pl-7 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#D62828] flex items-center justify-center shadow-[0_0_14px_rgba(214,40,40,0.6)]">
                      <Briefcase className="w-3 h-3 text-white" />
                    </span>
                    {car.period && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">
                        {car.period}
                      </div>
                    )}
                    <h3 className="mt-0.5 text-sm font-bold text-white">{car.role}</h3>
                    {(car.organization || car.institution) && (
                      <p className="text-[11px] font-semibold text-white/70">
                        {car.organization || car.institution}
                      </p>
                    )}
                    {car.description && (
                      <p className="mt-1 text-[11px] text-white/55 leading-relaxed">
                        {car.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 p-5 rounded-[4px] bg-[#141414] border border-white/5 text-xs text-white/50">
                Informasi riwayat karier dan organisasi belum ditambahkan.
              </div>
            )}
          </div>

        </div>

        {/* Sticky Quote Box */}
        <div className="md:col-span-5">
          <div className="sticky top-24 p-7 rounded-[4px] bg-gradient-to-br from-[#D62828] to-[#5E0B0B] text-white shadow-2xl">
            <Quote className="w-7 h-7 opacity-60" />
            <p className="mt-4 font-outfit text-lg font-bold leading-snug">
              “Kebijakan terbaik bukan yang paling tebal dokumennya, melainkan yang paling nyata manfaatnya bagi rakyat.”
            </p>
            <p className="mt-4 text-[11px] text-white/75">— {info.officialFullName}</p>
          </div>
        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI NYATA LAPANGAN) ─── */}
      <section className="bg-[#121212] border-t border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CrimsonLabel color={info.primaryColor}>Aksi Nyata</CrimsonLabel>
              <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span className="px-3 py-1 rounded-[3px] bg-[#D62828]/20 border border-[#D62828]/40 text-xs font-bold text-[#E04848] self-start sm:self-auto">
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-[4px] bg-[#1A1A1A] border border-white/5 overflow-hidden hover:border-[#D62828]/50 transition-all flex flex-col justify-between"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {act.date && (
                          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded-[2px] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Calendar className="w-3 h-3 text-[#E04848]" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded-[2px] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <MapPin className="w-3 h-3 text-[#E04848]" />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#141414] flex flex-col items-center justify-center gap-2 text-white/40">
                        <Camera className="w-7 h-7 text-[#D62828]" />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-5 space-y-1.5">
                      <h4 className="font-outfit font-bold text-base text-white line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[10px] text-white/40">
                    <span className="font-bold flex items-center gap-1 text-[#E04848]">
                      <CheckCircle2 className="w-3 h-3 text-[#D62828]" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-[4px] bg-[#141414] border border-white/5 text-center space-y-2">
              <Camera className="w-8 h-8 text-[#D62828]/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION ASPIRASI WARGA ─── */}
      <section className="bg-[#0B0B0B] border-t border-white/5">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 sm:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E04848] block mb-1">
              Posko Aspirasi &amp; Reses Konstituen
            </span>
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              Sampaikan Aspirasi Anda Secara Langsung
            </h2>
            <p className="mt-2 text-xs text-white/60 leading-relaxed font-normal">
              Suara Anda adalah pedoman pengawasan kebijakan kami di parlemen. Kirimkan laporan atau ide pembangunan untuk Daerah Pemilihan {info.dapil}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CrimsonButton href={href('/kontak')} color={info.primaryColor} className="px-6 py-2.5">
              <span>Kirim Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </CrimsonButton>

            {info.waHotlineLink && (
              <a
                href={info.waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[3px] bg-white/10 hover:bg-white/15 text-white text-xs font-semibold shadow-md transition-all border border-white/10"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hotline WA</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
