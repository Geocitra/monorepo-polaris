/**
 * Utility untuk menghasilkan URL Web Portal & Landing Page publik secara adaptif
 * Mendukung localhost port 3001 saat development dan domain produksi (polarismedia.id) saat online.
 */

export function getRootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id';
}

export function isLocalhost(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host.includes('localhost') || host === '127.0.0.1';
  }
  return process.env.NODE_ENV !== 'production';
}

export function getLandingPageUrl(): string {
  if (process.env.NEXT_PUBLIC_PORTAL_URL) {
    return process.env.NEXT_PUBLIC_PORTAL_URL;
  }
  if (isLocalhost()) {
    return 'http://localhost:3001';
  }
  return `https://${getRootDomain()}`;
}

export function getPortalUrl(subdomain?: string | null, customDomain?: string | null): string {
  if (customDomain && customDomain.trim()) {
    const clean = customDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (isLocalhost()) {
      return `http://${clean}:3001`;
    }
    return `https://${clean}`;
  }
  if (!subdomain) {
    return getLandingPageUrl();
  }
  if (isLocalhost()) {
    return `http://${subdomain}.localhost:3001`;
  }
  return `https://${subdomain}.${getRootDomain()}`;
}
