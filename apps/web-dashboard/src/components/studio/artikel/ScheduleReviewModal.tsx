'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewDate: string;
  onReviewDateChange: (date: string) => void;
  onSaveSchedule: () => void;
}

export function ScheduleReviewModal({
  isOpen,
  onClose,
  reviewDate,
  onReviewDateChange,
  onSaveSchedule,
}: ScheduleReviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jadwalkan Tinjauan Naskah"
    >
      <div className="space-y-4 pt-2">
        <p className="text-xs text-slate-500 leading-relaxed">
          Tentukan batas waktu bagi Tim Staf / Tenaga Ahli untuk merevisi dan menyetujui draf kajian sebelum diterbitkan secara resmi ke website.
        </p>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Tanggal & Jam Tinjauan:
          </label>
          <input
            type="datetime-local"
            value={reviewDate}
            onChange={(e) => onReviewDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 bg-white"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={onSaveSchedule}
            className="bg-blue-600 text-white font-bold"
          >
            Simpan Jadwal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
