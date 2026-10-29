import { formatDateIndonesian } from './utils';

export interface ResolvedMemberInfo {
  officialFullName: string;
  firstName: string;
  callName: string;
  photoUrl: string;
  avatar: string;
  party: string;
  partyName: string;
  dapil: string;
  dapilName: string;
  legislativeLevel: string;
  commissionName: string;
  commission: string;
  headlineTagline: string;
  tagline: string;
  apexHeroDescription: string;
  bio: string;
  officialEmail: string;
  email: string;
  officialPhone: string;
  phone: string;
  formattedPhoneNumber: string;
  waNumber: string;
  waHotlineLink: string;
  instagramUsername: string;
  instagramHandle: string;
  instagramUrl: string;
  threadsUrl: string;
  primaryColor: string;
  portalTitle: string;
  name: string;
  address: string;
  title: string;
  visionPillars: Array<{ title: string; subtitle?: string; description: string }>;
  educationList: string[];
  careersList: any[];
  akdAssignment: any;
  activities: any[];
}

export function resolvePortalMemberData({
  member,
  theme,
  subdomain,
  defaultPrimaryColor = '#1890FF',
}: {
  member: any;
  theme: any;
  subdomain?: string;
  defaultPrimaryColor?: string;
}): ResolvedMemberInfo {
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Anggota Dewan';

  const cleanFirstName = officialFullName
    .replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '')
    .trim()
    .split(' ')[0] || 'Dewan';

  const callName = member?.shortName || cleanFirstName;

  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';

  const legislativeLevel = member?.legislativeLevel || 'DPR RI';

  const akdAssignment = theme?.layoutSchema?.akdAssignment || null;
  const commission =
    akdAssignment?.commission?.name?.trim() ||
    (member?.commissionName ? member.commissionName.trim() : '');

  // Format WhatsApp & Phone (Standar Internasional 62...)
  const rawDigits = (member?.phoneNumber || member?.contactPhone || '').replace(/\D/g, '');
  const waNumber = rawDigits.startsWith('0')
    ? `62${rawDigits.slice(1)}`
    : rawDigits.startsWith('62')
    ? rawDigits
    : rawDigits
    ? `62${rawDigits}`
    : '';

  const formattedPhoneNumber = rawDigits
    ? rawDigits.startsWith('0')
      ? `+62 ${rawDigits.slice(1, 4)}-${rawDigits.slice(4, 8)}-${rawDigits.slice(8)}`
      : `+${rawDigits}`
    : '';

  const waHotlineLink = waNumber
    ? `https://wa.me/${waNumber}?text=Halo%20Sekretariat%20Dewan%20${encodeURIComponent(officialFullName)},%20saya%20ingin%20berkomunikasi%20terkait%20agenda%20dan%20informasi%20resmi.`
    : '';

  const officialEmail =
    member?.email ||
    member?.contactEmail ||
    theme?.contactEmail ||
    (subdomain ? `sekretariat@${subdomain}.polaris.id` : 'sekretariat@polaris.id');

  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.socialMedia?.instagram?.replace(/^@/, '') ||
    '';

  const instagramUrl = instagramUsername ? `https://instagram.com/${instagramUsername}` : '';
  const threadsUrl = instagramUsername ? `https://threads.net/@${instagramUsername}` : '';

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    member?.biography ||
    (dapil
      ? `Mendedikasikan amanah pengabdian untuk memperjuangkan aspirasi masyarakat di Daerah Pemilihan ${dapil} melalui kerja legislasi, anggaran, dan pengawasan yang berintegritas.`
      : 'Mendedikasikan amanah pengabdian untuk memperjuangkan aspirasi rakyat melalui kerja legislasi, anggaran, dan pengawasan yang berintegritas.');

  const headlineTagline =
    theme?.headlineTagline ||
    theme?.heroHeadline ||
    (member?.fullName ? 'MENGABDI DENGAN INTEGRITAS.' : 'MELAYANI DENGAN INTEGRITAS.');

  const tagline =
    theme?.tagline ||
    member?.tagline ||
    (dapil ? `SUARA RAKYAT ${dapil.toUpperCase()}.` : 'MENGABDI UNTUK RAKYAT.');

  const apexHeroDescription = dapil
    ? `Mengawal amanah publik dengan integritas, ketegasan kebijakan, dan transparansi anggaran daerah demi kemakmuran nyata seluruh warga di Daerah Pemilihan ${dapil}.`
    : 'Mengawal amanah publik dengan integritas, ketegasan kebijakan, dan transparansi anggaran daerah demi kemakmuran nyata seluruh warga.';

  const DEFAULT_PILLARS = [
    {
      title: 'Fungsi Legislasi',
      subtitle: 'Legislasikan Solusi Nyata',
      description:
        'Mengawal perumusan dan pengesahan regulasi perundang-undangan yang berpihak nyata kepada kesejahteraan rakyat, UMKM, dan kepastian hukum.',
    },
    {
      title: 'Fungsi Anggaran',
      subtitle: 'Pengawasan Anggaran Transparan',
      description:
        'Memastikan alokasi belanja negara dan transfer ke daerah terealisasi tepat sasaran, akuntabel, dan bebas dari inefisiensi anggaran.',
    },
    {
      title: 'Fungsi Representasi',
      subtitle: 'Pendampingan Konstituen Berkelanjutan',
      description:
        'Menjaga interaksi berkesinambungan bersama warga di daerah pemilihan melalui agenda reses berkala dan advokasi aspirasi nyata.',
    },
  ];

  const customPillars =
    Array.isArray(theme?.layoutSchema?.visionMission) &&
    theme.layoutSchema.visionMission.length > 0
      ? theme.layoutSchema.visionMission.filter(
          (p: any) => p && (p.title?.trim() || p.description?.trim())
        )
      : [];

  const visionPillars = customPillars.length > 0 ? customPillars : DEFAULT_PILLARS;

  const educationList = member?.education
    ? member.education
        .split(/[\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const careersList = Array.isArray(theme?.layoutSchema?.careers)
    ? theme.layoutSchema.careers.filter((c: any) => c && (c.role?.trim() || c.organization?.trim()))
    : [];

  const activities = Array.isArray(theme?.layoutSchema?.activities)
    ? theme.layoutSchema.activities.filter((a: any) => a && (a.title?.trim() || a.photoUrl?.trim()))
    : [];

  const primaryColor = theme?.primaryHexColor || defaultPrimaryColor;
  const address = member?.officeAddress || theme?.officeAddress || '';
  const title = member?.officialTitle || `Anggota ${legislativeLevel}`;

  return {
    officialFullName,
    firstName: cleanFirstName,
    callName,
    photoUrl,
    avatar: photoUrl,
    party,
    partyName: party,
    dapil,
    dapilName: dapil,
    legislativeLevel,
    commissionName: commission,
    commission,
    headlineTagline,
    tagline,
    apexHeroDescription,
    bio,
    officialEmail,
    email: officialEmail,
    officialPhone: formattedPhoneNumber || (rawDigits ? `+${rawDigits}` : ''),
    phone: formattedPhoneNumber || (rawDigits ? `+${rawDigits}` : ''),
    formattedPhoneNumber,
    waNumber,
    waHotlineLink,
    instagramUsername,
    instagramHandle: instagramUsername,
    instagramUrl,
    threadsUrl,
    primaryColor,
    portalTitle: theme?.portalTitle || officialFullName,
    name: officialFullName,
    address,
    title,
    visionPillars,
    educationList,
    careersList,
    akdAssignment,
    activities,
  };
}

export function resolvePortalArticles(recentArticles: any[] = []) {
  return (recentArticles || []).map((a, idx) => ({
    id: a.id || `art-${idx}`,
    title: a.title,
    slug: a.slug || `artikel-${idx}`,
    category: a.sector || a.issueCategory || a.category || 'Kebijakan Publik',
    date: a.publishedAt
      ? formatDateIndonesian(a.publishedAt)
      : a.createdAt
      ? formatDateIndonesian(a.createdAt)
      : 'Terbaru',
    summary: a.excerpt || a.summary || '',
    thumbnail: a.thumbnailUrl || a.featuredImageUrl || a.posterUrl || a.imageUrl || '',
    featuredImageUrl: a.thumbnailUrl || a.featuredImageUrl || a.posterUrl || a.imageUrl || '',
    imageUrl: a.thumbnailUrl || a.featuredImageUrl || a.posterUrl || a.imageUrl || '',
    excerpt: a.excerpt || a.summary || '',
    readTime: a.readingTime || a.readTime || '',
    readingTime: a.readingTime || a.readTime || '',
  }));
}

export function resolvePortalInfographics(recentInfographics: any[] = []) {
  return (recentInfographics || []).map((info, idx) => ({
    id: info.id || `info-${idx}`,
    title: info.title,
    slug: info.slug || `infografis-${idx}`,
    category: info.category || info.issueCategory || 'Transparansi Kinerja',
    imageUrl: info.imageUrl || info.posterUrl || info.thumbnailUrl || '',
    posterUrl: info.imageUrl || info.posterUrl || info.thumbnailUrl || '',
    description: info.description || info.summary || info.excerpt || '',
    excerpt: info.description || info.summary || info.excerpt || '',
    date: info.publishedAt
      ? formatDateIndonesian(info.publishedAt)
      : info.createdAt
      ? formatDateIndonesian(info.createdAt)
      : 'Terbaru',
  }));
}
