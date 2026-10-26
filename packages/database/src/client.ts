import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as enums from './schema/enums.js';
import * as identity from './schema/identity.js';
import * as billing from './schema/billing.js';
import * as cms from './schema/cms.js';
import * as content from './schema/content.js';
import * as knowledge from './schema/knowledge.js';
import * as constituent from './schema/constituent.js';
import * as comments from './schema/comments.js';
import * as socialDistribution from './schema/social-distribution.js';
import * as pricingMatrix from './schema/pricing-matrix.js';
import * as inquiry from './schema/inquiry.js';
import { tenantContextStorage } from './rls/tenant-context.js';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  }
}

export const schema = {
  ...enums,
  ...identity,
  ...billing,
  ...cms,
  ...content,
  ...knowledge,
  ...constituent,
  ...comments,
  ...socialDistribution,
  ...pricingMatrix,
  ...inquiry,
};

export function cleanPostgresUrl(url: string): string {
  return url.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
}

const rawConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/polaris?schema=public';
const connectionString = cleanPostgresUrl(rawConnectionString);

// Connection pool connection
export const pgClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const rootDb = drizzle(pgClient, { schema });

export const db = new Proxy(rootDb, {
  get(target, property) {
    const activeDb = (tenantContextStorage.getStore()?.database as typeof rootDb | undefined) ?? target;
    const value = Reflect.get(activeDb, property, activeDb) as unknown;
    return typeof value === 'function' ? value.bind(activeDb) : value;
  },
});
