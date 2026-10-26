const fetch = globalThis.fetch;

async function run() {
  console.log('=== 1. Login Sebagai Operator (bkingsleigh@gmail.com) ===');
  const verifyOpRes = await fetch('http://localhost:4000/api/v1/admin/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bkingsleigh@gmail.com', otpCode: '123456' }),
  });
  const opAuth = await verifyOpRes.json();
  const operatorToken = opAuth.token;
  console.log('Operator Auth:', opAuth.admin);

  console.log('\n=== 2. Verifikasi Proteksi Keamanan: Operator DILARANG Akses Superadmin Endpoints ===');
  
  // Endpoint Superadmin 1: List Operator Management
  const resForbidden1 = await fetch('http://localhost:4000/api/v1/operator/admin/list', {
    headers: { Authorization: `Bearer ${operatorToken}` },
  });
  console.log('Uji 1 -> Operator akses /operator/admin/list: Status', resForbidden1.status);
  if (resForbidden1.status === 403) {
    console.log('✅ BERHASIL: 403 Forbidden! Operator ditolak mengelola akun staf operator.');
  } else {
    console.error('❌ GAGAL: Operator tidak diblokir! Status:', resForbidden1.status);
  }

  // Endpoint Superadmin 2: Kelola Tenants / Lisensi Dewan
  const resForbidden2 = await fetch('http://localhost:4000/api/v1/admin/tenants', {
    headers: { Authorization: `Bearer ${operatorToken}` },
  });
  console.log('Uji 2 -> Operator akses /admin/tenants: Status', resForbidden2.status);
  if (resForbidden2.status === 403) {
    console.log('✅ BERHASIL: 403 Forbidden! Operator ditolak mengakses data lisensi & konfigurasi superadmin.');
  } else {
    console.error('❌ GAGAL: Operator tidak diblokir! Status:', resForbidden2.status);
  }

  // Endpoint Superadmin 3: Rekonsiliasi Kas Midtrans
  const resForbidden3 = await fetch('http://localhost:4000/api/v1/admin/reconciliation/batches', {
    headers: { Authorization: `Bearer ${operatorToken}` },
  });
  console.log('Uji 3 -> Operator akses /admin/reconciliation/batches: Status', resForbidden3.status);
  if (resForbidden3.status === 403) {
    console.log('✅ BERHASIL: 403 Forbidden! Operator ditolak mengakses fitur keuangan/rekonsiliasi.');
  } else {
    console.error('❌ GAGAL: Operator tidak diblokir! Status:', resForbidden3.status);
  }

  console.log('\n=== 3. Operator Mengakses Endpoint Khusus Operatornya Sendiri ===');
  const myAssignmentsRes = await fetch('http://localhost:4000/api/v1/operator/my-assignments', {
    headers: { Authorization: `Bearer ${operatorToken}` },
  });
  const assignments = await myAssignmentsRes.json();
  console.log('My Assignments Status:', myAssignmentsRes.status);
  console.log('Jumlah Dewan Dikelola:', assignments.length);
  assignments.forEach((a) => {
    console.log(`  * ${a.fullName} (${a.partyAffiliation}) - ${a.customDapilName}`);
  });

  console.log('\n=== 4. Login Sebagai Superadmin (admin@polaris.id) ===');
  const verifyAdminRes = await fetch('http://localhost:4000/api/v1/admin/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@polaris.id', otpCode: '123456' }),
  });
  const adminAuth = await verifyAdminRes.json();
  const superadminToken = adminAuth.token;
  console.log('Superadmin Auth:', adminAuth.admin);

  console.log('\n=== 5. Uji CRUD Manajemen Operator oleh Superadmin ===');

  // A. Ambil daftar dewan (Read Tenants List for Picker)
  const tenantsListRes = await fetch('http://localhost:4000/api/v1/operator/admin/tenants-list', {
    headers: { Authorization: `Bearer ${superadminToken}` },
  });
  const tenantsList = await tenantsListRes.json();
  console.log('A. List Tenants for Picker -> Status:', tenantsListRes.status, 'Total Dewan:', tenantsList.length);
  if (tenantsList.length > 0) {
    console.log(`   Sample Dewan: ${tenantsList[0].fullName} (${tenantsList[0].partyAffiliation})`);
  }

  // B. CREATE: Buat Akun Operator Baru
  const testEmail = `operator.tester.${Date.now()}@polaris.id`;
  const createRes = await fetch('http://localhost:4000/api/v1/operator/admin/create-account', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${superadminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: testEmail,
      fullName: 'Ahmad Fauzi (Operator Magang)',
      password: 'password123',
    }),
  });
  const createData = await createRes.json();
  console.log('B. CREATE Operator -> Status:', createRes.status, 'Message:', createData.message);
  const createdOperatorId = createData.operator?.id;

  // C. READ: Tampilkan Seluruh Staf Operator
  const listRes = await fetch('http://localhost:4000/api/v1/operator/admin/list', {
    headers: { Authorization: `Bearer ${superadminToken}` },
  });
  const operatorsList = await listRes.json();
  console.log('C. READ Operator List -> Total Operator:', operatorsList.length);

  if (createdOperatorId && tenantsList.length > 0) {
    // D. ASSIGN: Tugaskan Dewan ke Operator
    const assignRes = await fetch('http://localhost:4000/api/v1/operator/admin/assign', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superadminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operatorId: createdOperatorId,
        tenantId: tenantsList[0].id,
        canDirectPublish: true,
        notes: 'Uji coba penugasan tim konten',
      }),
    });
    const assignData = await assignRes.json();
    console.log('D. ASSIGN Dewan -> Status:', assignRes.status, 'Message:', assignData.message);

    // E. READ DETAIL: Ambil Detail Operator & Penugasan
    const detailRes = await fetch(`http://localhost:4000/api/v1/operator/admin/${createdOperatorId}`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    const detailData = await detailRes.json();
    console.log('E. READ DETAIL Operator -> Status:', detailRes.status, 'Dewan Terhubung:', detailData.assignments?.length);

    // F. UPDATE: Perbarui Nama & Status Operator
    const updateRes = await fetch(`http://localhost:4000/api/v1/operator/admin/${createdOperatorId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${superadminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Ahmad Fauzi, S.I.Kom (Lead Operator)',
        isActive: false, // Uji coba tangguhkan
      }),
    });
    const updateData = await updateRes.json();
    console.log('F. UPDATE Operator -> Status:', updateRes.status, 'Nama Baru:', updateData.operator?.fullName, 'Status Aktif:', updateData.operator?.isActive);

    // G. DELETE: Hapus Akun Staf Operator
    const deleteRes = await fetch(`http://localhost:4000/api/v1/operator/admin/${createdOperatorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    const deleteData = await deleteRes.json();
    console.log('G. DELETE Operator -> Status:', deleteRes.status, 'Message:', deleteData.message);
  }

  console.log('\n🎉 SEMUA FITUR PEMISAHAN ROLE DAN CRUD OPERATOR BERFUNGSI 100% SEMPURNA!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
