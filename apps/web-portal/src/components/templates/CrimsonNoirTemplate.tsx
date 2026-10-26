'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  Wallet,
  Megaphone,
  Users,
  Headphones,
  ShieldCheck,
  Landmark,
  Flag,
  MapPin,
  Building2,
  FileText,
  Eye,
  Download,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import {
  CrimsonNoirShell,
  CrimsonLabel,
  CrimsonButton,
  CrimsonPortrait,
} from './crimson-noir/CrimsonNoirShell';
import {
  getCrimsonMemberInfo,
  useCrimsonHref,
  articleImage,
  articleCategory,
  articleExcerpt,
  CRIMSON_DEFAULT_ARTICLES,
  CRIMSON_DEFAULT_INFOGRAPHICS,
} from './crimson-noir/utils';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export const CRIMSON_FOCUS_AREAS = [
  {
    icon: Scale,
    title: 'Legislasi Daerah',
    desc: 'Merumuskan dan mengawal peraturan daerah yang berpihak pada rakyat, adil, dan mudah diterapkan.',
  },
  {
    icon: Wallet,
    title: 'Pengawasan Anggaran',
    desc: 'Mengawasi setiap rupiah APBD agar tepat sasaran, transparan, dan bebas dari penyimpangan.',
  },
  {
    icon: Megaphone,
    title: 'Advokasi Aspirasi',
    desc: 'Memperjuangkan suara konstituen di rapat komisi, RDPU, hingga pembahasan badan anggaran.',
  },
  {
    icon: Users,
    title: 'Pemberdayaan Warga',
    desc: 'Mendorong program UMKM, pertanian, dan pendidikan yang meningkatkan kesejahteraan keluarga.',
  },
  {
    icon: Headphones,
    title: 'Respon Cepat',
    desc: 'Posko aspirasi dan kanal digital yang siap menindaklanjuti laporan warga dalam waktu singkat.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparansi Publik',
    desc: 'Publikasi kinerja, risalah rapat, dan data capaian secara terbuka sebagai wujud akuntabilitas.',
  },
];

