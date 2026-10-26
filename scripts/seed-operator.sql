-- Seed Akun Operator Polaris & Hubungkan ke Semua Dewan yang Ada

DO $$
DECLARE
  v_operator_id UUID;
  v_tenant RECORD;
BEGIN
  -- 1. Insert atau Update Akun Operator di system_admins
  -- Password plaintext: password123 (hash bcrypt standar)
  INSERT INTO system_admins (email, password_hash, full_name, role, is_active)
  VALUES (
    'operator@polaris.id',
    '$2a$06$okZDXkOm9QSBvr2FnQJbJOvTlSfflC9xcqtbSrpX2gPIVuO35wQ6K',
    'Budi Santoso (Operator Konten Polaris)',
    'CONTENT_OPERATOR',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      role = 'CONTENT_OPERATOR',
      is_active = true
  RETURNING id INTO v_operator_id;

  RAISE NOTICE 'Operator Account ID: %', v_operator_id;

  -- 2. Loop semua dewan di tenant_members dan tugaskan ke operator
  FOR v_tenant IN SELECT id, full_name, party_affiliation FROM tenant_members LOOP
    INSERT INTO operator_tenant_assignments (
      operator_id,
      tenant_id,
      can_direct_publish,
      status,
      notes
    ) VALUES (
      v_operator_id,
      v_tenant.id,
      true,
      'ACTIVE',
      'Penugasan otomatis akun dewan binaan operator oleh Superadmin'
    )
    ON CONFLICT (operator_id, tenant_id) DO UPDATE
    SET status = 'ACTIVE',
        can_direct_publish = true,
        updated_at = now();

    RAISE NOTICE 'Menugaskan dewan: % (%) ke operator', v_tenant.full_name, v_tenant.party_affiliation;
  END LOOP;
END $$;
