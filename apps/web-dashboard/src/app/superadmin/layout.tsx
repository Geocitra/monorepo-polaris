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
    } else {
      setAdminUser(user);
    }
  }, [pathname, router]);

  // Halaman login tidak menggunakan sidebar & topbar layout
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
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
