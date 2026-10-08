'use client';

import React, { useState } from 'react';
import { X, Video, Calendar, Link as LinkIcon, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { InquiryRow } from '@/components/superadmin/types';

interface ScheduleMeetModalProps {
  inquiry: InquiryRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleMeetModal({ inquiry, onClose, onSuccess }: ScheduleMeetModalProps) {
  // Format default to tomorrow 10:00 AM
  const getDefaultDatetime = () => {
    if (inquiry.meetingDatetime) {
      const d = new Date(inquiry.meetingDatetime);
      return d.toISOString().slice(0, 16);
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [datetime, setDatetime] = useState(getDefaultDatetime());
  const [meetingUrl, setMeetingUrl] = useState(
    inquiry.meetingUrl || `https://meet.google.com/plr-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
  );
  const [adminNotes, setAdminNotes] = useState(inquiry.adminNotes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!meetingUrl.trim()) {
        throw new Error('Link Google Meet wajib diisi.');
      }

      await AdminApiClient.request(`/inquiries/${inquiry.id}/schedule-meet`, {
        method: 'POST',
        body: JSON.stringify({
          meetingDatetime: new Date(datetime).toISOString(),
          meetingUrl: meetingUrl.trim(),
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menjadwalkan Google Meet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Jadwalkan Sesi Demo Google Meet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triage calon anggota dewan dan verifikasi proposal teknis platform.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Summary Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Prospek:</span>
              <span className="font-bold text-slate-900 dark:text-white">{inquiry.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Yurisdiksi & Wilayah:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {inquiry.legislativeLevel.replace(/_/g, ' ')} • {inquiry.targetRegion}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Paket Minat:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                Tier {inquiry.preferredTier} ({inquiry.preferredCycle})
              </span>
            </div>
          </div>

          {/* Tanggal & Jam */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Waktu Sesi Pertemuan (WIB)</span>
            </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Link Google Meet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Link Tautan Google Meet</span>
              </span>
              {meetingUrl && (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Buka Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              required
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Catatan Diskusi Admin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Catatan Negosiasi / Persiapan Demo</span>
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Contoh: Fokuskan presentasi pada modul aspirasi konstituen dan integrasi WhatsApp dapil..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan & Jadwalkan Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
