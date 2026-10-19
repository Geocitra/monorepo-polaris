#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
polaris_ai_architecture.py — POLARIS AI Generation & Visual Engine Codebase Aggregator
======================================================================================
Script agregator arsitektur khusus untuk membedah, mengekstrak, dan mendokumentasikan
seluruh logika alur bisnis, aturan desain, dan implementasi teknis dari sistem AI
pada POLARIS Platform (DPR/DPRD Parliamentary Intelligence & Creative Studio).

Mencakup:
1. ARSITEKTUR KANVAS 3-LAYER COMPOSITE (Scene L1 + Foto Asli L2 + Tipografi L3 + Logo L4)
2. PRE-ANALYZED BLUEPRINT & CONSTRAINED RNG (ATM: Amati, Tiru, Modifikasi)
3. PROMPT COMPILER (Fotografi Dokumenter 35mm, Clean Textless & Logoless)
4. BACKEND DETERMINISTIC COMPOSITOR (Sharp High-Speed Rendering < 800ms)
5. AUTONOMOUS RESEARCH & EVIDENCE ENGINE (Grounding Fakta Kebijakan & Anti-Halusinasi)
6. ASYNCHRONOUS WORKER QUEUE (BullMQ Studio Generation Processor)
7. DATABASE SCHEMA (Drizzle ORM: Identity, Content, Media Assets, Research, Theme)
8. FRONTEND STUDIO & INTERACTIVE CANVAS (Next.js Dashboard, PosterCanvas, Photo Catalog)
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
   - Model generatif (DALL-E 3 / Midjourney / Flux) TIDAK memiliki layout deterministik.
   - AI menghasilkan teks cacat, typo, huruf terbalik, dan bahasa alien.
   - Wajah anggota dewan jika digambar oleh AI menghasilkan deformasi (kartunis/deepfake),
     yang berisiko fatal terhadap reputasi politik dan melanggar etika kampanye.
   - Logo partai politik (Golkar, PDI-P, Gerindra, dll) atau lembaga (DPR/DPRD) selalu
     terdistorsi dan melanggar pakem resmi lambang negara/partai jika digenerate AI.

B. Paradigma Solusi: 3-Layer Composite Architecture:
   - LAYER 1 [Dasar / AI-Generated Canvas]:
     AI hanya bertugas menghasilkan karya fotografi dokumenter 35mm / risograph
     yang realistis dan humanis, TANPA TEKS, TANPA LOGO, dan dengan zona ruang
     kosong (negative space) yang terkontrol.
   - LAYER 2 [Tengah / Subjek Asli Tokoh]:
     Foto fisik asli anggota dewan dari Katalog Foto Profil (PNG transparan)
     ditempelkan ke kanvas dengan bayangan kontak alami (ambient drop-shadow) dan
     penyamaan pencahayaan (tone matching). Wajah 100% otentik.
   - LAYER 3 [Atas / Tipografi & Data Deterministik]:
     Seluruh teks judul (Bebas Neue / Anton), kutipan pernyataan, nama dewan,
     gelar, dan barcode editorial dirender langsung oleh kode program via SVG.
     100% tajam, pixel-perfect, dan bebas halusinasi.
   - LAYER 4 [Paling Depan / Logo Resmi Terkunci]:
     Logo partai dan logo lembaga (DPR RI/DPRD) ditempatkan di sudut aman
     (corner-locked) dari file SVG/PNG resmi dan dilarang keras digenerate AI.

2. METODOLOGI "ATM" (AMATI, TIRU, MODIFIKASI) & PRE-ANALYZED BLUEPRINT:
------------------------------------------------------------------------
- Sistem tidak menjiplak gambar referensi atau menempelkan overlay di atasnya.
- Sistem membedah seluruh referensi di `uploads/references/poster/` menjadi 8 Arketipe Modular:
  1. STREET_JOURNALISM      : Montase koran 3-kolom isu kerakyatan, pasar, duotone merah-hitam (POSTER PKL).
  2. POP_OUT_HERO          : Subjek menembus bingkai luar, judul interlocking di belakang bahu (THE EDGE).
  3. STATEMENT_PROFILE     : Potret karismatik dominan, kartu glassmorphism, kutipan visi (STEVE JOBS / B&W).
  4. RETRO_CAMPAIGN        : Format edukasi publik vintage 70s-80s dengan badge warna kontras (Poster Acara).
  5. TORN_PAPER_NEWS       : Broadsheet koran sobek tengah, 3 lingkaran data stat, 2 thumbnail crop (Techno Veritas / Malam Jago Merah).
  6. RETRO_SPLIT_MITIGATION: Infografis retro keselamatan publik, circular magnifier inset, split 2-kolom mitigasi (EARTHQUAKE INFOGRAFIS).
  7. MODULAR_GRID_CARDS    : 5 kartu framework analitis bernomor 01-05 dengan aksen blok merah dan multi-crop B&W (5 Modern Font Pairings).
  8. VINTAGE_PERSONA_GAZETTE: Broadsheet klasik koran sejarah krem, narasi panjang, dan multi-crop foto dokumentasi (The S News).

3. SINGLE-PASS MULTI-CROP STRATEGY (1x CALL AI IMAGE -> BANYAK SLOT GAMBAR):
-----------------------------------------------------------------------------
- Untuk poster kompleks dengan 2-5 sub-foto (misal thumbnail bawah di Malam Jago Merah atau 5 kartu di Modern Font),
  sistem TIDAK PERLU memanggil DALL-E berkali-kali.
- Sharp `MultiRegionCropper.extractSubRegions()` memotong koordinat spesifik dari 1 kanvas AI dasar (atau mengambil
  dari `tenantMembers.photoGallery` jika tersedia) secara lokal (< 50ms, Rp 0) dan menyuntikkannya ke tag `<img>` Satori.

