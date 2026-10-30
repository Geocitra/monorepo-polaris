import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { DynamicSectionRenderer } from '@/components/sections/DynamicSectionRenderer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);

  if (!data) {
    return {
      title: 'Portal Anggota Dewan - POLARIS',
    };
  }

  const { member, theme, portal } = data;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id';

  // 1. Sanitasi Custom Domain milik user dari Database (misal: opinitaru.com / polarismedia.space)
  const cleanCustomDomain = portal?.customDomain
    ? portal.customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;

  // 2. Base URL & Canonical URL (Hierarki: Custom Domain -> Subdomain polarismedia.id -> Dev localhost)
  const baseUrl = cleanCustomDomain
    ? `https://${cleanCustomDomain}`
    : (process.env.NODE_ENV === 'production'
        ? `https://${subdomain}.${rootDomain}`
        : (process.env.NEXT_PUBLIC_APP_URL || `http://${subdomain}.localhost:3001`));

  const canonicalUrl = baseUrl;

  // 3. Title Kustom Tokoh dari DB dengan perlindungan anti-crash
  const title = portal?.metaTitle || `${member?.fullName || 'Portal'} - Portal Publik Resmi`;
  const description =
    theme.headlineTagline ||
    `Portal resmi publikasi pemikiran kebijakan, naskah risalah, dan dokumentasi kerja ${member?.fullName || 'Anggota Dewan'}.`;

  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(member?.fullName || 'Tokoh Publik')}&dapil=${encodeURIComponent(member?.dapilName || '')}&party=${encodeURIComponent(member?.partyAffiliation || '')}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  return {
    title,
    description,
    keywords: [
      member?.fullName || 'Portal Resmi',
      'Portal Resmi',
      member?.partyAffiliation || 'Parlemen',
      member?.dapilName || 'Daerah Pemilihan',
      'Aspirasi Warga',
      'Kebijakan Publik',
      'Parlemen',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
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

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams?: Promise<{ preview_template?: string; preview_color?: string; preview_photo?: string }>;
}) {
  const { subdomain } = await params;
  const sp = searchParams ? await searchParams : {};
  const data = await fetchPortalData(subdomain);

  if (!data) notFound();

  const { member, theme, portal, recentArticles, recentInfographics, documents } = data;

  const effectiveTheme = {
    ...theme,
    ...(sp.preview_template ? { layoutTemplateId: sp.preview_template } : {}),
    ...(sp.preview_color ? { primaryHexColor: sp.preview_color } : {}),
    ...(sp.preview_photo ? { officialPhotoUrl: sp.preview_photo } : {}),
  };

  const effectiveMember = {
    ...member,
    ...(sp.preview_photo ? { photoUrl: sp.preview_photo } : {}),
  };

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id';
  const cleanCustomDomain = portal?.customDomain
    ? portal.customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;
  const canonicalUrl = cleanCustomDomain
    ? `https://${cleanCustomDomain}`
    : (process.env.NODE_ENV === 'production'
        ? `https://${subdomain}.${rootDomain}`
        : (process.env.NEXT_PUBLIC_APP_URL || `http://${subdomain}.localhost:3001`));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${member?.fullName || 'Portal'} - Portal Publik Resmi`,
        description: theme.headlineTagline || `Portal resmi publikasi kerja legislatif ${member?.fullName || 'Anggota Dewan'}.`,
        publisher: {
          '@type': 'Person',
          name: member?.fullName || 'Tokoh Publik',
        },
      },
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: member?.fullName || 'Tokoh Publik',
        jobTitle: `Anggota Parlemen (${member?.legislativeLevel || 'DPR RI'})`,
        worksFor: {
          '@type': 'GovernmentOrganization',
          name: member?.legislativeLevel || 'Dewan Perwakilan Rakyat',
        },
        affiliation: {
          '@type': 'Organization',
          name: member?.partyAffiliation || 'Fraksi Parlemen',
        },
        image: member?.photoUrl || undefined,
        url: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DynamicSectionRenderer
        member={effectiveMember}
        theme={effectiveTheme}
        recentArticles={recentArticles || []}
        recentInfographics={recentInfographics || []}
        documents={documents || []}
        subdomain={subdomain}
      />
    </>
  );
}
