'use client';

import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface LockoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export function LockoutModal({
  isOpen,
  onClose,
  featureTitle = 'Akses AI Generator Terkunci',
  featureDescription = 'Fitur pembuatan naskah, desain poster visual, dan publikasi otomatis ke portal resmi hanya dapat digunakan setelah lisensi akun Anda diaktifkan.',
}: LockoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aktivasi Lisensi Diperlukan">
      <div className="space-y-4 pt-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{featureTitle}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
            {featureDescription}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Sintesis Artikel & Opini Kebijakan Tanpa Batas</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Desain Poster Visual DALL-E 3 Resolusi Tinggi</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Publikasi Otomatis ke Website Resmi Dewan</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Nanti Saja
          </Button>
          <Link href="/billing">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5">
              <span>Buka Menu Billing & Aktivasi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
