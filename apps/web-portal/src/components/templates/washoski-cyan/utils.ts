'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const WASHOSKI_CYAN = {
  black: '#070707',
  pureBlack: '#000000',
  cardDark: '#111111',
  cyan: '#05DFD7',
  cyanNeon: '#00F2FE',
  cyanDim: 'rgba(5, 223, 215, 0.15)',
  borderDark: '#1E1E1E',
  textMuted: '#9CA3AF',
  textLight: '#E5E7EB',
  white: '#FFFFFF',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export function getWashoskiMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: WASHOSKI_CYAN.cyan,
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'Washoski Cyan',
  };
}

export function useWashoskiHref(subdomain?: string) {
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

export const WASHOSKI_DEFAULT_ARTICLES: any[] = [];
export const WASHOSKI_DEFAULT_INFOGRAPHICS: any[] = [];
