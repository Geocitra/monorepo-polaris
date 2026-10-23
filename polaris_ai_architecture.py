#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
polaris_ai_architecture.py — POLARIS AI Generation & Visual Engine Codebase Aggregator
======================================================================================
Script agregator arsitektur khusus untuk membedah, mengekstrak, dan mendokumentasikan
seluruh logika alur bisnis, aturan desain, pemrosesan generate gambar AI, dan seluruh
file template poster (23 Layouts, Sharp + Satori Compositor, Google Imagen 3, DALL-E)
pada POLARIS Platform (DPR/DPRD Parliamentary Intelligence & Creative Studio).

Mencakup:
1. ARSITEKTUR KANVAS 4-LAYER COMPOSITE (Scene L1 + Subjek L2 + Tipografi Vektor L3 + Logo L4)
2. PRE-ANALYZED BLUEPRINT & CONSTRAINED RNG (ATM: 22 Blueprint Arketipe Terverifikasi)
3. DUAL-ENGINE AI IMAGE GENERATION (Google Imagen 3 Native Negative Prompt + OpenAI DALL-E Failover)
4. SELURUH 23 TEMPLATE POSTER (Layout Satori/SVG Lengkap dari TPL-01 s/d TPL-22 + Standard)
5. BACKEND DETERMINISTIC COMPOSITOR (Sharp High-Speed Rendering, Subject Harmonizer, Font Loader)
6. AUTONOMOUS RESEARCH & EVIDENCE ENGINE (Grounding Fakta Kebijakan & Anti-Halusinasi)
7. ASYNCHRONOUS WORKER QUEUE (BullMQ Studio Full, Poster, & Infographic Handlers)
8. DATABASE SCHEMA (Drizzle ORM: Identity, Content, Media Assets, Research, Theme)
9. FRONTEND STUDIO & INTERACTIVE CANVAS (Next.js Dashboard, PosterCanvas, Photo Catalog)
10. TESTING & VERIFICATION SUITE (Scripts & Specs Uji Coba Render Poster)
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict

# Set console output encoding to UTF-8
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def format_size(bytes_num: int) -> str:
    """Format byte count into human-readable string."""
    if bytes_num < 1024:
        return f"{bytes_num} B"
    elif bytes_num < 1024 * 1024:
        return f"{bytes_num / 1024:.1f} KB"
    else:
        return f"{bytes_num / (1024 * 1024):.2f} MB"


