import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { StandardDefaultLayout } from '@/components/themes/StandardDefaultLayout';
import { EditorialPrestigeLayout } from '@/components/themes/EditorialPrestigeLayout';
import { BalihoHeroLayout } from '@/components/themes/BalihoHeroLayout';
import { NewsroomBriefLayout } from '@/components/themes/NewsroomBriefLayout';
import { PortalTemplateId } from '@polaris/shared-types';

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
  const title = `${member.fullName} - Portal Akuntabilitas Publik Resmi`;
  const description = theme.headlineTagline || `Portal resmi transparansi kinerja, gagasan kebijakan, dan layanan aspirasi masyarakat ${member.fullName}.`;
  
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

  const { member, theme, recentArticles, subscription } = data;
  const isLicenseActive = subscription?.isActive !== false;
  const layoutId = isLicenseActive
    ? (theme?.layoutTemplateId || PortalTemplateId.STANDARD_DEFAULT)
    : PortalTemplateId.STANDARD_DEFAULT;

  switch (layoutId) {
    case PortalTemplateId.EDITORIAL_PRESTIGE:
    case 'editorial-prestige':
      return (
        <EditorialPrestigeLayout
          member={member}
          theme={theme}
          recentArticles={recentArticles || []}
        />
      );

    case PortalTemplateId.BALIHO_HERO:
    case 'baliho-hero':
      return (
        <BalihoHeroLayout
          member={member}
          theme={theme}
          recentArticles={recentArticles || []}
        />
      );

    case PortalTemplateId.NEWSROOM_BRIEF:
    case 'newsroom-brief':
      return (
        <NewsroomBriefLayout
          member={member}
          theme={theme}
          recentArticles={recentArticles || []}
        />
      );

    case PortalTemplateId.STANDARD_DEFAULT:
    case 'standard-default':
    default:
      return (
        <StandardDefaultLayout
          member={member}
          theme={theme}
          recentArticles={recentArticles || []}
        />
      );
  }
}
