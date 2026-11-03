import type { Metadata } from 'next';

interface BuildArticleMetadataParams {
  article: any;
  member: any;
  theme: any;
  portal: any;
  subdomain: string;
  slug: string;
}

export function buildArticleMetadata({
  article,
  member,
  theme,
  portal,
  subdomain,
  slug,
}: BuildArticleMetadataParams): Metadata {
  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id'}`;

  const title = `${article.title} - ${member.fullName}`;
  const description = article.excerpt || `Telaah kebijakan dan risalah publik oleh ${member.fullName}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/artikel/${slug}`
    : (article.canonicalUrl || `${baseUrl}/artikel/${slug}`);

  const isWebp = article.posterUrl && article.posterUrl.toLowerCase().includes('.webp');
  const hasJpgPngPoster =
    article.posterUrl &&
    article.posterUrl.startsWith('http') &&
    !isWebp;

  const ogImageUrl = hasJpgPngPoster
    ? article.posterUrl
    : `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}&category=${encodeURIComponent(article.category || 'RISALAH KEBIJAKAN')}`;

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
          type: 'image/png',
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

export function buildArticleJsonLd({
  article,
  member,
  theme,
  canonicalUrl,
  baseUrl,
}: {
  article: any;
  member: any;
  theme: any;
  canonicalUrl: string;
  baseUrl: string;
}) {
  const isWebp = article.posterUrl && article.posterUrl.toLowerCase().includes('.webp');
  const hasJpgPngPoster =
    article.posterUrl &&
    article.posterUrl.startsWith('http') &&
    !isWebp;

  const articleOgImage = hasJpgPngPoster
    ? article.posterUrl
    : `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme?.primaryHexColor || '#96702c')}`;

  return {
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
}

export function buildBreadcrumbJsonLd({
  articleTitle,
  canonicalUrl,
  subdomain,
  baseUrl,
}: {
  articleTitle: string;
  canonicalUrl: string;
  subdomain: string;
  baseUrl: string;
}) {
  return {
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
        name: articleTitle,
        item: canonicalUrl,
      },
    ],
  };
}

