'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminApiClient } from '@/lib/api-client';
import { SuperadminSidebar } from '@/components/superadmin/layout/SuperadminSidebar';
import { SuperadminTopbar } from '@/components/superadmin/layout/SuperadminTopbar';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Jika di halaman login, jangan redirect
    if (pathname === '/superadmin/login') return;

    const token = AdminApiClient.getToken();
    const user = AdminApiClient.getUser();

    if (!token) {
      router.replace('/superadmin/login');
      return;
    } 
    
    if (user?.role === 'CONTENT_OPERATOR' || user?.role === 'SUPPORT_OPERATOR') {
      // OPERATOR TIDAK BOLEH MENGAKSES PANEL SUPERADMIN!
      router.replace('/operator');
      return;
    } 
    
    if (user?.role !== 'SUPERADMIN') {
      AdminApiClient.logout();
      router.replace('/superadmin/login');
      return;
    }

    setAdminUser(user);
  }, [pathname, router]);

  // Halaman login tidak menggunakan sidebar & topbar layout
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  // Cegah render children jika belum terverifikasi sebagai SUPERADMIN!
  if (!mounted || !adminUser || adminUser.role !== 'SUPERADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memverifikasi otorisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      {/* 1. SIDEBAR KIRI: DESAIN & POSISI SAMA DENGAN DASHBOARD UTAMA */}
      <SuperadminSidebar adminEmail={adminUser?.email} />

      {/* 2. KONTEN KANAN: TOPBAR + MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperadminTopbar adminEmail={adminUser?.email} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
