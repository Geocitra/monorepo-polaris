'use client';

import React from 'react';
import { PortalSectionType, PortalTemplateId } from '@polaris/shared-types';
import { DEFAULT_PRESET_LAYOUTS, SectionDescriptor } from './SectionPresets';
import { generateDynamicThemeCss } from '@/lib/dynamicThemeCss';
import { HeroFeaturedStory } from './HeroFeaturedStory';
import { HeroParliamentStand } from './HeroParliamentStand';
import { HeroVideoLoop } from './HeroVideoLoop';
import { ArticlesTrendingSidebar } from './ArticlesTrendingSidebar';
import { ArticlesCategoryGrid } from './ArticlesCategoryGrid';
import { DocumentsLibraryDock } from './DocumentsLibraryDock';
import { NewsletterSubscriptionBox } from './NewsletterSubscriptionBox';
import { PhotojournalismGallery } from './PhotojournalismGallery';
import { MetricsInfographicDock } from './MetricsInfographicDock';
import { CivicAspirationCTA } from './CivicAspirationCTA';
import {
  DarkModernTemplate,
  BoldTypographyTemplate,
  NeonGlowTemplate,
  CreativeWarmTemplate,
  CleanEditorialTemplate,
  PolarisInsightTemplate,
  WarmPortfolioTemplate,
  MidnightGoldTemplate,
  EmeraldTechTemplate,
  QurifolioTemplate,
  AmberPortfolioTemplate,
  MidnightLimeTemplate,
  PlatinumSlateTemplate,
  CreatixLimeTemplate,
  StudioEditorialTemplate,
  FoliobloxTemplate,
  NayaEditorialTemplate,
  CrimsonNoirTemplate,
  GoldenSplitTemplate,
  BlushEditorialTemplate,
  ParichayAmberTemplate,
  OrixVioletTemplate,
  AgethaRubyTemplate,
  WashoskiCyanTemplate,
  ArikNoirTemplate,
  AnivioxEmeraldTemplate,
  LailaSakuraTemplate,
  NexoraVioletTemplate,
  XenonMintTemplate,
  TiaraBurgundyTemplate,
} from '../templates';

