import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Izinkan payload hingga 50mb untuk menangani gambar base64 & media beresolusi tinggi
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Aktifkan CORS untuk dashboard dan portal publik
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
