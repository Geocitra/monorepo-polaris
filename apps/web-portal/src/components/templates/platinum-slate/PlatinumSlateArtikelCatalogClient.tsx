'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface PlatinumSlateArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function PlatinumSlateArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: PlatinumSlateArtikelCatalogClientProps) {
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const fallbackArticles = [
    {
      id: 'art-1',
      title: 'Perlindungan & Akses Permodalan UMKM Daerah Melalui Regulasi Parlemen',
      slug: 'perlindungan-akses-permodalan-umkm',
      category: 'Ekonomi Kerakyatan',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
      excerpt: 'Inisiasi draf perancangan regulasi guna memperkuat subsidi bunga kredit dan perlindungan gerai usaha rakyat di 18 kecamatan.',
      publishedAt: '2026-03-15',
      readingTimeMinutes: 4,
    },
    {
      id: 'art-2',
      title: 'Transparansi Realisasi Pos Belanja APBD Sektor Kesehatan & BPJS PBI',
      slug: 'transparansi-apbd-sektor-kesehatan',
      category: 'Pengawasan Anggaran',
      imageUrl: '/images/ref-article-1.jpg',
      featuredImageUrl: '/images/ref-article-1.jpg',
      excerpt: 'Hasil evaluasi triwulanan alokasi dana kesehatan daerah untuk memastikan kepesertaan masyarakat kurang mampu tetap terlindungi.',
      publishedAt: '2026-03-10',
      readingTimeMinutes: 6,
    },
    {
      id: 'art-3',
      title: 'Akselerasi Infrastruktur Jalan Poros Antardesa & Konektivitas Wilayah',
      slug: 'akselerasi-infrastruktur-jalan-desa',
      category: 'Pembangunan Wilayah',
      imageUrl: '/images/ref-article-2.jpg',
      featuredImageUrl: '/images/ref-article-2.jpg',
      excerpt: 'Pengawalan percepatan perbaikan jalan poros lingkar kecamatan guna memangkas biaya logistik komoditas pertanian lokal.',
      publishedAt: '2026-02-28',
      readingTimeMinutes: 5,
    },
  ];

  const sourceArticles = articles && articles.length > 0 ? articles : fallbackArticles;

  const getArticleUrl = (slug: string) => {
    let base = subdomain ? `/${subdomain}/artikel/${slug}` : `/artikel/${slug}`;
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const getArticleImg = (art: any, idx: number) => {
    const fallbacks = [
      '/images/showcase-artikel-pertanian.jpg',
      '/images/ref-article-1.jpg',
      '/images/ref-article-2.jpg',
    ];
    return (
      art?.featuredImageUrl ||
      art?.posterUrl ||
      art?.imageUrl ||
      art?.coverImageUrl ||
      art?.thumbnail ||
      fallbacks[idx % fallbacks.length]
    );
  };

  const leadArticle = sourceArticles[0];
  const otherArticles = sourceArticles.slice(1);

  return (
    <div className="py-10 sm:py-16 bg-[#0D1117] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 text-left">
        
        {sourceArticles.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">Belum ada risalah atau kajian yang dipublikasikan.</p>
          </div>
        ) : (
          <>
            {/* ─── LEAD ARTICLE (EXPANSIVE EDITORIAL SPLIT MASTER CARD) ─── */}
            {leadArticle && (
              <Link
                href={getArticleUrl(leadArticle.slug)}
                className="group block rounded-3xl bg-[#151B23] border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Left: Panoramic Featured Visual */}
                  <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden bg-[#0E1013]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getArticleImg(leadArticle, 0)}
                      alt={leadArticle.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151B23] via-transparent to-black/60 pointer-events-none" />

                    {/* Floating Corner Badges on Visual */}
                    <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>KAJIAN UTAMA</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                        {leadArticle.category || 'Kebijakan Publik'}
                      </span>
                    </div>

                    {/* Bottom Metadata on Visual */}
                    <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                        {formatDateIndonesian(leadArticle.publishedAt || leadArticle.createdAt || leadArticle.date)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Editorial Content Dossier */}
                  <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between space-y-6 bg-gradient-to-br from-[#161B23] via-[#14181F] to-[#0F1318]">
                    
                    <div className="space-y-4">
                      {/* Sub-header index info */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <span className="font-mono text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">
                          01 UTAMA
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {leadArticle.readingTimeMinutes
                              ? `${leadArticle.readingTimeMinutes} min`
                              : (leadArticle.readingTime || '5 min')}{' '}
                            baca
                          </span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-white group-hover:text-slate-200 transition-colors leading-snug">
                        {leadArticle.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-4 leading-relaxed">
                        {leadArticle.excerpt ||
                          leadArticle.summary ||
                          'Uraian telaah regulasi komprehensif dan catatan strategis perumusan kebijakan parlemen.'}
                      </p>
                    </div>

                    {/* Action & Official Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-gradient-to-r from-[#FFFFFF] via-[#E2E6EA] to-[#BAC2CC] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md group-hover:brightness-110 active:scale-95 transition-all">
                        <span>BACA KAJIAN LENGKAP</span>
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                        DOKUMEN RESMI
                      </span>
                    </div>

                  </div>

                </div>
              </Link>
            )}

            {/* ─── ARCHIVE SECTION DIVIDER ─── */}
            {otherArticles.length > 0 && (
              <div className="pt-4 sm:pt-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block font-mono">
                    ARSIP RISALAH &amp; DOKUMEN
                  </span>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider mt-0.5">
                    DAFTAR KAJIAN &amp; TELAAH KEBIJAKAN
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                    {sourceArticles.length} RISALAH
                  </span>
                </div>
              </div>
            )}

            {/* ─── OTHER ARTICLES: HORIZONTAL EDITORIAL DOSSIER STRIPS ─── */}
            {otherArticles.length > 0 && (
              <div className="space-y-4 sm:space-y-5">
                {otherArticles.map((art, oIdx) => {
                  const itemIdx = oIdx + 1;
                  const formattedIdx = String(itemIdx + 1).padStart(2, '0');

                  return (
                    <Link
                      key={art.id || art.slug || `art-${itemIdx}`}
                      href={getArticleUrl(art.slug)}
                      className="group block rounded-2xl sm:rounded-3xl bg-[#151B23] border border-white/10 hover:border-white/30 hover:bg-[#181F28] p-4 sm:p-6 transition-all duration-300 shadow-xl"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center">
                        
                        {/* Index Number Column (Desktop) */}
                        <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center border-r border-white/10 pr-4">
                          <span className="font-bebas text-3xl sm:text-4xl text-slate-500 group-hover:text-white transition-colors tracking-wider">
                            {formattedIdx}
                          </span>
                          <span className="text-[8px] font-mono tracking-widest uppercase text-slate-500">
                            RISALAH
                          </span>
                        </div>

                        {/* Thumbnail Image (16:10 aspect ratio) */}
                        <div className="md:col-span-3 aspect-[16/10] bg-[#0E1013] rounded-xl sm:rounded-2xl overflow-hidden relative border border-white/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getArticleImg(art, itemIdx)}
                            alt={art.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallbacks = [
                                '/images/showcase-artikel-pertanian.jpg',
                                '/images/ref-article-1.jpg',
                                '/images/ref-article-2.jpg',
                              ];
                              target.src = fallbacks[itemIdx % fallbacks.length];
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="md:hidden absolute top-2.5 left-2.5 z-10">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white border border-white/20">
                              #{formattedIdx}
                            </span>
                          </div>
                        </div>

                        {/* Content: Category, Date, Title, Excerpt */}
                        <div className="md:col-span-6 space-y-2 text-left">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15 uppercase tracking-wider">
                              {art.category || 'Kebijakan Publik'}
                            </span>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDateIndonesian(art.publishedAt || art.createdAt || art.date)}</span>
                            </div>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {art.readingTimeMinutes
                                  ? `${art.readingTimeMinutes} min`
                                  : (art.readingTime || '5 min')}{' '}
                                baca
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {art.excerpt || art.summary || 'Uraian telaah regulasi dan catatan pembahasan komisi dewan.'}
                          </p>
                        </div>

                        {/* Right Action: Circular Arrow Button + Label */}
                        <div className="md:col-span-2 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                          <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-slate-400 group-hover:text-white transition-colors">
                            <span className="hidden lg:inline text-[11px] uppercase">TELAAH</span>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 group-hover:bg-white text-slate-300 group-hover:text-black border border-white/15 group-hover:border-white flex items-center justify-center transition-all shadow-md group-hover:scale-105">
                              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
