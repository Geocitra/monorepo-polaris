'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const CRIMSON = {
  bg: '#0B0B0B',
  bgAlt: '#121212',
  card: '#1A1A1A',
  red: '#D62828',
  redHover: '#B71C1C',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const CRIMSON_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getCrimsonMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#D62828',
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'POLARIS',
  };
}

export function useCrimsonHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');
  return (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    const sp = new URLSearchParams();
    if (previewTemplate) sp.set('preview_template', previewTemplate);
    if (previewColor) sp.set('preview_color', previewColor);
    const qs = sp.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
  };
}

/** Normalised article accessors (API data + fallback data). */
export function articleImage(a: any) {
  return (
    a?.featuredImageUrl || a?.coverUrl || a?.imageUrl || a?.thumbnail || a?.posterUrl ||
    '/images/showcase-artikel-pertanian.jpg'
  );
}
export function articleCategory(a: any) {
  return a?.issueCategory || a?.category || a?.categoryName || 'Kajian Kebijakan';
}
export function articleExcerpt(a: any) {
  return a?.excerpt || a?.summary || '';
}

export const CRIMSON_DEFAULT_ARTICLES: any[] = [];

export const CRIMSON_DEFAULT_INFOGRAPHICS: any[] = [];