# =============================================================================
# BLUEPRINT ARSITEKTUR & ATURAN BISNIS (DOCUMENTATION HEADER)
# =============================================================================
ARCHITECTURE_BLUEPRINT = """
================================================================================
  BLUEPRINT ARSITEKTUR & ATURAN BISNIS: POLARIS AI GENERATION & VISUAL ENGINE
================================================================================

1. FILOSOFI & LATAR BELAKANG BISNIS:
------------------------------------
A. Masalah Fundamental Generator Gambar AI Konvensional:
   - Model generatif murni (DALL-E 3 / Midjourney / Flux) TIDAK memiliki layout deterministik.
   - AI selalu menghasilkan teks cacat, typo, huruf terbalik, dan bahasa asing tidak terbaca.
   - Wajah anggota dewan jika digambar oleh AI menghasilkan deformasi (kartunis/deepfake),
     yang berisiko fatal terhadap reputasi politik dan melanggar etika kampanye.
   - Logo partai politik (Golkar, PDI-P, Gerindra, dll) atau lembaga (DPR/DPRD) selalu
     terdistorsi dan melanggar pakem resmi lambang negara/partai jika digenerate AI.

B. Paradigma Solusi: 4-Layer Composite Architecture:
   - LAYER 1 [Dasar / AI-Generated Canvas]:
     AI hanya bertugas menghasilkan karya fotografi dokumenter 35mm / risograph
     yang realistis dan humanis, TANPA TEKS, TANPA LOGO, dan dengan zona ruang
     kosong (negative space) yang terkontrol secara ketat.
   - LAYER 2 [Tengah / Subjek Asli Tokoh & Isolasi]:
     Foto fisik asli anggota dewan dari Katalog Foto Profil (PNG transparan)
     ditempelkan ke kanvas dengan bayangan kontak alami (ambient drop-shadow) dan
     penyamaan pencahayaan (tone matching via Sharp). Wajah 100% otentik.
   - LAYER 3 [Atas / Tipografi & Data Deterministik]:
     Seluruh teks judul (Bebas Neue / Anton / Oswald), kutipan pernyataan, nama dewan,
     gelar, kolom editorial, dan barcode dirender langsung oleh kode program via Satori + SVG.
     100% tajam, pixel-perfect, bebas halusinasi.
   - LAYER 4 [Paling Depan / Logo Resmi Terkunci]:
     Logo partai dan logo lembaga (DPR RI/DPRD) ditempatkan di sudut aman
     (corner-locked) dari file SVG/PNG resmi dan dilarang keras digenerate AI.

2. DUAL-ENGINE AI IMAGE GENERATION (GOOGLE IMAGEN 3 + OPENAI DALL-E):
---------------------------------------------------------------------
- Primary Generator: Google Imagen 3 (`imagen-3.0-generate-002`)
  - Mendukung negative prompt native: melarang teks, watermark, angka, logo, dan distorsi subjek.
  - Rasio aspek native 4:5 (1080x1350px) dan 9:16.
- Automatic Failover: OpenAI DALL-E 3 (`1024x1792` / `1024x1024`) jika kuota Google habis atau terjadi error API.
- Prompt Compiler menyuntikkan arahan sinematik: "atmospheric 35mm archival photography, editorial lighting, cinematic texture, high visual depth, clean empty negative space".

3. METODOLOGI "ATM" & 22 BLUEPRINT ARKETIPE POSTER MODULAR:
------------------------------------------------------------
Sistem membedah referensi desain menjadi 22 Arketipe Desain Terstruktur:
   1. POP_OUT_HERO           : TPL-01 "The Edge" (Subjek menerobos bingkai foto, judul besar di belakang bahu)
   2. STREET_JOURNALISM      : TPL-02 "POSTER PKL" (Duotone risograph merah-hitam, montase jurnalisme 3-kolom)
   3. STATEMENT_PROFILE      : TPL-03 "Steve Jobs" (Potret tokoh karismatik berwibawa, kutipan visi, monokrom/navy)
   4. RETRO_CAMPAIGN         : TPL-04 "Poster Acara" (Vintage 70s-80s, badge edukasi publik, warna retro)
   5. TORN_PAPER_NEWS        : TPL-05 "Techno Veritas" (Broadsheet koran sobek tengah, 3 lingkaran data stat, 2 thumbnail)
   6. RETRO_SPLIT_MITIGATION : TPL-06 "Earthquake Infografis" (Split 2-kolom mitigasi bencana, circular magnifier inset)
   7. MODULAR_GRID_CARDS     : TPL-07 "5 Modern Font Pairings" (5 kartu framework bernomor 01-05 dengan aksen blok)
   8. CONSTRUCTIVIST_BAUHAUS : TPL-08 "Design Trends 2026" (Manifesto konstruktivis, pita diagonal, tipografi brutal)
   9. THRESHOLD_RISOGRAPH    : TPL-09 "Design Poster / Oke Gas" (Kontras ekstrem kuning-hitam stensil sablon)
  10. SWISS_DUOTONE_EDITORIAL: TPL-10 "Modern Typography / Swiss" (Grid presisi internasional, hitam-putih minimalis)
  11. ISOMETRIC_CREATIVE     : TPL-11 "Creative Poster" (Badge stiker 3D pill modern, gradien kreatif)
  12. STORYBOOK_ILLUSTRATED  : TPL-12 "Fishing Poster" (Bingkai ornamen klasik, serif pastoral, konservasi lingkungan)
  13. TYPOGRAPHIC_MASK       : TPL-13 "Beautiful Poster" (Mask tipografi raksasa, white space luas dan bersih)
  14. KINETIC_MOTION         : TPL-14 "Fly High" (Garis kecepatan dinamis, sudut miring 12 derajat, oranye elektrik)
  15. EXECUTIVE_SEMINAR      : TPL-15 "Seminar Nasional" (Midnight navy & gold luxury, simposium kebijakan tinggi)
  16. TORN_VISION            : TPL-16 "Hold Your Vision" (Koyakan kertas diagonal pemisah gelap-terang)
  17. GALLERY_EXHIBITION     : TPL-17 "Chasing Portraits" (Plakat kurasi museum seni, tipografi editorial halus)
  18. POP_MAGAZINE_COLLAGE   : TPL-18 "Hello Tokyo" (Zine jalanan neo-tokyo, multi-box street pop culture)
  19. POLAROID_ADVENTURE     : TPL-19 "Go Wild" (Ekspedisi blusukan daerah, kartu polaroid, earth-tone hangat)
  20. VINTAGE_PERSONA_GAZETTE: TPL-20 "The S News" (Koran antik sejarah krem, narasi panjang, multi-photo)
  21. BROADSHEET_NEWSPAPER   : TPL-21 "Epoch Times" (Koran investigasi 3 kolom padat, lead editorial kuat)
  22. TECHNICAL_GRID_CALLOUT : TPL-22 "Hazard Callout" (Hazard yellow, grid teknis tajam, kutipan lugas)
  23. STANDARD_EDITORIAL     : Layout default fallback yang bersih, elegan, dan adaptif untuk semua topik.

4. SINGLE-PASS MULTI-CROP STRATEGY (1x CALL AI IMAGE -> BANYAK SLOT):
----------------------------------------------------------------------
- Untuk poster kompleks dengan 2-5 sub-foto, sistem TIDAK memanggil generator AI berkali-kali.
- Sharp `MultiRegionCropper.extractSubRegions()` memotong koordinat spesifik dari 1 kanvas AI dasar
  atau mengambil dari `tenantMembers.photoGallery` secara lokal (< 50ms, Rp 0) dan menyuntikkannya ke tag `<img>` Satori.

5. DETERMINISTIC SATORI + SHARP COMPOSITION PIPELINE:
-----------------------------------------------------
- Tipografi diukur dan dirender menggunakan font asli (.ttf): Bebas Neue, Anton, Oswald, Plus Jakarta Sans, Playfair Display.
- Menghasilkan output WebP/PNG beresolusi tinggi (1080x1350px) dalam waktu < 800ms.
================================================================================
"""


