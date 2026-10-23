'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminApiClient } from '@/lib/api-client';
import { LogOut, Shield, UserCheck, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [operatorUser, setOperatorUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedMode, setMode } = useTheme();

  useEffect(() => {
    setMounted(true);
    const token = AdminApiClient.getToken();
    const user = AdminApiClient.getUser();

    if (!token) {
      router.replace('/superadmin/login');
      return;
    }

    if (user?.role !== 'CONTENT_OPERATOR' && user?.role !== 'SUPPORT_OPERATOR' && user?.role !== 'SUPERADMIN') {
      router.replace('/superadmin/login');
      return;
    }

    setOperatorUser(user);
  }, [router]);

  function handleLogout() {
    AdminApiClient.logout();
    router.push('/superadmin/login');
  }

  if (!mounted || !operatorUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat Cockpit Operator...</p>
        </div>
      </div>
    );
  }

  const isDark = resolvedMode === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* TOP NAVIGATION BAR FOR OPERATOR COCKPIT */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* BRANDING */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                  POLARIS <span className="text-amber-500 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">OPERATOR COCKPIT</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Managed Content Operations & Civic Triage Engine
              </p>
            </div>
          </div>

          {/* USER INFO & ACTIONS */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMode(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{operatorUser?.fullName || 'Operator Staf'}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 text-[11px]">{operatorUser?.email}</span>
            </div>

            {operatorUser?.role === 'SUPERADMIN' && (
              <button
                onClick={() => router.push('/superadmin')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Panel Superadmin</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
