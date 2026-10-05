import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';
import { ArrowLeft, Calendar, Clock, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { MarkdownContent } from '@/components/article/markdown-content';
import { CitizenComments } from '@/components/article/citizen-comments';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) {
    return { title: 'Artikel Parlemen - POLARIS' };
  }

  const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  let article = null;

  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    console.error(err);
  }

  if (!article) {
    return { title: 'Artikel Tidak Ditemukan' };
  }

  const { member, theme } = portalData;
  const title = `${article.title} - ${member.fullName}`;
  const description = article.excerpt;

  const ogImageUrl = article.posterUrl || `/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  return {
    title,
    description,
    alternates: {
      canonical: article.canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [member.fullName],
      url: article.canonicalUrl,
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

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) notFound();

  const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  let article = null;

  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/article/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      article = await res.json();
    }
  } catch (err) {
    console.error('[ArticleFetchError]', err);
  }

  if (!article) notFound();

  const { member } = portalData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-portal-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda Dewan</span>
      </Link>

      <article className="mt-6">
        <header className="space-y-4 border-b border-gray-200 pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-portal-primary/10 px-3.5 py-1 text-xs font-bold text-portal-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kajian Kebijakan Parlemen Resmi</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pt-2">
            <span className="font-semibold text-gray-900">{member.fullName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateIndonesian(article.publishedAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {calculateReadingTime(article.wordCount || 3000)}
            </span>
          </div>
        </header>

        {/* POSTER VISUAL DALL-E DARI CLOUDFLARE R2 */}
        {article.posterUrl && (
          <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.posterUrl}
              alt={article.title}
              className="w-full object-cover max-h-[600px]"
            />
            <div className="p-3 text-center text-xs text-gray-500 italic bg-white border-t border-gray-100">
              Infografis Kebijakan Resmi • Arsip Cloudflare R2
            </div>
          </div>
        )}

        {/* ISI LENGKAP 3.000 KATA TEKNOKRATIS (DENGAN FORMATTER EDITORIAL) */}
        <div className="pt-4">
          <p className="lead font-medium text-gray-700 italic border-l-4 border-portal-primary pl-4 text-lg mb-8">
            {article.excerpt}
          </p>

          <MarkdownContent content={article.bodyContentMarkdown} />
        </div>

        {/* DOCK SEBARAN MULTI-KANAL */}
        <div className="mt-14 rounded-2xl bg-gray-50 border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Bagikan Gagasan & Kajian Ini</h4>
              <p className="text-xs text-gray-500">Kirimkan sebagai bahan telaah rekan sejawat atau bagikan ke media sosial.</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`*Kajian Kebijakan Parlemen*: ${article.title}\n\nIzin membagikan telaah artikel untuk bahan diskusi dan rujukan:\n${article.canonicalUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Kirim ke Kolega (WA)</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.canonicalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Post ke X</span>
              </a>
            </div>
          </div>
        </div>

        {/* 6. KOLOM DISKUSI & KOMENTAR PUBLIK WARGA (GOOGLE OAUTH) */}
        <CitizenComments slug={slug} initialCommentCount={article.commentCount || 0} />
      </article>
    </div>
  );
}
