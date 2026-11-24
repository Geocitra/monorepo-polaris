import { AsyncLocalStorage } from 'node:async_hooks';

export interface InstitutionalRlsContext {
  organizationId: string;
  unitId?: string | null;
}

export interface TenantSessionContext {
  tenantId?: string;
  organizationId?: string;
  unitId?: string | null;
  publicFeedbackTicket?: string;
  database?: unknown;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantSessionContext>();
