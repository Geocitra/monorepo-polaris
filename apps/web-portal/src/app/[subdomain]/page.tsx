import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { DynamicSectionRenderer } from '@/components/sections/DynamicSectionRenderer';

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
  const title = `${member.fullName} - Portal Publik Resmi`;
  const description =
    theme.headlineTagline ||
    `Portal resmi publikasi pemikiran kebijakan, naskah risalah, dan dokumentasi kerja ${member.fullName}.`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(member.fullName)}&dapil=${encodeURIComponent(member.dapilName)}&party=${encodeURIComponent(member.partyAffiliation)}&color=${encodeURIComponent(theme.primaryHexColor)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://${portal.subdomain}.polaris.id`,
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
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);

  if (!data) notFound();

  const { member, theme, recentArticles, documents } = data;

  return (
    <DynamicSectionRenderer
      member={member}
      theme={theme}
      recentArticles={recentArticles || []}
      documents={documents || []}
      subdomain={subdomain}
    />
  );
}
