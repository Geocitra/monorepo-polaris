import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ParliamentShell, ParliamentProfileClient } from '@/components/templates/polaris-insight';
import { BoldTypographyShell, BoldProfileClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernProfileClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowProfileClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialProfileClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmProfileClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioProfileClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldProfileClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechProfileClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioProfileClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioProfileClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeProfileClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateProfileClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialProfileClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirProfileClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitProfileClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialProfileClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxProfileClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialProfileClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeProfileClient } from '@/components/templates/creatix-lime';
import { ParichayAmberProfileClient } from '@/components/templates/parichay-amber';
import { OrixVioletProfileClient } from '@/components/templates/orix-violet';
import { AgethaRubyProfileClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanProfileClient } from '@/components/templates/washoski-cyan';
import { ArikNoirProfileClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldProfileClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraProfileClient } from '@/components/templates/laila-sakura';
import { NexoraVioletShell, NexoraVioletProfileClient } from '@/components/templates/nexora-violet';
import { XenonMintShell, XenonMintProfileClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyShell, TiaraBurgundyProfileClient } from '@/components/templates/tiara-burgundy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Profil Anggota Dewan - POLARIS' };

  const { member, theme, portal } = data;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polaris.id';
  const baseUrl = portal?.customDomain
    ? `https://${portal.customDomain}`
    : process.env.NEXT_PUBLIC_APP_URL || `https://${subdomain}.${rootDomain}`;
  const officialFullName = member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Daerah Pemilihan';
  const party = member?.partyAffiliation || 'Parlemen';

  const title = `Profil & Rekam Jejak - ${officialFullName}`;
  const description =
    member?.bio?.slice(0, 160) ||
    `Biografi resmi, rekam jejak legislasi, latar belakang pendidikan, dan dedikasi pengabdian ${officialFullName} untuk konstituen di ${dapil}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/profil`
    : `${baseUrl}/${subdomain}/profil`;

  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(`Profil Resmi ${officialFullName}`)}&author=${encodeURIComponent(officialFullName)}&dapil=${encodeURIComponent(dapil)}&party=${encodeURIComponent(party)}&color=${encodeURIComponent(theme?.primaryHexColor || '#1890FF')}`;

  return {
    title,
    description,
    keywords: [
      officialFullName,
      'Profil Dewan',
      'Rekam Jejak',
      'Biografi Anggota Dewan',
      party,
      dapil,
      'Kebijakan Publik',
      'Parlemen',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'profile',
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

function renderProfileContent({
  templateId,
  member,
  effectiveTheme,
  subdomain,
  officialFullName,
  dapil,
}: {
  templateId: string;
  member: any;
  effectiveTheme: any;
  subdomain: string;
  officialFullName: string;
  dapil: string;
}) {
  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Pejabat Publik Terverifikasi • Parlemen"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <BoldProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </BoldTypographyShell>
    );
  }

  if (templateId === PortalTemplateId.DARK_MODERN || templateId === 'dark-modern') {
    return (
      <DarkModernShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Pejabat Publik Terverifikasi • Parlemen"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <DarkModernProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </DarkModernShell>
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW || templateId === 'neon-glow') {
    return (
      <NeonGlowShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Pejabat Publik Terverifikasi • Parlemen"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <NeonGlowProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </NeonGlowShell>
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL || templateId === 'clean-editorial') {
    return (
      <CleanEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="PROFIL RESMI WAKIL RAKYAT"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <CleanEditorialProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </CleanEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM || templateId === 'creative-warm') {
    return (
      <CreativeWarmShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <CreativeWarmProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </CreativeWarmShell>
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return (
      <FoliobloxShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <FoliobloxProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </FoliobloxShell>
    );
  }

  if (templateId === PortalTemplateId.STUDIO_EDITORIAL || templateId === 'studio-editorial') {
    return (
      <StudioEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Lengkap"
        pageBadge="PROFIL RESMI DEWAN"
        pageTitle="Biografi & Rekam Jejak Keparlemenan"
        pageSubtitle={`Mengenal visi kenegaraan, riwayat karier profesional, latar belakang pendidikan, dan dedikasi pengabdian ${officialFullName} untuk Daerah Pemilihan ${dapil}.`}
      >
        <StudioEditorialProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <WarmPortfolioProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </WarmPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CRIMSON_NOIR || templateId === 'crimson-noir') {
    return (
      <CrimsonNoirShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge="Rekam Jejak"
        pageTitle="Profil & Pengabdian Parlemen"
        pageSubtitle={`Mengenal lebih dekat dedikasi legislasi, latar belakang, dan visi pengabdian ${officialFullName}.`}
      >
        <CrimsonNoirProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </CrimsonNoirShell>
    );
  }

  if (templateId === PortalTemplateId.GOLDEN_SPLIT || templateId === 'golden-split') {
    return (
      <GoldenSplitShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge="Profil Resmi Dewan"
        pageTitle="Profil & Rekam Jejak Legislatif"
        pageSubtitle={`Biografi pengabdian, rekam jejak pengawasan APBD, dan komitmen pelayanan publik bersama ${officialFullName}.`}
      >
        <GoldenSplitProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </GoldenSplitShell>
    );
  }

  if (templateId === PortalTemplateId.BLUSH_EDITORIAL || templateId === 'blush-editorial') {
    return (
      <BlushEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge="Biografi & Dedikasi"
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Mengenal lebih dekat kiprah perjuangan, rekam jejak legislasi, dan visi keterbukaan publik ${officialFullName}.`}
      >
        <BlushEditorialProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
      >
        <NexoraVioletProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </NexoraVioletShell>
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
      >
        <XenonMintProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </XenonMintShell>
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
      >
        <TiaraBurgundyProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </TiaraBurgundyShell>
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
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <NayaEditorialProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </NayaEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_GOLD || templateId === 'midnight-gold') {
    return (
      <MidnightGoldShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <MidnightGoldProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </MidnightGoldShell>
    );
  }

  if (templateId === PortalTemplateId.EMERALD_TECH || templateId === 'emerald-tech') {
    return (
      <EmeraldTechShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil Resmi Wakil Rakyat"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <EmeraldTechProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </EmeraldTechShell>
    );
  }

  if (templateId === PortalTemplateId.QURIFOLIO || templateId === 'qurifolio') {
    return (
      <QurifolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge={`PROFIL ${officialFullName.toUpperCase()}`}
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <QurifolioProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </QurifolioShell>
    );
  }

  if (templateId === PortalTemplateId.AMBER_PORTFOLIO || templateId === 'amber-portfolio') {
    return (
      <AmberPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge={`PROFIL ${officialFullName.toUpperCase()}`}
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <AmberPortfolioProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </AmberPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIX_LIME || templateId === 'creatix-lime') {
    return (
      <CreatixLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Lengkap"
        pageBadge="PROFIL RESMI DEWAN"
        pageTitle="Biografi & Rekam Jejak Keparlemenan"
        pageSubtitle={`Mengenal visi kenegaraan, riwayat karier profesional, latar belakang pendidikan, dan dedikasi pengabdian ${officialFullName} untuk Daerah Pemilihan ${dapil}.`}
      >
        <CreatixLimeProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge={`PROFIL ${officialFullName.toUpperCase()}`}
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <MidnightLimeProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </MidnightLimeShell>
    );
  }

  if (templateId === PortalTemplateId.PLATINUM_SLATE || templateId === 'platinum-slate') {
    return (
      <PlatinumSlateShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil"
        pageBadge={`PROFIL ${officialFullName.toUpperCase()}`}
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <PlatinumSlateProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </PlatinumSlateShell>
    );
  }

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="profil"
      breadcrumbTitle="Profil Dewan"
      pageTitle="Profil & Rekam Jejak Dewan"
      pageSubtitle={dapil ? `Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.` : 'Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat.'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ParliamentProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </div>
    </ParliamentShell>
  );
}

