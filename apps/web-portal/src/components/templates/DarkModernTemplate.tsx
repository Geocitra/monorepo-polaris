'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ChevronDown,
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  Share2,
  CheckCircle2,
  FileText,
  TrendingUp,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function DarkModernTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#1877F2';
  const photoUrl = theme?.officialPhotoUrl || member?.photoUrl || '/images/default-avatar.png';
  const headline = theme?.headlineTagline || 'Mengawal aspirasi rakyat demi kemakmuran dan keadilan konstituen.';
  const bio = theme?.bioBiography || `${member?.fullName} merupakan wakil rakyat terpilih dari Daerah Pemilihan ${member?.dapilName || 'Indonesia'} yang berkomitmen menjaga transparansi kebijakan legislatif.`;

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

  const fallbackInfographics = [
    {
      id: 'demo-info-1',
      title: 'Transparansi APBD: Alokasi Belanja TIK Sekolah Desa 2026',
      slug: 'transparansi-apbd-alokasi-belanja-tik-sekolah-desa',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      posterUrl: '/images/showcase-infografis-apbd.jpg',
      category: 'ANGGARAN & APBD',
    },
    {
      id: 'demo-info-2',
      title: 'Penguatan Ketahanan Pangan & Distribusi Pupuk Subsidi Petani',
      slug: 'penguatan-ketahanan-pangan-distribusi-pupuk-subsidi',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      posterUrl: '/images/showcase-artikel-pertanian.jpg',
      category: 'PERTANIAN & PANGAN',
    },
    {
      id: 'demo-info-3',
      title: 'Laboratorium Digital & Pemerataan Internet Sekolah 3T',
      slug: 'laboratorium-digital-pemerataan-internet-sekolah',
      imageUrl: '/images/showcase-poster-surya.jpg',
      posterUrl: '/images/showcase-poster-surya.jpg',
      category: 'PENDIDIKAN 3T',
    },
  ];
  const infographics = (recentInfographics.length > 0 ? recentInfographics : fallbackInfographics).slice(0, 3);

  // Clean hero excerpt for About Me (3-4 lines max, matching reference image blurb)
  const heroBioExcerpt = React.useMemo(() => {
    if (!theme?.bioBiography) {
      return `${member?.fullName || 'Wakil Rakyat'} merupakan anggota legislatif terpilih dari Daerah Pemilihan ${member?.dapilName || 'Indonesia'} yang berkomitmen menjaga transparansi kebijakan dan memperjuangkan aspirasi rakyat.`;
    }
    const text = theme.bioBiography.trim();
    if (text.length <= 180) return text;
    // Try to find a period between 100 and 180 chars for a complete natural sentence
    const periodIdx = text.indexOf('. ', 100);
    if (periodIdx !== -1 && periodIdx <= 180) {
      return text.slice(0, periodIdx + 1);
    }
    const sub = text.slice(0, 175);
    const lastSpace = sub.lastIndexOf(' ');
    const clean = lastSpace > 110 ? sub.slice(0, lastSpace) : sub;
    return clean.endsWith('.') ? clean : `${clean.replace(/[,;:\s]+$/, '')}...`;
  }, [theme?.bioBiography, member?.fullName, member?.dapilName]);

  const heroWorkExcerpt = `Menjalankan fungsi pengawasan legislasi dan advokasi anggaran di Komisi ${member?.commissionName || 'Parlemen'} untuk Dapil ${member?.dapilName || 'Indonesia'}.`;

  function formatLegislativeLevel(level?: string): string {
    if (!level) return 'DPR RI';
    const clean = level.replace(/_/g, ' ').toUpperCase();
    if (clean === 'DPR RI' || clean === 'DPD RI') return clean;
    if (clean.includes('PROVINSI')) return 'DPRD Provinsi';
    if (clean.includes('KAB') || clean.includes('KOTA')) return 'DPRD Kab/Kota';
    return clean;
  }

  const officialFullName = member?.fullName || 'Wakil Rakyat';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';
  const articles = recentArticles.slice(0, 6);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#111215] text-slate-100 font-jakarta selection:bg-blue-600 selection:text-white">
      {/* ─── 1. TOP NAVBAR (FULLY RESPONSIVE WITH COMPACT MOBILE TOGGLE) ─── */}
      <header className="border-b border-white/5 bg-[#111215]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          
          {/* Left: Brand Avatar / Monogram */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform">
              {member?.fullName ? member.fullName.charAt(0) : 'P'}
            </div>
            <span className="font-bold text-xs sm:text-sm text-white hidden sm:inline-block truncate max-w-[150px] lg:max-w-none group-hover:text-blue-400 transition-colors">
              {officialFullName}
            </span>
          </Link>

          {/* Centered Navigation (Tablet & Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="text-white font-semibold border-b-[2.5px] border-white pb-1 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className="text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500 pb-1 transition-all"
            >
              Profil
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500 pb-1 transition-all"
            >
              Artikel
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500 pb-1 transition-all"
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className="text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500 pb-1 transition-all"
            >
              Kontak
            </Link>
          </nav>

          {/* Right: Instagram Pill Button + Mobile Hamburger */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs md:text-sm shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#111215]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── 2. SECTION 1: HERO (BALANCED DESKTOP & RESPONSIVE MOBILE) ─── */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[#111215] pt-8 sm:pt-12 lg:pt-14 pb-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-end min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] xl:min-h-[640px]">
            
            {/* LEFT COLUMN: TITLE & HEADLINE */}
            <div className="lg:col-span-4 text-left order-1 self-center py-4 sm:py-6 lg:py-8 relative z-10">
              <div className="w-14 sm:w-16 h-[3px] bg-white rounded-full mb-4 sm:mb-6" />
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.75rem] font-extrabold text-white tracking-tight leading-[1.18]">
                <span className="block">Saya {officialFullName},</span>
                <span className="block text-slate-100">Anggota {formatLegislativeLevel(member?.legislativeLevel)}</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-md mt-4 sm:mt-6">
                {headline}
              </p>
            </div>

            {/* CENTER COLUMN: CUTOUT PROFILE PHOTO */}
            <div className="lg:col-span-5 flex justify-center items-end order-2 self-end relative">
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[460px] xl:max-w-[500px] flex items-end justify-center">
                
                {/* Subtle soft blue radial splash centered directly behind upper torso / head */}
                <div
                  aria-hidden="true"
                  className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[320px] lg:w-[390px] h-[260px] sm:h-[320px] lg:h-[390px] rounded-full pointer-events-none select-none z-0"
                  style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.32) 0%, rgba(37, 99, 235, 0.14) 45%, rgba(17, 18, 21, 0) 75%)',
                    filter: 'blur(36px)',
                  }}
                />

                {/* Profile Photo - Grounded firmly on baseline border */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={member?.fullName || 'Foto Dewan'}
                  className="w-full h-auto max-h-[440px] sm:max-h-[500px] md:max-h-[560px] lg:max-h-[620px] xl:max-h-[660px] object-contain object-bottom filter contrast-[1.03] select-none block origin-bottom pointer-events-none relative z-10"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/default-avatar.png')) {
                      target.src = '/images/default-avatar.png';
                    }
                  }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: ABOUT ME & MY WORK (RESPONSIVE 2-COL ON TABLET) */}
            <div className="lg:col-span-3 text-left order-3 self-center py-6 sm:py-8 lg:py-8 relative z-10 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8 lg:gap-8">
                {/* Block 1: About Me */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-white uppercase">
                    TENTANG SAYA
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-400 leading-[1.7] max-w-[300px]">
                    {heroBioExcerpt}
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/profil"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors uppercase tracking-wider border-b border-white/60 hover:border-white pb-0.5 group w-fit"
                    >
                      <span>PELAJARI PROFIL</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Block 2: My Work */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-white uppercase">
                    FOKUS KERJA
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-400 leading-[1.7] max-w-[300px]">
                    {heroWorkExcerpt}
                  </p>
                  <div className="pt-1">
                    <a
                      href="#articles"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors uppercase tracking-wider border-b border-white/60 hover:border-white pb-0.5 group w-fit"
                    >
                      <span>LIHAT REKAM JEJAK</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2.5 SECTION: TENTANG & CAPAIAN PARLEMEN (SEPARATE CLEAN SECTION) ─── */}
      <section id="about" className="py-20 sm:py-24 border-b border-white/5 bg-[#0e0f11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                / TENTANG SAYA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                Berdedikasi mengawal hak & kemakmuran rakyat sejak 2014
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                {bio}
              </p>
              <div className="pt-2">
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 border-b border-white hover:border-blue-400 pb-0.5 transition-all"
                >
                  <span>Selengkapnya tentang profil saya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  10+ <span className="text-xs font-semibold uppercase text-slate-400 block font-sans">Tahun Pengabdian Parlemen</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  Pengalaman nyata merumuskan undang-undang dan pengawasan implementasi anggaran negara.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  150+ <span className="text-xs font-semibold uppercase text-slate-400 block font-sans">Program Teradvokasi</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  Bantuan sarana publik, beasiswa pendidikan, dan pendampingan hukum konstituen daerah pemilihan.
                </p>
              </div>
            </div>
          </div>

          {/* ─── ENTITY / PARTNERS STRIP ─── */}
          <div className="pt-8 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="text-slate-400">LEMBAGA & MITRA KERJA</span>
            <span>🏛️ DPR RI</span>
            <span>📋 KOMISI {member?.commissionName || 'PARLEMEN'}</span>
            <span>🇮🇩 DAPIL {member?.dapilName || 'NASIONAL'}</span>
            <span>⚖️ BADAN LEGISLASI</span>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION 2: ARTIKEL & KAJIAN KEBIJAKAN ─── */}
      <section id="articles" className="py-16 sm:py-20 border-b border-white/5 bg-[#111215]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
                / WARTA &amp; KAJIAN RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Publikasi &amp; Sikap Kebijakan Terkini
              </h2>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <p className="text-xs text-slate-400 max-w-sm">
                Kajian mendalam dan catatan advokasi langsung dari ruang sidang dan kunjungan kerja lapangan.
              </p>
              <Link
                href={getNavLinkHref('/artikel')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 group"
              >
                <span>Lihat Semua Artikel</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length > 0 ? (
              articles.map((art) => (
                <article
                  key={art.id}
                  className="group rounded-2xl bg-[#16171b] border border-white/5 hover:border-blue-500/30 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="space-y-4">
                    {/* Thumbnail if present */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.featuredImageUrl || art.posterUrl || '/images/default-article.jpg'}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                        {art.issueCategory || 'KEBIJAKAN'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateIndonesian(art.publishedAt || art.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {art.leadParagraph || art.excerpt || 'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 4 mnt baca
                    </span>
                    <Link
                      href={getNavLinkHref(`/artikel/${art.slug}`)}
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all"
                    >
                      <span>Baca Naskah</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                Belum ada artikel publikasi resmi yang diterbitkan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION 3: INFOGRAFIS & METRIK AKUNTABILITAS ─── */}
      <section id="infografis" className="py-16 sm:py-20 border-b border-white/5 bg-[#111215]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              / CAPAIAN & REKAM JEJAK
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Indikator Kinerja & Tanggung Jawab Konstituen
            </h2>
            <p className="text-xs text-slate-400">
              Data akuntabilitas publik periode 2024–2029 yang dapat diawasi secara terbuka oleh seluruh warga dapil.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">98.4%</div>
              <div className="text-xs font-bold text-slate-300 uppercase">Tingkat Kehadiran Sidang</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Konsisten menghadiri rapat kerja komisi, pansus, dan sidang paripurna pengambilan keputusan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">42 Naskah</div>
              <div className="text-xs font-bold text-slate-300 uppercase">RUU & Catatan Kritis</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Menyusun daftar inventarisasi masalah (DIM) pro-rakyat pada regulasi strategis nasional.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">1,420+</div>
              <div className="text-xs font-bold text-slate-300 uppercase">Aspirasi Dapil Diserap</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pengaduan infrastruktur, pendidikan, dan layanan publik yang diteruskan ke kementerian terkait.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">100%</div>
              <div className="text-xs font-bold text-slate-300 uppercase">Transparansi Dana Reses</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Laporan pertanggungjawaban kegiatan kunjungan daerah pemilihan terverifikasi independen.
              </p>
            </div>
          </div>

          {/* GALERI KARTU INFOGRAFIS VISUAL */}
          {infographics.length > 0 && (
            <div className="pt-8 space-y-6 border-t border-slate-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Galeri Visual &amp; Infografis Publik
                  </h3>
                  <p className="text-xs text-slate-400">
                    Visualisasi data capaian dan transparansi kebijakan yang dipublikasikan secara resmi.
                  </p>
                </div>
                <Link
                  href={getNavLinkHref('/infografis')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 group"
                >
                  <span>Lihat Semua Infografis</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {infographics.map((info) => (
                  <Link
                    key={info.id}
                    href={getNavLinkHref('/infografis')}
                    className="group rounded-2xl bg-[#16171b] border border-white/5 hover:border-blue-500/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 block"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={info.imageUrl || info.posterUrl || info.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                        alt={info.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        {info.category || 'INFOGRAFIS RESMI'}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {info.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {info.excerpt || info.prompt || 'Visualisasi data capaian kebijakan publik.'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 5. SECTION 4: FOOTER & ASPIRASI (CONTACT CTA) ─── */}
      <footer id="contact" className="bg-[#070A12] py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/60 via-[#0B0F19] to-slate-900 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                KANAL SUARA WARGA
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Sampaikan Aspirasi Anda Secara Langsung
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Setiap masukan, keluhan fasilitas umum, dan usulan kebijakan daerah Anda akan dicatat dan ditindaklanjuti oleh staf ahli parlemen.
              </p>
            </div>
            <Link
              href={getNavLinkHref('/kontak')}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all shrink-0 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Hubungi Sekretariat Dewan →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400 pt-6">
            <div className="space-y-3">
              <span className="text-white font-extrabold text-sm">{member?.fullName}</span>
              <p className="leading-relaxed">
                Portal komunikasi resmi transparansi kinerja legislatif konstituen Dapil {member?.dapilName || 'Jawa Barat I'}.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">Sekretariat Parlemen</span>
              <p>Gedung Nusantara I DPR RI, Senayan, Jakarta Pusat 10270</p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">Kontak Resmi</span>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-400" /> aspirasi@{subdomain || 'dewan'}.polaris.id</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-400" /> 0812-9876-5432 (Hotline Tim Sahabat)</p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">Integritas Sistem</span>
              <p>Terhubung langsung dengan POLARIS Legislative Intelligence OS.</p>
              <p className="text-slate-600">&copy; {new Date().getFullYear()} {member?.fullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
