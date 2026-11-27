'use client';

import { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Bot,
  Building2,
  Layers,
  FileSpreadsheet,
  Scale,
  Settings,
  BarChart3,
  Plus,
  MessageSquare,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import type {
  InstitutionalChatSessionDto,
  OrganizationMemberQuotaDto,
} from '@polaris/shared-types';
import { ApiClient } from '@/lib/api-client';
import { getPortalUrl, getRootDomain } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { MyQuotaUsageModal } from '@/components/institutional/MyQuotaUsageModal';

const B2C_NAV_ITEMS = [
  { name: 'Ringkasan Pagi', href: '/', icon: LayoutDashboard },
  { name: 'Studio Konten AI', href: '/studio', icon: Sparkles },
  { name: 'Kelola Konten & Web', href: '/studio/library', icon: BookOpen },
  { name: 'Suara & Aspirasi Warga', href: '/aspirasi', icon: Inbox },
  { name: 'Tema & Website', href: '/branding', icon: Palette },
  { name: 'Profil Anggota', href: '/profile', icon: User },
  { name: 'Paket & Lisensi', href: '/billing', icon: CreditCard },
];

const B2B_RESTRICTED_ROUTES = ['/studio', '/branding', '/billing', '/aspirasi', '/datahub'];

export interface SidebarProps {
  subdomain?: string;
  customDomain?: string | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  subdomain: propSubdomain,
  customDomain: propCustomDomain,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [subdomain, setSubdomain] = useState<string | undefined>(propSubdomain);
  const [customDomain, setCustomDomain] = useState<string | null | undefined>(propCustomDomain);
  const [accountMode, setAccountMode] = useState<'B2B_ONLY' | 'B2C_ONLY' | 'HYBRID' | null>(null);
  const [primaryOrg, setPrimaryOrg] = useState<{
    organizationId: string;
    organizationName: string;
    orgRole: string;
    hasAssignedUnits?: boolean;
  } | null>(null);
  const [hybridMode, setHybridMode] = useState<'B2B' | 'B2C'>(() =>
    pathname.startsWith('/institutional') ? 'B2B' : 'B2C'
  );
  const [b2bSessions, setB2bSessions] = useState<InstitutionalChatSessionDto[]>([]);
  const [activeB2bSessionId, setActiveB2bSessionId] = useState<string | null>(null);
  const [b2bQuota, setB2bQuota] = useState<OrganizationMemberQuotaDto | null>(null);
  const [b2bCtx, setB2bCtx] = useState<{ orgId: string; unitId: string }>({ orgId: '', unitId: '' });
  const [userDisplayName, setUserDisplayName] = useState<string>('Anggota POLARIS');
  const [historyOpen, setHistoryOpen] = useState(true);
  const [manageOpen, setManageOpen] = useState(
    () => pathname.startsWith('/institutional/admin') || pathname.startsWith('/institutional/usage')
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith('/institutional/admin') || pathname.startsWith('/institutional/usage')) {
      setManageOpen(true);
    }
    setProfileMenuOpen(false);
    onMobileClose?.();
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(ev.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (accountMode === 'HYBRID') {
      setHybridMode(pathname.startsWith('/institutional') ? 'B2B' : 'B2C');
    }
  }, [accountMode, pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('polaris_sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (propSubdomain !== undefined) setSubdomain(propSubdomain);
    if (propCustomDomain !== undefined) setCustomDomain(propCustomDomain);
  }, [propSubdomain, propCustomDomain]);

  useEffect(() => {
    try {
      const cachedRaw = sessionStorage.getItem('polaris_sidebar_profile');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached.accountMode) setAccountMode(cached.accountMode);
        if (cached.primaryOrganization !== undefined) setPrimaryOrg(cached.primaryOrganization);
        if (cached.fullName) setUserDisplayName(cached.fullName);
        if (cached.subdomain && !propSubdomain) setSubdomain(cached.subdomain);
        if (cached.customDomain !== undefined && propCustomDomain === undefined) {
          setCustomDomain(cached.customDomain);
        }
      }
    } catch { }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function hydrateProfile(attempt = 0) {
      try {
        const profile = await ApiClient.request<any>('/auth/me');
        if (cancelled) return;
        if (profile) {
          if (profile.subdomain && !propSubdomain) setSubdomain(profile.subdomain);
          if (profile.customDomain !== undefined && propCustomDomain === undefined) {
            setCustomDomain(profile.customDomain);
          }
          if (profile.accountMode) setAccountMode(profile.accountMode);
          if (profile.primaryOrganization !== undefined) setPrimaryOrg(profile.primaryOrganization);
          if (profile.fullName) setUserDisplayName(profile.fullName);
          try {
            sessionStorage.setItem(
              'polaris_sidebar_profile',
              JSON.stringify({
                accountMode: profile.accountMode ?? null,
                primaryOrganization: profile.primaryOrganization ?? null,
                fullName: profile.fullName ?? null,
                subdomain: profile.subdomain ?? null,
                customDomain: profile.customDomain ?? null,
              })
            );
          } catch { }
        }
      } catch {
        if (!cancelled && attempt < 2) {
          retryTimer = setTimeout(() => hydrateProfile(attempt + 1), 1200);
        }
      }
    }
    hydrateProfile();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [propSubdomain, propCustomDomain]);

  useEffect(() => {
    const loadSessions = (orgId: string, unitId: string) => {
      if (!orgId || !unitId) return;
      ApiClient.request<InstitutionalChatSessionDto[]>(
        `/institutional/orgs/${orgId}/units/${unitId}/chat-sessions`
      )
        .then((list) => setB2bSessions(Array.isArray(list) ? list : []))
        .catch(() => { });
    };

    if (typeof window !== 'undefined') {
      const savedOrg = sessionStorage.getItem('polaris_active_org_id') || '';
      const savedUnit = sessionStorage.getItem('polaris_active_unit_id') || '';
      if (savedOrg && savedUnit) {
        setB2bCtx({ orgId: savedOrg, unitId: savedUnit });
        loadSessions(savedOrg, savedUnit);
      }
    }

    const onWorkspaceChanged = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      const nextOrgId = detail.orgId || '';
      const nextUnitId = detail.unitId || '';
      setB2bCtx({ orgId: nextOrgId, unitId: nextUnitId });
      if (detail.myQuota !== undefined) setB2bQuota(detail.myQuota);
      if (nextOrgId && nextUnitId) loadSessions(nextOrgId, nextUnitId);
    };
    const onSessionsUpdated = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      if (detail.activeSessionId !== undefined) {
        setActiveB2bSessionId(detail.activeSessionId);
      }
      const orgId = detail.orgId || b2bCtx.orgId || sessionStorage.getItem('polaris_active_org_id') || '';
      const unitId = detail.unitId || b2bCtx.unitId || sessionStorage.getItem('polaris_active_unit_id') || '';
      if (orgId && unitId) loadSessions(orgId, unitId);
    };
    const onQuotaUpdated = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      if (detail.myQuota) setB2bQuota(detail.myQuota);
    };

    window.addEventListener('polaris:b2b-workspace-changed', onWorkspaceChanged);
    window.addEventListener('polaris:b2b-sessions-updated', onSessionsUpdated);
    window.addEventListener('polaris:b2b-quota-updated', onQuotaUpdated);
    return () => {
      window.removeEventListener('polaris:b2b-workspace-changed', onWorkspaceChanged);
      window.removeEventListener('polaris:b2b-sessions-updated', onSessionsUpdated);
      window.removeEventListener('polaris:b2b-quota-updated', onQuotaUpdated);
    };
  }, [b2bCtx.orgId, b2bCtx.unitId]);

  const isOrgAdmin = primaryOrg?.orgRole === 'ORG_ADMIN';
  const isPureOrgAdmin =
    primaryOrg?.orgRole === 'ORG_ADMIN' && primaryOrg?.hasAssignedUnits === false;

  // Route Guard untuk isolasi B2B_ONLY vs B2C_ONLY
  useEffect(() => {
    if (accountMode === 'B2B_ONLY') {
      const isHome = pathname === '/';
      const isRestrictedB2c = B2B_RESTRICTED_ROUTES.some((r) => pathname.startsWith(r));
      const isPureAdminRestrictedAi =
        isPureOrgAdmin &&
        (pathname === '/institutional' ||
          pathname.startsWith('/institutional/lkpj') ||
          pathname.startsWith('/institutional/legislation'));
      if (isHome || isRestrictedB2c || isPureAdminRestrictedAi) {
        router.replace(isOrgAdmin ? '/institutional/admin' : '/institutional');
      }
    } else if (accountMode === 'B2C_ONLY') {
      if (pathname.startsWith('/institutional')) {
        router.replace('/');
      }
    }
  }, [accountMode, isOrgAdmin, isPureOrgAdmin, pathname, router]);

  const b2bNavItems = isPureOrgAdmin
    ? [
      { name: 'Organisasi & Anggota', href: '/institutional/admin', icon: Settings, exact: false },
      { name: 'Pantauan AI & Kuota', href: '/institutional/usage', icon: BarChart3, exact: false },
      { name: 'Profil & Keamanan', href: '/profile', icon: User, exact: false },
    ]
    : [
      ...(isOrgAdmin
        ? [
            { name: 'Organisasi & Anggota', href: '/institutional/admin', icon: Settings, exact: false },
            { name: 'Pantauan AI & Kuota', href: '/institutional/usage', icon: BarChart3, exact: false },
          ]
        : []),
    ];

  const handleB2bNewChat = () => {
    setActiveB2bSessionId(null);
    onMobileClose?.();
    if (pathname !== '/institutional') {
      router.push('/institutional');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('polaris:b2b-new-chat'));
    }
  };

  const handleB2bOpenLibrary = () => {
    onMobileClose?.();
    if (pathname !== '/institutional') {
      router.push('/institutional');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('polaris:b2b-open-library'));
      }, 250);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('polaris:b2b-open-library'));
    }
  };

  const handleB2bSelectSession = (sessionId: string) => {
    setActiveB2bSessionId(sessionId);
    onMobileClose?.();
    if (pathname !== '/institutional') {
      sessionStorage.setItem('polaris_pending_session_id', sessionId);
      router.push('/institutional');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('polaris:b2b-select-session', { detail: { sessionId } }));
    }
  };

  const handleB2bDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!b2bCtx.orgId || !b2bCtx.unitId) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${b2bCtx.orgId}/units/${b2bCtx.unitId}/chat-sessions/${sessionId}`,
        { method: 'DELETE' }
      );
      setB2bSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeB2bSessionId === sessionId) {
        handleB2bNewChat();
      }
    } catch { }
  };

  const showB2bMenu =
    accountMode === 'B2B_ONLY' ||
    (accountMode === 'HYBRID' && hybridMode === 'B2B') ||
    (accountMode === null && pathname.startsWith('/institutional'));
  const activeNavItems = showB2bMenu ? b2bNavItems : B2C_NAV_ITEMS;

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('polaris_sidebar_collapsed', String(next));
  }

  function handleLogout() {
    ApiClient.removeToken();
    router.push('/login');
  }

  const cleanCustomDomain =
    customDomain && typeof customDomain === 'string' && customDomain.trim()
      ? customDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
      : null;

  return (
    <>
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          'h-screen flex-col justify-between print:hidden shrink-0 transition-all duration-300 theme-transition',
          mobileOpen
            ? 'fixed inset-y-0 left-0 z-50 flex w-64 md:sticky md:top-0 md:z-30'
            : 'sticky top-0 hidden md:flex z-30',
          !mobileOpen && collapsed ? 'md:w-20' : 'md:w-64'
        )}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        {/* BRAND LOGO HEADER + COLLAPSE TOGGLE */}
        <div
          className={cn(
            'h-16 flex items-center overflow-hidden shrink-0',
            collapsed ? 'px-2 justify-center gap-1' : 'px-4 justify-between gap-2'
          )}
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="POLARIS"
              className={cn(
                'rounded-xl object-contain shrink-0 shadow-xs',
                collapsed ? 'h-8 w-8' : 'h-9 w-9'
              )}
            />
            {!collapsed && (
              <div className="animate-in fade-in duration-200 min-w-0">
                <span
                  className="font-black text-base tracking-tight block leading-none"
                  style={{ color: 'var(--sidebar-fg)' }}
                >
                  POLARIS
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-widest block mt-1 truncate max-w-[140px]"
                  style={{ color: 'var(--sidebar-brand-accent)' }}
                >
                  {showB2bMenu
                    ? primaryOrg?.organizationName || 'Tenaga Ahli B2B'
                    : 'Chief of Staff OS'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapse}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer hover:bg-white/10"
            style={{ color: 'var(--sidebar-fg-muted)' }}
            title={collapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* HYBRID WORKSPACE SWITCHER (Hanya jika akun punya B2C + B2B) */}
        {accountMode === 'HYBRID' && !collapsed && (
          <div className="px-3 pt-3">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900/50 border border-slate-700/60 text-[10px] font-extrabold">
              <button
                type="button"
                onClick={() => {
                  setHybridMode('B2B');
                  router.push('/institutional');
                }}
                className={cn(
                  'py-1.5 rounded-lg transition-colors cursor-pointer',
                  hybridMode === 'B2B' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Instansi B2B
              </button>
              <button
                type="button"
                onClick={() => {
                  setHybridMode('B2C');
                  router.push('/');
                }}
                className={cn(
                  'py-1.5 rounded-lg transition-colors cursor-pointer',
                  hybridMode === 'B2C' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                Perseorangan
              </button>
            </div>
          </div>
        )}

        {/* MAIN NAVIGATION */}
        {showB2bMenu && !isPureOrgAdmin ? (
          <div className="p-3 space-y-3 flex-1 flex flex-col min-h-0">
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleB2bNewChat}
                title={collapsed ? 'Percakapan Baru' : undefined}
                className={cn(
                  'w-full flex items-center rounded-xl text-sm font-bold transition-all cursor-pointer',
                  collapsed ? 'justify-center p-3' : 'space-x-2.5 px-3.5 py-2.5'
                )}
                style={{
                  backgroundColor: pathname === '/institutional' && !activeB2bSessionId
                    ? 'var(--sidebar-active-bg)'
                    : 'var(--sidebar-hover-bg)',
                  color: 'var(--sidebar-fg)',
                }}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Percakapan Baru</span>}
              </button>

              <button
                type="button"
                onClick={handleB2bOpenLibrary}
                title={collapsed ? 'Pustaka Dokumen Bidang' : undefined}
                className={cn(
                  'w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  collapsed ? 'justify-center p-3' : 'space-x-2.5 px-3.5 py-2'
                )}
                style={{ color: 'var(--sidebar-fg-muted)' }}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Pustaka Bidang</span>}
              </button>
            </div>

            {!collapsed && (
              <div className={cn('min-h-0 flex flex-col', historyOpen ? 'flex-1' : 'shrink-0')}>
                <button
                  type="button"
                  onClick={() => setHistoryOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>Riwayat Chat</span>
                  {historyOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                  )}
                </button>
                {historyOpen && (
                  <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 mt-0.5">
                    {b2bSessions.length === 0 ? (
                      <p className="px-2 py-2 text-[11px] text-slate-500">
                        Belum ada percakapan tersimpan.
                      </p>
                    ) : (
                      b2bSessions.map((sess) => {
                        const isSel = activeB2bSessionId === sess.id && pathname === '/institutional';
                        return (
                          <div
                            key={sess.id}
                            onClick={() => handleB2bSelectSession(sess.id)}
                            className="group flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                            style={{
                              backgroundColor: isSel ? 'var(--sidebar-active-bg)' : 'transparent',
                              color: isSel ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg-muted)',
                            }}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <span className="truncate font-medium">{sess.title}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleB2bDeleteSession(e, sess.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-opacity"
                              title="Hapus chat"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeNavItems.length > 0 && (
              <div
                className="mt-auto pt-2 border-t space-y-1 shrink-0"
                style={{ borderColor: 'var(--sidebar-border)' }}
              >
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => setManageOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Kelola</span>
                    {manageOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                    )}
                  </button>
                )}
                {(collapsed || manageOpen) &&
                  activeNavItems.map((item: any) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        className={cn(
                          'flex items-center rounded-xl text-xs font-bold transition-all',
                          collapsed ? 'justify-center p-3' : 'space-x-2.5 px-3 py-2'
                        )}
                        style={{
                          backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                          color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg-muted)',
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          <nav className="p-3 space-y-1">
            {activeNavItems.map((item: any) => {
              const Icon = item.icon;
              const isActive = item.exact || item.href === '/'
                ? pathname === item.href
                : item.href === '/studio'
                  ? pathname === '/studio' ||
                  pathname.startsWith('/studio/terpadu') ||
                  pathname.startsWith('/studio/artikel') ||
                  pathname.startsWith('/studio/infografis')
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
        )}
      </div>

      {/* FOOTER: B2B CHATGPT-STYLE PROFILE POPOVER OR B2C PORTAL LINK & LOGOUT */}
      <div
        ref={profileMenuRef}
        className="relative p-3 space-y-2 shrink-0"
        style={{
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: 'var(--sidebar-bg)',
        }}
      >
        {showB2bMenu && !isPureOrgAdmin ? (
          <>
            {profileMenuOpen && (
              <div
                className={cn(
                  'absolute bottom-full mb-2 rounded-2xl border shadow-2xl p-2 space-y-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150',
                  collapsed ? 'left-2 w-60' : 'left-3 right-3'
                )}
                style={{
                  backgroundColor: 'var(--sidebar-bg)',
                  borderColor: 'var(--sidebar-border)',
                }}
              >
                {b2bQuota && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setQuotaModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[11px] space-y-1 transition-colors hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--sidebar-hover-bg)',
                      color: 'var(--sidebar-fg-muted)',
                    }}
                    title="Klik untuk melihat rincian kuota & pemakaian AI pribadi Anda"
                  >
                    <div
                      className="flex items-center justify-between font-bold"
                      style={{ color: 'var(--sidebar-fg)' }}
                    >
                      <span>Kuota Mingguan AI</span>
                      <span className="font-mono">
                        {b2bQuota.byFeature
                          ? `${b2bQuota.byFeature.COORDINATOR_CHAT.remainingWeekly}/${b2bQuota.byFeature.COORDINATOR_CHAT.weeklyLimit}`
                          : `${b2bQuota.remainingWeekly}/${b2bQuota.weeklyLimit}`}
                      </span>
                    </div>
                    {b2bQuota.byFeature && (
                      <div className="flex items-center justify-between text-[10px] opacity-85">
                        <span>
                          LKPJ {b2bQuota.byFeature.LKPJ_EVALUATION.remainingWeekly}/
                          {b2bQuota.byFeature.LKPJ_EVALUATION.weeklyLimit}
                        </span>
                        <span>
                          Legislasi {b2bQuota.byFeature.LEGISLATION.remainingWeekly}/
                          {b2bQuota.byFeature.LEGISLATION.weeklyLimit}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] font-bold text-indigo-400 pt-0.5">
                      Lihat Detail Pemakaian &rsaquo;
                    </div>
                  </button>
                )}

                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/5"
                  style={{
                    backgroundColor: pathname === '/profile' ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: pathname === '/profile' ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)',
                  }}
                >
                  <Settings className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span>Profil &amp; Keamanan</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              title={collapsed ? `${userDisplayName} (Menu Akun & Kuota)` : undefined}
              className={cn(
                'w-full flex items-center rounded-xl text-xs font-bold transition-colors cursor-pointer hover:bg-white/5',
                collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
              )}
              style={{
                backgroundColor: profileMenuOpen ? 'var(--sidebar-hover-bg)' : 'transparent',
                color: 'var(--sidebar-fg)',
              }}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                  {userDisplayName.slice(0, 1).toUpperCase()}
                </span>
                {!collapsed && (
                  <span className="truncate text-left">{userDisplayName}</span>
                )}
              </span>
              {!collapsed && (
                <span className="flex items-center gap-1.5 shrink-0">
                  {b2bQuota && (
                    <span className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[10px] font-bold text-slate-300">
                      {b2bQuota.byFeature
                        ? `${b2bQuota.byFeature.COORDINATOR_CHAT.remainingWeekly}/${b2bQuota.byFeature.COORDINATOR_CHAT.weeklyLimit}`
                        : `${b2bQuota.remainingWeekly}/${b2bQuota.weeklyLimit}`}
                    </span>
                  )}
                  {profileMenuOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5 opacity-60" />
                  )}
                </span>
              )}
            </button>
          </>
        ) : (
          <>
            {!showB2bMenu && (cleanCustomDomain || subdomain) && !collapsed && (
              <a
                href={getPortalUrl(subdomain, cleanCustomDomain)}
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
                  <span className="truncate font-mono">
                    {cleanCustomDomain || (subdomain ? `${subdomain}.${getRootDomain()}` : '')}
                  </span>
                </span>
                <span className="text-[10px] font-extrabold" style={{ color: 'var(--sidebar-brand-accent)' }}>Buka</span>
              </a>
            )}

            <button
              onClick={handleLogout}
              title={collapsed ? 'Keluar Akun' : undefined}
              className={cn(
                'w-full flex items-center rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer',
                collapsed ? 'justify-center p-3' : 'space-x-2.5 px-3 py-2'
              )}
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
          </>
        )}
      </div>

      <MyQuotaUsageModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        organizationId={b2bCtx.orgId || primaryOrg?.organizationId || ''}
      />
      </aside>
    </>
  );
}