class PolarisAiConfig:
    DEFAULT_OUTPUT = "polaris_ai_architecture.txt"

    # Kelompok Berkas Terstruktur (DB -> AI Engine -> Layout Templates -> Compositor -> Workers -> Frontend -> Tests)
    SECTIONS: Dict[str, List[str]] = {
        "1. DATABASE SCHEMA & PERSISTENCE (Drizzle ORM)": [
            "packages/database/src/schema/identity.ts",
            "packages/database/src/schema/content.ts",
            "packages/database/src/schema/cms.ts",
            "packages/database/src/schema/research.ts",
            "packages/database/src/schema/enums.ts",
            "packages/database/src/schema/poster-blueprints.ts",
        ],
        "2. AI IMAGE GENERATION ENGINE & PROMPT COMPILER": [
            "packages/ai-engine/src/config/image-provider.config.ts",
            "packages/ai-engine/src/adapters/google-imagen.adapter.ts",
            "packages/ai-engine/src/creative-poster/types.ts",
            "packages/ai-engine/src/creative-poster/catalog.ts",
            "packages/ai-engine/src/creative-poster/palettes.ts",
            "packages/ai-engine/src/creative-poster/selector.ts",
            "packages/ai-engine/src/creative-poster/blueprint-repository.ts",
            "packages/ai-engine/src/creative-poster/composition-planner.ts",
            "packages/ai-engine/src/creative-poster/reference-vision-analyzer.ts",
            "packages/ai-engine/src/creative-poster/prompt-compiler.ts",
            "packages/ai-engine/src/creative-poster/index.ts",
            "packages/ai-engine/src/master-editorial-sanitizer.ts",
            "packages/ai-engine/src/ai-engine.adapter.ts",
            "packages/ai-engine/src/prompts.ts",
            "packages/ai-engine/src/client.ts",
            "packages/ai-engine/src/guardrails/prompt-sanitizer.ts",
            "packages/ai-engine/src/context-capsule.ts",
        ],
        "3. AUTONOMOUS RESEARCH & QUALITY GATES": [
            "packages/ai-engine/src/research/autonomous-research.orchestrator.ts",
            "packages/ai-engine/src/research/research-planner.engine.ts",
            "packages/ai-engine/src/research/claim-evidence.extractor.ts",
            "packages/ai-engine/src/research/deterministic-gates.ts",
            "packages/ai-engine/src/research/source-credibility.assessor.ts",
            "packages/ai-engine/src/two-stage-article.engine.ts",
        ],
        "4. CREATIVE POSTER LAYOUT TEMPLATES (ALL 23 LAYOUT DESIGNS)": [
            "packages/storage/src/creative-poster/layouts/pop-out-hero.layout.ts",
            "packages/storage/src/creative-poster/layouts/street-journalism.layout.ts",
            "packages/storage/src/creative-poster/layouts/statement-profile.layout.ts",
            "packages/storage/src/creative-poster/layouts/retro-campaign.layout.ts",
            "packages/storage/src/creative-poster/layouts/torn-paper-veritas.layout.ts",
            "packages/storage/src/creative-poster/layouts/retro-mitigation.layout.ts",
            "packages/storage/src/creative-poster/layouts/modular-cards.layout.ts",
            "packages/storage/src/creative-poster/layouts/constructivist-bauhaus.layout.ts",
            "packages/storage/src/creative-poster/layouts/threshold-risograph.layout.ts",
            "packages/storage/src/creative-poster/layouts/swiss-duotone-editorial.layout.ts",
            "packages/storage/src/creative-poster/layouts/isometric-creative-collage.layout.ts",
            "packages/storage/src/creative-poster/layouts/storybook-illustrated.layout.ts",
            "packages/storage/src/creative-poster/layouts/typographic-mask.layout.ts",
            "packages/storage/src/creative-poster/layouts/kinetic-motion.layout.ts",
            "packages/storage/src/creative-poster/layouts/executive-seminar.layout.ts",
            "packages/storage/src/creative-poster/layouts/torn-vision.layout.ts",
            "packages/storage/src/creative-poster/layouts/gallery-exhibition.layout.ts",
            "packages/storage/src/creative-poster/layouts/pop-magazine-collage.layout.ts",
            "packages/storage/src/creative-poster/layouts/polaroid-adventure.layout.ts",
            "packages/storage/src/creative-poster/layouts/vintage-gazette.layout.ts",
            "packages/storage/src/creative-poster/layouts/broadsheet-newspaper.layout.ts",
            "packages/storage/src/creative-poster/layouts/technical-grid-callout.layout.ts",
            "packages/storage/src/creative-poster/layouts/standard-editorial.layout.ts",
        ],
        "5. HIGH-SPEED DETERMINISTIC COMPOSITOR (Sharp & Satori Core Engine)": [
            "packages/storage/src/creative-poster/compositor.ts",
            "packages/storage/src/creative-poster/core/parametric-renderer.ts",
            "packages/storage/src/creative-poster/core/editorial-surface.ts",
            "packages/storage/src/creative-poster/core/variant-resolver.ts",
            "packages/storage/src/creative-poster/core/zone-sampler.ts",
            "packages/storage/src/creative-poster/core/font-loader.ts",
            "packages/storage/src/creative-poster/core/subject-harmonizer.ts",
            "packages/storage/src/creative-poster/core/adaptive-typography.ts",
            "packages/storage/src/creative-poster/primitives/index.ts",
            "packages/storage/src/creative-poster/primitives/masthead.primitive.ts",
            "packages/storage/src/creative-poster/primitives/headline.primitive.ts",
            "packages/storage/src/creative-poster/primitives/editorial-columns.primitive.ts",
            "packages/storage/src/creative-poster/primitives/stat-badges.primitive.ts",
            "packages/storage/src/creative-poster/primitives/photo-frame.primitive.ts",
            "packages/storage/src/creative-poster/primitives/member-signature.primitive.ts",
            "packages/storage/src/creative-poster/qa/index.ts",
            "packages/storage/src/creative-poster/qa/poster-visual-qa-gate.ts",
            "packages/storage/src/creative-poster/qa/revision-policy.ts",
            "packages/storage/src/creative-poster/types.ts",
            "packages/storage/src/creative-poster/index.ts",
            "packages/storage/src/creative-poster-compositor.ts",
            "packages/storage/src/multi-region-cropper.ts",
            "packages/storage/src/image-optimizer.ts",
            "packages/storage/src/storage.adapter.ts",
        ],
        "6. ASYNCHRONOUS WORKER & QUEUE ORCHESTRATION (BullMQ Poster Pipeline)": [
            "apps/worker-crawler/src/processors/studio-generation.processor.ts",
            "apps/worker-crawler/src/processors/studio/handlers/studio-poster-regeneration.handler.ts",
            "apps/worker-crawler/src/processors/studio/handlers/studio-infographic-generation.handler.ts",
            "apps/worker-crawler/src/processors/studio/handlers/studio-full-generation.handler.ts",
            "apps/worker-crawler/src/processors/studio/studio-context.helper.ts",
            "apps/worker-crawler/src/processors/studio/index.ts",
            "apps/worker-crawler/src/queues/studio.queue.ts",
        ],
        "7. BACKEND API CORE (NestJS Studio Module)": [
            "apps/api-core/src/modules/studio/studio.controller.ts",
            "apps/api-core/src/modules/studio/studio.service.ts",
            "apps/api-core/src/modules/studio/dto/studio.dto.ts",
            "apps/api-core/src/modules/studio/studio.module.ts",
        ],
        "8. FRONTEND STUDIO & INTERACTIVE POSTER CANVAS (Next.js Dashboard)": [
            "apps/web-dashboard/src/app/studio/infografis/page.tsx",
            "apps/web-dashboard/src/components/studio/infografis/PosterCanvas.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicPromptBar.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicCanvas.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicTypes.ts",
            "apps/web-dashboard/src/components/studio/editor/ArticlePosterSidebar.tsx",
            "apps/web-dashboard/src/components/profile/PersonalPhotoCatalog.tsx",
            "apps/web-dashboard/src/components/branding/DashboardThemeCustomizer.tsx",
        ],
        "9. CREATIVE POSTER VERIFICATION SUITE & SPECS": [
            "scripts/test-poster-render.ts",
            "scripts/test-poster-air-bersih.ts",
            "test-all-archetypes.mjs",
            "packages/ai-engine/test/creative-poster.spec.ts",
            "packages/ai-engine/test/blueprint-repository.spec.ts",
            "packages/ai-engine/test/reference-vision-analyzer.spec.ts",
            "packages/storage/test/creative-poster-compositor.spec.ts",
            "packages/storage/test/parametric-renderer.spec.ts",
            "packages/storage/test/adaptive-typography.spec.ts",
            "packages/storage/test/poster-visual-qa.spec.ts",
        ],
    }


