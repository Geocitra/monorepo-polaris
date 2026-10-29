'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  BookOpen,
  Award,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface CreativeWarmProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreativeWarmProfileClient({
  member,
  theme,
  subdomain,
}: CreativeWarmProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#F59E0B',
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

  // 4. Custom Stats from theme layoutSchema (tanpa data dummy)
  const customStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim()))
      : [];



  // 5. Clean Name for badges
  function parseCleanIdentity(fullName?: string) {
    if (!fullName) return { cleanName: 'Ahmad Fauzi', initial: 'A' };
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
    };
  }

  const { cleanName } = parseCleanIdentity(officialFullName);

  // Pillar icon mapping
  const pillarIcons = [Compass, Building2, HeartHandshake, Award];

  // Verified activities resolver
  const verifiedActivities =
    theme?.layoutSchema?.verifiedActivities ||
    theme?.layoutSchema?.activities ||
    member?.activities;
  const displayActivities: any[] = Array.isArray(verifiedActivities)
    ? verifiedActivities.filter((a: any) => a && a.title?.trim())
    : [];

  // Career list resolver
  const customCareers =
    Array.isArray(theme?.layoutSchema?.careers) && theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers.filter((c: any) => c && c.role?.trim())
      : Array.isArray(careersList) && careersList.length > 0
      ? careersList
      : Array.isArray(member?.career)
      ? member.career
      : [];

  return (
    <div className="space-y-16 sm:space-y-20 py-8 sm:py-14 text-stone-800">
      
      {/* ─── 1. HERO BIO CARD (WARM SUN DISC & AMBIENT GLOW) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-xl shadow-stone-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-12">
            
            {/* Left: Cutout Portrait grounded on Amber Sun Disc */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-[280px] sm:w-[340px] h-[360px] sm:h-[430px] flex items-end justify-center">
                
                {/* Ambient warm glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full pointer-events-none opacity-70"
                  style={{
                    background: 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.15) 55%, transparent 75%)',
                    filter: 'blur(30px)',
                  }}
                />

                {/* Sun Disc Khas POLARIS Terra */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[240px] sm:w-[290px] aspect-square rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 shadow-2xl shadow-amber-500/25 pointer-events-none" />

                {/* Verification Badge */}
                <div className="absolute top-6 right-2 sm:right-6 bg-stone-900 text-amber-400 p-2.5 rounded-2xl shadow-lg border border-stone-700 z-20">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>

                {/* Cutout Photo Grounded */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={cleanName}
                  className="w-full h-full object-contain object-bottom filter contrast-[1.02] drop-shadow-2xl relative z-10 select-none block"
                />

                {/* Mandat Tag Pill di Bawah Foto */}
                <div className="absolute bottom-3 left-4 right-4 bg-stone-950/80 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2 text-white z-20 shadow-md">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                    Mandat Perwakilan Rakyat
                  </div>
                  <div className="text-xs font-bold truncate">
                    {cleanLegislativeLevel} • {dapil?.toLowerCase().startsWith('dapil') ? dapil : `Dapil ${dapil}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Bio & Identitas Resmi */}
            <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-stone-800 text-stone-800 text-xs font-mono font-bold tracking-wider bg-stone-50">
                <span>[ Profil Resmi Anggota Dewan ]</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-stone-900 tracking-tight leading-tight">
                  {officialFullName}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-amber-700 font-mono">
                  {cleanLegislativeLevel} • {party} {dapil ? `• Daerah Pemilihan ${dapil}` : ''}
                </p>
              </div>

              <div className="h-[2px] w-16 bg-amber-500" />

              {/* Tagline / Visi Singkat */}
              {headlineTagline && (
                <p className="text-base sm:text-lg font-serif italic text-stone-800 font-medium leading-snug">
                  &ldquo;{headlineTagline}&rdquo;
                </p>
              )}

              {/* Narasi Bio */}
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base font-normal space-y-3">
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
                    Mendedikasikan masa pengabdian kenegaraan untuk mendampingi masyarakat di Daerah Pemilihan {dapil || 'daerah pemilihan'}. Dengan memadukan integritas, ketulusan mendengar, dan keberanian memperjuangkan regulasi yang berpihak pada rakyat, beliau senantiasa hadir mengawal setiap aspirasi konstituen.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Sampaikan Aspirasi Langsung</span>
                </Link>

                {waHotlineLink && (
                  <a
                    href={waHotlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full border border-stone-800 text-stone-900 hover:bg-stone-900 hover:text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>WhatsApp Staf Ahli</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. METRIC COUNTERS (HANYA TAMPIL JIKA ADA DATA RESMI DARI DASHBOARD) ─── */}
      {customStats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#1A382B] text-white p-8 sm:p-12 shadow-xl border border-stone-800">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <span className="text-xs font-mono uppercase text-amber-400 tracking-widest font-bold block">
                — DEDIKASI &amp; AKUNTABILITAS PENGABDIAN
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Capaian &amp; Tanggung Jawab Kenegaraan
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                Setiap capaian mencerminkan kehadiran langsung dan akuntabilitas kerja parlemen di tengah-tengah masyarakat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {customStats.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all duration-300 text-center space-y-2"
                >
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-sm font-bold text-white font-serif">
                    {m.label}
                  </div>
                  {(m.desc || m.sublabel) && (
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {m.desc || m.sublabel}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section id="komisi-akd" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — MANDAT &amp; ALAT KELENGKAPAN DEWAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Penugasan Komisi &amp; Badan Parlemen
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shrink-0">
            Mandat Resmi Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Parlemen Utama */}
            {activeCommissionName && (
              <div className="rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-stone-100">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-900 text-white font-mono">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                          Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-tight">
                      {activeCommissionName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-amber-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-sm text-stone-700 leading-relaxed font-normal bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-xl bg-white text-stone-800 border border-stone-200 text-xs font-semibold shadow-2xs font-sans"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                        Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Keanggotaan Badan & AKD Lainnya */}
            {akdBodies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-800">
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-stone-200 flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-500/60 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-black shrink-0">
                          <Landmark className="w-4.5 h-4.5 text-amber-800" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-900 text-white shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-serif font-bold text-stone-900 leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-stone-600 leading-relaxed pt-1">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 mx-auto flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-800">
              Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 4. PILAR FOKUS & KOMITMEN PENGABDIAN (3 CARDS) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — PRINSIP &amp; FOKUS KERJA PARLEMEN
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              3 Pilar Fokus Pengabdian
            </h2>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Amanah Legislasi 2024 - 2029
          </span>
        </div>

        {visionPillars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all duration-300 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                      <IconComp className="w-6 h-6 text-amber-800" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
                        {pillar.title}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                        {pillar.subtitle || pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-amber-800">
                    <span className="font-bold uppercase tracking-wider">Pilar Terverifikasi</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 mx-auto flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-800">
              Informasi pilar fokus pengabdian belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Fokus dan komitmen prinsip kerja parlemen akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 5. RIWAYAT PENDIDIKAN & REKAM JEJAK KARIER PUBLIK ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — REKAM JEJAK &amp; KREDENSIAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Riwayat Pendidikan &amp; Jejak Karier Publik
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom 1: Riwayat Pendidikan Formal */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wide">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-[11px] font-mono text-stone-500">
                  Latar belakang keilmuan &amp; kepakaran
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {educationList.length > 0 ? (
                educationList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900">{edu}</div>
                      <div className="text-[11px] font-mono text-amber-700 font-semibold">
                        Kredensial Pendidikan Terverifikasi
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-600">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="pt-3 border-t border-stone-100">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wide block mb-2">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-semibold"
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
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wide">
                  Penugasan Parlemen &amp; Pengabdian
                </h3>
                <p className="text-[11px] font-mono text-stone-500">
                  Alat kelengkapan dewan &amp; rekam jejak amanah
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {customCareers.length > 0 ? (
                customCareers.map((cItem: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">{cItem.role}</div>
                      {(cItem.organization || cItem.period) && (
                        <div className="text-[11px] font-mono text-amber-700 font-semibold">
                          {cItem.organization ? `${cItem.organization} ` : ''}
                          {cItem.period ? `(${cItem.period})` : ''}
                        </div>
                      )}
                      {cItem.description && (
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed font-normal">
                          {cItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-stone-600">
                    Informasi rekam jejak penugasan dewan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI NYATA LAPANGAN) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — DOKUMENTASI LAPANGAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Dokumentasi Kinerja Turun ke Dapil
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shrink-0">
            Aksi Nyata Lapangan
          </span>
        </div>

        {displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayActivities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Foto Dokumentasi */}
                  {act.photoUrl ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={act.photoUrl}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                      {/* Pill Tanggal */}
                      {act.date && (
                        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                          <Calendar className="w-3 h-3 text-amber-300" />
                          <span>{act.date}</span>
                        </div>
                      )}

                      {/* Pill Lokasi */}
                      {act.location && (
                        <div className="absolute bottom-3 left-3 right-3 text-white truncate text-[11px] font-semibold flex items-center gap-1.5 drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] bg-stone-100 flex flex-col items-center justify-center text-stone-400 gap-1 p-4 border-b border-stone-100">
                      <Camera className="w-8 h-8 text-stone-300" />
                      <span className="text-xs font-mono font-medium">Dokumentasi Lapangan</span>
                    </div>
                  )}

                  {/* Informasi Narasi Kinerja */}
                  <div className="p-5 sm:p-6 space-y-2">
                    <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed line-clamp-3">
                        {act.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Kinerja Terverifikasi</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 mx-auto flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-800">
              Informasi dokumentasi kinerja belum ditambahkan.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ─── 7. GALERI FOTO RESMI DEWAN (JIKA TERSEDIA) ─── */}
      {member?.photoGallery && Array.isArray(member.photoGallery) && member.photoGallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
                — ARSIP VISUAL PARLEMEN
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
                Galeri Foto Resmi
              </h2>
            </div>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION ASPIRASI KONSTITUEN (WARM FOREST GREEN) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#1A382B] text-white p-8 sm:p-12 shadow-xl border border-stone-800">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold tracking-wider">
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan fasilitas umum, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {waHotlineLink && (
                <a
                  href={waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
                >
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>WhatsApp Hotline</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
