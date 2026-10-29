import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { ArtikelCatalogClient } from '@/components/templates/polaris-insight/ArtikelCatalogClient';
import { BoldTypographyShell, BoldArtikelCatalogClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernArtikelCatalogClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowArtikelCatalogClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialArtikelCatalogClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmArtikelCatalogClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioArtikelCatalogClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldArtikelCatalogClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechArtikelCatalogClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioArtikelCatalogClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioArtikelCatalogClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeArtikelCatalogClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateArtikelCatalogClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialArtikelCatalogClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirArtikelCatalogClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitArtikelCatalogClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialArtikelCatalogClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxArtikelCatalogClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialArtikelCatalogClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeArtikelCatalogClient } from '@/components/templates/creatix-lime';
import { ParichayAmberArtikelCatalogClient } from '@/components/templates/parichay-amber';
import { OrixVioletArtikelCatalogClient } from '@/components/templates/orix-violet';
import { AgethaRubyArtikelCatalogClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanArtikelCatalogClient } from '@/components/templates/washoski-cyan';
import { ArikNoirArtikelCatalogClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldArtikelCatalogClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraArtikelCatalogClient } from '@/components/templates/laila-sakura';
import { NexoraVioletArtikelCatalogClient } from '@/components/templates/nexora-violet';
import { XenonMintArtikelCatalogClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyArtikelCatalogClient } from '@/components/templates/tiara-burgundy';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Katalog Artikel - POLARIS' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const { member, theme, portal } = data;
  const officialFullName = member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Daerah Pemilihan';
  const party = member?.partyAffiliation || 'Parlemen';

  const title = `Katalog Artikel & Telaah Kebijakan - ${officialFullName}`;
  const description = `Arsip lengkap publikasi pemikiran, risalah kebijakan, naskah perundang-undangan, dan telaah regulasi ${officialFullName} untuk konstituen di ${dapil}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/artikel`
    : `${baseUrl}/${subdomain}/artikel`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(`Arsip Artikel & Telaah Kebijakan`)}&author=${encodeURIComponent(officialFullName)}&dapil=${encodeURIComponent(dapil)}&party=${encodeURIComponent(party)}&color=${encodeURIComponent(theme?.primaryHexColor || '#1890FF')}`;

  return {
    title,
    description,
    keywords: [
      officialFullName,
      'Artikel Parlemen',
      'Telaah Kebijakan',
      'Kajian APBD',
      'Regulasi Daerah',
      party,
      dapil,
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

export default async function ArtikelIndexPage({
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

  const { member, theme, recentArticles = [] } = data;
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

  const defaultArticles: any[] = [];


  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        breadcrumbTitle="Katalog Artikel"
        pageTitle="Katalog Artikel & Risalah Kebijakan"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <BoldArtikelCatalogClient
            initialArticles={recentArticles}
            defaultArticles={defaultArticles}
            officialFullName={officialFullName}
            subdomain={subdomain}
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
        activePage="artikel"
        breadcrumbTitle="Katalog Artikel"
        pageTitle="Katalog Artikel & Risalah Kebijakan"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <DarkModernArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageTitle="Katalog Artikel & Risalah Kebijakan"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <NeonGlowArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="PUBLIKASI & TELAAH KEBIJAKAN"
        pageTitle="Kajian & Risalah Pemikiran"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <CleanEditorialArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Program & Warta Resmi"
        pageTitle="Kajian Kebijakan & Risalah Parlemen"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <CreativeWarmArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Kajian & Gagasan Kebijakan"
        pageTitle="Gagasan & Kajian Kebijakan Publik"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <FoliobloxArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Risalah & Kajian"
        pageBadge="RISALAH & KEBIJAKAN"
        pageTitle="Kajian Kebijakan & Risalah Parlemen"
        pageSubtitle={`Arsip lengkap pemikiran strategis, naskah akademik raperda, dan analisis regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <StudioEditorialArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Kajian & Gagasan Kebijakan"
        pageTitle="Gagasan & Kajian Kebijakan Publik"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <WarmPortfolioArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="Gagasan & Risalah"
        pageTitle="Artikel & Kajian Kebijakan"
        pageSubtitle={`Arsip pemikiran strategis, analisis regulasi, dan catatan kerja parlemen dari ${officialFullName}.`}
      >
        <CrimsonNoirArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="Kajian & Gagasan Kebijakan"
        pageTitle="Artikel & Telaah Regulasi"
        pageSubtitle={`Kumpulan artikel, catatan sidang komisi, telaah APBD, dan pemikiran kebijakan publik dari ${officialFullName}.`}
      >
        <GoldenSplitArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="Publikasi & Risalah Kebijakan"
        pageTitle="Artikel & Kajian Publik"
        pageSubtitle={`Kumpulan catatan sidang, risalah advokasi perda, dan artikel telaah kebijakan publik dari ${officialFullName}.`}
      >
        <BlushEditorialArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
        />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyArtikelCatalogClient
        articles={recentArticles && recentArticles.length > 0 ? recentArticles : []}
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
        activePage="artikel"
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Kajian & Gagasan Kebijakan"
        pageTitle="Gagasan & Kajian Kebijakan Publik"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <NayaEditorialArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Kajian & Risalah Kebijakan"
        pageTitle="Kajian Kebijakan & Risalah Parlemen"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <MidnightGoldArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Katalog Artikel"
        pageBadge="Kajian Kebijakan Parlemen"
        pageTitle="Gagasan & Kajian Kebijakan Publik"
        pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
      >
        <EmeraldTechArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="GAGASAN & REGULASI PARLEMEN"
        pageTitle="Kajian Kebijakan Strategis & Publikasi Pemikiran Dewan."
        pageSubtitle={`Arsip komprehensif pemikiran strategis, naskah akademik, dan telaah regulasi perundang-undangan resmi dari ${officialFullName}.`}
      >
        <QurifolioArtikelCatalogClient
          articles={recentArticles || []}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="GAGASAN & REGULASI PARLEMEN"
        pageTitle="Kajian Kebijakan Strategis & Publikasi Pemikiran Dewan."
        pageSubtitle={`Arsip komprehensif pemikiran strategis, naskah akademik, dan telaah regulasi perundang-undangan resmi dari ${officialFullName}.`}
      >
        <AmberPortfolioArtikelCatalogClient
          articles={recentArticles || []}
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
        activePage="artikel"
        breadcrumbTitle="Risalah & Kebijakan"
        pageBadge="Risalah & Kebijakan Parlemen"
        pageTitle="Mewujudkan Gagasan Menjadi Kebijakan Nyata"
        pageSubtitle={`Arsip lengkap pemikiran strategis, naskah akademik regulasi, dan telaah perundang-undangan resmi dari ${officialFullName}.`}
      >
        <CreatixLimeArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
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
        breadcrumbTitle="Artikel"
        pageBadge="GAGASAN & REGULASI PARLEMEN"
        pageTitle="Kajian Kebijakan Strategis & Publikasi Pemikiran Dewan."
        pageSubtitle={`Arsip komprehensif pemikiran strategis, naskah akademik, dan telaah regulasi perundang-undangan resmi dari ${officialFullName}.`}
      >
        <MidnightLimeArtikelCatalogClient
          articles={recentArticles || []}
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
        activePage="artikel"
        breadcrumbTitle="Artikel"
        pageBadge="GAGASAN & REGULASI PARLEMEN"
        pageTitle="Kajian Kebijakan Strategis & Publikasi Pemikiran Dewan."
        pageSubtitle={`Arsip komprehensif pemikiran strategis, naskah akademik, dan telaah regulasi perundang-undangan resmi dari ${officialFullName}.`}
      >
        <PlatinumSlateArtikelCatalogClient
          articles={recentArticles && recentArticles.length > 0 ? recentArticles : defaultArticles}
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
      activePage="artikel"
      breadcrumbTitle="Katalog Artikel"
      pageTitle="Katalog Artikel & Risalah Kebijakan"
      pageSubtitle={`Arsip lengkap pemikiran strategis, analisis peraturan perundang-undangan, dan telaah regulasi kenegaraan resmi dari ${officialFullName}.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ArtikelCatalogClient
          initialArticles={recentArticles}
          defaultArticles={[]}
          officialFullName={officialFullName}
          subdomain={subdomain}
        />
      </div>
    </ParliamentShell>
  );
}
