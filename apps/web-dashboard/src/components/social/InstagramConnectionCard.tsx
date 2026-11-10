'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  Instagram,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InstagramAccountData {
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

interface InstagramConnectionCardProps {
  isUnpaid: boolean;
}

export function InstagramConnectionCard({ isUnpaid }: InstagramConnectionCardProps) {
  const { toast } = useToast();
  const [account, setAccount] = useState<InstagramAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    try {
      const data = await ApiClient.request<InstagramAccountData | null>(
        '/social/instagram/account'
      );
      setAccount(data);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
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
        '/social/instagram/auth-url'
      );
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuka Otorisasi Meta',
        description: err.message || 'Terjadi kesalahan sistem saat menghubungi server Meta.',
      });
      setActionLoading(false);
    }
  }

  async function handleRefresh() {
    setActionLoading(true);
    try {
      const res = await ApiClient.request<InstagramAccountData>(
        '/social/instagram/refresh',
        { method: 'POST' }
      );
      setAccount(res);
      toast({
        type: 'success',
        title: 'Token Berhasil Diperpanjang',
        description: `Masa aktif kredensial Meta diperbarui hingga ${res.daysRemaining} hari ke depan.`,
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
    if (!confirm('Putuskan koneksi akun Instagram resmi ini dari POLARIS?')) return;

    setActionLoading(true);
    try {
      await ApiClient.request('/social/instagram/disconnect', { method: 'POST' });
      setAccount(null);
      toast({
        type: 'info',
        title: 'Koneksi Diputus',
        description: 'Akun Instagram berhasil dilepas dari sistem.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memutus Koneksi',
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0 border border-slate-200 dark:border-slate-800">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Instagram Graph API</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                v21.0 Official
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Penerbitan konten otomatis 1-klik dari Studio AI langsung ke feed Instagram resmi dewan.
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
          <p className="text-xs text-slate-400">Memeriksa status akun Instagram...</p>
        </div>
      ) : account ? (
        <div className="space-y-4">
          {/* Info Akun Terhubung */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {account.profilePictureUrl && !imgError ? (
                <img
                  src={account.profilePictureUrl}
                  alt=""
                  onError={() => setImgError(true)}
                  className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {cleanHandle.slice(0, 2).toUpperCase() || 'IG'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    @{cleanHandle}
                  </span>
                  <a
                    href={`https://www.instagram.com/${cleanHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {account.accountName || 'Akun Resmi Parlemen'} • Tipe: {account.accountType || 'BUSINESS'}
                </p>
              </div>
            </div>

            {/* Token Lifetime Indicator */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
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
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={actionLoading}
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer h-8 px-3"
            >
              {actionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCw className="h-3.5 w-3.5" />
              )}
              <span>Perpanjang Token</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 gap-1.5 cursor-pointer h-8 px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Putuskan</span>
            </Button>
          </div>

          {/* Footer Terenkripsi */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Terenkripsi AES-256-GCM HKDF
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              ID: {account.id?.slice(0, 8)}...
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tautkan akun Instagram resmi Anda untuk mengaktifkan:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Penerbitan naskah opini dan infografis 1-klik langsung ke Instagram feed</li>
              <li>Siklus sindikasi otomatis bersamaan dengan artikel website</li>
              <li>Integrasi Instagram Graph API resmi Meta tanpa perantara bot</li>
            </ul>
          </div>

          <Button
            type="button"
            onClick={handleConnect}
            disabled={actionLoading || isUnpaid}
            className="w-full h-11 bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:opacity-90 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="w-4 h-4" />
            )}
            <span>Hubungkan Akun Instagram Resmi</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
