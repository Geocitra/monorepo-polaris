'use client';

import React, { useState, useMemo } from 'react';
import {
  Layout,
  Lock,
  CheckCircle2,
  Sparkles,
  Code2,
  Flame,
  Zap,
  Sun,
  Landmark,
  Palette,
  Search,
  Grid,
  ListFilter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalTemplateId } from '@polaris/shared-types';

interface TemplateLayoutSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  planTier?: string | null;
  onUpgradePrompt?: () => void;
}

export type TemplateCategory = 'all' | 'flagship' | 'dark' | 'creative';

export const TEMPLATE_LAYOUTS = [
  {
    id: PortalTemplateId.POLARIS_INSIGHT,
    name: 'POLARIS Utama',
    tagline: 'Gedung DPR RI, Foto Standing & Infografis Akuntabilitas',
    description: 'Arsitektur utama berwibawa khas negarawan parlemen: Foto standing jas & peci resmi, siluet megah Gedung Parlemen DPR RI, 3 kartu artikel berita terkini, dan 4 infografis visualisasi anggaran & capaian.',
    icon: Landmark,
    category: 'flagship' as TemplateCategory,
    isPremium: false,
    previewBadge: 'Tersedia di Semua Paket',
  },
  {
    id: PortalTemplateId.PLATINUM_SLATE,
    name: 'POLARIS Apex',
    tagline: 'Liquid Chrome Accent, Ultra-Clean Slate & Stat Dock',
    description: 'Estetika kemewahan monokrom modern kelas atas berlatar slate pekat dengan aksen liquid chrome perak mengkilap, tipografi raksasa presisi, dermaga metrik 4 pilar, dan etalase kartu advokasi bertaraf studio.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Executive Suite',
  },
  {
    id: PortalTemplateId.DARK_MODERN,
    name: 'POLARIS Aurora',
    tagline: 'Monokrom Gelap, Center Cutout & Metrik Elegan',
    description: 'Desain monokrom gelap prestisius dengan foto cutout di tengah, ringkasan bio dan capaian samping, serta kartu risalah berestetika bersih.',
    icon: Code2,
    category: 'dark' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Dark Executive',
  },
  {
    id: PortalTemplateId.CLEAN_EDITORIAL,
    name: 'POLARIS Zenit',
    tagline: 'Monokrom Bersih, Lavender Circle & Tipografi Serif',
    description: 'Estetika editorial majalah minimalis dengan lingkaran lavender lembut di belakang cutout foto, strip kompetensi 4 pilar, poster integritas berbingkai, dan baris publikasi bersih.',
    icon: Sparkles,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Clean Studio',
  },
  {
    id: PortalTemplateId.EMERALD_TECH,
    name: 'POLARIS Orion',
    tagline: 'Onyx Dark, Cincin Zamrud Neon & Risalah Parlemen',
    description: 'Estetika dewan futuristik gelap beraksen hijau zamrud & cincin neon 3D, tipografi dwiwarna berwibawa, etalase artikel kajian kebijakan, dan galeri infografis data transparansi.',
    icon: Zap,
    category: 'dark' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Zamrud Parlemen',
  },
  {
    id: PortalTemplateId.BOLD_TYPOGRAPHY,
    name: 'POLARIS Antares',
    tagline: 'Tipografi Raksasa, High-Contrast & Data Transparansi',
    description: 'Teks raksasa kontras tinggi di belakang foto cutout profil, kurasi artikel telaah kebijakan resmi, serta etalase visual infografis capaian kinerja parlemen.',
    icon: Flame,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Brutalist Bold',
  },
  {
    id: PortalTemplateId.CREATIVE_WARM,
    name: 'POLARIS Terra',
    tagline: 'Nuansa Hangat Parlemen, Aksen Amber & Risalah Kebijakan',
    description: 'Latar ivory terang dengan aksen hangat amber di belakang foto cutout dewan, ticker transparansi berjalan, etalase artikel kajian kebijakan, dan galeri infografis data publik.',
    icon: Sun,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Parlemen Hangat',
  },
  {
    id: PortalTemplateId.NEON_GLOW,
    name: 'POLARIS Nova',
    tagline: 'Aura Halo Bercahaya & Kartu Floating Glass',
    description: 'Aura cincin gradasi neon futuristik di belakang foto cutout dewan, kartu kode mandat melayang, dan indikator progres bidang komisi.',
    icon: Zap,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Cyber Glow',
  },
  {
    id: PortalTemplateId.MIDNIGHT_GOLD,
    name: 'POLARIS Vega',
    tagline: 'Pitch Black, Aksen Kuning Emas & Risalah Parlemen',
    description: 'Estetika prestisius dewan gelap pekat dengan aksen kuning keemasan, tipografi watermark raksasa, etalase artikel kajian kebijakan publik, dan galeri poster infografis data transparansi.',
    icon: Sun,
    category: 'dark' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Midnight Gold',
  },
  {
    id: PortalTemplateId.MIDNIGHT_LIME,
    name: 'POLARIS Altair',
    tagline: 'Midnight Navy, Electric Lime Accent & Floating Cards',
    description: 'Estetika publikasi dewan bervibe navy futuristik dengan aksen hijau-kuning electric lime mencolok, kartu melayang keahlian, polaroid interaktif, dan grid kompetensi legislatif.',
    icon: Code2,
    category: 'dark' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Midnight Lime',
  },
  {
    id: PortalTemplateId.QURIFOLIO,
    name: 'POLARIS Sirius',
    tagline: 'Warm Sand, Giant Orange Asterisk & Scroll Badge',
    description: 'Estetika representasi dewan kreatif dua nada: latar pasir hangat dengan bintang oranye raksasa, tipografi bold berlapis, badge putar scroll down, dan kartu sorotan terpisah.',
    icon: Flame,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Sirius Contrast',
  },
  {
    id: PortalTemplateId.AMBER_PORTFOLIO,
    name: 'POLARIS Helios',
    tagline: 'Deep Charcoal, Fiery Amber Halo & Mockup Showcase',
    description: 'Estetika publikasi dewan modern berlatar arang pekat dengan aura gradasi amber berapi di belakang foto dewan, tipografi condensed raksasa, banner strip pengabdian, dan kartu etalase advokasi 2x2 berbingkai gawai.',
    icon: Flame,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Amber Sunset',
  },
  {
    id: PortalTemplateId.WARM_PORTFOLIO,
    name: 'POLARIS Sol',
    tagline: 'Warm Cream, Dual Capsule & Chamfered Cards',
    description: 'Estetika dewan modern dengan latar vanilla hangat, headline dua warna, stempel putar, dual capsule button, dan kartu layanan chamfered bersudut potong unik.',
    icon: Palette,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Warm Studio',
  },
  {
    id: PortalTemplateId.CREATIX_LIME,
    name: 'POLARIS Rigel',
    tagline: 'Floating White Hero, Lime Sunburst & Dual Capsule',
    description: 'Estetika panggung kontras tinggi berlatar obsidian gelap dengan kartu hero putih lengkung monolitik, sunburst hijau limau neon, etalase artikel kajian kebijakan, dan galeri infografis data transparansi.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Creatix Lime',
  },
  {
    id: PortalTemplateId.STUDIO_EDITORIAL,
    name: 'POLARIS Capella',
    tagline: 'Split 50/50 Warm Linen, Editorial Serif & Studio Showcase',
    description: 'Estetika editorial hangat terbelah 50/50: tipografi serif anggun di sisi kiri, potret studio hangat di sisi kanan dengan kartu aspirasi melayang, etalase 4 artikel 2x2, dan galeri infografis transparansi data.',
    icon: Palette,
    category: 'creative' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Warm Editorial',
  },
  {
    id: PortalTemplateId.FOLIOBLOX,
    name: 'POLARIS Folioblox',
    tagline: 'Sunset Orange Aura, Modern Noir & 4 Parliamentary Pillars',
    description: 'Estetika portofolio modern mutakhir dengan aura sunset jingga membara berlatar obsidian noir, siluet potret dewan karismatik, 4 pilar fokus parlemen (#01-#04), strip mitra lembaga, etalase artikel monokrom, dan galeri infografis APBD interaktif.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Sunset Aura',
  },
  {
    id: PortalTemplateId.NAYA_EDITORIAL,
    name: 'POLARIS Naya Editorial',
    tagline: 'Warm Almond Cream, Olive Arch & High-Contrast Editorial Serif',
    description: 'Estetika boutique editorial premium berlatar almond cream hangat, bingkai potret arch lengkung alami, headline serif kontras tinggi elegan, etalase artikel 3 kolom berbingkai kartu mewah, galeri infografis noir interaktif, serta banner kolaborasi aspirasi.',
    icon: Palette,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Naya Editorial',
  },
  {
    id: PortalTemplateId.CRIMSON_NOIR,
    name: 'POLARIS Crimson Noir',
    tagline: 'Obsidian Black, Crimson Red Accent & Bold Personal Portfolio',
    description: 'Estetika portofolio personal gelap berlatar obsidian hitam dengan aksen merah crimson tegas: hero sapaan "Halo, Saya Adalah", potret grayscale berbingkai merah, seksi "Siapa Saya" dengan chip mandat, 6 kartu fokus perjuangan, etalase artikel & infografis, serta banner ajakan kolaborasi.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Crimson Noir',
  },
  {
    id: PortalTemplateId.GOLDEN_SPLIT,
    name: 'POLARIS Golden Split',
    tagline: 'Charcoal Noir, Warm Golden Split Hero & 4-Pillar Gradient Cards',
    description: 'Estetika portofolio modern split 50/50: hero Charcoal gelap dan latar Amber Yellow solid dengan potret dewan, seksi "Tentang Saya" dengan kotak foto ber-outline emas offset di belakangnya, 4 kartu pilar pengabdian berwarna warni bergradasi (Cyan, Amber, Magenta, Emerald), serta etalase artikel dan infografis lengkap dengan gambar jelas.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Golden Split',
  },
  {
    id: PortalTemplateId.BLUSH_EDITORIAL,
    name: 'POLARIS Blush Editorial',
    tagline: 'Warm Linen, Terracotta Blush Arch & Dual-Tone Serif Editorial',
    description: 'Estetika editorial berkelas berlatar warm linen dan terracotta blush: hero dual-tone serif besar ("SUARA RAKYAT BERDEDIKASI"), potret dewan berbingkai arch oval soft sage dengan pin lokasi dapil, trust metrics bar melayang, 4 kartu vertikal pilar advokasi ber-container pastel, tools & alur kerja parlemen, serta etalase artikel dan infografis lengkap dengan gambar jelas.',
    icon: Palette,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Blush Editorial',
  },
  {
    id: PortalTemplateId.PARICHAY_AMBER,
    name: 'POLARIS Parichay Amber',
    tagline: 'Warm Sunburst Curve, Dual-Tone Hero & Interactive Performance Track Record',
    description: 'Estetika modern cerah bersahabat sesuai referensi Parichay: hero split putih berkurva lengkung dan blok Amber solid dengan potret dewan, seksi "Tentang Saya" dengan kotak foto ber-strip medsos vertikal, 3 metrik aspirasi dewan, indikator kemajuan (progress bars) fungsi parlemen dengan badge persentase hitam, serta etalase artikel dan infografis lengkap dengan gambar jelas.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Parichay Amber',
  },
  {
    id: PortalTemplateId.ORIX_VIOLET,
    name: 'POLARIS Orix Violet',
    tagline: 'Royal Violet Curve, Circular Framed Portrait & Clean 4-Metric Grid',
    description: 'Estetika modern futuristik berlatar Royal Violet (#3B0CB8) dengan kurva cembung melengkung, potret profil dewan berbingkai lingkaran dengan aksen ring kuning dan wireframe geometris, badge metrik melayang, seksi Tentang Saya dengan 4 kartu metrik berbingkai ungu khas dan tanda tangan digital, serta etalase artikel dan infografis publik visual lengkap.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Orix Violet',
  },
  {
    id: PortalTemplateId.AGETHA_RUBY,
    name: 'POLARIS Agetha Ruby',
    tagline: 'Obsidian Black, Bold Ruby Red Accent & High-Contrast 2x2 Showcase',
    description: 'Estetika modern gelap minimalis berlatar hitam obsidian (#0F0F0F) dengan aksen merah delima/ruby tegas (#E50914): hero "Hello Im" dengan potret dewan berdiri elegan, 3 kartu pilar fokus dengan kartu tengah merah solid menyala, metrik angka pengabdian raksasa, etalase artikel 2x2 bertaraf galeri, serta infografis publik dan banner CTA kolaborasi daerah.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Agetha Ruby',
  },
  {
    id: PortalTemplateId.WASHOSKI_CYAN,
    name: 'POLARIS Washoski Cyan',
    tagline: 'Pure Noir, Neon Cyan Laser Streak & 4-Pillar Modern Services',
    description: 'Estetika noir berkelas tinggi berlatar hitam pekat (#000000) dengan aksen neon cyan / mint elektrik (#05DFD7): hero artistik bergaris laser cyan, tanda tangan digital putih, strip dock institusi parlemen, seksi "What We Do" dengan 4 kartu berpendar cyan wireframe, etalase artikel & infografis publik beranimasi presisi.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Washoski Cyan',
  },
  {
    id: PortalTemplateId.ARIK_NOIR,
    name: 'POLARIS Arik Noir',
    tagline: 'Warm Pitch Black, Champagne Gold & Selected Work 2x2 Showcase',
    description: 'Estetika luxury dark editorial berlatar pitch black (#0A0A0A) dengan aksen warm champagne gold (#E8DCC4): navbar floating capsule pill, hero portrait dramatis dengan tipografi dual-font raksasa, strip logo institusi monokrom, 3 kartu pilar fokus kerja bernomor elegan, etalase artikel "Selected Work" 2x2 bertaraf studio, serta galeri infografis data publik lengkap.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Arik Noir',
  },
  {
    id: PortalTemplateId.ANIVIOX_EMERALD,
    name: 'POLARIS Aniviox Emerald',
    tagline: 'Deep Obsidian Pine, Vibrant Mint Glow & Rounded Architectural Hero Card',
    description: 'Estetika cyber-editorial gelap kelas atas berlatar obsidian pine (#060A08) dengan aksen hijau emerald menyala (#00F076): kartu hero lengkung raksasa (rounded-b-[56px]), potret dewan bersiluet aura emerald, tipografi tegas bertumpuk ("Wakil Rakyat Dekat & Berdampak"), 4 pilar advokasi bernomor (#01-#04), bar kemitraan parlemen, etalase artikel Our Approach dengan gambar cover jelas, serta galeri infografis poster publik interaktif.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Aniviox Emerald',
  },
  {
    id: PortalTemplateId.LAILA_SAKURA,
    name: 'POLARIS Laila Sakura',
    tagline: 'Midnight Navy, Vibrant Neon Pink Aura & Floating Sakura Capsule Nav',
    description: 'Estetika modern cyberpunk sakura berlatar midnight navy (#080D1A) dengan aksen hot neon pink menyala (#FF4D8D): navbar floating capsule pink soft, hero portrait dengan aura neon pink dramatis, tipografi 🌸 Hi, I\'m [Nama] 🌸 + teks pengetikan Suara Rakyat Aksi Nyata|, strip kemitraan parlemen, section About Me 3-kolom dengan ornamen kipas lipat tradisional sakura bercahaya, kartu filosofi pengabdian, etalase artikel Certificates bercover jelas, serta galeri infografis poster publik dengan ornamen tangkai bunga sakura.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Laila Sakura',
  },
  {
    id: PortalTemplateId.NEXORA_VIOLET,
    name: 'POLARIS Nexora Violet',
    tagline: 'Lilac Canvas, Split Massive Typography & Floating Violet Hero Container',
    description: 'Estetika modern street-editorial berlatar kanvas lilac lembut (#ECE6FD / #F4F0FF) dengan kontainer putih melengkung mewah: judul split raksasa ("Define Your STYLE" / "Own Your WORLD ✦") beraksen ungu violet (#7B61FF), kartu ungu melengkung dengan potret karismatik menghadap bahu, tombol jelajah hitam pill, badge 20K+ konstituen, kartu Featured Focus bercover jelas, etalase artikel publikasi, serta galeri infografis akuntabilitas dengan modal lightbox.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Nexora Violet',
  },
  {
    id: PortalTemplateId.XENON_MINT,
    name: 'POLARIS Xenon Mint',
    tagline: 'Obsidian Black Hero 100VH, Electric Neon Mint & Arch Framed Portrait',
    description: 'Estetika fintech modern kelas atas berlatar obsidian pekat (#081018) dengan aksen hijau neon mint menyala (#00E599): seksi hero fullscreen 100VH ("Unlock Public Trust ↗"), potret dewan dalam lengkungan arch mint, linimasa komitmen bergaris neon, stack konstituen 150K+, kartu artikel fitur lengkap dengan checklist keunggulan, etalase artikel publikasi, banner rekognisi/awards, serta galeri infografis data publik berfitur modal lightbox.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Xenon Mint',
  },
  {
    id: PortalTemplateId.TIARA_BURGUNDY,
    name: 'POLARIS Tiara Burgundy',
    tagline: 'Warm Cream Editorial, Deep Wine Burgundy & High-Fashion Magazine Cover',
    description: 'Estetika editorial majalah mewah berkelas internasional berlatar oat cream hangat (#EFEBE4) dengan tipografi display serif anggun berwarna wine burgundy (#6B1724): hero fullscreen 100VH ("HI, I\'m [Nama]"), potret karismatik dengan catatan coretan tangan (doodle arrows), seksi editorial bercerita dua kolom dengan foto polaroid berlakban, marquee tipografi "NILAI PENGABDIAN", kartu nilai-nilai integritas burgundy, serta etalase artikel dan galeri infografis data publik berfitur modal lightbox.',
    icon: Sparkles,
    category: 'flagship' as TemplateCategory,
    isPremium: true,
    previewBadge: 'Tiara Burgundy',
  },
];

