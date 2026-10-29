'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const BLUSH = {
  bgWarm: '#FAF7F2',
  bgCard: '#FFFFFF',
  bgSage: '#E6EAE0',
  bgBlush: '#FCEFE9',
  bgTerracotta: '#D98270',
  terracotta: '#D47A6A',
  terracottaDark: '#B85E4E',
  sageText: '#5A6852',
  espresso: '#332A26',
  muted: '#7F756F',
  border: '#EBE4DB',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const BLUSH_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getBlushMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#D47A6A',
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'POLARIS',
  };
}

export function useBlushHref(subdomain?: string) {
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

export const BLUSH_DEFAULT_ARTICLES: any[] = [];

export const BLUSH_DEFAULT_INFOGRAPHICS: any[] = [];

