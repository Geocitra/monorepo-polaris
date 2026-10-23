-- Update email operator ke bkingsleigh@gmail.com dan set password ke password123

DO $$
DECLARE
  v_op_id UUID;
  v_tenant RECORD;
BEGIN
  -- Cek apakah operator@polaris.id ada, jika ada ubah emailnya
  IF EXISTS (SELECT 1 FROM system_admins WHERE email = 'operator@polaris.id') THEN
    UPDATE system_admins
    SET email = 'bkingsleigh@gmail.com',
        password_hash = '$2b$10$EhXZouf.LfJmth4Y5hAFdOljw/4Gif.uPfA4gAWkpiCFVU0iuNHFC',
        full_name = 'Kingsleigh (Operator Konten Polaris)',
        role = 'CONTENT_OPERATOR',
        is_active = true
    WHERE email = 'operator@polaris.id'
    RETURNING id INTO v_op_id;
  ELSE
    -- Jika belum ada, insert baru
    INSERT INTO system_admins (email, password_hash, full_name, role, is_active)
    VALUES (
      'bkingsleigh@gmail.com',
      '$2b$10$EhXZouf.LfJmth4Y5hAFdOljw/4Gif.uPfA4gAWkpiCFVU0iuNHFC',
      'Kingsleigh (Operator Konten Polaris)',
      'CONTENT_OPERATOR',
      true
    )
    ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role = 'CONTENT_OPERATOR',
        is_active = true
    RETURNING id INTO v_op_id;
  END IF;

  -- Pastikan semua dewan terhubung ke operator ini
  FOR v_tenant IN SELECT id FROM tenant_members LOOP
    INSERT INTO operator_tenant_assignments (
      operator_id,
      tenant_id,
      can_direct_publish,
      status,
      notes
    ) VALUES (
      v_op_id,
      v_tenant.id,
      true,
      'ACTIVE',
      'Penugasan dewan ke operator bkingsleigh@gmail.com'
    )
    ON CONFLICT (operator_id, tenant_id) DO UPDATE
    SET status = 'ACTIVE', can_direct_publish = true, updated_at = now();
  END LOOP;

  RAISE NOTICE 'Operator updated to bkingsleigh@gmail.com with ID: %', v_op_id;
END $$;
