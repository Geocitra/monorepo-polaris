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
  FileText,
  Eye,
  Sparkles,
  ShieldCheck,
  Building2,
  MessageSquare,
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

export function EmeraldTechTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#00DF82';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const officialEmail = member?.email || (subdomain ? `aspirasi@${subdomain}.polaris.id` : 'aspirasi@polaris.id');
  const officialPhone = member?.phoneNumber || '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

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
      return { cleanName: 'Wakil Rakyat', firstName: 'Wakil', lastName: 'Rakyat', initial: 'W' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Wakil';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : '';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Wakil Rakyat',
      firstName,
      lastName,
      initial: initial || 'W',
    };
  }

  const { firstName, lastName, initial } = parseCleanIdentity(member?.fullName);

  // Strictly use real generated articles & infographics from account (NO dummy data fallback)
  const articles = Array.isArray(recentArticles) ? recentArticles : [];
  const infographics = Array.isArray(recentInfographics) ? recentInfographics : [];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#00DF82] selection:text-black overflow-x-hidden">
      
      {/* ─── SCREEN 1: NAVBAR + HERO SECTION 1 (FULL SCREEN 100VH ON INITIAL LOAD) ─── */}
      <div className="min-h-screen lg:h-screen flex flex-col justify-between relative bg-[#111111]">
        
        {/* ─── NAVBAR: CLEAN & MINIMAL SESUAI REFERENSI ─── */}
        <header className="w-full h-20 sm:h-24 shrink-0 bg-[#111111]/95 backdrop-blur-md border-b border-white/[0.08] z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            
            {/* Brand: [Initial Circle] Name */}
            <Link
              href={getNavLinkHref('/')}
              className="flex items-center gap-3 select-none group"
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-black font-black flex items-center justify-center text-base sm:text-lg shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                {initial}
              </div>
              <span className="font-bold text-lg sm:text-xl text-white tracking-wide transition-colors">
                {firstName} <span className="font-bold" style={{ color: primaryColor }}>{lastName || 'Parlemen'}</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs sm:text-sm font-bold tracking-widest uppercase">
              <Link
                href={getNavLinkHref('/')}
                className="transition-colors"
                style={{ color: primaryColor }}
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                className="text-white hover:opacity-80 transition-opacity"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                className="text-white hover:opacity-80 transition-opacity"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                className="text-white hover:opacity-80 transition-opacity"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="text-white hover:opacity-80 transition-opacity"
              >
                Kontak
              </Link>
            </nav>

            {/* Right Action: Instagram & Mobile Hamburger */}
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all select-none cursor-pointer"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                <Instagram className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Instagram</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#161616] border-b border-white/[0.08] px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  className="block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white hover:bg-white/[0.04] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/[0.08]">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#e6683c]" />
                  <span>Instagram Resmi</span>
                </a>
              </div>
            </div>
          )}
        </header>

        {/* ─── SECTION 1: HERO PARLEMEN (LAYOUT & TIPOGRAFI SAMA PERSIS REFERENSI) ─── */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden py-8 lg:py-0">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Heading, Subtext, & Sharp Rectangle Button */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 z-10">
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1]">
                <span className="text-white block">Wakil Rakyat</span>
                <span className="block mt-1.5 sm:mt-2" style={{ color: primaryColor }}>{officialFullName}</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-md sm:max-w-lg mt-5 sm:mt-6">
                {theme?.headlineTagline ||
                  `Mendedikasikan pemikiran, pengawasan kebijakan publik, dan aksi nyata kenegaraan demi kesejahteraan konstituen Daerah Pemilihan ${dapil}.`}
              </p>

              {/* Sharp Rectangular Button */}
              <div className="pt-3 sm:pt-5">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="inline-block text-black font-bold text-sm sm:text-base px-9 py-3.5 sm:py-4 rounded-none shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sampaikan Aspirasi
                </Link>
              </div>

            </div>

            {/* Right Column: Cutout Photo with Signature Colored and White Circles */}
            <div className="lg:col-span-6 flex justify-center items-center relative">
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] flex justify-center items-end">
                
                {/* Colored Circle (Upper Left) */}
                <div
                  className="absolute top-2 sm:top-4 left-2 sm:left-6 w-60 h-60 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full z-0 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                />
                
                {/* White Circle (Lower Right) */}
                <div className="absolute bottom-6 sm:bottom-8 right-2 sm:right-6 w-52 h-52 sm:w-72 sm:h-72 lg:w-[370px] lg:h-[370px] rounded-full bg-white z-0" />

                {/* Cutout Photo in Foreground */}
                <div className="relative z-10 w-full flex justify-center items-end">
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
                  />
                </div>

              </div>
            </div>

          </div>
        </section>

      </div>

      {/* ─── SECTION 2: ARTIKEL (KAJIAN KEBIJAKAN TERKINI) ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-[#00DF82] text-xs font-bold uppercase tracking-wider mb-2">
              <span>GAGASAN &amp; PUBLIKASI RESMI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              <span className="text-[#00DF82]">Kajian Kebijakan </span>
              <span className="text-white">&amp; Risalah Parlemen</span>
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
              Naskah akademik, risalah analisis regulasi, dan telaah perundang-undangan kenegaraan resmi dari parlemen Daerah Pemilihan {dapil}.
            </p>
          </div>

          {articles.length > 0 && (
            <Link
              href={getNavLinkHref('/artikel')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs bg-[#181818] hover:bg-[#222222] border border-white/[0.1] text-xs font-bold text-[#00DF82] hover:border-[#00DF82] transition-all shrink-0 self-start sm:self-auto"
            >
              <span>Semua Artikel ({articles.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {articles.slice(0, 3).map((art, idx) => {
                const coverImg =
                  art.featuredImageUrl ||
                  art.posterUrl ||
                  art.coverUrl ||
                  art.imageUrl ||
                  '/images/showcase-artikel-pertanian.jpg';

                return (
                  <Link
                    key={art.id || art.slug || idx}
                    href={getNavLinkHref(`/artikel/${art.slug}`)}
                    className="group bg-[#161616] rounded-2xl border border-white/[0.08] hover:border-[#00DF82] transition-all overflow-hidden flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,223,130,0.15)] hover:-translate-y-1"
                  >
                    {/* GAMBAR ARTIKEL DITAMPILKAN JELAS */}
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
                      <img
                        src={coverImg}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                        {art.category || art.issueCategory || 'Kebijakan Publik'}
                      </div>
                    </div>

                    {/* KONTEN ARTIKEL */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white group-hover:text-[#00DF82] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {art.excerpt || 'Telaah dan advokasi kebijakan publik untuk kesejahteraan konstituen.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-[#00DF82]" />
                          {art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#00DF82] group-hover:translate-x-1 transition-transform">
                          <span>Baca Risalah</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#161616] border border-white/[0.08] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00DF82]/10 text-[#00DF82] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Belum Ada Artikel Publikasi</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Artikel dan naskah risalah kebijakan yang Anda terbitkan melalui Studio Konten AI di dashboard akan otomatis muncul di sini.
              </p>
            </div>
          )}

      </section>

      {/* ─── SECTION 3: INFOGRAFIS (VISUALISASI DATA DENGAN GAMBAR ASLI - BUKAN DUMMY) ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading (Relevan Polaris, Bukan 'Our Services') */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00DF82]/10 border border-[#00DF82]/30 text-[#00DF82] text-xs font-bold uppercase tracking-wider mb-2">
              <span>TRANSPARANSI DATA PUBLIK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              <span className="text-white">Infografis Data </span>
              <span className="text-[#00DF82]">& Capaian Parlemen</span>
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
              Visualisasi data transparansi anggaran APBD/APBN, rekapitulasi advokasi perda, dan penyaluran program aspirasi masyarakat Daerah Pemilihan {dapil}.
            </p>
          </div>

          {infographics.length > 0 && (
            <Link
              href={getNavLinkHref('/infografis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs bg-[#181818] hover:bg-[#222222] border border-white/[0.1] text-xs font-bold text-[#00DF82] hover:border-[#00DF82] transition-all shrink-0 self-start sm:self-auto"
            >
              <span>Semua Infografis ({infographics.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Real Generated Infographics Grid with Visible Images */}
        {infographics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {infographics.slice(0, 3).map((info, idx) => {
              const infoImg =
                info.posterUrl ||
                info.imageUrl ||
                info.featuredImageUrl ||
                '/images/showcase-infografis-apbd.jpg';

              return (
                <div
                  key={info.id || idx}
                  className="group bg-[#161616] rounded-2xl border border-white/[0.08] hover:border-[#00DF82] transition-all overflow-hidden flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,223,130,0.15)] hover:-translate-y-1"
                >
                  {/* GAMBAR INFOGRAFIS LENGKAP & INTERAKTIF */}
                  <div
                    onClick={() => setActiveModalInfo(info)}
                    className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900 cursor-pointer group/img"
                  >
                    <img
                      src={infoImg}
                      alt={info.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                      <div className="w-11 h-11 rounded-full bg-[#00DF82] text-black flex items-center justify-center shadow-lg group-hover/img:scale-110 transition-transform">
                        <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">Perbesar Gambar</span>
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                      Infografis Resmi
                    </div>
                  </div>

                  {/* DETAIL KONTEN INFOGRAFIS */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white group-hover:text-[#00DF82] transition-colors line-clamp-2 leading-snug">
                        {info.title}
                      </h4>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {info.excerpt || 'Visualisasi data resmi transparansi kebijakan dan capaian legislasi dewan.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModalInfo(info)}
                      className="w-full py-2.5 rounded-lg bg-[#00DF82]/10 hover:bg-[#00DF82] text-[#00DF82] hover:text-black font-extrabold text-xs uppercase tracking-wider border border-[#00DF82]/30 hover:border-[#00DF82] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Resolusi Penuh</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#161616] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#00DF82]/10 text-[#00DF82] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Belum Ada Infografis Publikasi</h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Infografis data capaian dan transparansi anggaran yang Anda buat di Studio Konten akan ditampilkan secara visual di sini.
            </p>
          </div>
        )}

      </section>

      {/* ─── FULLSCREEN LIGHTBOX MODAL UNTUK GAMBAR INFOGRAFIS ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#181818] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/[0.15] shadow-2xl">
            <div className="px-6 py-4 bg-[#111111] flex items-center justify-between border-b border-white/[0.1]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00DF82] animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/80 flex items-center justify-center">
              <img
                src={activeModalInfo.imageUrl || activeModalInfo.posterUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                alt={activeModalInfo.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-white/[0.1]"
              />
            </div>

            <div className="p-4 sm:p-6 bg-[#161616] border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-400 max-w-md">
                {activeModalInfo.excerpt || 'Visualisasi data resmi transparansi kebijakan parlemen.'}
              </p>
              <a
                href={activeModalInfo.imageUrl || activeModalInfo.posterUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs bg-[#00DF82] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c974] transition-all cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar Resolusi Penuh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── SLEEK DARK FOOTER (RELEVAN PARLEMEN - ZERO IT) ─── */}
      <footer className="bg-[#0c0c0c] text-stone-400 py-16 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/[0.08]">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00DF82] text-black font-black flex items-center justify-center text-xs">
                  {initial}
                </div>
                <span className="text-lg font-bold text-white tracking-wider">
                  {firstName} <span className="text-[#00DF82]">{lastName || 'Parlemen'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan Parlemen</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#00DF82] transition-colors">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#00DF82] transition-colors">Profil & Rekam Jejak</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#00DF82] transition-colors">Gagasan & Artikel</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#00DF82] transition-colors">Infografis Kinerja</Link></p>
              <p><Link href={getNavLinkHref('/kontak')} className="hover:text-[#00DF82] transition-colors">Sampaikan Aspirasi</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Sekretariat Fraksi</h4>
              <p>Sekretariat Fraksi Parlemen Senayan, Jakarta Pusat</p>
              <p className="text-[#00DF82]">{officialPhone}</p>
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
