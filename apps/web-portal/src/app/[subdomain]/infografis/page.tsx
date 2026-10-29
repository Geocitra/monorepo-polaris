import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { InfografisGalleryClient } from '@/components/templates/polaris-insight/InfografisGalleryClient';
import { BoldTypographyShell, BoldInfografisGalleryClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernInfografisGalleryClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowInfografisGalleryClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialInfografisGalleryClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmInfografisGalleryClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioInfografisGalleryClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldInfografisGalleryClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechInfografisGalleryClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioInfografisGalleryClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioInfografisGalleryClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeInfografisGalleryClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateInfografisGalleryClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialInfografisGalleryClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirInfografisGalleryClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitInfografisGalleryClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialInfografisGalleryClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxInfografisGalleryClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialInfografisGalleryClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeInfografisGalleryClient } from '@/components/templates/creatix-lime';
import { ParichayAmberInfografisGalleryClient } from '@/components/templates/parichay-amber';
import { OrixVioletInfografisGalleryClient } from '@/components/templates/orix-violet';
import { AgethaRubyInfografisGalleryClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanInfografisGalleryClient } from '@/components/templates/washoski-cyan';
import { ArikNoirInfografisGalleryClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldInfografisGalleryClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraInfografisGalleryClient } from '@/components/templates/laila-sakura';
import { NexoraVioletInfografisGalleryClient } from '@/components/templates/nexora-violet';
import { XenonMintInfografisGalleryClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyInfografisGalleryClient } from '@/components/templates/tiara-burgundy';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Infografis Kinerja - POLARIS' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const { member, theme, portal } = data;
  const officialFullName = member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Daerah Pemilihan';
  const party = member?.partyAffiliation || 'Parlemen';

  const title = `Infografis Kinerja & Data Akuntabilitas - ${officialFullName}`;
  const description = `Visualisasi ringkas mengenai realisasi anggaran, capaian legislasi daerah, dan transparansi advokasi kebijakan publik ${officialFullName} untuk konstituen di ${dapil}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/infografis`
    : `${baseUrl}/${subdomain}/infografis`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(`Infografis Kinerja & Akuntabilitas`)}&author=${encodeURIComponent(officialFullName)}&dapil=${encodeURIComponent(dapil)}&party=${encodeURIComponent(party)}&color=${encodeURIComponent(theme?.primaryHexColor || '#1890FF')}`;

  return {
    title,
    description,
    keywords: [
      officialFullName,
      'Infografis Parlemen',
      'Transparansi Anggaran',
      'Laporan Kinerja Dewan',
      party,
      dapil,
      'Data Kebijakan',
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

export default async function InfografisIndexPage({
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

  const { member, theme, recentInfographics = [] } = data;
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

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageTitle="Infografis Capaian Kinerja"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <BoldInfografisGalleryClient
            initialInfographics={recentInfographics}
            member={member}
            theme={effectiveTheme}
          />
        </div>
      </BoldTypographyShell>
    );
  }

  if (templateId === PortalTemplateId.DARK_MODERN || templateId === 'dark-modern') {
    return (
      <DarkModernShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageTitle="Infografis Capaian Kinerja"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <DarkModernInfografisGalleryClient
            initialInfographics={recentInfographics}
            member={member}
            theme={effectiveTheme}
          />
        </div>
      </DarkModernShell>
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW || templateId === 'neon-glow') {
    return (
      <NeonGlowShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageTitle="Infografis Capaian Kinerja"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <NeonGlowInfografisGalleryClient
            initialInfographics={recentInfographics}
            member={member}
            theme={effectiveTheme}
          />
        </div>
      </NeonGlowShell>
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL || templateId === 'clean-editorial') {
    return (
      <CleanEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageBadge="DATA & VISUALISASI KEBIJAKAN"
        pageTitle="Infografis Capaian & Akuntabilitas"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <CleanEditorialInfografisGalleryClient
            initialInfographics={recentInfographics}
            member={member}
            theme={effectiveTheme}
          />
        </div>
      </CleanEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM || templateId === 'creative-warm') {
    return (
      <CreativeWarmShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageBadge="Data & Visualisasi Kebijakan"
        pageTitle="Infografis Capaian & Akuntabilitas"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <CreativeWarmInfografisGalleryClient
            initialInfographics={recentInfographics}
            member={member}
            theme={effectiveTheme}
          />
        </div>
      </CreativeWarmShell>
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return (
      <FoliobloxShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="infografis"
        breadcrumbTitle="Infografis Kebijakan"
        pageBadge="Visualisasi Data Kebijakan"
        pageTitle="Visualisasi Data & Infografis Kebijakan"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <FoliobloxInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis Transparansi"
        pageBadge="DATA & TRANSPARANSI PUBLIK"
        pageTitle="Publikasi Infografis Kinerja"
        pageSubtitle={`Transparansi capaian pokok-pokok pikiran dewan, realisasi pengawasan anggaran daerah, dan akuntabilitas mandat publik di Daerah Pemilihan ${dapil}.`}
      >
        <StudioEditorialInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis Kebijakan"
        pageBadge="Visualisasi Data Kebijakan"
        pageTitle="Visualisasi Data & Infografis Kebijakan"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <WarmPortfolioInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="Data & Transparansi"
        pageTitle="Infografis Kinerja"
        pageSubtitle={`Ikhtisar visual pengawasan anggaran, serapan aspirasi, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <CrimsonNoirInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="Transparansi & Akuntabilitas"
        pageTitle="Infografis Capaian Kinerja"
        pageSubtitle={`Visualisasi data capaian legislasi, serapan aspirasi konstituen, dan pengawasan anggaran bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <GoldenSplitInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="Visualisasi Data Akuntabilitas"
        pageTitle="Infografis Kinerja Parlemen"
        pageSubtitle={`Ringkasan grafis pengawasan APBD, sebaran aspirasi daerah, dan rekapitulasi advokasi bagi warga ${dapil}.`}
      >
        <BlushEditorialInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
        />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberInfografisGalleryClient
        initialInfographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletInfografisGalleryClient
        initialInfographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyInfografisGalleryClient
        initialInfographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanInfografisGalleryClient
        initialInfographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyInfografisGalleryClient
        infographics={recentInfographics}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
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
        activePage="infografis"
        breadcrumbTitle="Infografis Kebijakan"
        pageBadge="Visualisasi Data Kebijakan"
        pageTitle="Visualisasi Data & Infografis Kebijakan"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <NayaEditorialInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis Capaian"
        pageBadge="Visualisasi & Akuntabilitas Data"
        pageTitle="Infografis & Akuntabilitas Data"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <MidnightGoldInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis Layanan"
        pageBadge="Visualisasi Layanan Kebijakan"
        pageTitle="Infografis Layanan & Akuntabilitas"
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <EmeraldTechInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="VISUALISASI DATA & TRANSPARANSI"
        pageTitle="Transparansi Parlemen Melalui Visualisasi Data."
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <QurifolioInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="VISUALISASI DATA & TRANSPARANSI"
        pageTitle="Transparansi Parlemen Melalui Visualisasi Data."
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <AmberPortfolioInfografisGalleryClient
          infographics={recentInfographics || []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="Transparansi Kinerja Parlemen"
        pageTitle="Infografis & Publikasi Data Terbuka"
        pageSubtitle={`Visualisasi data pokok-pokok pikiran, realisasi anggaran aspirasi konstituen, dan kinerja pengawasan legislatif di Daerah Pemilihan ${dapil}.`}
      >
        <CreatixLimeInfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="VISUALISASI DATA & TRANSPARANSI"
        pageTitle="Transparansi Parlemen Melalui Visualisasi Data."
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <MidnightLimeInfografisGalleryClient
          infographics={recentInfographics || []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        activePage="infografis"
        breadcrumbTitle="Infografis"
        pageBadge="VISUALISASI DATA & TRANSPARANSI"
        pageTitle="Transparansi Parlemen Melalui Visualisasi Data."
        pageSubtitle={`Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <PlatinumSlateInfografisGalleryClient
          infographics={recentInfographics || []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
        />
      </PlatinumSlateShell>
    );
  }

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="infografis"
      breadcrumbTitle="Infografis Capaian"
      pageTitle="Infografis Capaian Kinerja"
      pageSubtitle={dapil ? `Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat di Daerah Pemilihan ${dapil}.` : 'Ikhtisar visual berbasis data mengenai pengawasan anggaran, serapan aspirasi konstituen, dan realisasi program nyata bagi masyarakat.'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <InfografisGalleryClient
          initialInfographics={recentInfographics}
          member={member}
          theme={effectiveTheme}
        />
      </div>
    </ParliamentShell>
  );
}
