'use client';

import React from 'react';
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
} from 'lucide-react';
import { CrimsonLabel, CrimsonButton, CrimsonPortrait } from './CrimsonNoirShell';
import { getCrimsonMemberInfo, useCrimsonHref } from './utils';

interface CrimsonNoirProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CrimsonNoirProfileClient({ member, theme, subdomain }: CrimsonNoirProfileClientProps) {
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const href = useCrimsonHref(subdomain);

  const facts = [
    { icon: Landmark, label: 'Lembaga', value: info.legislativeLevel },
    { icon: Flag, label: 'Fraksi', value: info.party },
    { icon: Building2, label: 'Alat Kelengkapan', value: info.commissionName },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil },
  ];

  const stats = [
    { value: '24+', label: 'Raperda Dikawal' },
    { value: '1.200+', label: 'Aspirasi Ditindaklanjuti' },
    { value: '86', label: 'Kunjungan Reses' },
    { value: '98%', label: 'Kehadiran Rapat' },
  ];

  const timeline = [
    { icon: Briefcase, year: '2024 – Sekarang', title: `Anggota ${info.legislativeLevel}`, desc: `Bertugas di ${info.commissionName}, mewakili ${info.dapil}.` },
    { icon: Briefcase, year: '2019 – 2024', title: 'Ketua Bidang Advokasi Publik', desc: 'Memimpin pendampingan hukum dan advokasi kebijakan untuk masyarakat akar rumput.' },
    { icon: GraduationCap, year: '2012 – 2016', title: 'Magister Kebijakan Publik', desc: 'Fokus riset pada tata kelola anggaran daerah dan partisipasi warga.' },
    { icon: GraduationCap, year: '2006 – 2010', title: 'Sarjana Ilmu Pemerintahan', desc: 'Aktif di organisasi kemahasiswaan dan gerakan literasi desa.' },
  ];

  const missions = [
    { icon: Scale, title: 'Regulasi Berkeadilan', desc: 'Perda yang melindungi kelompok rentan dan memberi kepastian hukum bagi warga.' },
    { icon: Wallet, title: 'Anggaran Pro-Rakyat', desc: 'APBD yang fokus pada pendidikan, kesehatan, dan infrastruktur dasar.' },
    { icon: Megaphone, title: 'Parlemen Terbuka', desc: 'Kanal aspirasi digital dan publikasi kinerja yang dapat diawasi publik.' },
  ];

  return (
    <div>
      {/* About split */}
      <section className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5">
          <CrimsonPortrait src={info.photoUrl} alt={info.officialFullName} className="w-full max-w-[340px] mx-auto aspect-[3/4]" />
        </div>
        <div className="md:col-span-7">
          <CrimsonLabel>Biografi</CrimsonLabel>
          <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">{info.officialFullName}</h2>
          <p className="mt-5 text-xs text-white/65 leading-[1.9]">
            {info.bio ||
              `${info.officialFullName} adalah anggota ${info.legislativeLevel} dari ${info.party}. Dikenal sebagai legislator yang turun langsung ke lapangan, ia menjadikan aspirasi warga ${info.dapil} sebagai kompas utama dalam setiap pembahasan regulasi dan anggaran. Komitmennya: parlemen yang terbuka, kebijakan yang berbasis data, dan pelayanan yang cepat tanggap.`}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#1A1A1A] border border-white/5">
                <Icon className="w-4 h-4 text-[#D62828] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
                  <div className="text-xs font-semibold text-white truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <CrimsonButton href={href('/kontak')} className="mt-6">Sampaikan Aspirasi</CrimsonButton>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#121212] border-y border-white/5">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-outfit font-extrabold text-3xl sm:text-4xl text-[#E04848]">{s.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-white/55">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline + Quote */}
      <section className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <CrimsonLabel>Perjalanan</CrimsonLabel>
          <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Riwayat Pengabdian</h2>
          <ol className="mt-8 relative border-l border-white/10 space-y-8">
            {timeline.map(({ icon: Icon, year, title, desc }) => (
              <li key={title} className="pl-7 relative">
                <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-[#D62828] flex items-center justify-center shadow-[0_0_14px_rgba(214,40,40,0.6)]">
                  <Icon className="w-3 h-3 text-white" />
                </span>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{year}</div>
                <h3 className="mt-1 text-sm font-bold text-white">{title}</h3>
                <p className="mt-1 text-[11px] text-white/55 leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="md:col-span-5">
          <div className="sticky top-24 p-7 rounded-[4px] bg-gradient-to-br from-[#D62828] to-[#5E0B0B] text-white">
            <Quote className="w-7 h-7 opacity-60" />
            <p className="mt-4 font-outfit text-lg font-bold leading-snug">
              “Kebijakan terbaik bukan yang paling tebal dokumennya, melainkan yang paling nyata manfaatnya bagi rakyat.”
            </p>
            <p className="mt-4 text-[11px] text-white/75">— {info.officialFullName}</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#121212] border-t border-white/5">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20">
          <CrimsonLabel>Visi & Misi</CrimsonLabel>
          <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Komitmen Kerja</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {missions.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#1A1A1A] rounded-[4px] border border-white/5 px-6 py-7 text-center hover:border-[#D62828]/50 hover:-translate-y-1 transition-all">
                <Icon className="w-5 h-5 text-[#D62828] mx-auto" />
                <h3 className="mt-3 text-xs font-bold text-white">{title}</h3>
                <p className="mt-2 text-[10px] text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
