import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { KontakPageClient } from '@/components/templates/polaris-insight/KontakPageClient';
import { BoldTypographyShell, BoldKontakClient } from '@/components/templates/bold-typography';
import { DarkModernShell, DarkModernKontakClient } from '@/components/templates/dark-modern';
import { NeonGlowShell, NeonGlowKontakClient } from '@/components/templates/neon-glow';
import { CleanEditorialShell, CleanEditorialKontakClient } from '@/components/templates/clean-editorial';
import { CreativeWarmShell, CreativeWarmKontakClient } from '@/components/templates/creative-warm';
import { WarmPortfolioShell, WarmPortfolioKontakClient } from '@/components/templates/warm-portfolio';
import { MidnightGoldShell, MidnightGoldKontakClient } from '@/components/templates/midnight-gold';
import { EmeraldTechShell, EmeraldTechKontakClient } from '@/components/templates/emerald-tech';
import { QurifolioShell, QurifolioKontakClient } from '@/components/templates/qurifolio';
import { AmberPortfolioShell, AmberPortfolioKontakClient } from '@/components/templates/amber-portfolio';
import { MidnightLimeShell, MidnightLimeKontakClient } from '@/components/templates/midnight-lime';
import { PlatinumSlateShell, PlatinumSlateKontakClient } from '@/components/templates/platinum-slate';
import { NayaEditorialShell, NayaEditorialKontakClient } from '@/components/templates/naya-editorial';
import { CrimsonNoirShell, CrimsonNoirKontakClient } from '@/components/templates/crimson-noir';
import { GoldenSplitShell, GoldenSplitKontakClient } from '@/components/templates/golden-split';
import { BlushEditorialShell, BlushEditorialKontakClient } from '@/components/templates/blush-editorial';
import { FoliobloxShell, FoliobloxKontakClient } from '@/components/templates/folioblox';
import { StudioEditorialShell, StudioEditorialKontakClient } from '@/components/templates/studio-editorial';
import { CreatixLimeShell, CreatixLimeKontakClient } from '@/components/templates/creatix-lime';
import { ParichayAmberKontakClient } from '@/components/templates/parichay-amber';
import { OrixVioletKontakClient } from '@/components/templates/orix-violet';
import { AgethaRubyKontakClient } from '@/components/templates/agetha-ruby';
import { WashoskiCyanKontakClient } from '@/components/templates/washoski-cyan';
import { ArikNoirKontakClient } from '@/components/templates/arik-noir';
import { AnivioxEmeraldKontakClient } from '@/components/templates/aniviox-emerald';
import { LailaSakuraKontakClient } from '@/components/templates/laila-sakura';
import { NexoraVioletKontakClient } from '@/components/templates/nexora-violet';
import { XenonMintKontakClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyKontakClient } from '@/components/templates/tiara-burgundy';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Kontak Resmi - POLARIS' };

  return {
    title: `Kontak Resmi & Sekretariat - ${data.member.fullName}`,
    description: `Alamat kantor perwakilan dewan, layanan staf ahli, saluran aspirasi, dan media sosial resmi ${data.member.fullName}.`,
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
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Korespondensi & Layanan Konstituen"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <BoldKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Korespondensi & Layanan Konstituen"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <DarkModernKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Korespondensi & Layanan Konstituen"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <NeonGlowKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="KANAL KOLEKTIF & KOMUNIKASI RESMI"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <CleanEditorialKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <CreativeWarmKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Posko Pengaduan Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <FoliobloxKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        pageSubtitle={`Informasi alamat kantor perwakilan, rumah aspirasi Dapil ${dapil}, nomor pengaduan konstituen, dan layanan staf ahli dewan bersama ${officialFullName}.`}
      >
        <StudioEditorialKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <WarmPortfolioKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <CrimsonNoirKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <GoldenSplitKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <BlushEditorialKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldKontakClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
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
      <TiaraBurgundyKontakClient
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Posko Aspirasi"
        pageBadge="Kanal Komunikasi Publik"
        pageTitle="Posko Aspirasi & Kanal Kontak Resmi"
        pageSubtitle={`Sampaikan gagasan, laporan persoalan lingkungan daerah, masukan regulasi daerah, serta permohonan audiensi langsung kepada ${officialFullName}.`}
      >
        <NayaEditorialKontakClient
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
        activePage="kontak"
        breadcrumbTitle="Kontak & Sekretariat"
        pageBadge="Kanal Aspirasi & Kontak Resmi"
        pageTitle="Kontak & Sekretariat Resmi"
        pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
      >
        <MidnightGoldKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <EmeraldTechKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <QurifolioKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <AmberPortfolioKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <CreatixLimeKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <MidnightLimeKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
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
        <PlatinumSlateKontakClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </PlatinumSlateShell>
    );
  }

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="kontak"
      breadcrumbTitle="Kontak & Sekretariat"
      pageBadge="Kanal Korespondensi & Layanan Konstituen"
      pageTitle="Kontak & Sekretariat Resmi"
      pageSubtitle={`Informasi alamat kantor perwakilan, posko aspirasi konstituen Daerah Pemilihan ${dapil}, layanan staf ahli dewan, dan saluran komunikasi langsung bersama ${officialFullName}.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <KontakPageClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </div>
    </ParliamentShell>
  );
}
