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
  Clock,
  Sparkles,
  Download,
  GraduationCap,
  Briefcase,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface CreativeWarmProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreativeWarmProfileClient({
  member,
  theme,
  subdomain,
}: CreativeWarmProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const bio =
    theme?.bioBiography ||
    `${officialFullName} telah mendedikasikan bertahun-tahun masa pengabdian untuk mendampingi masyarakat di Daerah Pemilihan ${member?.dapilName || 'Jawa Barat I'}. Dengan memadukan integritas, ketulusan mendengar, dan keberanian memperjuangkan regulasi yang berpihak pada rakyat kecil, beliau senantiasa hadir mengawal setiap aspirasi konstituen.`;

  const [activeTab, setActiveTab] = useState<'semua' | 'legislasi' | 'pengawasan' | 'advokasi' | 'pendidikan'>('semua');

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
      return { cleanName: 'Ahmad Fauzi', initial: 'A' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
    };
  }

  const { cleanName, initial } = parseCleanIdentity(member?.fullName);

  const metrics = [
    { label: 'Sesi Dialog Warga', value: '600+', desc: 'Temu tatap muka konstituen di desa & kecamatan' },
    { label: 'Kunjungan Lapangan', value: '50+', desc: 'Sidak berkala realisasi proyek APBN/APBD' },
    { label: 'Tahun Pengabdian', value: '10+', desc: 'Dedikasi konsisten dalam pelayanan publik' },
    { label: 'Aspirasi Tervalidasi', value: '100%', desc: 'Kanal pengaduan warga diproses secara digital' },
  ];

  const milestones = [
    {
      category: 'legislasi',
      badge: 'LEGISLASI PARLEMEN',
      year: '2026',
      title: 'Inisiasi Reformasi Alokasi Belanja Publik Berbasis Hasil',
      summary: 'Mendorong transparansi pembelanjaan APBD/APBN agar memprioritaskan bantuan sarana pendidikan dasar dan perbaikan jalan logistik desa.',
      impact: 'Diterapkan pada 16 kecamatan daerah pemilihan',
    },
    {
      category: 'advokasi',
      badge: 'ADVOKASI KONSTITUEN',
      year: '2025 - 2026',
      title: 'Pendampingan Sertifikasi Halal Gratis & KUR Mikro Tanpa Agunan',
      summary: 'Mengawal lebih dari 1.400 pelaku UMKM kuliner dan kerajinan rakyat mendapatkan kemudahan izin edar dan pembiayaan perbankan BUMN.',
      impact: '1.400+ pelaku usaha mikro terbantu',
    },
    {
      category: 'pengawasan',
      badge: 'PENGAWASAN ANGGARAN',
      year: '2025',
      title: 'Audit & Pengawasan Penyaluran Pupuk Bersubsidi Petani',
      summary: 'Melakukan peninjauan mendadak ke gudang distributor pupuk untuk memberantas pungutan liar dan menjamin pupuk subsidi tiba tepat musim tanam.',
      impact: '98% serapan pupuk tepat waktu di sentra tani',
    },
    {
      category: 'pendidikan',
      badge: 'PENDIDIKAN & GENERASI MUDA',
      year: '2024 - 2025',
      title: 'Program Internet Cepat & Laboratorium Komputer Sekolah Terpencil',
      summary: 'Memperjuangkan alokasi dana aspirasi parlemen untuk 32 madrasah dan SMP pelosok agar terhubung ke jaringan internet kecepatan tinggi.',
      impact: '32 sekolah terakreditasi digital',
    },
  ];

  const filteredMilestones =
    activeTab === 'semua'
      ? milestones
      : milestones.filter((m) => m.category === activeTab);

  return (
    <div className="space-y-16 py-10 sm:py-16">
      
      {/* ─── 1. HERO BIO CARD (WARM FOREST GREEN & SUN DISC) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-xl shadow-stone-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-6 sm:p-10 lg:p-12">
            
            {/* Left: Cutout Portrait grounded on Amber Sun Disc */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-[280px] sm:w-[340px] h-[360px] sm:h-[420px] flex items-end justify-center">
                
                {/* Ambient warm glow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full pointer-events-none opacity-70"
                  style={{
                    background: 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.12) 55%, transparent 75%)',
                    filter: 'blur(30px)',
                  }}
                />

                {/* Sun Disc */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[240px] sm:w-[290px] aspect-square rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 shadow-2xl shadow-amber-500/25 pointer-events-none" />

                {/* Cutout Photo Grounded */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={cleanName}
                  className="w-full h-full object-contain object-bottom filter contrast-[1.02] drop-shadow-2xl relative z-10 select-none block"
                />
              </div>
            </div>

            {/* Right: Bio & Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-stone-800 text-stone-800 text-xs font-mono font-bold tracking-wider bg-stone-50">
                <span>[ Profil Resmi Anggota Dewan ]</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-stone-900 tracking-tight leading-tight">
                  {officialFullName}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-amber-700 font-mono">
                  Daerah Pemilihan {member?.dapilName || 'Jawa Barat I'} • {member?.partyAffiliation || 'Fraksi Parlemen'}
                </p>
              </div>

              <div className="h-[2px] w-16 bg-amber-500" />

              <p className="text-stone-700 leading-relaxed text-sm sm:text-base font-normal">
                {bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Sampaikan Aspirasi Langsung</span>
                </Link>

                <a
                  href="#rekam-jejak"
                  className="px-6 py-3 rounded-full border border-stone-800 text-stone-900 hover:bg-stone-900 hover:text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2"
                >
                  <span>Lihat Rekam Jejak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. 4 GOLDEN METRIC COUNTERS (FOREST GREEN ACCENT BANNER) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#1A382B] text-white p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-mono uppercase text-amber-400 tracking-widest font-bold block">
              — DEDIKASI NYATA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Capaian &amp; Akuntabilitas Pengabdian
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              Setiap angka mencerminkan kehadiran langsung di tengah-tengah denyut kehidupan warga.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all duration-300 text-center space-y-2"
              >
                <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
                  {m.value}
                </div>
                <div className="text-sm font-bold text-white font-serif">
                  {m.label}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. MANDAT & PRIORITAS ADVOKASI (4 CARDS) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — FOKUS PENGAWALAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              4 Pilar Perjuangan Konstituen
            </h2>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Amanah Legislasi 2024 - 2029
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Pendidikan &amp; Literasi 3T
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Memastikan pemerataan beasiswa PIP, rehabilitasi sarana sekolah desa, dan penyediaan laboratorium komputer gratis bagi siswa kurang mampu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Pemberdayaan UMKM Lokal
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Membuka fasilitasi sertifikasi halal tanpa pungli, pendampingan pemasaran digital, dan akses permodalan KUR bunga rendah perbankan BUMN.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Ketahanan Tani &amp; Pupuk
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Mengawal transparansi distribusi pupuk bersubsidi, stabilisasi harga gabah saat panen raya, serta bantuan traktor tangan bagi gabungan kelompok tani.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Transparansi Anggaran
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Membuka pelaporan hasil reses, risalah rapat dengar pendapat, dan advokasi hukum gratis bagi warga yang mengalami sengketa pertanahan.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. REKAM JEJAK & PROGRAM (TABBED INTERACTIVE TIMELINE) ─── */}
      <section id="rekam-jejak" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
              — ARSIP KINERJA
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-1">
              Linimasa Rekam Jejak Kenegaraan
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-200/60 border border-stone-200">
            {(
              [
                { id: 'semua', label: 'Semua Bidang' },
                { id: 'legislasi', label: 'Legislasi' },
                { id: 'pengawasan', label: 'Pengawasan' },
                { id: 'advokasi', label: 'Advokasi' },
                { id: 'pendidikan', label: 'Pendidikan' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMilestones.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500/80 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono font-semibold text-stone-400">
                    {item.year}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800">
                  Dampak: {item.impact}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. INSTITUTIONAL PARTNERS STRIP ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-stone-100/70 border border-stone-200/80 text-center space-y-4">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest font-bold">
            JARINGAN SINERGI &amp; MITRA KERJA PARLEMEN
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-serif font-bold text-stone-700">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              DPR RI Senayan
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Badan Anggaran Parlemen
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Rumah Aspirasi Dapil
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Paguyuban Warga &amp; Koperasi
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
