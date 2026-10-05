'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Database,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Server,
  Cpu,
  Receipt,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { name: 'Control Tower', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Kelola Dewan & Lisensi', href: '/superadmin/tenants', icon: Users },
  { name: 'Rekonsiliasi Kas Midtrans', href: '/superadmin/reconciliation', icon: Receipt },
  { name: 'Observabilitas AI & Token', href: '/superadmin/ai-monitoring', icon: Cpu },
  { name: 'Master Data & Partai', href: '/superadmin/master-data', icon: Database },
];


export function SuperadminTopbar({ adminEmail }: { adminEmail?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedMode, setMode } = useTheme();

  function toggleQuickTheme() {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  }

  function handleLogout() {
    AdminApiClient.logout();
    router.push('/superadmin/login');
  }

  const getPageTitle = () => {
    if (pathname === '/superadmin') {
      return { title: 'Control Tower', sub: 'Monitoring Pusat & Performa Sistem' };
    }
    if (pathname.startsWith('/superadmin/tenants')) {
      return { title: 'Kelola Dewan & Lisensi', sub: 'Aktivasi Tenant, Verifikasi & Lisensi B2B' };
    }
    if (pathname.startsWith('/superadmin/reconciliation')) {
      return { 
        title: 'Rekonsiliasi Kas & Mutasi Midtrans', 
        sub: 'Audit Keseimbangan Buku Kas, Potongan MDR & Resolusi Selisih' 
      };
    }
    if (pathname.startsWith('/superadmin/ai-monitoring')) {

      return { title: 'Observabilitas AI & Token', sub: 'Audit Token LLM & Telemetri Langfuse' };
    }
    if (pathname.startsWith('/superadmin/master-data')) {
      return { title: 'Master Data Nasional', sub: 'Partai Politik, Dapil, & Komisi DPR' };
    }
    return { title: 'Superadmin Console', sub: 'Platform Operations' };
  };

  const { title, sub } = getPageTitle();

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
        {/* SISI KIRI: HAMBURGER MOBILE & JUDUL HALAMAN */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {title}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              <span>{sub}</span>
            </p>
          </div>
        </div>

        {/* SISI KANAN: TOGGLE DARK MODE + STATUS PUSAT + AKUN ADMIN */}
        <div className="flex items-center gap-2.5">
          {/* Status Server Pusat */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Server className="h-3 w-3" />
            <span>Pusat Aktif</span>
          </div>

          {/* Sun / Moon Theme Toggle */}
          <button
            type="button"
            onClick={toggleQuickTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={resolvedMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle tema gelap/terang"
          >
            {resolvedMode === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Admin Email Pill & Quick Logout */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {adminEmail || 'Superadmin'}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col justify-between w-4/5 max-w-xs bg-white dark:bg-[#0B0F17] p-5 shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
                    P
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      POLARIS Admin
                    </span>
                    <span className="block text-[10px] text-slate-400 font-bold">
                      Control Console
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/superadmin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
