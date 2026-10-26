'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref, LAILA_SAKURA } from './utils';

interface LailaSakuraProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function LailaSakuraProfileClient({
  member,
  theme,
  subdomain,
}: LailaSakuraProfileClientProps) {
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

  const keyMetrics = [
    {
      value: '100%',
      label: 'Kehadiran Sidang Paripurna',
      desc: 'Disiplin dan aktif dalam setiap pengambilan keputusan legislasi daerah.',
    },
    {
      value: '120+',
      label: 'Aspirasi Warga Tuntas',
      desc: 'Diserap melalui reses dan diperjuangkan dalam pokok pikiran (Pokir).',
    },
    {
      value: '14',
      label: 'Inisiatif Naskah Perda',
      desc: 'Mengawal regulasi pro-rakyat, perlindungan petani, dan UMKM daerah.',
    },
  ];

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
      degree: 'Doktoral (S3) Kebijakan Publik & Tata Kelola',
      institution: 'Universitas Indonesia',
      year: '2020',
      note: 'Disertasi: Reformasi Akuntabilitas Anggaran Belanja Daerah Berbasis Kebutuhan Riil Masyarakat',
    },
    {
      degree: 'Magister (S2) Manajemen Pembangunan Daerah',
      institution: 'Institut Pertanian Bogor',
      year: '2015',
      note: 'Fokus: Kebijakan Distribusi Sarana Produksi Pertanian & Ketahanan Pangan',
    },
    {
      degree: 'Sarjana (S1) Ilmu Pemerintahan & Politik',
      institution: 'Universitas Padjadjaran',
      year: '2010',
      note: 'Studi Kebijakan Otonomi Daerah dan Partisipasi Konstituen',
    },
  ];

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
    >
      {/* ─── 1. HERO PROFIL HEADER ─── */}
      <section className="relative px-4 sm:px-6 pt-6 pb-14 bg-[#080D1A]">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ backgroundColor: info.primaryColor }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Foto Profil dengan Glowing Sakura Aura */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-[280px] sm:w-[340px] md:w-[380px] h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-[#070B14] border border-[#1E2B42] shadow-2xl flex items-end justify-center">
                <div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full blur-[80px] pointer-events-none opacity-40"
                  style={{ backgroundColor: info.primaryColor }}
                />
                <img
                  src={info.photoUrl || '/images/laila-sakura-hero.jpg'}
                  alt={info.officialFullName}
                  className="w-full h-full object-contain object-bottom relative z-10 filter brightness-105 contrast-105"
                  style={{
                    maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            {/* Biodata & Identitas */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold tracking-widest"
                style={{
                  color: info.primaryColor,
                  backgroundColor: `${info.primaryColor}1F`,
                  borderColor: `${info.primaryColor}4D`,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>🌸 PROFIL RESMI ANGGOTA LEGISLATIF 🌸</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {info.officialFullName}
              </h1>

              <p
                className="text-sm sm:text-base font-semibold"
                style={{ color: info.primaryColor }}
              >
                {info.headlineTagline}
              </p>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#1E2B42]">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#64748B] block">Daerah Pemilihan</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{info.dapil}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#64748B] block">Komisi Parlemen</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{info.commissionName}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed pt-2">
                {info.bio}
              </p>

              <div className="pt-3">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(255,77,141,0.4)] hover:shadow-[0_6px_28px_rgba(255,77,141,0.6)]"
                  style={{
                    background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
                  }}
                >
                  <span>Sampaikan Aspirasi Warga 🌸</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 2. METRIK KINERJA ─── */}
      <section className="bg-[#080D1A] pb-12">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {keyMetrics.map((metric, i) => (
              <div
                key={i}
                className="p-7 rounded-3xl bg-[#0D1527] border border-[#1E2B42] space-y-2 hover:border-[#FF4D8D]/50 transition-colors shadow-lg"
              >
                <span
                  className="text-3xl sm:text-4xl font-black font-mono tracking-tight block"
                  style={{ color: info.primaryColor }}
                >
                  {metric.value}
                </span>
                <h4 className="text-sm font-bold text-white">{metric.label}</h4>
                <p className="text-xs text-[#8E9BB0] leading-relaxed">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. VISI & NILAI ADVOKASI ─── */}
      <section className="py-16 lg:py-20 bg-[#080D1A] border-t border-[#1E2B42]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              Arah Perjuangan Parlemen
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              🌸 Visi & Nilai Advokasi 🌸
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-7 hover:border-[#FF4D8D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D8D]/15 border border-[#FF4D8D]/30 flex items-center justify-center text-[#FF4D8D]">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Integritas Legislasi</h3>
              <p className="text-xs text-[#A0ABC0] leading-relaxed">
                Menyusun dan mengawal peraturan daerah yang berpihak kepada kepentingan masyarakat luas, kepastian berusaha, dan keadilan sosial.
              </p>
            </div>

            <div className="bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-7 hover:border-[#FF4D8D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D8D]/15 border border-[#FF4D8D]/30 flex items-center justify-center text-[#FF4D8D]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Transparansi Anggaran</h3>
              <p className="text-xs text-[#A0ABC0] leading-relaxed">
                Memastikan setiap rupiah APBD teralokasikan secara akuntabel, tepat sasaran ke sektor pendidikan, kesehatan gratis, dan infrastruktur desa.
              </p>
            </div>

            <div className="bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-7 hover:border-[#FF4D8D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D8D]/15 border border-[#FF4D8D]/30 flex items-center justify-center text-[#FF4D8D]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Pendampingan Konstituen</h3>
              <p className="text-xs text-[#A0ABC0] leading-relaxed">
                Membuka kanal komunikasi dua arah yang responsif melalui Rumah Aspirasi, menjaring suara warga untuk diperjuangkan dalam rapat dewan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. REKAM JEJAK & PENDIDIKAN ─── */}
      <section className="py-16 lg:py-20 bg-[#060A14] border-t border-[#1E2B42]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Pendidikan */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF4D8D]/15 border border-[#FF4D8D]/30 flex items-center justify-center text-[#FF4D8D]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Riwayat Pendidikan</h3>
              </div>

              <div className="space-y-6 pl-4 border-l-2 border-[#1E2B42]">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="relative pl-6 space-y-1">
                    <div
                      className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#060A14]"
                      style={{ backgroundColor: idx === 0 ? info.primaryColor : '#4A1D2F' }}
                    />
                    <span
                      className="text-[11px] font-mono font-bold"
                      style={{ color: idx === 0 ? info.primaryColor : '#8E9BB0' }}
                    >
                      Lulus {edu.year}
                    </span>
                    <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                    <p className="text-xs text-[#FF4D8D] font-semibold">{edu.institution}</p>
                    <p className="text-[11px] text-[#8E9BB0] leading-relaxed">{edu.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Karier */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF4D8D]/15 border border-[#FF4D8D]/30 flex items-center justify-center text-[#FF4D8D]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Karier & Pengabdian</h3>
              </div>

              <div className="space-y-6 pl-4 border-l-2 border-[#1E2B42]">
                {careerTimeline.map((item, idx) => (
                  <div key={idx} className="relative pl-6 space-y-1">
                    <div
                      className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#060A14]"
                      style={{ backgroundColor: idx === 0 ? info.primaryColor : '#4A1D2F' }}
                    />
                    <span
                      className="text-[11px] font-mono font-bold"
                      style={{ color: idx === 0 ? info.primaryColor : '#8E9BB0' }}
                    >
                      {item.period}
                    </span>
                    <h4 className="text-sm font-bold text-white">{item.role}</h4>
                    <p className="text-xs text-[#FF4D8D] font-semibold">{item.institution}</p>
                    <p className="text-[11px] text-[#A0ABC0] leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </LailaSakuraShell>
  );
}
