'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export const ARIK_NOIR = {
  bg: '#0A0A0A',
  bgCard: '#111111',
  bgCardHover: '#161616',
  border: '#1C1C1C',
  borderLight: '#2A2A2A',
  textPrimary: '#F5F2EB',
  textChampagne: '#E8DCC4',
  textGold: '#C5A880',
  textMuted: '#8E8A83',
  textDim: '#5C5852',
  accentGold: '#D4AF37',
};

import { resolvePortalMemberData } from '@/lib/template-resolver';

export const ARIK_FALLBACK_PHOTO = '/images/dewan-standing-full.png';

export function getArikMemberInfo(member: any, theme: any, subdomain?: string) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: ARIK_NOIR.textChampagne,
  });

  return {
    ...resolved,
    name: resolved.officialFullName,
    address: 'Gedung Parlemen / Rumah Aspirasi Rakyat, Ruang Fraksi',
    email: resolved.officialEmail,
    phone: resolved.officialPhone,
    instagramHandle: resolved.instagramUsername,
    instagramUrl: `https://instagram.com/${resolved.instagramUsername}`,
    portalTitle: theme?.portalTitle || 'Arik Noir',
  };
}

export function useArikHref(subdomain?: string) {
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

export const ARIK_DEFAULT_ARTICLES: any[] = [];

export const ARIK_DEFAULT_INFOGRAPHICS: any[] = [];