interface DynamicSectionRendererProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function DynamicSectionRenderer({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: DynamicSectionRendererProps) {
  // 1. Resolve Layout Configuration with Instant Live Preview Support
  const [activeTemplateId, setActiveTemplateId] = React.useState<string>(
    theme?.layoutTemplateId || PortalTemplateId.DARK_MODERN
  );

  React.useEffect(() => {
    if (theme?.layoutTemplateId) {
      setActiveTemplateId(theme.layoutTemplateId);
    }
  }, [theme?.layoutTemplateId]);

  // Listen to instantaneous postMessage from dashboard live simulator
  React.useEffect(() => {
    function handleSimulatorMessage(event: MessageEvent) {
      if (event.data?.type === 'POLARIS_PREVIEW_TEMPLATE_CHANGE' && event.data?.templateId) {
        setActiveTemplateId(event.data.templateId);
      }
    }
    window.addEventListener('message', handleSimulatorMessage);
    return () => window.removeEventListener('message', handleSimulatorMessage);
  }, []);

  const [activePrimaryColor, setActivePrimaryColor] = React.useState<string>(
    theme?.primaryHexColor || '#1890FF'
  );

  React.useEffect(() => {
    if (theme?.primaryHexColor) {
      setActivePrimaryColor(theme.primaryHexColor);
    }
  }, [theme?.primaryHexColor]);

  // Listen to instantaneous postMessage from dashboard live simulator for color change
  React.useEffect(() => {
    function handleSimulatorColorMessage(event: MessageEvent) {
      if (event.data?.type === 'POLARIS_PREVIEW_COLOR_CHANGE' && event.data?.primaryHexColor) {
        setActivePrimaryColor(event.data.primaryHexColor);
      }
    }
    window.addEventListener('message', handleSimulatorColorMessage);
    return () => window.removeEventListener('message', handleSimulatorColorMessage);
  }, []);

  const templateId = activeTemplateId;
  const currentTheme = React.useMemo(() => ({
    ...theme,
    layoutTemplateId: activeTemplateId,
    primaryHexColor: activePrimaryColor,
  }), [theme, activeTemplateId, activePrimaryColor]);

  const dynamicCss = React.useMemo(
    () => generateDynamicThemeCss(activePrimaryColor),
    [activePrimaryColor]
  );

  const wrapWithTheme = (node: React.ReactNode) => (
    <div data-polaris-theme="true" className="w-full min-h-screen">
      {dynamicCss && (
        <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      )}
      {node}
    </div>
  );

  // Direct render for Standalone Custom Visual Templates
  if (templateId === PortalTemplateId.DARK_MODERN) {
    return wrapWithTheme(
      <DarkModernTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY) {
    return wrapWithTheme(
      <BoldTypographyTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW) {
    return wrapWithTheme(
      <NeonGlowTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM) {
    return wrapWithTheme(
      <CreativeWarmTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL) {
    return wrapWithTheme(
      <CleanEditorialTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WARM_PORTFOLIO || templateId === 'warm-portfolio') {
    return wrapWithTheme(
      <WarmPortfolioTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_GOLD || templateId === 'midnight-gold') {
    return wrapWithTheme(
      <MidnightGoldTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.EMERALD_TECH || templateId === 'emerald-tech') {
    return wrapWithTheme(
      <EmeraldTechTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.QURIFOLIO || templateId === 'qurifolio') {
    return wrapWithTheme(
      <QurifolioTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AMBER_PORTFOLIO || templateId === 'amber-portfolio') {
    return wrapWithTheme(
      <AmberPortfolioTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_LIME || templateId === 'midnight-lime') {
    return wrapWithTheme(
      <MidnightLimeTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.PLATINUM_SLATE || templateId === 'platinum-slate') {
    return wrapWithTheme(
      <PlatinumSlateTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.CREATIX_LIME || templateId === 'creatix-lime') {
    return wrapWithTheme(
      <CreatixLimeTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.STUDIO_EDITORIAL || templateId === 'studio-editorial') {
    return wrapWithTheme(
      <StudioEditorialTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return wrapWithTheme(
      <FoliobloxTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.CRIMSON_NOIR || templateId === 'crimson-noir') {
    return wrapWithTheme(
      <CrimsonNoirTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.GOLDEN_SPLIT || templateId === 'golden-split') {
    return wrapWithTheme(
      <GoldenSplitTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.BLUSH_EDITORIAL || templateId === 'blush-editorial') {
    return wrapWithTheme(
      <BlushEditorialTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return wrapWithTheme(
      <ParichayAmberTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return wrapWithTheme(
      <OrixVioletTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return wrapWithTheme(
      <AgethaRubyTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return wrapWithTheme(
      <WashoskiCyanTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return wrapWithTheme(
      <ArikNoirTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return wrapWithTheme(
      <AnivioxEmeraldTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return wrapWithTheme(
      <LailaSakuraTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return wrapWithTheme(
      <NexoraVioletTemplate
        member={member}
        theme={currentTheme}
        articles={recentArticles}
        infographics={recentInfographics}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return wrapWithTheme(
      <XenonMintTemplate
        member={member}
        theme={currentTheme}
        articles={recentArticles}
        infographics={recentInfographics}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return wrapWithTheme(
      <TiaraBurgundyTemplate
        member={member}
        theme={currentTheme}
        articles={recentArticles}
        infographics={recentInfographics}
        subdomain={subdomain}
      />
    );
  }


  if (
    templateId === PortalTemplateId.NAYA_EDITORIAL ||
    templateId === 'naya-editorial' ||
    templateId === 'naya-digital'
  ) {
    return wrapWithTheme(
      <NayaEditorialTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.POLARIS_INSIGHT || templateId === PortalTemplateId.STANDARD_DEFAULT) {
    return wrapWithTheme(
      <PolarisInsightTemplate
        member={member}
        theme={currentTheme}
        recentArticles={recentArticles}
        recentInfographics={recentInfographics}
        documents={documents}
        subdomain={subdomain}
      />
    );
  }

  const hasMatchingSchema =
    theme?.layoutSchema?.templatePreset === templateId &&
    Array.isArray(theme?.layoutSchema?.sections) &&
    theme.layoutSchema.sections.length > 0;

  const rawSections: SectionDescriptor[] = hasMatchingSchema
    ? theme.layoutSchema.sections
    : (DEFAULT_PRESET_LAYOUTS[templateId]?.sections || DEFAULT_PRESET_LAYOUTS[PortalTemplateId.POLARIS_INSIGHT].sections);

  // Filter enabled sections and sort by order
  const activeSections = [...rawSections]
    .filter((sec) => sec.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Determine lead article and remaining articles
  const leadArticle = recentArticles.length > 0 ? recentArticles[0] : undefined;
  const trendingArticles = recentArticles.slice(1, 5);
  const remainingArticles = recentArticles.length > 0 ? recentArticles : [];

  // Check section presence for intelligent co-location / 2-column layout
  const hasHeroStory = activeSections.some((s) => s.type === PortalSectionType.HERO_FEATURED_STORY);
  const hasHeroStand = activeSections.some((s) => s.type === PortalSectionType.HERO_PARLIAMENT_STAND);
  const hasHeroVideo = activeSections.some((s) => s.type === PortalSectionType.HERO_VIDEO_LOOP);
  const hasTrendingSidebar = activeSections.some((s) => s.type === PortalSectionType.ARTICLES_TRENDING_SIDEBAR);
  const hasDocLibrary = activeSections.some((s) => s.type === PortalSectionType.DOCUMENTS_LIBRARY);
  const hasNewsletter = activeSections.some((s) => s.type === PortalSectionType.NEWSLETTER_SUBSCRIPTION);

  // Flag to know if hero and sidebar should be grouped together at top
  const isTopPaired = (hasHeroStory || hasHeroVideo) && hasTrendingSidebar;
  // Flag to know if documents dock and newsletter should be grouped together
  const isBottomPaired = hasDocLibrary && hasNewsletter;

  // Track rendered section IDs to avoid duplicate rendering when grouped
  const renderedSectionIds = new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {activeSections.map((section) => {
        if (renderedSectionIds.has(section.id)) return null;

        // --- PAIR 1: TOP EDITORIAL DUO (Hero + Trending Sidebar) ---
        if (
          isTopPaired &&
          (section.type === PortalSectionType.HERO_FEATURED_STORY ||
            section.type === PortalSectionType.HERO_VIDEO_LOOP)
        ) {
          renderedSectionIds.add(section.id);
          const sidebarSection = activeSections.find(
            (s) => s.type === PortalSectionType.ARTICLES_TRENDING_SIDEBAR
          );
          if (sidebarSection) renderedSectionIds.add(sidebarSection.id);

          return (
            <div
              key={`editorial-top-duo-${section.id}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Main Column (8 cols): Hero Article or Ambient Video Loop */}
              <div className="lg:col-span-8">
                {section.type === PortalSectionType.HERO_FEATURED_STORY ? (
                  <HeroFeaturedStory
                    article={leadArticle}
                    member={member}
                    theme={theme}
                    config={section.config}
                    variant={section.variant}
                  />
                ) : (
                  <HeroVideoLoop
                    member={member}
                    theme={theme}
                    config={section.config}
                    variant={section.variant}
                  />
                )}
              </div>

              {/* Sidebar Column (4 cols): Trending Essays & Opinions */}
              <aside className="lg:col-span-4 sticky top-20">
                <ArticlesTrendingSidebar
                  articles={trendingArticles}
                  member={member}
                  theme={theme}
                  config={sidebarSection?.config}
                  variant={sidebarSection?.variant}
                />
              </aside>
            </div>
          );
        }

        // If sidebar is reached but already rendered in top pair, skip
        if (isTopPaired && section.type === PortalSectionType.ARTICLES_TRENDING_SIDEBAR) {
          return null;
        }

        // --- PAIR 2: BOTTOM RESOURCE DUO (Doc Library + Newsletter) ---
        if (isBottomPaired && section.type === PortalSectionType.DOCUMENTS_LIBRARY) {
          renderedSectionIds.add(section.id);
          const newsletterSection = activeSections.find(
            (s) => s.type === PortalSectionType.NEWSLETTER_SUBSCRIPTION
          );
          if (newsletterSection) renderedSectionIds.add(newsletterSection.id);

          return (
            <div
              key={`resource-bottom-duo-${section.id}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-slate-200"
            >
              {/* Doc Library Column (8 cols) */}
              <div className="lg:col-span-8">
                <DocumentsLibraryDock
                  documents={documents}
                  subdomain={subdomain}
                  member={member}
                  config={section.config}
                  variant={section.variant}
                />
              </div>

              {/* Newsletter Column (4 cols) */}
              <div className="lg:col-span-4 sticky top-20">
                <NewsletterSubscriptionBox
                  member={member}
                  theme={theme}
                  subdomain={subdomain}
                  config={newsletterSection?.config}
                  variant={newsletterSection?.variant}
                />
              </div>
            </div>
          );
        }

        if (isBottomPaired && section.type === PortalSectionType.NEWSLETTER_SUBSCRIPTION) {
          return null;
        }

        // --- INDIVIDUAL / FULL-WIDTH SECTIONS ---
        renderedSectionIds.add(section.id);

        switch (section.type) {
          case PortalSectionType.HERO_PARLIAMENT_STAND:
            return (
              <HeroParliamentStand
                key={section.id}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.HERO_FEATURED_STORY:
            return (
              <HeroFeaturedStory
                key={section.id}
                article={leadArticle}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.HERO_VIDEO_LOOP:
            return (
              <HeroVideoLoop
                key={section.id}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.ARTICLES_TRENDING_SIDEBAR:
            return (
              <div key={section.id} className="max-w-2xl mx-auto">
                <ArticlesTrendingSidebar
                  articles={trendingArticles}
                  member={member}
                  theme={theme}
                  config={section.config}
                  variant={section.variant}
                />
              </div>
            );

          case PortalSectionType.ARTICLES_CATEGORY_GRID:
            return (
              <ArticlesCategoryGrid
                key={section.id}
                articles={remainingArticles}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.METRICS_INFOGRAPHIC_DOCK:
            return (
              <MetricsInfographicDock
                key={section.id}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.PHOTOJOURNALISM_GALLERY:
            return (
              <PhotojournalismGallery
                key={section.id}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.DOCUMENTS_LIBRARY:
            return (
              <DocumentsLibraryDock
                key={section.id}
                documents={documents}
                subdomain={subdomain}
                member={member}
                config={section.config}
                variant={section.variant}
              />
            );

          case PortalSectionType.NEWSLETTER_SUBSCRIPTION:
            return (
              <div key={section.id} className="max-w-xl mx-auto">
                <NewsletterSubscriptionBox
                  member={member}
                  theme={theme}
                  subdomain={subdomain}
                  config={section.config}
                  variant={section.variant}
                />
              </div>
            );

          case PortalSectionType.CIVIC_ASPIRATION_CTA:
            return (
              <CivicAspirationCTA
                key={section.id}
                member={member}
                theme={theme}
                config={section.config}
                variant={section.variant}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
