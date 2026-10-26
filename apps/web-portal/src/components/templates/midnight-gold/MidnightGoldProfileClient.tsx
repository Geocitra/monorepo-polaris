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
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  GraduationCap,
  Briefcase,
  FileText,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface MidnightGoldProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function MidnightGoldProfileClient({
  member,
  theme,
  subdomain,
}: MidnightGoldProfileClientProps) {
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
      
      {/* ─── 1. HERO BIO CARD (PERSIS SECTION 2 ABOUT ME DI GAMBAR) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Portrait Photo in Dark Box */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#0c0c0c] border border-white/[0.1] shadow-2xl group">
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-white/[0.1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFBD39]">
                <ShieldCheck className="w-4 h-4" />
                <span>Pejabat Terverifikasi DPR RI</span>
              </div>
              <p className="text-[11px] text-white/70 truncate mt-0.5">{dapil}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Bio, Metadata Key-Values, Metric, Action */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FFBD39] block mb-2">
              BIOGRAFI & REKAM JEJAK
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {officialFullName}
            </h2>
            <p className="text-[#999999] text-xs sm:text-sm leading-relaxed mt-4">
              {bio}
            </p>
          </div>

          {/* 2-Column Metadata Key-Values (persis format gambar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm pt-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Nama Resmi:</span>
              <span className="text-[#999999]">{officialFullName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Fraksi Parlemen:</span>
              <span className="text-[#999999]">{party}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Daerah Pemilihan:</span>
              <span className="text-[#999999]">{dapil}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Penugasan Komisi:</span>
              <span className="text-[#999999]">Komisi XI (Keuangan & Perbankan)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Surel Parlemen:</span>
              <span className="text-[#999999] truncate">aspirasi@{subdomain || 'ahmadfauzi'}.polaris.id</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-white min-w-[120px]">Hotline Warga:</span>
              <span className="text-[#999999]">+62 812-9876-5432</span>
            </div>
          </div>

          {/* Highlight Count (persis '73 Project complete') */}
          <div className="pt-2">
            <p className="text-lg sm:text-xl font-bold text-white flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#FFBD39]">14+</span>
              <span>Regulasi & RUU Pokok Telah Diperjuangkan di Parlemen</span>
            </p>
          </div>

          {/* Yellow Button */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 bg-[#FFBD39] hover:bg-[#e5a823] text-black font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,189,57,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>SAMPAIKAN GAGASAN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={getNavLinkHref('/artikel')}
              className="inline-flex items-center gap-2 bg-transparent border border-white/25 hover:border-white text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-white/[0.06] transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#FFBD39]" />
              <span>BACA KAJIAN</span>
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
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-[#FFBD39] text-black shadow-[0_0_15px_rgba(255,189,57,0.3)]'
                : 'bg-[#0a0a0a] text-white/70 hover:text-white border border-white/[0.08]'
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
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
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
                  className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all space-y-3"
                >
                  <span className="text-2xl font-black text-[#FFBD39] block">{v.no}</span>
                  <h4 className="text-base font-bold text-white">{v.title}</h4>
                  <p className="text-xs text-[#999999] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: PENDIDIKAN */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <section className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
              <span>Riwayat Pendidikan & Keilmuan</span>
            </h3>

            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/[0.1] text-[#FFBD39] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white">{edu.degree}</h4>
                      <p className="text-xs font-semibold text-[#FFBD39]">{edu.institution}</p>
                      <p className="text-xs text-[#999999] leading-relaxed pt-1">{edu.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-black border border-white/[0.1] text-white/70 self-start">
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
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
              <span>Pengalaman Karier & Advokasi Publik</span>
            </h3>

            <div className="space-y-4">
              {careers.map((car, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/[0.1] text-[#FFBD39] flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white">{car.role}</h4>
                      <p className="text-xs font-semibold text-[#FFBD39]">{car.organization}</p>
                      <p className="text-xs text-[#999999] leading-relaxed pt-1">{car.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-black border border-white/[0.1] text-white/70 self-start">
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
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBD39]" />
              <span>Fokus Pengawalan Parlemen</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {commissions.map((com, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all space-y-3"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FFBD39] text-black text-[10px] font-black uppercase tracking-wider">
                    {com.badge}
                  </span>
                  <h4 className="text-base font-bold text-white">{com.title}</h4>
                  <p className="text-xs text-[#999999] leading-relaxed">{com.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
