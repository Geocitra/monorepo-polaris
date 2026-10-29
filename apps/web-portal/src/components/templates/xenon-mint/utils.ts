'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const XENON_THEME = {
  primary: '#00E599',
  primaryHover: '#00D084',
  primaryMuted: '#E6FAF2',
  heroBg: '#081018',
  cardDark: '#0D1722',
  surfaceLight: '#FFFFFF',
  textDark: '#0A1118',
  textMuted: '#64748B',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const XENON_DEFAULT_HERO_PORTRAIT = '/images/dewan-standing-full.png';

export function getXenonMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: XENON_THEME.primary,
  });

  return {
    ...resolved,
    fullName: resolved.officialFullName,
    title: member?.officialTitle || `Anggota ${resolved.legislativeLevel}`,
  };
}

export function useXenonHref(subdomain?: string) {
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
