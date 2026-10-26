const fetch = globalThis.fetch;

async function testOperator() {
  const verifyRes = await fetch('http://localhost:4000/api/v1/admin/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bkingsleigh@gmail.com', otpCode: '123456' }),
  });
  const auth = await verifyRes.json();
  console.log('Login Auth Result:', auth.admin);

  const token = auth.token;
  const assignmentsRes = await fetch('http://localhost:4000/api/v1/operator/my-assignments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const assignments = await assignmentsRes.json();
  console.log('Assignments count:', assignments.length);
  assignments.forEach((a) => {
    console.log(`- ${a.fullName} (${a.partyAffiliation}) -> Dapil: ${a.customDapilName}`);
  });
}

testOperator().catch(console.error);
