import dns from 'node:dns/promises';
import net from 'node:net';

const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'oly_anon_id',
  'oly_enc_id',
  'vero_id',
  'wickedid',
  'yclid',
  '_hsenc',
  '_hsmi',
  'ref',
  'ref_src',
]);

/**
 * Membersihkan parameter pelacak (UTM, fbclid, dll.) dan hash fragment dari URL.
 */
export function canonicalizeUrl(rawUrl: string): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    parsed.hash = '';
    for (const key of Array.from(parsed.searchParams.keys())) {
      const lower = key.toLowerCase();
      if (lower.startsWith('utm_') || TRACKING_QUERY_PARAMS.has(lower)) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.searchParams.sort();
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Memeriksa apakah alamat IP termasuk rentang privat, loopback, atau link-local (anti-SSRF).
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();
  if (normalized.startsWith('::ffff:')) {
    return isPrivateOrReservedIp(normalized.slice(7));
  }

  if (net.isIPv4(normalized)) {
    const parts = normalized.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // Multicast / Reserved
    return false;
  }

  if (net.isIPv6(normalized)) {
    if (normalized === '::' || normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
      return true; // Link-local fe80::/10
    }
    return false;
  }

  return true;
}

/**
 * Memvalidasi URL eksternal agar aman dari SSRF sebelum dilakukan HTTP fetch.
 */
export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  const canonical = canonicalizeUrl(rawUrl);
  if (!canonical) {
    throw new Error('URL tidak valid atau protokol bukan HTTP/HTTPS');
  }

  const parsed = new URL(canonical);
  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error(`Hostname internal diblokir oleh SSRF Guard: ${hostname}`);
  }

  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new Error(`Alamat IP privat/tercadang diblokir oleh SSRF Guard: ${hostname}`);
    }
    return parsed;
  }

  const resolved = await dns.lookup(hostname, { all: true });
  if (!resolved || resolved.length === 0) {
    throw new Error(`Gagal me-resolve DNS untuk ${hostname}`);
  }

  for (const record of resolved) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error(`DNS ${hostname} mengarah ke IP privat/tercadang (${record.address})`);
    }
  }

  return parsed;
}

