'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const NEXORA_THEME = {
  bgLilac: '#F4F0FF',
  bgCard: '#FFFFFF',
  purplePrimary: '#8262FE',
  purpleDark: '#7048E8',
  purpleDeep: '#5F3DC4',
  purpleLight: '#EDE9FE',
  purpleTint: '#F5F3FF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  borderLight: '#E2E8F0',
  borderPurple: '#DDD6FE',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const NEXORA_DEFAULT_HERO_PORTRAIT = '/images/dewan-standing-full.png';

export const NEXORA_DEFAULT_ARTICLES: any[] = [];
export const NEXORA_DEFAULT_INFOGRAPHICS: any[] = [];

export function getNexoraMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: NEXORA_THEME.purplePrimary,
  });

  return {
    ...resolved,
    fullName: resolved.officialFullName,
    title: member?.officialTitle || `Anggota ${resolved.legislativeLevel}`,
  };
}

export function useNexoraHref(subdomain?: string) {
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
