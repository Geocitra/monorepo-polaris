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
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polaris.id';
  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.${rootDomain}`;
  const title = `${member.fullName} - Portal Publik Resmi`;
  const description =
    theme.headlineTagline ||
    `Portal resmi publikasi pemikiran kebijakan, naskah risalah, dan dokumentasi kerja ${member.fullName}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : `${baseUrl}/${subdomain}`;

  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  return {
    title,
    description,
    keywords: [
      member.fullName,
      'Portal Resmi',
      member.partyAffiliation,
      member.dapilName,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : `${baseUrl}/${subdomain}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${member.fullName} - Portal Publik Resmi`,
        description: theme.headlineTagline || `Portal resmi publikasi kerja legislatif ${member.fullName}.`,
        publisher: {
          '@type': 'Person',
          name: member.fullName,
        },
      },
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: member.fullName,
        jobTitle: `Anggota Parlemen (${member.legislativeLevel || 'DPR RI'})`,
        worksFor: {
          '@type': 'GovernmentOrganization',
          name: member.legislativeLevel || 'Dewan Perwakilan Rakyat',
        },
        affiliation: {
          '@type': 'Organization',
          name: member.partyAffiliation || 'Fraksi Parlemen',
        },
        image: member.photoUrl || undefined,
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
