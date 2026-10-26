'use client';

import { usePathname } from 'next/navigation';

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

export const XENON_DEFAULT_HERO_PORTRAIT = '/images/dewan-ahmad-fauzi-cutout.webp';

export function getXenonMemberInfo(member: any, theme: any, subdomain?: string) {
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
    'Mendedikasikan amanah rakyat untuk memperjuangkan keadilan sosial, mendorong transparansi kebijakan fiskal, dan mengakselerasi kesejahteraan masyarakat melalui kerja legislasi yang akuntabel dan solutif.';

  const avatar =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    XENON_DEFAULT_HERO_PORTRAIT;

  const email = member?.contactEmail || theme?.contactEmail || 'kontak@polaris.parlemen.go.id';
  const phone = member?.contactPhone || theme?.contactPhone || '+62 811-9876-5432';
  const address =
    member?.officeAddress ||
    theme?.officeAddress ||
    'Gedung Nusantara I DPR RI, Jl. Jend. Gatot Subroto, Senayan, Jakarta Pusat';

  const instagramHandle =
    member?.instagramHandle?.replace(/^@/, '') || member?.username || subdomain || 'ahmadfauzi.official';
  const instagramUrl = `https://instagram.com/${instagramHandle}`;

  const primaryColor = theme?.primaryHexColor || XENON_THEME.primary;

  return {
    fullName,
    callName,
    title,
    party,
    dapil,
    bio,
    avatar,
    email,
    phone,
    address,
    instagramHandle,
    instagramUrl,
    primaryColor,
  };
}

export function useXenonHref(subdomain?: string) {
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
