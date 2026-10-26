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
} from 'lucide-react';
import { getArikMemberInfo, useArikHref, ARIK_NOIR } from './utils';
import { ArikNoirShell } from './ArikNoirShell';

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
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── HERO PROFILE ─── */}
      <section className="pt-36 pb-20 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Portrait Dewan */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#111111] border border-[#222222] shadow-2xl">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-[#161616]/90 border border-[#2A2A2A] text-[10px] font-mono uppercase tracking-wider text-[#C5A880] inline-block mb-2">
                    {info.party}
                  </span>
                  <p className="text-sm font-bold text-[#F5F2EB]">
                    {info.officialFullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Ringkas */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-[#C5A880] text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PROFIL RESMI LEGISLATOR</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif italic text-[#F5F2EB] tracking-tight leading-tight">
                {info.officialFullName}
              </h1>

              <p className="text-sm sm:text-base font-semibold text-[#E8DCC4]">
                {info.headlineTagline}
              </p>

              <p className="text-sm text-[#8E8A83] leading-relaxed">
                {info.bio}
              </p>

              {/* Data Parlemen */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1C1C1C]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] block">Daerah Pemilihan</span>
                  <span className="text-sm font-bold text-[#F5F2EB] mt-1 block">{info.dapil}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] block">Fraksi Parlemen</span>
                  <span className="text-sm font-bold text-[#F5F2EB] mt-1 block">{info.party}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] block">Komisi Kerja</span>
                  <span className="text-sm font-bold text-[#F5F2EB] mt-1 block">{info.commissionName}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href={href('/kontak')}
                  className="px-6 py-2.5 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-md"
                >
                  Sampaikan Aspirasi
                </Link>
                <Link
                  href={href('/artikel')}
                  className="px-6 py-2.5 rounded-full bg-[#141414] border border-[#262626] text-[#F5F2EB] hover:border-[#C5A880] text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Kajian Kebijakan
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── VISI, MISI & MANDAT ─── */}
      <section className="py-20 bg-[#070707] border-b border-[#161616]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-2">
              PRINSIP PERJUANGAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#F5F2EB]">
              Komitmen Pengabdian Rakyat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#C5A880] mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F2EB]">Integritas Legislasi</h3>
              <p className="text-xs text-[#8E8A83] leading-relaxed">
                Menolak segala bentuk kompromi yang merugikan rakyat dalam perumusan peraturan daerah dan penetapan tarif retribusi daerah.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#C5A880] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F2EB]">Keterbukaan Publik</h3>
              <p className="text-xs text-[#8E8A83] leading-relaxed">
                Membuka hasil notula rapat komisi dan pelaporan pertanggungjawaban APBD secara digital agar mudah diakses oleh konstituen.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#C5A880] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F2EB]">Pendampingan Nyata</h3>
              <p className="text-xs text-[#8E8A83] leading-relaxed">
                Mendampingi kelompok tani, pelaku UMKM, dan korban ketidakadilan agraria melalui advokasi hukum dan bantuan permodalan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RIWAYAT PENDIDIKAN & KARIR ─── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Pendidikan */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#C5A880]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F2EB]">Riwayat Pendidikan</h3>
              </div>

              <div className="space-y-4 border-l border-[#1E1E1E] pl-6 ml-4">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
                  <span className="text-[10px] font-mono text-[#5C5852] uppercase tracking-wider block">Magister Kebijakan Publik</span>
                  <h4 className="text-sm font-bold text-[#F5F2EB] mt-0.5">Universitas Indonesia</h4>
                  <p className="text-xs text-[#8E8A83] mt-1">Fokus Kajian Tata Kelola Keuangan Daerah & Hukum Tata Negara.</p>
                </div>

                <div className="relative pt-4">
                  <div className="absolute -left-[31px] top-5.5 w-2.5 h-2.5 rounded-full bg-[#2A2A2A]" />
                  <span className="text-[10px] font-mono text-[#5C5852] uppercase tracking-wider block">Sarjana Ilmu Politik</span>
                  <h4 className="text-sm font-bold text-[#F5F2EB] mt-0.5">Universitas Padjadjaran</h4>
                  <p className="text-xs text-[#8E8A83] mt-1">Aktif dalam organisasi kepemudaan dan lembaga advokasi masyarakat desa.</p>
                </div>
              </div>
            </div>

            {/* Pengabdian & Organisasi */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#C5A880]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F2EB]">Pengalaman Organisasi</h3>
              </div>

              <div className="space-y-4 border-l border-[#1E1E1E] pl-6 ml-4">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C5A880]" />
                  <span className="text-[10px] font-mono text-[#5C5852] uppercase tracking-wider block">2024 - Sekarang</span>
                  <h4 className="text-sm font-bold text-[#F5F2EB] mt-0.5">Anggota Parlemen {info.legislativeLevel}</h4>
                  <p className="text-xs text-[#8E8A83] mt-1">Mengawal pembahasan anggaran fungsi legislasi dan pengawasan dinas daerah.</p>
                </div>

                <div className="relative pt-4">
                  <div className="absolute -left-[31px] top-5.5 w-2.5 h-2.5 rounded-full bg-[#2A2A2A]" />
                  <span className="text-[10px] font-mono text-[#5C5852] uppercase tracking-wider block">2019 - 2024</span>
                  <h4 className="text-sm font-bold text-[#F5F2EB] mt-0.5">Ketua Yayasan Advokasi Kerakyatan</h4>
                  <p className="text-xs text-[#8E8A83] mt-1">Membina puluhan koperasi tani dan posko bantuan hukum masyarakat kurang mampu.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </ArikNoirShell>
  );
}
