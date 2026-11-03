import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import path from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aktifkan CORS untuk seluruh request (dashboard, portal publik, multi-subdomain, dan static files)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Izinkan payload hingga 50mb untuk menangani gambar base64 & media beresolusi tinggi
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Sajikan folder uploads statis dengan CORS headers eksplisit
  const staticUploadsOptions = {
    setHeaders: (res: express.Response) => {
      res.removeHeader('Access-Control-Allow-Credentials');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  };
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), staticUploadsOptions));
  app.use('/uploads', express.static(path.resolve(process.cwd(), '../../uploads'), staticUploadsOptions));

  // Global Prefix API v1
  app.setGlobalPrefix('api/v1');

  // Strict Validation Pipe (Auto transform payload ke DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[POLARIS Core API] Server berjalan di http://localhost:${port}/api/v1`);
}

bootstrap();
