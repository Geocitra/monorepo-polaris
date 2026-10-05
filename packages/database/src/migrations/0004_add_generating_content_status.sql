-- =========================================================================
-- MIGRATION: 0004_add_generating_content_status.sql
-- DESCRIPTION: Add GENERATING state to content_status_enum for async jobs
-- =========================================================================

ALTER TYPE content_status_enum ADD VALUE IF NOT EXISTS 'GENERATING';

COMMENT ON TYPE content_status_enum IS 'Status siklus hidup konten: GENERATING, DRAFT, UNDER_REVIEW, PUBLISHED, UNPUBLISHED, ARCHIVED';
