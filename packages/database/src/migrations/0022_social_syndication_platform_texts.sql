-- Migration: 0022_social_syndication_platform_texts.sql
-- Description: Menambahkan kolom teks per-platform (Threads, TikTok, Facebook) pada social_syndication_packs.
-- Sebelumnya kolom ini hanya ada di scripts/db-migrate.mjs sehingga tidak pernah diterapkan oleh pipeline
-- deploy produksi (yang hanya menjalankan file *.sql di folder ini), menyebabkan error
-- `column "threads_text" does not exist` pada GET /studio/articles/:id dan webhook WhatsApp.
-- Idempoten: aman dijalankan berulang kali.

ALTER TABLE social_syndication_packs ADD COLUMN IF NOT EXISTS threads_text TEXT;
ALTER TABLE social_syndication_packs ADD COLUMN IF NOT EXISTS tiktok_caption TEXT;
ALTER TABLE social_syndication_packs ADD COLUMN IF NOT EXISTS facebook_post_text TEXT;

