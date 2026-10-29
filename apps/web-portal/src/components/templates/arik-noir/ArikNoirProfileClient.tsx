'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  FileText,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Scale,
  Sparkles,
  Landmark,
  Flag,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  BookOpen,
  Building2,
} from 'lucide-react';
import { getArikMemberInfo, useArikHref, ARIK_NOIR } from './utils';
import { ArikNoirShell } from './ArikNoirShell';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

export interface ArikNoirProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function ArikNoirProfileClient({
  member,
  theme,
  subdomain,
}: ArikNoirProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

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
    { label: 'LEMBAGA', value: cleanLegislativeLevel },
    { label: 'FRAKSI PARTAI', value: info.party },
    { label: 'KOMISI / AKD', value: activeCommissionName || 'Komisi Terkait' },
    { label: 'DAERAH PEMILIHAN', value: info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}` },
  ];

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL SECTION (PITCH BLACK & WARM CHAMPAGNE GOLD) ─── */}
      <section className="pt-36 pb-20 bg-[#0A0A0A] border-b border-[#1A1A1A] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Portrait Dewan (Moody Frame dengan Aksen Champagne) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div
                className="relative w-full max-w-[380px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#111111] border border-[#222222] shadow-2xl"
                style={{
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(197, 168, 128, 0.08)',
                }}
              >
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-standing-full.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-[#161616]/90 border border-[#2A2A2A] text-[10px] font-mono uppercase tracking-wider text-[#C5A880] inline-block mb-2 shadow-xs">
                    {info.party} &bull; {cleanLegislativeLevel}
                  </span>
                  <p className="text-base font-bold text-[#F5F2EB]">
                    {info.officialFullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Ringkas & Dual-Font Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-[#C5A880] text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PROFIL RESMI LEGISLATOR</span>
              </div>

              {/* Dual-Font Giant Headline khas Arik Noir */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-[#F5F2EB] leading-[1.08]">
                  {info.officialFullName}
                </h1>
                <p className="text-2xl sm:text-4xl font-serif italic font-normal tracking-tight leading-[1.1] text-[#E8DCC4]">
                  &amp; Wakil Rakyat {cleanLegislativeLevel}
                </p>
              </div>

              <p className="text-sm sm:text-base font-semibold text-[#C5A880]">
                {activeCommissionName || 'Komisi Terkait Parlemen'} &bull; {info.party} &bull; {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
              </p>

              <div className="text-sm text-[#8E8A83] leading-relaxed space-y-3.5 font-normal">
                <p>
                  Sebagai representasi publik di {cleanLegislativeLevel}, {info.officialFullName} menempatkan mandat konstituen sebagai amanah utama dalam fungsi pengawasan peraturan perundang-undangan daerah, pengawalan efisiensi anggaran belanja (APBD), dan advokasi berkelanjutan di Daerah Pemilihan {info.dapil}.
                </p>
                <p>
                  {info.bio ||
                    'Prinsip keterbukaan informasi parlemen modern dan akuntabilitas kebijakan publik senantiasa menjadi kompas pengabdian agar suara warga tersalurkan secara nyata ke meja sidang legislatif.'}
                </p>
              </div>

              {/* Data Parlemen (Mono Uppercase Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1C1C1C]">
                {facts.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#111111] border border-[#1E1E1E]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] block">
                      {f.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#F5F2EB] mt-1 block truncate">
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
                      className="p-4 rounded-xl bg-[#111111] border border-[#1E1E1E] text-center space-y-1"
                    >
                      <div className="text-2xl sm:text-3xl font-black text-[#E8DCC4]">
                        {st.value}
                      </div>
                      <div className="text-[10px] text-[#8E8A83] font-mono uppercase tracking-wider leading-tight">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tombol Aksi Cepat */}
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {info.waHotlineLink && (
                  <a
                    href={info.waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#141414] border border-[#262626] text-[#F5F2EB] hover:border-[#C5A880] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Hotline WA</span>
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="py-16 bg-[#070707] border-b border-[#161616] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
              MANDAT KENEGARAAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#F5F2EB]">
              Penugasan Alat Kelengkapan Dewan (AKD)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#8E8A83]">
              Tugas fungsi pengawasan regulasi, anggaran daerah, dan kemitraan strategis kementerian/lembaga.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1E1E1E] shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#181818] pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852]">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-[#F5F2EB]">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto bg-[#E8DCC4] text-[#0A0A0A] shadow-xs">
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#161616] border border-[#242424]">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#C5A880]">
                          <BookOpen className="w-4 h-4" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#161616] border border-[#242424]">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#C5A880]">
                          <BookOpen className="w-4 h-4" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi alokasi anggaran APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-5 rounded-xl bg-[#161616] border border-[#242424]">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#C5A880]">
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
                <div className="p-5 rounded-xl bg-[#111111] border border-[#1E1E1E] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852]">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-extrabold text-base sm:text-lg text-[#F5F2EB] mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#181818] text-xs font-mono font-bold text-[#E8DCC4] border border-[#262626]">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8A83] block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-xl bg-[#111111] border border-[#1E1E1E] shadow-xs flex items-start gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#C5A880]" />
                        <div>
                          <div className="text-xs font-bold text-[#F5F2EB]">{body.name}</div>
                          {body.role && (
                            <div className="text-[11px] font-mono font-semibold mt-0.5 text-[#C5A880]">
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
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1E1E1E] text-center space-y-2">
              <Landmark className="w-8 h-8 mx-auto text-[#C5A880] opacity-70" />
              <h4 className="text-sm font-bold text-[#F5F2EB]">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-[#8E8A83] max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. TIGA PILAR KERJA PARLEMEN PRO-RAKYAT ─── */}
      <section className="py-20 bg-[#0A0A0A] border-t border-[#161616] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] block text-[#C5A880]">
              PILAR TATA KELOLA
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#F5F2EB]">
              Tiga Pilar Kerja Parlemen
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8A83]">
              Tiga pilar komitmen kerja legislatif dalam melayani masyarakat Daerah Pemilihan {info.dapil}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {info.visionPillars.map((pillar: any, idx: number) => {
              const num = String(idx + 1).padStart(2, '0');
              const labels = ['LEGISLASI', 'BUDGETING & FISKAL', 'ADVOKASI KONSTITUEN'];
              const label = labels[idx] || 'PENGABDIAN';

              return (
                <div
                  key={idx}
                  className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 hover:border-[#C5A880]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] block text-[#C5A880]">
                      {num} // {label}
                    </span>

                    <h3 className="text-lg font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors">
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div className="text-xs font-mono font-bold text-[#C5A880]">
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-[#8E8A83] leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#181818] flex items-center justify-between text-[11px] font-semibold mt-4 text-[#5C5852]">
                    <span>Amanah {info.dapil}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER ─── */}
      <section className="py-20 bg-[#070707] border-t border-[#161616] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Pendidikan (Kiri) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#C5A880]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F2EB]">Riwayat Pendidikan Formal</h3>
                  <p className="text-xs text-[#8E8A83]">Kualifikasi akademik dan landasan keilmuan kebijakan publik</p>
                </div>
              </div>

              {info.educationList.length > 0 ? (
                <div className="space-y-4 border-l border-[#1E1E1E] pl-6 ml-4">
                  {info.educationList.map((edu: string, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
                      <h4 className="text-sm font-bold text-[#F5F2EB]">{edu}</h4>
                      <p className="text-xs text-[#C5A880] mt-0.5 font-mono">Kredensial Pendidikan Terverifikasi</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#111111] border border-[#1E1E1E] text-xs text-[#8E8A83]">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#161616] space-y-2">
                  <span className="text-[10px] font-mono text-[#8E8A83] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#222] text-xs font-semibold text-[#F5F2EB]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pengabdian & Organisasi (Kanan) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#C5A880]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F2EB]">Rekam Jejak Karier &amp; Organisasi</h3>
                  <p className="text-xs text-[#8E8A83]">Pengalaman dedikasi profesional dan kepemimpinan publik</p>
                </div>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-4 border-l border-[#1E1E1E] pl-6 ml-4">
                  {customCareers.map((car: any, idx: number) => (
                    <div key={idx} className="relative pt-1">
                      <div className="absolute -left-[31px] top-2.5 w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
                      {car.period && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880] block">
                          {car.period}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-[#F5F2EB] mt-0.5">{car.role}</h4>
                      {(car.organization || car.institution) && (
                        <p className="text-xs text-[#8E8A83] mt-0.5">{car.organization || car.institution}</p>
                      )}
                      {car.description && (
                        <p className="text-xs text-[#8E8A83] mt-1 leading-relaxed font-normal">{car.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#111111] border border-[#1E1E1E] text-xs text-[#8E8A83]">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="py-16 bg-[#0A0A0A] border-y border-[#161616] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-1">
                AKSI NYATA
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#F5F2EB]">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider self-start sm:self-auto bg-[#E8DCC4] text-[#0A0A0A] shadow-xs">
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-2xl bg-[#111111] border border-[#1E1E1E] overflow-hidden hover:border-[#C5A880]/50 transition-all flex flex-col justify-between"
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
                          <div className="absolute top-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222] text-[#F5F2EB] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                            <Calendar className="w-3 h-3 text-[#C5A880]" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222] text-[#F5F2EB] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                            <MapPin className="w-3 h-3 text-[#C5A880]" />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#161616] flex flex-col items-center justify-center gap-2 text-[#8E8A83]">
                        <Camera className="w-8 h-8 text-[#C5A880]" />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-6 space-y-2">
                      <h4 className="font-bold text-base text-[#F5F2EB] line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-[#8E8A83] leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#181818] mt-2 flex items-center justify-between text-[11px] text-[#8E8A83]">
                    <span className="font-bold font-mono flex items-center gap-1 text-[#C5A880]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1E1E1E] text-center space-y-2">
              <Camera className="w-8 h-8 mx-auto text-[#C5A880] opacity-60" />
              <h4 className="text-sm font-bold text-[#F5F2EB]">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-[#8E8A83] max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 6. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 py-10">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 7. CALL TO ACTION POSKO ASPIRASI ─── */}
      <section className="py-16 bg-[#070707] text-left">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div
            className="p-8 sm:p-12 rounded-3xl bg-[#111111] border border-[#1E1E1E] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
            style={{
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(197, 168, 128, 0.06)',
            }}
          >
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest block text-[#C5A880]">
                POSKO ASPIRASI &amp; RESES KONSTITUEN
              </span>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#F5F2EB]">
                Ingin Berdiskusi atau Menyampaikan Aspirasi?
              </h2>
              <p className="text-xs sm:text-sm text-[#8E8A83] max-w-xl font-normal">
                Posko reses dan kanal digital resmi terbuka untuk seluruh warga Daerah Pemilihan {info.dapil}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={href('/kontak')}
                className="px-7 py-3.5 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:bg-white transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Hubungi Posko</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-[#161616] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-[#F5F2EB] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Hotline WA</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </ArikNoirShell>
  );
}