export function CrimsonNoirTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  subdomain,
}: TemplateProps) {
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const href = useCrimsonHref(subdomain);

  const articles = (recentArticles.length > 0 ? recentArticles : CRIMSON_DEFAULT_ARTICLES).slice(0, 3);
  const infographics = (recentInfographics.length > 0 ? recentInfographics : CRIMSON_DEFAULT_INFOGRAPHICS).slice(0, 3);

  const chips = [
    { icon: Landmark, label: info.legislativeLevel },
    { icon: Flag, label: info.party },
    { icon: MapPin, label: info.dapil },
    { icon: Building2, label: info.commissionName.split('(')[0].trim() },
    { icon: FileText, label: 'Legislasi' },
    { icon: Eye, label: 'Pengawasan' },
  ];

  return (
    <CrimsonNoirShell member={member} theme={theme} subdomain={subdomain} activePage="beranda" showMasthead={false}>
      {/* ─── 1. HERO (FULL VIEWPORT / FIRST FOLD) ─── */}
      <section className="relative bg-[#0B0B0B] overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center py-10 lg:py-0">
        <div
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[150px] pointer-events-none opacity-25"
          style={{ backgroundColor: info.primaryColor }}
        />
        <div className="relative w-full max-w-[1140px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="md:col-span-7 order-2 md:order-1 animate-in fade-in slide-in-from-left-6 duration-700 flex flex-col justify-center">
            <p className="font-bold text-sm sm:text-base tracking-wide" style={{ color: info.primaryColor }}>
              Halo, Saya Adalah
            </p>
            <h1 className="mt-2 font-outfit font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.08]">
              {info.officialFullName}
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-white/65 max-w-lg leading-relaxed">
              – Wakil rakyat {info.legislativeLevel} dari {info.party}, berdedikasi mengawal aspirasi warga {info.dapil}{' '}
              menuju kebijakan yang adil, transparan, dan berdampak nyata.
            </p>
            <div className="mt-6">
              <CrimsonButton href={href('/kontak')} color={info.primaryColor}>
                Hubungi Saya
              </CrimsonButton>
            </div>
          </div>
          <div className="md:col-span-5 order-1 md:order-2 flex justify-center md:justify-end animate-in fade-in zoom-in-95 duration-700">
            <CrimsonPortrait
              src={info.photoUrl}
              alt={info.officialFullName}
              color={info.primaryColor}
              className="w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-[4/4.5] rounded-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </section>

      {/* ─── 2. ABOUT / SIAPA SAYA ─── */}
      <section className="bg-[#121212] border-y border-white/5">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-4">
            <CrimsonPortrait
              src={info.photoUrl}
              alt={`Potret ${info.officialFullName}`}
              color={info.primaryColor}
              className="w-full max-w-[280px] mx-auto aspect-[3/4]"
            />
          </div>
          <div className="md:col-span-8">
            <CrimsonLabel color={info.primaryColor}>Tentang Saya</CrimsonLabel>
            <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Siapa Saya</h2>
            <p className="mt-6 text-[11px] sm:text-xs text-white/65 leading-[1.9]">
              {info.bio ||
                `Nama saya ${info.officialFullName}, anggota ${info.legislativeLevel} dari ${info.party} yang bertugas di ${info.commissionName}. Sejak awal mengabdi, saya percaya bahwa kebijakan terbaik lahir dari mendengar langsung suara rakyat. Fokus saya adalah memastikan setiap peraturan daerah dan alokasi anggaran benar-benar menjawab kebutuhan warga ${info.dapil} — mulai dari infrastruktur desa, layanan kesehatan, pendidikan, hingga penguatan ekonomi kerakyatan. Melalui portal ini, saya membuka kinerja, gagasan, dan data capaian secara transparan agar masyarakat dapat ikut mengawasi dan berkolaborasi.`}
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {chips.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[3px] bg-[#1C1C1C] border border-white/5 text-[10px] font-semibold text-white/85 uppercase truncate hover:border-white/30 transition-colors"
                >
                  <Icon className="w-3 h-3 shrink-0" style={{ color: info.primaryColor }} />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
            <CrimsonButton href={href('/profil')} color={info.primaryColor} className="mt-6">
              <Download className="w-3.5 h-3.5" />
              Lihat Profil Lengkap
            </CrimsonButton>
          </div>
        </div>
      </section>

      {/* ─── 3. SERVICES / APA YANG SAYA PERJUANGKAN ─── */}
      <section className="bg-[#0B0B0B]">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20">
          <CrimsonLabel color={info.primaryColor}>Fokus Perjuangan</CrimsonLabel>
          <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Apa yang Saya Perjuangkan</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12">
            {CRIMSON_FOCUS_AREAS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-[#1A1A1A] rounded-[4px] border border-white/5 px-6 py-7 text-center hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <Icon className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" style={{ color: info.primaryColor }} />
                <h3 className="mt-3 text-xs font-bold text-white">{title}</h3>
                <p className="mt-2 text-[10px] text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. ARTIKEL TERBARU ─── */}
      <section className="bg-[#121212] border-y border-white/5">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <CrimsonLabel color={info.primaryColor}>Artikel & Risalah</CrimsonLabel>
              <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Gagasan Terbaru</h2>
            </div>
            <Link
              href={href('/artikel')}
              className="text-[11px] font-bold hover:text-white inline-flex items-center gap-1"
              style={{ color: info.primaryColor }}
            >
              Semua Artikel <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a: any, idx: number) => (
              <Link
                key={a.id || idx}
                href={href(`/artikel/${a.slug || a.id}`)}
                className="group bg-[#1A1A1A] rounded-[4px] border border-white/5 overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={articleImage(a)}
                    alt={a.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: info.primaryColor }}>
                    {articleCategory(a)}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold text-white leading-snug line-clamp-2 group-hover:opacity-90 transition-opacity">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-white/55 line-clamp-2">{articleExcerpt(a)}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/40">
                    <Calendar className="w-3 h-3" />
                    {formatDateIndonesian(a.publishedAt || a.createdAt || new Date())}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. INFOGRAFIS ─── */}
      <section className="bg-[#0B0B0B]">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <CrimsonLabel color={info.primaryColor}>Data & Transparansi</CrimsonLabel>
              <h2 className="mt-1 font-outfit font-extrabold text-3xl text-white">Infografis Kinerja</h2>
            </div>
            <Link
              href={href('/infografis')}
              className="text-[11px] font-bold hover:text-white inline-flex items-center gap-1"
              style={{ color: info.primaryColor }}
            >
              Semua Infografis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {infographics.map((item: any, idx: number) => (
              <Link
                key={item.id || idx}
                href={href('/infografis')}
                className="group relative aspect-[4/5] rounded-[4px] overflow-hidden border border-white/5 bg-[#1A1A1A]"
              >
                <img
                  src={item.imageUrl || item.posterUrl || item.thumbnailUrl || '/images/showcase-infografis-apbd.jpg'}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  {item.metric && (
                    <div className="font-outfit font-extrabold text-2xl" style={{ color: info.primaryColor }}>
                      {item.metric}
                    </div>
                  )}
                  <h3 className="mt-1 text-xs font-bold text-white line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </CrimsonNoirShell>
  );
}
