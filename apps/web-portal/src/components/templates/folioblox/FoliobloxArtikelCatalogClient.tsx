'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Filter,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface FoliobloxArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function FoliobloxArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: FoliobloxArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

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

  const defaultArticles = [
    {
      id: 'art-fb-1',
      slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
      title: 'Mendorong Regulasi Nyata Yang Berpihak Pada Rakyat: Telaah APBD 2026',
      category: 'Kajian APBD',
      excerpt:
        'Analisis komprehensif terkait formulasi anggaran, penyerapan belanja modal, dan pemenuhan hak-hak pelayanan masyarakat daerah.',
      featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'art-fb-2',
      slug: 'transformasi-digital-aspirasi-parlemen',
      title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Parlemen Daerah',
      category: 'Transformasi Digital',
      excerpt:
        'Mewujudkan transparansi dua arah antara konstituen dan dewan perwakilan melalui agregasi aspirasi modern berbasis data riil.',
      featuredImageUrl: '/images/ref-article-1.jpg',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'art-fb-3',
      slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
      title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan (LP2B)',
      category: 'Regulasi Daerah',
      excerpt:
        'Memperkuat payung hukum perda tata ruang wilayah demi kedaulatan pangan lokal dan kesejahteraan kelompok tani di daerah pemilihan.',
      featuredImageUrl: '/images/default-article.jpg',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'art-fb-4',
      slug: 'undang-undang-cipta-kerja-dampak-bagi-umkm',
      title: 'Perlindungan & Akses Modal Usaha Mikro di Sentra Perekonomian Rakyat',
      category: 'Ekonomi Kerakyatan',
      excerpt:
        'Penyederhanaan perizinan berusaha dan perluasan alokasi pinjaman modal bersubsidi bagi pelaku usaha mikro pedesaan.',
      featuredImageUrl: '/images/ref-article-2.jpg',
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: 'art-fb-5',
      slug: 'program-pembangunan-infrastruktur',
      title: 'Audit Kinerja Pembangunan Jalan Poros Desa & Jembatan Antar-Kecamatan',
      category: 'Infrastruktur',
      excerpt:
        'Memastikan mutu konstruksi fisik jalan penghubung sentra tani memenuhi standar kelayakan dan tepat waktu penyelesaian.',
      featuredImageUrl: '/images/showcase-infografis-apbd.jpg',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'art-fb-6',
      slug: 'evaluasi-akuntabilitas-penyerapan-anggaran',
      title: 'Pengawasan Triwulanan Belanja Modal & Efisiensi Tata Kelola Daerah',
      category: 'Kajian APBD',
      excerpt:
        'Mencegah penumpukan pencairan dana proyek di akhir tahun dan memastikan program stimulus menyentuh kebutuhan masyarakat terbawah.',
      featuredImageUrl: '/images/ref-article-3.jpg',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ];

  const effectiveArticles =
    articles && articles.length > 0 ? articles : defaultArticles;

  const categories = useMemo(() => {
    const set = new Set<string>();
    effectiveArticles.forEach((art) => {
      const cat = art.issueCategory || art.category || art.categoryName;
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [effectiveArticles]);

  const filteredArticles = useMemo(() => {
    return effectiveArticles.filter((art) => {
      const titleMatch = (art.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const excerptMatch = (art.excerpt || art.summary || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || excerptMatch;

      const cat = art.issueCategory || art.category || art.categoryName || 'Kajian Kebijakan';
      const matchesCategory = selectedCategory === 'Semua' || cat === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [effectiveArticles, searchQuery, selectedCategory]);

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

  return (
    <div className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto space-y-12 select-text">
      
      {/* ─── SEARCH & CATEGORY FILTER BAR ─── */}
      <div className="bg-[#121212] rounded-[28px] border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari risalah, regulasi perda, APBD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#181818] border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF4500] text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ─── ARTICLES GRID (FOLIOBLOX HIGH-CONTRAST MONOCHROME/ORANGE POSTERS) ─── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-[28px] bg-[#121212] border border-white/10">
          <BookOpen className="w-8 h-8 text-white/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-white">
            Tidak ada artikel yang cocok dengan &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="mt-3 text-xs font-bold text-orange-400 underline cursor-pointer"
          >
            Reset Pencarian &amp; Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {filteredArticles.map((art, idx) => {
            const img = getArticleImage(art);
            const title = art.title || `Kajian Risalah Terpilih Ke-${idx + 1}`;
            const excerpt =
              art.excerpt ||
              art.summary ||
              'Analisis komprehensif terkait kebijakan anggaran dan pemenuhan hak-hak pelayanan masyarakat daerah.';
            const dateStr = formatDateIndonesian(art.createdAt || new Date());
            const detailHref = getNavLinkHref(`/artikel/${art.slug || idx + 1}`);

            return (
              <Link
                key={art.id || idx}
                href={detailHref}
                className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#141414] border border-white/10 hover:border-orange-500/60 transition-all duration-300 flex flex-col aspect-[4/5] justify-between p-6 sm:p-8"
              >
                {/* Background Image with Cinematic Monochrome / Dark Contrast Tone */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                </div>

                {/* Top Badge: Index Tag & Category */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-orange-400">
                    #0{idx + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white/90">
                    {dateStr}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 pt-10">
                  <h3 className="font-outfit text-xl sm:text-2xl font-black text-white leading-snug tracking-tight mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-4 font-normal">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
