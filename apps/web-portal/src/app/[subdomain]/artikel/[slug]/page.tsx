import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData, getNormalizedApiUrl } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';
import { getFallbackArticle } from '@/components/article/fallback-articles';
import { ArticleTemplateRenderer } from '@/components/article/ArticleTemplateRenderer';
import {
  buildArticleMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from '@/components/article/article-seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  } catch {
    // Ignore fetch error, use fallback below
  }

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) {
    return { title: 'Artikel Tidak Ditemukan - POLARIS' };
  }

  const { member, theme, portal } = portalData;
  return buildArticleMetadata({
    article,
    member,
    theme,
    portal,
    subdomain,
    slug,
  });
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
  } catch {
    // Backend offline or timeout -> fallback to mock article
  }

  if (!article) {
    article = getFallbackArticle(slug);
  }

  if (!article) notFound();

  const { member, theme, portal, recentArticles = [], documents } = portalData;
  const effectiveTheme = {
    ...theme,
    ...(sp.preview_template ? { layoutTemplateId: sp.preview_template } : {}),
    ...(sp.preview_color ? { primaryHexColor: sp.preview_color } : {}),
  };
  const templateId = effectiveTheme?.layoutTemplateId || PortalTemplateId.POLARIS_INSIGHT;

  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id'}`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/artikel/${slug}`
    : (article.canonicalUrl || `${baseUrl}/artikel/${slug}`);

  const articleWithCanonical = {
    ...article,
    canonicalUrl,
  };

  const articleJsonLd = buildArticleJsonLd({
    article,
    member,
    theme,
    canonicalUrl,
    baseUrl,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    articleTitle: article.title,
    canonicalUrl,
    subdomain,
    baseUrl,
  });

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
      <ArticleTemplateRenderer
        templateId={templateId}
        article={articleWithCanonical}
        member={member}
        effectiveTheme={effectiveTheme}
        subdomain={subdomain}
        recentArticles={recentArticles}
        documents={documents}
        slug={slug}
      />
    </>
  );
}
