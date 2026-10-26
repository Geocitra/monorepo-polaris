import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/api';
import { PortalTemplateId } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
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
import { NexoraVioletProfileClient } from '@/components/templates/nexora-violet';
import { XenonMintProfileClient } from '@/components/templates/xenon-mint';
import { TiaraBurgundyProfileClient } from '@/components/templates/tiara-burgundy';

import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import {
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  BarChart3,
  ArrowRight,
  Award,
  Compass,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  Users,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Profil Anggota Dewan - POLARIS' };

  return {
    title: `Profil & Rekam Jejak - ${data.member.fullName}`,
    description: `Biografi resmi, daerah pemilihan, visi pengabdian, dan rekam jejak kenegaraan ${data.member.fullName}.`,
  };
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
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  if (templateId === PortalTemplateId.BOLD_TYPOGRAPHY || templateId === 'bold-typography') {
    return (
      <BoldTypographyShell
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Pejabat Publik Terverifikasi • DPR RI"
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
        pageBadge="Pejabat Publik Terverifikasi • DPR RI"
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
        pageBadge="Pejabat Publik Terverifikasi • DPR RI"
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
        pageBadge="PROFIL LEGISLATIF"
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
        pageBadge="Profil & Rekam Jejak"
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
        pageBadge="Profil & Rekam Jejak Resmi"
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
        breadcrumbTitle="Tentang & Rekam Jejak"
        pageBadge="TENTANG PENGABDIAN"
        pageTitle="Profil & Rekam Jejak Dewan"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
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
        pageBadge="Profil & Rekam Jejak Resmi"
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
        pageBadge="Kenali Lebih Dekat"
        pageTitle="Profil & Rekam Jejak"
        pageSubtitle={`Biografi resmi, mandat keparlemenan, dan perjalanan pengabdian untuk masyarakat Daerah Pemilihan ${dapil}.`}
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
        pageBadge="Profil Legislator"
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Mengenal lebih dekat dedikasi, amanah keparlemenan, dan komitmen perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
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
        pageBadge="Profil Legislator"
        pageTitle="Profil & Dedikasi Pengabdian"
        pageSubtitle={`Biografi resmi, mandat keparlemenan, dan perjalanan pengabdian kenegaraan untuk masyarakat di Daerah Pemilihan ${dapil}.`}
      >
        <BlushEditorialProfileClient member={member} theme={effectiveTheme} subdomain={subdomain} />
      </BlushEditorialShell>
    );
  }

  if (templateId === PortalTemplateId.PARICHAY_AMBER || templateId === 'parichay-amber') {
    return (
      <ParichayAmberProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ORIX_VIOLET || templateId === 'orix-violet') {
    return (
      <OrixVioletProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.AGETHA_RUBY || templateId === 'agetha-ruby') {
    return (
      <AgethaRubyProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.WASHOSKI_CYAN || templateId === 'washoski-cyan') {
    return (
      <WashoskiCyanProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ARIK_NOIR || templateId === 'arik-noir') {
    return (
      <ArikNoirProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.ANIVIOX_EMERALD || templateId === 'aniviox-emerald') {
    return (
      <AnivioxEmeraldProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.LAILA_SAKURA || templateId === 'laila-sakura') {
    return (
      <LailaSakuraProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.NEXORA_VIOLET || templateId === 'nexora-violet') {
    return (
      <NexoraVioletProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === PortalTemplateId.XENON_MINT || templateId === 'xenon-mint') {
    return (
      <XenonMintProfileClient
        member={member}
        theme={effectiveTheme}
        subdomain={subdomain}
      />
    );
  }

  if (templateId === (PortalTemplateId as any).TIARA_BURGUNDY || templateId === 'tiara-burgundy') {
    return (
      <TiaraBurgundyProfileClient
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
        activePage="profil"
        breadcrumbTitle="Profil Dewan"
        pageBadge="Profil & Rekam Jejak Resmi"
        pageTitle="Profil & Rekam Jejak Dewan"
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
        pageBadge="Biografi & Rekam Jejak Resmi"
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
        pageBadge="Profil & Rekam Jejak Resmi"
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
        breadcrumbTitle="Tentang"
        pageBadge={`PROFIL ${officialFullName.toUpperCase()}`}
        pageTitle="Dedikasi Kami Mengawal Aspirasi & Kesejahteraan Rakyat."
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan rekam jejak dedikasi perjuangan masyarakat di Daerah Pemilihan ${dapil}.`}
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
        breadcrumbTitle="Profil Dewan"
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
        breadcrumbTitle="Profil Dewan"
        pageBadge="Mandat & Transparansi Publik"
        pageTitle="Profil & Rekam Jejak Pengabdian"
        pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
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
        breadcrumbTitle="Profil Dewan"
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
        breadcrumbTitle="Profil Dewan"
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
      theme={theme}
      subdomain={subdomain}
      activePage="profil"
      breadcrumbTitle="Profil Dewan"
      pageBadge="Pejabat Publik Terverifikasi • DPR RI"
      pageTitle="Profil & Rekam Jejak Dewan"
      pageSubtitle={`Biografi resmi, visi pengabdian kenegaraan, mandat keparlemenan, dan dedikasi perjuangan aspirasi masyarakat di Daerah Pemilihan ${dapil}.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* ========================================================= */}
        {/* SECTION 1: EXECUTIVE BIO CARD (Persis Kemewahan Negarawan) */}
        {/* ========================================================= */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Kolom Kiri: Foto Resmi Berwibawa */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Badge Verifikasi Kenegaraan */}
                <div className="absolute top-3.5 right-3.5 bg-[#96702c] text-white p-2 rounded-xl shadow-lg border border-amber-300/40">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>

                {/* Label DPR RI di Bawah Foto */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Mandat Perwakilan Rakyat
                  </div>
                  <div className="text-xs font-black truncate">
                    DPR RI • Dapil {dapil}
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Identitas & Visi Kenegaraan */}
            <div className="lg:col-span-8 space-y-5 text-left">
              {/* Badge Identitas Parlemen */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#96702c] text-xs font-bold border border-amber-200/80">
                  <Award className="w-3.5 h-3.5 text-[#96702c]" />
                  <span>Wakil Rakyat Terpilih • Fraksi {party}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dapil {dapil}</span>
                </span>
              </div>

              {/* Nama Lengkap & Gelar */}
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  {officialFullName}
                </h2>
                <p className="text-sm sm:text-base font-bold text-[#96702c] flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0 text-[#96702c]" />
                  <span>Anggota Dewan Perwakilan Rakyat Republik Indonesia</span>
                </p>
              </div>

              {/* Visi Pernyataan Sikap (Ivory Blockquote dengan Aksen Gold) */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-[#FBF9F5] border-l-4 border-[#96702c] border-y border-r border-amber-100/60 text-slate-700 space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#96702c] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Visi &amp; Komitmen Pengabdian</span>
                </div>
                {theme?.bioBiography ? (
                  <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-800">
                    {theme.bioBiography.split('\n\n').filter(Boolean).map((para: string, idx: number) => (
                      <p key={idx}>{para.trim()}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm italic leading-relaxed text-slate-800">
                    &ldquo;
                    Mendedikasikan seluruh amanah rakyat untuk memperjuangkan keadilan sosial, mendorong pemerataan infrastruktur ekonomi di daerah pemilihan, dan menegakkan fungsi pengawasan anggaran yang transparan dan akuntabel demi kesejahteraan bersama.
                    &rdquo;
                  </p>
                )}
              </div>

              {/* Counter Ribbon (Pencapaian Kinerja Parlemen) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500">Kehadiran Rapat</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">100%</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Paripurna & Komisi</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500">Telaah Regulasi</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">14 RUU</div>
                  <div className="text-[9px] text-[#96702c] font-bold">Inisiasi & Masukan</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500">Kunjungan Dapil</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">48+ Titik</div>
                  <div className="text-[9px] text-slate-600 font-bold">Reses & Sosialisasi</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-500">Advokasi Warga</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">1.200+</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Aspirasi Tuntas</div>
                </div>
              </div>

              {/* Quick Navigation Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/artikel"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Katalog Artikel Kebijakan</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>

                <Link
                  href="/infografis"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-[#96702c] border border-amber-200/80 text-xs font-bold transition"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#96702c]" />
                  <span>Lihat Infografis Kinerja</span>
                </Link>

                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition"
                >
                  <span>Kontak Staf Ahli</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: TIGA PILAR KOMITMEN PENGABDIAN                 */}
        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* SECTION 2: TIGA PILAR KOMITMEN PENGABDIAN                 */}
        {/* ========================================================= */}
        {(() => {
          const visionPillars =
            Array.isArray(theme?.layoutSchema?.visionMission) &&
            theme.layoutSchema.visionMission.length > 0
              ? theme.layoutSchema.visionMission
              : [
                  {
                    title: 'Fungsi Legislasi',
                    subtitle: 'Legislasikan Solusi Nyata',
                    description:
                      'Mengawal penyusunan regulasi dan undang-undang yang berpihak pada pertumbuhan ekonomi lokal, penyederhanaan perizinan UMKM, perlindungan tenaga kerja, dan kepastian hukum yang adil bagi seluruh masyarakat.',
                  },
                  {
                    title: 'Fungsi Anggaran',
                    subtitle: 'Pengawasan Anggaran Transparan',
                    description:
                      'Meneliti dan memastikan setiap alokasi APBN dan transfer ke daerah terealisasi secara tepat sasaran, bebas dari inefisiensi, serta benar-benar dirasakan manfaatnya melalui proyek infrastruktur jalan, sanitasi, dan fasilitas umum di Dapil.',
                  },
                  {
                    title: 'Fungsi Representasi',
                    subtitle: 'Pendampingan Konstituen Berkelanjutan',
                    description:
                      'Menjaga interaksi langsung bersama warga di akar rumput melalui agenda reses reguler, forum rembug desa, bantuan kemanusiaan darurat, serta advokasi langsung masalah agraria dan sosial kemasyarakatan.',
                  },
                ];

          const pillarIcons = [Compass, Building2, HeartHandshake];

          return (
            <section className="space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Pilar Fokus Pengabdian
                  </h2>
                  <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Prinsip Kerja Parlemen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visionPillars.map((pillar: any, pIdx: number) => {
                  const IconComp = pillarIcons[pIdx % pillarIcons.length] || Compass;
                  return (
                    <div
                      key={pIdx}
                      className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#96702c]/60 hover:shadow-md transition-all space-y-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#96702c] border border-amber-200/60 flex items-center justify-center font-black">
                        <IconComp className="w-6 h-6 text-[#96702c]" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-[#96702c] uppercase tracking-wider">
                          {pillar.title}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {pillar.subtitle || pillar.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* ========================================================= */}
        {/* SECTION 3: REKAM JEJAK PENDIDIKAN & KARIR PUBLIK          */}
        {/* ========================================================= */}
        {(() => {
          const formalEduList = member?.education
            ? member.education
                .split(/[\n,;]+/)
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [];

          const customCareers =
            Array.isArray(theme?.layoutSchema?.careers) &&
            theme.layoutSchema.careers.length > 0
              ? theme.layoutSchema.careers
              : null;

          return (
            <section className="space-y-6">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Riwayat Pengabdian &amp; Pendidikan
                  </h2>
                  <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kartu Riwayat Pendidikan */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-amber-200/60">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#96702c] flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5 text-[#96702c]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Riwayat Pendidikan Formal
                      </h3>
                      <p className="text-[11px] text-slate-500">Latar belakang keilmuan &amp; kepakaran</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formalEduList.length > 0 ? (
                      formalEduList.map((edu: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{edu}</div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Kredensial Pendidikan Terverifikasi
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Doktor (S3) Kebijakan Publik &amp; Tata Kelola
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Universitas Indonesia • Lulus dengan Predikat Pujian
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Master of Science (M.Sc.) Perencanaan Pembangunan
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              National University / Program Pascasarjana Terakreditasi
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Sarjana Teknik (S.T. / Ir.) Infrastruktur Sipil
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Institut Teknologi Terkemuka Indonesia
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Pendidikan Kepemimpinan Nasional (Lemhannas RI)
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Lembaga Ketahanan Nasional Republik Indonesia
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {member?.courses && member.courses.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/40">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                          Pelatihan &amp; Sertifikasi Keparlemenan:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.courses.map((course: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-[#96702c] border border-amber-200/80 text-[10px] font-semibold"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kartu Penugasan Parlemen & Organisasi */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#FBF9F5] border border-amber-100/80 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-amber-200/60">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#96702c] flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5 text-[#96702c]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Penugasan Parlemen &amp; Pengabdian
                      </h3>
                      <p className="text-[11px] text-slate-500">Alat kelengkapan dewan &amp; rekam jejak amanah</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {customCareers && customCareers.length > 0 ? (
                      customCareers.map((cItem: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{cItem.role}</div>
                            {cItem.period && (
                              <div className="text-[11px] text-[#96702c] font-semibold">
                                {cItem.period}
                              </div>
                            )}
                            {cItem.description && (
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                {cItem.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Anggota Dewan Perwakilan Rakyat RI (DPR RI)
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Periode 2024 – 2029 • Fraksi {party}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Anggota Komisi V (Infrastruktur &amp; Perhubungan)
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Mengawal program konektivitas jalur logistik &amp; bedah rumah rakyat
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Anggota Badan Anggaran (Banggar) DPR RI
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Pengawasan efektivitas belanja subsidi pupuk, pendidikan &amp; kesehatan
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#96702c] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Ketua Yayasan Pemberdayaan Ekonomi Konstituen
                            </div>
                            <div className="text-[11px] text-[#96702c] font-semibold">
                              Program inkubasi 250+ wirausaha muda dan UMKM lokal
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ========================================================= */}
        {/* SECTION 4: DOKUMENTASI KEGIATAN & FOTO PRIBADI            */}
        {/* ========================================================= */}
        {member?.photoGallery && member.photoGallery.length > 0 && (
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        )}

        {/* ========================================================= */}
        {/* SECTION 5: CALL TO ACTION ASPIRASI WARGA                  */}
        {/* ========================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-[#0B1528] to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#96702c]/20 text-amber-300 border border-[#96702c]/40 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Saluran Aspirasi Langsung Konstituen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tim sekretariat dan staf ahli dewan siap menerima laporan permasalahan jalan, bantuan sosial, pupuk subsidi, atau usulan perbaikan layanan publik di wilayah Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Buka Kanal Kontak &amp; Aspirasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ParliamentShell>
  );
}
