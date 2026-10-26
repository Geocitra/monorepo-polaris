'use client';

import React, { useState, useEffect } from 'react';
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
  Download,
  Share2,
  FileText,
  Building2,
  MapPin,
  ShieldCheck,
  Send,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Landmark,
  ChevronDown,
  MessageCircle,
  ExternalLink,
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

export function NayaEditorialTemplate({
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
    '/images/dewan-ahmad-fauzi-cutout.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const officialEmail = `aspirasi@${subdomain || 'polaris'}.id`;
  const officialPhone = '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'polaris.advokasi';

  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Guarantee that on initial page open, viewport locks to Section 1 full screen
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

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

  const articlesHref = getNavLinkHref('/artikel');
  const infographicsHref = getNavLinkHref('/infografis');
  const profilHref = getNavLinkHref('/profil');
  const contactHref = getNavLinkHref('/kontak');

  // Fallback high-quality curated articles if database list is empty
  const defaultArticles = [
    {
      id: 'art-1',
      slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
      title: 'Kajian Strategis Alokasi APBD 2026 untuk Pemulihan Ekonomi Kerakyatan',
      category: 'Kajian APBD',
      excerpt:
        'Analisis komprehensif mengenai formulasi dan pengawasan alokasi belanja modal daerah guna mempercepat stimulus sektor UMKM serta jaring pengaman sosial konstituen.',
      featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
      createdAt: new Date().toISOString(),
      readingTime: '4 menit baca',
    },
    {
      id: 'art-2',
      slug: 'transformasi-digital-aspirasi-parlemen',
      title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Tingkat Parlemen Daerah',
      category: 'Transformasi Digital',
      excerpt:
        'Mewujudkan transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi modern berbasis data riil dan tanggap cepat komisi.',
      featuredImageUrl: '/images/ref-article-1.jpg',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      readingTime: '5 menit baca',
    },
    {
      id: 'art-3',
      slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
      title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan (LP2B)',
      category: 'Regulasi Daerah',
      excerpt:
        'Memperkuat payung hukum perda tata ruang wilayah untuk menjamin kedaulatan pangan lokal, kepastian irigasi, dan perlindungan kesejahteraan kelompok tani daerah.',
      featuredImageUrl: '/images/default-article.jpg',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      readingTime: '6 menit baca',
    },
  ];

  // Fallback high-quality curated infographics if database list is empty
  const defaultInfographics = [
    {
      id: 'info-1',
      title: 'Transparansi Postur Realisasi APBD Sektor Pendidikan & Beasiswa',
      category: 'APBD & Anggaran',
      metric: 'Rp 45,2 M',
      metricLabel: 'Alokasi Kawalan',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      createdAt: new Date().toISOString(),
      description: 'Perincian alokasi anggaran fungsi pendidikan, bantuan operasional, dan beasiswa perguruan tinggi bagi putra-putri daerah berprestasi.',
    },
    {
      id: 'info-2',
      title: 'Peta Capaian Pembangunan Infrastruktur Konektivitas Desa',
      category: 'Infrastruktur',
      metric: '98,4%',
      metricLabel: 'Target Tuntas',
      imageUrl: '/images/showcase-poster-surya.jpg',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      description: 'Monitoring berkala perbaikan jalan poros desa, jembatan penghubung antar-kecamatan, dan drainase pengendali banjir.',
    },
    {
      id: 'info-3',
      title: 'Distribusi Bantuan Sarana Alsintan & Pupuk Bersubsidi Petani',
      category: 'Pertanian & Pangan',
      metric: '1.420+',
      metricLabel: 'Kelompok Tani',
      imageUrl: '/images/article-crop-2.png',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      description: 'Penyaluran traktor roda dua, pompa air sawah tadah hujan, dan alokasi pupuk bersubsidi tepat sasaran di seluruh pelosok dapil.',
    },
    {
      id: 'info-4',
      title: 'Kanal Layanan Aspirasi & Advokasi Hak Konstituen 24/7',
      category: 'Pelayanan Publik',
      metric: '24/7',
      metricLabel: 'Respon Cepat',
      imageUrl: '/images/parliament-panoramic-banner.png',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      description: 'Rekapitulasi berkala tindak lanjut aspirasi warga melalui rapat dengar pendapat umum (RDPU) dan advokasi lintas komisi kedewanan.',
    },
  ];

  const articles =
    recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles;
  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics
      : defaultInfographics;

  const getArticleImage = (art: any): string => {
    return (
      art?.featuredImageUrl ||
      art?.coverUrl ||
      art?.imageUrl ||
      art?.posterUrl ||
      art?.coverImageUrl ||
      art?.thumbnailUrl ||
      '/images/showcase-artikel-pertanian.jpg'
    );
  };

  const getInfographicImage = (info: any): string => {
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.featuredImageUrl ||
      info?.coverUrl ||
      info?.coverImageUrl ||
      info?.thumbnailUrl ||
      info?.fileUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  const handleShare = (info: any) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#24271D] font-sans selection:bg-[#35382B] selection:text-white antialiased overflow-x-hidden">

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (FULL 100VH / 100DVH ON INITIAL LOAD)
          Guaranteed Full Screen on Desktop & First Viewport: h-screen h-[100dvh]
          Layout matches reference:
          - Top: Clean boutique navbar (NAYA+ DIGITAL aesthetic adapted for POLARIS)
          - Left: Badge pill + Cormorant Serif Headline ("Strategi Nyata Mengawal Amanah Rakyat.")
                  + Subtitle + Action Buttons + 4 Metrics Row
          - Right: High-end Arch Portrait Frame + Floating Dark Badge ("Advokasi dengan Hati")
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="w-full min-h-screen min-h-[100dvh] lg:h-screen lg:max-h-[100dvh] flex flex-col justify-between select-none relative bg-[#F7F5EE] border-b border-[#E7E2D6] overflow-hidden"
      >
        {/* Subtle background ambient warmth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EFECE1] rounded-full blur-[140px] pointer-events-none -z-0 opacity-70" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EFECE1] rounded-full blur-[120px] pointer-events-none -z-0 opacity-60" />

        {/* 1. TOP NAVBAR (MATCHES EXACT NAYA+ DIGITAL CLEAN HEADER) */}
        <header className="relative z-30 w-full px-6 sm:px-10 lg:px-16 pt-5 pb-4 max-w-[1520px] mx-auto flex items-center justify-between shrink-0">
          {/* Logo brand: POLARIS+ with sub-label ADVOKASI */}
          <Link href={getNavLinkHref('/')} className="flex flex-col group select-none">
            <div className="flex items-start gap-0.5">
              <span className="font-outfit font-black text-xl sm:text-2xl tracking-[0.14em] text-[#24271D] uppercase">
                {theme?.portalTitle || 'POLARIS'}
              </span>
              <span className="text-[#4E5340] font-black text-sm leading-none mt-0.5 group-hover:rotate-45 transition-transform duration-300">
                ✦
              </span>
            </div>
            <span className="text-[9px] tracking-[0.3em] font-semibold text-[#76796A] uppercase -mt-0.5">
              ADVOKASI PUBLIK
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[#5B5F4E]">
            <a href="#hero" className="text-[#24271D] font-semibold transition-colors">
              Beranda
            </a>
            <Link href={profilHref} className="hover:text-[#24271D] transition-colors">
              Profil Dewan
            </Link>
            <a href="#articles" className="hover:text-[#24271D] transition-colors">
              Artikel &amp; Risalah
            </a>
            <a href="#infographics" className="hover:text-[#24271D] transition-colors">
              Infografis Data
            </a>
            <a href="#aspirasi" className="hover:text-[#24271D] transition-colors">
              Sinergi Aspirasi
            </a>
            <Link href={contactHref} className="hover:text-[#24271D] transition-colors">
              Kontak
            </Link>
          </nav>

          {/* Header Right CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#aspirasi"
              className="px-6 py-2.5 rounded-full bg-[#272A20] text-white text-xs font-semibold hover:bg-[#3C4130] transition-all duration-200 inline-flex items-center gap-2 shadow-sm group cursor-pointer"
            >
              <span>Sampaikan Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#24271D] hover:bg-[#EAE6DA] rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[72px] inset-x-4 bg-white/95 backdrop-blur-xl border border-[#E5E0D5] p-6 rounded-2xl shadow-xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#24271D] py-2 border-b border-[#F0ECE1]"
            >
              Beranda
            </a>
            <Link
              href={profilHref}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#5B5F4E] py-2 border-b border-[#F0ECE1]"
            >
              Profil Dewan
            </Link>
            <a
              href="#articles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#5B5F4E] py-2 border-b border-[#F0ECE1]"
            >
              Artikel &amp; Risalah
            </a>
            <a
              href="#infographics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#5B5F4E] py-2 border-b border-[#F0ECE1]"
            >
              Infografis Data
            </a>
            <a
              href="#aspirasi"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#5B5F4E] py-2 border-b border-[#F0ECE1]"
            >
              Sinergi Aspirasi
            </a>
            <Link
              href={contactHref}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#5B5F4E] py-2 border-b border-[#F0ECE1]"
            >
              Kontak
            </Link>
            <a
              href="#aspirasi"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center py-3 rounded-full bg-[#272A20] text-white text-xs font-bold"
            >
              Sampaikan Aspirasi ➔
            </a>
          </div>
        )}

        {/* 2. CENTER HERO BODY: 2-COLUMN SPLIT (TYPOGRAPHY & ARCH PORTRAIT) */}
        <div className="relative z-20 flex-1 flex items-center px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto w-full my-auto py-4 sm:py-6 lg:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

            {/* LEFT COLUMN: BADGE + CORMORANT SERIF HEADLINE + BUTTONS + STATS */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              {/* Category Pill Tag (Exact match reference pill: Digital Marketing & Brand Strategy v) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-[11.5px] sm:text-xs font-medium w-fit mb-4 sm:mb-5 shadow-2xs">
                <span>Advokasi Kebijakan &amp; Aspirasi Rakyat</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7E8271]" />
              </div>

              {/* Giant Serif Headline (Exact font & italic match: Strategy that Builds Brands.) */}
              <h1 className="font-cormorant text-4xl sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[80px] font-normal tracking-[-0.03em] text-[#24271D] leading-[1.05]">
                Strategi Nyata Mengawal <br />
                <span className="italic font-normal text-[#383C2D]">Amanah Rakyat.</span>
              </h1>

              {/* Subtitle paragraph */}
              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#6E7162] max-w-xl font-normal leading-[1.65]">
                Berkomitmen memperjuangkan regulasi pro-rakyat, transparansi alokasi anggaran APBD,
                dan mengawal program pembangunan yang berkeadilan di <strong>Daerah Pemilihan {dapil}</strong>.
              </p>

              {/* CTA Action Buttons Row (Exact match dark pill button + text link) */}
              <div className="mt-6 sm:mt-8 flex items-center gap-5 flex-wrap">
                <a
                  href="#aspirasi"
                  className="px-7 py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold hover:brightness-110 transition-all duration-200 inline-flex items-center gap-2 shadow-sm group cursor-pointer"
                  style={{ backgroundColor: theme?.primaryHexColor || '#272A20' }}
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#articles"
                  className="text-xs sm:text-sm font-semibold text-[#272A20] hover:text-[#4F5441] inline-flex items-center gap-1.5 transition-colors group cursor-pointer"
                >
                  <span>Lihat Kinerja Dewan</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* 4 Bottom Stats Row (Exact match 4 horizontal metrics row in reference) */}
              <div className="mt-8 sm:mt-10 pt-6 border-t border-[#DFDACB] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#EAE6D8] text-[#4E5340] shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] leading-none">
                      6+
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#737666] font-medium mt-1">
                      Tahun Pengabdian
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#EAE6D8] text-[#4E5340] shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] leading-none">
                      120+
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#737666] font-medium mt-1">
                      Aspirasi Terwujud
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#EAE6D8] text-[#4E5340] shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] leading-none">
                      98%
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#737666] font-medium mt-1">
                      Kehadiran Sidang
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#EAE6D8] text-[#4E5340] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] leading-none">
                      Rp 45M+
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#737666] font-medium mt-1">
                      Alokasi Kawalan
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: ARCH PORTRAIT FRAME + FLOATING DARK OLIVE BADGE */}
            <div className="lg:col-span-5 flex items-center justify-center relative pb-6 lg:pb-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px]">
                
                {/* 1. Arch Portrait Frame (Rounded top arch with soft egg/pill geometry) */}
                <div className="w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[500px] rounded-t-full rounded-b-[40px] overflow-hidden bg-[#E7E2D6] border border-[#D5D0C2] relative shadow-lg">
                  <img
                    src={photoUrl}
                    alt={officialFullName}
                    className="w-full h-full object-cover object-top filter contrast-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                    }}
                  />
                  {/* Soft bottom vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#25281E]/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* 2. Floating Dark Olive Card (Exact match lower-right badge in reference image) */}
                <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#35382B] text-white p-4 sm:p-5 rounded-[22px] sm:rounded-[24px] shadow-2xl max-w-[210px] sm:max-w-[230px] border border-white/10 z-20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-[#BFC3B2] uppercase tracking-wider">
                      Dedikasi Nyata
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D7DDCA]" />
                  </div>
                  <p className="font-cormorant italic text-base sm:text-[17px] text-white/95 leading-tight">
                    Advokasi dengan Hati.
                  </p>
                  <p className="font-cormorant font-bold text-lg sm:text-[19px] text-white leading-tight mt-0.5">
                    Hasil Nyata untuk Daerah.
                  </p>
                </div>

                {/* 3. Small delicate decorative leaf/star illustration accent */}
                <div className="hidden sm:block absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#EAE6D9] border border-[#D8D3C4] flex items-center justify-center text-[#555A47] text-xs font-serif shadow-xs">
                  ✦
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* 3. BOTTOM FOOTNOTE STRIP OF SECTION 1 (COMMISSION & PARLIAMENT AFFILIATION) */}
        <div className="relative z-30 w-full bg-[#ECE7DC]/90 backdrop-blur-sm py-2.5 px-6 sm:px-10 lg:px-16 border-t border-[#DFDACB] shrink-0">
          <div className="max-w-[1520px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B6E60]">
            <div className="flex items-center gap-2 font-medium">
              <Landmark className="w-3.5 h-3.5 text-[#4E5340]" />
              <span>{legislativeLevel} • {party}</span>
            </div>
            <div className="flex items-center gap-6 font-medium text-[11.5px] sm:text-xs">
              <span className="hidden sm:inline text-[#7A7E70]">{commissionName}</span>
              <span className="text-[#35382B] font-semibold">Dapil: {dapil}</span>
            </div>
          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: ARTIKEL (KAJIAN & RISALAH KEBIJAKAN DEWAN)
          Header: "Rancangan Regulasi & Kajian Kebijakan." in Cormorant Serif
          Cards: 3 Distinctive Editorial Cards with Images, Tags, Metadata & Arrow Button
          (Exact match 3-column packages/cards layout from reference)
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="articles"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto relative select-none"
      >
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl select-text">
            <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider block mb-2.5">
              Kajian Kebijakan &amp; Risalah Parlemen
            </span>
            <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal text-[#24271D] leading-[1.08] tracking-tight">
              Rancangan Regulasi &amp; <span className="italic font-normal text-[#3E4233]">Kajian Kebijakan.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6F7263] leading-relaxed font-normal">
              Telaah kritis rancangan peraturan daerah, analisis efisiensi alokasi APBD, dan gagasan
              kebijakan publik yang dirumuskan untuk menjamin keadilan serta kesejahteraan konstituen.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={articlesHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#272A20] text-white text-xs sm:text-sm font-semibold hover:bg-[#3D4231] transition-all shadow-sm group"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3 High-End Article Cards Grid (Displaying prominent article images!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 sm:gap-8">
          {articles.slice(0, 3).map((art, idx) => {
            const img = getArticleImage(art);
            const title = art?.title || `Kajian Risalah Kebijakan Parlemen #${idx + 1}`;
            const excerpt =
              art?.excerpt ||
              art?.summary ||
              'Analisis komprehensif mengenai formulasi kebijakan anggaran dan pemenuhan hak-hak pelayanan masyarakat daerah.';
            const category = art?.category || art?.categoryName || 'Kajian Kebijakan';
            const dateStr = formatDateIndonesian(art?.createdAt || new Date());
            const detailHref = getNavLinkHref(`/artikel/${art?.slug || idx + 1}`);

            return (
              <Link
                key={art?.id || idx}
                href={detailHref}
                className="group flex flex-col justify-between bg-white rounded-[28px] sm:rounded-[32px] border border-[#E5E0D5] overflow-hidden hover:border-[#CCD1BF] hover:shadow-xl transition-all duration-300 select-text"
              >
                {/* 1. Article Image Container with Badge */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-[#ECE8DF]">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                    }}
                  />
                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-[#272A20] shadow-sm">
                    {category}
                  </div>
                </div>

                {/* 2. Article Body Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date & Reading time */}
                    <div className="flex items-center gap-2 text-xs text-[#7A7E6E] font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art?.readingTime || '5 menit baca'}</span>
                    </div>

                    {/* Headline in Cormorant Serif */}
                    <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#24271D] group-hover:text-[#4A4E3B] transition-colors leading-snug line-clamp-2">
                      {title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-3 text-xs sm:text-sm text-[#6A6D5F] leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>

                  {/* 3. Card Footer with Author and Round Arrow Button */}
                  <div className="mt-6 pt-5 border-t border-[#F0ECE1] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#EAE6D9] overflow-hidden border border-[#DCD7CA]">
                        <img
                          src={photoUrl}
                          alt={officialFullName}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#35382B] truncate max-w-[140px]">
                        {firstName}
                      </span>
                    </div>

                    {/* Round Arrow Button (Matching the round button in screenshot packages) */}
                    <div className="w-8 h-8 rounded-full bg-[#35382B] text-white flex items-center justify-center group-hover:bg-[#4E5340] group-hover:scale-105 transition-all shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: INFOGRAFIS (TRANSPARANSI DATA & KINERJA KEBIJAKAN)
          Background: Obsidian Charcoal Noir #181B15 (Exact match Real Campaigns section)
          Cards: 4 High-Impact Cards with Infographic Images + Overlaid Big Metrics
          (247% Increase, 312K+ Followers style in reference)
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="infographics"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#181B15] text-white select-none relative"
      >
        <div className="max-w-[1520px] mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl select-text">
              <span className="text-xs font-semibold text-[#A2A796] uppercase tracking-wider block mb-2.5">
                Transparansi Publik &amp; Kinerja Data
              </span>
              <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal text-white leading-[1.08] tracking-tight">
                Data Fakta Parlemen. <span className="italic font-normal text-[#C4C9B8]">Transparansi Nyata.</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#9FA493] leading-relaxed font-normal">
                Visualisasi berbasis data mengenai pengawasan alokasi APBD, capaian pembangunan daerah pemilihan,
                dan akuntabilitas advokasi aspirasi masyarakat secara terbuka.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href={infographicsHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#181B15] text-xs sm:text-sm font-bold hover:bg-[#EFECE2] transition-all shadow-md group"
              >
                <span>Lihat Seluruh Infografis</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 4 Infographic Photo Cards Grid (Displaying prominent infographic images!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {infographics.slice(0, 4).map((info, idx) => {
              const img = getInfographicImage(info);
              const title = info?.title || `Infografis Transparansi Kebijakan #${idx + 1}`;
              const metric = info?.metric || (idx === 0 ? 'Rp 45,2 M' : idx === 1 ? '98,4%' : idx === 2 ? '1.420+' : '24/7');
              const metricLabel = info?.metricLabel || (idx === 0 ? 'Alokasi Terkawal' : idx === 1 ? 'Target Tuntas' : idx === 2 ? 'Penerima Manfaat' : 'Respon Cepat');
              const category = info?.category || info?.categoryName || 'Transparansi Data';

              return (
                <div
                  key={info?.id || idx}
                  onClick={() => setActiveModalInfo(info)}
                  className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#242820] border border-white/10 hover:border-white/30 transition-all duration-300 aspect-[3/4] sm:aspect-[4/5] flex flex-col justify-between p-5 sm:p-6 cursor-pointer shadow-lg"
                >
                  {/* Background Infographic Image with subtle atmospheric overlay */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-75 filter contrast-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141712] via-[#141712]/60 to-transparent" />
                  </div>

                  {/* Card Top: Category badge & zoom button */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10">
                      {category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card Bottom: Big Metric & Title (Exact match reference Real Impact cards) */}
                  <div className="relative z-10 select-text">
                    <div className="font-cormorant text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-1">
                      {metric}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-[#AAB09D] uppercase tracking-wider mb-2">
                      {metricLabel}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-white/90 line-clamp-2 leading-snug">
                      {title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          COLLABORATION / ASPIRATION BANNER
          (Exact match "Let's Build Something Meaningful Together." olive banner in reference)
          Warm Olive Green Background #4E5340 with rounded container, circular portrait,
          inspirational message and direct contact/aspiration button
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="aspirasi" className="py-16 sm:py-24 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto select-none">
        <div className="rounded-[32px] sm:rounded-[44px] bg-[#4E5340] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          
          {/* Subtle background plant/leaf watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-serif">
            ✦
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left: Circular portrait cutout frame */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-[#616751]">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                  }}
                />
              </div>
            </div>

            {/* Center: Inspirational message */}
            <div className="lg:col-span-6 select-text text-center lg:text-left">
              <h3 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-snug">
                Mari Bersinergi Membangun <br />
                <span className="italic font-normal text-[#E0E5D4]">Daerah Lebih Berkeadilan.</span>
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
                Aspirasi, masukan, dan evaluasi Anda adalah kompas perjuangan kami di parlemen.
                Sampaikan gagasan atau laporkan kebutuhan pembangunan di lingkungan Anda secara langsung.
              </p>
            </div>

            {/* Right: Direct CTA action */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3">
              <Link
                href={contactHref}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#272A20] text-xs sm:text-sm font-bold hover:bg-[#F2EFE8] transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
              >
                <span>Kirim Pesan Aspirasi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[11px] text-white/70">
                Respon cepat melalui Posko Reses
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOTER (EXACT MATCH REFERENCE DARK FOOTER)
          Background: Obsidian Noir #131510
          Contains Brand with Star +, Quick Links, Komisi & Dapil, Socials,
          and Circular Spinning Seal Stamp ("• POLARIS ADVOKASI • ASPIRASI RAKYAT •")
          ────────────────────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#131510] text-[#9EA392] pt-16 pb-10 px-6 sm:px-10 lg:px-16 border-t border-white/10 select-none">
        <div className="max-w-[1520px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            
            {/* Column 1: Brand & Bio */}
            <div className="lg:col-span-4 select-text">
              <div className="flex items-start gap-1">
                <span className="font-outfit font-black text-2xl tracking-[0.14em] text-white uppercase">
                  {theme?.portalTitle || 'POLARIS'}
                </span>
                <span className="text-[#848B72] font-black text-base leading-none mt-0.5">
                  ✦
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-[#7D8271] uppercase block mt-0.5">
                ADVOKASI PUBLIK &amp; PARLEMEN
              </span>
              <p className="mt-4 text-xs sm:text-[13px] text-[#8C9180] leading-relaxed max-w-sm">
                Portal resmi publikasi kinerja, pemikiran kebijakan, transparansi alokasi anggaran,
                dan kanal aspirasi dua arah bersama <strong>{officialFullName}</strong>.
              </p>
              
              {/* Social icons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="Instagram dewan"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${officialEmail}`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="Email resmi aspirasi"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/6281234567890`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="WhatsApp Posko Reses"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2.5 text-xs text-[#8C9180]">
                <li>
                  <a href="#hero" className="hover:text-white transition-colors">
                    Beranda Utama
                  </a>
                </li>
                <li>
                  <Link href={profilHref} className="hover:text-white transition-colors">
                    Profil &amp; Rekam Jejak
                  </Link>
                </li>
                <li>
                  <a href="#articles" className="hover:text-white transition-colors">
                    Artikel &amp; Risalah
                  </a>
                </li>
                <li>
                  <a href="#infographics" className="hover:text-white transition-colors">
                    Infografis Data APBD
                  </a>
                </li>
                <li>
                  <Link href={contactHref} className="hover:text-white transition-colors">
                    Posko Aspirasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Parlemen & Wilayah Kerja */}
            <div className="lg:col-span-3 select-text">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Lembaga &amp; Wilayah Tugas
              </h4>
              <ul className="space-y-2 text-xs text-[#8C9180]">
                <li>
                  <span className="text-white/60 block text-[11px]">Tingkat Lembaga:</span>
                  <span className="text-white font-medium">{legislativeLevel}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Fraksi Partai:</span>
                  <span className="text-white font-medium">{party}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Alat Kelengkapan Dewan:</span>
                  <span className="text-white font-medium">{commissionName}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Daerah Pemilihan:</span>
                  <span className="text-white font-medium">{dapil}</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Circular Rotating Stamp (Exact match circular seal in reference) */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Curved Circular Text */}
                <svg
                  className="w-full h-full animate-[spin_24s_linear_infinite]"
                  viewBox="0 0 160 160"
                >
                  <path
                    id="nayaSealPath"
                    d="M 80, 80 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
                    fill="none"
                  />
                  <text className="text-[10px] uppercase font-bold tracking-[0.24em] fill-[#848B72]">
                    <textPath href="#nayaSealPath" startOffset="0%">
                      • POLARIS ADVOKASI • SUARA RAKYAT • DEDIKASI NYATA •
                    </textPath>
                  </text>
                </svg>

                {/* Center Star Emblem */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6 text-[#AAB09D]" />
                </div>
              </div>
              <span className="text-[11px] text-[#7A7F6E] mt-3 font-medium">
                Akuntabilitas Publik Terverifikasi
              </span>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737867]">
            <p>
              © {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Ditenagai oleh platform</span>
              <strong className="text-white/80 font-bold">POLARIS</strong>
            </p>
          </div>

        </div>
      </footer>

      {/* ──────────────────────────────────────────────────────────────────────────
          INTERACTIVE MODAL FOR INFOGRAPHIC ZOOM PREVIEW
          ────────────────────────────────────────────────────────────────────────── */}
      {activeModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="bg-[#1C2018] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#A2A796] uppercase tracking-wider block">
                  {activeModalInfo?.category || 'Infografis Kebijakan'}
                </span>
                <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeModalInfo?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#131610] flex items-center justify-center">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo?.title}
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#181C14]">
              <p className="text-xs sm:text-sm text-[#9FA493] max-w-xl">
                {activeModalInfo?.description ||
                  'Publikasi data transparansi resmi parlemen untuk keterbukaan informasi publik.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShare(activeModalInfo)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan'}</span>
                </button>
                <a
                  href={getInfographicImage(activeModalInfo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2 rounded-full bg-white text-[#181B15] hover:bg-[#EFECE2] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
