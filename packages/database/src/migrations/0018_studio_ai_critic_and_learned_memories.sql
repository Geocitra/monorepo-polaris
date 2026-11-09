-- Migration 0018: Create studio_ai_critic_logs and studio_ai_learned_memories tables
CREATE TABLE IF NOT EXISTS "studio_ai_critic_logs" (
  "id" varchar(100) PRIMARY KEY,
  "tenant_id" varchar(100),
  "publication_id" varchar(100),
  "job_id" varchar(100),
  "archetype" varchar(60) NOT NULL,
  "layout_variant" integer DEFAULT 0,
  "topic" text NOT NULL,
  "overall_score" integer NOT NULL,
  "passed" boolean NOT NULL,
  "auto_repaired" boolean DEFAULT false NOT NULL,
  "checklist" jsonb NOT NULL,
  "critique_notes" jsonb NOT NULL,
  "remedy_instructions" text,
  "before_image_url" text,
  "final_image_url" text,
  "duration_ms" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_critic_logs_archetype" ON "studio_ai_critic_logs" ("archetype");
CREATE INDEX IF NOT EXISTS "idx_critic_logs_passed" ON "studio_ai_critic_logs" ("passed");
CREATE INDEX IF NOT EXISTS "idx_critic_logs_created" ON "studio_ai_critic_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_critic_logs_tenant" ON "studio_ai_critic_logs" ("tenant_id");

CREATE TABLE IF NOT EXISTS "studio_ai_learned_memories" (
  "id" varchar(100) PRIMARY KEY,
  "archetype" varchar(60) NOT NULL,
  "category" varchar(60) NOT NULL,
  "title" varchar(200) NOT NULL,
  "rule_instruction" text NOT NULL,
  "trigger_count" integer DEFAULT 1 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_learned_memories_archetype" ON "studio_ai_learned_memories" ("archetype");
CREATE INDEX IF NOT EXISTS "idx_learned_memories_active" ON "studio_ai_learned_memories" ("is_active");

