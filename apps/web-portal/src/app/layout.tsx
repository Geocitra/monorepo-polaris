import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  title: 'Portal Akuntabilitas Publik Anggota Dewan',
  description: 'Portal resmi transparansi kinerja, gagasan kebijakan, dan layanan aspirasi warga.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
