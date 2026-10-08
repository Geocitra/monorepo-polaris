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

export async function fetchPortalData(subdomain: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/public/${subdomain}`, {
      next: { revalidate: 60 }, // ISR Cache 60 detik
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[PortalFetchError] Gagal mengambil data portal:', error);
    return null;
  }
}

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
  const res = await fetch(`${API_BASE_URL}/public/comments/auth/google`, {
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
  const res = await fetch(`${API_BASE_URL}/public/comments/articles/${slug}${query}`, {
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
  const res = await fetch(`${API_BASE_URL}/public/comments/articles/${slug}`, {
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
  const res = await fetch(`${API_BASE_URL}/public/comments/${commentId}/like`, {
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
  const res = await fetch(`${API_BASE_URL}/public/comments/${commentId}`, {
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

