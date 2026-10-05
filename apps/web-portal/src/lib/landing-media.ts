const landingMediaBaseUrl = process.env.NEXT_PUBLIC_LANDING_MEDIA_BASE_URL?.replace(/\/+$/, '');

export function getLandingMediaUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return landingMediaBaseUrl ? `${landingMediaBaseUrl}${normalizedPath}` : normalizedPath;
}
