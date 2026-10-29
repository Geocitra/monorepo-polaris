'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const AGETHA_RUBY = {
  black: '#0F0F0F',
  cardDark: '#1A1A1A',
  cardHighlight: '#E50914',
  rubyRed: '#E50914',
  rubyDark: '#B91C1C',
  borderDark: '#262626',
  textMuted: '#9CA3AF',
  textLight: '#E5E7EB',
  white: '#FFFFFF',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const AGETHA_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getAgethaMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: AGETHA_RUBY.rubyRed,
  });

  return {
    ...resolved,
    name: resolved.officialFullName,
    address: 'Gedung Parlemen / Rumah Aspirasi Rakyat, Ruang Fraksi',
    email: resolved.officialEmail,
    phone: resolved.officialPhone,
    instagramHandle: resolved.instagramUsername,
    instagramUrl: `https://instagram.com/${resolved.instagramUsername}`,
    portalTitle: theme?.portalTitle || 'Agetha Ruby',
  };
}

export function useAgethaHref(subdomain?: string) {
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

export const AGETHA_DEFAULT_ARTICLES: any[] = [];

export const AGETHA_DEFAULT_INFOGRAPHICS: any[] = [];

