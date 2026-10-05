// @ts-ignore - midtrans-client tidak memiliki package types bawaan resmi
import midtransClient from 'midtrans-client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Coba muat .env dari berbagai kemungkinan path (root monorepo, cwd, dsb)
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

export function getMidtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-placeholder';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder';
  const merchantId = process.env.MIDTRANS_MERCHANT_ID || '';
  
  let isProduction = false;
  if (process.env.MIDTRANS_IS_PRODUCTION !== undefined) {
    isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  } else {
    isProduction = serverKey.startsWith('Mid-server-');
  }

  return {
    merchantId,
    serverKey,
    clientKey,
    isProduction,
  };
}

export function createSnapClient(): any {
  const cfg = getMidtransConfig();
  return new midtransClient.Snap({
    isProduction: cfg.isProduction,
    serverKey: cfg.serverKey,
    clientKey: cfg.clientKey,
  });
}

export function createCoreApiClient(): any {
  const cfg = getMidtransConfig();
  return new midtransClient.CoreApi({
    isProduction: cfg.isProduction,
    serverKey: cfg.serverKey,
    clientKey: cfg.clientKey,
  });
}

/**
 * snapClient menggunakan Proxy agar selalu membaca kredensial terbaru secara dinamis
 */
export const snapClient: any = new Proxy({}, {
  get(_target, prop) {
    const client = createSnapClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

/**
 * coreApiClient menggunakan Proxy agar selalu membaca kredensial terbaru secara dinamis
 */
export const coreApiClient: any = new Proxy({}, {
  get(_target, prop) {
    const client = createCoreApiClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

export const MIDTRANS_CONFIG = {
  get merchantId() { return getMidtransConfig().merchantId; },
  get serverKey() { return getMidtransConfig().serverKey; },
  get clientKey() { return getMidtransConfig().clientKey; },
  get isProduction() { return getMidtransConfig().isProduction; },
};

