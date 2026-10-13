'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Loader2,
  KeyRound,
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ThreadsAccountData {
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

interface ThreadsConnectionCardProps {
  isUnpaid: boolean;
}

export function ThreadsConnectionCard({ isUnpaid }: ThreadsConnectionCardProps) {
  const { toast } = useToast();
  const [account, setAccount] = useState<ThreadsAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    try {
      const data = await ApiClient.request<ThreadsAccountData | null>(
        '/social/threads/account'
      );
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
      const res = await ApiClient.request<{ authorizationUrl: string }>(
        '/social/threads/auth-url'
      );
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuka Otorisasi Threads',
        description: err.message || 'Terjadi kesalahan sistem saat menghubungi server Meta Threads.',
      });
      setActionLoading(false);
    }
  }

  async function handleConnectManual() {
    if (!manualToken.trim()) {
      toast({
        type: 'warning',
        title: 'Token Kosong',
        description: 'Masukkan Access Token Threads yang valid.',
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await ApiClient.request<ThreadsAccountData>(
        '/social/threads/connect',
        {
          method: 'POST',
          body: JSON.stringify({ accessToken: manualToken.trim() }),
        }
      );
      setAccount(res);
      setShowManualInput(false);
      setManualToken('');
      toast({
        type: 'success',
        title: 'Akun Threads Terhubung! 🎉',
        description: `Berhasil menautkan @${res.accountHandle} ke Polaris.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menautkan Akun',
        description: err.message || 'Access token Threads tidak valid atau telah kedaluwarsa.',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefresh() {
    setActionLoading(true);
    try {
      const res = await ApiClient.request<ThreadsAccountData>(
        '/social/threads/refresh',
        { method: 'POST' }
      );
      setAccount(res);
      toast({
        type: 'success',
        title: 'Token Berhasil Diperpanjang',
        description: `Masa aktif kredensial Threads diperbarui hingga ${res.daysRemaining} hari ke depan.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperpanjang Token',
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Putuskan koneksi akun Threads resmi ini dari POLARIS?')) return;

    setActionLoading(true);
    try {
      await ApiClient.request('/social/threads/disconnect', { method: 'POST' });
      setAccount(null);
      toast({
        type: 'success',
        title: 'Koneksi Diputuskan',
        description: 'Akun Threads berhasil dinonaktifkan dari sistem sindikasi.',
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

  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Meta Threads API</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                v1.0 Official
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sindikasi cuitan opini publik & rich link card portal dewan resmi.
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
          <p className="text-xs text-slate-400">Memeriksa status akun Threads...</p>
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
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {account.accountHandle.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    @{account.accountHandle}
                  </span>
                  <a
                    href={`https://www.threads.net/@${account.accountHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {account.accountName || 'Akun Threads Resmi'} • Creator Mode
                </p>
              </div>
            </div>

            {/* Token Lifetime Indicator */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                Masa Aktif Token:
              </span>
              <span
                className={`font-mono font-bold ${
                  account.needsRefresh
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {account.daysRemaining} Hari Tersisa
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={actionLoading}
                className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCw className="h-3.5 w-3.5" />
                )}
                <span>Perpanjang Token (60 Hari)</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Putuskan Hubungan</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Hubungkan akun Threads Anda untuk mengaktifkan penerbitan otomatis:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Menerbitkan cuitan opini publik langsung dari Studio Kampanye.</li>
              <li>Pratinjau otomatis tautan portal dewan dengan Rich Link Cards.</li>
              <li>Enkripsi token berbasis standar keamanan data HKDF UU PDP No. 27/2022.</li>
            </ul>
          </div>

          {/* OAuth Buttons & Manual Connect */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleConnectOAuth}
                disabled={actionLoading || isUnpaid}
                className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Hubungkan Akun Threads via OAuth</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer border-dashed"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                <span>Input Token Manual</span>
              </Button>
            </div>

            {/* Manual Token Input Drawer */}
            {showManualInput && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Masukkan Access Token Meta Developer:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="THAAPjXirpgcNBYllOOVJR..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={handleConnectManual}
                    disabled={actionLoading || !manualToken.trim()}
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Simpan'}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Token akan langsung divalidasi ke Meta Graph API dan disimpan secara terenkripsi.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
