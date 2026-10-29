'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Instagram,
  Menu,
  X,
  Maximize2,
  CheckCircle2,
  Send,
  Star,
  Sparkles,
  FileText,
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

export function MidnightLimeTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  // Electric neon lime accent color matching the reference image (#D4F63D or #E2F952)
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const dapil =
    (member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I').replace(/_/g, ' ');
  const party = (member?.partyAffiliation || 'Fraksi Parlemen').replace(/_/g, ' ');
  const legislativeLevel = (member?.legislativeLevel || 'DPRD PROVINSI').replace(/_/g, ' ');
  const commissionName = (member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)').replace(/_/g, ' ');
  const officialEmail = `aspirasi@${subdomain || 'jonandabrahman'}.polaris.id`;
  const officialPhone = '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'jonandabrahman';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [aspirationModalOpen, setAspirationModalOpen] = useState(false);
  const [aspirationSubmitted, setAspirationSubmitted] = useState(false);
  const [aspirationForm, setAspirationForm] = useState({
    name: '',
    phone: '',
    category: 'Infrastruktur & Jalan',
    message: '',
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    const params = new URLSearchParams();
    if (previewTemplate) params.set('preview_template', previewTemplate);
    if (previewColor) params.set('preview_color', previewColor);
    const qs = params.toString();
    if (qs) {
      base += `${base.includes('?') ? '&' : '?'}${qs}`;
    }
    return base;
  };

  // Headline role badge
  const roleBadge = `${legislativeLevel} • ${party}`;

  const bioStatement =
    theme?.bioBiography ||
    `Saya adalah wakil rakyat yang mendedikasikan pengabdian penuh untuk memperjuangkan keadilan sosial, transparansi alokasi APBD, dan perlindungan konstituen di Daerah Pemilihan ${dapil}. Memperjuangkan aspirasi warga bukan sekadar rutinitas birokrasi, melainkan panggilan nurani dan amanah konstitusi kenegaraan.`;

  const handleAspirationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAspirationSubmitted(true);
    setTimeout(() => {
      setAspirationSubmitted(false);
      setAspirationModalOpen(false);
      setAspirationForm({
        name: '',
        phone: '',
        category: 'Infrastruktur & Jalan',
        message: '',
      });
    }, 2200);
  };

  // Helper to extract real article image from database
  const getArticleImage = (art: any): string => {
    return (
      art?.featuredImageUrl ||
      art?.imageUrl ||
      art?.posterUrl ||
      art?.coverImageUrl ||
      art?.thumbnail ||
      '/images/default-article.jpg'
    );
  };

  // Helper to extract real infographic image from database
  const getInfographicImage = (info: any): string => {
    return (
      info?.posterUrl ||
      info?.imageUrl ||
      info?.featuredImageUrl ||
      info?.thumbnail ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  return (
    <div className="min-h-screen bg-[#0C111F] text-slate-100 font-sans selection:bg-[#D4F63D] selection:text-black antialiased overflow-x-hidden">
      
      {/* ─── TOP NAVBAR (POLARIS STANDARD MATCHING OTHER TEMPLATES) ─── */}
      <header className="border-b border-white/10 bg-[#0C111F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram / Avatar + Official Name */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl text-black font-black flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {officialFullName ? officialFullName.charAt(0) : 'P'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[170px] sm:max-w-none group-hover:text-[#D4F63D] transition-colors">
                {officialFullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                {party} • {dapil}
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="text-[#D4F63D] font-semibold border-b-[2.5px] pb-1 transition-colors"
              style={{ borderColor: primaryColor }}
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

          {/* Right Action: Pill Button with Circular Arrow matching [ CONTACT (↗) ] */}
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => setAspirationModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full text-white font-bold text-xs uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/20 shadow-md transition-all select-none cursor-pointer group"
            >
              <span>Sampaikan Aspirasi</span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-950 shadow-sm group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>

            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-bold text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all select-none"
            >
              <Instagram className="w-3.5 h-3.5 text-[#D4F63D] shrink-0" />
              <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0E1526] px-4 py-4 space-y-2 text-sm font-medium animate-in slide-in-from-top-2 duration-150 text-left">
            <Link
              href={getNavLinkHref('/')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-[#D4F63D] font-semibold bg-white/5"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Profil Dewan
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Artikel &amp; Berita
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Infografis Kinerja
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Kontak Aspirasi
            </Link>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAspirationModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-black font-black text-xs shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Aspirasi Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── SECTION 1: HERO PERSIS LAYOUT & PEWARNAAN GAMBAR REFERENSI (FULL VIEWPORT) ─── */}
      <section className="relative overflow-hidden h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] min-h-[580px] max-h-[1050px] flex flex-col justify-between pt-4 sm:pt-6 pb-0 bg-gradient-to-b from-[#070A12] via-[#091124] to-[#0D1D3D]">
        
        {/* Ambient Oceanic Deep Blue Glow on Bottom Corners matching reference */}
        <div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[120%] h-[450px] pointer-events-none select-none z-0 opacity-60 blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(30, 64, 175, 0.5) 0%, rgba(14, 31, 61, 0.3) 50%, transparent 80%)',
          }}
        />

        {/* Soft Sage-Lime & Cyan Spotlight directly behind Person's head & shoulders */}
        <div
          className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] lg:w-[640px] h-[340px] sm:h-[520px] lg:h-[640px] rounded-full pointer-events-none blur-[90px] sm:blur-[110px] opacity-45 select-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(190, 242, 100, 0.32) 0%, rgba(56, 189, 248, 0.28) 35%, rgba(15, 23, 42, 0) 70%)',
          }}
        />

        {/* 1. TOP HEADLINE (Saya [Nama] + [ Role ]) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center shrink-0">
          <div className="space-y-2 sm:space-y-3">
            {/* Line 1: Saya [Nama] */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white font-sans leading-tight">
              <span>Saya </span>
              <span className="italic" style={{ color: primaryColor }}>
                {officialFullName}
              </span>
            </h1>

            {/* Line 2: [ Role ] inside large outlined pill/box persis [ Full Stack Developer ] */}
            <div>
              <div className="inline-flex items-center justify-center px-6 sm:px-10 py-2 sm:py-3 rounded-2xl sm:rounded-3xl border border-white/20 bg-white/[0.03] backdrop-blur-sm shadow-inner">
                <span className="text-xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold tracking-tight text-white font-sans leading-tight">
                  {roleBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM DISPLAY: Central Person Cutout + 2 Floating Glass Cards + Waist Button */}
        <div className="relative w-full max-w-5xl mx-auto px-4 flex-1 flex items-end justify-center z-10 min-h-0 overflow-visible">
          
          {/* FLOATING CARD 1 (LEFT) - Tilted -rotate-[5deg] matching exact angle in reference */}
          <div className="absolute left-1 sm:left-4 lg:left-8 top-[36%] -translate-y-1/2 z-20 w-52 sm:w-64 p-4 sm:p-5 rounded-2xl bg-[#0F1728]/95 backdrop-blur-xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] text-left hidden xs:block transform -rotate-[5deg] hover:rotate-0 transition-all duration-300">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5">
              <span>Aspirasi Terlayani</span>
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6366F1]/25 border border-[#6366F1]/40 text-[#A5B4FC] text-[10px] font-bold">
                5.0 <Star className="w-2.5 h-2.5 fill-[#A5B4FC] text-[#A5B4FC]" />
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Transparansi pengawalan regulasi &amp; responsif terhadap keluhan warga di Dapil.
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] font-mono" style={{ color: primaryColor }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>Terverifikasi Publik</span>
            </div>
          </div>

          {/* CUTOUT PORTRAIT DI TENGAH */}
          <div className="relative w-full max-w-[300px] sm:max-w-[420px] md:max-w-[480px] h-full flex flex-col items-center justify-end z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-auto h-full max-h-[380px] sm:max-h-[500px] md:max-h-[580px] object-contain object-bottom filter contrast-105 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none"
              style={{
                maskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
              }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/default-avatar.png')) {
                  target.src = '/images/default-avatar.png';
                }
              }}
            />

            {/* Pill Button On Waist/Torso: "MY PROJECTS" persis pada gambar */}
            <button
              onClick={() => setAspirationModalOpen(true)}
              className="absolute bottom-5 sm:bottom-7 px-7 sm:px-9 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wider shadow-[0_6px_25px_rgba(212,246,61,0.45)] hover:scale-105 active:scale-95 transition-all select-none z-30 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              PROGRAM ADVOKASI
            </button>
          </div>

          {/* FLOATING CARD 2 (RIGHT) - Tilted +rotate-[5deg] matching exact angle in reference */}
          <div className="absolute right-1 sm:right-4 lg:right-8 top-[42%] -translate-y-1/2 z-20 w-52 sm:w-64 p-4 sm:p-5 rounded-2xl bg-[#0F1728]/95 backdrop-blur-xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] text-left hidden xs:block transform rotate-[5deg] hover:rotate-0 transition-all duration-300">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 block mb-3 font-sans">
              KEAHLIAN PARLEMEN
            </span>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="text-[10px] font-bold tracking-wider">LEGISLASI</span>
                  <span className="text-white font-bold text-[10px]">95%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/10 rounded-full flex items-center">
                  <div className="h-full rounded-full" style={{ width: '95%', backgroundColor: primaryColor }} />
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-white border border-[#D4F63D] -translate-x-1/2 shadow-[0_0_10px_#D4F63D]"
                    style={{ left: '95%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="text-[10px] font-bold tracking-wider">PENGAWASAN</span>
                  <span className="text-white font-bold text-[10px]">92%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/10 rounded-full flex items-center">
                  <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: primaryColor }} />
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-white border border-[#D4F63D] -translate-x-1/2 shadow-[0_0_10px_#D4F63D]"
                    style={{ left: '92%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="text-[10px] font-bold tracking-wider">ANGGARAN</span>
                  <span className="text-white font-bold text-[10px]">90%</span>
                </div>
                <div className="relative h-1.5 w-full bg-white/10 rounded-full flex items-center">
                  <div className="h-full rounded-full" style={{ width: '90%', backgroundColor: primaryColor }} />
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-white border border-[#D4F63D] -translate-x-1/2 shadow-[0_0_10px_#D4F63D]"
                    style={{ left: '90%' }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: ARTIKEL & RISALAH PARLEMEN (AMBIL DARI DATABASE) ─── */}
      <section id="artikel" className="py-20 sm:py-28 bg-[#090D18] border-t border-white/10 text-left relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none blur-[140px] opacity-20 select-none"
          style={{ background: 'radial-gradient(circle, #D4F63D 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4F63D]/10 border border-[#D4F63D]/30 text-[#D4F63D] text-[11px] font-mono font-bold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Naskah &amp; Telaah Kebijakan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans">
                Artikel &amp; Risalah Parlemen
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Kumpulan artikel kebijakan, telaah kritis regulasi, dan laporan pengawalan aspirasi konstituen secara transparan.
              </p>
            </div>

            <Link
              href={getNavLinkHref('/artikel')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black shadow-lg hover:brightness-110 active:scale-95 transition-all select-none self-start md:self-auto cursor-pointer shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Articles Grid */}
          {recentArticles && recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recentArticles.slice(0, 6).map((art: any) => {
                const articleImg = getArticleImage(art);
                const category = art.issueCategory?.replace(/_/g, ' ') || 'KEBIJAKAN';
                const dateLabel = formatDateIndonesian(art.publishedAt || art.createdAt);
                const readingTime = art.readingTimeMinutes ? `${art.readingTimeMinutes} mnt baca` : '4 mnt baca';

                return (
                  <article
                    key={art.id}
                    className="rounded-3xl bg-[#0F172A]/90 border border-white/10 hover:border-[#D4F63D]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                  >
                    <div className="flex flex-col">
                      {/* Cover Image from Database */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 border-b border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={articleImg}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('/images/default-article.jpg')) {
                              target.src = '/images/default-article.jpg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />

                        {/* Category Badge on Image */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md backdrop-blur-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {category}
                          </span>
                        </div>

                        {/* Date Badge */}
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-1 border border-white/10">
                          <Calendar className="w-3 h-3 text-[#D4F63D]" />
                          <span>{dateLabel}</span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#D4F63D] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {art.leadParagraph || art.excerpt || art.summary || 'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-white/5 text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#D4F63D]" />
                        <span>{readingTime}</span>
                      </span>

                      <Link
                        href={getNavLinkHref(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-1.5 font-bold text-white group-hover:text-[#D4F63D] transition-colors"
                      >
                        <span>Baca Naskah</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="col-span-3 text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-slate-400 text-xs sm:text-sm space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-white">Belum ada artikel publikasi resmi yang diterbitkan.</p>
              <p className="text-slate-500">Artikel naskah kebijakan akan segera ditampilkan di sini.</p>
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION 3: INFOGRAFIS PUBLIK (AMBIL DARI DATABASE) ─── */}
      <section id="infografis" className="py-20 sm:py-28 bg-[#0C111F] border-t border-white/10 text-left relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none blur-[140px] opacity-20 select-none"
          style={{ background: 'radial-gradient(circle, #38BDF8 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4F63D]/10 border border-[#D4F63D]/30 text-[#D4F63D] text-[11px] font-mono font-bold uppercase tracking-wider">
                <span>Data Visual &amp; Transparansi</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-sans">
                Infografis Publik
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Visualisasi data anggaran, alur legislasi, dan laporan kinerja dewan yang dirancang ringkas dan mudah dipahami warga.
              </p>
            </div>

            <Link
              href={getNavLinkHref('/infografis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black shadow-lg hover:brightness-110 active:scale-95 transition-all select-none self-start md:self-auto cursor-pointer shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Infographics Grid */}
          {recentInfographics && recentInfographics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentInfographics.slice(0, 4).map((info: any, idx: number) => {
                const infoImg = getInfographicImage(info);
                const category = info.issueCategory?.replace(/_/g, ' ') || 'INFOGRAFIS';
                const dateLabel = info.publishedAt ? formatDateIndonesian(info.publishedAt) : 'Terbaru';

                return (
                  <div
                    key={info.id || idx}
                    onClick={() => setActiveModalInfo(info)}
                    className="rounded-3xl bg-[#0F172A]/90 border border-white/10 hover:border-[#D4F63D]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl hover:-translate-y-1.5 cursor-pointer hover:shadow-[0_20px_40px_rgba(212,246,61,0.08)]"
                  >
                    <div>
                      {/* Infographic Poster Container (aspect-[3/4] for poster format) */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={infoImg}
                          alt={info.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('/images/showcase-infografis-apbd.jpg')) {
                              target.src = '/images/showcase-infografis-apbd.jpg';
                            }
                          }}
                        />

                        {/* Hover Overlay with Zoom Icon */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4 text-center">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-950 shadow-lg transform group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                          </div>
                          <span className="text-xs font-bold text-white tracking-wide">
                            Klik untuk Memperbesar
                          </span>
                        </div>

                        {/* Category Pill Tag */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-[#D4F63D] border border-[#D4F63D]/40 backdrop-blur-md">
                            {category}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <Calendar className="w-3 h-3 text-[#D4F63D]" />
                          <span>{dateLabel}</span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#D4F63D] transition-colors line-clamp-2 leading-snug">
                          {info.title}
                        </h3>

                        {(info.leadParagraph || info.excerpt || info.summary) && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {info.leadParagraph || info.excerpt || info.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Action Link */}
                    <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-white/5 text-xs font-bold text-[#D4F63D] group-hover:translate-x-0.5 transition-transform text-left">
                      <span>Buka Infografis</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="col-span-4 text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-slate-400 text-xs sm:text-sm space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-white">Belum ada infografis publikasi yang diterbitkan.</p>
              <p className="text-slate-500">Materi visualisasi data kinerja akan segera ditampilkan di sini.</p>
            </div>
          )}

        </div>
      </section>


      {/* ─── SLEEK MIDNIGHT NAVY FOOTER ─── */}
      <footer className="bg-[#080C17] text-slate-400 py-14 sm:py-16 border-t border-white/10 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
            
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl text-black font-black flex items-center justify-center text-xs shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {officialFullName ? officialFullName.charAt(0) : 'P'}
                </div>
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh warga {dapil}.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan Navigasi</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#D4F63D] transition-colors">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#D4F63D] transition-colors">Profil Dewan</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#D4F63D] transition-colors">Artikel &amp; Risalah</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#D4F63D] transition-colors">Infografis Publik</Link></p>
              <p><Link href={getNavLinkHref('/kontak')} className="hover:text-[#D4F63D] transition-colors">Kontak Aspirasi</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kantor Aspirasi</h4>
              <p>Gedung Fraksi Parlemen DPRD</p>
              <p className="text-[#D4F63D] font-mono font-semibold">{officialPhone}</p>
              <p className="text-slate-400 font-mono">{officialEmail}</p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1.5">
              <span>Powered by</span>
              <span className="font-bold text-[#D4F63D]">POLARIS Parlemen Engine</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ─── MODAL DIALOG: FORMULIR ASPIRASI WARGA ─── */}
      {aspirationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative bg-[#111827] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={() => setAspirationModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {aspirationSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Aspirasi Berhasil Dikirim!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Terima kasih atas partisipasi Anda. Laporan akan ditindaklanjuti oleh staf ahli {officialFullName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAspirationSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4F63D] uppercase tracking-wider">
                    <Send className="w-3.5 h-3.5" />
                    Kanal Pengaduan Warga
                  </div>
                  <h3 className="text-xl font-bold text-white">Sampaikan Aspirasi Anda</h3>
                  <p className="text-xs text-slate-400">
                    Aspirasi dicatat dalam basis data pengaduan resmi {dapil}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={aspirationForm.name}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    required
                    value={aspirationForm.phone}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, phone: e.target.value })}
                    placeholder="0812xxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bidang Isu</label>
                  <select
                    value={aspirationForm.category}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F2937] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                  >
                    <option value="Infrastruktur & Jalan">Infrastruktur &amp; Jalan Rusak</option>
                    <option value="Kesehatan & BPJS">Kesehatan &amp; BPJS Daerah</option>
                    <option value="Pendidikan & Beasiswa">Pendidikan &amp; Gedung Sekolah</option>
                    <option value="Bantuan Sosial">Bantuan Sosial &amp; Pupuk Petani</option>
                    <option value="UMKM & Tenaga Kerja">UMKM &amp; Lapangan Kerja</option>
                    <option value="Hukum & Agraria">Hukum &amp; Sengketa Agraria</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Uraian Aspirasi</label>
                  <textarea
                    required
                    rows={4}
                    value={aspirationForm.message}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, message: e.target.value })}
                    placeholder="Tuliskan keluhan atau usulan kebijakan Anda secara jelas..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer mt-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Kirim Aspirasi Sekarang
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL DIALOG: PREVIEW INFOGRAFIS STUDIO LIGHTBOX ─── */}
      {activeModalInfo && (
        <div
          onClick={() => setActiveModalInfo(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0F1728] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-left"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-[#D4F63D] uppercase tracking-wider">
                  <span>{activeModalInfo.issueCategory?.replace(/_/g, ' ') || 'INFOGRAFIS PUBLIK'}</span>
                  <span>•</span>
                  <span>{activeModalInfo.publishedAt ? formatDateIndonesian(activeModalInfo.publishedAt) : 'Terbaru'}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {activeModalInfo.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tutup preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Image & Description */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getInfographicImage(activeModalInfo)}
                  alt={activeModalInfo.title}
                  className="max-h-[68vh] w-auto object-contain mx-auto"
                />
              </div>

              {(activeModalInfo.leadParagraph || activeModalInfo.excerpt || activeModalInfo.summary || activeModalInfo.description) && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {activeModalInfo.leadParagraph || activeModalInfo.excerpt || activeModalInfo.summary || activeModalInfo.description}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0A0F1D] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                Publikasi Resmi • {officialFullName}
              </span>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="px-5 py-2 rounded-full font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
