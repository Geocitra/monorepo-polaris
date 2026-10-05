import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantSessionContext {
    tenantId?: string;
    publicFeedbackTicket?: string;
    database?: unknown;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantSessionContext>();