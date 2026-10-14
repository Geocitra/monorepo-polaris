'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Printer, MessageCircle, Text } from 'lucide-react';

interface ArticleReaderToolbarProps {
  title: string;
  canonicalUrl: string;
}

export function ArticleReaderToolbar({ title, canonicalUrl }: ArticleReaderToolbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFontSize = () => {
    const newSize = fontSize === 'normal' ? 'large' : 'normal';
    setFontSize(newSize);
    const contentEl = document.getElementById('article-body-container');
    if (contentEl) {
      if (newSize === 'large') {
        contentEl.classList.remove('text-base', 'sm:text-lg');
        contentEl.classList.add('text-lg', 'sm:text-xl');
      } else {
        contentEl.classList.remove('text-lg', 'sm:text-xl');
        contentEl.classList.add('text-base', 'sm:text-lg');
      }
    }
  };

  return (
    <>
      {/* Scroll Progress Bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Floating / Sticky Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm my-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Alat Baca:</span>
          <button
            onClick={toggleFontSize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            title="Ubah ukuran huruf"
          >
            <Text className="w-3.5 h-3.5" />
            <span>Ukuran: {fontSize === 'normal' ? 'Standar' : 'Besar'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            title="Cetak atau simpan naskah PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium text-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`*Kajian Kebijakan Parlemen*: ${title}\n\nIzin membagikan telaah artikel untuk bahan diskusi dan rujukan:\n${canonicalUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kirim ke WA</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonicalUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bagikan</span>
          </a>
        </div>
      </div>
    </>
  );
}
