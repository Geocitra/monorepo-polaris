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
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface ParliamentProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function ParliamentProfileClient({
  member,
  theme,
  subdomain,
}: ParliamentProfileClientProps) {
  const searchParams = useSearchParams();

  // 1. Data Resolvers
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Anggota Dewan';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';

  const getNavLinkHref = (path: string) => {
    const basePath = subdomain ? `/${subdomain}${path}` : path;
    const previewTemplate = searchParams.get('preview_template');
    const previewColor = searchParams.get('preview_color');
    if (previewTemplate || previewColor) {
      const sp = new URLSearchParams();
      if (previewTemplate) sp.set('preview_template', previewTemplate);
      if (previewColor) sp.set('preview_color', previewColor);
      return `${basePath}?${sp.toString()}`;
    }
    return basePath;
  };

  // 2. AKD Resolvers
  const akdAssignment = theme?.layoutSchema?.akdAssignment;
  const commissionData = akdAssignment?.commission;
  const commissionName =
    commissionData?.name?.trim() ||
    (member?.commissionName ? member.commissionName.trim() : '');
  const commissionRole =
    commissionData?.role?.trim() || (commissionName ? 'Anggota Komisi' : '');
  const commissionScope = commissionData?.scope?.trim() || '';
  const commissionPartners = commissionData?.partners?.trim() || '';
  const factionRole = akdAssignment?.factionRole?.trim() || '';
  const akdBodies: any[] = Array.isArray(akdAssignment?.akdBodies)
    ? akdAssignment.akdBodies.filter((b: any) => b && b.name?.trim())
    : [];
  const hasAnyAkd = Boolean(commissionName || factionRole || akdBodies.length > 0);

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
  const visionPillars =
    customPillars.length > 0 ? customPillars : DEFAULT_VISION_PILLARS;
  const pillarIcons = [Compass, Building2, HeartHandshake];

  // 4. Education & Career Resolvers
  const formalEduList = member?.education
    ? member.education
        .split(/[\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const customCareers =
    Array.isArray(theme?.layoutSchema?.careers) &&
    theme.layoutSchema.careers.length > 0
      ? theme.layoutSchema.careers
      : null;

  // 5. Activities Resolvers
  const activities =
    Array.isArray(theme?.layoutSchema?.activities)
      ? theme.layoutSchema.activities.filter(
          (act: any) => act && (act.title?.trim() || act.photoUrl?.trim())
        )
      : [];

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* SECTION 1: EXECUTIVE BIO CARD (Kemewahan Negarawan)        */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          {/* Kolom Kiri: Foto Resmi Berwibawa */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Badge Verifikasi Kenegaraan */}
              <div className="absolute top-3.5 right-3.5 bg-[#96702c] text-white p-2 rounded-xl shadow-lg border border-amber-300/40">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              {/* Label Mandat di Bawah Foto */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Mandat Perwakilan Rakyat
                </div>
                <div className="text-xs font-black truncate">
                  {member?.legislativeLevel
                    ? member.legislativeLevel.replace(/_/g, ' ')
                    : 'DPR RI'}{' '}
                  •{' '}
                  {dapil?.toLowerCase().startsWith('dapil')
                    ? dapil
                    : `Dapil ${dapil}`}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas & Visi Kenegaraan */}
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* Nama Lengkap & Gelar */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {officialFullName}
              </h2>
              <p className="text-sm sm:text-base font-bold text-[#96702c]">
                <span>
                  {member?.legislativeLevel
                    ? `Anggota ${member.legislativeLevel.replace(/_/g, ' ')}`
                    : 'Anggota Dewan Perwakilan Rakyat Republik Indonesia'}
                  {party && party !== 'Fraksi Parlemen' ? ` • Fraksi ${party}` : ''}
                </span>
              </p>
              <div className="w-14 h-0.5 bg-[#96702c] rounded-full pt-0.5" />
            </div>

            {/* Visi & Komitmen Pengabdian */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#96702c]">
                  Visi &amp; Komitmen Pengabdian
                </span>
                <div className="h-px bg-slate-200/80 flex-1 max-w-[120px]" />
              </div>
              {theme?.bioBiography ? (
                <div className="space-y-3.5 text-sm sm:text-base leading-relaxed text-slate-700 font-normal">
                  {theme.bioBiography
                    .split('\n\n')
                    .filter(Boolean)
                    .map((para: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">
                        {para.trim()}
                      </p>
                    ))}
                </div>
              ) : theme?.headlineTagline ? (
                <p className="text-sm sm:text-base italic leading-relaxed text-slate-700 font-medium">
                  &ldquo;{theme.headlineTagline}&rdquo;
                </p>
              ) : (
                <p className="text-xs sm:text-sm italic leading-relaxed text-slate-500">
                  Visi dan komitmen pengabdian belum ditambahkan.
                </p>
              )}
            </div>

            {/* Counter Ribbon (Pencapaian Kinerja Parlemen) */}
            {theme?.layoutSchema?.stats &&
              Array.isArray(theme.layoutSchema.stats) &&
              theme.layoutSchema.stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {theme.layoutSchema.stats.map((stat: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="text-[10px] font-semibold text-slate-500">
                        {stat.label}
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                        {stat.value}
                      </div>
                      {stat.sublabel && (
                        <div className="text-[9px] text-[#96702c] font-bold">
                          {stat.sublabel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Penugasan Komisi &amp; Alat Kelengkapan Dewan
              </h2>
              <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mandat resmi dan ruang lingkup pengawasan kenegaraan dalam menjalankan fungsi legislasi, anggaran, dan representasi.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#96702c] bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full shrink-0">
            Mandat Parlemen Terverifikasi
          </span>
        </div>

        {hasAnyAkd ? (
          <div className="space-y-6">
            {/* Kartu Komisi Parlemen Utama */}
            {commissionName ? (
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/80">
                        Komisi Parlemen
                      </span>
                      {commissionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                          {commissionRole}
                        </span>
                      )}
                      {factionRole && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                          Fraksi {party && party !== 'Fraksi Parlemen' ? party : ''} • {factionRole}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {commissionName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 text-[#96702c] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-[#96702c]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ruang Lingkup Bidang Pengawasan */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#96702c]" />
                      <span>Ruang Lingkup Bidang Pengawasan</span>
                    </div>
                    {commissionScope ? (
                      <p className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {commissionScope}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        Ruang lingkup bidang pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>

                  {/* Mitra Kerja Terkait */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                      <Users className="w-4 h-4 text-[#96702c]" />
                      <span>Kementerian / Lembaga Mitra Kerja</span>
                    </div>
                    {commissionPartners ? (
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        {commissionPartners
                          .split(/[,;\n]+/)
                          .map((pt: string, pIdx: number) => {
                            const cleanPt = pt.trim();
                            if (!cleanPt) return null;
                            return (
                              <span
                                key={pIdx}
                                className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs"
                              >
                                {cleanPt}
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        Daftar kementerian / dinas mitra pengawasan belum dispesifikasikan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Keanggotaan Alat Kelengkapan Dewan (AKD) Lainnya */}
            {akdBodies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#96702c]">
                    Keanggotaan Badan &amp; Alat Kelengkapan Dewan Lainnya
                  </span>
                  <div className="h-px bg-slate-200 flex-1 max-w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {akdBodies.map((akd: any, bIdx: number) => (
                    <div
                      key={bIdx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#96702c]/50 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#96702c] border border-amber-200/60 flex items-center justify-center font-black shrink-0">
                          <Landmark className="w-4.5 h-4.5 text-[#96702c]" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shrink-0">
                          {akd.role || 'Anggota'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {akd.name}
                        </h4>
                        {akd.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
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
          <div className="p-8 sm:p-12 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#96702c] border border-amber-200/60 mx-auto flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#96702c]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Informasi penugasan komisi &amp; alat kelengkapan dewan belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Data komisi kerja, mitra pengawasan, dan keanggotaan badan dewan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: TIGA PILAR KOMITMEN PENGABDIAN                 */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Pilar Fokus Pengabdian
            </h2>
            <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Prinsip Kerja Parlemen
          </span>
        </div>

        {visionPillars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visionPillars.map((pillar: any, pIdx: number) => {
              const IconComp =
                pillarIcons[pIdx % pillarIcons.length] || Compass;
              return (
                <div
                  key={pIdx}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#96702c]/60 hover:shadow-md transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#96702c] border border-amber-200/60 flex items-center justify-center font-black">
                    <IconComp className="w-6 h-6 text-[#96702c]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#96702c] uppercase tracking-wider">
                      {pillar.title}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {pillar.subtitle || pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#96702c] border border-amber-200/60 mx-auto flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#96702c]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Informasi pilar fokus pengabdian belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Fokus dan komitmen prinsip kerja parlemen akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: REKAM JEJAK PENDIDIKAN & KARIR PUBLIK          */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Riwayat Pengabdian &amp; Pendidikan
            </h2>
            <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kartu Riwayat Pendidikan */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-200/60">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#96702c] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-[#96702c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-[11px] text-slate-500">
                  Latar belakang keilmuan &amp; kepakaran
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {formalEduList.length > 0 ? (
                formalEduList.map((edu: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{edu}</div>
                      <div className="text-[11px] text-[#96702c] font-semibold">
                        Kredensial Pendidikan Terverifikasi
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600">
                    Informasi riwayat pendidikan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Data riwayat studi dan gelar formal akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}

              {member?.courses && member.courses.length > 0 && (
                <div className="pt-2 border-t border-amber-200/40">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-[#96702c] border border-amber-200/80 text-[10px] font-semibold"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kartu Penugasan Parlemen & Organisasi */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-200/60">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#96702c] flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5 text-[#96702c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Penugasan Parlemen &amp; Pengabdian
                </h3>
                <p className="text-[11px] text-slate-500">
                  Alat kelengkapan dewan &amp; rekam jejak amanah
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {customCareers && customCareers.length > 0 ? (
                customCareers.map((cItem: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cItem.role}</div>
                      {cItem.period && (
                        <div className="text-[11px] text-[#96702c] font-semibold">
                          {cItem.period}
                        </div>
                      )}
                      {cItem.description && (
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {cItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-600">
                    Informasi rekam jejak penugasan dewan belum ditambahkan.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Riwayat amanah komisi, badan, dan organisasi akan tampil di sini setelah diperbarui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: DOKUMENTASI KINERJA TURUN KE DAPIL             */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
              <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Rekam jejak kehadiran nyata, penyerapan aspirasi warga, dan pengawasan kerja di daerah pemilihan.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#96702c] bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full shrink-0">
            Aksi Nyata Lapangan
          </span>
        </div>

        {activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act: any, aIdx: number) => (
              <div
                key={aIdx}
                className="group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#96702c]/50 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Cover Foto Dokumentasi */}
                {act.photoUrl ? (
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.photoUrl}
                      alt={act.title || 'Dokumentasi Kinerja'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Pill Tanggal */}
                    {act.date && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
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
                  <div className="relative aspect-[16/10] bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1 p-4 border-b border-slate-100">
                    <Camera className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-medium">Dokumentasi Lapangan</span>
                  </div>
                )}

                {/* Informasi Narasi Kinerja */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    {act.description && (
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3">
                        {act.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-[#96702c] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#96702c]" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#96702c] border border-amber-200/60 mx-auto flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#96702c]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Informasi dokumentasi kinerja belum ditambahkan.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Dokumentasi kegiatan aksi nyata, agenda reses, dan penyerapan aspirasi di daerah pemilihan akan tampil di sini setelah diperbarui melalui dashboard.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: CALL TO ACTION ASPIRASI WARGA                  */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-[#0B1528] to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#96702c]/20 text-amber-300 border border-[#96702c]/40 text-xs font-bold">
            <span>Saluran Aspirasi Langsung Konstituen</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <span>Buka Kanal Kontak &amp; Aspirasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
