import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/contexts/ThemeContext';

import { SessionSecurityGate } from '@/components/auth/SessionSecurityGate';

export const metadata: Metadata = {
  title: 'POLARIS — Executive Chief of Staff Dashboard',
  description: 'Ruang kerja eksekutif anggota dewan untuk analisis isu, pembuatan artikel AI, dan sebaran publik.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <SessionSecurityGate>{children}</SessionSecurityGate>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
