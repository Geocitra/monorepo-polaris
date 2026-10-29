import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchPortalData, getNormalizedApiUrl } from '@/lib/api';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ArrowLeft, Calendar, Clock, Sparkles, Building2, UserCheck, BookOpen, Download, ChevronRight } from 'lucide-react';
import { MarkdownContent } from '@/components/article/markdown-content';
import { CitizenComments } from '@/components/article/citizen-comments';
import { ArticleReaderToolbar } from '@/components/article/ArticleReaderToolbar';
import { NewsletterSubscriptionBox } from '@/components/sections/NewsletterSubscriptionBox';
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { BoldTypographyShell, BoldArtikelDetailClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernArtikelDetailClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowArtikelDetailClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialArtikelDetailClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmArtikelDetailClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioArtikelDetailClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldArtikelDetailClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechArtikelDetailClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioArtikelDetailClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioArtikelDetailClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeArtikelDetailClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateArtikelDetailClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialArtikelDetailClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirArtikelDetailClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitArtikelDetailClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialArtikelDetailClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxArtikelDetailClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialArtikelDetailClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeArtikelDetailClient } from '@/components/templates/creatix-lime';
import { ParichayAmberArtikelDetailClient } from '@/components/templates/parichay-amber';
import { OrixVioletArtikelDetailClient } from '@/components/templates/orix-violet';
import { AgethaRubyArtikelDetailClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanArtikelDetailClient } from '@/components/templates/washoski-cyan';
import { ArikNoirArtikelDetailClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldArtikelDetailClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraArtikelDetailClient } from '@/components/templates/laila-sakura';
import { NexoraVioletArtikelDetailClient } from '@/components/templates/nexora-violet';
import { XenonMintArtikelDetailClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyArtikelDetailClient } from '@/components/templates/tiara-burgundy';


