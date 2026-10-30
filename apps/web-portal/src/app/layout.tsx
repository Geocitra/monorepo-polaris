import './globals.css';
import './polaris-theme.css';
import type { Metadata } from 'next';

const defaultAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : 'https://polaris.id');

export const metadata: Metadata = {
  metadataBase: new URL(defaultAppUrl),
  title: 'Portal Akuntabilitas Publik Anggota Dewan',
  description: 'Portal resmi transparansi kinerja, gagasan kebijakan, dan layanan aspirasi warga.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
