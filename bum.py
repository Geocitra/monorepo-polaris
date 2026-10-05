#!/usr/bin/env python3
# bum.py — Codebase Aggregator for Polaris Platform (Turborepo / TypeScript / Next.js / NestJS / AI Monorepo)
import os
import sys
import re
import argparse
import fnmatch
from datetime import datetime
from pathlib import Path
from typing import Set, List, Tuple

# Set console output encoding to UTF-8 to prevent UnicodeEncodeError on Windows
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


# =========================================================================
# CONFIGURATION CLASS (Information Expert)
# Konfigurasi penapisan terpusat untuk Polaris Platform Monorepo
# =========================================================================
class AggregatorConfig:
    DEFAULT_TARGET = str(Path(__file__).parent.resolve())
    DEFAULT_OUTPUT = f"{Path(__file__).parent.name}.txt"

    # 1. Folder Blacklist (Diabaikan secara mutlak)
    FORBIDDEN_DIRS = {
        # Package managers & Build output
        "node_modules", ".pnpm-store", ".yarn", "dist", "build", "out", ".next", ".turbo",
        ".swc", ".nuxt", ".cache", ".parcel-cache", ".vercel", "dist-ssr", ".expo",
        # Version control & IDE
        ".git", ".vscode", ".idea",
        # Test coverage & Temporary
        "coverage", "recovered", "temp", "tmp", "uploads", "geojson",
        # Python / Crawler environments
        "__pycache__", ".pytest_cache", ".venv", "venv", "env",
        # AI & Agent artifacts
        ".agents", ".claude", ".cursor", ".devin", ".gemini", ".antigravity"
    }

    # 2. Berkas Blacklist (Diabaikan secara mutlak)
    FORBIDDEN_FILES = {
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
        ".DS_Store", "Thumbs.db", "tsconfig.tsbuildinfo"
    }

    # 3. Ekstensi Berkas Teks yang Diizinkan (Fullstack TS / Next.js / NestJS / AI / DB / Docs)
    INCLUDE_EXTENSIONS = {
        ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
        ".json", ".jsonc",
        ".prisma", ".sql",
        ".yaml", ".yml",
        ".md", ".mdx",
        ".sh", ".bash", ".ps1",
        ".py",
        ".html", ".css", ".scss",
        ".mmd",
        ".graphql", ".gql"
    }

    # 4. Berkas Konfigurasi & Dokumentasi Penting (Root & Package Level)
    ESSENTIAL_ROOT_FILES = {
        "package.json", "pnpm-workspace.yaml", "turbo.json", "schema.sql",
        "tsconfig.json", "tsconfig.base.json", "tsconfig.build.json", "nest-cli.json",
        "next.config.ts", "next.config.js", "next.config.mjs",
        "postcss.config.mjs", "postcss.config.js",
        "tailwind.config.ts", "tailwind.config.js",
        "eslint.config.mjs", "eslint.config.js", ".eslintrc.js", ".eslintrc.json",
        "docker-compose.yml", "docker-compose.yaml", "Dockerfile",
        ".env.example", ".env.sample", ".env.template",
        "schema.prisma", "prisma.config.ts", "drizzle.config.ts", "components.json",
        "index.js", "server.js", "app.js", "nodemon.json",
        "jest.config.js", "vitest.config.ts", "vite.config.ts",
        ".prettierrc", ".prettierrc.json", ".prettierrc.js",
        ".gitignore", ".dockerignore", ".editorconfig",
        "README.md", "PROJECT_STATE.md", "AGENTS.md", "CLAUDE.md"
    }

    # Lowercase lookup set for case-insensitive match
    ESSENTIAL_ROOT_FILES_LOWER = {f.lower() for f in ESSENTIAL_ROOT_FILES}

    # 5. Batas Maksimum Ukuran Berkas per File (1.5 MB)
    MAX_FILE_SIZE_BYTES = 1536 * 1024  

    # Sensor Keamanan: Mencegah Kebocoran Kredensial / Secret Key / Private Key
    SENSITIVE_REGEX = re.compile(
        r"^(\.env($|\..+)|key.*\.pem|.*\.key|id_rsa.*|id_ed25519.*|.*\.pem|credentials.*|.*secret.*\.json|.*service-account.*\.json)$", 
        re.IGNORECASE
    )


