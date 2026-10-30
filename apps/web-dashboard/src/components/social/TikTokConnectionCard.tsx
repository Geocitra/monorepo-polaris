'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Clock,
  Loader2,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TikTokAccountData {
  id: string;
  platform: string;
  accountType: string;
  accountHandle: string;
  accountName: string | null;
  profilePictureUrl: string | null;
  status: string;
  tokenExpiresAt: string;
  daysRemaining: number;
  needsRefresh: boolean;
  createdAt: string;
}

interface TikTokConnectionCardProps {
  isUnpaid: boolean;
}

export function TikTokConnectionCard({ isUnpaid }: TikTokConnectionCardProps) {
  const { toast } = useToast();
  const [account, setAccount] = useState<TikTokAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    try {
      const data = await ApiClient.request<TikTokAccountData | null>('/social/tiktok/account');
      setAccount(data);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectOAuth() {
    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Akses Terkunci',
        description: 'Aktivasi lisensi parlemen diperlukan untuk menghubungkan akun media sosial.',
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await ApiClient.request<{ authorizationUrl: string }>('/social/tiktok/auth-url');
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuka Otorisasi TikTok',
        description: err.message || 'Terjadi kesalahan sistem saat menghubungi server TikTok.',
      });
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Putuskan koneksi akun TikTok resmi ini dari POLARIS?')) return;

    setActionLoading(true);
    try {
      await ApiClient.request('/social/tiktok/disconnect', { method: 'DELETE' });
      setAccount(null);
      toast({
        type: 'success',
        title: 'Koneksi Diputuskan',
        description: 'Akun TikTok berhasil dinonaktifkan dari sistem sindikasi.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memutuskan Koneksi',
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  }

  const cleanHandle = account?.accountHandle?.replace(/^@/, '') || '';

  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#010101] via-[#05131f] to-[#121212] text-white flex items-center justify-center shadow-md shrink-0 border border-slate-800 relative overflow-hidden">
            {/* TikTok Icon with cyan/red split effect */}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-white relative z-10">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.99v7.91c0 1.94-.48 3.86-1.55 5.42-1.37 1.98-3.64 3.32-6.07 3.55-2.02.19-4.09-.34-5.78-1.5-1.92-1.32-3.14-3.41-3.32-5.73-.25-3.08 1.48-6.1 4.29-7.39 1.41-.65 3.01-.84 4.54-.57v4.18c-.85-.29-1.81-.28-2.63.09-.9.41-1.57 1.25-1.77 2.22-.3 1.44.52 2.96 1.91 3.46.99.36 2.12.21 2.98-.42.79-.58 1.25-1.52 1.25-2.52V.02z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#fe2c55] rounded-full blur-md opacity-70" />
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#25f4ee] rounded-full blur-md opacity-70" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>TikTok for Developers</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                v2 Content Posting
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Penerbitan video dokumentasi &amp; carousel materi kampanye langsung ke TikTok.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {loading ? (
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
        ) : account ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Terhubung</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Belum Terhubung</span>
          </div>
        )}
      </div>

      {/* Body Area */}
      {loading ? (
        <div className="p-6 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
          <p className="text-xs text-slate-400">Memeriksa status akun TikTok...</p>
        </div>
      ) : account ? (
        <div className="space-y-4">
          {/* Info Akun Terhubung */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {account.profilePictureUrl ? (
                <img
                  src={account.profilePictureUrl}
                  alt={account.accountHandle}
                  className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-sm shrink-0">
                  {cleanHandle.slice(0, 2).toUpperCase() || 'TT'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    @{cleanHandle}
                  </span>
                  <a
                    href={`https://www.tiktok.com/@${cleanHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {account.accountName || 'Kreator TikTok Resmi'} • Direct Post Mode
                </p>
              </div>
            </div>

            {/* Token Lifetime Indicator */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Masa Aktif Token:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {account.daysRemaining} hari tersisa
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Terenkripsi AES-256-GCM HKDF</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
              )}
              Putuskan
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautkan akun TikTok resmi Anda untuk mengaktifkan:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Penerbitan video pendek dokumentasi parlemen otomatis</li>
              <li>Penerbitan carousel grafis/foto langsung ke feed TikTok</li>
              <li>Integrasi Content Posting API resmi tanpa perlu domain verification</li>
            </ul>
          </div>

          <Button
            type="button"
            onClick={handleConnectOAuth}
            disabled={actionLoading || isUnpaid}
            className="w-full h-11 bg-gradient-to-r from-black via-slate-900 to-black hover:from-slate-900 hover:to-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 border border-slate-800"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="w-4 h-4 text-[#fe2c55]" />
            )}
            <span>Hubungkan Akun TikTok Resmi</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