4. RESEARCH & EVIDENCE ENGINE (GROUNDING KEBIJAKAN):
----------------------------------------------------
- Menghubungkan regulasi internal, berita media lokal, Crossref DOI, dan web discovery.
- Angka statistik dan pasal hukum hanya boleh diekstrak dari sumber terverifikasi.
- Diagram dan poin kebijakan dirender secara deterministik oleh sistem.
================================================================================
"""


class PolarisAiConfig:
    DEFAULT_OUTPUT = "polaris_ai_architecture.txt"

    # Kelompok Berkas Terstruktur (DB -> AI Engine -> Storage -> Worker -> Frontend)
    SECTIONS: Dict[str, List[str]] = {
        "1. DATABASE SCHEMA & PERSISTENCE (Drizzle ORM)": [
            "packages/database/src/schema/identity.ts",
            "packages/database/src/schema/content.ts",
            "packages/database/src/schema/cms.ts",
            "packages/database/src/schema/research.ts",
            "packages/database/src/schema/enums.ts",
        ],
        "2. CORE AI ENGINE & CREATIVE POSTER ARCHITECTURE": [
            "packages/ai-engine/src/creative-poster/types.ts",
            "packages/ai-engine/src/creative-poster/catalog.ts",
            "packages/ai-engine/src/creative-poster/selector.ts",
            "packages/ai-engine/src/creative-poster/prompt-compiler.ts",
            "packages/ai-engine/src/creative-poster/index.ts",
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
        "4. HIGH-SPEED DETERMINISTIC COMPOSITOR (Sharp Engine)": [
            "packages/storage/src/creative-poster-compositor.ts",
            "packages/storage/src/multi-region-cropper.ts",
            "packages/storage/src/image-optimizer.ts",
            "packages/storage/src/storage.adapter.ts",
        ],
        "5. BACKEND API CORE (NestJS Studio Module)": [
            "apps/api-core/src/modules/studio/studio.controller.ts",
            "apps/api-core/src/modules/studio/studio.service.ts",
            "apps/api-core/src/modules/studio/dto/studio.dto.ts",
            "apps/api-core/src/modules/studio/studio.module.ts",
        ],
        "6. ASYNCHRONOUS WORKER & QUEUE ORCHESTRATION (BullMQ)": [
            "apps/worker-crawler/src/processors/studio-generation.processor.ts",
            "apps/worker-crawler/src/queues/studio.queue.ts",
        ],
        "7. FRONTEND STUDIO & INTERACTIVE CANVAS (Next.js Dashboard)": [
            "apps/web-dashboard/src/app/studio/infografis/page.tsx",
            "apps/web-dashboard/src/components/studio/infografis/PosterCanvas.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicPromptBar.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicCanvas.tsx",
            "apps/web-dashboard/src/components/studio/infografis/InfographicTypes.ts",
            "apps/web-dashboard/src/components/profile/PersonalPhotoCatalog.tsx",
            "apps/web-dashboard/src/components/branding/DashboardThemeCustomizer.tsx",
        ],
    }


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate all AI generation and visual architecture files for Polaris Platform"
    )
    parser.add_argument(
        "-o", "--output",
        default=PolarisAiConfig.DEFAULT_OUTPUT,
        help="Path file output (.txt)"
    )
    args = parser.parse_args()

    project_root = Path(__file__).parent.resolve()
    output_path = project_root / args.output

    print(f"[*] Menelusuri seluruh berkas AI Engine, Compositor, DB, dan Studio di {project_root}...")

    total_files = 0
    total_bytes = 0
    missing_files = []

    with open(output_path, "w", encoding="utf-8") as out:
        # Tulis Header Blueprint
        out.write(ARCHITECTURE_BLUEPRINT.strip() + "\\n\\n")

        for section_title, file_list in PolarisAiConfig.SECTIONS.items():
            out.write("=" * 80 + "\\n")
            out.write(f"# BAGIAN: {section_title} ({len(file_list)} Berkas)\\n")
            out.write("=" * 80 + "\\n\\n")

            for rel_path in file_list:
                full_path = project_root / rel_path

                if not full_path.exists():
                    # Coba cari ekstensi .ts jika dicari .js
                    if rel_path.endswith(".js"):
                        alt_rel = rel_path[:-3] + ".ts"
                        alt_path = project_root / alt_rel
                        if alt_path.exists():
                            full_path = alt_path
                            rel_path = alt_rel

                if not full_path.exists():
                    missing_files.append(rel_path)
                    print(f"  [!] Berkas dilewati (tidak ditemukan): {rel_path}")
                    continue

                try:
                    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()

                    file_size = len(content.encode("utf-8"))
                    line_count = len(content.splitlines())

                    total_files += 1
                    total_bytes += file_size

                    out.write("=" * 70 + "\\n")
                    out.write(f"--- BERKAS: {rel_path} ({line_count} baris, {format_size(file_size)}) ---\\n")
                    out.write("=" * 70 + "\\n")
                    out.write(content + "\\n\\n")

                    print(f"  [+] Ditambahkan: {rel_path} ({line_count} baris, {format_size(file_size)})")
                except Exception as e:
                    print(f"  [x] Error membaca {rel_path}: {e}")

    print("\\n" + "=" * 60)
    print(f"[V] SELESAI! Agregasi Arsitektur AI POLARIS berhasil dibuat.")
    print(f"[*] Berkas Output : {output_path}")
    print(f"[*] Total Berkas  : {total_files} berkas")
    print(f"[*] Total Ukuran  : {format_size(total_bytes)}")
    if missing_files:
        print(f"[*] Dilewati      : {len(missing_files)} berkas")
    print("=" * 60)


if __name__ == "__main__":
    main()
