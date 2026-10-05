import { Controller, Get, Post, Sse, Req, Body, Query, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service.js';

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  /**
   * Aliran Server-Sent Events (SSE) berotentikasi pengguna
   * URL: GET /api/v1/realtime/stream
   */
  @Sse('stream')
  streamEvents(@Req() req: any): Observable<MessageEvent> {
    const tenantId = req.user.tenantId;
    return this.realtimeService.createStreamForUser(tenantId);
  }

  /**
   * Ambil daftar notifikasi tersimpan dari Redis
   * URL: GET /api/v1/realtime/notifications
   */
  @Get('notifications')
  async getNotifications(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const items = await this.realtimeService.getNotifications(tenantId);
    return { success: true, data: items };
  }

  /**
   * Endpoint pemicu uji coba notifikasi instan
   * URL: POST /api/v1/realtime/test-notify
   */
  @Post('test-notify')
  async triggerTestNotification(@Req() req: any, @Body() body: { title?: string; message?: string }) {
    const tenantId = req.user.tenantId;
    return this.realtimeService.sendTestNotification(tenantId, body.title, body.message);
  }

  /**
   * Endpoint simulasi AI job progress (Redis BullMQ mock/simulation)
   * URL: POST /api/v1/realtime/simulate-job
   */
  @Post('simulate-job')
  async simulateJob(@Req() req: any, @Body() body: { topic?: string }) {
    const tenantId = req.user.tenantId;
    return this.realtimeService.simulateAiProgress(tenantId, body.topic);
  }
}
