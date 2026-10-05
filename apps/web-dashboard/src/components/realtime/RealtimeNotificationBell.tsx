'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Zap,
  ExternalLink,
  Radio,
  FileText,
  Clock,
  PlayCircle,
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { cn } from '@/lib/utils';

export function RealtimeNotificationBell() {
  const {
    isConnected,
    notifications,
    unreadCount,
    markAllAsRead,
    triggerTestNotification,
    triggerSimulateJob,
  } = useRealtime();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleOpen() {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng dengan Badge Unread */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "relative p-2 rounded-xl border transition-all cursor-pointer",
          isOpen
            ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
            : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300"
        )}
        title="Pusat Notifikasi Real-Time (Redis Pub/Sub)"
        aria-label="Notifikasi Real-time"
      >
        <Bell className="h-4 w-4" />

        {/* Indikator Titik Hijau Redis Connected */}
        {isConnected && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
            title="Redis Stream Terhubung Aktif"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}

        {/* Counter Badge jika ada notifikasi baru */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel Notifikasi */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Notifikasi Eksekutif
              </h3>
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black",
                isConnected
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
              )}>
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                {isConnected ? 'Redis Live' : 'Connecting...'}
              </span>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Tandai Dibaca</span>
              </button>
            )}
          </div>

          {/* Quick Action Tester (Demo Redis Pub/Sub) */}
          <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100/60 dark:border-blue-900/40 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span>Tes Alur Redis:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={triggerTestNotification}
                className="px-2 py-1 text-[10px] font-black bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                title="Kirim pesan cepat via Redis Pub/Sub"
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>Kirim Push</span>
              </button>
              <button
                type="button"
                onClick={triggerSimulateJob}
                className="px-2 py-1 text-[10px] font-black bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                title="Simulasi AI Job 0% -> 100% via BullMQ"
              >
                <PlayCircle className="h-2.5 w-2.5 text-blue-500" />
                <span>Simulasi AI</span>
              </button>
            </div>
          </div>

          {/* List Notifikasi */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Belum ada notifikasi baru.</p>
                <p className="text-[10px] mt-0.5">Event sistem &amp; AI akan muncul langsung di sini.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const dateStr = new Date(item.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left flex gap-3",
                      !item.read && "bg-blue-50/30 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.category === 'ARTICLE' ? (
                        <div className="h-7 w-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                          <Clock className="h-2.5 w-2.5" />
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Buka Halaman</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
