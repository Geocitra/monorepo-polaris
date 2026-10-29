'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const GOLDEN = {
  bgDark: '#1E1E1E',
  bgSection: '#252525',
  bgCard: '#2E2E2E',
  gold: '#FFA800',
  goldLight: '#FFB82E',
  goldDark: '#E09400',
  textMuted: '#9E9E9E',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const GOLDEN_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getGoldenMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#FFA800',
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'POLARIS',
  };
}

export function useGoldenHref(subdomain?: string) {
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

export function getArticleImage(a: any) {
  return (
    a?.featuredImageUrl ||
    a?.coverUrl ||
    a?.imageUrl ||
    a?.thumbnail ||
    a?.posterUrl ||
    '/images/showcase-artikel-pertanian.jpg'
  );
}

export function getArticleCategory(a: any) {
  return a?.issueCategory || a?.category || a?.categoryName || 'Kajian Kebijakan';
}

export function getArticleExcerpt(a: any) {
  return a?.excerpt || a?.summary || '';
}

export const GOLDEN_DEFAULT_ARTICLES: any[] = [];

export const GOLDEN_DEFAULT_INFOGRAPHICS: any[] = [];

