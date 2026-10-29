'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark,
  Building2,
  Flag,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  Scale,
  Megaphone,
  ArrowRight,
  User,
  Sparkles,
  CheckCircle2,
  Calendar,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  BookOpen,
  Users,
} from 'lucide-react';
import { ParichayAmberShell } from './ParichayAmberShell';
import { getParichayMemberInfo, useParichayHref } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

export interface ParichayAmberProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function ParichayAmberProfileClient({
  member,
  theme,
  subdomain,
}: ParichayAmberProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getParichayMemberInfo(member, theme, subdomain);
  const href = useParichayHref(subdomain);

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
    { icon: Flag, label: 'Fraksi Partai', value: info.party },
    { icon: Building2, label: 'Komisi / AKD', value: activeCommissionName || 'Komisi Terkait' },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}` },
  ];

  return (
    <ParichayAmberShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
      showMasthead={false}
    >
      {/* ─── 1. HEADER SECTION PROFIL ─── */}
      <section className="relative py-16 bg-[#FFF9ED] border-b border-[#F3E8D6] overflow-hidden text-left">
        {/* Decorative Arcs */}
        <div className="absolute -left-20 -top-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/60 pointer-events-none" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center">
              <span
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: info.primaryColor }}
              >
                BIOGRAFI &amp; REKAM JEJAK
              </span>
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-[#1E1E1E] tracking-tight">
              Profil Lengkap Dewan
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Mengenal lebih dekat dedikasi, rekam jejak pengabdian, dan visi keterbukaan publik dari {info.officialFullName}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. BIOGRAFI UTAMA & POTRET ─── */}
      <section className="py-16 lg:py-20 bg-white text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* Kolom Kiri: Foto Potret & Kartu Identitas Parlemen */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#F3E8D6] shadow-lg">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/dewan-standing-crop.png';
                    }}
                  />
                </div>
                <div className="p-6 bg-white border-t border-[#F3E8D6]">
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    {info.officialFullName}
                  </h3>
                  <p className="text-xs font-bold text-[#6B7280] mt-1">
                    {cleanLegislativeLevel} &bull; {info.party}
                  </p>
                  <p
                    className="text-xs font-semibold mt-1"
                    style={{ color: info.primaryColor }}
                  >
                    {activeCommissionName || 'Komisi Terkait DPR'} {commissionRole ? `(${commissionRole})` : ''} &bull; Daerah Pemilihan {info.dapil}
                  </p>
                </div>
              </div>

              {/* Data Lembaga & Jabatan */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-[#E5E7EB] space-y-3.5">
                {facts.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                          {f.label}
                        </div>
                        <div className="text-xs font-bold text-[#1E1E1E]">
                          {f.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan: Narasi Bio, Metrik & Aksi Cepat */}
            <div className="lg:col-span-7 space-y-8 select-text">
              <div className="space-y-4">
                <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
                  Integritas &amp; Pengabdian Nyata untuk Warga
                </h2>
                <div className="text-xs sm:text-sm text-[#4B5563] leading-relaxed space-y-3.5">
                  <p>
                    Sebagai wakil rakyat di {cleanLegislativeLevel}, {info.officialFullName} menempatkan aspirasi warga sebagai kompas utama dalam setiap perumusan kebijakan daerah, pembahasan anggaran pendapatan dan belanja daerah (APBD), serta pengawasan kinerja satuan kerja perangkat daerah.
                  </p>
                  <p>
                    {info.bio ||
                      'Mengedepankan prinsip transparansi dan akuntabilitas parlemen modern, setiap kanal komunikasi publik dibuka seluas-luasnya untuk memastikan keluhan, usulan, dan kebutuhan masyarakat di daerah pemilihan dapat segera diadvokasikan secara konkret.'}
                  </p>
                </div>
              </div>

              {/* Dynamic Stats Cards (HANYA jika ada stats dari dashboard) */}
              {customStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {customStats.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6] text-center space-y-1"
                    >
                      <div
                        className="text-2xl sm:text-3xl font-extrabold"
                        style={{ color: info.primaryColor }}
                      >
                        {st.value}
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider leading-tight">
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
                  className="px-7 py-3 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {info.waHotlineLink && (
                  <a
                    href={info.waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3E8D6] border border-[#E5E7EB] text-[#1E1E1E] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Hotline WhatsApp</span>
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#E5E7EB] text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 space-y-8">
          <div>
            <span
              className="text-xs font-black uppercase tracking-[0.2em] block mb-1"
              style={{ color: info.primaryColor }}
            >
              MANDAT KENEGARAAN
            </span>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
              Penugasan Alat Kelengkapan Dewan (AKD)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
              Tugas fungsi pengawasan regulasi, anggaran daerah, dan kemitraan strategis kementerian/lembaga.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-[#1E1E1E]">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto text-white shadow-xs"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-4 rounded-xl bg-[#FFF9ED] border border-[#F3E8D6]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-4 rounded-xl bg-[#FFF9ED] border border-[#F3E8D6]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi alokasi anggaran APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-4 rounded-xl bg-[#FFF9ED] border border-[#F3E8D6]">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor }}
                        >
                          <Users className="w-4 h-4" />
                          <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                          {commissionPartners}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraksi Role */}
              {factionRole && (
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-extrabold text-base sm:text-lg text-[#1E1E1E] mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-xs font-bold text-[#1E1E1E] border border-[#E5E7EB]">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-start gap-3"
                      >
                        <ShieldCheck
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: info.primaryColor }}
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1E1E1E]">{body.name}</div>
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
            <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-center space-y-2">
              <Landmark className="w-8 h-8 text-[#FFA800]/60 mx-auto" />
              <h4 className="text-sm font-bold text-[#1E1E1E]">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. 3 PILAR KOMITMEN PARLEMEN PRO-RAKYAT ─── */}
      <section className="py-16 bg-white text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center max-w-xl mx-auto space-y-2">
            <span
              className="text-xs font-black uppercase tracking-[0.2em] block"
              style={{ color: info.primaryColor }}
            >
              VISI ADVOKASI
            </span>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
              3 Pilar Komitmen Parlemen Pro-Rakyat
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
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
                  className="p-7 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6] text-left space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-black text-2xl"
                        style={{ color: info.primaryColor }}
                      >
                        #{num}
                      </span>
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-[#1E1E1E]">
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

                    <p className="text-xs text-[#6B7280] leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F3E8D6] flex items-center justify-between text-[11px] text-[#6B7280] font-semibold mt-4">
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

      {/* ─── 5. RIWAYAT PENDIDIKAN & KARIER ─── */}
      <section className="py-16 bg-white border-t border-[#F3E8D6] text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* Riwayat Pendidikan Formal (Kiri) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    Riwayat Pendidikan Formal
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Kualifikasi akademik dan landasan keilmuan kebijakan publik
                  </p>
                </div>
              </div>

              {info.educationList.length > 0 ? (
                <div className="space-y-3.5">
                  {info.educationList.map((edu: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#FFA800] transition-colors"
                    >
                      <h4 className="font-bold text-sm text-[#1E1E1E]">{edu}</h4>
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: info.primaryColor }}
                      >
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#6B7280]">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#F3E8D6] text-xs font-semibold text-[#1E1E1E]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Riwayat Pengabdian & Karier (Kanan) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    Rekam Jejak Karier &amp; Organisasi
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Pengalaman dedikasi profesional dan kepemimpinan publik
                  </p>
                </div>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-3.5">
                  {customCareers.map((car: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#FFA800] transition-colors"
                    >
                      {car.period && (
                        <span
                          className="text-[10px] font-black uppercase tracking-wider block"
                          style={{ color: info.primaryColor }}
                        >
                          {car.period}
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-[#1E1E1E] mt-0.5">
                        {car.role}
                      </h4>
                      {(car.organization || car.institution) && (
                        <p className="text-xs font-semibold text-[#6B7280] mt-0.5">
                          {car.organization || car.institution}
                        </p>
                      )}
                      {car.description && (
                        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                          {car.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#6B7280]">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#E5E7EB] text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span
                className="text-xs font-black uppercase tracking-[0.2em] block mb-1"
                style={{ color: info.primaryColor }}
              >
                AKSI NYATA
              </span>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span
              className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto text-white shadow-xs"
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
                  className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
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
                          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-white/20 text-[#1E1E1E] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <Calendar
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-white/20 text-[#1E1E1E] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <MapPin
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#FFF9ED] flex flex-col items-center justify-center gap-2 text-[#6B7280]">
                        <Camera
                          className="w-8 h-8"
                          style={{ color: info.primaryColor }}
                        />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-6 space-y-2">
                      <h4 className="font-extrabold text-base text-[#1E1E1E] line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#E5E7EB] mt-2 flex items-center justify-between text-[11px] text-[#6B7280]">
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
            <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-center space-y-2">
              <Camera
                className="w-8 h-8 mx-auto opacity-60"
                style={{ color: info.primaryColor }}
              />
              <h4 className="text-sm font-bold text-[#1E1E1E]">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-6 lg:px-10 py-8">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION POSKO ASPIRASI ─── */}
      <section className="py-12 bg-white text-left">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <span
                className="text-[11px] font-black uppercase tracking-widest block"
                style={{ color: info.primaryColor }}
              >
                POSKO ASPIRASI &amp; RESES KONSTITUEN
              </span>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
                Ingin Berdiskusi atau Menyampaikan Aspirasi?
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] max-w-xl font-normal">
                Posko reses dan kanal digital resmi terbuka untuk seluruh warga Daerah Pemilihan {info.dapil}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={href('/kontak')}
                className="px-7 py-3.5 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: info.primaryColor }}
              >
                <span>Hubungi Posko</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E5E7EB] text-[#1E1E1E] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Hotline WA</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </ParichayAmberShell>
  );
}
