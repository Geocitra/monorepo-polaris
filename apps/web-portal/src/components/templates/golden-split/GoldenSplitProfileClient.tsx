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
} from 'lucide-react';
import { getGoldenMemberInfo, useGoldenHref } from './utils';

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
  const info = getGoldenMemberInfo(member, theme, subdomain);
  const href = useGoldenHref(subdomain);

  const facts = [
    { icon: Landmark, label: 'Lembaga', value: info.legislativeLevel },
    { icon: Flag, label: 'Fraksi Partai', value: info.party },
    { icon: Building2, label: 'Komisi / AKD', value: info.commissionName },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil },
  ];

  const stats = [
    { value: '28+', label: 'Raperda Dikawal' },
    { value: '1.450+', label: 'Aspirasi Ditindaklanjuti' },
    { value: '92', label: 'Kunjungan Reses Lapangan' },
    { value: '99%', label: 'Tingkat Kehadiran Sidang' },
  ];

  const timeline = [
    {
      icon: Briefcase,
      year: '2024 – Sekarang',
      title: `Anggota ${info.legislativeLevel}`,
      desc: `Mewakili aspirasi konstituen ${info.dapil}, bertugas aktif di ${info.commissionName}.`,
    },
    {
      icon: Briefcase,
      year: '2019 – 2024',
      title: 'Pimpinan Badan Anggaran & Komisi',
      desc: 'Mengawal pengesahan APBD pro-rakyat, evaluasi belanja modal infrastruktur, dan beasiswa daerah.',
    },
    {
      icon: GraduationCap,
      year: '2014 – 2017',
      title: 'Magister Kebijakan Publik & Tata Kelola',
      desc: 'Riset evaluasi kebijakan alokasi dana bantuan sosial dan efektivitas jaring pengaman ekonomi daerah.',
    },
    {
      icon: GraduationCap,
      year: '2008 – 2012',
      title: 'Sarjana Ilmu Pemerintahan',
      desc: 'Aktif dalam gerakan advokasi masyarakat desa, studi regulasi otonomi daerah, dan literasi publik.',
    },
  ];

  const commitments = [
    {
      icon: Scale,
      title: 'Regulasi Berkeadilan',
      desc: 'Menyusun peraturan daerah yang melindungi hak warga kecil, pekerja informal, dan kelompok rentan.',
    },
    {
      icon: Wallet,
      title: 'Transparansi APBD',
      desc: 'Memastikan setiap rupiah uang rakyat digunakan secara tepat sasaran, akuntabel, dan bebas pemborosan.',
    },
    {
      icon: Megaphone,
      title: 'Kanal Aspirasi Terbuka',
      desc: 'Membuka layanan aduan dan dialog langsung dengan konstituen secara transparan dan terdata rapi.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* ─── ABOUT SPLIT DENGAN FRAME KUNING OFFSET ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Frame Foto dengan Offset Kuning */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-4 border-[#FFA800] rounded-xs pointer-events-none" />
              <div className="relative w-[280px] sm:w-[320px] aspect-[4/5] bg-[#2E2E2E] shadow-2xl overflow-hidden rounded-xs border-2 border-white/10 z-10">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Teks Biografi & Fakta */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white">
                {info.officialFullName}
              </h2>
              <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
              <p className="text-xs uppercase tracking-wider text-[#FFA800] font-bold mt-2">
                {info.legislativeLevel} · {info.party}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {info.bio ||
                `Sebagai wakil rakyat di ${info.legislativeLevel}, ${info.officialFullName} mendedikasikan seluruh pemikiran dan kerja nyatanya untuk mengawal kepentingan masyarakat ${info.dapil}. Dikenal gigih dalam mengawasi efektivitas anggaran daerah dan turun langsung ke lapangan mendengarkan keluhan warga.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-[#262626] border border-white/5"
                >
                  <Icon className="w-4 h-4 text-[#FFA800] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">
                      {label}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors shadow-md"
              >
                <span>Sampaikan Aspirasi Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── ANGKA CAPAIAN KINERJA ─── */}
      <section className="bg-[#242424] py-14 border-y border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <div className="font-outfit font-black text-3xl sm:text-4xl text-[#FFA800]">
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

      {/* ─── REKAM JEJAK & KUTIPAN ─── */}
      <section className="max-w-[1140px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Riwayat */}
          <div className="md:col-span-7 space-y-8">
            <div>
              <h3 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
                Riwayat Pengabdian
              </h3>
              <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
            </div>

            <ol className="relative border-l-2 border-[#FFA800]/30 space-y-8 ml-3">
              {timeline.map(({ icon: Icon, year, title, desc }) => (
                <li key={title} className="pl-6 relative">
                  <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#FFA800] text-[#1E1E1E] flex items-center justify-center font-bold shadow-md">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#FFA800]">
                    {year}
                  </div>
                  <h4 className="mt-1 text-sm sm:text-base font-bold text-white">{title}</h4>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{desc}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Kutipan Komitmen */}
          <div className="md:col-span-5">
            <div className="sticky top-28 p-8 rounded-2xl bg-gradient-to-br from-[#FFA800] to-[#D97706] text-[#1E1E1E] shadow-2xl space-y-4">
              <Quote className="w-10 h-10 opacity-70" />
              <p className="font-outfit text-lg sm:text-xl font-extrabold leading-snug">
                “Amanah rakyat adalah tanggung jawab tertinggi. Setiap kebijakan daerah harus berlandaskan data nyata dan berpihak seutuhnya pada kemaslahatan masyarakat.”
              </p>
              <div className="pt-2 border-t border-black/15">
                <p className="font-bold text-sm">{info.officialFullName}</p>
                <p className="text-xs opacity-80">{info.legislativeLevel} · {info.dapil}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PILAR KOMITMEN ─── */}
      <section className="bg-[#242424] py-16 border-t border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h3 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Visi &amp; Komitmen Legislasi
            </h3>
            <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full mx-auto" />
            <p className="mt-3 text-xs sm:text-sm text-neutral-400">
              Prinsip utama yang senantiasa melandasi setiap langkah advokasi di parlemen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commitments.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-xl bg-[#1E1E1E] border border-white/5 text-center space-y-3 hover:border-[#FFA800]/50 transition-colors"
              >
                <span className="w-12 h-12 rounded-xl bg-[#FFA800]/15 text-[#FFA800] flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6" />
                </span>
                <h4 className="font-outfit font-bold text-base text-white">{title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