def discover_dynamic_layouts(project_root: Path) -> List[str]:
    """
    Pencarian dinamis otomatis untuk menjamin seluruh file layout yang ada di folder
    packages/storage/src/creative-poster/layouts/ tercakup 100%, termasuk jika ada
    template baru yang ditambahkan di masa mendatang.
    """
    layout_dir = project_root / "packages" / "storage" / "src" / "creative-poster" / "layouts"
    if not layout_dir.exists():
        return []
    
    discovered = []
    for file in sorted(layout_dir.glob("*.layout.ts")):
        rel = str(file.relative_to(project_root)).replace("\\\\", "/")
        discovered.append(rel)
    return discovered


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate all AI generation and poster template architecture files for Polaris Platform"
    )
    parser.add_argument(
        "-o", "--output",
        default=PolarisAiConfig.DEFAULT_OUTPUT,
        help="Path file output (.txt)"
    )
    args = parser.parse_args()

    project_root = Path(__file__).parent.resolve()
    output_path = project_root / args.output

    print(f"[*] Menelusuri seluruh berkas AI Image Generation, Compositor, Template Poster, dan Studio di {project_root}...")

    # Tambahkan layout dinamis jika ada yang belum terdaftar di SECTIONS
    known_layouts = set(PolarisAiConfig.SECTIONS["4. CREATIVE POSTER LAYOUT TEMPLATES (ALL 23 LAYOUT DESIGNS)"])
    dynamic_layouts = discover_dynamic_layouts(project_root)
    for dl in dynamic_layouts:
        if dl not in known_layouts:
            PolarisAiConfig.SECTIONS["4. CREATIVE POSTER LAYOUT TEMPLATES (ALL 23 LAYOUT DESIGNS)"].append(dl)
            print(f"  [*] Menemukan layout template baru (auto-discovered): {dl}")

    total_files = 0
    total_bytes = 0
    missing_files = []
    processed_paths = set()

    with open(output_path, "w", encoding="utf-8") as out:
        # Tulis Header Blueprint
        out.write(ARCHITECTURE_BLUEPRINT.strip() + "\n\n")

        for section_title, file_list in PolarisAiConfig.SECTIONS.items():
            out.write("=" * 80 + "\n")
            out.write(f"# BAGIAN: {section_title} ({len(file_list)} Berkas)\n")
            out.write("=" * 80 + "\n\n")

            for rel_path in file_list:
                clean_rel = rel_path.replace("\\", "/")
                if clean_rel in processed_paths:
                    continue

                full_path = project_root / Path(clean_rel)

                if not full_path.exists():
                    # Coba cari ekstensi .ts jika dicari .js
                    if clean_rel.endswith(".js"):
                        alt_rel = clean_rel[:-3] + ".ts"
                        alt_path = project_root / Path(alt_rel)
                        if alt_path.exists():
                            full_path = alt_path
                            clean_rel = alt_rel

                if not full_path.exists():
                    missing_files.append(clean_rel)
                    print(f"  [!] Berkas dilewati (tidak ditemukan): {clean_rel}")
                    continue

                try:
                    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()

                    file_size = len(content.encode("utf-8"))
                    line_count = len(content.splitlines())

                    total_files += 1
                    total_bytes += file_size
                    processed_paths.add(clean_rel)

                    out.write("=" * 70 + "\n")
                    out.write(f"--- BERKAS: {clean_rel} ({line_count} baris, {format_size(file_size)}) ---\n")
                    out.write("=" * 70 + "\n")
                    out.write(content + "\n\n")

                    print(f"  [+] Ditambahkan: {clean_rel} ({line_count} baris, {format_size(file_size)})")
                except Exception as e:
                    print(f"  [x] Error membaca {clean_rel}: {e}")

    print("\n" + "=" * 60)
    print(f"[V] SELESAI! Agregasi Arsitektur AI & Template Poster POLARIS berhasil dibuat.")
    print(f"[*] Berkas Output : {output_path}")
    print(f"[*] Total Berkas  : {total_files} berkas")
    print(f"[*] Total Ukuran  : {format_size(total_bytes)}")
    if missing_files:
        print(f"[*] Dilewati      : {len(missing_files)} berkas")
    print("=" * 60)


if __name__ == "__main__":
    main()
