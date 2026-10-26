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
  CheckCircle2,
  Award,
  Users,
} from 'lucide-react';

interface QurifolioProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function QurifolioProfileClient({
  member,
  theme,
  subdomain,
}: QurifolioProfileClientProps) {
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

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Ahmad Fauzi', firstName: 'Ahmad', lastName: 'Fauzi' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : 'Fauzi';

    return {
      cleanName: clean || 'Ahmad Fauzi',
      firstName,
      lastName,
    };
  }

  const { firstName, cleanName } = parseCleanIdentity(member?.fullName);

  const educations = [
    {
      degree: 'Doktor Ilmu Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI)',
      year: '2016 - 2020',
      description: 'Disertasi mengenai efektivitas desentralisasi fiskal dan tata kelola anggaran daerah berbasis kesejahteraan rakyat.',
    },
    {
      degree: 'Magister Sains Administrasi Publik (S2)',
      institution: 'Universitas Gadjah Mada (UGM)',
      year: '2008 - 2011',
      description: 'Fokus riset reformasi birokrasi, digitalisasi layanan publik daerah, dan pengawasan parlemen.',
    },
    {
      degree: 'Sarjana Ilmu Pemerintahan (S1)',
      institution: 'Universitas Padjadjaran (UNPAD)',
      year: '2001 - 2005',
      description: 'Aktif dalam organisasi kepemudaan mahasiswa dan perumusan advokasi kesejahteraan masyarakat lokal.',
    },
  ];

  const careers = [
    {
      role: 'Anggota Komisi XI DPR RI',
      period: '2024 - Sekarang',
      description: 'Membidangi Keuangan, Perencanaan Pembangunan Nasional, Moneter, dan Sektor Jasa Keuangan.',
    },
    {
      role: 'Wakil Ketua Badan Legislasi (Baleg)',
      period: '2019 - 2024',
      description: 'Memimpin harmonisasi lebih dari 40 RUU strategis dan penyusunan naskah akademik perlindungan UMKM.',
    },
    {
      role: 'Tenaga Ahli Madya Kebijakan Fiskal',
      period: '2014 - 2019',
      description: 'Memberikan analisis dampak ekonomi terhadap perumusan nota keuangan APBN dan alokasi transfer daerah.',
    },
  ];

  const visions = [
    {
      title: 'Transparansi Anggaran & Akuntabilitas Penuh',
      description: 'Memastikan alokasi APBN dan dana aspirasi di Dapil dapat diawasi secara terbuka oleh publik melalui portal digital.',
    },
    {
      title: 'Kemandirian Ekonomi Kerakyatan & UMKM',
      description: 'Memperjuangkan perluasan modal usaha berbunga rendah dan kepastian akses pasar bagi pelaku usaha mikro dan petani.',
    },
    {
      title: 'Pemerataan Infrastruktur & Pendidikan Digital',
      description: 'Mendorong modernisasi laboratorium komputasi sekolah pelosok dan konektivitas jaringan jalan poros desa.',
    },
  ];

  return (
    <div className="space-y-16">

      {/* ─── DUAL TONE HERO PROFILE CARD (MATCHING GAMBAR: HELLO I'M ANTHONY + CUTOUT) ─── */}
      <section className="rounded-3xl bg-[#181818] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-stone-800">
        
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hello I'M [Name] + Bio + 3 Metrics with Checkmark */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#FF6B00]">
                WAKIL RAKYAT & PARLEMEN
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                {cleanName}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-stone-400 leading-relaxed max-w-xl">
              {bio}
            </p>

            {/* 3 Metrics with checkmarks (Persis pada gambar) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3.5 group">
                <div className="w-6 h-6 rounded-full bg-white text-[#181818] flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#181818] fill-white" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">10+</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-400">Tahun Pengabdian Parlemen</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-6 h-6 rounded-full bg-white text-[#181818] flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#181818] fill-white" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">124+</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-400">RUU & Regulasi Dikawal</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-6 h-6 rounded-full bg-white text-[#181818] flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#181818] fill-white" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">1,500+</span>
                  <span className="text-xs sm:text-sm font-semibold text-stone-400">Aspirasi Konstituen Tuntas</span>
                </div>
              </div>
            </div>

            {/* Quick Link Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e65c00] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Hubungi Dewan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <span>Baca Gagasan Kebijakan</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Photo Cutout with Orange Doodle Rays & Wavy Accent (Persis pada gambar) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative max-w-sm w-full">
              
              {/* Playful Orange Doodle Rays (Above head) */}
              <div className="absolute -top-6 right-16 z-20 text-[#FF6B00] flex gap-1 select-none pointer-events-none">
                <span className="inline-block transform -rotate-12 text-xl font-black">/</span>
                <span className="inline-block transform rotate-0 text-xl font-black">|</span>
                <span className="inline-block transform rotate-12 text-xl font-black">\</span>
              </div>

              {/* Playful Orange Wavy Lines Accent (Bottom right) */}
              <div className="absolute bottom-12 -right-4 z-20 text-[#FF6B00] select-none pointer-events-none space-y-1">
                <div className="w-8 h-1 rounded-full bg-[#FF6B00] transform rotate-3" />
                <div className="w-10 h-1 rounded-full bg-[#FF6B00] transform -rotate-3" />
              </div>

              {/* Cutout Image */}
              <div className="relative z-10 overflow-hidden rounded-2xl bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-auto object-cover filter grayscale contrast-110 drop-shadow-2xl"
                />
              </div>

              {/* Official Credential Pill */}
              <div className="absolute -bottom-4 left-4 right-4 z-20 bg-white text-[#161616] p-3 rounded-xl shadow-xl border border-stone-200 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] block">
                  Mandat Konstitusi
                </span>
                <span className="font-extrabold text-xs text-[#161616] block truncate">
                  {officialFullName}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── TAB FILTER BUTTONS ─── */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
          {[
            { id: 'semua', label: 'Semua Rekam Jejak' },
            { id: 'visi', label: 'Visi & Misi' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Karier & Pengabdian' },
            { id: 'komisi', label: 'Tugas Komisi DPR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
                activeTab === tab.id
                  ? 'bg-[#161616] text-white shadow-md'
                  : 'bg-white text-stone-600 hover:text-black hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Visi & Misi */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Pilar Visi Perjuangan Legislatif</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visions.map((v, i) => (
                <div
                  key={i}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-sm hover:border-[#FF6B00] transition-all space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-black text-sm">
                    0{i + 1}
                  </div>
                  <h4 className="font-extrabold text-base text-[#161616]">
                    {v.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat Pendidikan */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Riwayat Pendidikan Akademik</span>
            </h3>

            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#FF6B00] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#161616] text-white flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#FF6B00]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-[#161616]">
                        {edu.degree}
                      </h4>
                      <p className="text-xs font-semibold text-stone-500">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-stone-600 pt-1">
                        {edu.description}
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-stone-100 text-[#161616] font-black text-xs self-start sm:self-auto shrink-0 border border-stone-200">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Karier & Pengabdian */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Karier & Rekam Pengabdian Publik</span>
            </h3>

            <div className="space-y-4">
              {careers.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#FF6B00] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 font-black text-base">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-[#161616]">
                        {c.role}
                      </h4>
                      <p className="text-xs text-stone-600 pt-1">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#161616] text-white font-black text-xs self-start sm:self-auto shrink-0">
                    {c.period}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Tugas Komisi */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-black text-[#161616] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span>Fokus & Mandat Komisi Parlemen</span>
            </h3>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#FF6B00]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">Fungsi Pengawasan</span>
                  </div>
                  <h4 className="font-extrabold text-base text-[#161616]">
                    Audit Kinerja dan Efektivitas Belanja Negara
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Mengawal audit berkala program bantuan sosial, subsidi sektor pertanian, dan belanja transfer ke daerah (TKD) untuk menekan kebocoran fiskal.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#FF6B00]">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">Fungsi Legislasi</span>
                  </div>
                  <h4 className="font-extrabold text-base text-[#161616]">
                    Penyusunan RUU Pemberdayaan Ekonomi & Perlindungan Data
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Merumuskan regulasi penguatan kapasitas hukum perbankan syariah, koperasi, dan perlindungan keamanan transaksi digital bagi jutaan pelaku UMKM nasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
