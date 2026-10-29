import { cache } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.INTERNAL_API_URL ||
  'http://localhost:4000/api/v1';

export interface PublicChatMessageTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface PublicChatResponse {
  reply: string;
  suggestedAction: 'VIEW_PRICING' | 'REGISTER' | 'NONE';
  isSafeRefusal: boolean;
  tokensUsed: number;
}

export async function sendPublicChatMessage(payload: {
  message: string;
  history?: PublicChatMessageTurn[];
}): Promise<PublicChatResponse> {
  const response = await fetch(`${API_BASE_URL}/public/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error?.message;
    throw new Error(Array.isArray(message) ? message.join(' ') : message || 'Gagal berkomunikasi dengan asisten.');
  }

  return data as PublicChatResponse;
}

function getFallbackPortalData(subdomain: string) {
  return {
    member: {
      fullName: 'Dr. H. Ahmad Fauzi, M.Si',
      firstName: 'Ahmad',
      lastName: 'Fauzi',
      dapilName: 'DKI Jakarta I',
      customDapil: 'DKI Jakarta I',
      partyAffiliation: 'PDIP',
      legislativeLevel: 'DPR_RI',
      photoUrl: '/images/ahmad-fauzi.png',
      officialPhotoUrl: '/images/ahmad-fauzi.png',
      bio: 'Sebagai wakil rakyat di DPR RI, komitmen utama saya adalah memperjuangkan keadilan sosial, transparansi anggaran publik, serta perluasan akses pendidikan dan kesehatan berkualitas bagi seluruh lapisan masyarakat.',
      education: 'S1 Ilmu Politik UI\nS2 Magister Manajemen Publik UGM\nS3 Doktor Kebijakan Publik UNPAD',
      career: [
        'Anggota DPR RI Fraksi PDIP (2024 - Sekarang)',
        'Wakil Ketua Komisi Parlemen (2019 - 2024)',
        'Tenaga Ahli Madya Fraksi DPR RI (2014 - 2019)',
      ],
    },
    theme: {
      officialFullName: 'Dr. H. Ahmad Fauzi, M.Si',
      headlineTagline: 'Mewujudkan parlemen yang transparan, akuntabel, dan berpihak pada kesejahteraan rakyat.',
      primaryHexColor: '#1890FF',
      layoutTemplateId: 'polaris-insight',
      bioBiography: 'Mewakili aspirasi konstituen Daerah Pemilihan DKI Jakarta I. Mengawal transparansi penganggaran, advokasi regulasi daerah, dan pemberdayaan masyarakat.',
      instagramUrl: 'https://instagram.com',
      whatsappUrl: 'https://wa.me/6281234567890',
    },
    portal: {
      subdomain,
      customDomain: null,
    },
    recentArticles: [
      {
        id: 'ref-art-1',
        title: 'Undang-Undang Cipta Kerja: Dampak bagi UMKM & Pemberdayaan Usaha Rakyat',
        slug: 'undang-undang-cipta-kerja-dampak-bagi-umkm',
        category: 'Ekonomi & UMKM',
        publishedAt: '2026-09-01T08:00:00.000Z',
        excerpt: 'Penyederhanaan perizinan dan kemudahan akses pembiayaan perbankan harus diimbangi dengan proteksi pasar domestik agar pelaku usaha mikro daerah pemilihan mampu bersaing di era rantai pasok modern.',
        readingTime: '4 menit baca',
      },
      {
        id: 'ref-art-2',
        title: 'Program Pembangunan Infrastruktur Pedesaan Berkelanjutan',
        slug: 'program-pembangunan-infrastruktur',
        category: 'Infrastruktur',
        publishedAt: '2026-08-20T08:00:00.000Z',
        excerpt: 'Pembangunan infrastruktur konektivitas desa menjadi kunci pembuka isolasi ekonomi warga dan pemerataan stimulus pembangunan daerah.',
        readingTime: '5 menit baca',
      },
    ],
    recentInfographics: [
      {
        id: 'info-1',
        title: 'Realisasi Alokasi Anggaran Pendidikan & Beasiswa Daerah 2026',
        slug: 'realisasi-anggaran-pendidikan',
        category: 'Anggaran Publik',
        imageUrl: '/images/showcase-infografis-anggaran.jpg',
        publishedAt: '2026-09-05T08:00:00.000Z',
      },
    ],
    documents: [],
  };
}

// Lightweight memory cache to avoid redundant backend roundtrips during navigation
const portalDataCache = new Map<string, { data: any; timestamp: number }>();
const PORTAL_CACHE_TTL_MS = 15000; // 15 seconds

export const fetchPortalData = cache(async (subdomain: string) => {
  const now = Date.now();
  const cached = portalDataCache.get(subdomain);
  if (cached && now - cached.timestamp < PORTAL_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      if (subdomain === 'ahmadfauzi') {
        return getFallbackPortalData(subdomain);
      }
      return null;
    }

    const data = await res.json();
    portalDataCache.set(subdomain, { data, timestamp: now });
    return data;
  } catch (error) {
    if (subdomain === 'ahmadfauzi') {
      return getFallbackPortalData(subdomain);
    }
    console.error('[PortalFetchError] Gagal mengambil data portal:', error);
    return null;
  }
});

export async function submitAspiration(payload: {
  subdomainSlug: string;
  citizenName: string;
  phoneNumber: string;
  regencyName: string;
  districtKecamatan: string;
  category: string;
  aspirationMessage: string;
}) {
  const res = await fetch(`${API_BASE_URL}/constituent/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Gagal mengirim aspirasi.');
  }

  return await res.json();
}

// ==========================================
// CITIZEN COMMENTS & GOOGLE AUTH HELPERS
// ==========================================

export async function loginCitizenGoogle(payload: {
  credential?: string;
  isDevMock?: boolean;
  mockName?: string;
  mockEmail?: string;
  mockAvatar?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/comments/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Gagal masuk dengan Google.');
  }

  return await res.json();
}

export async function fetchComments(slug: string, callerCitizenId?: string) {
  const query = callerCitizenId ? `?callerCitizenId=${encodeURIComponent(callerCitizenId)}` : '';
  const res = await fetch(`${API_BASE_URL}/comments/article/${slug}${query}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return { total: 0, comments: [] };
  }

  return await res.json();
}

export async function postComment(
  slug: string,
  token: string,
  payload: { commentText: string; parentCommentId?: string | null }
) {
  const res = await fetch(`${API_BASE_URL}/comments/article/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Gagal mengirim komentar.');
  }

  return await res.json();
}

export async function likeComment(commentId: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Gagal menyukai komentar.');
  }

  return await res.json();
}

export async function deleteOwnComment(commentId: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Gagal menghapus komentar.');
  }

  return await res.json();
}

export async function submitLicenseInquiry(payload: {
  fullName: string;
  phoneNumber: string;
  officialEmail: string;
  partyAffiliation?: string;
  legislativeLevel: string;
  targetRegion: string;
  preferredCycle: string;
  preferredTier: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/inquiries/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || data?.error?.message;
    throw new Error(Array.isArray(message) ? message.join(' ') : message || 'Gagal mengirim permohonan lisensi.');
  }

  return data;
}

export async function trackDocumentDownload(subdomain: string, docId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/documents/${docId}/download`, {
      method: 'POST',
    });
    return await res.json();
  } catch (error) {
    console.error('[TrackDownloadError]', error);
    return null;
  }
}



export async function subscribeNewsletter(subdomain: string, email: string) {
  const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Gagal mendaftar buletin catatan dewan.');
  }

  return await res.json();
}
