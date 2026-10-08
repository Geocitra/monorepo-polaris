'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';

export function SessionSecurityGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // Abaikan jika di halaman login publik atau console superadmin
    if (
      !pathname ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/superadmin')
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
          // Token expired or invalid, handled by ApiClient / redirect
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
          // Reload window to ensure all cached context refresh cleanly
          window.location.reload();
        }}
      />
    </>
  );
}
