import * as crypto from 'node:crypto';

let postgres;
const candidatePaths = [
  'postgres',
  './packages/database/node_modules/postgres/src/index.js',
  '../packages/database/node_modules/postgres/src/index.js',
  '../../packages/database/node_modules/postgres/src/index.js',
  '/app/packages/database/node_modules/postgres/src/index.js',
  '/app/node_modules/postgres/src/index.js',
];

for (const p of candidatePaths) {
  try {
    const mod = await import(p);
    postgres = mod.default || mod;
    if (postgres) break;
  } catch (e) {}
}

if (!postgres) {
  throw new Error('Driver postgres tidak ditemukan di candidate paths.');
}

const ACCOUNTS_CONFIG = [
  {
    email: 'info@ayublaksono.com',
    fallbackName: 'Ayub Laksono',
    instagramToken: 'IGAAfW4YwjHNBBZAFkyM19pMjVFMGNRRXNDQUU4MVlFVjRYYlRxcGNQZAGJrbXNtR1VISXluY1hlTWpmVjhxNTNUYXZA6SXA5cVFXWm4zQ1RVVGo0azZAfVWp3YVYyZAWFmQTlZAcklQUUpQNjJHX3FKWFRBZAEdfNFlMcVNKanF6SnhvTQZDZD',
    threadsToken: 'THAAPjXirpgcNBYlo1c3loMkNzSldyMTVwbjRJbnJJUTNRV2h6aXpobXFDNkxpaVhiZADQtU01LeGRXcW85aDNxalhGa2dWVzRFWEFFX1FUam1VUUZALMUpZAdHhtTUZANeEVtVnRMbGRaN0xteHJid3p6M1FEM3BCbUVsLW1MRWJKeTV5WEV6bEhZAbzVPeUxid3MZD',
  },
  {
    email: 'info@opinitaru.com',
    fallbackName: 'Opinitaru',
    instagramToken: 'IGAAfW4YwjHNBBZAGI4OXJkQTRQM3lvRWJuSGc2ckg0QkoxNEQ2SXlkN3NOb0FlV0FzdVFOWXJzYm9ZAejE2ZAVdQSEN5VmZALZAmVxSHFUUWNDMC1kWWctTlFOdzdJMTlpYm1ubDlscXQ4bUoyUUdqclZA0cXM4MkJ6VXVmWmRSRnp4SQZDZD',
    threadsToken: null,
  },
  {
    email: 'info@abdimunif.com',
    fallbackName: 'Abdi Munif',
    instagramToken: 'IGAAfW4YwjHNBBZAFpNNTJfT2twdl9pMTZAqYkRxVkx1NkQ5emI1NE45Y1RyeGV1OV9VM1pIaS05Mk1TXzB5eHdaU0FhRGVZAY2Q3TUpKMmJ6TlAzZA0dhUUFRdzkyRHpleFpvZA3dVYm5ZATzVPdHFLT0d1NFllblBZARFVhVXpsUGFaSQZDZD',
    threadsToken: 'THAAPjXirpgcNBYlpXb2RfSWlTMVYtelA5SHdjd01yTHoyeXlFRElVclNvTlZAuTEZADb1hlYVBIS2xWaVN2bDhna0VRY2VZAVlZABa29USGNxRldhd01WRDhlb3I3TmJOSVdJb2czV2xjQW1PN1pVSmdaQjlSRS1VSmFodG1hT3RESzJudFQzempSTmY4QkdTYkEZD',
  },
];

const CIPHERTEXT_PREFIX = Buffer.from('IGTK', 'ascii');
const GCM_AAD = Buffer.from('polaris-instagram-token:v1', 'utf8');
const TENANT_KEY_INFO = Buffer.from('polaris-social-token-hkdf', 'utf8');

function getMasterKey() {
  const rawSecret = process.env.PII_ENCRYPTION_KEY || process.env.JWT_SECRET || '12345678901234567890123456789012';
  return Buffer.from(rawSecret.padEnd(32, '0').slice(0, 32), 'utf8');
}

function deriveTenantKey(tenantId) {
  return Buffer.from(
    crypto.hkdfSync(
      'sha256',
      getMasterKey(),
      Buffer.from(tenantId.trim(), 'utf8'),
      TENANT_KEY_INFO,
      32
    )
  );
}

