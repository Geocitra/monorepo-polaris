'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Palette,
  CreditCard,
  Inbox,
  LogOut,
  BookOpen,
  Globe,
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { QuotaBadge } from './quota-badge';
import { cn, formatDateIndonesian } from '@/lib/utils';
import { ExpiryAlertModal } from '@/components/billing/ExpiryAlertModal';

interface TopbarProps {
  fullName?: string;
  party?: string;
  subdomain?: string;
  articleRemaining?: number;
  articleLimit?: number;
  dalleRemaining?: number;
  dalleLimit?: number;
  subscriptionStatus?: string;
  currentPeriodEnd?: string | null;
}

const navItems = [
  { name: 'Ringkasan Pagi', href: '/', icon: LayoutDashboard },
  { name: 'Studio Konten AI', href: '/studio', icon: Sparkles },
  { name: 'Kelola Konten & Web', href: '/studio/library', icon: BookOpen },
  { name: 'Suara & Aspirasi Warga', href: '/aspirasi', icon: Inbox },
  { name: 'Tema & Website', href: '/branding', icon: Palette },
  { name: 'Profil Anggota', href: '/profile', icon: User },
  { name: 'Paket & Lisensi', href: '/billing', icon: CreditCard },
];

export function Topbar({
  fullName,
  party,
  subdomain,
  articleRemaining = 9999,
  articleLimit = 9999,
  dalleRemaining = 9999,
  dalleLimit = 9999,
  subscriptionStatus: propSubStatus,
  currentPeriodEnd: propPeriodEnd,
}: TopbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fetchedBilling, setFetchedBilling] = useState<{
    subscriptionStatus: string;
    currentPeriodEnd: string | null;
  } | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Jika prop status/periodEnd belum diberikan oleh halaman pemanggil, ambil sekali secara mandiri
    if (propSubStatus === undefined || propPeriodEnd === undefined) {
      ApiClient.request<any>('/billing/status')
        .then((res) => {
          if (res) {
            setFetchedBilling({
              subscriptionStatus: res.subscriptionStatus,
              currentPeriodEnd: res.currentPeriodEnd,
            });
          }
        })
        .catch(() => {});
    }
  }, [propSubStatus, propPeriodEnd]);

  const effectiveStatus = propSubStatus ?? fetchedBilling?.subscriptionStatus ?? 'ACTIVE';
  const effectivePeriodEnd = propPeriodEnd !== undefined ? propPeriodEnd : (fetchedBilling?.currentPeriodEnd ?? null);

  let daysLeft: number | null = null;
  if (effectiveStatus === 'ACTIVE' && effectivePeriodEnd) {
    const endMs = new Date(effectivePeriodEnd).getTime();
    const nowMs = Date.now();
    daysLeft = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
  }

  function handleLogout() {
    ApiClient.removeToken();
    router.push('/login');
  }

  return (
    <>
      {/* 1. BANNER JIKA BELUM AKTIF / TRIAL EXPIRED */}
      {effectiveStatus !== 'ACTIVE' && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs px-4 sm:px-6 py-2 flex items-center justify-between font-semibold shadow-xs sticky top-0 z-50">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-100" />
            <span className="truncate">
              <strong>Mode Pratinjau (Read-Only):</strong> Lisensi belum aktif. Eksplorasi diperbolehkan, namun kreasi AI & publikasi website memerlukan aktivasi.
            </span>
          </div>
          <Link
            href="/billing"
            className="shrink-0 px-3 py-1 rounded-lg bg-white text-slate-900 text-[11px] font-black hover:bg-amber-50 transition-colors shadow-2xs ml-3"
          >
            Aktifkan Lisensi &rarr;
          </Link>
        </div>
      )}

      {/* 2. BANNER RAMAH PERINGATAN H-7 S/D H-2 JATUH TEMPO */}
      {effectiveStatus === 'ACTIVE' && daysLeft !== null && daysLeft <= 7 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white text-xs px-4 sm:px-6 py-2 flex items-center justify-between font-semibold shadow-xs sticky top-0 z-50">
          <div className="flex items-center gap-2 truncate">
            <Clock className="h-4 w-4 shrink-0 text-amber-100" />
            <span className="truncate">
              <strong>Pengingat Masa Aktif:</strong>{' '}
              {daysLeft === 0
                ? `Hari ini adalah hari terakhir masa aktif lisensi Anda (${formatDateIndonesian(effectivePeriodEnd!)}).`
                : `Masa berlaku lisensi tersisa ${daysLeft} hari lagi (${formatDateIndonesian(effectivePeriodEnd!)}).`}{' '}
              Perpanjang paket untuk kelancaran layanan.
            </span>
          </div>
          <Link
            href="/billing"
            className="shrink-0 px-3 py-1 rounded-lg bg-white text-slate-900 text-[11px] font-black hover:bg-amber-50 transition-colors shadow-2xs ml-3"
          >
            Perpanjang Lisensi &rarr;
          </Link>
        </div>
      )}

      {/* 3. MODAL DIALOG H-1 / HARI H */}
      <ExpiryAlertModal
        currentPeriodEnd={effectivePeriodEnd}
        isSubActive={effectiveStatus === 'ACTIVE'}
      />

      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {/* HAMBURGER TOGGLE KHUSUS LAYAR MOBILE & TABLET */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/profile" className="group block">
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight transition-colors"
              style={{ ['--tw-group-hover-color' as any]: 'var(--color-primary)' }}
            >
              {fullName || 'Anggota Dewan'}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 transition-colors">
              <ShieldCheck className="h-3 w-3" style={{ color: 'var(--color-primary)' }} />
              <span>Fraksi {party || 'Parlemen'}</span>
            </p>
          </Link>
        </div>

        {/* INDIKATOR STATUS LISENSI AI */}
        <QuotaBadge
          subscriptionStatus={effectiveStatus}
          articleRemaining={articleRemaining}
          articleLimit={articleLimit}
          dalleRemaining={dalleRemaining}
          dalleLimit={dalleLimit}
        />
      </header>

      {/* MOBILE SLIDE-OVER DRAWER DENGAN BACKDROP */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Gelap */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel — Uses theme secondary for immersive feel */}
          <div
            className="relative flex flex-col justify-between w-4/5 max-w-xs p-5 shadow-2xl z-10 animate-in slide-in-from-left duration-200"
            style={{
              backgroundColor: 'var(--sidebar-bg)',
              color: 'var(--sidebar-fg)',
            }}
          >
            <div>
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-sm"
                    style={{
                      backgroundColor: 'var(--sidebar-logo-bg)',
                      color: 'var(--sidebar-logo-fg)',
                    }}
                  >
                    P
                  </div>
                  <span className="font-extrabold text-sm" style={{ color: 'var(--sidebar-fg)' }}>POLARIS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--sidebar-fg-muted)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                        color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg-muted)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
              {subdomain && (
                <a
                  href={`http://${subdomain}.localhost:3001`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: 'var(--sidebar-hover-bg)',
                    color: 'var(--sidebar-fg-muted)',
                  }}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--sidebar-brand-accent)' }} />
                    <span className="truncate">{subdomain}.polaris.id</span>
                  </span>
                  <span className="text-[10px] font-extrabold" style={{ color: 'var(--sidebar-brand-accent)' }}>Buka</span>
                </a>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
