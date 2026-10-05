import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { RlsContextInterceptor } from './common/interceptors/rls-context.interceptor.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { CmsModule } from './modules/cms/cms.module.js';
import { StudioModule } from './modules/studio/studio.module.js';
import { ConstituentModule } from './modules/constituent/constituent.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';
import { SuperadminModule } from './modules/superadmin/superadmin.module.js';
import { PublicChatModule } from './modules/public-chat/public-chat.module.js';

import { RedisModule } from './modules/redis/redis.module.js';
import { RealtimeModule } from './modules/realtime/realtime.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'polaris-secret-super-secure-key-2026',
      signOptions: { expiresIn: '7d' },
    }),
    RedisModule,       // Enterprise In-Memory Pub/Sub & Cache Engine
    RealtimeModule,    // Real-Time SSE Streams & Live Notifications
    IdentityModule,    // 4.2: Auth & Workspace
    BillingModule,     // 4.3: Midtrans Payment & Kuota
    CmsModule,         // 4.4: Personal Website & Theme
    StudioModule,      // 4.5: Studio AI & Content Generator
    ConstituentModule, // 4.6: Layanan Konstituen & Enkripsi UU PDP
    CommentsModule,    // 4.7: Komentar Publik Warga (Google OAuth) & Moderasi Dewan
    SuperadminModule,  // Superadmin Control Tower & Master Data Governance
    PublicChatModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsContextInterceptor,
    },
  ],
})
export class AppModule { }
