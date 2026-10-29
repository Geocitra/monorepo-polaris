'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Landmark,
  Scale,
  Sparkles,
  TrendingUp,
  Calendar,
  MapPin,
  Camera,
  MessageCircle,
  Compass,
  HeartHandshake,
  FileText,
  Phone,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface FoliobloxProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function FoliobloxProfileClient({
  member,
  theme,
  subdomain,
}: FoliobloxProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#FF4500',
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
    <div className="py-12 sm:py-18 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto space-y-16 sm:space-y-20 select-text text-left">
      
      {/* ─── 1. TOP PROFILE HERO: PORTRAIT CUTOUT WITH SUNSET ORANGE GLOW ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Portrait with Signature Sunset Aura Hotspot */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] rounded-[32px] overflow-hidden bg-[#120402] border border-orange-500/30 shadow-2xl flex items-end justify-center group">
            
            {/* Sunset Hotspot Radial Gradient Glow Behind Portrait */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 90% 80% at 50% 40%, rgba(255, 80, 10, 0.85) 0%, rgba(191, 30, 4, 0.5) 45%, rgba(18, 2, 1, 0.95) 85%)',
              }}
            />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#FF500A]/40 blur-[80px] rounded-full pointer-events-none" />

            {/* Dewans Photo Cutout */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="relative z-10 w-full h-[92%] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] filter contrast-105 group-hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />

            {/* Bottom Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none" />
            
            {/* Top Right Orange Badge */}
            <div className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-orange-500/50 text-[11px] font-bold text-orange-400 flex items-center gap-1.5 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>Mandat Terpilih</span>
            </div>

            {/* Bottom Floating Info Pill */}
            <div className="absolute bottom-4 left-4 right-4 z-30 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Amanah Rakyat Daerah Pemilihan
              </div>
              <div className="text-xs font-black truncate mt-0.5">
                {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Parliamentary Credentials */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-bold text-orange-400 uppercase tracking-wider">
              {cleanLegislativeLevel} • {party}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
              {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
            </span>
          </div>

          <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-white leading-[1.08] tracking-tight">
            {officialFullName}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-400 tracking-wide">
            <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              {activeCommissionName || 'Komisi Terkait DPR'}
              {commissionRole ? ` (${commissionRole})` : ''}
            </span>
          </div>

          {/* Visi & Bio Card */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Visi &amp; Komitmen Pengabdian</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">DAPIL {dapil?.toUpperCase()}</span>
            </div>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal italic">
              &ldquo;{bio}&rdquo;
            </p>
          </div>

          {/* Institutional Telemetry Diagnostics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10">
              <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Lembaga</div>
              <div className="text-xs sm:text-sm font-black text-white mt-1 truncate">
                {cleanLegislativeLevel}
              </div>
              <div className="text-[10px] text-orange-400 font-bold mt-0.5">Terpilih</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10">
              <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Penugasan</div>
              <div className="text-xs sm:text-sm font-black text-white mt-1 truncate">
                {activeCommissionName || 'Komisi'}
              </div>
              <div className="text-[10px] text-white/60 font-semibold truncate mt-0.5">
                {commissionRole || 'Parlemen'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10">
              <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Fraksi</div>
              <div className="text-xs sm:text-sm font-black text-white mt-1 truncate">
                {party}
              </div>
              <div className="text-[10px] text-white/60 font-semibold mt-0.5">Parlemen</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10">
              <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Dapil</div>
              <div className="text-xs sm:text-sm font-black text-white mt-1 truncate">
                {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
              </div>
              <div className="text-[10px] text-orange-400 font-bold mt-0.5">Konstituen</div>
            </div>
          </div>

          {/* Dynamic Stat Blocks (HANYA tampil bila diisi dari dashboard) */}
          {customStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {customStats.map((st: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#141414] border border-white/10 hover:border-orange-500/40 transition-colors"
                >
                  <Award className="w-5 h-5 text-orange-500 mb-2" />
                  <div className="font-outfit font-black text-2xl sm:text-3xl text-white">
                    {st.value}
                  </div>
                  <div className="text-xs text-white/60 font-semibold mt-1">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hero Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={getNavLinkHref('/kontak')}
              className="px-6 py-3 rounded-full bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-orange-500/20 cursor-pointer"
            >
              <span>Sampaikan Aspirasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {waHotlineLink && (
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hotline WhatsApp</span>
              </a>
            )}
          </div>
        </div>

      </section>

      {/* ─── 2. 3 PARLIAMENTARY FOCUS PILLARS (#01, #02, #03) ─── */}
      <section className="pt-8 border-t border-white/10">
        <div className="mb-10">
          <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-2">
            Komitmen Pengabdian Konstituen
          </span>
          <h2 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
            3 Pilar Fokus Parlemen &amp; Pengabdian
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visionPillars.map((p: any, idx: number) => {
            const Icon = pillarIcons[idx % pillarIcons.length];
            const num = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={idx}
                className="p-7 rounded-[28px] bg-[#141414] border border-white/10 hover:border-orange-500/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-outfit font-black text-3xl sm:text-4xl text-orange-500 block">
                      #{num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-outfit font-black text-xl text-white mb-2 leading-snug group-hover:text-orange-400 transition-colors">
                    {p.title}
                  </h3>

                  {p.subtitle && (
                    <div className="text-xs font-bold text-orange-400/90 mb-2">
                      {p.subtitle}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-bold">
                  <span>Dapil {dapil}</span>
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 3. INTERACTIVE TABS & DETAILED DOSSIER ─── */}
      <section className="p-6 sm:p-10 lg:p-12 rounded-[32px] bg-[#121212] border border-white/10 space-y-10">
        
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10 scrollbar-none">
          {[
            { id: 'semua', label: 'Semua Rekam Jejak' },
            { id: 'komisi', label: 'Tugas Komisi & AKD' },
            { id: 'visi', label: '3 Pilar Parlemen' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Karier & Organisasi' },
            { id: 'lapangan', label: 'Dokumentasi Dapil' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FF4500] text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-12">
          
          {/* ─── TAB: TUGAS KOMISI & AKD ─── */}
          {(activeTab === 'semua' || activeTab === 'komisi') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                    Penugasan Alat Kelengkapan Dewan (AKD)
                  </h3>
                  <p className="text-xs text-white/50">Mandat pengawasan regulasi, anggaran &amp; mitra kementerian</p>
                </div>
              </div>

              {hasAnyAkd ? (
                <div className="space-y-6">
                  {/* Komisi Utama */}
                  {activeCommissionName && (
                    <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                            Komisi Parlemen
                          </span>
                          <h4 className="font-outfit font-black text-xl sm:text-2xl text-white">
                            {activeCommissionName}
                          </h4>
                        </div>
                        {commissionRole && (
                          <span className="px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold self-start sm:self-auto">
                            {commissionRole}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {commissionScope ? (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                              <BookOpen className="w-4 h-4" />
                              <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                            </div>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                              {commissionScope}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                              <BookOpen className="w-4 h-4" />
                              <span>Tugas Pokok &amp; Fungsi</span>
                            </div>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                              Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi anggaran APBD pro-rakyat.
                            </p>
                          </div>
                        )}

                        {commissionPartners && (
                          <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                              <Users className="w-4 h-4" />
                              <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                            </div>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                              {commissionPartners}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fraksi Role */}
                  {factionRole && (
                    <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                          Penugasan Fraksi Parlemen
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          Fraksi {party}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">
                        {factionRole}
                      </span>
                    </div>
                  )}

                  {/* AKD Bodies Lainnya */}
                  {akdBodies.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
                        Badan &amp; Alat Kelengkapan Dewan Lainnya:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {akdBodies.map((body: any, bIdx: number) => (
                          <div
                            key={bIdx}
                            className="p-5 rounded-2xl bg-[#181818] border border-white/10 flex items-start gap-3"
                          >
                            <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-white">{body.name}</div>
                              {body.role && (
                                <div className="text-xs font-semibold text-orange-400 mt-1">
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
                <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center space-y-2">
                  <Landmark className="w-8 h-8 text-orange-500/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
                  </h4>
                  <p className="text-xs text-white/50 max-w-md mx-auto">
                    Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: 3 PILAR PARLEMEN (DETAIL VIEW) ─── */}
          {(activeTab === 'visi') && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                    3 Pilar Fokus Pengabdian Parlemen
                  </h3>
                  <p className="text-xs text-white/50">Arah haluan kerja legislasi, anggaran, dan representasi konstituen</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visionPillars.map((p: any, idx: number) => {
                  const Icon = pillarIcons[idx % pillarIcons.length];
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <div
                      key={idx}
                      className="p-7 rounded-[28px] bg-[#181818] border border-white/10 hover:border-orange-500/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-outfit font-black text-3xl text-orange-500">
                            #{num}
                          </span>
                          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <h4 className="font-outfit font-black text-xl text-white mb-2 leading-snug">
                          {p.title}
                        </h4>

                        {p.subtitle && (
                          <div className="text-xs font-bold text-orange-400/90 mb-2">
                            {p.subtitle}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-white/65 leading-relaxed font-normal">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-bold">
                        <span>Mandat Parlemen</span>
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB: PENDIDIKAN FORMAL ─── */}
          {(activeTab === 'semua' || activeTab === 'pendidikan') && (
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                    Riwayat Pendidikan Formal
                  </h3>
                  <p className="text-xs text-white/50">Fondasi keilmuan dan kompetensi kebijakan publik</p>
                </div>
              </div>

              {educationList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {educationList.map((edu: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-orange-500/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <h4 className="font-outfit font-black text-lg text-white leading-snug">
                          {edu}
                        </h4>
                        <p className="text-xs font-semibold text-orange-400 mt-2">
                          Kredensial Pendidikan Terverifikasi
                        </p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-white/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                        <span>Arsip Resmi Dewan</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-orange-500/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    Informasi riwayat pendidikan belum ditambahkan
                  </h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    Data riwayat studi akademik formal akan tampil di sini setelah diperbarui melalui dashboard.
                  </p>
                </div>
              )}

              {/* Pelatihan & Sertifikasi Keparlemenan */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-4 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs font-semibold text-white/80"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: KARIER & ORGANISASI ─── */}
          {(activeTab === 'semua' || activeTab === 'karier') && (
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                    Pengalaman &amp; Rekam Jejak Karier
                  </h3>
                  <p className="text-xs text-white/50">Riwayat dedikasi profesional dan kepemimpinan publik</p>
                </div>
              </div>

              {customCareers.length > 0 ? (
                <div className="space-y-4">
                  {customCareers.map((car: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-[#181818] border border-white/10 hover:border-orange-500/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-outfit font-black text-xl text-white leading-snug">
                          {car.role}
                        </h4>
                        {(car.organization || car.institution) && (
                          <p className="text-xs font-semibold text-orange-400 mt-1">
                            {car.organization || car.institution}
                          </p>
                        )}
                        {car.description && (
                          <p className="text-xs sm:text-sm text-white/65 mt-2.5 leading-relaxed max-w-3xl font-normal">
                            {car.description}
                          </p>
                        )}
                      </div>
                      {car.period && (
                        <span className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white self-start">
                          {car.period}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-orange-500/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">
                    Informasi rekam jejak karier belum ditambahkan
                  </h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    Riwayat penugasan komisi, badan, dan organisasi publik akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: DOKUMENTASI DAPIL & LAPANGAN ─── */}
          {(activeTab === 'semua' || activeTab === 'lapangan') && (
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                      Dokumentasi Kinerja Turun ke Dapil
                    </h3>
                    <p className="text-xs text-white/50">Aksi nyata advokasi aspirasi konstituen di lapangan</p>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-xs font-bold text-orange-400 self-start sm:self-auto">
                  Aksi Nyata Lapangan
                </span>
              </div>

              {displayActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayActivities.map((act: any, aIdx: number) => (
                    <div
                      key={aIdx}
                      className="group rounded-2xl bg-[#181818] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all flex flex-col justify-between shadow-lg"
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
                              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                <Calendar className="w-3 h-3 text-orange-400" />
                                <span>{act.date}</span>
                              </div>
                            )}

                            {act.location && (
                              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                <MapPin className="w-3 h-3 text-orange-400" />
                                <span className="truncate max-w-[170px]">{act.location}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-black/40 flex flex-col items-center justify-center gap-2 text-white/40">
                            <Camera className="w-8 h-8 text-orange-500/60" />
                            <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                          </div>
                        )}

                        <div className="p-5 space-y-2">
                          <h4 className="font-outfit font-black text-lg text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                            {act.title}
                          </h4>
                          {act.description && (
                            <p className="text-xs text-white/65 leading-relaxed line-clamp-3 font-normal">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[11px] text-white/50">
                        <span className="font-bold flex items-center gap-1 text-orange-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                          <span>Kinerja Terverifikasi</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center space-y-2">
                  <Camera className="w-8 h-8 text-orange-500/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
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

      {/* ─── 5. BOTTOM ACTION BANNER (POSKO ASPIRASI KONSTITUEN) ─── */}
      <section className="rounded-[32px] bg-gradient-to-r from-[#FF500A] via-[#EA3604] to-[#BF1E04] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="select-text text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 block mb-1">
            Posko Aspirasi &amp; Reses Konstituen
          </span>
          <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white leading-tight">
            Sampaikan Aspirasi Anda Secara Langsung
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xl font-normal">
            Suara Anda adalah pedoman pengawasan kebijakan kami di parlemen. Kirimkan laporan atau ide pembangunan daerah pemilihan {dapil}.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={getNavLinkHref('/kontak')}
            className="shrink-0 pl-6 pr-2 py-3 rounded-full bg-white text-stone-950 text-xs sm:text-sm font-bold hover:bg-stone-100 transition-all inline-flex items-center gap-2 shadow-lg group cursor-pointer"
          >
            <span>Kirim Aspirasi Sekarang</span>
            <div className="w-6 h-6 rounded-full bg-[#FF4500] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
          {waHotlineLink && (
            <a
              href={waHotlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-3 rounded-full bg-black/30 hover:bg-black/40 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
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
