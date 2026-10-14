'use client';

import React from 'react';
import { PortalSectionType, PortalTemplateId } from '@polaris/shared-types';
import { DEFAULT_PRESET_LAYOUTS, SectionDescriptor } from './SectionPresets';
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

interface DynamicSectionRendererProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  documents?: any[];
  subdomain?: string;
}

export function DynamicSectionRenderer({
  member,
  theme,
  recentArticles = [],
  documents = [],
  subdomain,
}: DynamicSectionRendererProps) {
  // 1. Resolve Layout Configuration (SDUI Schema or Preset Fallback)
  const templateId = theme?.layoutTemplateId || PortalTemplateId.POLARIS_INSIGHT;
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
