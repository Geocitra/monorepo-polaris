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
} from 'lucide-react';
import { getBlushMemberInfo, useBlushHref } from './utils';

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
  const info = getBlushMemberInfo(member, theme, subdomain);
  const href = useBlushHref(subdomain);

  const facts = [
    { icon: Landmark, label: 'Lembaga', value: info.legislativeLevel },
    { icon: Flag, label: 'Fraksi Partai', value: info.party },
    { icon: Building2, label: 'Komisi / AKD', value: info.commissionName },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil },
  ];

  const stats = [
    { value: '5+', label: 'Tahun Pengabdian Parlemen' },
    { value: '35+', label: 'Raperda & Regulasi Dikawal' },
    { value: '1.200+', label: 'Aspirasi Warga Tertindaklanjuti' },
    { value: '98%', label: 'Tingkat Kehadiran Sidang' },
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
      title: 'Ketua Tim Advokasi & Anggota Banggar',
      desc: 'Mengawal pengesahan APBD berkeadilan, audit program infrastruktur desa, dan bantuan sosial tepat sasaran.',
    },
    {
      icon: GraduationCap,
      year: '2014 – 2017',
      title: 'Magister Ilmu Kebijakan Publik',
      desc: 'Fokus penelitian pada reformasi birokrasi, transparansi keuangan daerah, dan partisipasi publik.',
    },
    {
      icon: GraduationCap,
      year: '2008 – 2012',
      title: 'Sarjana Ilmu Pemerintahan',
      desc: 'Aktif dalam organisasi mahasiswa, advokasi kelompok tani, dan literasi hukum masyarakat.',
    },
  ];

  const pillars = [
    {
      icon: Scale,
      title: 'Regulasi Berkeadilan',
      desc: 'Menyusun peraturan daerah yang melindungi hak masyarakat kecil dan kepastian ruang berusaha.',
    },
    {
      icon: Wallet,
      title: 'Akuntabilitas APBD',
      desc: 'Memastikan alokasi belanja daerah berorientasi pada pemenuhan layanan dasar dan pembangunan desa.',
    },
    {
      icon: Megaphone,
      title: 'Kanal Reses Terbuka',
      desc: 'Menampung aspirasi masyarakat melalui dialog langsung, kunjungan lapangan, serta portal digital.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* ─── ABOUT SPLIT WITH OVAL SAGE ARCH ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Foto Potret Dewan dengan Oval Sage */}
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

              <div className="absolute -bottom-4 right-0 z-20 bg-white px-4 py-2 rounded-2xl shadow border border-[#EDE5DA]">
                <div className="text-[9px] uppercase tracking-wider text-[#D47A6A] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> TERVERIFIKASI
                </div>
                <div className="font-serif font-bold text-xs text-[#332A26]">
                  {info.dapil}
                </div>
              </div>
            </div>
          </div>

          {/* Teks Biografi & Data Parlemen */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                BIOGRAFI &amp; AMANAH
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#332A26]">
                {info.officialFullName}
              </h2>
              <p className="text-xs uppercase tracking-wider text-[#D47A6A] font-extrabold mt-1">
                {info.legislativeLevel} · {info.party}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#6E635C] leading-relaxed">
              {info.bio ||
                `Sebagai wakil rakyat di ${info.legislativeLevel}, ${info.officialFullName} mendedikasikan seluruh pemikiran dan kerja nyatanya untuk mengawal kepentingan masyarakat ${info.dapil}. Dikenal gigih dalam mengawasi efektivitas anggaran daerah dan turun langsung ke lapangan mendengarkan keluhan warga.`}
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

            <div className="pt-2">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
              >
                <span>Sampaikan Aspirasi Langsung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── ANGKA CAPAIAN KINERJA (STATS) ─── */}
      <section className="bg-white py-14 border-y border-[#EDE5DA]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center space-y-1">
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

      {/* ─── TIMELINE PENGABDIAN & KUTIPAN ─── */}
      <section className="max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                JEJAK LANGKAH
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
                Riwayat Pengabdian Parlemen
              </h3>
            </div>

            <ol className="relative border-l-2 border-[#D47A6A]/30 space-y-8 ml-3">
              {timeline.map(({ icon: Icon, year, title, desc }) => (
                <li key={title} className="pl-6 relative">
                  <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center font-bold shadow-xs border border-[#F4DDD3]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#D47A6A]">
                    {year}
                  </div>
                  <h4 className="mt-1 font-serif font-bold text-base text-[#332A26]">{title}</h4>
                  <p className="mt-1 text-xs text-[#7A6B63] leading-relaxed">{desc}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 p-8 sm:p-10 rounded-3xl bg-[#E2E8DC] border border-[#CCD8C4] text-[#2F3929] shadow-sm space-y-4">
              <Quote className="w-10 h-10 text-[#52604A] opacity-60" />
              <p className="font-serif italic text-lg sm:text-xl font-medium leading-snug">
                “Mendengar bukan sekadar mencatat kata-kata, melainkan memahami penderitaan dan harapan rakyat untuk kemudian diwujudkan menjadi kebijakan yang berpihak.”
              </p>
              <div className="pt-2 border-t border-[#CCD8C4]">
                <p className="font-bold text-sm text-[#2F3929]">{info.officialFullName}</p>
                <p className="text-xs text-[#5B6753]">{info.legislativeLevel} · {info.dapil}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PILAR KOMITMEN LEGISLASI ─── */}
      <section className="bg-[#F5EFE6] py-16 border-t border-[#EAE0D3]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
              KOMITMEN
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
              Visi Advokasi Daerah
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#7A6B63]">
              Tiga pilar komitmen kerja legislatif dalam melayani masyarakat {info.dapil}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-3xl bg-white border border-[#EDE5DA] text-center space-y-3 hover:shadow-md transition-shadow"
              >
                <span className="w-12 h-12 rounded-2xl bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center mx-auto shadow-2xs">
                  <Icon className="w-6 h-6" />
                </span>
                <h4 className="font-serif font-bold text-base text-[#332A26]">{title}</h4>
                <p className="text-xs text-[#7A6B63] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
