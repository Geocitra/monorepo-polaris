'use client';

import { X, Calendar, User, FileText, BarChart3, Image as ImageIcon, Download, Share2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ContentItemDetails {
  type: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER';
  title: string;
  category: string;
  author: string;
  role: string;
  wordCount: string;
  excerpt: string;
  tags: string[];
  previewImage: string;
  bodyContent?: string;
}

interface ContentReaderModalProps {
  item: ContentItemDetails | null;
  onClose: () => void;
}

export function ContentReaderModal({ item, onClose }: ContentReaderModalProps) {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  if (!item) return null;

  const handleGoPricing = () => {
    onClose();
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
              {item.type}
            </span>
            <span className="text-xs font-bold text-slate-500">{item.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Tautan naskah berhasil disalin ke clipboard!');
                navigator.clipboard?.writeText(window.location.href);
              }}
              className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              title="Bagikan Tautan"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MODAL SCROLLABLE BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TITLE & META */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>{item.author} ({item.role})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Publikasi Resmi Parlemen</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                {item.wordCount}
              </span>
            </div>
          </div>

          {/* MAIN PREVIEW VISUAL */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            <img
              src={item.previewImage}
              alt={item.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>

          {/* SAMPLE CONTENT TEXT / ANALYSIS */}
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-5">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800 font-medium italic">
              &ldquo;{item.excerpt}&rdquo;
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Pokok-Pokok Telaah Kebijakan:</h4>
              <ul className="space-y-2 list-disc pl-5 text-slate-600">
                <li>
                  <strong>Kesesuaian Regulasi:</strong> Mengacu pada instrumen hukum terbaru, termasuk tata kelola anggaran daerah dan peraturan menteri terkait.
                </li>
                <li>
                  <strong>Validasi Data Statistik:</strong> Memadukan data agregat BPS terbaru untuk mendukung argumentasi fiskal yang akurat dan berbasis bukti.
                </li>
                <li>
                  <strong>Rekomendasi Aksi Parlemen:</strong> Merumuskan 3 langkah konkret pengawasan komisi dan sinkronisasi lintas pemangku kepentingan.
                </li>
              </ul>
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 pt-2">
              {item.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTION */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Format ini dapat dibuat otomatis dari pokok pikiran Anda di Workspace POLARIS.
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleGoPricing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Lihat Paket Harga
            </button>
            <a
              href="/pricing"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ajukan Permohonan Lisensi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
