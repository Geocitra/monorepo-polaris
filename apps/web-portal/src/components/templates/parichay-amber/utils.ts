'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const PARICHAY = {
  amber: '#FFA800',
  amberDark: '#E09200',
  amberLight: '#FFF4DE',
  amberSubtle: '#FFF9ED',
  charcoal: '#1E1E1E',
  muted: '#6B7280',
  border: '#F3E8D6',
  white: '#FFFFFF',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export function getParichayMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: PARICHAY.amber,
  });

  return {
    ...resolved,
    secondaryColor: theme?.secondaryHexColor || PARICHAY.charcoal,
    portalTitle: theme?.portalTitle || 'Parichay',
  };
}

export function useParichayHref(subdomain?: string) {
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

export const PARICHAY_DEFAULT_ARTICLES: any[] = [];
export const PARICHAY_DEFAULT_INFOGRAPHICS: any[] = [];
