'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LicenseStatusBannerProps {
  isUnpaid: boolean;
  dapilName: string;
}

export function LicenseStatusBanner({ isUnpaid, dapilName }: LicenseStatusBannerProps) {
  if (isUnpaid) {
    return (
      <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm leading-tight">
              Mode Pratinjau — Akun Belum Diaktivasi
            </h4>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
              Data profil dan dapil Anda tersimpan aman. Generator AI dan portal publik aktif setelah lisensi diaktivasi.
            </p>
          </div>
        </div>
        <Link href="/billing">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 font-bold text-xs h-7 px-3 rounded-lg shadow-2xs">
            Aktivasi Lisensi Sekarang &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2.5 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-extrabold text-xs sm:text-sm">Lisensi & Akses Ekosistem Aktif</h4>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Koneksi AI Knowledge Grounding dapil <span className="font-bold underline">{dapilName}</span> dan sindikasi publikasi portal telah aktif.
          </p>
        </div>
      </div>
      <Badge variant="green" className="font-bold text-[10px] px-2.5 py-0.5 shrink-0">Akun Terverifikasi</Badge>
    </div>
  );
}
