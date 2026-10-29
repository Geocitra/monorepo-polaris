import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { KontakPageClient } from '@/components/templates/polaris-insight/KontakPageClient';
import { BoldTypographyShell } from '@/components/templates/bold-typography';
import { DarkModernShell } from '@/components/templates/dark-modern';
import { NeonGlowShell } from '@/components/templates/neon-glow';
import { CleanEditorialShell } from '@/components/templates/clean-editorial';
import { CreativeWarmShell } from '@/components/templates/creative-warm';
import { WarmPortfolioShell } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell } from '@/components/templates/midnight-gold';
import { EmeraldTechShell } from '@/components/templates/emerald-tech';
import { QurifolioShell } from '@/components/templates/qurifolio';
import { AmberPortfolioShell } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell } from '@/components/templates/platinum-slate';
import { NayaEditorialShell } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell } from '@/components/templates/crimson-noir';
import { GoldenSplitShell } from '@/components/templates/golden-split';
import { BlushEditorialShell } from '@/components/templates/blush-editorial';
import { FoliobloxShell } from '@/components/templates/folioblox';
import { StudioEditorialShell } from '@/components/templates/studio-editorial';
import { CreatixLimeShell } from '@/components/templates/creatix-lime';
import { ParichayAmberShell } from '@/components/templates/parichay-amber';
import { OrixVioletShell } from '@/components/templates/orix-violet';
import { AgethaRubyShell } from '@/components/templates/agetha-ruby';
import { WashoskiCyanShell } from '@/components/templates/washoski-cyan';
import { ArikNoirShell } from '@/components/templates/arik-noir';
import { AnivioxEmeraldShell } from '@/components/templates/aniviox-emerald';
import { LailaSakuraKontakClient } from '@/components/templates/laila-sakura';
import { NexoraVioletShell, NexoraVioletKontakClient } from '@/components/templates/nexora-violet';
import { XenonMintShell, XenonMintKontakClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyShell } from '@/components/templates/tiara-burgundy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Kontak Resmi - POLARIS' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const { member, theme, portal } = data;
  const officialFullName = member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Daerah Pemilihan';
  const party = member?.partyAffiliation || 'Parlemen';

  const title = `Kontak Resmi & Sekretariat - ${officialFullName}`;
  const description = `Kanal komunikasi resmi, hotline WhatsApp tim dewan, layanan aspirasi warga, serta posko pengaduan masyarakat bersama ${officialFullName} di ${dapil}.`;

  const canonicalUrl = portal?.customDomain
    ? `https://${portal.customDomain}/kontak`
    : `${baseUrl}/${subdomain}/kontak`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(`Kanal Komunikasi & Layanan Aspirasi`)}&author=${encodeURIComponent(officialFullName)}&dapil=${encodeURIComponent(dapil)}&party=${encodeURIComponent(party)}&color=${encodeURIComponent(theme?.primaryHexColor || '#1890FF')}`;

  return {
    title,
    description,
    keywords: [
      officialFullName,
      'Kontak Dewan',
      'Hotline WhatsApp',
      'Layanan Aspirasi Warga',
      'Posko Parlemen',
      party,
      dapil,
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

export default async function KontakPage({
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

  const { member, theme } = data;
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

  const renderContent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <KontakPageClient member={member} theme={effectiveTheme} subdomain={subdomain} />
    </div>
  );

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </BoldTypographyShell>
    );
  }

  if (templateId === PortalTemplateId.DARK_MODERN || templateId === 'dark-modern') {
    return (
      <DarkModernShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </DarkModernShell>
    );
  }

  if (templateId === PortalTemplateId.NEON_GLOW || templateId === 'neon-glow') {
    return (
      <NeonGlowShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </NeonGlowShell>
    );
  }

  if (templateId === PortalTemplateId.CLEAN_EDITORIAL || templateId === 'clean-editorial') {
    return (
      <CleanEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="KANAL KOLEKTIF & KOMUNIKASI RESMI"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </CleanEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIVE_WARM || templateId === 'creative-warm') {
    return (
      <CreativeWarmShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </CreativeWarmShell>
    );
  }

  if (templateId === PortalTemplateId.FOLIOBLOX || templateId === 'folioblox') {
    return (
      <FoliobloxShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Posko Pengaduan Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </FoliobloxShell>
    );
  }

  if (templateId === PortalTemplateId.STUDIO_EDITORIAL || templateId === 'studio-editorial') {
    return (
      <StudioEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Saluran Aspirasi & Kontak"
        pageBadge="SALURAN ASPIRASI AKTIF"
        pageTitle="Kontak Dewan & Sekretariat Parlemen"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir aspirasi warga Daerah Pemilihan ${dapil} bersama ${officialFullName}.`}
      >
        {renderContent}
      </WarmPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CRIMSON_NOIR || templateId === 'crimson-noir') {
    return (
      <CrimsonNoirShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="Mari Terhubung"
        pageTitle="Kontak & Posko Aspirasi"
        pageSubtitle={`Sampaikan gagasan, laporan persoalan daerah, masukan regulasi, atau permohonan audiensi langsung kepada ${officialFullName}.`}
        showCta={false}
      >
        {renderContent}
      </CrimsonNoirShell>
    );
  }

  if (templateId === PortalTemplateId.GOLDEN_SPLIT || templateId === 'golden-split') {
    return (
      <GoldenSplitShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="Posko Layanan Publik"
        pageTitle="Kontak & Saluran Aspirasi"
        pageSubtitle={`Sampaikan pengaduan, masukan kebijakan, atau permohonan audiensi langsung kepada ${officialFullName}.`}
      >
        {renderContent}
      </GoldenSplitShell>
    );
  }

  if (templateId === PortalTemplateId.BLUSH_EDITORIAL || templateId === 'blush-editorial') {
    return (
      <BlushEditorialShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="Posko Aspirasi & Pengaduan"
        pageTitle="Kontak & Saluran Aspirasi"
        pageSubtitle={`Sampaikan aspirasi warga, permohonan audiensi, serta usulan perbaikan layanan publik langsung kepada ${officialFullName}.`}
      >
        {renderContent}
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </ParichayAmberShell>
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </OrixVioletShell>
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </AgethaRubyShell>
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </WashoskiCyanShell>
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </ArikNoirShell>
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
      </AnivioxEmeraldShell>
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
      >
        {renderContent}
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Posko Aspirasi"
        pageBadge="Kanal Komunikasi Publik"
        pageTitle="Posko Aspirasi & Kanal Kontak Resmi"
        pageSubtitle={`Sampaikan gagasan, laporan persoalan lingkungan daerah, masukan regulasi daerah, serta permohonan audiensi langsung kepada ${officialFullName}.`}
      >
        {renderContent}
      </NayaEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.MIDNIGHT_GOLD || templateId === 'midnight-gold') {
    return (
      <MidnightGoldShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </MidnightGoldShell>
    );
  }

  if (templateId === PortalTemplateId.EMERALD_TECH || templateId === 'emerald-tech') {
    return (
      <EmeraldTechShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Komunikasi Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </EmeraldTechShell>
    );
  }

  if (templateId === PortalTemplateId.QURIFOLIO || templateId === 'qurifolio') {
    return (
      <QurifolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="LAYANAN ASPIRASI & KORESPONDENSI"
        pageTitle="Pintu Terbuka Saluran Komunikasi bagi Rakyat."
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </QurifolioShell>
    );
  }

  if (templateId === PortalTemplateId.AMBER_PORTFOLIO || templateId === 'amber-portfolio') {
    return (
      <AmberPortfolioShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="LAYANAN ASPIRASI & KORESPONDENSI"
        pageTitle="Pintu Terbuka Saluran Komunikasi bagi Rakyat."
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </AmberPortfolioShell>
    );
  }

  if (templateId === PortalTemplateId.CREATIX_LIME || templateId === 'creatix-lime') {
    return (
      <CreatixLimeShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Lokasi Aspirasi"
        pageBadge="Saluran Aspirasi Terbuka"
        pageTitle="Kontak Dewan & Posko Aspirasi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
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
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="LAYANAN ASPIRASI & KORESPONDENSI"
        pageTitle="Pintu Terbuka Saluran Komunikasi bagi Rakyat."
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </MidnightLimeShell>
    );
  }

  if (templateId === PortalTemplateId.PLATINUM_SLATE || templateId === 'platinum-slate') {
    return (
      <PlatinumSlateShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak"
        pageBadge="LAYANAN ASPIRASI & KORESPONDENSI"
        pageTitle="Pintu Terbuka Saluran Komunikasi bagi Rakyat."
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        {renderContent}
      </PlatinumSlateShell>
    );
  }

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="kontak"
      breadcrumbTitle="Kontak & Kanal Aspirasi"
      pageTitle="Kontak & Kanal Komunikasi Resmi"
      pageSubtitle={dapil ? `Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir penyampaian aspirasi konstituen Daerah Pemilihan ${dapil} bersama ${officialFullName}.` : `Kanal komunikasi langsung, hotline WhatsApp tim dewan, korespondensi resmi, dan formulir penyampaian aspirasi warga bersama ${officialFullName}.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <KontakPageClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </div>
    </ParliamentShell>
  );
}
