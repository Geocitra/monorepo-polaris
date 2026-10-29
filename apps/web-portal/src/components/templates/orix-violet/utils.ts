'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ORIX = {
  violet: '#3B0CB8',
  violetDark: '#22007C',
  violetLight: '#F3E8FF',
  violetAccent: '#7C3AED',
  yellow: '#F59E0B',
  dark: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export function getOrixMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: ORIX.violet,
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'Orix',
  };
}

export function useOrixHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');
  return (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    const params = new URLSearchParams();
    if (previewTemplate) params.set('preview_template', previewTemplate);
    if (previewColor) params.set('preview_color', previewColor);
    const qs = params.toString();
    if (qs) {
      base += `${base.includes('?') ? '&' : '?'}${qs}`;
    }
    return base;
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

export const ORIX_DEFAULT_ARTICLES: any[] = [];
export const ORIX_DEFAULT_INFOGRAPHICS: any[] = [];
