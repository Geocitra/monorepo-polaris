'use client';

import React from 'react';
import { PortalTemplateId } from '@polaris/shared-types';
import { BoldTypographyShell, BoldArtikelDetailClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernArtikelDetailClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowArtikelDetailClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialArtikelDetailClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmArtikelDetailClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioArtikelDetailClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldArtikelDetailClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechArtikelDetailClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioArtikelDetailClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioArtikelDetailClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeArtikelDetailClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateArtikelDetailClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialArtikelDetailClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirArtikelDetailClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitArtikelDetailClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialArtikelDetailClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxArtikelDetailClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialArtikelDetailClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeArtikelDetailClient } from '@/components/templates/creatix-lime';
import { ParichayAmberArtikelDetailClient } from '@/components/templates/parichay-amber';
import { OrixVioletArtikelDetailClient } from '@/components/templates/orix-violet';
import { AgethaRubyArtikelDetailClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanArtikelDetailClient } from '@/components/templates/washoski-cyan';
import { ArikNoirArtikelDetailClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldArtikelDetailClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraArtikelDetailClient } from '@/components/templates/laila-sakura';
import { NexoraVioletArtikelDetailClient } from '@/components/templates/nexora-violet';
import { XenonMintArtikelDetailClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyArtikelDetailClient } from '@/components/templates/tiara-burgundy';
import { DefaultParliamentArticleView } from './DefaultParliamentArticleView';

interface ArticleTemplateRendererProps {
  templateId: string;
  article: any;
  member: any;
  effectiveTheme: any;
  subdomain: string;
  recentArticles: any[];
  documents?: any[];
  slug: string;
}

export function ArticleTemplateRenderer({
  templateId,
  article,
  member,
  effectiveTheme,
  subdomain,
  recentArticles,
  slug,
}: ArticleTemplateRendererProps) {
  const relatedArticles = recentArticles?.filter((a: any) => a.slug !== slug);

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <BoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
        />
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
        showMasthead={false}
      >
        <DarkModernArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <NeonGlowArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <CleanEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <CreativeWarmArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <FoliobloxArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <StudioEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
        />
      </StudioEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.WARM_PORTFOLIO || templateId === 'warm-portfolio') {
    return (
      <WarmPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <WarmPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <CrimsonNoirArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <GoldenSplitArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <BlushEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
        />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        recentArticles={recentArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyArtikelDetailClient
        article={article}
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <NayaEditorialArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <MidnightGoldArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <EmeraldTechArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <QurifolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <AmberPortfolioArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <CreatixLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
        />
      </CreatixLimeShell>
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_LIME || templateId === 'midnight-lime') {
    return (
      <MidnightLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="artikel"
        showMasthead={false}
      >
        <MidnightLimeArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
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
        showMasthead={false}
      >
        <PlatinumSlateArtikelDetailClient
          article={article}
          member={member}
          theme={effectiveTheme}
          subdomain={subdomain}
          relatedArticles={relatedArticles}
        />
      </PlatinumSlateShell>
    );
  }

  // Fallback ke Default Parliament Insight View
  return (
    <DefaultParliamentArticleView
      member={member}
      effectiveTheme={effectiveTheme}
      subdomain={subdomain}
      article={article}
      slug={slug}
    />
  );
}

