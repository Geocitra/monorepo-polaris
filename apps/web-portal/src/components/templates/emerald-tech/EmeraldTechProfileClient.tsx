'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface EmeraldTechProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function EmeraldTechProfileClient({
  member,
  theme,
  subdomain,
}: EmeraldTechProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const party = member?.partyAffiliation || 'Fraksi Parlemen DPR RI';
  const bio =
    theme?.bioBiography ||
    `${officialFullName} telah mendedikasikan bertahun-tahun masa pengabdian untuk mendampingi masyarakat di Daerah Pemilihan ${dapil}. Dengan integritas, ketulusan mendengar, dan kecermatan merumuskan regulasi, beliau senantiasa hadir mengawal setiap aspirasi konstituen menuju kemakmuran bersama.`;

  const [activeTab, setActiveTab] = useState<'semua' | 'visi' | 'pendidikan' | 'karier' | 'komisi'>('semua');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const educations = [
    {
      degree: 'Doktor Ilmu Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI)',
      year: '2016 - 2020',
      description: 'Disertasi mengenai efektivitas desentralisasi fiskal dan tata kelola anggaran daerah berbasis kesejahteraan.',
    },
    {
      degree: 'Magister Sains Administrasi Publik (S2)',
      institution: 'Universitas Gadjah Mada (UGM)',
      year: '2008 - 2011',
      description: 'Fokus kajian regulasi pembangunan infrastruktur pedesaan dan pemberdayaan ekonomi komunitas.',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Politik (S1)',
      institution: 'Universitas Padjadjaran (UNPAD)',
      year: '2002 - 2006',
      description: 'Aktif sebagai ketua senat mahasiswa dan penggerak advokasi hukum kerakyatan.',
    },
  ];

  const careers = [
    {
      role: 'Anggota Komisi Keuangan & Perbankan',
      organization: 'Dewan Perwakilan Rakyat RI (DPR RI)',
      period: '2024 - Sekarang',
      description: 'Menyusun regulasi perlindungan konsumen jasa keuangan, perluasan KUR UMKM, dan pengawasan fiskal negara.',
    },
    {
      role: 'Pimpinan Panitia Khusus Tata Ruang & Pangan',
      organization: 'DPR RI',
      period: '2021 - 2024',
      description: 'Mengawal undang-undang ketahanan pangan dan perlindungan lahan pertanian produktif dari alih fungsi.',
    },
    {
      role: 'Tenaga Ahli Utama Bidang Regulasi',
      organization: 'Kementerian Koordinator Perekonomian',
      period: '2015 - 2019',
      description: 'Menganalisis sinkronisasi regulasi investasi padat karya dan insentif industri kerakyatan di daerah.',
    },
  ];

  const commissions = [
    {
      badge: 'Fungsi Legislasi',
      title: 'Penyusunan RUU Pemberdayaan Ekonomi Rakyat',
      detail: 'Mendorong regulasi wajib belanja produk UMKM lokal oleh kementerian dan pemerintah daerah minimal 40%.',
    },
    {
      badge: 'Fungsi Anggaran',
      title: 'Alokasi Infrastruktur Logistik & Internet Desa',
      detail: 'Mengamankan alokasi belanja modal APBN untuk konektivitas jembatan antardesa dan 32 laboratorium sekolah pelosok.',
    },
    {
      badge: 'Fungsi Pengawasan',
      title: 'Pemberantasan Spekulan & Penyelewengan Pupuk',
      detail: 'Sidak berkala di distributor pupuk bersubsidi untuk menjamin ketersediaan kuota tepat musim tanam petani.',
    },
  ];

  return (
    <div className="space-y-16">
      
      {/* ─── 1. HERO BIO CARD (DENGAN LINGKARAN HIJAU DAN CINCIN NEON) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Portrait with overlapping green circle */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex justify-center items-end">
            {/* Green Glow Circle */}
            <div className="absolute top-4 left-4 w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[#00DF82] z-0 opacity-80" />
            <div className="absolute bottom-4 right-2 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white z-0 opacity-90" />

            {/* Cutout Photo */}
            <div className="relative z-10 w-full flex justify-center">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-auto max-h-[420px] sm:max-h-[460px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>

            {/* Glowing Neon Green Ring */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-16 rounded-[100%] border-[5px] border-[#00DF82] shadow-[0_0_25px_#00DF82,inset_0_0_15px_#00DF82] -rotate-6 z-20 pointer-events-none"
            />
          </div>
        </div>

        {/* Right Column: Two-Tone Heading, Bio, Metadata, Action */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00DF82] block mb-2">
              PROFIL & REKAM JEJAK
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              <span className="text-white">ANGGOTA </span>
              <span className="text-[#00DF82]">PARLEMEN DPR RI</span>
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mt-4">
              {bio}
            </p>
          </div>

          {/* Metadata Key-Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm pt-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Nama Resmi:</span>
              <span className="text-stone-400">{officialFullName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Fraksi:</span>
              <span className="text-stone-400">{party}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Dapil:</span>
              <span className="text-stone-400">{dapil}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Komisi:</span>
              <span className="text-stone-400">Komisi XI (Keuangan & Perbankan)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Surel:</span>
              <span className="text-stone-400 truncate">aspirasi@{subdomain || 'ahmadfauzi'}.polaris.id</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Hotline:</span>
              <span className="text-stone-400">+62 812-9876-5432</span>
            </div>
          </div>

          {/* Rectangular Emerald Buttons */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-block bg-[#00DF82] hover:bg-[#00c974] text-black font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 shadow-[0_0_20px_rgba(0,223,130,0.3)] hover:scale-105 active:scale-95 transition-all rounded-xs"
            >
              Hubungi Parlemen
            </Link>

            <Link
              href={getNavLinkHref('/artikel')}
              className="inline-block bg-[#161616] border border-white/[0.1] hover:border-[#00DF82] text-white font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 transition-all rounded-xs"
            >
              Baca Artikel Kajian
            </Link>
          </div>

        </div>

      </div>

      {/* ─── 2. TAB SELECTION BUTTONS ─── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-4">
        {[
          { id: 'semua', label: 'Semua Ikhtisar' },
          { id: 'visi', label: 'Visi Pengabdian' },
          { id: 'pendidikan', label: 'Riwayat Pendidikan' },
          { id: 'karier', label: 'Karier & Pengalaman' },
          { id: 'komisi', label: 'Mandat Komisi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-[#00DF82] text-black shadow-[0_0_15px_rgba(0,223,130,0.3)]'
                : 'bg-[#161616] text-stone-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 3. TAB CONTENT SECTIONS ─── */}
      <div className="space-y-12">
        
        {/* SECTION: VISI */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <section className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
              <span>Visi & Prinsip Kerja Kenegaraan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  no: '01',
                  title: 'Transparansi Anggaran Tanpa Syarat',
                  desc: 'Menyajikan rincian dana aspirasi, hasil reses, dan usulan pokok pikiran parlemen secara terbuka melalui kanal digital publik.',
                },
                {
                  no: '02',
                  title: 'Advokasi Ekonomi Kerakyatan',
                  desc: 'Memperjuangkan perlindungan hukum pengrajin, pedagang kecil, dan petani lokal dari monopoli serta regulasi izin yang berbelit.',
                },
                {
                  no: '03',
                  title: 'Konektivitas & Akses Pendidikan Adil',
                  desc: 'Menjamin pemerataan sarana digital, kuota beasiswa tidak mampu, dan jembatan logistik antardesa pelosok tanpa diskriminasi.',
                },
              ].map((v, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-3"
                >
                  <span className="text-2xl font-black text-[#00DF82] block">{v.no}</span>
                  <h4 className="text-base font-bold text-white">{v.title}</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: PENDIDIKAN */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <section className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
              <span>Riwayat Pendidikan & Keilmuan</span>
            </h3>

            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black border border-white/[0.1] text-[#00DF82] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white">{edu.degree}</h4>
                      <p className="text-xs font-semibold text-[#00DF82]">{edu.institution}</p>
                      <p className="text-xs text-stone-400 leading-relaxed pt-1">{edu.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-black border border-white/[0.1] text-stone-300 self-start">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: KARIER */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <section className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
              <span>Pengalaman Karier & Advokasi Publik</span>
            </h3>

            <div className="space-y-4">
              {careers.map((car, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black border border-white/[0.1] text-[#00DF82] flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white">{car.role}</h4>
                      <p className="text-xs font-semibold text-[#00DF82]">{car.organization}</p>
                      <p className="text-xs text-stone-400 leading-relaxed pt-1">{car.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-black border border-white/[0.1] text-stone-300 self-start">
                    {car.period}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: KOMISI */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <section className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
              <span>Fokus Pengawalan Parlemen</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commissions.map((com, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-3"
                >
                  <span className="inline-block px-3 py-1 rounded-xs bg-[#00DF82] text-black text-[10px] font-black uppercase tracking-wider">
                    {com.badge}
                  </span>
                  <h4 className="text-base font-bold text-white">{com.title}</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">{com.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
