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
  Sparkles,
  Loader2,
  KeyRound,
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

  if (loading) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
        <span className="text-xs text-slate-400 font-semibold">Memeriksa status integrasi Instagram...</span>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Instagram className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Integrasi Instagram Graph API Resmi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Official OAuth 2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Penerbitan konten otomatis 1-klik dari Studio AI langsung ke feed Instagram resmi dewan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-bold self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Kredensial Terenkripsi UU PDP</span>
        </div>
      </div>

      {account ? (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-800/60 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200/90 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {account.profilePictureUrl ? (
                <img
                  src={account.profilePictureUrl}
                  alt={account.accountHandle}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {account.accountHandle[0]?.toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    @{account.accountHandle}
                  </h4>
                  <a
                    href={`https://instagram.com/${account.accountHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {account.accountName || 'Akun Resmi Parlemen'} • Tipe: {account.accountType}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Terhubung Aktif</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Token: {account.daysRemaining} Hari Tersisa</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-auto border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={actionLoading}
                className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCw className={`h-3.5 w-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Perpanjang Sesi</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Putuskan Akun</span>
              </Button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Siap Menerbitkan:</strong> Setiap kali menyusun naskah dan poster di <strong>Studio Konten AI</strong>, opsi penerbitan instan ke feed akun <strong>@{account.accountHandle}</strong> akan otomatis aktif.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
            <Instagram className="h-6 w-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Belum Ada Akun Instagram Terhubung
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hubungkan akun Instagram Professional (Creator atau Business) resmi Anda untuk membuka fitur penerbitan naskah dan poster otomatis tanpa copy-paste manual.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleConnect}
              disabled={actionLoading}
              className="bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:opacity-90 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md gap-2"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Instagram className="h-4 w-4" />
              )}
              <span>Hubungkan Instagram Resmi Sekarang</span>
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            *Pastikan akun Instagram Anda sudah dialihkan ke akun Professional (Creator / Bisnis) di aplikasi Instagram HP Anda.
          </p>
        </div>
      )}
    </Card>
  );
}
