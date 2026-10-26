'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark,
  Building2,
  Flag,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  Scale,
  Megaphone,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';
import { ParichayAmberShell } from './ParichayAmberShell';
import { getParichayMemberInfo, useParichayHref } from './utils';

export interface ParichayAmberProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function ParichayAmberProfileClient({
  member,
  theme,
  subdomain,
}: ParichayAmberProfileClientProps) {
  const info = getParichayMemberInfo(member, theme, subdomain);
  const href = useParichayHref(subdomain);

  const facts = [
    { icon: Landmark, label: 'Lembaga', value: info.legislativeLevel },
    { icon: Flag, label: 'Fraksi Partai', value: info.party },
    { icon: Building2, label: 'Komisi / AKD', value: info.commissionName },
    { icon: MapPin, label: 'Daerah Pemilihan', value: info.dapil },
  ];

  const stats = [
    { value: '5+', label: 'Tahun Pengabdian Parlemen' },
    { value: '35+', label: 'Raperda & Regulasi Dikawal' },
    { value: '1.200+', label: 'Aspirasi Warga Ditindaklanjuti' },
    { value: '98%', label: 'Tingkat Kehadiran Sidang' },
  ];

  const timeline = [
    {
      year: '2024 – Sekarang',
      title: `Anggota ${info.legislativeLevel}`,
      desc: `Mewakili aspirasi konstituen ${info.dapil}, bertugas aktif di ${info.commissionName} dan Badan Anggaran.`,
    },
    {
      year: '2019 – 2024',
      title: 'Ketua Tim Advokasi Kebijakan Daerah',
      desc: 'Mengawal pengesahan APBD berkeadilan, audit program infrastruktur desa, dan beasiswa pendidikan tepat sasaran.',
    },
    {
      year: '2014 – 2019',
      title: 'Tenaga Ahli Madya Fraksi & Riset Regulasi',
      desc: 'Menyusun naskah akademik perancangan perda inisiatif perlindungan tenaga kerja dan UMKM.',
    },
  ];

  const education = [
    {
      degree: 'Magister Sains (M.Si.) – Kebijakan Publik',
      school: 'Universitas Indonesia',
      year: 'Lulus dengan Predikat Sangat Memuaskan',
    },
    {
      degree: 'Sarjana Hukum (S.H.) – Hukum Tata Negara',
      school: 'Universitas Padjadjaran',
      year: 'Aktif dalam Senat Mahasiswa & Lembaga Bantuan Hukum',
    },
  ];

  return (
    <ParichayAmberShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
      showMasthead={false}
    >
      {/* ─── 1. HEADER SECTION PROFIL ─── */}
      <section className="relative py-16 bg-[#FFF9ED] border-b border-[#F3E8D6] overflow-hidden">
        {/* Decorative Arcs */}
        <div className="absolute -left-20 -top-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/60 pointer-events-none" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: info.primaryColor }}
              >
                BIOGRAFI &amp; REKAM JEJAK
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-[#1E1E1E] tracking-tight">
              Profil Lengkap Dewan
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Mengenal lebih dekat dedikasi, rekam jejak pengabdian, dan visi keterbukaan publik dari {info.officialFullName}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. BIOGRAFI UTAMA & POTRET ─── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* Kolom Kiri: Foto Potret & Kartu Identitas Parlemen */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#F3E8D6] shadow-lg">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/dewan-standing-crop.png';
                    }}
                  />
                </div>
                <div className="p-6 bg-white border-t border-[#F3E8D6]">
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    {info.officialFullName}
                  </h3>
                  <p className="text-xs font-bold text-[#6B7280] mt-1">
                    {info.legislativeLevel} &bull; {info.party}
                  </p>
                </div>
              </div>

              {/* Data Lembaga & Jabatan */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-[#E5E7EB] space-y-3.5">
                {facts.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                          {f.label}
                        </div>
                        <div className="text-xs font-bold text-[#1E1E1E]">
                          {f.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan: Narasi Bio & 4 Metrik */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <h2 className="font-extrabold text-2xl sm:text-3xl text-[#1E1E1E]">
                  Integritas &amp; Pengabdian Nyata untuk Warga
                </h2>
                <div className="text-xs sm:text-sm text-[#4B5563] leading-relaxed space-y-3.5">
                  <p>
                    Sebagai wakil rakyat di {info.legislativeLevel}, {info.officialFullName} menempatkan aspirasi warga sebagai kompas utama dalam setiap perumusan kebijakan daerah, pembahasan anggaran pendapatan dan belanja daerah (APBD), serta pengawasan kinerja satuan kerja perangkat daerah.
                  </p>
                  <p>
                    {info.bio ||
                      'Mengedepankan prinsip transparansi dan akuntabilitas parlemen modern, setiap kanal komunikasi publik dibuka seluas-luasnya untuk memastikan keluhan, usulan, dan kebutuhan masyarakat di daerah pemilihan dapat segera diadvokasikan secara konkret.'}
                  </p>
                </div>
              </div>

              {/* 4 Kartu Metrik */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6] text-center space-y-1"
                  >
                    <div
                      className="text-2xl sm:text-3xl font-extrabold"
                      style={{ color: info.primaryColor }}
                    >
                      {st.value}
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider leading-tight">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Riwayat Pengabdian Parlemen */}
              <div className="space-y-4 pt-4 border-t border-[#F3E8D6]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" style={{ color: info.primaryColor }} />
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    Riwayat Pengabdian &amp; Karier
                  </h3>
                </div>
                <div className="space-y-4">
                  {timeline.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] hover:border-[#FFA800] transition-colors"
                    >
                      <span
                        className="text-[10px] font-black uppercase tracking-wider block"
                        style={{ color: info.primaryColor }}
                      >
                        {t.year}
                      </span>
                      <h4 className="font-bold text-sm text-[#1E1E1E] mt-0.5">
                        {t.title}
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Riwayat Pendidikan */}
              <div className="space-y-4 pt-4 border-t border-[#F3E8D6]">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" style={{ color: info.primaryColor }} />
                  <h3 className="font-extrabold text-xl text-[#1E1E1E]">
                    Latar Belakang Pendidikan
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]"
                    >
                      <h4 className="font-bold text-xs text-[#1E1E1E]">
                        {edu.degree}
                      </h4>
                      <div className="text-xs font-semibold text-[#4B5563] mt-1">
                        {edu.school}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] mt-1">
                        {edu.year}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Kontak */}
              <div className="pt-4 flex items-center justify-between p-6 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6]">
                <div>
                  <h4 className="font-extrabold text-sm text-[#1E1E1E]">
                    Ingin Berdiskusi atau Menyampaikan Aspirasi?
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Posko reses dan kanal digital resmi terbuka untuk seluruh warga {info.dapil}.
                  </p>
                </div>
                <Link
                  href={href('/kontak')}
                  className="px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm hover:scale-105 transition-all"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  Hubungi Posko
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>
    </ParichayAmberShell>
  );
}
