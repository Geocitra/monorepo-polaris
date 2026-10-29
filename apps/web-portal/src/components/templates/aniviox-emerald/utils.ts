'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ANIVIOX_EMERALD = {
  bg: '#060A08',
  bgDark: '#080E0B',
  bgCard: '#0C1510',
  bgCardHover: '#101C15',
  border: '#15241C',
  borderLight: '#1E362A',
  borderEmerald: 'rgba(0, 240, 118, 0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3B8AD',
  textMuted: '#688073',
  textDim: '#44564D',
  accent: '#00F076',
  accentHover: '#00D96A',
  accentSubtle: 'rgba(0, 240, 118, 0.12)',
  glowEmerald: 'rgba(0, 240, 118, 0.25)',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const ANIVIOX_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getAnivioxMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: ANIVIOX_EMERALD.accent,
  });

  return {
    ...resolved,
    name: resolved.officialFullName,
    address: 'Gedung Parlemen / Rumah Aspirasi Rakyat, Ruang Fraksi',
    email: resolved.officialEmail,
    phone: resolved.officialPhone,
    instagramHandle: resolved.instagramUsername,
    instagramUrl: `https://instagram.com/${resolved.instagramUsername}`,
    portalTitle: theme?.portalTitle || 'Aniviox Emerald',
  };
}

export function useAnivioxHref(subdomain?: string) {
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

export const ANIVIOX_DEFAULT_ARTICLES: any[] = [];

export const ANIVIOX_DEFAULT_INFOGRAPHICS: any[] = [];

