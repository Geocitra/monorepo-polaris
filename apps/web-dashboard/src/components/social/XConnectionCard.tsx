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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface XAccountData {
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

interface XConnectionCardProps {
  isUnpaid: boolean;
}

export function XConnectionCard({ isUnpaid }: XConnectionCardProps) {
  const { toast } = useToast();
  const [account, setAccount] = useState<XAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    try {
      const data = await ApiClient.request<XAccountData | null>('/social/x/account');
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
      const res = await ApiClient.request<{ authorizationUrl: string }>('/social/x/auth-url');
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuka Otorisasi X',
        description: err.message || 'Terjadi kesalahan sistem saat menghubungi server X (Twitter).',
      });
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Putuskan koneksi akun X (Twitter) resmi ini dari POLARIS?')) return;

    setActionLoading(true);
    try {
      await ApiClient.request('/social/x/disconnect', { method: 'DELETE' });
      setAccount(null);
      toast({
        type: 'success',
        title: 'Koneksi Diputuskan',
        description: 'Akun X berhasil dinonaktifkan dari sistem sindikasi.',
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
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0 border border-slate-800">
            {/* SVG Logo X (Twitter) */}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>X (Twitter) API</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                v2 Official
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sindikasi opini publik, poster grafis, &amp; utas cuitan linimasa X resmi.
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
          <p className="text-xs text-slate-400">Memeriksa status akun X...</p>
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
                  {cleanHandle.slice(0, 2).toUpperCase() || 'X'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    @{cleanHandle}
                  </span>
                  <a
                    href={`https://x.com/${cleanHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {account.accountName || 'Akun X Resmi'} • Public Profile
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
              Tautkan akun X resmi Anda untuk mengaktifkan:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Penerbitan utas berita/opini otomatis langsung dari AI Studio</li>
              <li>Lampiran visual poster &amp; infografis format PNG/JPG resmi</li>
              <li>Otentikasi aman berbasis OAuth 2.0 PKCE dengan perpanjangan otomatis</li>
            </ul>
          </div>

          <Button
            type="button"
            onClick={handleConnectOAuth}
            disabled={actionLoading || isUnpaid}
            className="w-full h-11 bg-black hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            )}
            <span>Hubungkan Akun X Resmi</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

