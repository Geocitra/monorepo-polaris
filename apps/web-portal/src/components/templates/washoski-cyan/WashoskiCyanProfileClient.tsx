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
} from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import { getWashoskiMemberInfo, useWashoskiHref, WASHOSKI_CYAN } from './utils';

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
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);

  const careerTimeline = [
    {
      period: '2024 - Sekarang',
      role: `Anggota ${info.legislativeLevel}`,
      institution: info.commissionName,
      description: `Menjalankan fungsi pengawasan alokasi belanja daerah, penyusunan rancangan peraturan daerah, serta menyerap aspirasi masyarakat di ${info.dapil}.`,
    },
    {
      period: '2019 - 2024',
      role: 'Ketua Tim Advokasi Kebijakan Publik',
      institution: 'Lembaga Pengkajian Hukum & Pembangunan',
      description:
        'Melakukan uji materi regulasi daerah dan mendampingi kelompok tani serta pengrajin UMKM dalam perlindungan hak usaha.',
    },
    {
      period: '2014 - 2019',
      role: 'Tenaga Ahli Fraksi Parlemen',
      institution: 'Dewan Perwakilan Rakyat Daerah',
      description:
        'Merumuskan pokok-pokok pikiran dewan, kajian akademis APBD, dan telaah harmonisasi regulasi nasional ke daerah.',
    },
  ];

  const educationList = [
    {
      degree: 'Magister Ilmu Administrasi Publik (M.Si.)',
      institution: 'Universitas Indonesia',
      year: '2016',
    },
    {
      degree: 'Sarjana Hukum (S.H.)',
      institution: 'Universitas Gadjah Mada',
      year: '2011',
    },
  ];

  const pillars = [
    {
      icon: Scale,
      title: 'Transparansi APBD',
      desc: 'Mengawal setiap pos anggaran belanja modal agar benar-benar dirasakan manfaatnya oleh masyarakat bawah.',
    },
    {
      icon: Users,
      title: 'Kesejahteraan Warga',
      desc: 'Pendampingan modal UMKM, perlindungan harga gabah petani lokal, dan fasilitas jaminan kesehatan warga.',
    },
    {
      icon: Building2,
      title: 'Infrastruktur Publik',
      desc: 'Perbaikan jalan penghubung antardesa, jembatan tani, dan sarana air bersih yang merata.',
    },
  ];

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL ─── */}
      <section className="pt-32 pb-16 bg-[#000000] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Portrait Dewan (Warna Asli, Tanpa Garis) */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#0A0A0A] border border-[#1E1E1E] shadow-[0_0_30px_rgba(5,223,215,0.15)]">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-[center_18%]"
                />
              </div>
            </div>

            {/* Bio Ringkas */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#05DFD7]/10 border border-[#05DFD7]/30 text-[#05DFD7] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Profil Resmi Legislator</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {info.officialFullName}
              </h1>

              <p className="text-base font-semibold text-[#05DFD7]">
                {info.headlineTagline}
              </p>

              <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed max-w-2xl">
                {info.bio}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1C1C1C]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#71717A] block">Daerah Pemilihan</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{info.dapil}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#71717A] block">Fraksi Parlemen</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{info.party}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#71717A] block">Komisi Kerja</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{info.commissionName}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. PILAR PERJUANGAN PARLEMEN ─── */}
      <section className="py-16 bg-[#070707] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="mb-10">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block mb-1">
              FOKUS PENGABDIAN
            </span>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-white">
              Tiga Pilar Kerja Parlemen <span className="text-[#05DFD7]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] hover:border-[#05DFD7] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#05DFD7]">
                      <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. LINIMASA PENGABDIAN & RIWAYAT PENDIDIKAN ─── */}
      <section className="py-20 bg-[#070707]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Kolom Kiri: Rekam Jejak Karir (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block mb-1">
                  PENGALAMAN & DEDIKASI
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pengabdian Kenegaraan
                </h2>
              </div>

              <div className="space-y-6">
                {careerTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] hover:border-[#05DFD7]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-[#05DFD7]">{item.period}</span>
                      <span className="text-xs text-[#71717A]">{item.institution}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.role}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Pendidikan (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block mb-1">
                  KUALIFIKASI AKADEMIK
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pendidikan
                </h2>
              </div>

              <div className="space-y-4">
                {educationList.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-[#0E0E0E] border border-[#1E1E1E] flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#141414] text-[#05DFD7] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#05DFD7]">Lulus Tahun {edu.year}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{edu.degree}</h4>
                      <p className="text-xs text-[#9CA3AF] mt-1">{edu.institution}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box Aspirasi CTA */}
              <div className="p-8 rounded-xl bg-[#0C0C0C] border border-[#222] space-y-4">
                <h3 className="text-lg font-bold text-white">
                  Sampaikan Pertanyaan & Audiensi
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Ingin mengajukan jadwal audiensi atau mengundang dalam diskusi publik di daerah pemilihan?
                </p>
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#05DFD7] hover:bg-[#00F2FE] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Hubungi Sekretariat Dewan &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </WashoskiCyanShell>
  );
}
