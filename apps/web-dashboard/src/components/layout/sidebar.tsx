'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Palette,
  CreditCard,
  Inbox,
  LogOut,
  Globe,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Ringkasan Pagi', href: '/', icon: LayoutDashboard },
  { name: 'Studio Konten AI', href: '/studio', icon: Sparkles },
  { name: 'Kelola Konten & Web', href: '/studio/library', icon: BookOpen },
  { name: 'Suara & Aspirasi Warga', href: '/aspirasi', icon: Inbox },
  { name: 'Tema & Website', href: '/branding', icon: Palette },
  { name: 'Profil Anggota', href: '/profile', icon: User },
  { name: 'Paket & Lisensi', href: '/billing', icon: CreditCard },
];

export function Sidebar({ subdomain }: { subdomain?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('polaris_sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('polaris_sidebar_collapsed', String(next));
  }

  function handleLogout() {
    ApiClient.removeToken();
    router.push('/login');
  }

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-300 z-30 theme-transition',
        collapsed ? 'w-20' : 'w-64'
      )}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* TOGGLE COLLAPSE BUTTON */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 z-40 h-6 w-6 rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          border: '1px solid var(--sidebar-border)',
          color: 'var(--sidebar-fg-muted)',
        }}
        title={collapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* BRAND LOGO HEADER */}
        <div
          className="h-16 px-5 flex items-center gap-3 overflow-hidden"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm shrink-0"
            style={{
              backgroundColor: 'var(--sidebar-logo-bg)',
              color: 'var(--sidebar-logo-fg)',
            }}
          >
            P
          </div>
          {!collapsed && (
            <div className="animate-in fade-in duration-200">
              <span
                className="font-black text-base tracking-tight block leading-none"
                style={{ color: 'var(--sidebar-fg)' }}
              >
                POLARIS
              </span>
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest block mt-1"
                style={{ color: 'var(--sidebar-brand-accent)' }}
              >
                Chief of Staff OS
              </span>
            </div>
          )}
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/'
              ? pathname === '/'
              : item.href === '/studio'
                ? (pathname === '/studio' || pathname.startsWith('/studio/terpadu') || pathname.startsWith('/studio/artikel') || pathname.startsWith('/studio/infografis'))
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center rounded-xl text-sm font-bold transition-all',
                  collapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5',
                )}
                style={{
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg-muted)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)';
                    e.currentTarget.style.color = 'var(--sidebar-fg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--sidebar-fg-muted)';
                  }
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER: PORTAL LINK & LOGOUT */}
      <div
        className="p-3 space-y-2 shrink-0"
        style={{
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: 'var(--sidebar-bg)',
        }}
      >
        {subdomain && !collapsed && (
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
            <span className="flex items-center gap-2 truncate">
              <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--sidebar-brand-accent)' }} />
              <span className="truncate font-mono">{subdomain}.polaris.id</span>
            </span>
            <span className="text-[10px] font-extrabold" style={{ color: 'var(--sidebar-brand-accent)' }}>Buka</span>
          </a>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar Akun' : undefined}
          className={cn(
            'w-full flex items-center rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-colors',
            collapsed ? 'justify-center p-3' : 'space-x-2.5 px-3 py-2'
          )}
          style={{
            /* On hover the bg is subtle red overlay */
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Keluar Akun</span>}
        </button>
      </div>
    </aside>
  );
}
