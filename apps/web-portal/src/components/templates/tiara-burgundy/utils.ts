'use client';

import { usePathname } from 'next/navigation';

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

export const TIARA_DEFAULT_HERO_PORTRAIT = '/images/dewan-ahmad-fauzi-cutout.webp';

export function getTiaraMemberInfo(member: any, theme: any, subdomain?: string) {
  const fullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Ahmad Fauzi, S.T., M.M.';

  const callName =
    member?.shortName ||
    fullName.split(' ')[0] ||
    'Ahmad';

  const title =
    member?.officialTitle ||
    'Anggota Dewan Perwakilan Rakyat Republik Indonesia';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    'Mendedikasikan integritas dan amanah rakyat untuk memperjuangkan keadilan sosial, mendorong transparansi kebijakan anggaran, dan mengakselerasi kesejahteraan masyarakat melalui kerja nyata di parlemen.';

  const avatar =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    TIARA_DEFAULT_HERO_PORTRAIT;

  const email = member?.contactEmail || theme?.contactEmail || 'kontak@polaris.parlemen.go.id';
  const phone = member?.contactPhone || theme?.contactPhone || '+62 811-9876-5432';
  const address =
    member?.officeAddress ||
    theme?.officeAddress ||
    'Gedung Nusantara I DPR RI, Jl. Jend. Gatot Subroto, Senayan, Jakarta Pusat';

  const instagramHandle =
    member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'ahmadfauzi.official';
  const instagramUrl = `https://instagram.com/${instagramHandle}`;

  const legislativeLevel = member?.legislativeLevel || 'DPR RI';
  const commissionName = member?.commissionName || 'Komisi VI DPR RI';

  const primaryColor = theme?.primaryHexColor || TIARA_THEME.primary;
  // Subtle curated text accent color chosen by user (or elegant warm burgundy fallback)
  const textAccentColor = theme?.primaryHexColor || '#852232';

  return {
    fullName,
    callName,
    title,
    roleTitle: title,
    legislativeLevel,
    commissionName,
    party,
    dapil,
    bio,
    avatar,
    avatarUrl: avatar,
    email,
    phone,
    address,
    instagramHandle,
    instagramUrl,
    primaryColor,
    textAccentColor,
  };
}

export function useTiaraHref(subdomain?: string) {
  const pathname = usePathname() || '';

  return (path: string) => {
    if (!subdomain) return path;

    const segments = pathname.split('/').filter(Boolean);
    const hasSubdomainPrefix = segments[0] === subdomain;

    if (hasSubdomainPrefix) {
      if (path === '/' || path === '') return `/${subdomain}`;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `/${subdomain}${cleanPath}`;
    }

    if (path === '/' || path === '') return `/${subdomain}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${subdomain}${cleanPath}`;
  };
}
