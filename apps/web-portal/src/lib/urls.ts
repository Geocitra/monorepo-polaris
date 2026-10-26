/**
 * Utility URL untuk portal publik
 */

export function getDashboardUrl(): string {
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('localhost') || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'polarismedia.id';
    return `https://app.${rootDomain}`;
  }
  return process.env.NODE_ENV === 'production' ? 'https://app.polarismedia.id' : 'http://localhost:3000';
}
