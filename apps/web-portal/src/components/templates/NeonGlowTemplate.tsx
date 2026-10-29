'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Download,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Quote,
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

export function NeonGlowTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#8B5CF6';
  const photoUrl = theme?.officialPhotoUrl || member?.photoUrl || '/images/default-avatar.png';
  const headline = theme?.headlineTagline || 'Membangun ekosistem legislasi modern yang adaptif terhadap masa depan digital.';
  const bio = theme?.bioBiography || `${member?.fullName} memadukan sains kebijakan, keterbukaan data, dan aksi advokasi nyata untuk Dapil ${member?.dapilName || 'Indonesia'}.`;

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const officialFullName = member?.fullName || 'Wakil Rakyat';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    const sp = new URLSearchParams();
    if (previewTemplate) sp.set('preview_template', previewTemplate);
    if (previewColor) sp.set('preview_color', previewColor);
    const qs = sp.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
  };

  const articles = recentArticles.slice(0, 3);
  const infographics = recentInfographics || [];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* ─── 1. TOP NAVBAR (RESPONSIVE WITH MOBILE HAMBURGER MENU) ─── */}
      <header className="border-b border-purple-900/30 bg-[#070913]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Left: Brand Monogram & Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 group transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-purple-900/50 shrink-0">
              {member?.fullName ? member.fullName.charAt(0) : 'P'}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white hidden sm:inline-block truncate max-w-[150px] lg:max-w-none group-hover:text-purple-300 transition-colors">
                {officialFullName}
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {member?.partyAffiliation || 'FRAKSI PARLEMEN'}
              </span>
            </div>
          </Link>

          {/* Centered Navigation (Tablet & Desktop) */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="text-white font-semibold border-b-[2px] border-purple-500 pb-0.5 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className="text-slate-400 hover:text-white border-b-[2px] border-transparent hover:border-slate-500 pb-0.5 transition-all"
            >
              Profil
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-slate-400 hover:text-white border-b-[2px] border-transparent hover:border-slate-500 pb-0.5 transition-all"
            >
              Artikel
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-slate-400 hover:text-white border-b-[2px] border-transparent hover:border-slate-500 pb-0.5 transition-all"
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className="text-slate-400 hover:text-white border-b-[2px] border-transparent hover:border-slate-500 pb-0.5 transition-all"
            >
              Kontak
            </Link>
          </nav>

          {/* Right: Instagram Gradient Pill Button + Mobile Hamburger */}
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
          <div className="md:hidden border-t border-purple-900/40 bg-[#070913]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-white hover:bg-purple-900/30 transition-colors"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── 2. SECTION 1: HERO WITH CIRCULAR NEON GLOW & CODE CARD (EXACT TO DESIGN 3) ─── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-16 lg:py-24 border-b border-purple-900/30">
        {/* Background ambient neon radial bursts */}
        <div className="absolute top-1/4 right-1/4 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-purple-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-[240px] sm:w-[350px] h-[240px] sm:h-[350px] bg-indigo-600/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: GREETING, HEADLINE, ACTION BUTTONS */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left order-1">
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.08] break-words">
                Hai, Saya <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">{member?.fullName?.split(',')[0]}</span>
                <span className="block text-slate-300 font-extrabold text-xl sm:text-3xl mt-2">
                  Mengawal Suara & Kebijakan Masa Depan.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal max-w-lg">
                {headline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/aspirasi"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all inline-flex items-center gap-2"
                >
                  <span>Kirim Aspirasi</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: CIRCULAR NEON GLOW HALO + CUTOUT PHOTO */}
            <div className="lg:col-span-6 flex justify-center relative order-2">
              
              {/* THE SIGNATURE RADIANT NEON CIRCLE HALO (RESPONSIVE NO OVERFLOW) */}
              <div className="relative w-[270px] xs:w-[320px] sm:w-[390px] lg:w-[420px] aspect-square flex items-center justify-center max-w-full">
                <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 opacity-80 blur-[2px] shadow-2xl shadow-purple-600/50" />
                <div className="absolute inset-4 sm:inset-5 rounded-full bg-[#070913]/90 backdrop-blur-sm" />

                {/* Cutout Photo placed inside/above the halo */}
                <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden rounded-b-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={member?.fullName || 'Foto Profil'}
                    className="w-full h-full object-cover object-top filter contrast-[1.05] drop-shadow-2xl select-none"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                    }}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. SECTION 2: ARTICLES ("FEATURED ARTICLES & BRIEFS") ─── */}
      <section id="articles" className="py-16 sm:py-20 border-b border-purple-900/30 bg-[#090C1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-900/40 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Artikel &amp; Berita Parlemen Terkini
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors font-mono"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length > 0 ? (
              articles.map((art) => (
                <div
                  key={art.id}
                  className="group rounded-2xl bg-[#0D1226]/80 border border-purple-900/40 hover:border-purple-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-950/40"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-purple-900/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.featuredImageUrl || art.posterUrl || '/images/default-article.jpg'}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 font-bold">
                        {art.issueCategory || 'KEBIJAKAN'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateIndonesian(art.publishedAt || art.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal">
                      {art.leadParagraph || art.excerpt || 'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 5 min read
                    </span>
                    <Link
                      href={getNavLinkHref(`/artikel/${art.slug}`)}
                      className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all"
                    >
                      <span>Baca Naskah</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 rounded-2xl border border-dashed border-purple-900/40 text-slate-500 text-xs font-mono">
                Belum ada rilis artikel kebijakan yang dipublikasikan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION 3: GALERI INFOGRAFIS KINERJA PARLEMEN (NEON CYBER OS) ─── */}
      <section id="infografis" className="py-16 sm:py-20 border-b border-purple-900/30 bg-[#070913]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-900/40 pb-5">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest font-bold flex items-center">
                DATA VISUALIZATION &amp; PUBLIC TRANSPARENCY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Infografis Capaian &amp; Transparansi Kinerja
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors font-mono"
            >
              <span>Lihat Semua Infografis</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {infographics.map((info: any) => (
              <div
                key={info.id}
                className="group rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 hover:border-cyan-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-950/30 relative overflow-hidden"
              >
                {/* Ambient glow in corner */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-600/20 transition-all" />

                <div className="space-y-4 relative z-10">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-purple-900/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={info.imageUrl || info.posterUrl || info.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
                      {info.category || 'INFOGRAFIS_RESMI'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {formatDateIndonesian(info.publishedAt || info.createdAt || '2026-09-01')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                    {info.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {info.excerpt || info.prompt || 'Visualisasi data capaian dan pengawasan kebijakan dewan untuk keterbukaan publik.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-between text-xs font-semibold relative z-10">
                  <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase">
                    POLARIS_METRIC_DATA
                  </span>
                  <Link
                    href={getNavLinkHref('/infografis')}
                    className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-mono font-bold group-hover:translate-x-1 transition-all"
                  >
                    <span>[PERBESAR_GRAFIS]</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 4: FOOTER & ASPIRASI (MATCHING DESIGN 3) ─── */}
      <footer id="contact" className="py-16 bg-[#04060C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0A0E22] to-indigo-950/30 border border-purple-900/40">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
                SALURKAN GAGASAN
              </span>
              <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white">
                Punya Masukan Kebijakan atau Aspirasi Daerah?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Kami percaya transparansi dan partisipasi publik adalah pondasi utama demokrasi yang sehat. Sampaikan suara Anda langsung ke meja kerja anggota dewan.
              </p>
              <div className="pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 inline-flex items-center gap-2"
                >
                  <span>Hubungi Sekretariat Dewan</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/70 border border-purple-900/40 space-y-3 font-mono text-xs">
              <div className="text-purple-400 font-bold uppercase text-[11px]">KANTOR ASPIRASI:</div>
              <div className="text-slate-300">Gedung Nusantara I DPR RI, Ruang Kerja Fraksi, Senayan, Jakarta.</div>
              <div className="text-slate-400 text-[11px] pt-1">Email: aspirasi@{subdomain || 'dewan'}.polaris.id</div>
              <div className="text-slate-400 text-[11px]">WA Center: 0812-9876-5432</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 pt-4">
            <div>&copy; {new Date().getFullYear()} {member?.fullName}. POLARIS Legislative Intelligence OS.</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors">TWITTER</a>
              <a href="#" className="hover:text-purple-400 transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-purple-400 transition-colors">LINKEDIN</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
