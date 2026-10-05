'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NewsItem {
  id: string | number;
  portal: string;
  publishedAt: string;
  sentiment: number;
  title: string;
  url: string;
  summary: string;
  sector?: string | null;
}

interface RegionalNewsSectionProps {
  news?: NewsItem[];
}

const POLICY_SECTOR_LABELS: Record<string, string> = {
  FISKAL_ANGGARAN: 'Fiskal & Anggaran',
  INFRASTRUKTUR_RUANG: 'Infrastruktur & Ruang',
  PANGAN_PERTANIAN: 'Pangan & Pertanian',
  SOSIAL_KEMISKINAN: 'Sosial & Kemiskinan',
  LAYANAN_DASAR: 'Layanan Dasar',
  TATA_KELOLA_HUKUM: 'Tata Kelola & Hukum',
  EKONOMI_KETENAGAKERJAAN: 'Ekonomi & Ketenagakerjaan',
  LINGKUNGAN_BENCANA: 'Lingkungan & Bencana',
};

export function RegionalNewsSection({ news = [] }: RegionalNewsSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            5 Perkembangan Media & Isu Daerah Terkini
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">
          Diserap Otomatis
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {news.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">Belum ada berita daerah yang diserap hari ini.</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className="py-3.5 space-y-1.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-extrabold text-blue-600 uppercase">
                    {item.portal} • {formatDateIndonesian(item.publishedAt)}
                  </span>
                  {item.sector && (
                    <Badge variant="slate">{POLICY_SECTOR_LABELS[item.sector] || item.sector}</Badge>
                  )}
                </div>
                <Badge variant={item.sentiment > 0 ? 'green' : item.sentiment < 0 ? 'red' : 'slate'}>
                  {item.sentiment > 0 ? 'Positif' : item.sentiment < 0 ? 'Negatif' : 'Netral'}
                </Badge>
              </div>

              <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <span>{item.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                </a>
              </h5>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
