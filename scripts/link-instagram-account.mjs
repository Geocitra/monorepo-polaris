import * as crypto from 'node:crypto';
import postgres from '../packages/database/node_modules/postgres/src/index.js';

const TOKEN = 'IGAAfW4YwjHNBBZAFlFSHptdVo5TExrRVB0cVBfeGRldG92SEJ5MUpWalRhRndIU2JKQXVjZAjRfd0lzQXBUcks3ZAUM2U09DMkVqeXlQMWZAEZAkMySHVJM1FRN2JDNUQxZAUZAGSjZALQ3RBUEZADVW54bVFEUVlCQl8xWFJvUU9CUWZAjTQZDZD';
const TENANT_ID = 'a28b7732-8960-4dff-a3c9-be70c15492b6'; // Reno S Nugraha

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

async function run() {
  console.log('[Script] Mengambil data profil dari Meta Graph API...');
  const res = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,account_type&access_token=${TOKEN}`
  );
  const profile = await res.json();

  if (!profile.id || !profile.username) {
    console.error('[Script] Gagal mengambil profil:', profile);
    process.exit(1);
  }

  console.log('[Script] Profil terverifikasi:', profile.username, `(ID: ${profile.id}, Tipe: ${profile.account_type})`);

  const { encryptedBuffer, ivHex } = encryptToken(TOKEN, TENANT_ID);
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 hari

  const sql = postgres(process.env.DATABASE_URL || 'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db');

  const rows = await sql.begin(async (tx) => {
    await tx`SELECT set_config('app.current_tenant_id', ${TENANT_ID}, true)`;

    return await tx`
      INSERT INTO connected_social_accounts (
        tenant_id, platform, account_type, external_account_id,
        account_handle, account_name, profile_picture_url,
        encrypted_access_token, token_iv, token_expires_at,
        token_last_refreshed_at, status, last_error_message, updated_at
      ) VALUES (
        ${TENANT_ID}, 'INSTAGRAM', ${(profile.account_type || 'BUSINESS').toUpperCase()}, ${profile.id},
        ${profile.username.replace(/^@/, '').trim()}, ${profile.name || profile.username},
        ${profile.profile_picture_url || null}, ${encryptedBuffer}, ${ivHex}, ${expiresAt},
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
      RETURNING id, account_handle, status;
    `;
  });

  console.log('[Script] SUKSES! Akun Instagram berhasil ditautkan:', rows[0]);
  await sql.end();
}

run().catch((err) => {
  console.error('[Script Error]', err);
  process.exit(1);
});
