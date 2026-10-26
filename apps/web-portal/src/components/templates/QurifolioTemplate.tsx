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
  BookOpen,
  Download,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Mouse,
  Sparkles,
  ChevronDown,
  Eye,
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

export function QurifolioTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const party = member?.partyAffiliation || 'Fraksi Parlemen DPR RI';
  const officialEmail = `aspirasi@${subdomain || 'ahmadfauzi'}.polaris.id`;
  const officialPhone = '+62 812-9876-5432';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

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
      return { cleanName: 'Ahmad Fauzi', firstName: 'Ahmad', lastName: 'Fauzi', brandName: 'Ahmad Fauzi' };
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
      brandName: clean || 'Ahmad Fauzi',
    };
  }

  const { cleanName, firstName, lastName, brandName } = parseCleanIdentity(member?.fullName);

  // Data real dari API tanpa fallback dummy
  const articles = recentArticles || [];
  const infographics = recentInfographics || [];
  const featuredInfographic = infographics.length > 0 ? infographics[0] : null;

  const getInfographicImg = (info: any) =>
    info?.posterUrl || info?.imageUrl || info?.featuredImageUrl || info?.mediaUrl || info?.fileUrl || '';

  const getInfographicCategory = (info: any) =>
    info?.issueCategory || info?.category || 'VISUAL DATA';

  const getArticleCategory = (art: any) =>
    art?.issueCategory || art?.category || 'Kajian Parlemen';

  const getArticleImg = (art: any, idx: number) => {
    if (art?.posterUrl && typeof art.posterUrl === 'string' && art.posterUrl.trim().length > 0) {
      return art.posterUrl;
    }
    if (art?.featuredImageUrl && typeof art.featuredImageUrl === 'string' && art.featuredImageUrl.trim().length > 0) {
      return art.featuredImageUrl;
    }
    if (art?.imageUrl && typeof art.imageUrl === 'string' && art.imageUrl.trim().length > 0) {
      return art.imageUrl;
    }
    const fallbacks = [
      '/images/article-crop-1.png',
      '/images/article-crop-2.png',
      '/images/article-crop-3.png',
    ];
    return fallbacks[idx % fallbacks.length];
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#161616] font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-hidden">
      
      {/* ─── NAVBAR (PERSIS HEADER QURIFOLIO PADA GAMBAR) ─── */}
      <header className="sticky top-0 z-50 bg-[#F4EFEA]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand: Orange Asterisk Icon + Qurifolio Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 select-none group"
          >
            {/* Geometric Orange 8-point Asterisk Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black shadow-md group-hover:rotate-45 transition-transform duration-300 p-1.5">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <g fill="white">
                  <rect x="41.75" y="4" width="16.5" height="92" />
                  <rect x="4" y="41.75" width="92" height="16.5" />
                  <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
                  <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
                </g>
              </svg>
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-[#161616] tracking-tight group-hover:text-[#FF6B00] transition-colors">
              {brandName}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-bold tracking-wider uppercase text-stone-700">
            <Link
              href={getNavLinkHref('/')}
              className="text-[#FF6B00] transition-colors flex items-center gap-1"
            >
              <span>Beranda</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"
            >
              <span>Profil</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"
            >
              <span>Artikel</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className="hover:text-[#FF6B00] transition-colors flex items-center gap-1"
            >
              <span>Infografis</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className="hover:text-[#FF6B00] transition-colors"
            >
              Kontak
            </Link>
          </nav>

          {/* Right Action: Instagram Pill Button & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate max-w-[85px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-black rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#EFECE6] border-b border-stone-300 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { label: 'Beranda', href: '/' },
              { label: 'Profil', href: '/profil' },
              { label: 'Artikel', href: '/artikel' },
              { label: 'Infografis', href: '/infografis' },
              { label: 'Kontak', href: '/kontak' },
            ].map((item) => (
              <Link
                key={item.href}
                href={getNavLinkHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-stone-800 hover:text-[#FF6B00] hover:bg-white/40 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ─── SECTION 1: HERO SHOWCASE (FULL SCREEN & PERSIS SEPERTI PADA GAMBAR) ─── */}
      <section className="relative w-full h-[calc(100vh-5rem)] min-h-[580px] max-h-[760px] overflow-hidden flex flex-col justify-between bg-[#F4EFEA]">
        
        {/* ─── 1. LAYER PALING BELAKANG: GIANT VIVID ORANGE 8-POINT GEOMETRIC ASTERISK (z-[1]) ─── */}
        <div className="absolute bottom-6 sm:bottom-10 lg:bottom-14 left-1/2 -translate-x-[96%] sm:-translate-x-[92%] md:-translate-x-[88%] lg:-translate-x-[85%] w-64 h-64 sm:w-76 sm:h-76 md:w-88 md:h-88 lg:w-[410px] lg:h-[410px] xl:w-[450px] xl:h-[450px] z-[1] pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FF6B00] drop-shadow-xs">
            <g fill="#FF6B00">
              {/* Vertical Beam (0 deg) */}
              <rect x="41.75" y="4" width="16.5" height="92" />
              {/* Horizontal Beam (90 deg) */}
              <rect x="4" y="41.75" width="92" height="16.5" />
              {/* Diagonal Beam 1 (45 deg) */}
              <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
              {/* Diagonal Beam 2 (135 deg) */}
              <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
            </g>
          </svg>
        </div>

        {/* ─── 2. LAYER TEKS SOLID HITAM (DI DEPAN ASTERISK, DI BELAKANG MODEL: z-[2]) ─── */}
        <div className="relative w-full text-center pt-4 sm:pt-6 lg:pt-8 select-none z-[2]">
          
          {/* Row 1: WAKIL RAKYAT */}
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[120px] xl:text-[145px] 2xl:text-[165px] font-black uppercase tracking-tight text-[#161616] leading-[0.88]">
            WAKIL RAKYAT
          </div>

          {/* Row 2: PARLEMEN */}
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[120px] xl:text-[145px] 2xl:text-[165px] font-black uppercase tracking-[0.06em] text-[#161616] leading-[0.88] mt-1 sm:mt-2">
            PARLEMEN
          </div>

        </div>

        {/* CENTER CUTOUT MODEL PHOTO (STANDING AT BOTTOM BOUNDARY) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-auto h-[72%] sm:h-[78%] lg:h-[84%] max-h-[640px] flex justify-center items-end pointer-events-none select-none">
          <img
            src={photoUrl}
            alt={officialFullName}
            className="h-full w-auto max-w-[85vw] sm:max-w-none object-contain object-bottom filter grayscale contrast-115 drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)]"
          />
        </div>

        {/* OVERLAPPING WHITE OUTLINE TEXT IN FRONT OF MODEL (LETTERS 'RLEM' OVER CHEST) */}
        <div className="absolute inset-0 flex flex-col justify-start pt-4 sm:pt-6 lg:pt-8 items-center pointer-events-none select-none z-20">
          {/* Row 1 dummy spacer */}
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[120px] xl:text-[145px] 2xl:text-[165px] font-black uppercase tracking-tight opacity-0 leading-[0.88]">
            WAKIL RAKYAT
          </div>
          {/* Row 2: Outlined RLEM overlapping torso/arms */}
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[120px] xl:text-[145px] 2xl:text-[165px] font-black uppercase tracking-[0.06em] leading-[0.88] mt-1 sm:mt-2">
            <span className="opacity-0">PA</span>
            <span className="text-transparent [-webkit-text-stroke:1.5px_#ffffff] sm:[-webkit-text-stroke:2px_#ffffff] opacity-90 drop-shadow-xs">
              RLEM
            </span>
            <span className="opacity-0">EN</span>
          </div>
        </div>

      </section>

      {/* ─── INTER-SECTION 1 & 2: FLOATING CIRCULAR SCROLL BADGE (PERSIS PADA GAMBAR - 50% DI SECTION 1, 50% DI SECTION 2) ─── */}
      <div className="relative w-full z-40 select-none pointer-events-none" style={{ height: 0 }}>
        <button
          type="button"
          onClick={() => {
            const sec2 = document.getElementById('section-2');
            sec2?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="pointer-events-auto cursor-pointer group focus:outline-hidden"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -50%)',
          }}
          aria-label="Gulir ke Section 2"
        >
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#222222] border-2 border-stone-800 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            
            {/* Rotating Text Ring: SCROLL DOWN • SCROLL DOWN • */}
            <div className="absolute inset-0 flex items-center justify-center animate-[spin_12s_linear_infinite] select-none pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  id="circlePathHero"
                  d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text className="text-[8.5px] font-extrabold uppercase fill-white tracking-[0.24em]">
                  <textPath href="#circlePathHero">
                    SCROLL DOWN • SCROLL DOWN •
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Vivid Orange Inner Center with Authentic Mouse Scroll Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-inner z-10 group-hover:bg-[#ff7b1a] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
                <rect x="6" y="3" width="12" height="18" rx="6" />
                <line x1="12" y1="7" x2="12" y2="11" />
              </svg>
            </div>

          </div>
        </button>
      </div>

      {/* ─── SECTION 2: PROFILE & METRICS (PERSIS PERSIS SESUAI GAMBAR ACUAN) ─── */}
      <section id="section-2" className="relative overflow-hidden bg-[#181818] text-white pt-28 sm:pt-36 pb-24 sm:pb-32 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: HELLO, I'M {NAMA}, Description, 3 Checklist Metrics (PERSIS GAMBAR) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Line 1: HELLO in muted gray uppercase (PERSIS GAMBAR) */}
              <span className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-stone-500 block">
                HELLO
              </span>

              {/* Line 2: I'M {NAME} in bold white font-black (PERSIS GAMBAR) */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight text-white">
                I&apos;M {cleanName.toUpperCase()}
              </h2>

              {/* Line 3: Description paragraph in muted stone-400 (PERSIS GAMBAR) */}
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md font-normal">
                Mewakili Daerah Pemilihan {dapil}. Berkomitmen penuh mengawal naskah risalah kebijakan, memfasilitasi aspirasi konstituen, dan memastikan setiap regulasi bermuara pada pemerataan kemakmuran warga.
              </p>

              {/* Line 4: 3 Metrics with White Circular Checkmark Badges (PERSIS GAMBAR: 10+, 64+, 151+) */}
              <div className="space-y-4 sm:space-y-5 pt-3">
                
                {/* Metric 1 */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="font-black text-2xl sm:text-3xl text-white tracking-tight shrink-0 min-w-[70px]">
                    10+
                  </span>
                  <span className="text-xs sm:text-sm text-stone-400 font-medium">
                    Tahun Masa Pengabdian Parlemen
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="font-black text-2xl sm:text-3xl text-white tracking-tight shrink-0 min-w-[70px]">
                    64+
                  </span>
                  <span className="text-xs sm:text-sm text-stone-400 font-medium">
                    Program Aspirasi Tuntas
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="font-black text-2xl sm:text-3xl text-white tracking-tight shrink-0 min-w-[70px]">
                    151+
                  </span>
                  <span className="text-xs sm:text-sm text-stone-400 font-medium">
                    Titik Temu &amp; Dialog Konstituen
                  </span>
                </div>

              </div>

            </div>

            {/* Right Column: Cutout Portrait with Graphic Accents (PERSIS GAMBAR) */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex justify-center items-end min-h-[420px] sm:min-h-[480px]">
                
                {/* 1. Subtle 3x3 Checkerboard Grid behind top right of photo (PERSIS GAMBAR) */}
                <div className="absolute top-4 right-2 sm:right-6 grid grid-cols-3 gap-2 opacity-15 pointer-events-none select-none z-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xs" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xs" />
                </div>

                {/* 2. Concentric Radial Arc Lines behind torso on left (PERSIS GAMBAR) */}
                <div className="absolute bottom-16 -left-6 sm:-left-10 w-40 sm:w-48 h-40 sm:h-48 opacity-20 pointer-events-none select-none z-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-stone-300 fill-none stroke-[1.5]">
                    <circle cx="10" cy="90" r="30" />
                    <circle cx="10" cy="90" r="48" />
                    <circle cx="10" cy="90" r="66" />
                    <circle cx="10" cy="90" r="84" />
                  </svg>
                </div>

                {/* 3. Three Doodle Rays above Head: White, Orange, White (PERSIS GAMBAR) */}
                <div className="absolute -top-7 right-20 sm:right-24 flex items-center gap-1.5 z-20 pointer-events-none">
                  <span className="w-1 h-4 bg-white rounded-full rotate-[-25deg] block shadow-xs" />
                  <span className="w-1 h-5 bg-[#FF6B00] rounded-full rotate-[15deg] block -mt-1 shadow-xs" />
                  <span className="w-3.5 h-1 bg-white rounded-full block mt-2 shadow-xs" />
                </div>

                {/* 4. Two Wavy Doodle Lines near Elbow: Orange top, White bottom (PERSIS GAMBAR) */}
                <div className="absolute bottom-28 right-0 sm:right-2 z-20 space-y-1.5 pointer-events-none">
                  <svg width="42" height="10" viewBox="0 0 42 10" fill="none" className="stroke-[#FF6B00] stroke-[2.5] stroke-linecap-round">
                    <path d="M 2 5 Q 8 0 14 5 T 26 5 T 38 5" />
                  </svg>
                  <svg width="42" height="10" viewBox="0 0 42 10" fill="none" className="stroke-white stroke-[2.5] stroke-linecap-round">
                    <path d="M 2 5 Q 8 0 14 5 T 26 5 T 38 5" />
                  </svg>
                </div>

                {/* 5. Cutout Photo */}
                <div className="relative z-10 w-full flex justify-center">
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-auto max-h-[460px] sm:max-h-[500px] object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 3: ARTIKEL & KAJIAN KEBIJAKAN (DIPISAH KE SECTION SELANJUTNYA) ─── */}
      <section id="section-artikel" className="relative overflow-hidden py-24 sm:py-32 bg-[#F4EFEA] border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header with Title & Action Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FF6B00] block">
                GAGASAN &amp; REGULASI
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#161616] tracking-tight uppercase">
                KAJIAN &amp; PUBLIKASI KEBIJAKAN
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl font-normal leading-relaxed">
                Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari {cleanName}.
              </p>
            </div>

            <Link
              href={getNavLinkHref('/artikel')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#161616] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all self-start md:self-end shrink-0 cursor-pointer"
            >
              <span>BACA SEMUA ARTIKEL</span>
              <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
            </Link>
          </div>

          {/* Featured Recent Articles Grid (Real API Articles with Cover Images) */}
          {articles.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white border border-stone-200 shadow-xs max-w-xl mx-auto">
              <BookOpen className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-800 mb-1">Belum Ada Artikel Dipublikasikan</h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Naskah kajian kebijakan dan artikel aspirasi akan segera ditampilkan di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((art, idx) => (
                <Link
                  key={art.id || art.slug || idx}
                  href={getNavLinkHref(`/artikel/${art.slug}`)}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-2xl hover:border-[#FF6B00] transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Article Card Cover Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 border-b border-stone-100">
                    <img
                      src={getArticleImg(art, idx)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-stone-200/60">
                        {getArticleCategory(art)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-black text-[#161616] group-hover:text-[#FF6B00] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-semibold">
                      <span>{art.readingTimeMinutes || 4} mnt baca</span>
                      <span className="inline-flex items-center gap-1 text-[#FF6B00] font-black uppercase tracking-wider text-[11px] group-hover:translate-x-1 transition-transform">
                        <span>BACA</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION 4: INFOGRAFIS & DATA PARLEMEN (CARD PROFESIONAL & RAPI) ─── */}
      <section id="section-infografis" className="relative overflow-hidden py-24 sm:py-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Title & Action Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FF6B00] block">
              VISUALISASI DATA &amp; DOKUMENTASI
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#161616] tracking-tight uppercase">
              INFOGRAFIS &amp; DATA PARLEMEN
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl font-normal leading-relaxed">
              Visualisasi data kebijakan publik, pengawasan anggaran APBN/APBD, dan transparansi legislasi untuk seluruh warga daerah pemilihan.
            </p>
          </div>

          <Link
            href={getNavLinkHref('/infografis')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#161616] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all self-start md:self-end shrink-0 cursor-pointer"
          >
            <span>LIHAT SEMUA INFOGRAFIS</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
          </Link>
        </div>

        {infographics.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200/90 shadow-xs max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 text-[#FF6B00] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800 mb-2">Belum Ada Infografis Publik</h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Dokumentasi visual data parlemen dan transparansi anggaran akan segera diperbarui.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${infographics.length === 1 ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-8`}>
            {infographics.slice(0, 2).map((info, idx) => {
              const img = getInfographicImg(info);
              const category = getInfographicCategory(info);

              return (
                <div
                  key={info.id || idx}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-2xl hover:border-[#FF6B00] transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Visual Showcase Framing */}
                  <div
                    onClick={() => setActiveModalInfo(info)}
                    className="relative bg-gradient-to-b from-stone-50 via-stone-100/70 to-stone-100 p-5 sm:p-7 border-b border-stone-100 flex items-center justify-center min-h-[300px] sm:min-h-[360px] cursor-pointer overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={info.title}
                      className="max-h-[280px] sm:max-h-[330px] w-auto max-w-full object-contain rounded-xl drop-shadow-md group-hover:scale-[1.03] transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs border border-stone-200/60">
                        {category}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] font-bold text-stone-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-stone-200/50">
                        HD INFOGRAPHIC
                      </span>
                    </div>

                    {/* Hover Overlay with Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#161616] font-extrabold text-xs uppercase tracking-wider shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Perbesar Dokumen</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Info & Actions */}
                  <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h3
                        onClick={() => setActiveModalInfo(info)}
                        className="text-lg sm:text-xl font-black text-[#161616] group-hover:text-[#FF6B00] transition-colors leading-tight line-clamp-2 cursor-pointer"
                      >
                        {info.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                        {info.excerpt || 'Visualisasi data resmi transparansi kebijakan publik dan akuntabilitas kinerja legislasi dewan.'}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModalInfo(info)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Lihat Detail</span>
                      </button>

                      <a
                        href={img}
                        download={info.title ? `${info.title}.png` : 'infografis.png'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200/70 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PNG</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-[#161616] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex items-center justify-center">
              <img
                src={getInfographicImg(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-md border border-stone-200"
              />
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-600 max-w-md">
                {activeModalInfo.excerpt || 'Data resmi transparansi kebijakan parlemen.'}
              </p>
              <a
                href={getInfographicImg(activeModalInfo)}
                download={activeModalInfo.title ? `${activeModalInfo.title}.png` : 'infografis.png'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6B00] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-[#e65c00] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Infografis</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── SLEEK FOOTER ─── */}
      <footer className="bg-[#181818] text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black p-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                    <g fill="white">
                      <rect x="41.75" y="4" width="16.5" height="92" />
                      <rect x="4" y="41.75" width="92" height="16.5" />
                      <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
                      <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
                    </g>
                  </svg>
                </div>
                <span className="text-lg font-bold text-white tracking-wider">
                  {brandName}
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#FF6B00]">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#FF6B00]">Profil & Rekam Jejak</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#FF6B00]">Gagasan & Artikel</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#FF6B00]">Infografis Layanan</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kontak Parlemen</h4>
              <p>Sekretariat Fraksi DPR RI Senayan, Jakarta Pusat</p>
              <p className="text-[#FF6B00]">{officialPhone}</p>
              <p className="text-white/60">{officialEmail}</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="text-stone-600">Powered by POLARIS Parlemen Engine</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
