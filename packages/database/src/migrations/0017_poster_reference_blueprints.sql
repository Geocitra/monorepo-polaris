-- Migration 0017: Create poster_reference_blueprints table
CREATE TABLE IF NOT EXISTS "poster_reference_blueprints" (
  "id" varchar(100) PRIMARY KEY,
  "name" varchar(150) NOT NULL,
  "reference_file" text NOT NULL,
  "archetype" varchar(60) NOT NULL,
  "description" text NOT NULL,
  "tags" text[] NOT NULL,
  "aspect_ratio" varchar(10) DEFAULT '4:5' NOT NULL,
  "color_palette" jsonb NOT NULL,
  "scene_prompt_hint" text NOT NULL,
  "negative_space_zone" text NOT NULL,
  "slot_manifest" jsonb NOT NULL,
  "fixed_constraints" jsonb,
  "variation_rules" jsonb,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_poster_blueprints_status" ON "poster_reference_blueprints" ("status");
CREATE INDEX IF NOT EXISTS "idx_poster_blueprints_archetype" ON "poster_reference_blueprints" ("archetype");

