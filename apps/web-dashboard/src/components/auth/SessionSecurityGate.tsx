'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiClient, AdminApiClient } from '@/lib/api-client';
import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';

// Batas durasi tidak aktif sebelum auto-logout (60 menit)
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'polaris_last_activity';

export function SessionSecurityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const lastRecordedRef = useRef<number>(Date.now());

  // 1. Catat aktivitas interaksi pengguna (throttled setiap 15 detik agar efisien)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastRecordedRef.current > 15000) {
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Inisialisasi timestamp aktivitas pertama kali
    try {
      if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      }
    } catch {}

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handler = () => recordActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, handler, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handler);
      });
    };
  }, [recordActivity]);

  // 2. Interval pengecekan berkala (setiap 15 detik) untuk Idle Inactivity & Hard Expiration
  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
      if (!pathname) return;

      const isPublicAuthPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname === '/superadmin/login';

      if (isPublicAuthPage) return;

      let lastActive = Date.now();
      try {
        const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (stored) lastActive = Number(stored);
      } catch {}

      const idleDuration = Date.now() - lastActive;

      // Kasus A: Rute Superadmin & Operator
      if (pathname.startsWith('/superadmin') || pathname.startsWith('/operator')) {
        const adminToken = AdminApiClient.getToken();
        if (!adminToken) {
          // Token expired atau dihapus
          AdminApiClient.logout();
          router.replace('/superadmin/login?reason=session_expired');
          return;
        }

        if (idleDuration > IDLE_TIMEOUT_MS) {
          AdminApiClient.logout();
          router.replace('/superadmin/login?reason=idle_timeout');
          return;
        }
      } else {
        // Kasus B: Rute Dashboard Anggota Dewan
        const memberToken = ApiClient.getToken();
        if (!memberToken) {
          ApiClient.removeToken();
          router.replace('/login?reason=session_expired');
          return;
        }

        if (idleDuration > IDLE_TIMEOUT_MS) {
          ApiClient.removeToken();
          router.replace('/login?reason=idle_timeout');
          return;
        }
      }
    }, 15000);

    return () => clearInterval(checkSessionInterval);
  }, [pathname, router]);

  // 3. Verifikasi profil berkala & Force Password Change untuk akun baru
  useEffect(() => {
    if (
      !pathname ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/operator')
    ) {
      return;
    }

    if (ApiClient.isAuthenticated()) {
      ApiClient.request<any>('/auth/me')
        .then((profile) => {
          if (profile && profile.mustChangePassword) {
            setMustChangePassword(true);
          } else {
            setMustChangePassword(false);
          }
        })
        .catch(() => {
          // Token invalid/expired otomatis dibersihkan oleh ApiClient
        });
    }
  }, [pathname]);

  return (
    <>
      {children}
      <ForcePasswordChangeModal
        isOpen={mustChangePassword}
        onSuccess={() => {
          setMustChangePassword(false);
          window.location.reload();
        }}
      />
    </>
  );
}