export default async function DewanProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams?: Promise<{ preview_template?: string; preview_color?: string }>;
}) {
  const { subdomain } = await params;
  const sp = searchParams ? await searchParams : {};
  const data = await fetchPortalData(subdomain);
  if (!data) notFound();

  const { member, theme, portal } = data;
  const effectiveTheme = {
    ...theme,
    ...(sp.preview_template ? { layoutTemplateId: sp.preview_template } : {}),
    ...(sp.preview_color ? { primaryHexColor: sp.preview_color } : {}),
  };
  const templateId = effectiveTheme?.layoutTemplateId || PortalTemplateId.POLARIS_INSIGHT;

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Anggota Dewan';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/profil`
    : `${baseUrl}/${subdomain}/profil`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: officialFullName,
    jobTitle: `Anggota Parlemen (${member?.legislativeLevel || 'DPR RI'})`,
    worksFor: {
      '@type': 'GovernmentOrganization',
      name: member?.legislativeLevel || 'Dewan Perwakilan Rakyat',
    },
    affiliation: {
      '@type': 'Organization',
      name: member?.partyAffiliation || 'Fraksi Parlemen',
    },
    description: member?.bio || `Biografi resmi dan rekam jejak ${officialFullName} di Daerah Pemilihan ${dapil}.`,
    image: member?.photoUrl || undefined,
    url: canonicalUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {renderProfileContent({
        templateId,
        member,
        effectiveTheme,
        subdomain,
        officialFullName,
        dapil,
      })}
    </>
  );
}
