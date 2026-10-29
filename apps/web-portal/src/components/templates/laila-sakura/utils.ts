'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const LAILA_SAKURA = {
  bg: '#080D1A',
  bgDark: '#050811',
  bgCard: '#0D1527',
  bgCardHover: '#131F38',
  border: '#1E2B42',
  borderLight: '#263754',
  borderPink: 'rgba(255, 77, 141, 0.35)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0ABC0',
  textMuted: '#64748B',
  accent: '#FF4D8D', // Hot Sakura Pink
  accentSecondary: '#FF2E74',
  accentSubtle: 'rgba(255, 77, 141, 0.12)',
  glowPink: 'rgba(255, 77, 141, 0.4)',
  capsuleBg: '#FFD1DC',
  capsuleText: '#7A0E37',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const LAILA_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getLailaMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: LAILA_SAKURA.accent,
  });

  return {
    ...resolved,
    portalTitle: theme?.portalTitle || 'Laila Sakura',
  };
}

export function useLailaHref(subdomain?: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template') || searchParams?.get('template');
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

export const LAILA_DEFAULT_ARTICLES: any[] = [];
export const LAILA_DEFAULT_INFOGRAPHICS: any[] = [];
