'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Menu,
  X,
  Maximize2,
  Eye,
  Download,
  FileText,
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

export function CreativeWarmTemplate({
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
    '/images/dewan-standing-full.png';
  const headline =
    theme?.headlineTagline ||
    'Menjembatani harapan masyarakat menuju kebijakan publik yang berkeadilan dan bermartabat.';
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

  // Strictly use real generated articles and infographics from the user's account (NO dummy data fallback)
  const articles = Array.isArray(recentArticles) ? recentArticles : [];
  const infographics = Array.isArray(recentInfographics) ? recentInfographics : [];

  const initial = member?.fullName ? member.fullName.charAt(0).toUpperCase() : 'P';
  const shortName = member?.fullName ? member.fullName.split(',')[0] : 'Wakil Rakyat';

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden">
      
      {/* ─── 1. TOP NAVBAR (WARM PARLIAMENTARY BRANDING) ─── */}
      <header className="border-b border-stone-200/80 bg-[#FBFBFA]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between relative">
          
          {/* Brand: [Initial Circle] Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 sm:gap-3 select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-stone-900 font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform shrink-0">
              {initial}
            </div>
            <span className="font-serif font-black text-sm sm:text-base lg:text-lg tracking-tight text-stone-900 truncate max-w-[160px] sm:max-w-none group-hover:text-amber-700 transition-colors">
              {officialFullName}
            </span>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold tracking-wide text-stone-600 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="text-stone-900 font-bold border-b-[2px] border-amber-500 pb-0.5 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className="text-stone-600 hover:text-stone-900 border-b-[2px] border-transparent hover:border-amber-400 pb-0.5 transition-all"
            >
              Profil
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-stone-600 hover:text-stone-900 border-b-[2px] border-transparent hover:border-amber-400 pb-0.5 transition-all"
            >
              Artikel
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-stone-600 hover:text-stone-900 border-b-[2px] border-transparent hover:border-amber-400 pb-0.5 transition-all"
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className="text-stone-600 hover:text-stone-900 border-b-[2px] border-transparent hover:border-amber-400 pb-0.5 transition-all"
            >
              Kontak
            </Link>
          </nav>

          {/* Right: Instagram Pill Button + Mobile Hamburger */}
          <div className="ml-auto flex items-center gap-2.5">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-[#FBFBFA]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
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
                  className="px-3 py-2 rounded-lg text-stone-800 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-stone-200">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-stone-800 hover:bg-stone-200/50 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#C13584]" />
                  <span>Instagram @{instagramUsername}</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ─── 2. SECTION 1: HERO PARLEMEN (IKONIK SUN DISC & GROUNDED PORTRAIT) ─── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-0 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Left Column: Greeting, Headline, & Action Buttons */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left self-center py-4 translate-y-0 lg:-translate-y-8 order-1">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-stone-800 text-stone-800 text-xs font-mono font-bold tracking-wider">
                <span>[ Amanah Wakil Rakyat • {party} ]</span>
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-serif font-black text-stone-900 tracking-tight leading-[1.1] break-words">
                Saya <span className="text-amber-600 underline decoration-amber-400 decoration-wavy decoration-2">{shortName}</span>,
                <span className="block text-xl sm:text-3xl font-sans font-bold text-stone-700 mt-2">
                  Wakil Rakyat Daerah Pemilihan {dapil}.
                </span>
              </h1>

              <p className="text-xs sm:text-base text-stone-600 leading-relaxed font-normal max-w-lg">
                {headline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Sampaikan Aspirasi</span>
                </Link>

                <Link
                  href={getNavLinkHref('/profil')}
                  className="px-6 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Profil &amp; Rekam Jejak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* Right Column: Grounded Warm Portrait with Amber Sun Disc */}
            <div className="lg:col-span-6 flex justify-center items-end relative order-2">
              <div className="relative w-[270px] xs:w-[320px] sm:w-[400px] lg:w-[470px] h-[360px] xs:h-[420px] sm:h-[480px] lg:h-[550px] flex items-end justify-center -mb-[2px] max-w-full">
                
                {/* 1. Ambient warm radial aura for glowing depth */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-80"
                  style={{
                    background: 'radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.10) 50%, transparent 72%)',
                    filter: 'blur(36px)',
                  }}
                />

                {/* 2. Warm geometric sun disc (centered behind head and shoulders) */}
                <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[230px] xs:w-[270px] sm:w-[340px] lg:w-[390px] aspect-square rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 shadow-2xl shadow-amber-500/20 pointer-events-none" />

                {/* 3. Official Portrait, firmly grounded on the ticker baseline */}
                <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-full object-contain object-bottom filter contrast-[1.02] drop-shadow-2xl select-none block"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ─── VIBRANT AMBER MARQUEE TICKER (BASELINE GROUND) ─── */}
        <div className="relative z-20 bg-amber-500 py-3 sm:py-3.5 border-y-2 border-stone-900 overflow-hidden text-stone-950 font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest select-none">
          <div className="flex items-center gap-6 sm:gap-8 justify-around whitespace-nowrap overflow-x-auto no-scrollbar">
            <span>❋ TRANSPARANSI KEBIJAKAN</span>
            <span>❋ PENGAWALAN ANGGARAN</span>
            <span>❋ KUNJUNGAN DAPIL {dapil.toUpperCase()}</span>
            <span>❋ ADVOKASI PERUNDANG-UNDANGAN</span>
            <span>❋ SERAPAN ASPIRASI WARGA</span>
            <span>❋ AKUNTABILITAS PUBLIK 100%</span>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION 2: ARTIKEL (KAJIAN KEBIJAKAN DENGAN GAMBAR ASLI) ─── */}
      <section id="articles" className="py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">
                — GAGASAN &amp; PUBLIKASI RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-stone-900 mt-1">
                Kajian Kebijakan &amp; Risalah Parlemen
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                Publikasi naskah analisis regulasi, pemikiran kebijakan publik, dan advokasi kenegaraan resmi.
              </p>
            </div>
            
            {articles.length > 0 && (
              <Link
                href={getNavLinkHref('/artikel')}
                className="px-4 py-2 rounded-full border border-stone-800 text-stone-900 font-bold text-xs hover:bg-stone-900 hover:text-white transition-all inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Lihat Semua Kajian ({articles.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {articles.slice(0, 3).map((art) => {
                const coverImg =
                  art.featuredImageUrl ||
                  art.posterUrl ||
                  art.coverUrl ||
                  art.imageUrl ||
                  '/images/showcase-artikel-pertanian.jpg';

                return (
                  <Link
                    key={art.id || art.slug}
                    href={getNavLinkHref(`/artikel/${art.slug}`)}
                    className="group rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500/80 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/60"
                  >
                    <div className="space-y-4">
                      {/* GAMBAR ARTIKEL ASLI */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                        <img
                          src={coverImg}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          {art.issueCategory || art.category || 'Kebijakan Publik'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}
                        </span>
                        <span className="text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {art.readingTimeMinutes || 4} mnt baca
                        </span>
                      </div>

                      <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-normal">
                        {art.excerpt || art.leadParagraph || art.summary || 'Telaah komprehensif mengenai perumusan regulasi dan keberpihakan parlemen bagi masyarakat.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                      <span>Pelajari Naskah Risalah</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 px-4 bg-white border border-dashed border-stone-300 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-800">Belum Ada Artikel Publikasi</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Artikel dan naskah risalah kebijakan yang Anda terbitkan melalui Studio Konten AI di dashboard akan otomatis muncul di sini.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ─── 4. SECTION 3: INFOGRAFIS (VISUALISASI DATA DENGAN GAMBAR ASLI) ─── */}
      <section id="infografis" className="py-16 sm:py-24 bg-[#F5F5F0] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-300/80 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block font-mono">
                — TRANSPARANSI DATA PUBLIK
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-stone-900 mt-1">
                Infografis Data &amp; Capaian Parlemen
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                Visualisasi data transparansi anggaran APBD/APBN, rekapitulasi advokasi perda, dan capaian program aspirasi masyarakat Dapil {dapil}.
              </p>
            </div>

            {infographics.length > 0 && (
              <Link
                href={getNavLinkHref('/infografis')}
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Lihat Semua Infografis ({infographics.length})</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {infographics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {infographics.slice(0, 3).map((info, idx) => {
                const infoImg =
                  info.posterUrl ||
                  info.imageUrl ||
                  info.featuredImageUrl ||
                  '/images/showcase-infografis-apbd.jpg';

                return (
                  <div
                    key={info.id || idx}
                    className="group rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
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
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4">
                        <div className="w-11 h-11 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg group-hover/img:scale-110 transition-transform">
                          <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-white">Perbesar Gambar</span>
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur border border-white/10 text-[10px] font-black uppercase tracking-wider text-amber-300">
                        {info.category || 'Infografis Resmi'}
                      </div>
                    </div>

                    {/* DETAIL KONTEN INFOGRAFIS */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                          {info.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {info.excerpt || 'Visualisasi data resmi transparansi kebijakan dan capaian legislasi dewan.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModalInfo(info)}
                        className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-stone-900 font-extrabold text-xs uppercase tracking-wider border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-800" />
                        <span>Lihat Resolusi Penuh</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 px-4 bg-white border border-dashed border-stone-300 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-800">Belum Ada Infografis Publikasi</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Infografis data capaian dan transparansi anggaran yang Anda buat di Studio Konten akan ditampilkan secara visual di sini.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ─── FULLSCREEN LIGHTBOX MODAL UNTUK GAMBAR INFOGRAFIS ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-stone-300 shadow-2xl">
            <div className="px-6 py-4 bg-stone-100 flex items-center justify-between border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950 flex items-center justify-center">
              <img
                src={activeModalInfo.posterUrl || activeModalInfo.imageUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                alt={activeModalInfo.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-stone-800"
              />
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-600 max-w-md">
                {activeModalInfo.excerpt || 'Visualisasi data resmi transparansi kebijakan dan capaian legislasi dewan.'}
              </p>
              <a
                href={activeModalInfo.posterUrl || activeModalInfo.imageUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar Resolusi Penuh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. FOOTER RESMI PARLEMEN (HANGAT & BERWIBAWA - ZERO IT) ─── */}
      <footer id="contact" className="py-16 bg-[#F3F3EF] border-t border-stone-200 text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase text-amber-700 font-bold tracking-widest">
              — SALURKAN ASPIRASI
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              Satu Suara Anda Berharga Bagi Kami
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Kirimkan pengaduan sarana daerah, masukan perundang-undangan, atau permohonan audiensi konstituen langsung melalui saluran resmi parlemen.
            </p>
            <div className="pt-2">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <span>Buka Formulir Pengaduan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-stone-300/80 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-stone-900 block font-serif">Kantor Aspirasi Rakyat</span>
              <p>Gedung Nusantara I DPR RI, Senayan, Jakarta Pusat 10270</p>
              <p className="text-stone-500">Daerah Pemilihan {dapil}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-stone-900 block font-serif">Layanan Cepat Konstituen</span>
              <p>Email: {officialEmail}</p>
              <p>WhatsApp: {officialPhone}</p>
            </div>

            <div className="space-y-1 md:text-right">
              <span className="font-bold text-stone-900 block font-serif">Hak Cipta &amp; Integritas</span>
              <p>&copy; {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi.</p>
              <p className="text-stone-500">Didukung oleh POLARIS Parlemen Engine.</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