# =========================================================================
# OPTIMIZER CLASS (Pure Fabrication)
# Pintu gerbang optimasi konten teks dan deteksi data biner
# =========================================================================
class LLMContextOptimizer:
    @staticmethod
    def strip_js_ts_comments(text: str) -> str:
        """Menghapus komentar // dan /* ... */ secara aman tanpa merusak string literal, regex, atau Dekorator NestJS."""
        pattern = re.compile(
            r'/\*.*?\*/|(?<!\\)//.*?$|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"|`(?:\\.|[^\\`])*`',
            re.DOTALL | re.MULTILINE
        )
        def replacer(match):
            s = match.group(0)
            if s.startswith('/') and not s.startswith('/"') and not s.startswith("/'"):
                return ""
            return s
        return re.sub(pattern, replacer, text)

    @staticmethod
    def strip_html_comments(text: str) -> str:
        """Menghapus komentar HTML <!-- ... -->."""
        return re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

    @classmethod
    def compress_code(cls, content: str, suffix: str = "", strip_comments: bool = True) -> str:
        """Menghapus spasi trailing, baris kosong ganda, komentar, dan JSDoc/HTML comments."""
        if strip_comments:
            if suffix in (".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".jsonc"):
                content = cls.strip_js_ts_comments(content)
            elif suffix in (".html", ".vue"):
                content = cls.strip_html_comments(content)

        lines = content.splitlines()
        optimized_lines = []
        previous_empty = False
        
        for line in lines:
            stripped = line.rstrip()
            is_empty = len(stripped) == 0
            
            if is_empty and previous_empty:
                continue
                
            optimized_lines.append(stripped)
            previous_empty = is_empty
            
        return "\n".join(optimized_lines)

    @staticmethod
    def is_binary(file_path: Path) -> bool:
        """Deteksi biner cepat dengan membaca 512 byte pertama."""
        try:
            with open(file_path, 'rb') as f:
                return b'\x00' in f.read(512)
        except Exception:
            return True


# =========================================================================
# AGGREGATOR CONTROLLER (GRASP Controller)
# Orkestrator utama penelusuran dan pembangunan bundel berkas teks
# =========================================================================
class CodebaseAggregator:
    def __init__(self, target_dir: str, output_name: str, strip_comments: bool = True, exclude_tests: bool = False):
        self.config = AggregatorConfig()
        self.optimizer = LLMContextOptimizer()
        self.strip_comments = strip_comments
        self.exclude_tests = exclude_tests
        
        # Penyelarasan Jalur Direktori Target
        self.target_path = Path(target_dir).resolve()
        if not self.target_path.is_dir():
            self.target_path = Path(__file__).parent.resolve()
            print(f"[SYSTEM] Target direktori tidak ditemukan. Menggunakan fallback di: {self.target_path}")

        # Jalur Berkas Output
        self.output_file = (self.target_path / output_name).resolve()
        
        # Mencegah skrip membaca berkas output atau dirinya sendiri
        self.config.FORBIDDEN_FILES.add(self.output_file.name)
        self.config.FORBIDDEN_FILES.add(Path(__file__).name)
        self.config.FORBIDDEN_FILES.add(f"{self.target_path.name}.txt")

        self.gitignore_patterns = self._parse_gitignore()

    def _parse_gitignore(self) -> List[str]:
        """Membaca berkas .gitignore sebagai daftar pola untuk pencocokan."""
        patterns = []
        gitignore_path = self.target_path / ".gitignore"
        if gitignore_path.exists():
            try:
                for line in gitignore_path.read_text("utf-8").splitlines():
                    line = line.strip()
                    if line and not line.startswith("#"):
                        patterns.append(line)
            except Exception as e:
                print(f"[WARN] Gagal mengurai .gitignore: {e}")
        return patterns

    def should_ignore(self, path: Path, is_dir: bool = False) -> bool:
        """Memeriksa apakah berkas atau folder harus diabaikan berdasarkan blacklist, pola rahasia, dan gitignore."""
        # 1. Bersihkan file sampah Windows NTFS Alternate Data Streams & metadata OS
        if "Zone.Identifier" in path.name or path.name.startswith("._"):
            return True

        try:
            rel_path = path.relative_to(self.target_path)
        except ValueError:
            rel_path = path
            
        parts = rel_path.parts
        if not parts:
            return False

        # 2. Cek folder blacklist bawaan pada seluruh tingkatan path
        for part in parts:
            if part in self.config.FORBIDDEN_DIRS:
                return True

        # 3. Cek berkas blacklist bawaan jika bukan direktori
        if not is_dir:
            if path.name in self.config.FORBIDDEN_FILES:
                return True
                
            # Izinkan template environment (.env.example, .env.sample, .env.template)
            if path.name.endswith(".example") or path.name.endswith(".sample") or path.name.endswith(".template"):
                pass
            elif self.config.SENSITIVE_REGEX.match(path.name):
                return True
                
            # Filter Berkas Pengujian jika parameter diaktifkan
            if self.exclude_tests:
                lower_name = path.name.lower()
                if "test" in lower_name or "spec" in lower_name:
                    if path.suffix in (".ts", ".tsx", ".js", ".jsx", ".ps1", ".py"):
                        return True

        # 4. Filter folder khusus pengujian jika parameter diaktifkan
        if self.exclude_tests and is_dir:
            if path.name in ("tests", "__tests__", "cypress", "playwright"):
                return True

        # 5. Cek kecocokan dengan pola gitignore
        rel_path_str = rel_path.as_posix()
        
        for pattern in self.gitignore_patterns:
            clean_pattern = pattern.lstrip('/')
            is_pattern_dir = pattern.endswith('/')
            match_pattern = clean_pattern.rstrip('/')
            
            if is_pattern_dir and not is_dir:
                continue
                
            if '/' in match_pattern:
                if fnmatch.fnmatch(rel_path_str, match_pattern) or fnmatch.fnmatch(rel_path_str, f"{match_pattern}/*"):
                    return True
            else:
                if any(fnmatch.fnmatch(part, match_pattern) for part in parts):
                    return True
                    
        return False

    def execute(self):
        print(f"🔍 Memulai penggabungan kode dari target: {self.target_path.as_posix()}")
        if self.strip_comments:
            print("✂️ Pembersihan komentar & JSDoc diaktifkan untuk berkas TS/JS/CSS.")
        if self.exclude_tests:
            print("🚫 Berkas pengujian (*.test.*, *.spec.*, test_*.py, test_*.ps1) diabaikan.")

        # Fase 1: Pindai dan kumpulkan berkas yang memenuhi syarat secara deterministik (terurut)
        files_to_bundle: List[Path] = []
        for root, dirs, files in os.walk(self.target_path):
            root_path = Path(root)

            # Pangkas & urutkan direktori yang diizinkan
            dirs[:] = sorted([d for d in dirs if not self.should_ignore(root_path / d, is_dir=True)])
            files.sort()

            for file_name in files:
                file_path = root_path / file_name

                # Sensor Keamanan, Blacklist & Gitignore
                if self.should_ignore(file_path, is_dir=False):
                    continue

                # Saring Ekstensi yang diizinkan atau Berkas Konfigurasi Penting
                is_allowed_ext = file_path.suffix.lower() in self.config.INCLUDE_EXTENSIONS
                is_essential_file = file_name.lower() in self.config.ESSENTIAL_ROOT_FILES_LOWER
                if not is_allowed_ext and not is_essential_file:
                    continue

                # Cheap Binary Guard
                if self.optimizer.is_binary(file_path):
                    continue

                # Size Guard
                try:
                    file_size = file_path.stat().st_size
                    if file_size > self.config.MAX_FILE_SIZE_BYTES:
                        rel = file_path.relative_to(self.target_path).as_posix()
                        print(f"[SKIP] Berkas melebihi batas ukuran ({format_size(file_size)}): {rel}")
                        continue
                    files_to_bundle.append(file_path)
                except Exception as e:
                    print(f"[WARN] Gagal membaca metadata berkas {file_name}: {e}")

        total_files = len(files_to_bundle)
        if total_files == 0:
            print("⚠️ Tidak ada berkas yang ditemukan untuk digabungkan.")
            return

        print(f"📋 Ditemukan {total_files} berkas siap diproses. Membangun bundel...")

        # Fase 2: Tulis Header, Daftar Isi (Table of Contents), dan Konten Berkas
        file_count = 0
        original_total_size = 0
        compressed_total_size = 0
        processed_files_stats: List[Tuple[str, int]] = []

        try:
            with open(self.output_file, "w", encoding="utf-8") as out_file:
                # Banner Polaris Platform
                out_file.write("=== POLARIS PLATFORM CODEBASE BUNDLE (TURBOREPO MONOREPO) ===\n")
                out_file.write(f"Generated at : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                out_file.write(f"Target Root  : {self.target_path.as_posix()}\n")
                out_file.write(f"Total Files  : {total_files}\n\n")

                # Daftar Isi / File Manifest untuk memudahkan LLM memahami arsitektur proyek
                out_file.write("--- TABLE OF CONTENTS ---\n")
                for idx, file_path in enumerate(files_to_bundle, 1):
                    rel = file_path.relative_to(self.target_path).as_posix()
                    sz = format_size(file_path.stat().st_size)
                    out_file.write(f"{idx:3d}. {rel:<65} [{sz}]\n")
                out_file.write("=" * 80 + "\n\n")

                # Penulisan Konten Berkas
                for file_path in files_to_bundle:
                    rel_posix = file_path.relative_to(self.target_path).as_posix()
                    file_size = file_path.stat().st_size

                    try:
                        content = file_path.read_text("utf-8", errors="ignore")
                        compressed_content = self.optimizer.compress_code(
                            content, 
                            suffix=file_path.suffix.lower(), 
                            strip_comments=self.strip_comments
                        )

                        # Tulis penanda batas berkas dan isinya
                        out_file.write(f"\n--- FILE: {rel_posix} ---\n")
                        out_file.write(compressed_content)
                        out_file.write("\n")

                        file_count += 1
                        comp_size = len(compressed_content.encode('utf-8'))
                        original_total_size += file_size
                        compressed_total_size += comp_size
                        
                        processed_files_stats.append((rel_posix, comp_size))
                        print(f"-> Menyalin & mengompresi: {rel_posix}")

                    except Exception as e:
                        print(f"-> Gagal memproses {rel_posix}: {e}")

            print(f"\n✅ Selesai! {file_count} Berkas berhasil disatukan di:\n   {self.output_file}")
            print(f"📊 Ukuran Asli: {format_size(original_total_size)}")
            print(f"🚀 Ukuran Kompresi (LLM Ready): {format_size(compressed_total_size)}")
            
            if original_total_size > 0:
                saving_percent = ((original_total_size - compressed_total_size) / original_total_size) * 100
                print(f"📉 Penghematan Ruang Konteks: ~{saving_percent:.1f}%")
                
            print(f"\n📦 Ringkasan: Monorepo Polaris Platform (apps, packages, doc) siap digunakan untuk konteks LLM.")

        except Exception as e:
            print(f"Critical Error: Gagal menulis berkas output: {e}")


# =========================================================================
# MAIN EXECUTION ENTRY POINT
# =========================================================================
if __name__ == "__main__":
    config_default = AggregatorConfig()

    parser = argparse.ArgumentParser(
        description="Polaris Platform Codebase Aggregator — Satukan & optimasi kode monorepo untuk konteks LLM"
    )
    parser.add_argument("--dir", type=str, default=config_default.DEFAULT_TARGET, help="Direktori target yang akan dipindai (default: direktori repo)")
    parser.add_argument("--out", type=str, default=config_default.DEFAULT_OUTPUT, help="Nama berkas keluaran (.txt) (default: polaris-platform.txt)")
    parser.add_argument("--keep-comments", action="store_true", help="Pertahankan komentar di dalam kode")
    parser.add_argument("--exclude-tests", action="store_true", help="Jangan sertakan berkas pengujian (*.test.*, *.spec.*, test_*.py, test_*.ps1)")
    
    args = parser.parse_args()

    aggregator = CodebaseAggregator(
        target_dir=args.dir, 
        output_name=args.out,
        strip_comments=not args.keep_comments,
        exclude_tests=args.exclude_tests
    )
    aggregator.execute()