function encryptToken(plainToken, tenantId) {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveTenantKey(tenantId), nonce);
  cipher.setAAD(GCM_AAD);
  const ciphertext = Buffer.concat([cipher.update(plainToken.trim(), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedBuffer: Buffer.concat([CIPHERTEXT_PREFIX, authTag, ciphertext]),
    ivHex: nonce.toString('hex'),
  };
}

async function fetchInstagramProfile(token) {
  const res = await fetch(`https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,account_type&access_token=${token}`);
  const data = await res.json();
  if (!data.id) throw new Error(`IG API Error: ${JSON.stringify(data)}`);
  return data;
}

async function fetchThreadsProfile(token) {
  const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${token}`);
  const data = await res.json();
  if (!data.id) throw new Error(`Threads API Error: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db';
  const sql = postgres(connectionString);

  console.log('=== POLARIS SOCIAL ACCOUNT LINKER ===');

  try {
    await sql.unsafe("ALTER TYPE social_platform_enum ADD VALUE IF NOT EXISTS 'THREADS'");
    console.log('[DB] Enum social_platform_enum dipastikan mendukung THREADS.');
  } catch (err) {
    console.warn('[DB Warning] Info enum:', err.message);
  }

  for (const cfg of ACCOUNTS_CONFIG) {
    console.log(`\n--- Memproses Akun: ${cfg.email} (${cfg.fallbackName}) ---`);

    const [member] = await sql`
      SELECT id, full_name, email FROM tenant_members WHERE email = ${cfg.email} LIMIT 1
    `;

    if (!member) {
      console.warn(`[SKIP] Member dengan email ${cfg.email} tidak ditemukan di database.`);
      continue;
    }

    const tenantId = member.id;
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 hari

    // 1. Tautkan Instagram
    if (cfg.instagramToken) {
      try {
        console.log(`  [IG] Mengambil profil Instagram...`);
        const igProfile = await fetchInstagramProfile(cfg.instagramToken);
        console.log(`  [IG] Ditemukan @${igProfile.username} (ID: ${igProfile.id}, Tipe: ${igProfile.account_type})`);

        const { encryptedBuffer, ivHex } = encryptToken(cfg.instagramToken, tenantId);

        await sql.begin(async (tx) => {
          await tx`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
          await tx`
            INSERT INTO connected_social_accounts (
              tenant_id, platform, account_type, external_account_id,
              account_handle, account_name, profile_picture_url,
              encrypted_access_token, token_iv, token_expires_at,
              token_last_refreshed_at, status, last_error_message, updated_at
            ) VALUES (
              ${tenantId}, 'INSTAGRAM', ${(igProfile.account_type || 'MEDIA_CREATOR').toUpperCase()}, ${igProfile.id},
              ${igProfile.username.replace(/^@/, '').trim()}, ${igProfile.name || igProfile.username},
              ${igProfile.profile_picture_url || null}, ${encryptedBuffer}, ${ivHex}, ${expiresAt},
              NOW(), 'ACTIVE', NULL, NOW()
            )
            ON CONFLICT (tenant_id, platform, external_account_id)
            DO UPDATE SET
              account_handle = EXCLUDED.account_handle,
              account_name = EXCLUDED.account_name,
              profile_picture_url = EXCLUDED.profile_picture_url,
              encrypted_access_token = EXCLUDED.encrypted_access_token,
              token_iv = EXCLUDED.token_iv,
              token_expires_at = EXCLUDED.token_expires_at,
              token_last_refreshed_at = NOW(),
              status = 'ACTIVE',
              last_error_message = NULL,
              updated_at = NOW()
          `;
        });
        console.log(`  [IG] Berhasil ditautkan ke tenant ${tenantId}!`);
      } catch (err) {
        console.error(`  [IG ERROR] Gagal tautkan Instagram: ${err.message}`);
      }
    }

    // 2. Tautkan Threads
    if (cfg.threadsToken) {
      try {
        console.log(`  [Threads] Mengambil profil Threads...`);
        const thProfile = await fetchThreadsProfile(cfg.threadsToken);
        console.log(`  [Threads] Ditemukan @${thProfile.username} (ID: ${thProfile.id})`);

        const { encryptedBuffer, ivHex } = encryptToken(cfg.threadsToken, tenantId);

        await sql.begin(async (tx) => {
          await tx`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
          await tx`
            INSERT INTO connected_social_accounts (
              tenant_id, platform, account_type, external_account_id,
              account_handle, account_name, profile_picture_url,
              encrypted_access_token, token_iv, token_expires_at,
              token_last_refreshed_at, status, last_error_message, updated_at
            ) VALUES (
              ${tenantId}, 'THREADS', 'CREATOR', ${thProfile.id},
              ${thProfile.username.replace(/^@/, '').trim()}, ${thProfile.name || thProfile.username},
              ${thProfile.threads_profile_picture_url || null}, ${encryptedBuffer}, ${ivHex}, ${expiresAt},
              NOW(), 'ACTIVE', NULL, NOW()
            )
            ON CONFLICT (tenant_id, platform, external_account_id)
            DO UPDATE SET
              account_handle = EXCLUDED.account_handle,
              account_name = EXCLUDED.account_name,
              profile_picture_url = EXCLUDED.profile_picture_url,
              encrypted_access_token = EXCLUDED.encrypted_access_token,
              token_iv = EXCLUDED.token_iv,
              token_expires_at = EXCLUDED.token_expires_at,
              token_last_refreshed_at = NOW(),
              status = 'ACTIVE',
              last_error_message = NULL,
              updated_at = NOW()
          `;
        });
        console.log(`  [Threads] Berhasil ditautkan ke tenant ${tenantId}!`);
      } catch (err) {
        console.error(`  [Threads ERROR] Gagal tautkan Threads: ${err.message}`);
      }
    }
  }

  console.log('\n=== SELESAI ===');
  await sql.end();
}

main().catch((e) => {
  console.error('[Fatal Error]', e);
  process.exit(1);
});
