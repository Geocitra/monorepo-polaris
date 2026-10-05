import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
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
