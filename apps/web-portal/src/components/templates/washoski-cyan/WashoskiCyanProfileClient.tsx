'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  Users,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
  Landmark,
  Flag,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import { getWashoskiMemberInfo, useWashoskiHref, WASHOSKI_CYAN } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

export interface WashoskiCyanProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function WashoskiCyanProfileClient({
  member,
  theme,
  subdomain,
}: WashoskiCyanProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);

  const cleanLegislativeLevel = (info.legislativeLevel || 'DPRD PROVINSI').replace(/_/g, ' ');

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

  // 4. Custom Stats from dashboard layoutSchema (HANYA jika dikonfigurasi di dashboard)
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
    { icon: Flag, label: 'Fraksi Partai', value: info.party },
    { icon: Building2, label: 'Komisi / AKD', value: activeCommissionName || 'Komisi Terkait' },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}` },
  ];

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL SECTION (PURE NOIR & NEON CYAN ACCENT) ─── */}
      <section className="relative pt-32 pb-16 lg:pb-20 bg-[#000000] border-b border-[#1A1A1A] overflow-hidden text-left">
        {/* Subtle Background Radial Glow */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-15"
          style={{ backgroundColor: info.primaryColor }}
        />

        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Foto Portrait Dewan (Noir Frame with Cyan Halo) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div
                className="relative w-full max-w-[360px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#0A0A0A] border border-[#1E1E1E] shadow-2xl"
                style={{
                  boxShadow: `0 0 35px ${info.primaryColor}20`,
                }}
              >
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-[center_18%]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/avatar-dewan-budi.jpg';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="px-3.5 py-1.5 rounded-full bg-[#070707]/90 backdrop-blur-md border border-[#222] inline-flex items-center gap-2 text-xs font-bold text-white shadow-xs">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                    <span>{cleanLegislativeLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Ringkas & Mandat Kenegaraan */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-1">
                <span
                  className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.25em] block"
                  style={{ color: info.primaryColor }}
                >
                  ABOUT PERSONAL &bull; PROFIL RESMI
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#05DFD7]/10 border border-[#05DFD7]/30 text-[#05DFD7] text-xs font-bold uppercase tracking-wider mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Profil Resmi Legislator</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {info.officialFullName} <span style={{ color: info.primaryColor }}>.</span>
              </h1>

              {/* Thin Accent Bar with Cyan Glow */}
              <div
                className="w-14 h-[2px]"
                style={{
                  backgroundColor: info.primaryColor,
                  boxShadow: `0 0 8px ${info.primaryColor}`,
                }}
              />

              <p
                className="text-base sm:text-lg font-bold tracking-wide"
                style={{ color: info.primaryColor }}
              >
                {activeCommissionName || 'Komisi Terkait Parlemen'} &bull; {info.party} &bull; {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
              </p>

              <div className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed space-y-3.5 font-normal">
                <p>
                  Sebagai wakil rakyat di {cleanLegislativeLevel}, {info.officialFullName} menempatkan mandat konstituen sebagai prioritas utama dalam perumusan kebijakan daerah, pengawasan anggaran belanja (APBD), dan pengawalan peraturan daerah yang berkeadilan.
                </p>
                <p>
                  {info.bio ||
                    'Mengedepankan prinsip transparansi data dan keterbukaan informasi parlemen modern, ruang komunikasi resmi ini dihadirkan untuk memastikan setiap usulan warga didengar dan ditindaklanjuti secara nyata.'}
                </p>
              </div>

              {/* Digital Cursive Signature in Cyan */}
              <div className="pt-1 select-none">
                <span
                  className="text-2xl sm:text-3xl font-serif italic tracking-wide block"
                  style={{
                    color: info.primaryColor,
                    filter: `drop-shadow(0 0 12px ${info.primaryColor}80)`,
                    fontFamily:
                      "'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive, Georgia, serif",
                  }}
                >
                  {info.officialFullName}
                </span>
              </div>

              {/* 4 Fakta Lembaga & Jabatan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1C1C1C]">
                {facts.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#71717A] block">
                      {f.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white mt-1 block truncate">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Stats Cards (HANYA jika ada stats dari dashboard) */}
              {customStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {customStats.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] text-center space-y-1"
                    >
                      <div
                        className="text-2xl sm:text-3xl font-black"
                        style={{ color: info.primaryColor }}
                      >
                        {st.value}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider leading-tight">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tombol Aksi Cepat */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3 rounded-lg text-black text-xs sm:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  style={{
                    backgroundColor: info.primaryColor,
                    boxShadow: `0 0 20px ${info.primaryColor}40`,
                  }}
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {info.waHotlineLink && (
                  <a
                    href={info.waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-lg bg-[#0E0E0E] hover:bg-[#161616] border border-[#222] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Hotline WhatsApp</span>
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="py-16 bg-[#070707] border-b border-[#1A1A1A] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-8">
          <div>
            <span
              className="text-xs font-extrabold uppercase tracking-[0.25em] block mb-1"
              style={{ color: info.primaryColor }}
            >
              MANDAT KENEGARAAN
            </span>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-white">
              Penugasan Alat Kelengkapan Dewan (AKD) <span style={{ color: info.primaryColor }}>.</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#9CA3AF]">
              Tugas fungsi pengawasan regulasi, anggaran daerah, dan kemitraan strategis kementerian/lembaga.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div
                  className="p-6 sm:p-8 rounded-2xl bg-[#0E0E0E] border border-[#1E1E1E] shadow-xl space-y-4"
                  style={{
                    boxShadow: `0 0 25px ${info.primaryColor}0D`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A] pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-white">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span
                        className="px-3.5 py-1.5 rounded-lg text-xs font-black self-start sm:self-auto text-black shadow-xs"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#141414] border border-[#222]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#141414] border border-[#222]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi alokasi anggaran APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#141414] border border-[#222]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <Users className="w-4 h-4" />
                          <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                          {commissionPartners}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraksi Role */}
              {factionRole && (
                <div className="p-5 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#141414] text-xs font-bold text-white border border-[#262626]">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] shadow-xs flex items-start gap-3"
                      >
                        <ShieldCheck
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: info.primaryColor }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{body.name}</div>
                          {body.role && (
                            <div
                              className="text-[11px] font-semibold mt-0.5"
                              style={{ color: info.primaryColor }}
                            >
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
            <div className="p-8 rounded-2xl bg-[#0E0E0E] border border-[#1E1E1E] text-center space-y-2">
              <Landmark
                className="w-8 h-8 mx-auto opacity-70"
                style={{ color: info.primaryColor }}
              />
              <h4 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. TIGA PILAR KERJA PARLEMEN PRO-RAKYAT ─── */}
      <section className="py-16 bg-[#000000] border-b border-[#1A1A1A] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="mb-10 text-center max-w-xl mx-auto space-y-2">
            <span
              className="text-xs font-extrabold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              FOKUS PENGABDIAN
            </span>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-white">
              Tiga Pilar Kerja Parlemen <span style={{ color: info.primaryColor }}>.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9CA3AF]">
              Tiga pilar komitmen kerja legislatif dalam melayani masyarakat Daerah Pemilihan {info.dapil}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {info.visionPillars.map((pillar: any, idx: number) => {
              const Icon = pillarIcons[idx % pillarIcons.length];
              const num = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] hover:border-[#05DFD7] transition-all flex flex-col justify-between group"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-black text-2xl"
                        style={{ color: info.primaryColor }}
                      >
                        #{num}
                      </span>
                      <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#05DFD7] group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div
                        className="text-xs font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-[#9CA3AF] leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-semibold mt-4 text-[#71717A]">
                    <span>Amanah {info.dapil}</span>
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: info.primaryColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER ─── */}
      <section className="py-20 bg-[#070707] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Kolom Kiri: Riwayat Pengabdian & Karier (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.25em] block mb-1"
                  style={{ color: info.primaryColor }}
                >
                  PENGALAMAN &amp; DEDIKASI
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pengabdian Kenegaraan <span style={{ color: info.primaryColor }}>.</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Pengalaman dedikasi profesional dan kepemimpinan publik
                </p>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-4">
                  {customCareers.map((car: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] hover:border-[#05DFD7]/50 transition-colors"
                    >
                      {car.period && (
                        <span
                          className="text-xs font-bold block mb-1"
                          style={{ color: info.primaryColor }}
                        >
                          {car.period}
                        </span>
                      )}
                      <h4 className="text-base font-bold text-white">{car.role}</h4>
                      {(car.organization || car.institution) && (
                        <p className="text-xs font-semibold text-[#9CA3AF] mt-0.5">
                          {car.organization || car.institution}
                        </p>
                      )}
                      {car.description && (
                        <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed font-normal">
                          {car.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] text-xs text-[#9CA3AF]">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

            {/* Kolom Kanan: Pendidikan & Sertifikasi (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.25em] block mb-1"
                  style={{ color: info.primaryColor }}
                >
                  KUALIFIKASI AKADEMIK
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pendidikan <span style={{ color: info.primaryColor }}>.</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Kualifikasi akademik dan landasan keilmuan kebijakan publik
                </p>
              </div>

              {info.educationList.length > 0 ? (
                <div className="space-y-3.5">
                  {info.educationList.map((edu: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] flex items-start gap-4 hover:border-[#05DFD7]/40 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-lg bg-[#141414] flex items-center justify-center shrink-0"
                        style={{ color: info.primaryColor }}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{edu}</h4>
                        <p
                          className="text-xs font-semibold mt-1"
                          style={{ color: info.primaryColor }}
                        >
                          Kredensial Pendidikan Terverifikasi
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] text-xs text-[#9CA3AF]">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3.5 py-1.5 rounded-lg bg-[#121212] border border-[#222] text-xs font-semibold text-white"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Box Aspirasi & Hotline Ringkas */}
              <div className="p-6 rounded-xl bg-[#0C0C0C] border border-[#222] space-y-3 mt-4">
                <h3 className="text-base font-bold text-white">
                  Sampaikan Pertanyaan &amp; Audiensi
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Ingin mengajukan jadwal audiensi atau mengundang dalam diskusi publik di daerah pemilihan {info.dapil}?
                </p>
                <div className="pt-1 flex flex-wrap gap-2">
                  <Link
                    href={href('/kontak')}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    style={{ backgroundColor: info.primaryColor }}
                  >
                    <span>Hubungi Posko Reses</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                  {info.waHotlineLink && (
                    <a
                      href={info.waHotlineLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#333] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      <span>WA</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="py-16 bg-[#000000] border-y border-[#1A1A1A] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span
                className="text-xs font-extrabold uppercase tracking-[0.25em] block mb-1"
                style={{ color: info.primaryColor }}
              >
                AKSI NYATA
              </span>
              <h2 className="text-2xl lg:text-3xl font-black uppercase text-white">
                Dokumentasi Kinerja Turun ke Dapil <span style={{ color: info.primaryColor }}>.</span>
              </h2>
            </div>
            <span
              className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider self-start sm:self-auto text-black shadow-xs"
              style={{ backgroundColor: info.primaryColor }}
            >
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] overflow-hidden hover:border-[#05DFD7]/50 transition-all flex flex-col justify-between"
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
                          <div className="absolute top-3 left-3 bg-[#070707]/90 backdrop-blur-md border border-[#222] text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <Calendar
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-3 left-3 bg-[#070707]/90 backdrop-blur-md border border-[#222] text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <MapPin
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#141414] flex flex-col items-center justify-center gap-2 text-[#9CA3AF]">
                        <Camera
                          className="w-8 h-8"
                          style={{ color: info.primaryColor }}
                        />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-6 space-y-2">
                      <h4 className="font-bold text-base text-white line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-[#9CA3AF] leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#1C1C1C] mt-2 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                    <span
                      className="font-bold flex items-center gap-1"
                      style={{ color: info.primaryColor }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] text-center space-y-2">
              <Camera
                className="w-8 h-8 mx-auto opacity-60"
                style={{ color: info.primaryColor }}
              />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 6. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-6 lg:px-12 py-10">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 7. CALL TO ACTION POSKO ASPIRASI ─── */}
      <section className="py-14 bg-[#070707] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div
            className="p-8 sm:p-12 rounded-2xl bg-[#0E0E0E] border border-[#1E1E1E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            style={{
              boxShadow: `0 0 35px ${info.primaryColor}15`,
            }}
          >
            <div className="space-y-1.5 text-center md:text-left">
              <span
                className="text-[11px] font-extrabold uppercase tracking-widest block"
                style={{ color: info.primaryColor }}
              >
                POSKO ASPIRASI &amp; RESES KONSTITUEN
              </span>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white">
                Ingin Berdiskusi atau Menyampaikan Aspirasi?
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-xl font-normal">
                Posko reses dan kanal digital resmi terbuka untuk seluruh warga Daerah Pemilihan {info.dapil}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={href('/kontak')}
                className="px-7 py-3.5 rounded-lg text-black text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: info.primaryColor,
                  boxShadow: `0 0 25px ${info.primaryColor}40`,
                }}
              >
                <span>Hubungi Posko</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#2E2E2E] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Hotline WA</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </WashoskiCyanShell>
  );
}
