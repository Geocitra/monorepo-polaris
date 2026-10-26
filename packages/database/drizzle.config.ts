import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/polaris?schema=public';
const cleanUrl = rawUrl.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

export default defineConfig({
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: cleanUrl,
  },
  strict: true,
  verbose: true,
});
