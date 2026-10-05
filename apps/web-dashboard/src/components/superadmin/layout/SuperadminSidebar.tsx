'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Database,
  Cpu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const adminNavItems = [
  { name: 'Control Tower', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Kelola Dewan & Lisensi', href: '/superadmin/tenants', icon: Users },
  { name: 'Rekonsiliasi Kas Midtrans', href: '/superadmin/reconciliation', icon: Receipt },
  { name: 'Audit & Log Aktivitas', href: '/superadmin/activity-logs', icon: ShieldCheck },
  { name: 'Observabilitas AI & Token', href: '/superadmin/ai-monitoring', icon: Cpu },
  { name: 'Master Data & Partai', href: '/superadmin/master-data', icon: Database },
];


export function SuperadminSidebar({ adminEmail }: { adminEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedMode } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('polaris_admin_sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('polaris_admin_sidebar_collapsed', String(next));
  }

  function handleLogout() {
    AdminApiClient.logout();
    router.push('/superadmin/login');
  }

  const isDark = resolvedMode === 'dark';

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-300 z-30 bg-white dark:bg-[#0B0F17] border-r border-slate-200 dark:border-slate-800',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* TOMBOL TOGGLE COLLAPSE */}
      <button
        onClick={toggleCollapse}
        className={cn(
          'absolute -right-3 top-20 z-40 h-6 w-6 rounded-full border shadow-sm flex items-center justify-center transition-all cursor-pointer',
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
        )}
        title={collapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* BRAND LOGO HEADER: SAMA PERSIS DENGAN MAIN DASHBOARD */}
        <div className="h-16 px-5 flex items-center gap-3 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            P
          </div>
          {!collapsed && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  POLARIS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Admin
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-1">
                Central Operations
              </span>
            </div>
          )}
        </div>

        {/* MENU NAVIGASI ADMIN */}
        <nav className="p-3 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/superadmin'
              ? pathname === '/superadmin'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-bold transition-all',
                  collapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER AKUN ADMIN & LOGOUT: SAMA PERSIS DENGAN MAIN DASHBOARD */}
      <div className="p-3 space-y-2 shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17]">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="truncate flex-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none">
                Super Administrator
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {adminEmail || 'smtpgeocitra@gmail.com'}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar Console' : undefined}
          className={cn(
            'w-full flex items-center rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer',
            collapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Keluar Console</span>}
        </button>
      </div>
    </aside>
  );
}
