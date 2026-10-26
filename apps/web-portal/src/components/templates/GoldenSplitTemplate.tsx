'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  Eye,
  Maximize2,
  X,
  FileText,
  Smartphone,
  Code2,
  Layout,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { GoldenSplitShell } from './golden-split/GoldenSplitShell';
import {
  getGoldenMemberInfo,
  useGoldenHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  GOLDEN_DEFAULT_ARTICLES,
  GOLDEN_DEFAULT_INFOGRAPHICS,
} from './golden-split/utils';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function GoldenSplitTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  subdomain,
}: TemplateProps) {
  const info = getGoldenMemberInfo(member, theme, subdomain);
  const href = useGoldenHref(subdomain);

  // Active lightbox for infographics
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  // Articles & Infographics with fallbacks guaranteeing rich images
  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 3)
      : GOLDEN_DEFAULT_ARTICLES.slice(0, 3);

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : GOLDEN_DEFAULT_INFOGRAPHICS.slice(0, 3);

  return (
    <GoldenSplitShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      showMasthead={false}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO SPLIT + ABOUT ME + 4 GRADIENT SERVICE CARDS
          (PERSIS SESUAI DENGAN GAMBAR REFERENSI)
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* 1A. HERO SPLIT: Kiri Charcoal gelap (#262626), Kanan Kuning Emas (#FFA800) */}
      <section className="relative w-full overflow-hidden bg-[#262626]">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px] lg:min-h-[620px]">
          
          {/* Sisi Kiri: Charcoal Dark */}
          <div className="md:col-span-7 bg-[#262626] flex items-center justify-center p-8 sm:p-12 lg:p-20 order-2 md:order-1">
            <div className="max-w-xl w-full space-y-4">
              <p className="text-white text-base sm:text-lg font-medium tracking-wide">
                Halo, Salam Hangat
              </p>
              
              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#FFA800] leading-tight">
                Saya {info.firstName}
              </h1>

              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {info.officialFullName}
                </p>
                <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed">
                  Anggota {info.legislativeLevel} · {info.party} · Daerah Pemilihan {info.dapil}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-2">
                Berdedikasi memperjuangkan aspirasi rakyat, mengawal transparansi anggaran daerah,
                dan memastikan setiap kebijakan memberi dampak nyata bagi kesejahteraan masyarakat.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3 rounded-[3px] border-2 text-white hover:brightness-110 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
                  style={{ borderColor: info.primaryColor, color: info.primaryColor }}
                >
                  Hubungi Saya
                </Link>
                <Link
                  href={href('/profil')}
                  className="px-7 py-3 rounded-[3px] bg-[#333333] hover:bg-[#404040] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  Profil Dewan
                </Link>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Solid Background (Dynamic User Color) dengan Potret Dewan */}
          <div
            className="md:col-span-5 flex items-end justify-center relative overflow-hidden min-h-[360px] md:min-h-full order-1 md:order-2 transition-colors duration-500"
            style={{ backgroundColor: info.primaryColor }}
          >
            <div className="relative w-full h-full flex items-end justify-center pt-8 px-6">
              <img
                src={info.photoUrl}
                alt={info.officialFullName}
                className="max-h-[460px] lg:max-h-[580px] w-auto object-contain object-bottom drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 1B. ABOUT ME: Frame Foto dengan Border Offset di Belakangnya */}
      <section className="bg-[#1E1E1E] py-20 lg:py-28 border-b border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Kiri: Foto dalam Kotak dengan Garis Offset di Belakang */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative">
                {/* Garis Border Offset di Belakang Mengikuti Warna User */}
                <div
                  className="absolute -top-4 -left-4 w-full h-full border-4 rounded-xs pointer-events-none transition-colors"
                  style={{ borderColor: info.primaryColor }}
                />
                
                {/* Wadah Foto Utama */}
                <div className="relative w-[280px] sm:w-[320px] aspect-[4/5] bg-[#2E2E2E] shadow-2xl overflow-hidden rounded-xs border-2 border-white/10 z-10">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top filter grayscale contrast-110 hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Kanan: Judul "About Me" dengan Garis Bawah dan Tombol Aksi */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  Tentang Saya
                </h2>
                {/* Garis Horizontal Dinamis di Bawah Judul */}
                <div className="w-16 h-1 mt-2 rounded-full" style={{ backgroundColor: info.primaryColor }} />
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {info.bio ||
                  `Saya ${info.officialFullName}, dipercaya mengemban amanah sebagai anggota ${info.legislativeLevel} dari ${info.party}. Bertugas di ${info.commissionName}, fokus pengabdian saya diarahkan pada advokasi aspirasi warga ${info.dapil}, pengawasan alokasi APBD secara akuntabel, serta perumusan regulasi daerah yang berpihak pada kesejahteraan rakyat.`}
              </p>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Melalui platform digital POLARIS ini, saya berkomitmen membuka ruang komunikasi dua arah
                yang transparan. Setiap laporan, usulan perbaikan jalan, sektor pertanian, pendidikan,
                hingga fasilitas kesehatan diproses secara terstruktur dan dapat dipantau langsung oleh masyarakat.
              </p>

              {/* Dua Tombol Aksi */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3 rounded-[3px] text-[#1E1E1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-md hover:brightness-105"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  Hubungi Saya
                </Link>
                <Link
                  href={href('/profil')}
                  className="px-7 py-3 rounded-[3px] border text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/5"
                  style={{ borderColor: info.primaryColor, color: info.primaryColor }}
                >
                  Lihat Profil Lengkap
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1C. SERVICES: 4 Kartu Gradien Warna-Warni Persis Gambar */}
      <section className="bg-[#242424] py-20 lg:py-24 border-b border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          
          <div className="mb-12">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Fokus Pengabdian
            </h2>
            <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Empat pilar komitmen kerja legislatif dalam mewakili masyarakat Daerah Pemilihan {info.dapil}.
            </p>
          </div>

          {/* Grid 4 Kartu Gradien (Cyan, Amber, Magenta, Green) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Cyan / Blue Gradient */}
            <div className="relative rounded-2xl p-7 flex flex-col justify-between min-h-[220px] text-white shadow-xl bg-gradient-to-br from-[#00C6FF] to-[#0072FF] group hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <Smartphone className="w-8 h-8 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-white leading-tight">
                  Advokasi Warga
                </h3>
              </div>
              <p className="text-xs text-white/90 leading-relaxed mt-4">
                Penyaluran aspirasi masyarakat, respon tanggap darurat infrastruktur desa, dan pengaduan layanan publik.
              </p>
            </div>

            {/* Card 2: Golden / Amber Gradient */}
            <div className="relative rounded-2xl p-7 flex flex-col justify-between min-h-[220px] text-[#1E1E1E] shadow-xl bg-gradient-to-br from-[#FFE259] to-[#FFA751] group hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <Code2 className="w-8 h-8 mb-4 text-[#1E1E1E] opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-[#1E1E1E] leading-tight">
                  Pengawasan APBD
                </h3>
              </div>
              <p className="text-xs text-[#1E1E1E]/85 leading-relaxed mt-4 font-medium">
                Memastikan setiap rupiah pos anggaran daerah dialokasikan tepat sasaran dan berkeadilan untuk rakyat.
              </p>
            </div>

            {/* Card 3: Pink / Magenta Gradient */}
            <div className="relative rounded-2xl p-7 flex flex-col justify-between min-h-[220px] text-white shadow-xl bg-gradient-to-br from-[#F857A6] to-[#FF5858] group hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <Layers className="w-8 h-8 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-white leading-tight">
                  Ekonomi &amp; UMKM
                </h3>
              </div>
              <p className="text-xs text-white/90 leading-relaxed mt-4">
                Stimulus kelompok usaha mikro, bantuan sarana pertanian, dan peningkatan daya saing komoditas lokal.
              </p>
            </div>

            {/* Card 4: Emerald / Green Gradient */}
            <div className="relative rounded-2xl p-7 flex flex-col justify-between min-h-[220px] text-white shadow-xl bg-gradient-to-br from-[#00b09b] to-[#96c93d] group hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <Layout className="w-8 h-8 mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-white leading-tight">
                  Regulasi Daerah
                </h3>
              </div>
              <p className="text-xs text-white/90 leading-relaxed mt-4">
                Perumusan Perda pro-rakyat, perlindungan lahan pertanian berkelanjutan, dan kepastian hukum masyarakat.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL DENGAN GAMBAR ARTIKEL YANG JELAS & ESTETIK
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1E1E1E] py-20 lg:py-24 border-b border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Artikel &amp; Risalah Kebijakan
              </h2>
              <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
                Publikasi pemikiran, telaah regulasi daerah, dan catatan kerja resmi dari parlemen.
              </p>
            </div>
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFA800] hover:text-[#FFB82E] transition-colors"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Artikel Menampilkan Gambar Artikel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((item: any, idx: number) => {
              const imgUrl = getArticleImage(item);
              const category = getArticleCategory(item);
              const excerpt = getArticleExcerpt(item);
              const dateStr = formatDateIndonesian(
                item.publishedAt || item.createdAt || new Date()
              );

              return (
                <Link
                  key={item.id || idx}
                  href={href(`/artikel/${item.slug || item.id}`)}
                  className="group bg-[#262626] rounded-xl border border-white/5 overflow-hidden hover:border-[#FFA800]/50 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Gambar Artikel */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#FFA800] text-[#1E1E1E] text-[10px] font-extrabold uppercase tracking-wider shadow">
                      {category}
                    </div>
                  </div>

                  {/* Konten Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-outfit font-bold text-base sm:text-lg text-white group-hover:text-[#FFA800] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#FFA800]" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 text-[#FFA800] font-bold group-hover:translate-x-0.5 transition-transform">
                        Baca <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: INFOGRAFIS DENGAN GAMBAR INFOGRAFIS YANG JELAS & TAJAM
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#242424] py-20 lg:py-24 border-b border-white/5">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Infografis Kinerja &amp; Transparansi
              </h2>
              <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
                Visualisasi data capaian legislasi, serapan aspirasi daerah, dan akuntabilitas anggaran APBD.
              </p>
            </div>
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFA800] hover:text-[#FFB82E] transition-colors"
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Infografis Menampilkan Gambar Poster/Infografis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {infographics.map((item: any, idx: number) => {
              const imgUrl =
                item.imageUrl ||
                item.posterUrl ||
                item.thumbnailUrl ||
                '/images/showcase-infografis-apbd.jpg';
              const cat = item.category || item.categoryName || 'Transparansi Data';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveModalInfo(item)}
                  className="group relative rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/10 hover:border-[#FFA800] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Gambar Infografis */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Tombol Preview Zoom */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFA800] text-[#1E1E1E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                      <Maximize2 className="w-4 h-4 font-bold" />
                    </div>

                    {/* Metrik & Kategori di Atas Gambar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      {item.metric && (
                        <div className="font-outfit font-black text-2xl sm:text-3xl text-[#FFA800] tracking-tight">
                          {item.metric}
                        </div>
                      )}
                      <div className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">
                        {item.metricLabel || cat}
                      </div>
                      <h3 className="mt-1 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1E1E1E] flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-medium text-[#FFA800]">{cat}</span>
                    <span className="inline-flex items-center gap-1 text-white font-semibold group-hover:text-[#FFA800]">
                      Lihat Detail ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── MODAL LIGHTBOX UNTUK INFOGRAFIS ─── */}
      {activeModalInfo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#252525] border border-white/10 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalInfo(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-[#FFA800] text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gambar Infografis di Lightbox */}
            <div className="bg-black flex items-center justify-center p-4">
              <img
                src={
                  activeModalInfo.imageUrl ||
                  activeModalInfo.posterUrl ||
                  '/images/showcase-infografis-apbd.jpg'
                }
                alt={activeModalInfo.title}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>

            {/* Keterangan */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="px-3 py-1 rounded bg-[#FFA800] text-[#1E1E1E] text-[10px] font-extrabold uppercase tracking-wider">
                  {activeModalInfo.category || 'Infografis'}
                </span>

                <h2 className="mt-4 font-outfit font-extrabold text-2xl text-white leading-snug">
                  {activeModalInfo.title}
                </h2>

                {activeModalInfo.metric && (
                  <div className="mt-4 p-4 rounded-xl bg-[#1E1E1E] border border-white/5">
                    <div className="font-outfit font-black text-3xl text-[#FFA800]">
                      {activeModalInfo.metric}
                    </div>
                    <div className="text-xs text-neutral-400 font-medium">
                      {activeModalInfo.metricLabel || 'Capaian Terdata'}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {activeModalInfo.description ||
                    'Publikasi grafik dan data kinerja resmi dalam pengawasan anggaran daerah, serapan aspirasi masyarakat, serta implementasi regulasi di parlemen.'}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                <a
                  href={
                    activeModalInfo.imageUrl ||
                    activeModalInfo.posterUrl ||
                    '/images/showcase-infografis-apbd.jpg'
                  }
                  download
                  className="px-6 py-2.5 rounded bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-5 py-2.5 rounded border border-white/20 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </GoldenSplitShell>
  );
}
