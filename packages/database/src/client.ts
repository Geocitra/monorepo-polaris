import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as enums from './schema/enums.js';
import * as identity from './schema/identity.js';
import * as billing from './schema/billing.js';
import * as cms from './schema/cms.js';
import * as content from './schema/content.js';
import * as knowledge from './schema/knowledge.js';
import * as constituent from './schema/constituent.js';
import * as comments from './schema/comments.js';
import { tenantContextStorage } from './rls/tenant-context.js';

export const schema = {
  ...enums,
  ...identity,
  ...billing,
  ...cms,
  ...content,
  ...knowledge,
  ...constituent,
  ...comments,
};

const connectionString = process.env.DATABASE_URL || 'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db';

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
