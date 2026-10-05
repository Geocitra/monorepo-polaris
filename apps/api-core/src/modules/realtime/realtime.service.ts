import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject, merge, interval } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { RedisService, UserNotificationEvent, UserProgressEvent } from '../redis/redis.service.js';

export interface RealtimeMessage {
  type: 'CONNECTED' | 'NOTIFICATION' | 'JOB_PROGRESS' | 'HEARTBEAT';
  data: any;
  timestamp: number;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Membuka aliran Server-Sent Events (SSE) untuk tenant yang sedang login.
   * Aliran ini mendengarkan event dari Redis Pub/Sub secara instan.
   */
  createStreamForUser(tenantId: string): Observable<MessageEvent> {
    const userSubject = new Subject<RealtimeMessage>();
    const progressChannel = `realtime:progress:${tenantId}`;
    const notificationChannel = `realtime:notifications:${tenantId}`;
    const broadcastChannel = `realtime:broadcast`;

    this.logger.log(`Client SSE terhubung untuk tenant: ${tenantId}`);

    // Handler untuk progress pekerjaan
    const progressHandler = (event: UserProgressEvent) => {
      userSubject.next({
        type: 'JOB_PROGRESS',
        data: event,
        timestamp: Date.now(),
      });
    };

    // Handler untuk notifikasi
    const notificationHandler = (event: UserNotificationEvent) => {
      userSubject.next({
        type: 'NOTIFICATION',
        data: event,
        timestamp: Date.now(),
      });
    };

    // Handler untuk siaran umum
    const broadcastHandler = (event: any) => {
      userSubject.next({
        type: 'NOTIFICATION',
        data: event,
        timestamp: Date.now(),
      });
    };

    // Subscribe ke saluran Redis
    this.redisService.subscribe(progressChannel, progressHandler);
    this.redisService.subscribe(notificationChannel, notificationHandler);
    this.redisService.subscribe(broadcastChannel, broadcastHandler);

    // Kirim event sambutan awal
    setTimeout(() => {
      userSubject.next({
        type: 'CONNECTED',
        data: { message: 'Koneksi real-time Redis terhubung aktif.', tenantId },
        timestamp: Date.now(),
      });
    }, 100);

    // Heartbeat otomatis tiap 15 detik agar koneksi tidak diputus oleh proxy/load balancer
    const heartbeat$ = interval(15000).pipe(
      map((): RealtimeMessage => ({
        type: 'HEARTBEAT',
        data: { alive: true },
        timestamp: Date.now(),
      }))
    );

    const merged$ = merge(userSubject.asObservable(), heartbeat$);

    return merged$.pipe(
      map((msg): MessageEvent => ({
        data: JSON.stringify(msg),
      })),
      finalize(() => {
        this.logger.log(`Client SSE terputus untuk tenant: ${tenantId}, membersihkan listener Redis.`);
        this.redisService.unsubscribe(progressChannel, progressHandler);
        this.redisService.unsubscribe(notificationChannel, notificationHandler);
        this.redisService.unsubscribe(broadcastChannel, broadcastHandler);
      })
    );
  }

  async getNotifications(tenantId: string) {
    return this.redisService.getNotificationHistory(tenantId);
  }

  async sendTestNotification(tenantId: string, title?: string, message?: string) {
    const notification: UserNotificationEvent = {
      id: `notif_${Date.now()}`,
      title: title || '⚡ Notifikasi Real-Time Redis!',
      message: message || 'Pesan ini dikirim secara instan dari NestJS melalui Redis Pub/Sub ke browser.',
      category: 'SYSTEM',
      link: '/studio/artikel',
      timestamp: Date.now(),
    };
    await this.redisService.emitUserNotification(tenantId, notification);
    return { success: true, notification };
  }

  async simulateAiProgress(tenantId: string, topicTitle: string = 'Naskah Kebijakan Baru') {
    const jobId = `job_${Date.now()}`;
    const steps = [
      { percent: 15, step: 'Menganalisis Raperda & Data APBD Terkini...' },
      { percent: 40, step: 'Mengintegrasikan Aspirasi Warga & Basis Data Kebijakan...' },
      { percent: 70, step: 'Menyusun Naskah Narasi Eksekutif & Struktur Tabel...' },
      { percent: 90, step: 'Merender Grafik Visual Resolusi Tinggi (QuickChart)...' },
      { percent: 100, step: 'Selesai! Naskah Siap Didistribusikan.' },
    ];

    // Eksekusi asinkron simulasi tahapan progress ke Redis
    (async () => {
      for (const s of steps) {
        await new Promise((r) => setTimeout(r, 1200));
        await this.redisService.emitUserProgress(tenantId, {
          jobId,
          percent: s.percent,
          step: s.step,
          status: s.percent === 100 ? 'COMPLETED' : 'RUNNING',
          timestamp: Date.now(),
        });
      }

      // Kirim notifikasi naskah siap
      await this.redisService.emitUserNotification(tenantId, {
        id: `ready_${Date.now()}`,
        title: 'Naskah Kebijakan Siap!',
        message: `Penyusunan naskah "${topicTitle}" telah selesai 100% dan siap diunduh atau dipublikasikan.`,
        category: 'ARTICLE',
        link: '/studio/artikel',
        timestamp: Date.now(),
      });
    })();

    return { jobId, message: 'Proses AI telah dijadwalkan di antrean Redis.' };
  }
}
