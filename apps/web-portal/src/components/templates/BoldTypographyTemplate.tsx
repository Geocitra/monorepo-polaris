'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Mail,
  Phone,
  MapPin,
  Instagram,
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

export function BoldTypographyTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const photoUrl = theme?.officialPhotoUrl || member?.photoUrl || '/images/default-avatar.png';
  const headline = theme?.headlineTagline || 'Menembus batas advokasi rakyat dengan integritas dan ketegasan sikap.';
  const bio = theme?.bioBiography || `${member?.fullName} mengemban amanah sebagai penyambung lidah rakyat Dapil ${member?.dapilName || 'DKI Jakarta I'} di parlemen.`;

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

  // Pisahkan nama depan dan belakang agar tertumpuk vertikal persis seperti di poster referensi
  function getStackedName(fullName?: string): [string, string] {
    if (!fullName) return ['WAKIL', 'RAKYAT'];
    const clean = fullName
      .replace(/^(dr\.|ir\.|drs\.|dra\.|h\.|hj\.|prof\.)\s+/gi, '')
      .replace(/,\s*(m\.sc|s\.t|s\.e|m\.m|s\.h|m\.h|s\.ip|m\.ip|ph\.d|m\.a).*$/gi, '')
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [clean, ''];
    if (parts.length === 2) return [parts[0], parts[1]];
    return [parts[0], parts.slice(1).join(' ')];
  }

  const watermarkText = theme?.layoutSchema?.watermarkText || theme?.watermarkText || 'PARLEMEN';
  const [firstName, lastName] = getStackedName(member?.fullName);
  const articles = recentArticles.slice(0, 3);
  const infographics = (recentInfographics || []).slice(0, 3);
  const homeStats: any[] =
    Array.isArray(theme?.layoutSchema?.stats) && theme.layoutSchema.stats.length > 0
      ? theme.layoutSchema.stats.filter((s: any) => s && (s.label?.trim() || s.value?.trim())).slice(0, 3)
      : [];
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const officialFullName = member?.fullName || 'Wakil Rakyat';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  return (
    <div className="min-h-screen bg-[#070707] text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* ─── TOP NAVBAR (RESPONSIVE WITH MOBILE HAMBURGER MENU) ─── */}
      <header className="border-b border-white/10 bg-[#070707]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Left: Brand Monogram / Avatar */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {member?.fullName ? member.fullName.charAt(0) : 'P'}
            </div>
            <span className="font-bold text-xs sm:text-sm text-white hidden sm:inline-block truncate max-w-[150px] lg:max-w-none group-hover:text-red-400 transition-colors">
              {officialFullName}
            </span>
          </Link>

          {/* Centered Navigation (Tablet & Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="text-white font-semibold border-b-[2.5px] pb-1 transition-colors"
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
          <div className="md:hidden border-t border-white/10 bg-[#070707]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
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

      {/* ─── SECTION 1: HERO WITH MASSIVE BACKGROUND TYPOGRAPHY ─── */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 pb-0 border-b border-white/10 bg-[#060606]">
        {/* GIANT RED BACKGROUND TYPOGRAPHY */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden z-0">
          <span
            className="font-bebas text-[22vw] sm:text-[23vw] font-black uppercase tracking-tight leading-none text-center block opacity-90 select-none whitespace-nowrap"
            style={{
              backgroundImage: `linear-gradient(180deg, ${primaryColor} 0%, #B91C1C 45%, #7F1D1D 85%, #450A0A 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {watermarkText}
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-end min-h-[540px] sm:min-h-[600px] lg:min-h-[700px]">
            
            {/* LEFT COLUMN: SCRIPT GREETING, STACKED CONDENSED NAME, ROLE, BIO */}
            <div className="lg:col-span-4 pb-4 lg:pb-12 text-left order-1 self-center lg:self-end pt-2 sm:pt-4 lg:pt-0">
              <div className="space-y-0">
                <span className="font-script text-2xl sm:text-3xl lg:text-[2.75rem] text-rose-200/90 font-normal block leading-tight tracking-wide mb-[-4px] sm:mb-[-6px] select-none">
                  Hello, I&apos;m
                </span>
                <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.8rem] font-black text-white uppercase tracking-tight leading-[0.85] select-none break-words">
                  <span className="block">{firstName}</span>
                  {lastName && <span className="block">{lastName}</span>}
                </h1>
              </div>

              {/* Subtitle in 2 bold red uppercase lines */}
              <div
                className="font-extrabold text-xs sm:text-sm tracking-wider uppercase mt-3 sm:mt-4 leading-snug space-y-0.5 select-none"
                style={{ color: primaryColor }}
              >
                <div>{member?.legislativeLevel ? `ANGGOTA ${member.legislativeLevel.replace(/_/g, ' ')}` : 'WAKIL RAKYAT'} &amp;</div>
                <div>{member?.commissionName || `FRAKSI ${member?.partyAffiliation || 'POLARIS'}`}</div>
              </div>

              {/* Description bio */}
              <p className="text-xs sm:text-sm text-slate-300/80 font-normal leading-relaxed max-w-sm mt-3 sm:mt-3.5">
                {headline}
              </p>
            </div>

            {/* CENTER COLUMN: CUTOUT PERSON PHOTO OVERLAYING GIANT TYPOGRAPHY */}
            <div className="lg:col-span-5 flex justify-center items-end order-2 relative h-full">
              {/* Background ambient lighting behind the head/torso */}
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[380px] lg:w-[440px] h-[260px] sm:h-[380px] lg:h-[440px] rounded-full blur-[90px] sm:blur-[110px] pointer-events-none opacity-30"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="relative w-full max-w-[270px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[480px] h-full flex items-end justify-center z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={member?.fullName || 'Foto Dewan'}
                  className="w-full h-auto max-h-[380px] sm:max-h-[500px] md:max-h-[580px] lg:max-h-[680px] object-contain object-bottom filter contrast-105 drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] select-none"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
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

            {/* RIGHT COLUMN: CIRCULAR BADGE & 3 BIG STATS (RESPONSIVE GRID ON TABLET) */}
            <div className="lg:col-span-3 pb-8 lg:pb-12 text-left order-3 flex flex-col justify-end gap-6 sm:gap-8 lg:gap-14 h-full self-stretch">
              {/* Parliamentary Badge */}
              <div className="flex items-center gap-3.5 max-w-[250px] lg:ml-auto">
                <div className="w-8 h-8 rounded-full border border-red-500/50 bg-red-950/20 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.25)]">
                  <Landmark className="w-3.5 h-3.5 text-red-400" />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-snug font-normal">
                  Menerjemahkan aspirasi warga menjadi aksi nyata parlemen.
                </p>
              </div>

              {/* 3 Stats: Hanya tampil jika dikonfigurasi resmi di layoutSchema dewan */}
              {homeStats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6 lg:gap-0 lg:space-y-4 max-w-none lg:max-w-[260px] lg:ml-auto w-full">
                  {homeStats.map((st: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className={`${
                        sIdx > 0
                          ? 'border-t sm:border-t-0 sm:border-l lg:border-l-0 lg:border-t border-white/10 pt-4 sm:pt-0 sm:pl-4 lg:pl-0 lg:pt-4'
                          : ''
                      } flex items-center gap-3 sm:gap-4`}
                    >
                      <span
                        className="font-bebas text-4xl sm:text-5xl lg:text-7xl font-black leading-none shrink-0"
                        style={{ color: primaryColor }}
                      >
                        {st.value}
                      </span>
                      <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-white uppercase leading-tight">
                        {st.label}
                        {st.sublabel && (
                          <>
                            <br />
                            <span className="text-slate-400">{st.sublabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SELECTED ARTICLES (MATCHING DESIGN 2 "SELECTED PROJECTS") ─── */}
      <section id="articles" className="py-16 sm:py-20 border-b border-white/10 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
            <span className="font-bold text-white">PUBLIKASI RESMI</span>
            <Link href={getNavLinkHref('/artikel')} className="text-red-400 hover:text-white flex items-center gap-1 transition-colors">
              <span>LIHAT SEMUA KAJIAN</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.length > 0 ? (
              articles.map((art, idx) => (
                <Link
                  key={art.id}
                  href={getNavLinkHref(`/artikel/${art.slug}`)}
                  className="group block p-5 rounded-xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all duration-300 space-y-4"
                >
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.featuredImageUrl || art.posterUrl || '/images/default-article.jpg'}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-red-500 font-bold">0{idx + 1}</span>
                      <span className="text-slate-500">{art.issueCategory || 'KEBIJAKAN'}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {art.leadParagraph || art.excerpt || 'Klik untuk membaca risalah telaah kebijakan selengkapnya.'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                Belum ada kajian naskah resmi yang diterbitkan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: INFOGRAFIS CAPAIAN & TRANSPARANSI ─── */}
      <section id="infografis" className="py-16 sm:py-20 border-b border-white/10 bg-[#070707]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
            <span className="font-bold text-white">INFOGRAFIS CAPAIAN &amp; TRANSPARANSI</span>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-red-400 hover:text-white flex items-center gap-1 transition-colors"
              style={{ color: primaryColor }}
            >
              <span>LIHAT SEMUA INFOGRAFIS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infographics.length > 0 ? (
              infographics.map((info: any, idx: number) => {
                const infoImg =
                  info.imageUrl ||
                  info.posterUrl ||
                  info.featuredImageUrl ||
                  '/images/showcase-infografis-apbd.jpg';
                return (
                  <Link
                    key={info.id || idx}
                    href={getNavLinkHref('/infografis')}
                    className="group block p-5 rounded-xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all duration-300 space-y-4"
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={infoImg}
                        alt={info.title || 'Infografis Capaian'}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('/images/showcase-infografis-apbd.jpg')) {
                            target.src = '/images/showcase-infografis-apbd.jpg';
                          }
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {info.category || info.issueCategory || 'DATA KINERJA'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold" style={{ color: primaryColor }}>
                          0{idx + 1}
                        </span>
                        <span className="text-slate-500">
                          {info.publishedAt
                            ? formatDateIndonesian(info.publishedAt)
                            : (info.date || 'PUBLIKASI RESMI')}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                        {info.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {info.summary || info.excerpt || info.description || 'Visualisasi data capaian kebijakan publik dan akuntabilitas parlemen.'}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                Belum ada infografis publikasi resmi yang diterbitkan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FOOTER (MATCHING DESIGN 2 "LET'S WORK TOGETHER") ─── */}
      <footer id="contact" className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-12">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-mono uppercase text-red-500 tracking-widest block font-bold">
                BERSAMA MEMBANGUN DAPIL
              </span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white uppercase leading-tight">
                SUARAKAN ASPIRASI BERSAMA
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Pintu kantor dan ruang aspirasi senantiasa terbuka untuk kritik, masukan kebijakan, dan pendampingan warga konstituen.
              </p>
              <div className="pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>FORM PENGADUAN RESMI</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>aspirasi@{subdomain || 'dewan'}.polaris.id</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+62 812-9876-5432 (Hotline Resmi Staf Ahli)</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Gedung Nusantara I DPR RI, Jakarta Pusat</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div>&copy; {new Date().getFullYear()} {member?.fullName}. PROTOKOL KEBIJAKAN PARLEMEN POLARIS.</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white">TWITTER</a>
              <a href="#" className="hover:text-white">INSTAGRAM</a>
              <a href="#" className="hover:text-white">LINKEDIN</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
