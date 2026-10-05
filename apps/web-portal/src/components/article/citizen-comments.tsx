'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { 
  loginCitizenGoogle, 
  fetchComments, 
  postComment, 
  likeComment, 
  deleteOwnComment 
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Reply, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  LogOut, 
  Sparkles,
  AlertCircle,
  CornerDownRight
} from 'lucide-react';

interface CitizenUser {
  id: string;
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface CommentItem {
  id: string;
  publicationId: string;
  parentCommentId: string | null;
  commentText: string;
  status: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  citizen: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: CommentItem[];
}

interface CitizenCommentsProps {
  slug: string;
  initialCommentCount?: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function CitizenComments({ slug, initialCommentCount = 0 }: CitizenCommentsProps) {
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(initialCommentCount);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State Input Komentar Utama
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State Balasan Bertingkat (Reply)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // Likes tracking lokal
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // 1. Cek Sesi Tersimpan di LocalStorage & Muat Komentar
  useEffect(() => {
    const savedToken = localStorage.getItem('polaris_citizen_token');
    const savedProfile = localStorage.getItem('polaris_citizen_profile');
    if (savedToken && savedProfile) {
      try {
        setToken(savedToken);
        setCitizen(JSON.parse(savedProfile));
      } catch {
        localStorage.removeItem('polaris_citizen_token');
        localStorage.removeItem('polaris_citizen_profile');
      }
    }

    loadComments();
  }, [slug]);

  async function loadComments() {
    setLoading(true);
    try {
      const savedProfile = localStorage.getItem('polaris_citizen_profile');
      const callerId = savedProfile ? JSON.parse(savedProfile)?.id : undefined;
      const data = await fetchComments(slug, callerId);
      setComments(data.comments || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Gagal memuat komentar:', err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Inisialisasi Google Identity Services jika Client ID tersedia
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && googleClientId && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          locale: 'id',
        });
      } catch (err) {
        console.error('Google One Tap init error:', err);
      }
    }
  }, [googleClientId, citizen]);

  async function handleGoogleCredentialResponse(response: any) {
    setErrorMsg(null);
    try {
      const authResult = await loginCitizenGoogle({ credential: response.credential });
      saveSession(authResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    }
  }

  // Simulasi Login Dev/Demo (Ketika Google Client ID belum disetel)
  async function handleDevMockLogin() {
    setErrorMsg(null);
    try {
      const demoNames = [
        'Budi Santoso (Warga Cirebon)',
        'Siti Rahmawati (Aktivis Pemuda)',
        'Dr. Hendra Gunawan (Akademisi Kebijakan)',
        'Agus Setiawan (Petani Hortikultura)',
      ];
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
      const randomEmail = `warga.${Date.now().toString().slice(-4)}@gmail.com`;

      const authResult = await loginCitizenGoogle({
        isDevMock: true,
        mockName: randomName,
        mockEmail: randomEmail,
        mockAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomName)}`,
      });

      saveSession(authResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses simulasi login Google.');
    }
  }

  function saveSession(authResult: { token: string; citizen: CitizenUser }) {
    setToken(authResult.token);
    setCitizen(authResult.citizen);
    localStorage.setItem('polaris_citizen_token', authResult.token);
    localStorage.setItem('polaris_citizen_profile', JSON.stringify(authResult.citizen));
    setSuccessMsg(`Selamat datang, ${authResult.citizen.fullName}! Sesi login Google berhasil aktif.`);
    setTimeout(() => setSuccessMsg(null), 4000);
    loadComments();
  }

  function handleLogout() {
    setToken(null);
    setCitizen(null);
    localStorage.removeItem('polaris_citizen_token');
    localStorage.removeItem('polaris_citizen_profile');
  }

  // 3. Kirim Komentar Utama
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !citizen) return;
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await postComment(slug, token, { commentText: newCommentText.trim() });
      setNewCommentText('');
      setSuccessMsg(res.message || 'Komentar Anda berhasil dikirim.');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadComments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  }

  // 4. Kirim Balasan (Reply)
  async function handleSubmitReply(parentCommentId: string) {
    if (!token || !citizen) return;
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    setErrorMsg(null);
    try {
      const res = await postComment(slug, token, {
        commentText: replyText.trim(),
        parentCommentId,
      });
      setReplyText('');
      setReplyingToId(null);
      setSuccessMsg(res.message || 'Balasan berhasil dikirim.');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadComments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim balasan.');
    } finally {
      setSubmittingReply(false);
    }
  }

  // 5. Apresiasi Like Komentar
  async function handleLike(commentId: string) {
    if (!token) {
      setErrorMsg('Silakan masuk dengan akun Google terlebih dahulu untuk menyukai komentar.');
      return;
    }
    if (likedComments.has(commentId)) return;

    try {
      await likeComment(commentId, token);
      setLikedComments((prev) => new Set(prev).add(commentId));
      
      // Update state lokal instan
      setComments((prev) => updateLikeInTree(prev, commentId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyukai komentar.');
    }
  }

  function updateLikeInTree(list: CommentItem[], targetId: string): CommentItem[] {
    return list.map((item) => {
      if (item.id === targetId) {
        return { ...item, likesCount: item.likesCount + 1 };
      }
      if (item.replies && item.replies.length > 0) {
        return { ...item, replies: updateLikeInTree(item.replies, targetId) };
      }
      return item;
    });
  }

  // 6. Hapus Komentar Sendiri
  async function handleDeleteComment(commentId: string) {
    if (!token) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;

    try {
      await deleteOwnComment(commentId, token);
      loadComments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus komentar.');
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-gray-200" id="komentar-warga">
      {/* SCRIPT GOOGLE IDENTITY SERVICES */}
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

      {/* HEADER SECTION DISKUSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Kolom Diskusi & Aspirasi Kebijakan
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
              {totalCount} Komentar
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ruang dialektika publik yang terverifikasi dan beradab sesuai standar keterbukaan informasi parlemen.
          </p>
        </div>

        {/* INDIKATOR STATUS SESI */}
        {citizen && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
            {citizen.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={citizen.avatarUrl}
                alt={citizen.fullName}
                className="h-6 w-6 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {citizen.fullName[0]}
              </div>
            )}
            <span className="text-xs font-bold text-gray-800 truncate max-w-[140px]">
              {citizen.fullName}
            </span>
            <button
              onClick={handleLogout}
              title="Keluar Akun"
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* NOTIFIKASI ALERTS */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* BOX 1: FORM LOGIN / INPUT KOMENTAR */}
      {!citizen ? (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100/80 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-blue-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900">
              Sampaikan Gagasan atau Kritik Konstruktif Anda
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Untuk mencegah serangan bot & akun anonim palsu, silakan masuk menggunakan akun Google Anda yang terverifikasi sebelum mengirim komentar.
            </p>

            <div className="pt-2 flex flex-col items-center justify-center gap-3">
              {/* Wadah Google Official Button */}
              <div ref={googleBtnRef} className="min-h-[40px] flex items-center justify-center" />

              {/* Dev / Demo One-Click Fallback jika Google Client ID belum disetel */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDevMockLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Masuk Cepat (Simulasi Akun Google Warga)</span>
                </button>
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  *Tersedia untuk pengujian instan tanpa setup GCP Console sekarang.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FORM KOMENTAR WARGA YANG SUDAH LOGIN */
        <form onSubmit={handleSubmitComment} className="mb-10 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              {citizen.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={citizen.avatarUrl}
                  alt={citizen.fullName}
                  className="h-6 w-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {citizen.fullName[0]}
                </div>
              )}
              <span className="text-xs font-bold text-gray-900">{citizen.fullName}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Warga Terverifikasi
              </span>
            </div>

            <textarea
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Tuliskan analisis, aspirasi, atau sudut pandang Anda terhadap kajian kebijakan ini secara santun..."
              maxLength={1000}
              className="w-full resize-none border-0 p-0 text-sm text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px]">
                {newCommentText.length}/1000 karakter • Sensor kata kasar otomatis aktif
              </span>

              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Komentar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* DAFTAR POHON KOMENTAR (NESTED COMMENTS) */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-xs">Memuat ruang diskusi...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-gray-700">Belum Ada Tanggapan</h5>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Jadilah warga pertama yang menyampaikan telaah atau aspirasi konstruktif pada kajian ini!
            </p>
          </div>
        ) : (
          comments.map((root) => (
            <div key={root.id} className="space-y-3">
              {/* KOMENTAR UTAMA */}
              <CommentCard
                item={root}
                currentUser={citizen}
                onReply={() => setReplyingToId(replyingToId === root.id ? null : root.id)}
                onLike={() => handleLike(root.id)}
                onDelete={() => handleDeleteComment(root.id)}
                isLiked={likedComments.has(root.id)}
              />

              {/* FORM BALASAN BERTINGKAT (INLINE REPLY) */}
              {replyingToId === root.id && citizen && (
                <div className="ml-8 sm:ml-12 p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <CornerDownRight className="h-3.5 w-3.5 text-blue-600" />
                    <span>Balas tanggapan @{root.citizen.fullName}:</span>
                  </div>

                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ketik balasan Anda..."
                    maxLength={1000}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={submittingReply || !replyText.trim()}
                      onClick={() => handleSubmitReply(root.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
                    </button>
                  </div>
                </div>
              )}

              {/* ANAK KOMENTAR (REPLIES) */}
              {root.replies && root.replies.length > 0 && (
                <div className="ml-6 sm:ml-10 space-y-2.5 pl-3 border-l-2 border-blue-100">
                  {root.replies.map((child) => (
                    <CommentCard
                      key={child.id}
                      item={child}
                      currentUser={citizen}
                      isReply
                      onLike={() => handleLike(child.id)}
                      onDelete={() => handleDeleteComment(child.id)}
                      isLiked={likedComments.has(child.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

interface CommentCardProps {
  item: CommentItem;
  currentUser: CitizenUser | null;
  isReply?: boolean;
  onReply?: () => void;
  onLike: () => void;
  onDelete: () => void;
  isLiked: boolean;
}

function CommentCard({
  item,
  currentUser,
  isReply = false,
  onReply,
  onLike,
  onDelete,
  isLiked,
}: CommentCardProps) {
  const isAuthor = currentUser?.id === item.citizen.id;

  return (
    <div
      className={`p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm transition-all hover:border-gray-300 ${
        item.status === 'FLAGGED_SPAM' ? 'opacity-50 bg-amber-50/40 border-amber-200' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {item.citizen.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.citizen.avatarUrl}
              alt={item.citizen.fullName}
              className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {item.citizen.fullName[0]}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                {item.citizen.fullName}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-200">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span>Terverifikasi Google</span>
              </span>

              {item.status === 'FLAGGED_SPAM' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] font-black text-amber-800">
                  Menunggu Moderasi Spam
                </span>
              )}
            </div>

            <span className="text-[11px] text-gray-400">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={onDelete}
            title="Hapus komentar saya"
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ISI TEKS KOMENTAR */}
      <p className="mt-3 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
        {item.commentText}
      </p>

      {/* DOCK AKSI (LIKE & REPLY) */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-500">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 transition-colors ${
            isLiked ? 'text-blue-600' : 'hover:text-blue-600'
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
          <span>{item.likesCount > 0 ? item.likesCount : 'Apresiasi'}</span>
        </button>

        {!isReply && onReply && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Balas</span>
          </button>
        )}
      </div>
    </div>
  );
}
