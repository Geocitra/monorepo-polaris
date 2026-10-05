import Link from 'next/link';
import { Landmark, MessageSquareText, FileText } from 'lucide-react';

interface NavbarProps {
  subdomain: string;
  officialName: string;
  partyAffiliation: string;
}

export function Navbar({ subdomain: _subdomain, officialName, partyAffiliation }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-portal-primary text-white shadow-sm transition-transform group-hover:scale-105">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight text-gray-900 leading-tight">
              {officialName}
            </span>
            <span className="block text-xs font-medium text-gray-500">
              Fraksi {partyAffiliation}
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/#artikel"
            className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Gagasan & Artikel</span>
          </Link>
          <Link
            href="/lapor"
            className="flex items-center space-x-1.5 rounded-lg bg-portal-primary px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <MessageSquareText className="h-4 w-4" />
            <span>Kirim Aspirasi</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
