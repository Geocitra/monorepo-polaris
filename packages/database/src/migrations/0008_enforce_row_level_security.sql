CREATE OR REPLACE FUNCTION polaris_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN RETURN NULL;
END;
$$;

ALTER TABLE content_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_publications FORCE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE social_syndication_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_syndication_packs FORCE ROW LEVEL SECURITY;
ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE portal_theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_theme_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links FORCE ROW LEVEL SECURITY;
ALTER TABLE constituent_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituent_feedbacks FORCE ROW LEVEL SECURITY;
ALTER TABLE encrypted_pii_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_pii_vaults FORCE ROW LEVEL SECURITY;
ALTER TABLE member_writing_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_writing_memories FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_publications_tenant_access ON content_publications;
DROP POLICY IF EXISTS content_publications_read ON content_publications;
CREATE POLICY content_publications_read ON content_publications
  FOR SELECT
  USING (
    tenant_id = polaris_current_tenant_id()
    OR (
      status = 'PUBLISHED'
      AND EXISTS (
        SELECT 1 FROM portal_configs pc
        WHERE pc.tenant_id = content_publications.tenant_id
          AND pc.is_active = true
      )
    )
  );
CREATE POLICY content_publications_tenant_access ON content_publications
  FOR ALL
  USING (tenant_id = polaris_current_tenant_id())
  WITH CHECK (tenant_id = polaris_current_tenant_id());

DROP POLICY IF EXISTS media_assets_tenant_access ON media_assets;
DROP POLICY IF EXISTS media_assets_read ON media_assets;
CREATE POLICY media_assets_read ON media_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = media_assets.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
    OR EXISTS (
      SELECT 1 FROM content_publications cp
      JOIN portal_configs pc ON pc.tenant_id = cp.tenant_id
      WHERE cp.id = media_assets.publication_id
        AND cp.status = 'PUBLISHED'
        AND pc.is_active = true
    )
  );
CREATE POLICY media_assets_tenant_access ON media_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = media_assets.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = media_assets.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS social_packs_tenant_access ON social_syndication_packs;
DROP POLICY IF EXISTS social_packs_read ON social_syndication_packs;
CREATE POLICY social_packs_read ON social_syndication_packs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = social_syndication_packs.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
    OR EXISTS (
      SELECT 1 FROM content_publications cp
      JOIN portal_configs pc ON pc.tenant_id = cp.tenant_id
      WHERE cp.id = social_syndication_packs.publication_id
        AND cp.status = 'PUBLISHED'
        AND pc.is_active = true
    )
  );
CREATE POLICY social_packs_tenant_access ON social_syndication_packs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = social_syndication_packs.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_publications cp
      WHERE cp.id = social_syndication_packs.publication_id
        AND cp.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS portal_configs_public_read ON portal_configs;
CREATE POLICY portal_configs_public_read ON portal_configs
  FOR SELECT
  USING (is_active = true);
DROP POLICY IF EXISTS portal_configs_tenant_access ON portal_configs;
CREATE POLICY portal_configs_tenant_access ON portal_configs
  FOR ALL
  USING (tenant_id = polaris_current_tenant_id())
  WITH CHECK (tenant_id = polaris_current_tenant_id());

DROP POLICY IF EXISTS portal_themes_read ON portal_theme_settings;
CREATE POLICY portal_themes_read ON portal_theme_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = portal_theme_settings.portal_id
        AND (pc.is_active = true OR pc.tenant_id = polaris_current_tenant_id())
    )
  );
DROP POLICY IF EXISTS portal_themes_tenant_write ON portal_theme_settings;
CREATE POLICY portal_themes_tenant_write ON portal_theme_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = portal_theme_settings.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = portal_theme_settings.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS social_links_read ON social_links;
CREATE POLICY social_links_read ON social_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = social_links.portal_id
        AND (pc.is_active = true OR pc.tenant_id = polaris_current_tenant_id())
    )
  );
DROP POLICY IF EXISTS social_links_tenant_write ON social_links;
CREATE POLICY social_links_tenant_write ON social_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = social_links.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = social_links.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS constituent_feedback_read ON constituent_feedbacks;
CREATE POLICY constituent_feedback_read ON constituent_feedbacks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = constituent_feedbacks.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
    OR tracking_ticket_code = current_setting('app.public_feedback_ticket', true)
  );
DROP POLICY IF EXISTS constituent_feedback_public_insert ON constituent_feedbacks;
CREATE POLICY constituent_feedback_public_insert ON constituent_feedbacks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = constituent_feedbacks.portal_id
        AND pc.is_active = true
    )
  );
DROP POLICY IF EXISTS constituent_feedback_tenant_write ON constituent_feedbacks;
CREATE POLICY constituent_feedback_tenant_write ON constituent_feedbacks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = constituent_feedbacks.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = constituent_feedbacks.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );
DROP POLICY IF EXISTS constituent_feedback_tenant_delete ON constituent_feedbacks;
CREATE POLICY constituent_feedback_tenant_delete ON constituent_feedbacks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_configs pc
      WHERE pc.id = constituent_feedbacks.portal_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS encrypted_pii_tenant_read ON encrypted_pii_vaults;
CREATE POLICY encrypted_pii_tenant_read ON encrypted_pii_vaults
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM constituent_feedbacks cf
      JOIN portal_configs pc ON pc.id = cf.portal_id
      WHERE cf.id = encrypted_pii_vaults.feedback_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );
DROP POLICY IF EXISTS encrypted_pii_public_insert ON encrypted_pii_vaults;
CREATE POLICY encrypted_pii_public_insert ON encrypted_pii_vaults
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM constituent_feedbacks cf
      WHERE cf.id = encrypted_pii_vaults.feedback_id
        AND cf.tracking_ticket_code = current_setting('app.public_feedback_ticket', true)
    )
  );
DROP POLICY IF EXISTS encrypted_pii_tenant_update ON encrypted_pii_vaults;
CREATE POLICY encrypted_pii_tenant_update ON encrypted_pii_vaults
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM constituent_feedbacks cf
      JOIN portal_configs pc ON pc.id = cf.portal_id
      WHERE cf.id = encrypted_pii_vaults.feedback_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM constituent_feedbacks cf
      JOIN portal_configs pc ON pc.id = cf.portal_id
      WHERE cf.id = encrypted_pii_vaults.feedback_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );
DROP POLICY IF EXISTS encrypted_pii_tenant_delete ON encrypted_pii_vaults;
CREATE POLICY encrypted_pii_tenant_delete ON encrypted_pii_vaults
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM constituent_feedbacks cf
      JOIN portal_configs pc ON pc.id = cf.portal_id
      WHERE cf.id = encrypted_pii_vaults.feedback_id
        AND pc.tenant_id = polaris_current_tenant_id()
    )
  );

DROP POLICY IF EXISTS member_writing_memories_tenant_access ON member_writing_memories;
CREATE POLICY member_writing_memories_tenant_access ON member_writing_memories
  FOR ALL
  USING (tenant_id = polaris_current_tenant_id())
  WITH CHECK (tenant_id = polaris_current_tenant_id());