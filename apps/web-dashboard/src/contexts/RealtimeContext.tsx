'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ApiClient, AdminApiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  category?: 'ARTICLE' | 'EXPORT' | 'CRAWLER' | 'BILLING' | 'SYSTEM';
  link?: string;
  timestamp: number;
  read?: boolean;
}

export interface LiveJobProgress {
  jobId: string;
  percent: number;
  step: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string;
  timestamp: number;
}

interface RealtimeContextValue {
  isConnected: boolean;
  notifications: RealtimeNotification[];
  unreadCount: number;
  activeJob: LiveJobProgress | null;
  markAllAsRead: () => void;
  triggerTestNotification: () => Promise<void>;
  triggerSimulateJob: () => Promise<void>;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
}

const defaultRealtimeValue: RealtimeContextValue = {
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  activeJob: null,
  markAllAsRead: () => {},
  triggerTestNotification: async () => {},
  triggerSimulateJob: async () => {},
  subscribe: () => () => {},
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

function getAnyActiveToken(): string | null {
  if (typeof window === 'undefined') return null;
  return ApiClient.getToken() || AdminApiClient.getToken();
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeJob, setActiveJob] = useState<LiveJobProgress | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);
    return () => {
      subscribersRef.current.get(eventType)?.delete(callback);
    };
  }, []);

  // Ambil riwayat notifikasi tersimpan dari Redis saat pertama kali mount
  useEffect(() => {
    async function fetchInitialHistory() {
      try {
        const token = getAnyActiveToken();
        if (!token) return;
        const client = AdminApiClient.getToken() ? AdminApiClient : ApiClient;
        const res = await client.request<any>('/realtime/notifications');
        if (res?.data && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch {
        // Silent catch jika offline / belum login
      }
    }
    fetchInitialHistory();
  }, []);

  // Hubungkan ke SSE Stream Backend (Didukung Redis Pub/Sub)
  useEffect(() => {
    let isMounted = true;

    function connectSSE() {
      const token = getAnyActiveToken();
      if (!token) {
        setIsConnected(false);
        return;
      }

      // Backend API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const streamUrl = `${apiUrl}/realtime/stream?token=${encodeURIComponent(token)}`;

      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isMounted) setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const parsed = JSON.parse(event.data);
            handleRealtimeMessage(parsed);
          } catch (err) {
            console.warn('[Realtime SSE] Gagal parse data:', err);
          }
        };

        es.onerror = () => {
          if (isMounted) setIsConnected(false);
          es.close();
          // Coba sambung ulang otomatis setelah 5 detik
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted) connectSSE();
          }, 5000);
        };
      } catch (err) {
        console.warn('[Realtime SSE] Connection error:', err);
      }
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Handler pesan masuk dari Redis
  const handleRealtimeMessage = useCallback((msg: any) => {
    const { type, data } = msg;

    // Notifikasi semua listener kustom yang berlangganan event type ini atau wildcard
    const specificHandlers = subscribersRef.current.get(type);
    if (specificHandlers) {
      specificHandlers.forEach((fn) => {
        try {
          fn(data);
        } catch (e) {
          console.error(`[Realtime SSE] Error in listener for ${type}:`, e);
        }
      });
    }

    const wildcardHandlers = subscribersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((fn) => {
        try {
          fn({ type, data });
        } catch (e) {
          console.error('[Realtime SSE] Error in wildcard listener:', e);
        }
      });
    }

    if (type === 'CONNECTED') {
      setIsConnected(true);
    } else if (type === 'DOMAIN_REQUEST_CREATED') {
      const newNotif: RealtimeNotification = {
        id: `domreq_${data?.requestId || Date.now()}`,
        title: '🌐 Pengajuan Domain Baru!',
        message: `${data?.authorName || 'Tokoh'} mengajukan ${data?.requestType === 'SUBDOMAIN' ? 'subdomain' : 'custom domain'}: ${data?.requestedDomain}`,
        category: 'SYSTEM',
        link: '/superadmin/tenants?tab=domains',
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);

      toast({
        title: newNotif.title,
        description: newNotif.message,
        type: 'info',
      });
    } else if (type === 'DOMAIN_REQUEST_APPROVED') {
      const newNotif: RealtimeNotification = {
        id: `domreq_app_${data?.requestId || Date.now()}`,
        title: '✅ Pengajuan Domain Disetujui!',
        message: `Domain ${data?.requestedDomain} telah disetujui dan aktif untuk website Anda.`,
        category: 'SYSTEM',
        link: '/branding/website',
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);

      toast({
        title: newNotif.title,
        description: newNotif.message,
        type: 'success',
      });
    } else if (type === 'DOMAIN_REQUEST_REJECTED') {
      const newNotif: RealtimeNotification = {
        id: `domreq_rej_${data?.requestId || Date.now()}`,
        title: '❌ Pengajuan Domain Ditolak',
        message: `Domain ${data?.requestedDomain} ditolak: ${data?.adminNotes || 'Mohon tinjau catatan admin.'}`,
        category: 'SYSTEM',
        link: '/branding/website',
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);

      toast({
        title: newNotif.title,
        description: newNotif.message,
        type: 'error',
      });
    } else if (type === 'NOTIFICATION') {
      const newNotif: RealtimeNotification = {
        id: data.id || `notif_${Date.now()}`,
        title: data.title || 'Notifikasi Polaris',
        message: data.message || '',
        category: data.category || 'SYSTEM',
        link: data.link,
        timestamp: data.timestamp || Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((c) => c + 1);

      // Munculkan Toast Interaktif Langsung
      toast({
        title: newNotif.title,
        description: newNotif.message,
        type: newNotif.category === 'ARTICLE' ? 'success' : 'info',
      });
    } else if (type === 'JOB_PROGRESS') {
      const progress: LiveJobProgress = {
        jobId: data.jobId,
        percent: data.percent,
        step: data.step,
        status: data.status,
        resultUrl: data.resultUrl,
        timestamp: data.timestamp || Date.now(),
      };

      setActiveJob(progress);

      // Jika selesai, bersihkan banner setelah 4 detik
      if (progress.status === 'COMPLETED' || progress.percent >= 100) {
        setTimeout(() => {
          setActiveJob((curr) => (curr?.jobId === progress.jobId ? null : curr));
        }, 4000);
      }
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const client = AdminApiClient.getToken() ? AdminApiClient : ApiClient;
    client.request('/realtime/notifications/read-all', { method: 'POST' }).catch(() => {});
  }, []);

  const triggerTestNotification = useCallback(async () => {
    try {
      const client = AdminApiClient.getToken() ? AdminApiClient : ApiClient;
      await client.request('/realtime/test-notify', {
        method: 'POST',
        body: JSON.stringify({
          title: '⚡ Notifikasi Real-Time Redis!',
          message: 'Data ini dikirim secara instan dari NestJS melalui Redis Pub/Sub ke browser.',
        }),
      });
    } catch (err: any) {
      toast({
        title: 'Uji Coba Gagal',
        description: err.message || 'Tidak dapat mengirim notifikasi uji coba.',
        type: 'error',
      });
    }
  }, []);

  const triggerSimulateJob = useCallback(async () => {
    try {
      const client = AdminApiClient.getToken() ? AdminApiClient : ApiClient;
      await client.request('/realtime/simulate-job', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Alokasi Anggaran Subsidi Pertanian 2026',
        }),
      });
      toast({
        title: 'Simulasi Job Dimulai',
        description: 'Antrean proses AI aktif di Redis. Perhatikan indikator progres live.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Memulai Job',
        description: err.message || 'Tidak dapat memulai simulasi job.',
        type: 'error',
      });
    }
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        activeJob,
        markAllAsRead,
        triggerTestNotification,
        triggerSimulateJob,
        subscribe,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    return defaultRealtimeValue;
  }
  return ctx;
}
