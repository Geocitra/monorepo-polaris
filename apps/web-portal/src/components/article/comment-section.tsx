'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { 
  MessageSquare, 
  Heart, 
  CornerDownRight, 
  Send, 
  LogOut, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatDateIndonesian, formatRelativeTime } from '@/lib/utils';

interface CitizenProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface CommentItem {
  id: string;
  commentText: string;
  likesCount: number;
  createdAt: string;
  citizen: {
    id?: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: CommentItem[];
}

export function CommentSection({ publicationId }: { publicationId: string }) {
  const [citizen, setCitizen] = useState<CitizenProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Toast / Alert State (Zero browser alert())
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  function notifyError(msg: string) {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  }

  function notifySuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  // 1. Muat Sesi Warga dari LocalStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('polaris_citizen_token');
    const savedProfile = localStorage.getItem('polaris_citizen_profile');

    if (savedToken && savedProfile) {
      setToken(savedToken);
      try {
        setCitizen(JSON.parse(savedProfile));
      } catch {
        // ignore error parsing
      }
    }
  }, []);

  // 2. Ambil Komentar dari Backend
  async function loadComments() {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/article/${publicationId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('[CommentLoadError]', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [publicationId]);

  // 3. Callback Sukses Google OAuth Token
  async function handleGoogleCredentialResponse(response: any) {
    const idToken = response.credential;
    if (!idToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comments/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error('Verifikasi akun Google gagal.');
      }

      const data = await res.json();
      setToken(data.token);
      setCitizen(data.citizen);

      localStorage.setItem('polaris_citizen_token', data.token);
      localStorage.setItem('polaris_citizen_profile', JSON.stringify(data.citizen));
      notifySuccess(`Selamat datang, ${data.citizen.fullName}! Sesi login Google aktif.`);
      loadComments();
    } catch (err: any) {
      notifyError(err.message || 'Login Google gagal.');
    }
  }

  // Mode Pengembang: Simulasi Login Instan Warga
  async function handleDevMockLogin() {
    try {
      const demoNames = [
        'Budi Santoso (Warga Cirebon)',
        'Siti Rahmawati (Aktivis Pemuda)',
        'Hendra Gunawan (Akademisi Kebijakan)',
        'Agus Setiawan (Petani Hortikultura)',
      ];
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
      const randomEmail = `warga.${Date.now().toString().slice(-4)}@gmail.com`;

      const res = await fetch(`${API_BASE_URL}/comments/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDevMock: true,
          mockName: randomName,
          mockEmail: randomEmail,
          mockAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomName)}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Simulasi login gagal.');
      }

      const data = await res.json();
      setToken(data.token);
      setCitizen(data.citizen);
      localStorage.setItem('polaris_citizen_token', data.token);
      localStorage.setItem('polaris_citizen_profile', JSON.stringify(data.citizen));
      notifySuccess(`Masuk sebagai ${data.citizen.fullName}!`);
      loadComments();
    } catch (err: any) {
      notifyError(err.message || 'Gagal memproses login.');
    }
  }

  // 4. Inisialisasi Google One-Tap / Button Prompt
  useEffect(() => {
    if (typeof window === 'undefined' || !googleClientId) return;

    (window as any).onGoogleLibraryLoaded = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById('googleLoginBtn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            locale: 'id',
          });
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      (window as any).onGoogleLibraryLoaded();
    }
  }, [googleClientId, citizen]);

  function handleLogout() {
    localStorage.removeItem('polaris_citizen_token');
    localStorage.removeItem('polaris_citizen_profile');
    setToken(null);
    setCitizen(null);
    notifySuccess('Anda telah keluar.');
  }

  // 5. Kirim Komentar Induk Baru
  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newCommentText.trim() || !token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/article/${publicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentText: newCommentText.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || err?.message || 'Gagal mengirim komentar.');
      }

      const result = await res.json();
      setNewCommentText('');
      notifySuccess(result.message || 'Komentar berhasil dikirimkan.');
      await loadComments();
    } catch (err: any) {
      notifyError(err.message || 'Gagal mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  }

  // 6. Kirim Balasan Bertingkat (Reply)
  async function handlePostReply(parentId: string) {
    if (!replyText.trim() || !token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/article/${publicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentText: replyText.trim(),
          parentCommentId: parentId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || err?.message || 'Gagal mengirim balasan.');
      }

      setReplyText('');
      setReplyingToId(null);
      notifySuccess('Balasan berhasil dikirim.');
      await loadComments();
    } catch (err: any) {
      notifyError(err.message || 'Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  }

  // 7. Optimistic Like Counter
  async function handleLike(commentId: string) {
    if (!token) {
      notifyError('Silakan masuk dengan akun Google terlebih dahulu untuk menyukai komentar.');
      return;
    }

    // Optimistic update di UI
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, likesCount: c.likesCount + 1 };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, likesCount: r.likesCount + 1 } : r
            ),
          };
        }
        return c;
      })
    );

    try {
      await fetch(`${API_BASE_URL}/comments/${commentId}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section className="mt-14 pt-8 border-t border-gray-200 space-y-6" id="komentar-warga">
      {/* SUNTIKKAN GOOGLE IDENTITY SERVICES SCRIPT */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).onGoogleLibraryLoaded) {
            (window as any).onGoogleLibraryLoaded();
          }
        }}
      />

      {/* NOTIFIKASI TOAST/ALERT INLINE */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* HEADER KOMENTAR ALA PORTAL BERITA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-portal-primary" />
          <h3 className="text-xl font-bold text-gray-900">
            Komentar & Diskusi Publik ({totalCount})
          </h3>
        </div>
        <span className="text-xs text-gray-500 font-medium">Bebas Spam & Terverifikasi</span>
      </div>

      {/* PANEL STATUS LOGIN GOOGLE WARGA */}
      {citizen ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-3">
              {citizen.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={citizen.avatarUrl}
                  alt={citizen.fullName}
                  className="h-9 w-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {citizen.fullName.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                  <span>{citizen.fullName}</span>
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </span>
                <span className="text-[11px] text-gray-400">{citizen.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          {/* INPUT FORM KOMENTAR UTAMA */}
          <form onSubmit={handlePostComment} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Sampaikan opini, saran, atau tanggapan Anda secara santun terhadap kebijakan ini..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              maxLength={1000}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-400">
                {newCommentText.length}/1000 karakter • Sensor kata kasar otomatis aktif
              </span>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-portal-primary text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Kirim Komentar</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* CALL-TO-ACTION LOGIN GOOGLE ALA DETIK.COM */
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-portal-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Ingin Berpendapat tentang Kebijakan Ini?</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-0.5">
              Masuk menggunakan akun Google resmi Anda untuk berdiskusi langsung di portal representasi dewan.
            </p>
          </div>
          <div className="pt-2 flex flex-col items-center justify-center gap-2">
            {/* GOOGLE BUTTON CONTAINER DARI GSI */}
            <div id="googleLoginBtn" />

            {/* Dev / Demo One-Click Fallback */}
            <button
              type="button"
              onClick={handleDevMockLogin}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 underline font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mode Uji Coba: Masuk Instan (Warga Terverifikasi)</span>
            </button>
          </div>
        </div>
      )}

      {/* DAFTAR KOMENTAR & BALASAN BERTINGKAT */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-portal-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
          Belum ada komentar pada artikel ini. Jadilah yang pertama memberikan pandangan!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-3"
            >
              {/* KOMENTAR INDUK */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  {item.citizen.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.citizen.avatarUrl}
                      alt={item.citizen.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                      {item.citizen.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">
                      {item.citizen.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* TOMBOL SUKA / LIKE */}
                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart className="h-3.5 w-3.5 text-red-500 fill-red-50" />
                  <span>{item.likesCount}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed pl-10">
                {item.commentText}
              </p>

              {/* TOMBOL BALAS */}
              <div className="pl-10 flex items-center gap-4 text-xs font-semibold text-gray-500">
                <button
                  onClick={() => setReplyingToId(replyingToId === item.id ? null : item.id)}
                  className="hover:text-portal-primary transition-colors flex items-center gap-1"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  <span>{replyingToId === item.id ? 'Batal' : 'Balas'}</span>
                </button>
              </div>

              {/* INPUT FORM BALASAN BERTINGKAT (JIKA DIBUKA) */}
              {replyingToId === item.id && (
                <div className="ml-10 mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  {citizen ? (
                    <>
                      <textarea
                        rows={2}
                        placeholder={`Balas komentar ${item.citizen.fullName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-portal-primary focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1 rounded-md text-xs font-semibold text-gray-500 hover:bg-gray-200"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={submitting || !replyText.trim()}
                          onClick={() => handlePostReply(item.id)}
                          className="px-3.5 py-1 rounded-md bg-portal-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                        >
                          Kirim Balasan
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Silakan login dengan Google di atas untuk membalas komentar.
                    </p>
                  )}
                </div>
              )}

              {/* ANAK BALASAN BERTINGKAT (NESTED REPLIES) */}
              {item.replies && item.replies.length > 0 && (
                <div className="ml-6 sm:ml-10 mt-3 space-y-2.5 border-l-2 border-gray-100 pl-4">
                  {item.replies.map((reply) => (
                    <div key={reply.id} className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {reply.citizen.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={reply.citizen.avatarUrl}
                              alt={reply.citizen.fullName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                              {reply.citizen.fullName.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs font-bold text-gray-900">{reply.citizen.fullName}</span>
                          <span className="text-[10px] text-gray-400">• {formatRelativeTime(reply.createdAt)}</span>
                        </div>

                        <button
                          onClick={() => handleLike(reply.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-500"
                        >
                          <Heart className="h-3 w-3 text-red-500" />
                          <span>{reply.likesCount}</span>
                        </button>
                      </div>

                      <p className="text-xs text-gray-700 pl-8 leading-relaxed">
                        {reply.commentText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
