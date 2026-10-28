'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

/**
 * Portal component untuk merender modal, drawer, atau dialog overlay
 * langsung ke document.body. Memastikan elemen overlay terbebas dari
 * stacking context, transform, margin-collapse, dan spacing (space-y-*)
 * milik elemen induk di halaman.
 */
export function Portal({ children, containerId }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const container = containerId
    ? document.getElementById(containerId) || document.body
    : document.body;

  return createPortal(children, container);
}