function getFallbackArticle(slug: string) {
  const fallbacks: Record<string, any> = {
    'undang-undang-cipta-kerja-dampak-bagi-umkm': {
      id: 'ref-art-1',
      title: 'Undang-Undang Cipta Kerja: Dampak bagi UMKM & Pemberdayaan Usaha Rakyat',
      slug: 'undang-undang-cipta-kerja-dampak-bagi-umkm',
      category: 'Ekonomi & UMKM',
      issueCategory: 'Ekonomi & UMKM',
      publishedAt: '2026-09-01T08:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/ref-article-1.jpg',
      posterUrl: '/images/ref-article-1.jpg',
      thumbnailUrl: '/images/ref-article-1.jpg',
      excerpt:
        'Penyederhanaan perizinan dan kemudahan akses pembiayaan perbankan harus diimbangi dengan proteksi pasar domestik agar pelaku usaha mikro daerah pemilihan mampu bersaing di era rantai pasok modern.',
      body: `## Latar Belakang Reformasi Perizinan Usaha

Undang-Undang Cipta Kerja lahir dengan semangat debirokratisasi dan percepatan perizinan usaha di Indonesia. Bagi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM), aturan ini menawarkan satu terobosan penting: perizinan tunggal melalui pendekatan berbasis risiko (Online Single Submission/OSS).

Namun, dalam kunjungan kerja dan serap aspirasi konstituen di daerah pemilihan, kami menemukan kenyataan bahwa literasi digital dan akses pendampingan perizinan di tingkat kecamatan masih timpang. Banyak pengrajin dan pedagang kecil yang belum mengetahui bagaimana mengurus Nomor Induk Berusaha (NIB) secara mandiri.

> "Kebijakan perizinan yang canggih tidak akan ada artinya jika pelaku UMKM di desa dan pasar tradisional tidak mendapatkan asistensi nyata dari dinas terkait."

## Tiga Pokok Rekomendasi Kebijakan Parlemen

Dalam rangka memastikan regulasi ini benar-benar berdampak positif bagi ekonomi rakyat, kami di komisi terkait DPR RI memperjuangkan tiga klausul strategis:

- **Alokasi 40% Pengadaan Barang & Jasa Pemerintah**: Memastikan kementerian dan pemerintah daerah memprioritaskan produk-produk UMKM lokal dalam setiap proyek pengadaan publik.
- **Sertifikasi Halal Gratis & Tanpa Pungli**: Mendorong percepatan fasilitas sertifikasi halal gratis (self-declare) bagi usaha kuliner dan olahan pangan rumahan.
- **Perluasan Kuota KUR Mikro Tanpa Agunan**: Menjamin bank-bank BUMN mempermudah penyaluran Kredit Usaha Rakyat dengan bunga rendah tanpa syarat sertifikat tanah bagi peminjam di bawah Rp 50 juta.

### Komitmen Pengawasan Lapangan

Sebagai wakil rakyat, kami berkomitmen untuk terus mengawal pelaksanaan aturan turunan ini secara berkala. Ruang pengaduan di Rumah Aspirasi selalu terbuka bagi para pelaku UMKM yang mengalami hambatan perizinan, intimidasi pungutan liar, atau kesulitan mengakses permodalan perbankan.`,
    },
    'program-pembangunan-infrastruktur': {
      id: 'ref-art-2',
      title: 'Program Pembangunan Infrastruktur: Mengawal Konektivitas Antardesa di Dapil',
      slug: 'program-pembangunan-infrastruktur',
      category: 'Infrastruktur',
      issueCategory: 'Infrastruktur',
      publishedAt: '2026-08-30T09:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/ref-article-2.jpg',
      posterUrl: '/images/ref-article-2.jpg',
      thumbnailUrl: '/images/ref-article-2.jpg',
      excerpt:
        'Konektivitas jalan dan jembatan logistik antardesa adalah urat nadi perekonomian warga. Pengawasan ketat anggaran memastikan pembangunan tepat waktu dan bebas penyelewengan.',
      body: `## Urgensi Konektivitas Daerah

Pembangunan infrastruktur tidak boleh hanya berpusat pada jalan tol antarprovinsi, melainkan harus menembus jalan-jalan poros desa dan jembatan penghubung kecamatan.

Melalui program aspirasi dewan, kami telah mengalokasikan anggaran untuk perbaikan 42,8 kilometer jalan kabupaten di 16 kecamatan konstituen.

> "Infrastruktur yang berkualitas adalah bentuk keadilan sosial nyata yang langsung menurunkan biaya logistik panen petani."

## Pengawasan Mutu Konstruksi

Kami mewajibkan tim teknis pelaksana untuk mematuhi standar spesifikasi beton dan drainase air yang tahan cuaca ekstrem. Sidak berkala ke lokasi proyek dilakukan demi memastikan tidak ada pengurangan volume material.`,
    },
    'sosialisasi-pendidikan-karakter-di-sekolah': {
      id: 'ref-art-3',
      title: 'Sosialisasi Pendidikan Karakter & Penguatan Moral Generasi Muda Bangsa',
      slug: 'sosialisasi-pendidikan-karakter-di-sekolah',
      category: 'Pendidikan',
      issueCategory: 'Pendidikan',
      publishedAt: '2026-08-28T10:00:00.000Z',
      readingTime: '3 menit baca',
      featuredImageUrl: '/images/ref-article-3.jpg',
      posterUrl: '/images/ref-article-3.jpg',
      thumbnailUrl: '/images/ref-article-3.jpg',
      excerpt:
        'Pendidikan bukan sekadar transfer ilmu pengetahuan teknis, melainkan pembentukan integritas karakter dan nilai-nilai kebangsaan yang tangguh.',
      body: `## Transformasi Kurikulum & Budi Pekerti

Di era kecerdasan buatan dan disrupsi informasi digital, tantangan terbesar anak muda kita adalah krisis keteladanan dan degradasi moral.

Pendidikan karakter harus diintegrasikan dalam seluruh mata pelajaran, dengan menitikberatkan pada kejujuran, disiplin, toleransi, dan kepedulian terhadap sesama.

> "Masa depan sebuah bangsa tidak diukur dari seberapa megah gedung sekolahnya, melainkan seberapa kokoh budi pekerti anak-anak didiknya."`,
    },
    'kajian-alokasi-apbd-pemulihan-ekonomi': {
      id: 'art-naya-1',
      title: 'Kajian Strategis Alokasi APBD 2026 untuk Pemulihan Ekonomi Kerakyatan',
      slug: 'kajian-alokasi-apbd-pemulihan-ekonomi',
      category: 'Kajian APBD',
      issueCategory: 'Kajian APBD',
      publishedAt: '2026-10-15T08:00:00.000Z',
      readingTime: '4 menit baca',
      featuredImageUrl: '/images/showcase-artikel-pertanian.jpg',
      posterUrl: '/images/showcase-artikel-pertanian.jpg',
      thumbnailUrl: '/images/showcase-artikel-pertanian.jpg',
      excerpt:
        'Analisis komprehensif mengenai formulasi dan pengawasan alokasi belanja modal daerah guna mempercepat stimulus sektor UMKM serta jaring pengaman sosial konstituen.',
      body: `## Pengantar Analisis APBD Berbasis Kerakyatan

APBD bukan sekadar lembaran angka akuntansi publik, melainkan kompas politik anggaran yang menentukan arah kemakmuran masyarakat di daerah pemilihan. Alokasi belanja modal harus dirancang dengan prinsip keberpihakan kepada sektor-sektor riil yang bersentuhan langsung dengan denyut nadi perekonomian warga.

Dalam konteks pemulihan ekonomi pasca-pandemi dan dinamika inflasi bahan pokok, postur belanja daerah memerlukan reorientasi pada tiga sektor vital: ketahanan pangan pedesaan, bantuan stimulus permodalan UMKM, dan perbaikan infrastruktur jalan sentra produksi.

> "Setiap rupiah dana publik yang dialokasikan dalam APBD harus dapat dipertanggungjawabkan asas kemanfaatannya bagi perbaikan taraf hidup masyarakat lapis bawah."

### Strategi Pengawasan dan Evaluasi di Parlemen

Sebagai anggota Badan Anggaran dan komisi kedewanan, pengawasan berkala terus dilakukan melalui audit kinerja serapan triwulanan. Kami memastikan bahwa lelang proyek infrastruktur strategis tidak mengalami penumpukan di akhir tahun anggaran, melainkan terlaksana secara proporsional demi menjaga daya beli warga lokal.`,
    },
    'transformasi-digital-aspirasi-parlemen': {
      id: 'art-naya-2',
      title: 'Optimalisasi Digitalisasi Layanan Aspirasi Publik di Tingkat Parlemen Daerah',
      slug: 'transformasi-digital-aspirasi-parlemen',
      category: 'Transformasi Digital',
      issueCategory: 'Transformasi Digital',
      publishedAt: '2026-10-12T08:00:00.000Z',
      readingTime: '5 menit baca',
      featuredImageUrl: '/images/ref-article-1.jpg',
      posterUrl: '/images/ref-article-1.jpg',
      thumbnailUrl: '/images/ref-article-1.jpg',
      excerpt:
        'Mewujudkan transparansi dua arah antara konstituen dan wakil rakyat melalui sistem agregasi aspirasi modern berbasis data riil dan tanggap cepat komisi.',
      body: `## Menjembatani Suara Rakyat Melalui Kanal Digital

Partisipasi bermakna (meaningful participation) hanya dapat terwujud jika kanal komunikasi antara masyarakat dan dewan perwakilan terbuka lebar tanpa sekat birokrasi yang kaku. Digitalisasi layanan aspirasi hadir sebagai solusi agar setiap keluhan, usulan perbaikan jalan, atau aduan beasiswa dapat tercatat dan tertelusur secara transparan.

Melalui portal POLARIS dan integrasi hotline reses, masyarakat dapat memantau status disposisi pengaduan mereka secara langsung.`,
    },
    'pengawalan-regulasi-lahan-pangan-berkelanjutan': {
      id: 'art-naya-3',
      title: 'Pengawalan Regulasi Perlindungan Lahan Pertanian Pangan Berkelanjutan (LP2B)',
      slug: 'pengawalan-regulasi-lahan-pangan-berkelanjutan',
      category: 'Regulasi Daerah',
      issueCategory: 'Regulasi Daerah',
      publishedAt: '2026-10-08T08:00:00.000Z',
      readingTime: '6 menit baca',
      featuredImageUrl: '/images/default-article.jpg',
      posterUrl: '/images/default-article.jpg',
      thumbnailUrl: '/images/default-article.jpg',
      excerpt:
        'Memperkuat payung hukum perda tata ruang wilayah untuk menjamin kedaulatan pangan lokal, kepastian irigasi, dan perlindungan kesejahteraan kelompok tani daerah.',
      body: `## Menjaga Kedaulatan Pangan Daerah

Alih fungsi lahan pertanian produktif menjadi kawasan perumahan komersial atau industri manufaktur yang tidak terkendali menjadi ancaman serius bagi ketahanan pangan lokal. Petani sering kali berada pada posisi tawar yang rentan ketika berhadapan dengan ekspansi spekulan lahan.

Oleh karena itu, penyusunan Perda LP2B menjadi prioritas legislasi daerah yang terus kami perjuangkan agar lahan sawah beririgasi teknis mendapatkan proteksi hukum permanen dan insentif pajak daerah bagi para petani penggarap.`,
    },
  };

  return fallbacks[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) {
    return { title: 'Portal Tidak Ditemukan - POLARIS' };
  }

  const API_BASE_URL = getNormalizedApiUrl();





  let article = null;
  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    // Ignore fetch error, use fallback below
  }

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) {
    return { title: 'Artikel Tidak Ditemukan - POLARIS' };
  }

  const { member, theme, portal } = portalData;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const title = `${article.title} - ${member.fullName}`;
  const description = article.excerpt || `Telaah kebijakan dan risalah publik oleh ${member.fullName}.`;

  const canonicalUrl =
    article.canonicalUrl ||
    (portal?.customDomain
      ? `https://${portal.customDomain}/artikel/${slug}`
      : `${baseUrl}/${subdomain}/artikel/${slug}`);

  const ogImageUrl =
    article.posterUrl ||
    `/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  return {
    title,
    description,
    keywords: [
      article.title,
      article.category || 'Kebijakan Publik',
      member.fullName,
      member.partyAffiliation,
      member.dapilName,
      'Telaah Parlemen',
      'Regulasi',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [member.fullName],
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}



  function renderArticleContent({
  templateId,
  article,
  member,
  effectiveTheme,
  subdomain,
  recentArticles,
  documents,
  slug,
}: {
  templateId: string;
  article: any;
  member: any;
  effectiveTheme: any;
  subdomain: string;
  recentArticles: any[];
  documents: any[];
  slug: string;
}) {
  const theme = effectiveTheme;
  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <BoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </BoldTypographyShell>
    );
  }

  if (templateId === PortalTemplateId.DARK_MODERN || templateId === 'dark-modern') {
    return (
      <DarkModernShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <DarkModernArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </DarkModernShell>
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW || templateId === 'neon-glow') {
    return (
      <NeonGlowShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <NeonGlowArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </NeonGlowShell>
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL || templateId === 'clean-editorial') {
    return (
      <CleanEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CleanEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CleanEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM || templateId === 'creative-warm') {
    return (
      <CreativeWarmShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CreativeWarmArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CreativeWarmShell>
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return (
      <FoliobloxShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <FoliobloxArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </FoliobloxShell>
    );
  }

  if (templateId === PortalTemplateId.STUDIO_EDITORIAL || templateId === 'studio-editorial') {
    return (
      <StudioEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <StudioEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </StudioEditorialShell>
    );
  }

  if (
    templateId === PortalTemplateId.WARM_PORTFOLIO ||
    templateId === 'warm-portfolio'
  ) {
    return (
      <WarmPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <WarmPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </WarmPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CRIMSON_NOIR || templateId === 'crimson-noir') {
    return (
      <CrimsonNoirShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CrimsonNoirArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CrimsonNoirShell>
    );
  }

  if (templateId === PortalTemplateId.GOLDEN_SPLIT || templateId === 'golden-split') {
    return (
      <GoldenSplitShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <GoldenSplitArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </GoldenSplitShell>
    );
  }

  if (templateId === PortalTemplateId.BLUSH_EDITORIAL || templateId === 'blush-editorial') {
    return (
      <BlushEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <BlushEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        recentArticles={recentArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
      />
    );
  }


  if (
    templateId === PortalTemplateId.NAYA_EDITORIAL ||
    templateId === 'naya-editorial' ||
    templateId === 'naya-digital'
  ) {
    return (
      <NayaEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <NayaEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </NayaEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_GOLD || templateId === 'midnight-gold') {
    return (
      <MidnightGoldShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <MidnightGoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </MidnightGoldShell>
    );
  }

  if (templateId === PortalTemplateId.EMERALD_TECH || templateId === 'emerald-tech') {
    return (
      <EmeraldTechShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <EmeraldTechArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </EmeraldTechShell>
    );
  }

  if (templateId === PortalTemplateId.QURIFOLIO || templateId === 'qurifolio') {
    return (
      <QurifolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <QurifolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </QurifolioShell>
    );
  }

  if (templateId === PortalTemplateId.AMBER_PORTFOLIO || templateId === 'amber-portfolio') {
    return (
      <AmberPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <AmberPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </AmberPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIX_LIME || templateId === 'creatix-lime') {
    return (
      <CreatixLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <CreatixLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </CreatixLimeShell>
    );
  }

  if (
    templateId === PortalTemplateId.MIDNIGHT_LIME ||
    templateId === 'midnight-lime'
  ) {
    return (
      <MidnightLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <MidnightLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </MidnightLimeShell>
    );
  }

  if (templateId === PortalTemplateId.PLATINUM_SLATE || templateId === 'platinum-slate') {
    return (
      <PlatinumSlateShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <PlatinumSlateArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={recentArticles?.filter((a: any) => a.slug !== slug)}
        />
      </PlatinumSlateShell>
    );
  }

  const wordCount = article.wordCount || 3000;
  const readingTime = calculateReadingTime(wordCount);

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="artikel"
      showMasthead={false}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-14">
        {/* Top Navigation & Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#96702c] hover:text-[#805f24] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            POLARIS Negarawan • Risalah Kebijakan
          </div>
        </div>

        <article className="relative">
          {/* Editorial Header */}
          <header className="space-y-5 border-b border-slate-200 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-[#96702c] border border-amber-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#96702c]" />
                <span>Kajian Kebijakan Parlemen Resmi</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{readingTime}</span>
              </span>
            </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
            {article.title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center gap-4 pt-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
              {theme?.officialPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold text-sm">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {member.fullName}
                </span>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>Fraksi {member.partyAffiliation}</span>
                <span>•</span>
                <span>Dapil {member.dapilName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateIndonesian(article.publishedAt)}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Reader Toolbar: Scroll Progress, Font Size, Copy Link, Print, Share */}
        <ArticleReaderToolbar
          title={article.title}
          canonicalUrl={article.canonicalUrl}
        />

        {/* Poster Visual (Cloudflare R2 / DALL-E) */}
        {article.posterUrl && (
          <div className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.posterUrl}
              alt={article.title}
              className="w-full object-cover max-h-[560px]"
            />
            <div className="p-3 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">
              Dokumentasi Risalah & Visual Kebijakan • Arsip Digital Dewan
            </div>
          </div>
        )}

        {/* Excerpt Lead */}
        <div className="my-8 p-6 rounded-2xl bg-[#FBF9F5] border-l-4 border-[#96702c] border-y border-r border-amber-100/70 text-slate-800">
          <p className="text-base sm:text-lg font-medium italic leading-relaxed">
            "{article.excerpt}"
          </p>
        </div>

        {/* Article Body */}
        <div id="article-body-container" className="pt-2">
          <MarkdownContent content={article.bodyContentMarkdown} />
        </div>

        {/* Author Bio Card */}
        <div className="my-14 rounded-3xl bg-slate-50 border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0">
              {theme?.officialPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white font-bold text-xl">
                  {member.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {member.fullName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  Penulis & Anggota Parlemen
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {theme?.bioBiography ||
                  `Mewakili aspirasi konstituen Daerah Pemilihan ${member.dapilName}. Mengawal transparansi penganggaran, advokasi regulasi daerah, dan pemberdayaan masyarakat.`}
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Fraksi {member.partyAffiliation} • {member.legislativeLevel?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Box */}
        <div className="my-10">
          <NewsletterSubscriptionBox
            member={member}
            theme={theme}
            subdomain={subdomain}
            variant="ARTICLE_FOOTER"
          />
        </div>

        {/* Public Citizen Discussion Comments */}
        <CitizenComments
          slug={slug}
          initialCommentCount={article.commentCount || 0}
        />
      </article>
    </div>
  </ParliamentShell>
  );
}


export default async function TenantArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
  searchParams?: Promise<{ preview_template?: string; preview_color?: string }>;
}) {
  const { subdomain, slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) notFound();

  const API_BASE_URL = getNormalizedApiUrl();




  let article = null;

  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    // Backend offline or timeout -> fallback to mock article
  }

  const { member, theme, portal, recentArticles = [], documents } = portalData;
  const effectiveTheme = {
    ...theme,
    ...(sp.preview_template ? { layoutTemplateId: sp.preview_template } : {}),
    ...(sp.preview_color ? { primaryHexColor: sp.preview_color } : {}),
  };
  const templateId = effectiveTheme?.layoutTemplateId || PortalTemplateId.POLARIS_INSIGHT;

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const canonicalUrl =
    article.canonicalUrl ||
    (portal?.customDomain
      ? `https://${portal.customDomain}/artikel/${slug}`
      : `${baseUrl}/${subdomain}/artikel/${slug}`);

  const articleOgImage =
    article.posterUrl ||
    `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: [articleOgImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: member.fullName,
      jobTitle: `Anggota Parlemen (${member.legislativeLevel || 'DPR RI'})`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'POLARIS Civic Intelligence',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.ico`,
      },
    },
    articleSection: article.category || 'Kebijakan Publik',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: `${baseUrl}/${subdomain}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artikel',
        item: `${baseUrl}/${subdomain}/artikel`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {renderArticleContent({
        templateId,
        article,
        member,
        effectiveTheme,
        subdomain,
        recentArticles,
        documents,
        slug,
      })}
    </>
  );
}
