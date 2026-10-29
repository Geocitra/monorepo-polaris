'use client';

import React from 'react';
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
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Camera,
  MessageCircle,
  ShieldCheck,
  Award,
  Users,
  Compass,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { getBlushMemberInfo, useBlushHref } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface BlushEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function BlushEditorialProfileClient({
  member,
  theme,
  subdomain,
}: BlushEditorialProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getBlushMemberInfo(member, theme, subdomain);
  const href = useBlushHref(subdomain);

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
    <div className="space-y-20 pb-20 bg-[#FAF7F2] text-[#332A26] text-left">
      
      {/* ─── 1. ABOUT SPLIT WITH OVAL SAGE ARCH ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Foto Potret Dewan dengan Oval Sage Arch khas Blush Editorial */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[300px] sm:w-[360px] aspect-[4/5] flex items-end justify-center">
              <div className="absolute inset-0 bg-[#E0E6D8] rounded-t-[180px] rounded-b-[36px] overflow-hidden shadow-inner" />
              
              <img
                src={info.photoUrl}
                alt={info.officialFullName}
                className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                }}
              />

              <div className="absolute -bottom-4 right-0 z-20 bg-white px-4 py-2 rounded-2xl shadow-md border border-[#EDE5DA]">
                <div className="text-[9px] uppercase tracking-wider text-[#D47A6A] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> TERVERIFIKASI
                </div>
                <div className="font-serif font-bold text-xs text-[#332A26]">
                  {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
                </div>
              </div>
            </div>
          </div>

          {/* Teks Biografi & Data Parlemen */}
          <div className="lg:col-span-7 space-y-6 select-text">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                BIOGRAFI &amp; AMANAH
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#332A26]">
                {info.officialFullName}
              </h1>
              <p className="text-xs uppercase tracking-wider text-[#D47A6A] font-extrabold mt-1">
                {cleanLegislativeLevel} · {info.party}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#8C7D73] mt-0.5">
                {activeCommissionName || 'Komisi Terkait DPR'} {commissionRole ? `(${commissionRole})` : ''} · Daerah Pemilihan {info.dapil}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#6E635C] leading-relaxed">
              {info.bio ||
                `Sebagai wakil rakyat di ${cleanLegislativeLevel}, ${info.officialFullName} mendedikasikan seluruh pemikiran dan kerja nyatanya untuk mengawal kepentingan masyarakat ${info.dapil}. Dikenal gigih dalam mengawasi efektivitas anggaran daerah dan turun langsung ke lapangan mendengarkan keluhan warga.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs"
                >
                  <Icon className="w-4 h-4 text-[#D47A6A] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[#8C7D73] font-bold">
                      {label}
                    </div>
                    <div className="text-xs font-semibold text-[#332A26] truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#EDE5DA] text-[#332A26] text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Hotline WhatsApp</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. ANGKA CAPAIAN KINERJA (STATS) ─── */}
      {customStats.length > 0 && (
        <section className="bg-white py-14 border-y border-[#EDE5DA]">
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {customStats.map((s: any, idx: number) => (
                <div key={idx} className="text-center space-y-1">
                  <div className="font-serif font-black text-3xl sm:text-4xl text-[#D47A6A]">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8A7D75] font-extrabold">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
              PENUGASAN PARLEMEN
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
              Alat Kelengkapan Dewan (AKD)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#7A6B63]">
              Mandat pengawasan regulasi perundang-undangan, akuntabilitas anggaran, serta kemitraan kementerian/lembaga.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EDE5DA] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE5DA] pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#332A26]">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span className="px-3.5 py-1.5 rounded-full bg-[#FAF0EC] text-[#D47A6A] border border-[#F4DDD3] text-xs font-bold self-start sm:self-auto">
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE5DA]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#D47A6A] uppercase tracking-wider">
                          <BookOpen className="w-4 h-4" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6E635C] leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE5DA]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#D47A6A] uppercase tracking-wider">
                          <BookOpen className="w-4 h-4" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6E635C] leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi alokasi belanja modal APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE5DA]">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#D47A6A] uppercase tracking-wider">
                          <Users className="w-4 h-4" />
                          <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6E635C] leading-relaxed font-normal">
                          {commissionPartners}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraksi Role */}
              {factionRole && (
                <div className="p-5 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-serif font-bold text-base sm:text-lg text-[#332A26] mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-xs font-bold text-[#332A26] border border-[#EDE5DA]">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C7D73] block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs flex items-start gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D47A6A] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#332A26]">{body.name}</div>
                          {body.role && (
                            <div className="text-[11px] font-semibold text-[#D47A6A] mt-0.5">
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
            <div className="p-8 rounded-3xl bg-white border border-[#EDE5DA] text-center space-y-2">
              <Landmark className="w-8 h-8 text-[#D47A6A]/60 mx-auto" />
              <h4 className="text-sm font-bold text-[#332A26]">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-[#8C7D73] max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. PILAR KOMITMEN LEGISLASI ─── */}
      <section className="bg-[#F5EFE6] py-16 border-t border-[#EAE0D3]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
              KOMITMEN
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
              Visi Advokasi Parlemen
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7A6B63]">
              Tiga pilar komitmen kerja legislatif dalam melayani masyarakat {info.dapil}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {info.visionPillars.map((pillar: any, idx: number) => {
              const Icon = pillarIcons[idx % pillarIcons.length];
              const num = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={idx}
                  className="p-7 rounded-3xl bg-white border border-[#EDE5DA] text-center space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-2xl text-[#D47A6A]">
                        #{num}
                      </span>
                      <span className="w-10 h-10 rounded-2xl bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#332A26] text-left">
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div className="text-xs font-semibold text-[#D47A6A] text-left">
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-[#7A6B63] leading-relaxed text-left font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EDE5DA] flex items-center justify-between text-[11px] text-[#8C7D73] font-semibold mt-4">
                    <span>Amanah {info.dapil}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#D47A6A]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. TIMELINE PENGABDIAN (PENDIDIKAN & KARIER) + KUTIPAN SAGE ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-10">
            
            {/* Pendidikan Formal */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                  PENDIDIKAN
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
                  Riwayat Pendidikan Formal
                </h3>
              </div>

              {info.educationList.length > 0 ? (
                <ol className="relative border-l-2 border-[#D47A6A]/30 space-y-6 ml-3">
                  {info.educationList.map((edu: string, idx: number) => (
                    <li key={idx} className="pl-6 relative">
                      <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center font-bold shadow-xs border border-[#F4DDD3]">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#332A26]">{edu}</h4>
                      <p className="mt-0.5 text-xs text-[#D47A6A] font-semibold">
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-5 rounded-2xl bg-white border border-[#EDE5DA] text-xs text-[#7A6B63]">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-[#EDE5DA] space-y-2">
                  <span className="text-[10px] font-bold text-[#8C7D73] uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3.5 py-1.5 rounded-full bg-white border border-[#EDE5DA] text-xs font-semibold text-[#6E635C]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rekam Jejak Karier */}
            <div className="space-y-6 pt-6 border-t border-[#EDE5DA]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                  PENGALAMAN
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
                  Rekam Jejak Karier &amp; Organisasi
                </h3>
              </div>

              {customCareers.length > 0 ? (
                <ol className="relative border-l-2 border-[#D47A6A]/30 space-y-7 ml-3">
                  {customCareers.map((car: any, idx: number) => (
                    <li key={idx} className="pl-6 relative">
                      <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center font-bold shadow-xs border border-[#F4DDD3]">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      {car.period && (
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#D47A6A]">
                          {car.period}
                        </div>
                      )}
                      <h4 className="mt-0.5 font-serif font-bold text-base sm:text-lg text-[#332A26]">
                        {car.role}
                      </h4>
                      {(car.organization || car.institution) && (
                        <p className="text-xs font-semibold text-[#7A6B63]">
                          {car.organization || car.institution}
                        </p>
                      )}
                      {car.description && (
                        <p className="mt-1 text-xs text-[#6E635C] leading-relaxed">
                          {car.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-5 rounded-2xl bg-white border border-[#EDE5DA] text-xs text-[#7A6B63]">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

          </div>

          {/* Kutipan Sage Box Kanan */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-8 sm:p-10 rounded-3xl bg-[#E2E8DC] border border-[#CCD8C4] text-[#2F3929] shadow-sm space-y-4">
              <Quote className="w-10 h-10 text-[#52604A] opacity-60" />
              <p className="font-serif italic text-lg sm:text-xl font-medium leading-snug">
                “Mendengar bukan sekadar mencatat kata-kata, melainkan memahami penderitaan dan harapan rakyat untuk kemudian diwujudkan menjadi kebijakan yang berpihak.”
              </p>
              <div className="pt-2 border-t border-[#CCD8C4]">
                <p className="font-bold text-sm text-[#2F3929]">{info.officialFullName}</p>
                <p className="text-xs text-[#5B6753]">{cleanLegislativeLevel} · {info.dapil}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="bg-white py-16 border-t border-[#EDE5DA]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                AKSI NYATA
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-[#FAF0EC] text-[#D47A6A] border border-[#F4DDD3] text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-3xl bg-[#FAF7F2] border border-[#EDE5DA] overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
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
                          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-white/20 text-[#332A26] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <Calendar className="w-3 h-3 text-[#D47A6A]" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-white/20 text-[#332A26] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                            <MapPin className="w-3 h-3 text-[#D47A6A]" />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#E0E6D8] flex flex-col items-center justify-center gap-2 text-[#5A6852]">
                        <Camera className="w-8 h-8 text-[#D47A6A]" />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-6 space-y-2">
                      <h4 className="font-serif font-bold text-base text-[#332A26] line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-[#6E635C] leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#EDE5DA] mt-2 flex items-center justify-between text-[11px] text-[#8C7D73]">
                    <span className="font-bold flex items-center gap-1 text-[#D47A6A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#FAF7F2] border border-[#EDE5DA] text-center space-y-2">
              <Camera className="w-8 h-8 text-[#D47A6A]/60 mx-auto" />
              <h4 className="text-sm font-bold text-[#332A26]">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-[#8C7D73] max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-6 lg:px-10 py-6">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION POSKO ASPIRASI ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#E2E8DC] border border-[#CCD8C4] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#52604A] block">
              Posko Aspirasi &amp; Reses Konstituen
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2F3929]">
              Sampaikan Aspirasi Anda Secara Langsung
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6753] max-w-xl font-normal">
              Suara Anda adalah pedoman pengawasan kebijakan kami di parlemen. Kirimkan laporan atau gagasan pembangunan untuk Daerah Pemilihan {info.dapil}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={href('/kontak')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <span>Hubungi Posko</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {info.waHotlineLink && (
              <a
                href={info.waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#CCD8C4] text-[#2F3929] text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Hotline WA</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
