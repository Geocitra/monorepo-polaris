'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ExternalLink } from 'lucide-react';

interface PublicWebsiteCardProps {
  subdomain?: string;
}

export function PublicWebsiteCard({ subdomain }: PublicWebsiteCardProps) {
  const publicPortalUrl = subdomain ? `http://${subdomain}.localhost:3001` : '#';

  return (
    <Card className="p-3.5 sm:p-4 space-y-2.5 shadow-2xs border-slate-200 bg-white rounded-xl">
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>Website Portal Publik Resmi</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Portal representasi konstituen untuk opini, berita, dan aspirasi.
          </p>
        </div>
        <Link href="/branding">
          <Button variant="outline" size="sm" className="gap-1 text-[11px] px-2 py-0.5 h-6">
            <span>Atur Desain</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Button>
        </Link>
      </div>

      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[9px] text-slate-400 font-semibold block">Domain Publik:</span>
          <div className="font-mono text-xs font-extrabold text-blue-600 mt-0.5">
            https://{subdomain || 'dewan'}.polaris.id
          </div>
          <div className="text-[9px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Status: Online & Terhubung</span>
          </div>
        </div>

        <a
          href={publicPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Globe className="h-3 w-3 text-blue-600" />
          <span>Buka Portal</span>
        </a>
      </div>
    </Card>
  );
}
