'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NayaEditorialArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NayaEditorialArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: NayaEditorialArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

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
    {
      id: 'art-4',
      slug: 'evaluasi-akuntabilitas-penyerapan-anggaran',
      title: 'Evaluasi Akuntabilitas Penyerapan Belanja Modal Triwulan III',
      category: 'Kajian APBD',
      excerpt:
        'Telaah mendalam capaian program infrastruktur dasar dan rekomendasi percepatan realisasi lelang proyek fisik tanpa mengurangi kualitas konstruksi publik.',
      featuredImageUrl: '/images/showcase-infografis-apbd.jpg',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      readingTime: '5 menit baca',
    },
    {
      id: 'art-5',
      slug: 'penguatan-perda-bantuan-hukum-masyarakat-miskin',
      title: 'Urgensi Perluasan Cakupan Perda Bantuan Hukum Bagi Warga Prasejahtera',
      category: 'Regulasi Daerah',
      excerpt:
        'Menjamin kesetaraan hak di muka hukum dengan meningkatkan alokasi pos advokasi gratis bagi masyarakat yang menghadapi sengketa perdata maupun pidana.',
      featuredImageUrl: '/images/ref-article-2.jpg',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      readingTime: '4 menit baca',
    },
    {
      id: 'art-6',
      slug: 'reorientasi-kebijakan-pendidikan-vokasi-daerah',
      title: 'Reorientasi Kebijakan Pengembangan Kurikulum Vokasi Sesuai Industri Daerah',
      category: 'Pendidikan',
      excerpt:
        'Menjembatani lulusan SMK lokal dengan sentra industri manufaktur dan kawasan ekonomi khusus demi menekan angka pengangguran terbuka usia produktif.',
      featuredImageUrl: '/images/ref-article-3.jpg',
      createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
      readingTime: '6 menit baca',
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
    <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto space-y-12">
      
      {/* ─── SEARCH & CATEGORY FILTER BAR ─── */}
      <div className="bg-white rounded-[28px] border border-[#E5E0D5] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C9081] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari risalah, kajian APBD, perda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] placeholder:text-[#8C9081] focus:outline-none focus:border-[#4E5340] transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#272A20] text-white shadow-xs'
                  : 'bg-[#F2EFE8] text-[#555A47] hover:bg-[#EAE6DC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ─── ARTICLES GRID (DISPLAYING ARTICLE IMAGES!) ─── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-[28px] bg-white border border-[#E5E0D5]">
          <BookOpen className="w-8 h-8 text-[#8C9081] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#24271D]">
            Tidak ada artikel yang cocok dengan &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="mt-3 text-xs font-bold text-[#4E5340] underline cursor-pointer"
          >
            Reset Pencarian &amp; Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art, idx) => {
            const img = getArticleImage(art);
            const title = art.title || `Kajian Risalah Kebijakan #${idx + 1}`;
            const excerpt =
              art.excerpt ||
              art.summary ||
              'Analisis komprehensif mengenai kebijakan anggaran dan perlindungan hak konstituen daerah.';
            const category = art.issueCategory || art.category || art.categoryName || 'Kajian Kebijakan';
            const dateStr = formatDateIndonesian(art.createdAt || new Date());
            const detailHref = getNavLinkHref(`/artikel/${art.slug || idx + 1}`);

            return (
              <Link
                key={art.id || idx}
                href={detailHref}
                className="group flex flex-col justify-between bg-white rounded-[28px] border border-[#E5E0D5] overflow-hidden hover:border-[#CCD1BF] hover:shadow-xl transition-all duration-300"
              >
                {/* 1. Article Cover Image with Category Overlay */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-[#ECE8DF]">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-[#272A20] shadow-sm">
                    {category}
                  </div>
                </div>

                {/* 2. Article Text Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#7A7E6E] font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.readingTime || '5 menit baca'}</span>
                    </div>

                    <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#24271D] group-hover:text-[#4A4E3B] transition-colors leading-snug line-clamp-2">
                      {title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm text-[#6A6D5F] leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>

                  {/* 3. Card Footer */}
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

                    <div className="w-8 h-8 rounded-full bg-[#35382B] text-white flex items-center justify-center group-hover:bg-[#4E5340] group-hover:scale-105 transition-all shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
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
