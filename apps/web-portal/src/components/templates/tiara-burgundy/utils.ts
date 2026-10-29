'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const TIARA_THEME = {
  primary: '#6B1724', // Deep wine burgundy
  primaryDark: '#520F1A',
  primaryLight: '#852232',
  primaryTint: '#F7EFF1',
  bgHero: '#EFEBE4', // Vintage oat cream
  bgSurface: '#FAF8F5', // Warm ivory alabaster
  textDark: '#2A2220', // Warm charcoal espresso
  textMuted: '#7A6F6A',
  border: '#E5DED5',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const TIARA_DEFAULT_HERO_PORTRAIT = '/images/dewan-standing-full.png';

export function getTiaraMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: TIARA_THEME.primary,
  });

  const title = member?.officialTitle || `Anggota ${resolved.legislativeLevel}`;
  const textAccentColor = theme?.primaryHexColor || '#852232';

  return {
    ...resolved,
    fullName: resolved.officialFullName,
    title,
    roleTitle: title,
    avatarUrl: resolved.photoUrl || TIARA_DEFAULT_HERO_PORTRAIT,
    textAccentColor,
  };
}

export function useTiaraHref(subdomain?: string) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template') || searchParams?.get('template');
  const previewColor = searchParams?.get('preview_color');

  return (path: string) => {
    let base = path;
    if (subdomain) {
      const segments = pathname.split('/').filter(Boolean);
      const hasSubdomainPrefix = segments[0] === subdomain;

      if (hasSubdomainPrefix) {
        if (path === '/' || path === '') {
          base = `/${subdomain}`;
        } else {
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          base = `/${subdomain}${cleanPath}`;
        }
      } else {
        if (path === '/' || path === '') {
          base = `/${subdomain}`;
        } else {
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          base = `/${subdomain}${cleanPath}`;
        }
      }
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
