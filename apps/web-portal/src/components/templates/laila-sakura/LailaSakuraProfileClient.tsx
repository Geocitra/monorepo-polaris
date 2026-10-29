'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Building2,
  Landmark,
  Flag,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref, LAILA_SAKURA } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

export interface LailaSakuraProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function LailaSakuraProfileClient({
  member,
  theme,
  subdomain,
}: LailaSakuraProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

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
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL SECTION (MIDNIGHT NAVY & VIBRANT SAKURA PINK GLOW) ─── */}
      <section className="relative px-4 sm:px-6 pt-6 pb-14 bg-[#080D1A] text-left">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 overflow-hidden shadow-2xl">
          
          {/* Ambient Sakura Pink Radial Glow Spotlights */}
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ backgroundColor: info.primaryColor }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Foto Profil dengan Glowing Sakura Aura */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative w-[280px] sm:w-[340px] md:w-[380px] h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-[#070B14] border border-[#1E2B42] shadow-2xl flex items-end justify-center"
                style={{
                  boxShadow: `0 0 40px ${info.primaryColor}25`,
                }}
              >
                <div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full blur-[80px] pointer-events-none opacity-40"
                  style={{ backgroundColor: info.primaryColor }}
                />
                <img
                  src={info.photoUrl || '/images/dewan-standing-full.png'}
                  alt={info.officialFullName}
                  className="w-full h-full object-contain object-bottom relative z-10 filter brightness-105 contrast-105"
                  style={{
                    maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-standing-full.png';
                  }}
                />
              </div>
            </div>

            {/* Biodata & Identitas Parlemen */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold tracking-widest"
                style={{
                  color: info.primaryColor,
                  backgroundColor: `${info.primaryColor}1F`,
                  borderColor: `${info.primaryColor}4D`,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>🌸 PROFIL RESMI ANGGOTA LEGISLATIF 🌸</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {info.officialFullName}
              </h1>

              <p
                className="text-sm sm:text-base font-semibold"
                style={{ color: info.primaryColor }}
              >
                {activeCommissionName || 'Komisi Terkait Parlemen'} &bull; {info.party} &bull; {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
              </p>

              {/* 4 Fakta Parlemen (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#1E2B42]">
                {facts.map((f, idx) => (
                  <div key={idx}>
                    <span className="text-[11px] font-mono uppercase text-[#64748B] block">
                      {f.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate block">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed space-y-2.5 font-normal pt-1">
                <p>
                  Sebagai wakil rakyat di {cleanLegislativeLevel}, {info.officialFullName} mendedikasikan seluruh amanah jabatan untuk memperjuangkan kebutuhan riil masyarakat di Daerah Pemilihan {info.dapil}, mengawal transparansi anggaran belanja (APBD), dan memastikan pembentukan perda yang berkeadilan.
                </p>
                <p>
                  {info.bio ||
                    'Prinsip keterbukaan publik, integritas keparlemenan, dan akuntabilitas kebijakan senantiasa dijaga agar setiap warga mendapatkan akses advokasi yang cepat, tanggap, dan solutif.'}
                </p>
              </div>



            </div>

          </div>

        </div>
      </section>

      {/* ─── 2. DYNAMIC STATS (HANYA DARI DASHBOARD) ─── */}
      {customStats.length > 0 && (
        <section className="bg-[#080D1A] pb-12 text-left">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {customStats.map((st: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2B42] space-y-1 hover:border-[#FF4D8D]/50 transition-colors shadow-lg text-center"
                >
                  <span
                    className="text-3xl sm:text-4xl font-black font-mono tracking-tight block"
                    style={{ color: info.primaryColor }}
                  >
                    {st.value}
                  </span>
                  <div className="text-[10px] text-[#A0ABC0] font-mono uppercase tracking-wider leading-tight">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="py-16 bg-[#050811] border-t border-[#1E2B42] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-8">
          <div>
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block mb-1"
              style={{ color: info.primaryColor }}
            >
              MANDAT KENEGARAAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              🌸 Penugasan Alat Kelengkapan Dewan (AKD) 🌸
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A0ABC0]">
              Tugas fungsi pengawasan regulasi, anggaran daerah, dan kemitraan strategis kementerian/lembaga.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div
                  className="p-6 sm:p-8 rounded-3xl bg-[#0D1527] border border-[#1E2B42] shadow-xl space-y-4"
                  style={{
                    boxShadow: `0 0 25px ${info.primaryColor}0D`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B42] pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-white">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span
                        className="px-4 py-1.5 rounded-full text-xs font-extrabold self-start sm:self-auto text-white shadow-xs"
                        style={{
                          background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
                        }}
                      >
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-5 rounded-2xl bg-[#070B14] border border-[#1E2B42]">
                        <div
                          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider"
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
                      <div className="space-y-1.5 p-5 rounded-2xl bg-[#070B14] border border-[#1E2B42]">
                        <div
                          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider"
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
                      <div className="space-y-1.5 p-5 rounded-2xl bg-[#070B14] border border-[#1E2B42]">
                        <div
                          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider"
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
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2B42] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span
                    className="px-3.5 py-1.5 rounded-full bg-[#070B14] text-xs font-mono font-bold border border-[#263754]"
                    style={{ color: info.primaryColor }}
                  >
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A0ABC0] block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-2xl bg-[#0D1527] border border-[#1E2B42] shadow-xs flex items-start gap-3"
                      >
                        <ShieldCheck
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: info.primaryColor }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{body.name}</div>
                          {body.role && (
                            <div
                              className="text-[11px] font-mono font-semibold mt-0.5"
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
            <div className="p-8 rounded-3xl bg-[#0D1527] border border-[#1E2B42] text-center space-y-2">
              <Landmark
                className="w-8 h-8 mx-auto opacity-70"
                style={{ color: info.primaryColor }}
              />
              <h4 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-[#A0ABC0] max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. TIGA PILAR KOMITMEN PARLEMEN PRO-RAKYAT ─── */}
      <section className="py-16 lg:py-20 bg-[#080D1A] border-t border-[#1E2B42] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              ARAH PERJUANGAN PARLEMEN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              🌸 3 Pilar Komitmen Parlemen Pro-Rakyat 🌸
            </h2>
            <p className="text-xs sm:text-sm text-[#A0ABC0]">
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
                  className="bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-7 hover:border-[#FF4D8D]/50 transition-all flex flex-col justify-between group space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono font-black text-2xl"
                        style={{ color: info.primaryColor }}
                      >
                        #{num}
                      </span>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${info.primaryColor}1F`,
                          borderColor: `${info.primaryColor}4D`,
                          color: info.primaryColor,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3
                      className="font-bold text-base sm:text-lg text-white transition-colors"
                    >
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div
                        className="text-xs font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-[#A0ABC0] leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1E2B42] flex items-center justify-between text-[11px] font-semibold mt-4 text-[#64748B]">
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

      {/* ─── 5. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER ─── */}
      <section className="py-16 lg:py-20 bg-[#060A14] border-t border-[#1E2B42] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Riwayat Pendidikan (Kiri) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${info.primaryColor}1F`,
                    borderColor: `${info.primaryColor}4D`,
                    color: info.primaryColor,
                  }}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Riwayat Pendidikan Formal</h3>
                  <p className="text-xs text-[#64748B]">Kualifikasi akademik dan landasan keilmuan kebijakan publik</p>
                </div>
              </div>

              {info.educationList.length > 0 ? (
                <div className="space-y-6 pl-4 border-l-2 border-[#1E2B42]">
                  {info.educationList.map((edu: string, idx: number) => (
                    <div key={idx} className="relative pl-6 space-y-1">
                      <div
                        className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#060A14]"
                        style={{ backgroundColor: idx === 0 ? info.primaryColor : '#4A1D2F' }}
                      />
                      <h4 className="text-sm font-bold text-white">{edu}</h4>
                      <p
                        className="text-xs font-mono"
                        style={{ color: info.primaryColor }}
                      >
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2B42] text-xs text-[#A0ABC0]">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#1E2B42] space-y-2">
                  <span className="text-[10px] font-mono text-[#A0ABC0] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3.5 py-1.5 rounded-full bg-[#0D1527] border border-[#263754] text-xs font-semibold text-white"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Karier & Pengabdian Parlemen (Kanan) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: `${info.primaryColor}1F`,
                    borderColor: `${info.primaryColor}4D`,
                    color: info.primaryColor,
                  }}
                >
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Karier &amp; Pengabdian Parlemen</h3>
                  <p className="text-xs text-[#64748B]">Pengalaman dedikasi profesional dan kepemimpinan publik</p>
                </div>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-6 pl-4 border-l-2 border-[#1E2B42]">
                  {customCareers.map((car: any, idx: number) => (
                    <div key={idx} className="relative pl-6 space-y-1">
                      <div
                        className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#060A14]"
                        style={{ backgroundColor: idx === 0 ? info.primaryColor : '#4A1D2F' }}
                      />
                      {car.period && (
                        <span
                          className="text-[11px] font-mono font-bold block"
                          style={{ color: idx === 0 ? info.primaryColor : '#8E9BB0' }}
                        >
                          {car.period}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white">{car.role}</h4>
                      {(car.organization || car.institution) && (
                        <p
                          className="text-xs font-semibold"
                          style={{ color: info.primaryColor }}
                        >
                          {car.organization || car.institution}
                        </p>
                      )}
                      {car.description && (
                        <p className="text-xs text-[#A0ABC0] leading-relaxed font-normal">{car.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2B42] text-xs text-[#A0ABC0]">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="py-16 bg-[#080D1A] border-y border-[#1E2B42] text-left">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span
                className="text-xs font-mono font-bold uppercase tracking-[0.25em] block mb-1"
                style={{ color: info.primaryColor }}
              >
                AKSI NYATA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                🌸 Dokumentasi Kinerja Turun ke Dapil 🌸
              </h2>
            </div>
            <span
              className="px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider self-start sm:self-auto text-white shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
              }}
            >
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-3xl bg-[#0D1527] border border-[#1E2B42] overflow-hidden hover:border-[#FF4D8D]/50 transition-all flex flex-col justify-between"
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
                          <div className="absolute top-3 left-3 bg-[#080D1A]/90 backdrop-blur-md border border-[#263754] text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                            <Calendar
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-3 left-3 bg-[#080D1A]/90 backdrop-blur-md border border-[#263754] text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                            <MapPin
                              className="w-3 h-3"
                              style={{ color: info.primaryColor }}
                            />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#070B14] flex flex-col items-center justify-center gap-2 text-[#A0ABC0]">
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
                        <p className="text-xs text-[#A0ABC0] leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#1E2B42] mt-2 flex items-center justify-between text-[11px] text-[#A0ABC0]">
                    <span
                      className="font-bold font-mono flex items-center gap-1"
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
            <div className="p-8 rounded-3xl bg-[#0D1527] border border-[#1E2B42] text-center space-y-2">
              <Camera
                className="w-8 h-8 mx-auto opacity-60"
                style={{ color: info.primaryColor }}
              />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-[#A0ABC0] max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-6 lg:px-12 py-10">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION POSKO ASPIRASI ─── */}
      <section className="py-16 px-4 sm:px-6 bg-[#080D1A] text-center">
        <div className="max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              POSKO ASPIRASI &amp; RESES KONSTITUEN
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ingin Berdiskusi atau Menyampaikan Aspirasi? 🌸
            </h2>
            <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed">
              Posko reses dan kanal digital resmi terbuka untuk seluruh warga Daerah Pemilihan {info.dapil}. Masukan warga adalah landasan perjuangan kami dalam rapat paripurna dan pengawalan APBD.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(255,77,141,0.4)] hover:shadow-[0_6px_28px_rgba(255,77,141,0.6)]"
                style={{
                  background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
                }}
              >
                <span>Kirim Aspirasi Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#070B14] hover:bg-[#131F38] border border-[#263754] text-white text-xs font-bold tracking-wide transition-all"
                >
                  <MessageCircle
                    className="w-4 h-4"
                    style={{ color: info.primaryColor }}
                  />
                  <span>Hotline WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </LailaSakuraShell>
  );
}
