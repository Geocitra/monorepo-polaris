INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, legislative_level)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'rls-tenant-a@example.test', 'test', 'RLS Tenant A', '0800000001', 'DPR_RI'),
  ('22222222-2222-4222-8222-222222222222', 'rls-tenant-b@example.test', 'test', 'RLS Tenant B', '0800000002', 'DPR_RI');

SELECT set_config('app.current_tenant_id', '11111111-1111-4111-8111-111111111111', true);
INSERT INTO portal_configs (id, tenant_id, subdomain_slug, is_active)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'rls-test-a', true);
INSERT INTO content_publications (
  id, tenant_id, title, slug, excerpt, body_content_markdown, word_count, status, canonical_url
)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', '11111111-1111-4111-8111-111111111111', 'Tenant A draft', 'tenant-a-draft', 'test', 'test', 1, 'DRAFT', 'https://example.test/a-draft'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '11111111-1111-4111-8111-111111111111', 'Tenant A published', 'tenant-a-published', 'test', 'test', 1, 'PUBLISHED', 'https://example.test/a-published');

SELECT set_config('app.current_tenant_id', '22222222-2222-4222-8222-222222222222', true);
INSERT INTO portal_configs (id, tenant_id, subdomain_slug, is_active)
VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'rls-test-b', true);
INSERT INTO content_publications (
  id, tenant_id, title, slug, excerpt, body_content_markdown, word_count, status, canonical_url
)
VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', '22222222-2222-4222-8222-222222222222', 'Tenant B draft', 'tenant-b-draft', 'test', 'test', 1, 'DRAFT', 'https://example.test/b-draft');

SELECT set_config('app.current_tenant_id', '11111111-1111-4111-8111-111111111111', true);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM content_publications
    WHERE tenant_id = '22222222-2222-4222-8222-222222222222'
  ) THEN
    RAISE EXCEPTION 'Tenant A can read Tenant B private publications';
  END IF;
END;
$$;

SELECT set_config('app.current_tenant_id', '', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM content_publications) <> 1 THEN
    RAISE EXCEPTION 'Public session must see only the active portal published publication';
  END IF;
END;
$$;

DO $$
DECLARE
  deleted_rows integer;
BEGIN
  DELETE FROM content_publications
  WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  IF deleted_rows <> 0 THEN
    RAISE EXCEPTION 'Public session must not delete a published publication';
  END IF;
END;
$$;

SELECT set_config('app.public_feedback_ticket', '#CS-RLS-ONLY-A', true);
INSERT INTO constituent_feedbacks (
  id, portal_id, tracking_ticket_code, regency_name, district_kecamatan, category, aspiration_message
)
VALUES (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '#CS-RLS-ONLY-A',
  'Kabupaten Uji',
  'Kecamatan Uji',
  'LAINNYA',
  'Aspirasi uji RLS'
);
INSERT INTO encrypted_pii_vaults (feedback_id, encrypted_citizen_name, encrypted_phone_number, iv_vector)
VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', decode('00', 'hex'), decode('00', 'hex'), '00');

DO $$
BEGIN
  IF (SELECT count(*) FROM constituent_feedbacks WHERE tracking_ticket_code = '#CS-RLS-ONLY-A') <> 1 THEN
    RAISE EXCEPTION 'A public tracking ticket must reveal its matching feedback';
  END IF;
  IF (SELECT count(*) FROM encrypted_pii_vaults) <> 0 THEN
    RAISE EXCEPTION 'A public tracking ticket must not reveal encrypted PII';
  END IF;
END;
$$;