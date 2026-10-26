'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  CheckCircle2,
  Compass,
  ArrowRight,
  BookOpen,
  BarChart3,
  Mail,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import { NexoraVioletShell } from './NexoraVioletShell';
import { getNexoraMemberInfo, useNexoraHref } from './utils';

interface NexoraVioletProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function NexoraVioletProfileClient({
  member,
  theme,
  subdomain,
}: NexoraVioletProfileClientProps) {
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);

  return (
    <NexoraVioletShell member={member} theme={theme} subdomain={subdomain} activePage="profil">
      <div className="px-6 sm:px-10 lg:px-16 py-12 sm:py-16 max-w-6xl mx-auto space-y-16">
        
        {/* ========================================================= */}
        {/* HEADER: TYPOGRAPHY & HERO CARD                            */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-[#7048E8] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Profil Resmi Anggota Dewan • Terverifikasi</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Rekam Jejak & Pengabdian
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                BIOGRAFI DEWAN
              </h1>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 max-w-sm">
              Mandat kenegaraan dan komitmen pengabdian memperjuangkan kesejahteraan rakyat di Daerah Pemilihan {info.dapil}.
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PROFILE CARD (Executive Portrait + Fast Stats)            */}
        {/* ========================================================= */}
        <div className="rounded-[32px] bg-gradient-to-br from-purple-50 via-white to-purple-50/60 p-6 sm:p-10 border border-purple-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Cutout / Portrait */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.avatar}
                  alt={info.fullName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {info.party}
                  </div>
                  <div className="text-sm font-black">{info.dapil}</div>
                </div>
              </div>
            </div>

            {/* Right: Full Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {info.fullName}
                </h2>
                <p className="text-sm font-bold text-[#7048E8] flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{info.title}</span>
                </p>
              </div>

              {/* Bio Statement Quote */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100/90 shadow-sm text-slate-700 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#7048E8]">
                  Visi & Komitmen Kebangsaan
                </div>
                <p className="text-xs sm:text-sm italic leading-relaxed text-slate-800">
                  &ldquo;{info.bio}&rdquo;
                </p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] font-semibold text-slate-500">Kehadiran Rapat</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">100%</div>
                  <div className="text-[9px] text-[#7048E8] font-bold">Paripurna & Komisi</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] font-semibold text-slate-500">Telaah Regulasi</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">14 RUU</div>
                  <div className="text-[9px] text-purple-600 font-bold">Inisiasi & Risalah</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] font-semibold text-slate-500">Kunjungan Dapil</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">48+ Titik</div>
                  <div className="text-[9px] text-slate-600 font-bold">Reses Konstituen</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] font-semibold text-slate-500">Advokasi Warga</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">1.200+</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Aspirasi Selesai</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                  <span>Katalog Artikel</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>

                <Link
                  href={href('/infografis')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-[#7048E8] border border-purple-200 text-xs font-bold transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Infografis Kinerja</span>
                </Link>

                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition"
                >
                  <span>Kontak Staf Ahli</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* "OUR MISSION" SECTION (Matching card in reference image)   */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-sm font-serif italic text-slate-600">
              Prinsip & Landasan Pengabdian
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">
              Our Mission
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50/60 rounded-3xl p-6 border border-purple-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                1. Pengawasan Anggaran Tuntas
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memastikan setiap alokasi APBD dan dana transfer pusat mengalir langsung ke program produktif: irigasi pertanian, sarana UMKM, serta pelayanan kesehatan gratis.
              </p>
            </div>

            <div className="bg-purple-50/60 rounded-3xl p-6 border border-purple-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                2. Legislasi Partisipatif
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membuka ruang dengar pendapat terbuka sebelum rancangan perda atau regulasi ketuk palu, memastikan hak kelompok rentan dan pelaku usaha kecil terlindungi.
              </p>
            </div>

            <div className="bg-purple-50/60 rounded-3xl p-6 border border-purple-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                3. Layanan Advokasi 24/7
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membangun posko respon cepat aspirasi konstituen secara daring dan luring demi penyelesaian sengketa agraria, kendala bansos, dan keluhan layanan publik.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIWAYAT PENDIDIKAN & KARIER                               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Riwayat Pendidikan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
              <GraduationCap className="w-5 h-5 text-[#7048E8]" />
              <span>Riwayat Pendidikan</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#7048E8] font-bold text-xs shrink-0">
                  S2
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7048E8]">2014 - 2016</div>
                  <div className="text-sm font-black text-slate-900">Magister Manajemen Kebijakan Publik</div>
                  <div className="text-xs text-slate-500">Universitas Indonesia</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#7048E8] font-bold text-xs shrink-0">
                  S1
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7048E8]">2006 - 2011</div>
                  <div className="text-sm font-black text-slate-900">Sarjana Teknik Sipil & Perencanaan</div>
                  <div className="text-xs text-slate-500">Institut Teknologi Bandung</div>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Pengabdian & Karier */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
              <Briefcase className="w-5 h-5 text-[#7048E8]" />
              <span>Karier & Pengabdian</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#7048E8] font-bold text-xs shrink-0">
                  DPR
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7048E8]">2024 - Sekarang</div>
                  <div className="text-sm font-black text-slate-900">Anggota Komisi VI DPR RI</div>
                  <div className="text-xs text-slate-500">Bidang Perdagangan, BUMN, Investasi & Koperasi</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#7048E8] font-bold text-xs shrink-0">
                  ORG
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7048E8]">2018 - 2023</div>
                  <div className="text-sm font-black text-slate-900">Ketua Harian Forum Pemerhati UMKM Daerah</div>
                  <div className="text-xs text-slate-500">Pendampingan 500+ Koperasi Rakyat</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </NexoraVioletShell>
  );
}
