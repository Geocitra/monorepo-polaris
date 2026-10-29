'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  GraduationCap,
  Briefcase,
  FileText,
  Clock,
  HeartHandshake,
  Landmark,
  Scale,
  Camera,
  MessageCircle,
  Compass,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface NayaEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NayaEditorialProfileClient({
  member,
  theme,
  subdomain,
}: NayaEditorialProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#272A20',
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

  const cleanLegislativeLevel = (legislativeLevel || 'DPRD PROVINSI').replace(/_/g, ' ');

  const [activeTab, setActiveTab] = useState<
    'semua' | 'komisi' | 'visi' | 'pendidikan' | 'karier' | 'lapangan'
  >('semua');

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
    commissionData?.name?.trim() ||
    commissionName?.trim() ||
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
  const customCareers =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && (c.role?.trim() || c.organization?.trim()))
      : Array.isArray(careersList) && careersList.length > 0
      ? careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  // 7. Vision Pillars icons
  const pillarIcons = [Compass, Building2, HeartHandshake];

  return (
    <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto space-y-16 text-left">
      
      {/* ─── 1. TOP PROFILE SHOWCASE: ARCH PORTRAIT & BIOGRAPHY CARD ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Arch Portrait Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[420px]">
            <div className="w-full h-[420px] sm:h-[490px] rounded-t-full rounded-b-[40px] overflow-hidden bg-[#ECE8DF] border border-[#DBD6C9] shadow-xl relative group">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#25281E]/30 to-transparent pointer-events-none" />
            </div>

            {/* Floating Dark Olive Badge */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#35382B] text-white p-4 sm:p-5 rounded-[22px] shadow-2xl max-w-[210px] sm:max-w-[230px] border border-white/10 z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[#BFC3B2] uppercase tracking-wider">Amanah Publik</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E0E5D4]" />
              </div>
              <p className="font-cormorant italic text-base text-white/95 leading-tight">
                Advokasi dengan Hati.
              </p>
              <p className="font-cormorant font-bold text-lg text-white leading-tight mt-0.5">
                Hasil Nyata untuk Daerah.
              </p>
            </div>
          </div>
        </div>

        {/* Bio & Identity Column */}
        <div className="lg:col-span-7 select-text space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{cleanLegislativeLevel} • {party}</span>
            </span>
            <span className="px-3.5 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-xs font-semibold">
              {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
            </span>
          </div>

          <h1 className="font-cormorant text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal text-[#24271D] leading-[1.1] tracking-tight">
            {officialFullName}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-[#666B57] uppercase tracking-wider flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#4E5340]" />
            <span>
              {activeCommissionName || 'Komisi Terkait DPR'}
              {commissionRole ? ` (${commissionRole})` : ''} • Daerah Pemilihan {dapil}
            </span>
          </p>

          <p className="text-sm sm:text-base text-[#616556] leading-relaxed font-normal pt-2">
            {bio}
          </p>

          {/* Institutional Telemetry Diagnostics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-[#737768] tracking-wider">Lembaga</div>
              <div className="font-cormorant text-lg sm:text-xl font-bold text-[#24271D] mt-0.5 truncate">
                {cleanLegislativeLevel}
              </div>
              <div className="text-[10px] text-[#4E5340] font-bold mt-0.5">Terpilih</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-[#737768] tracking-wider">Penugasan</div>
              <div className="font-cormorant text-lg sm:text-xl font-bold text-[#24271D] mt-0.5 truncate">
                {activeCommissionName || 'Komisi'}
              </div>
              <div className="text-[10px] text-[#737768] font-semibold truncate mt-0.5">
                {commissionRole || 'Parlemen'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-[#737768] tracking-wider">Fraksi</div>
              <div className="font-cormorant text-lg sm:text-xl font-bold text-[#24271D] mt-0.5 truncate">
                {party}
              </div>
              <div className="text-[10px] text-[#737768] font-semibold mt-0.5">Parlemen</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-[#737768] tracking-wider">Wilayah</div>
              <div className="font-cormorant text-lg sm:text-xl font-bold text-[#24271D] mt-0.5 truncate">
                {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
              </div>
              <div className="text-[10px] text-[#4E5340] font-bold mt-0.5">Konstituen</div>
            </div>
          </div>

          {/* Dynamic Stat Blocks (HANYA tampil bila diisi dari dashboard) */}
          {customStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              {customStats.map((st: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs"
                >
                  <Award className="w-5 h-5 text-[#4E5340] mb-2" />
                  <div className="font-cormorant text-2xl font-bold text-[#24271D]">
                    {st.value}
                  </div>
                  <div className="text-xs text-[#737768] font-medium mt-1">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hero Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href={getNavLinkHref('/kontak')}
              className="px-6 py-3 rounded-full bg-[#272A20] hover:bg-[#35382B] text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span>Hubungi Posko Aspirasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-white hover:bg-[#F2EFE8] border border-[#DDD8CB] text-[#272A20] text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Hotline WhatsApp</span>
              </a>
            )}
          </div>
        </div>

      </section>

      {/* ─── 2. 3 PARLIAMENTARY FOCUS PILLARS ─── */}
      <section className="pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider block mb-2">
            Fokus Perjuangan Kenegaraan
          </span>
          <h2 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#24271D] leading-tight">
            3 Pilar Komitmen <span className="italic">Parlemen Pro-Rakyat.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visionPillars.map((pillar: any, idx: number) => {
            const Icon = pillarIcons[idx % pillarIcons.length];
            const num = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={idx}
                className="bg-white rounded-[26px] p-6 sm:p-7 border border-[#E5E0D5] hover:border-[#CCD1BF] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-cormorant text-3xl font-bold text-[#35382B] block">
                      #{num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F2EFE8] text-[#4E5340] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#24271D] mb-2 leading-snug">
                    {pillar.title}
                  </h3>

                  {pillar.subtitle && (
                    <div className="text-xs font-semibold text-[#4E5340] mb-2">
                      {pillar.subtitle}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-[#76796A] font-semibold">
                  <span>Amanah {dapil}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#4E5340]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 3. INTERACTIVE TABS: PENDIDIKAN, KARIER, MANDAT, & LAPANGAN ─── */}
      <section className="bg-white rounded-[32px] border border-[#E5E0D5] p-6 sm:p-10 shadow-sm space-y-10">
        
        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-[#F0ECE1] scrollbar-none">
          {[
            { id: 'semua', label: 'Semua Ikhtisar' },
            { id: 'komisi', label: 'Penugasan Komisi & AKD' },
            { id: 'visi', label: '3 Pilar Parlemen' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Rekam Jejak Karier' },
            { id: 'lapangan', label: 'Dokumentasi Dapil' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#272A20] text-white shadow-xs'
                  : 'bg-[#F2EFE8] text-[#555A47] hover:bg-[#EAE6DC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-10">
          
          {/* ─── TAB: PENUGASAN KOMISI & AKD ─── */}
          {(activeTab === 'semua' || activeTab === 'komisi') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="w-5 h-5 text-[#4E5340]" />
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D]">
                  Penugasan Alat Kelengkapan Dewan (AKD)
                </h3>
              </div>

              {hasAnyAkd ? (
                <div className="space-y-5">
                  {/* Komisi Utama */}
                  {activeCommissionName && (
                    <div className="p-6 sm:p-7 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5D9] pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737768]">
                            Komisi Parlemen
                          </span>
                          <h4 className="font-cormorant text-2xl font-bold text-[#24271D]">
                            {activeCommissionName}
                          </h4>
                        </div>
                        {commissionRole && (
                          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#DDD8CB] text-[#4E5340] text-xs font-bold self-start sm:self-auto">
                            {commissionRole}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {commissionScope ? (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-[#EAE5D9]">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#4E5340] uppercase tracking-wider">
                              <BookOpen className="w-4 h-4" />
                              <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed font-normal">
                              {commissionScope}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-[#EAE5D9]">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#4E5340] uppercase tracking-wider">
                              <BookOpen className="w-4 h-4" />
                              <span>Tugas Pokok &amp; Fungsi</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed font-normal">
                              Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi anggaran APBD pro-rakyat.
                            </p>
                          </div>
                        )}

                        {commissionPartners && (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-[#EAE5D9]">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#4E5340] uppercase tracking-wider">
                              <Users className="w-4 h-4" />
                              <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed font-normal">
                              {commissionPartners}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fraksi Role */}
                  {factionRole && (
                    <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#737768]">
                          Penugasan Fraksi Parlemen
                        </div>
                        <div className="font-cormorant text-xl font-bold text-[#24271D] mt-0.5">
                          Fraksi {party}
                        </div>
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-white border border-[#DDD8CB] text-xs font-bold text-[#4E5340]">
                        {factionRole}
                      </span>
                    </div>
                  )}

                  {/* AKD Bodies Lainnya */}
                  {akdBodies.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#737768] block">
                        Badan &amp; Alat Kelengkapan Dewan Lainnya:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {akdBodies.map((body: any, bIdx: number) => (
                          <div
                            key={bIdx}
                            className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-start gap-3"
                          >
                            <ShieldCheck className="w-5 h-5 text-[#4E5340] shrink-0 mt-0.5" />
                            <div>
                              <div className="font-cormorant text-lg font-bold text-[#24271D]">{body.name}</div>
                              {body.role && (
                                <div className="text-xs font-semibold text-[#666B57] mt-0.5">
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
                <div className="p-8 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] text-center space-y-2">
                  <Landmark className="w-8 h-8 text-[#737768] mx-auto" />
                  <h4 className="text-sm font-bold text-[#24271D]">
                    Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                  </h4>
                  <p className="text-xs text-[#737768] max-w-md mx-auto">
                    Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: 3 PILAR PARLEMEN (DETAIL VIEW) ─── */}
          {(activeTab === 'visi') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-5 h-5 text-[#4E5340]" />
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D]">
                  3 Pilar Haluan Pengabdian Parlemen
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visionPillars.map((p: any, idx: number) => {
                  const Icon = pillarIcons[idx % pillarIcons.length];
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <div
                      key={idx}
                      className="p-6 sm:p-7 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-cormorant text-3xl font-bold text-[#35382B]">
                            #{num}
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5D9] text-[#4E5340] flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>

                        <h4 className="font-cormorant text-xl font-bold text-[#24271D] mb-2 leading-snug">
                          {p.title}
                        </h4>

                        {p.subtitle && (
                          <div className="text-xs font-semibold text-[#4E5340] mb-2">
                            {p.subtitle}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed font-normal">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-[#EAE5D9] flex items-center justify-between text-xs text-[#737768] font-semibold">
                        <span>Mandat Parlemen</span>
                        <CheckCircle2 className="w-4 h-4 text-[#4E5340]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB: RIWAYAT PENDIDIKAN FORMAL ─── */}
          {(activeTab === 'semua' || activeTab === 'pendidikan') && (
            <div className="space-y-6 pt-6 border-t border-[#F0ECE1]">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-[#4E5340]" />
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D]">
                  Riwayat Pendidikan Formal
                </h3>
              </div>

              {educationList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {educationList.map((edu: string, idx: number) => (
                    <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex flex-col justify-between">
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5D9] text-[#4E5340] flex items-center justify-center mb-3">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <h4 className="font-cormorant text-xl font-bold text-[#24271D] leading-snug">
                          {edu}
                        </h4>
                        <p className="text-xs font-semibold text-[#4E5340] mt-2">
                          Kredensial Pendidikan Terverifikasi
                        </p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-[#EAE5D9] flex items-center gap-1.5 text-[11px] text-[#737768]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4E5340]" />
                        <span>Arsip Resmi Dewan</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-[#737768] mx-auto" />
                  <h4 className="text-sm font-bold text-[#24271D]">
                    Informasi riwayat pendidikan belum ditambahkan
                  </h4>
                  <p className="text-xs text-[#737768] max-w-sm mx-auto">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui melalui dashboard.
                  </p>
                </div>
              )}

              {/* Pelatihan & Sertifikasi Keparlemenan */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#F0ECE1] space-y-3">
                  <span className="text-xs font-bold text-[#4E5340] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-4 py-2 rounded-xl bg-white border border-[#DDD8CB] text-xs font-semibold text-[#35382B]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: REKAM JEJAK KARIER ─── */}
          {(activeTab === 'semua' || activeTab === 'karier') && (
            <div className="space-y-6 pt-6 border-t border-[#F0ECE1]">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-[#4E5340]" />
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D]">
                  Rekam Jejak &amp; Pengabdian Karier
                </h3>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-4">
                  {customCareers.map((car: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-cormorant text-xl sm:text-2xl font-bold text-[#24271D] leading-snug">
                          {car.role}
                        </h4>
                        {(car.organization || car.institution) && (
                          <p className="text-xs font-semibold text-[#4E5340] mt-1">
                            {car.organization || car.institution}
                          </p>
                        )}
                        {car.description && (
                          <p className="text-xs sm:text-sm text-[#6A6E5F] mt-2.5 leading-relaxed max-w-3xl font-normal">
                            {car.description}
                          </p>
                        )}
                      </div>
                      {car.period && (
                        <span className="shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-[#DDD8CB] text-xs font-bold text-[#4E5340] self-start">
                          {car.period}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-[#737768] mx-auto" />
                  <h4 className="text-sm font-bold text-[#24271D]">
                    Informasi rekam jejak karier belum ditambahkan
                  </h4>
                  <p className="text-xs text-[#737768] max-w-sm mx-auto">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: DOKUMENTASI DAPIL & LAPANGAN ─── */}
          {(activeTab === 'semua' || activeTab === 'lapangan') && (
            <div className="space-y-6 pt-6 border-t border-[#F0ECE1]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#4E5340]" />
                  <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D]">
                    Dokumentasi Kinerja Turun ke Dapil
                  </h3>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#EFECE1] border border-[#D8D3C4] text-xs font-bold text-[#4E5340] self-start sm:self-auto">
                  Aksi Nyata Lapangan
                </span>
              </div>

              {displayActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayActivities.map((act: any, aIdx: number) => (
                    <div
                      key={aIdx}
                      className="group rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] overflow-hidden hover:border-[#CCD1BF] transition-all flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        {act.photoUrl ? (
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#24271D]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={act.photoUrl}
                              alt={act.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                            {act.date && (
                              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                <Calendar className="w-3 h-3 text-[#E0E5D4]" />
                                <span>{act.date}</span>
                              </div>
                            )}

                            {act.location && (
                              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                <MapPin className="w-3 h-3 text-[#E0E5D4]" />
                                <span className="truncate max-w-[170px]">{act.location}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-[#EAE5D9] flex flex-col items-center justify-center gap-2 text-[#737768]">
                            <Camera className="w-8 h-8 text-[#4E5340]" />
                            <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                          </div>
                        )}

                        <div className="p-5 space-y-2">
                          <h4 className="font-cormorant font-bold text-xl text-[#24271D] group-hover:text-[#4E5340] transition-colors line-clamp-2 leading-snug">
                            {act.title}
                          </h4>
                          {act.description && (
                            <p className="text-xs text-[#6A6E5F] leading-relaxed line-clamp-3 font-normal">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-0 border-t border-[#EAE5D9] mt-2 flex items-center justify-between text-[11px] text-[#737768]">
                        <span className="font-bold flex items-center gap-1 text-[#4E5340]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4E5340]" />
                          <span>Kinerja Terverifikasi</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] text-center space-y-2">
                  <Camera className="w-8 h-8 text-[#737768] mx-auto" />
                  <h4 className="text-sm font-bold text-[#24271D]">Informasi dokumentasi kinerja belum ditambahkan</h4>
                  <p className="text-xs text-[#737768] max-w-sm mx-auto">
                    Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ─── 4. PHOTO GALLERY SECTION (Bila Ada) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="pt-2">
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ─── 5. BOTTOM ACTION BANNER ─── */}
      <section className="rounded-[32px] bg-[#4E5340] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="select-text text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E0E5D4] block mb-1">
            Posko Aspirasi &amp; Reses Konstituen
          </span>
          <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-normal leading-snug">
            Ingin Berdiskusi Mengenai <span className="italic text-[#E0E5D4]">Kebijakan Daerah?</span>
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xl font-normal">
            Sampaikan usulan regulasi, gagasan pembangunan daerah pemilihan {dapil}, atau permohonan audiensi publik secara langsung melalui posko aspirasi resmi dewan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={getNavLinkHref('/kontak')}
            className="shrink-0 px-7 py-3.5 rounded-full bg-white text-[#272A20] text-xs sm:text-sm font-bold hover:bg-[#F2EFE8] transition-all inline-flex items-center gap-2 shadow-md group cursor-pointer"
          >
            <span>Hubungi Posko Aspirasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {waHotlineLink && (
            <a
              href={waHotlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3.5 rounded-full bg-black/25 hover:bg-black/35 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Hotline WA</span>
            </a>
          )}
        </div>
      </section>

    </div>
  );
}