export function TemplateLayoutSelector({
  selectedTemplateId,
  onSelectTemplate,
  planTier,
  onUpgradePrompt,
}: TemplateLayoutSelectorProps) {
  const isPremiumUnlocked = planTier === 'PRO';
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  const isTemplateMatch = (tplId: string, currentId?: string | null) => {
    if (!currentId) return false;
    if (tplId === currentId) return true;
    if (
      tplId === PortalTemplateId.POLARIS_INSIGHT &&
      (currentId === PortalTemplateId.STANDARD_DEFAULT || currentId === 'standard-default')
    ) {
      return true;
    }
    return false;
  };

  const activeTemplate = useMemo(() => {
    return (
      TEMPLATE_LAYOUTS.find((tpl) => isTemplateMatch(tpl.id, selectedTemplateId)) ||
      TEMPLATE_LAYOUTS[0]
    );
  }, [selectedTemplateId]);

  const filteredTemplates = useMemo(() => {
    return TEMPLATE_LAYOUTS.filter((tpl) => {
      const matchesQuery =
        searchQuery.trim() === '' ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [searchQuery]);

  const handleSelect = (template: typeof TEMPLATE_LAYOUTS[0]) => {
    if (template.isPremium && !isPremiumUnlocked) {
      if (onUpgradePrompt) {
        onUpgradePrompt();
      } else {
        alert('Tata letak eksklusif ini memerlukan Paket PRO (Eksekutif Suite).');
      }
      return;
    }
    onSelectTemplate(template.id);
  };

  const ActiveIcon = activeTemplate.icon;

  return (
    <div className="space-y-4">
      {/* ─── SECTION TITLE & SUMMARY ─── */}
      <div className="space-y-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Layout className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Tata Letak Website ({TEMPLATE_LAYOUTS.length} Template)</span>
          </label>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Pilih persona visual dan arsitektur publikasi website dewan Anda.
        </p>

        {/* View mode toggle & Search */}
        <div className="flex items-center gap-2 pt-0.5">
          {/* Quick search input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer',
                viewMode === 'detailed'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              title="Tampilan Kartu Lengkap"
            >
              <ListFilter className="w-3 h-3" />
              <span>Detail</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer',
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              title="Tampilan Grid Ringkas"
            >
              <Grid className="w-3 h-3" />
              <span>Ringkas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── ACTIVE TEMPLATE SPOTLIGHT CARD ─── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900/40 border border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                Layout Aktif
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {activeTemplate.previewBadge}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
              {activeTemplate.name}
            </h4>
            <p className="text-[10.5px] text-slate-600 dark:text-slate-300 truncate">
              {activeTemplate.tagline}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Terpasang</span>
        </div>
      </div>

      {/* ─── TEMPLATE CARDS LIST ─── */}
      {filteredTemplates.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tidak ada tema yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      ) : viewMode === 'detailed' ? (
        /* ─── DETAILED CARDS VIEW (1 COLUMN IN SIDEBAR: ALWAYS SPACIOUS & NO TRUNCATION) ─── */
        <div className="grid grid-cols-1 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isSelected = isTemplateMatch(tpl.id, selectedTemplateId);
            const isLocked = tpl.isPremium && !isPremiumUnlocked;

            return (
              <div
                key={tpl.id || `tpl-detail-${idx}`}
                onClick={() => handleSelect(tpl)}
                className={cn(
                  'relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none group',
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-2 ring-indigo-600/10'
                    : isLocked
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-85 hover:opacity-100 hover:border-slate-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isLocked
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                          {tpl.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          {tpl.tagline}
                        </p>
                      </div>
                    </div>

                    {isLocked ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-500" />
                        PRO
                      </span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : null}
                  </div>

                  <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9.5px]">
                  <span
                    className={cn(
                      'font-medium',
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : isLocked
                        ? 'text-amber-600 dark:text-amber-400 flex items-center gap-1'
                        : 'text-slate-400'
                    )}
                  >
                    {isSelected ? (
                      '● Sedang Aktif'
                    ) : isLocked ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5" />
                        Tingkatkan ke PRO
                      </>
                    ) : (
                      'Klik untuk pilih'
                    )}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[8.5px]">
                    {tpl.previewBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── COMPACT GRID VIEW (2 COLUMNS IN SIDEBAR) ─── */
        <div className="grid grid-cols-2 gap-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isSelected = isTemplateMatch(tpl.id, selectedTemplateId);
            const isLocked = tpl.isPremium && !isPremiumUnlocked;

            return (
              <div
                key={tpl.id ? `compact-${tpl.id}` : `tpl-compact-${idx}`}
                onClick={() => handleSelect(tpl)}
                className={cn(
                  'relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left group',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20 shadow-2xs'
                    : isLocked
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                )}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  {isLocked ? (
                    <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                  ) : isSelected ? (
                    <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 stroke-[3] shrink-0" />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {tpl.name}
                  </h5>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {tpl.tagline}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

