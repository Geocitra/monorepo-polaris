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
import { AgethaRubyShell } from './AgethaRubyShell';
import { getAgethaMemberInfo, useAgethaHref, AGETHA_RUBY } from './utils';

export interface AgethaRubyProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function AgethaRubyProfileClient({
  member,
  theme,
  subdomain,
}: AgethaRubyProfileClientProps) {
  const info = getAgethaMemberInfo(member, theme, subdomain);
  const href = useAgethaHref(subdomain);

  const careerTimeline = [
    {
      period: '2024 - Sekarang',
      role: `Anggota ${info.legislativeLevel}`,
      institution: info.commissionName,
      description: `Membidangi perumusan rancangan peraturan daerah, pengawasan anggaran belanja daerah, serta penyaluran aspirasi konstituen di Daerah Pemilihan ${info.dapil}.`,
    },
    {
      period: '2019 - 2024',
      role: 'Ketua Tim Advokasi Kebijakan Publik',
      institution: 'Lembaga Studi & Bantuan Hukum Daerah',
      description:
        'Mengadvokasi hak-hak masyarakat rentan, perlindungan lahan pertanian, serta pendampingan perizinan UMKM daerah.',
    },
    {
      period: '2014 - 2019',
      role: 'Tenaga Ahli Kebijakan & Legislasi',
      institution: 'Fraksi Parlemen',
      description:
        'Menyusun naskah akademis rancangan peraturan daerah dan melakukan audit implementasi kebijakan pelayanan dasar publik.',
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
      desc: 'Pengawasan menyeluruh terhadap tata kelola anggaran daerah demi menekan kebocoran dan memastikan serapan belanja berdampak riil bagi masyarakat.',
    },
    {
      icon: Users,
      title: 'Kesejahteraan UMKM',
      desc: 'Penyediaan modal usaha tanpa agunan memberatkan, digitalisasi produk kerajinan desa, serta regulasi pro-pedagang tradisional.',
    },
    {
      icon: Building2,
      title: 'Akses Pendidikan & Kesehatan',
      desc: 'Pengawalan program beasiswa siswa kurang mampu serta perbaikan fasilitas puskesmas pembantu di pelosok daerah.',
    },
  ];

  return (
    <AgethaRubyShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL ─── */}
      <section className="pt-32 pb-16 bg-[#0F0F0F] border-b border-[#1F1F1F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Portrait Dewan */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#161616] border border-[#2E2E2E] shadow-2xl">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Bio Ringkas & Mandat */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Profil Resmi Legislator</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {info.officialFullName}
              </h1>

              <p className="text-base font-semibold text-[#E50914]">
                {info.headlineTagline}
              </p>

              <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed max-w-2xl">
                {info.bio}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1F1F1F]">
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
      <section className="py-16 bg-[#0F0F0F] border-b border-[#1F1F1F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] block mb-1">
              Fokus Pengabdian
            </span>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-white">
              Tiga Pilar Kerja Parlemen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-[#141414] border border-[#242424] hover:border-[#E50914]/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E1E1E] border border-[#2E2E2E] flex items-center justify-center text-[#E50914]">
                      <Icon className="w-6 h-6" />
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
      <section className="py-20 bg-[#0F0F0F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Kolom Kiri: Rekam Jejak Karir (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] block mb-1">
                  Pengalaman & Dedikasi
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pengabdian Kenegaraan
                </h2>
              </div>

              <div className="space-y-6">
                {careerTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-[#141414] border border-[#222] hover:border-[#E50914]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-[#E50914]">{item.period}</span>
                      <span className="text-xs text-[#71717A]">{item.institution}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.role}</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Pendidikan & Sertifikasi (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] block mb-1">
                  Kualifikasi Akademik
                </span>
                <h2 className="text-2xl font-black uppercase text-white">
                  Riwayat Pendidikan
                </h2>
              </div>

              <div className="space-y-4">
                {educationList.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-[#141414] border border-[#222] flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] text-[#E50914] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#E50914]">Lulus Tahun {edu.year}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{edu.degree}</h4>
                      <p className="text-xs text-[#9CA3AF] mt-1">{edu.institution}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box Aspirasi CTA */}
              <div className="p-8 rounded-xl bg-[#181818] border border-[#2E2E2E] space-y-4">
                <h3 className="text-lg font-bold text-white">
                  Sampaikan Pertanyaan & Audiensi
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Ingin mengajukan jadwal audiensi atau mengundang dalam diskusi publik di daerah pemilihan?
                </p>
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#E50914] hover:bg-[#D32F2F] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Hubungi Sekretariat Dewan &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </AgethaRubyShell>
  );
}
