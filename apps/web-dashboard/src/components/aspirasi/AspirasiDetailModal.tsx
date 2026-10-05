'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Phone, ExternalLink } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface AspirasiDetailModalProps {
  selectedItem: any | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
  updatingId: string | null;
  representativeName?: string;
}

export function AspirasiDetailModal({
  selectedItem,
  onClose,
  onStatusChange,
  updatingId,
  representativeName = 'Anggota Dewan',
}: AspirasiDetailModalProps) {
  if (!selectedItem) return null;

  const phoneParam = selectedItem.phoneNumber
    ? selectedItem.phoneNumber.replace(/^0/, '62').replace(/[^0-9]/g, '')
    : '';

  return (
    <Modal
      isOpen={selectedItem !== null}
      onClose={onClose}
      title="Detail Aspirasi & Advokasi Konstituen"
      description={`Tiket Resmi: ${selectedItem?.trackingTicketCode}`}
    >
      <div className="space-y-5">
        {/* STATUS STEPPER */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Status Tindak Lanjut:</span>
          <div className="flex gap-1.5">
            {['RECEIVED', 'VERIFIED', 'RESPONDED'].map((st) => (
              <button
                key={st}
                disabled={updatingId !== null}
                onClick={() => onStatusChange(selectedItem.id, st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  selectedItem.status === st
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* IDENTITAS WARGA TERDEKRIPSI */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Identitas Terdekripsi (UU PDP Safe)
          </span>
          <div className="grid grid-cols-2 gap-2 pt-1 font-medium text-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Nama Pelapor:</span>
              <strong className="text-slate-900">{selectedItem.citizenName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Nomor WhatsApp:</span>
              <strong className="font-mono text-slate-900">{selectedItem.phoneNumber}</strong>
            </div>
          </div>
        </div>

        {/* DETAIL LOKASI & MASALAH */}
        <div className="space-y-2 text-xs text-slate-800">
          <div className="flex gap-2">
            <span className="text-slate-400 w-24 shrink-0">Wilayah:</span>
            <span className="font-bold">
              Kecamatan {selectedItem.districtKecamatan}, {selectedItem.regencyName}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-400 w-24 shrink-0">Kategori:</span>
            <Badge variant="blue">{selectedItem.category}</Badge>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-400 w-24 shrink-0">Waktu Lapor:</span>
            <span>{formatDateIndonesian(selectedItem.submittedAt)}</span>
          </div>
          <div className="pt-2">
            <span className="text-slate-400 block mb-1">Isi Pesan Warga:</span>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed font-sans text-xs">
              {selectedItem.aspirationMessage}
            </div>
          </div>
        </div>

        {/* TOMBOL ADVOKASI WHATSAPP */}
        <div className="pt-2 flex gap-3">
          <a
            href={`https://wa.me/${phoneParam}?text=${encodeURIComponent(
              `Halo Bapak/Ibu ${selectedItem.citizenName}, kami dari Tim Advokasi (${representativeName}) menindaklanjuti laporan Anda terkait ${selectedItem.category} di Kec. ${selectedItem.districtKecamatan} (Nomor Tiket: ${selectedItem.trackingTicketCode}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-bold text-xs shadow-md hover:bg-green-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Hubungi Pelapor via WhatsApp</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <Button variant="outline" size="md" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
