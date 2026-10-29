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
  CheckCircle2,
  ArrowRight,
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
import { getGoldenMemberInfo, useGoldenHref } from './utils';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface GoldenSplitProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function GoldenSplitProfileClient({
  member,
  theme,
  subdomain,
}: GoldenSplitProfileClientProps) {
  // 1. Resolve dynamic real data from member & theme
  const info = getGoldenMemberInfo(member, theme, subdomain);
  const href = useGoldenHref(subdomain);

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
    <div className="space-y-20 pb-20 bg-[#1E1E1E] text-[#E0E0E0] text-left">
      
      {/* ─── 1. ABOUT SPLIT DENGAN FRAME KUNING OFFSET ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Frame Foto dengan Offset Kuning Khas Golden Split */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative">
              <div
                className="absolute -top-4 -left-4 w-full h-full border-4 rounded-xs pointer-events-none"
                style={{ borderColor: info.primaryColor || '#FFA800' }}
              />
              <div className="relative w-[280px] sm:w-[320px] aspect-[4/5] bg-[#2E2E2E] shadow-2xl overflow-hidden rounded-xs border-2 border-white/10 z-10">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top filter contrast-[1.03]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                  }}
                />
              </div>
            </div>

            {/* Chip Mandat di bawah foto */}
            <div className="mt-6 w-[280px] sm:w-[320px] p-3 rounded-lg bg-[#262626] border border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Amanah Perwakilan Rakyat
              </span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate">
                {cleanLegislativeLevel} · {info.dapil?.toLowerCase().startsWith('dapil') ? info.dapil : `Dapil ${info.dapil}`}
              </span>
            </div>
          </div>

          {/* Teks Biografi & Fakta */}
          <div className="md:col-span-7 space-y-6 select-text">
            <div>
              <h1 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white">
                {info.officialFullName}
              </h1>
              <div
                className="w-16 h-1 mt-2 rounded-full"
                style={{ backgroundColor: info.primaryColor || '#FFA800' }}
              />
              <p
                className="text-xs uppercase tracking-wider font-bold mt-2"
                style={{ color: info.primaryColor || '#FFA800' }}
              >
                {cleanLegislativeLevel} · {info.party}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-neutral-300 mt-0.5">
                {activeCommissionName || 'Komisi Terkait DPR'} {commissionRole ? `(${commissionRole})` : ''} · Daerah Pemilihan {info.dapil}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {info.bio ||
                `Sebagai wakil rakyat di ${cleanLegislativeLevel}, ${info.officialFullName} mendedikasikan seluruh pemikiran dan kerja nyatanya untuk mengawal kepentingan masyarakat ${info.dapil}. Dikenal gigih dalam mengawasi efektivitas anggaran daerah dan turun langsung ke lapangan mendengarkan keluhan warga.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-[#262626] border border-white/5"
                >
                  <Icon
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: info.primaryColor || '#FFA800' }}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">
                      {label}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded text-[#1E1E1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md hover:brightness-110 cursor-pointer"
                style={{ backgroundColor: info.primaryColor || '#FFA800' }}
              >
                <span>Sampaikan Aspirasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {info.waHotlineLink && (
                <a
                  href={info.waHotlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all border border-white/10 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Hotline WhatsApp</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. ANGKA CAPAIAN KINERJA (HANYA DITAMPILKAN JIKA DIATUR DARI DASHBOARD) ─── */}
      {customStats.length > 0 && (
        <section className="bg-[#242424] py-14 border-y border-white/5">
          <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {customStats.map((s: any, idx: number) => (
                <div key={idx} className="text-center space-y-1">
                  <div
                    className="font-outfit font-black text-3xl sm:text-4xl"
                    style={{ color: info.primaryColor || '#FFA800' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10">
        <div className="space-y-6">
          <div>
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Penugasan Alat Kelengkapan Dewan (AKD)
            </h2>
            <div
              className="w-16 h-1 mt-2 rounded-full"
              style={{ backgroundColor: info.primaryColor || '#FFA800' }}
            />
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              Mandat pengawasan regulasi, anggaran daerah, dan kemitraan lembaga pemerintah.
            </p>
          </div>

          {hasAnyAkd ? (
            <div className="space-y-5">
              {/* Komisi Utama */}
              {activeCommissionName && (
                <div className="p-6 sm:p-7 rounded-xl bg-[#262626] border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Penugasan Komisi Parlemen
                      </span>
                      <h3 className="font-outfit font-bold text-xl sm:text-2xl text-white">
                        {activeCommissionName}
                      </h3>
                    </div>
                    {commissionRole && (
                      <span
                        className="px-3.5 py-1.5 rounded text-xs font-bold self-start sm:self-auto text-[#1E1E1E]"
                        style={{ backgroundColor: info.primaryColor || '#FFA800' }}
                      >
                        {commissionRole}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {commissionScope ? (
                      <div className="space-y-1.5 p-4 rounded-lg bg-[#1E1E1E] border border-white/5">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor || '#FFA800' }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Ruang Lingkup &amp; Bidang Pengawasan</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                          {commissionScope}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-4 rounded-lg bg-[#1E1E1E] border border-white/5">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor || '#FFA800' }}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Tugas Pokok &amp; Fungsi</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                          Menjalankan fungsi legislasi daerah, pengawasan penegakan peraturan perundang-undangan, dan sinkronisasi anggaran APBD pro-rakyat.
                        </p>
                      </div>
                    )}

                    {commissionPartners && (
                      <div className="space-y-1.5 p-4 rounded-lg bg-[#1E1E1E] border border-white/5">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                          style={{ color: info.primaryColor || '#FFA800' }}
                        >
                          <Users className="w-4 h-4" />
                          <span>Mitra Kerja Kementerian &amp; Lembaga</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                          {commissionPartners}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraksi Role */}
              {factionRole && (
                <div className="p-4 sm:p-5 rounded-xl bg-[#262626] border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Penugasan Fraksi Parlemen
                    </div>
                    <div className="font-outfit font-bold text-base sm:text-lg text-white mt-0.5">
                      Fraksi {info.party}
                    </div>
                  </div>
                  <span className="px-3.5 py-1 rounded bg-white/10 text-xs font-bold text-white">
                    {factionRole}
                  </span>
                </div>
              )}

              {/* AKD Bodies Lainnya */}
              {akdBodies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                    Badan &amp; Alat Kelengkapan Dewan Lainnya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {akdBodies.map((body: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-xl bg-[#262626] border border-white/5 flex items-start gap-3"
                      >
                        <ShieldCheck
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: info.primaryColor || '#FFA800' }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{body.name}</div>
                          {body.role && (
                            <div
                              className="text-[11px] font-semibold mt-0.5"
                              style={{ color: info.primaryColor || '#FFA800' }}
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
            <div className="p-8 rounded-xl bg-[#262626] border border-white/5 text-center space-y-2">
              <Landmark className="w-8 h-8 text-[#FFA800]/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Informasi penugasan komisi &amp; AKD sedang dalam tahap pemutakhiran
              </h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Data pembagian komisi, badan, dan mitra kementerian terkait akan tampil di sini setelah ditetapkan secara resmi.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. PILAR KOMITMEN LEGISLASI ─── */}
      <section className="bg-[#242424] py-16 border-t border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              3 Pilar Komitmen Parlemen
            </h2>
            <div
              className="w-16 h-1 mt-2 rounded-full mx-auto"
              style={{ backgroundColor: info.primaryColor || '#FFA800' }}
            />
            <p className="mt-3 text-xs sm:text-sm text-neutral-400">
              Prinsip utama yang senantiasa melandasi setiap langkah advokasi kebijakan publik di parlemen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {info.visionPillars.map((pillar: any, idx: number) => {
              const Icon = pillarIcons[idx % pillarIcons.length];
              const num = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={idx}
                  className="p-7 rounded-xl bg-[#1E1E1E] border border-white/5 text-center space-y-3 hover:border-[#FFA800]/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-outfit font-black text-2xl"
                        style={{ color: info.primaryColor || '#FFA800' }}
                      >
                        #{num}
                      </span>
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${info.primaryColor || '#FFA800'}22`,
                          color: info.primaryColor || '#FFA800',
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>

                    <h3 className="font-outfit font-bold text-base text-white text-left">
                      {pillar.title}
                    </h3>

                    {pillar.subtitle && (
                      <div
                        className="text-xs font-semibold text-left"
                        style={{ color: info.primaryColor || '#FFA800' }}
                      >
                        {pillar.subtitle}
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 leading-relaxed text-left font-normal">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-semibold mt-4">
                    <span>Amanah {info.dapil}</span>
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: info.primaryColor || '#FFA800' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. REKAM JEJAK PENGABDIAN (PENDIDIKAN & KARIER) + KUTIPAN ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Riwayat Kiri: Pendidikan & Karier */}
          <div className="md:col-span-7 space-y-10">
            
            {/* Pendidikan Formal */}
            <div className="space-y-6">
              <div>
                <h3 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
                  Riwayat Pendidikan Formal
                </h3>
                <div
                  className="w-16 h-1 mt-2 rounded-full"
                  style={{ backgroundColor: info.primaryColor || '#FFA800' }}
                />
              </div>

              {info.educationList.length > 0 ? (
                <ol className="relative border-l-2 border-[#FFA800]/30 space-y-6 ml-3">
                  {info.educationList.map((edu: string, idx: number) => (
                    <li key={idx} className="pl-6 relative">
                      <span
                        className="absolute -left-[17px] top-0 w-8 h-8 rounded-full text-[#1E1E1E] flex items-center justify-center font-bold shadow-md"
                        style={{ backgroundColor: info.primaryColor || '#FFA800' }}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">{edu}</h4>
                      <p
                        className="mt-0.5 text-xs font-semibold"
                        style={{ color: info.primaryColor || '#FFA800' }}
                      >
                        Kredensial Pendidikan Terverifikasi
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-5 rounded-lg bg-[#262626] border border-white/5 text-xs text-neutral-400">
                  Informasi riwayat pendidikan akademik belum ditambahkan.
                </div>
              )}

              {/* Pelatihan & Sertifikasi */}
              {courses.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Pelatihan &amp; Sertifikasi Keparlemenan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded bg-[#262626] border border-white/10 text-xs text-white"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rekam Jejak Karier */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div>
                <h3 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
                  Rekam Jejak Karier &amp; Pengabdian
                </h3>
                <div
                  className="w-16 h-1 mt-2 rounded-full"
                  style={{ backgroundColor: info.primaryColor || '#FFA800' }}
                />
              </div>

              {customCareers.length > 0 ? (
                <ol className="relative border-l-2 border-[#FFA800]/30 space-y-7 ml-3">
                  {customCareers.map((car: any, idx: number) => (
                    <li key={idx} className="pl-6 relative">
                      <span
                        className="absolute -left-[17px] top-0 w-8 h-8 rounded-full text-[#1E1E1E] flex items-center justify-center font-bold shadow-md"
                        style={{ backgroundColor: info.primaryColor || '#FFA800' }}
                      >
                        <Briefcase className="w-4 h-4" />
                      </span>
                      {car.period && (
                        <div
                          className="text-[11px] font-extrabold uppercase tracking-wider"
                          style={{ color: info.primaryColor || '#FFA800' }}
                        >
                          {car.period}
                        </div>
                      )}
                      <h4 className="mt-0.5 text-sm sm:text-base font-bold text-white">
                        {car.role}
                      </h4>
                      {(car.organization || car.institution) && (
                        <p className="text-xs font-semibold text-neutral-300">
                          {car.organization || car.institution}
                        </p>
                      )}
                      {car.description && (
                        <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                          {car.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-5 rounded-lg bg-[#262626] border border-white/5 text-xs text-neutral-400">
                  Informasi rekam jejak karier belum ditambahkan.
                </div>
              )}
            </div>

          </div>

          {/* Kutipan Komitmen Kanan */}
          <div className="md:col-span-5">
            <div className="sticky top-28 p-8 rounded-2xl bg-gradient-to-br from-[#FFA800] to-[#D97706] text-[#1E1E1E] shadow-2xl space-y-4">
              <Quote className="w-10 h-10 opacity-70" />
              <p className="font-outfit text-lg sm:text-xl font-extrabold leading-snug">
                “Amanah rakyat adalah tanggung jawab tertinggi. Setiap kebijakan daerah harus berlandaskan data nyata dan berpihak seutuhnya pada kemaslahatan masyarakat.”
              </p>
              <div className="pt-2 border-t border-black/15">
                <p className="font-bold text-sm">{info.officialFullName}</p>
                <p className="text-xs opacity-80">{cleanLegislativeLevel} · {info.dapil}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 6. DOKUMENTASI KINERJA TURUN KE DAPIL (AKSI LAPANGAN) ─── */}
      <section className="bg-[#242424] py-16 border-t border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
                Dokumentasi Kinerja Turun ke Dapil
              </h2>
              <div
                className="w-16 h-1 mt-2 rounded-full"
                style={{ backgroundColor: info.primaryColor || '#FFA800' }}
              />
            </div>
            <span
              className="px-3.5 py-1.5 rounded text-xs font-bold text-[#1E1E1E] self-start sm:self-auto"
              style={{ backgroundColor: info.primaryColor || '#FFA800' }}
            >
              Aksi Lapangan
            </span>
          </div>

          {displayActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActivities.map((act: any, aIdx: number) => (
                <div
                  key={aIdx}
                  className="rounded-xl bg-[#1E1E1E] border border-white/5 overflow-hidden hover:border-[#FFA800]/50 transition-all flex flex-col justify-between shadow-md"
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
                          <div className="absolute top-2.5 left-2.5 bg-[#1E1E1E]/90 backdrop-blur-md border border-white/20 text-[#FFA800] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{act.date}</span>
                          </div>
                        )}

                        {act.location && (
                          <div className="absolute bottom-2.5 left-2.5 bg-[#1E1E1E]/90 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                            <MapPin className="w-3 h-3 text-[#FFA800]" />
                            <span className="truncate max-w-[170px]">{act.location}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[#262626] flex flex-col items-center justify-center gap-2 text-neutral-400">
                        <Camera className="w-8 h-8 text-[#FFA800]" />
                        <span className="text-xs font-semibold">Dokumentasi Lapangan</span>
                      </div>
                    )}

                    <div className="p-5 space-y-2">
                      <h4 className="font-outfit font-bold text-base text-white line-clamp-2 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 font-normal">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span
                      className="font-bold flex items-center gap-1"
                      style={{ color: info.primaryColor || '#FFA800' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kinerja Terverifikasi</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#1E1E1E] border border-white/5 text-center space-y-2">
              <Camera className="w-8 h-8 text-[#FFA800]/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">Informasi dokumentasi kinerja belum ditambahkan</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Dokumentasi aksi nyata dan kunjungan dapil akan tampil di sini setelah diperbarui melalui dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. GALERI FOTO RESMI (BILA ADA) ─── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="max-w-[1140px] mx-auto px-6 lg:px-10 py-6">
          <PortalPhotoGallery photos={member.photoGallery} memberName={info.officialFullName} />
        </section>
      )}

      {/* ─── 8. CALL TO ACTION ASPIRASI KONSTITUEN ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#262626] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span
              className="text-[11px] font-bold uppercase tracking-widest block"
              style={{ color: info.primaryColor || '#FFA800' }}
            >
              Posko Aspirasi &amp; Advokasi Rakyat
            </span>
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Sampaikan Aspirasi Anda Secara Langsung
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-normal">
              Suara Anda adalah pedoman pengawasan kebijakan kami di parlemen. Kirimkan laporan atau ide pembangunan daerah pemilihan {info.dapil}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={href('/kontak')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded text-[#1E1E1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: info.primaryColor || '#FFA800' }}
            >
              <span>Kirim Aspirasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {info.waHotlineLink && (
              <a
                href={info.waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all border border-white/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hotline WA</span>
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
