import { S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const accountId = process.env.R2_ACCOUNT_ID || 'mock-account-id';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'mock-access-key';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'mock-secret-key';

/**
 * r2Client adalah S3Client instance yang terhubung langsung
 * ke endpoint regional Cloudflare R2.
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_CONFIG = {
  bucketName: process.env.R2_BUCKET_NAME || 'polaris-assets',
  publicBaseUrl: process.env.R2_PUBLIC_URL || 'https://assets.polaris.id',
};
