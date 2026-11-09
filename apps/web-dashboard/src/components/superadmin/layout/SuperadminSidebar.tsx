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
  Video,
  Files,
  UserCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const adminNavItems = [
  { name: 'Control Tower', href: '/superadmin', icon: LayoutDashboard },
  { name: 'DataHub Dokumen AI', href: '/superadmin/datahub', icon: Files },
  { name: 'Kelola Dewan & Lisensi', href: '/superadmin/tenants', icon: Users },
  { name: 'Staf Operator Konten', href: '/superadmin/operators', icon: UserCheck },
  { name: 'Lead Inquiries & GMeet', href: '/superadmin/inquiries', icon: Video },
  { name: 'Rekonsiliasi Kas Midtrans', href: '/superadmin/reconciliation', icon: Receipt },
  { name: 'Audit & Log Aktivitas', href: '/superadmin/activity-logs', icon: ShieldCheck },
  { name: 'Observabilitas AI & Token', href: '/superadmin/ai-monitoring', icon: Cpu },
  { name: 'AI Self-Critic & Memory', href: '/superadmin/ai-critic', icon: Sparkles },
  { name: 'Master Data & Tarif', href: '/superadmin/master-data', icon: Database },
  { name: 'Pengaturan & Sakelar Fitur', href: '/superadmin/settings', icon: Sliders },
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

        {/* NAVIGATION LIST */}
        <nav className="p-3 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/superadmin'
                ? pathname === '/superadmin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER USER / LOGOUT */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-150 cursor-pointer',
            collapsed && 'justify-center px-0'
          )}
          title="Keluar dari Superadmin"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Keluar Panel</span>}
        </button>
      </div>
    </aside>
  );
}
