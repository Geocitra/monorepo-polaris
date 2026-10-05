ALTER TABLE media_discourses
  ADD COLUMN IF NOT EXISTS sector VARCHAR(50),
  ADD COLUMN IF NOT EXISTS relevance_score REAL,
  ADD COLUMN IF NOT EXISTS primary_keywords TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_media_discourses_policy_sector'
      AND conrelid = 'media_discourses'::regclass
  ) THEN
    ALTER TABLE media_discourses
      ADD CONSTRAINT chk_media_discourses_policy_sector
      CHECK (
        sector IS NULL OR sector IN (
          'FISKAL_ANGGARAN',
          'INFRASTRUKTUR_RUANG',
          'PANGAN_PERTANIAN',
          'SOSIAL_KEMISKINAN',
          'LAYANAN_DASAR',
          'TATA_KELOLA_HUKUM',
          'EKONOMI_KETENAGAKERJAAN',
          'LINGKUNGAN_BENCANA'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_media_discourses_relevance_score'
      AND conrelid = 'media_discourses'::regclass
  ) THEN
    ALTER TABLE media_discourses
      ADD CONSTRAINT chk_media_discourses_relevance_score
      CHECK (relevance_score IS NULL OR relevance_score BETWEEN 0 AND 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_media_discourses_sector_region
  ON media_discourses (sector, region_scope, published_at DESC);
