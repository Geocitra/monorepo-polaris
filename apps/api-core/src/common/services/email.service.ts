import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP Mailer initialized using ${host}:${port} (${user})`);
    } else {
      this.logger.warn('SMTP credentials not fully configured. Emails will be logged to console.');
    }
  }

  async sendOtpEmail(to: string, otpCode: string, recipientName: string = 'Yang Terhormat Anggota Dewan') {
    const from = process.env.SMTP_FROM || 'POLARIS Platform <smtpgeocitra@gmail.com>';
    const subject = `Kode Masuk POLARIS Parlemen: ${otpCode}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f172a; padding: 28px; text-align: center; }
        .logo-badge { display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #2563eb; color: #ffffff; font-weight: 900; font-size: 20px; border-radius: 12px; margin-bottom: 12px; }
        .brand-title { color: #ffffff; font-size: 18px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .brand-subtitle { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
        .content { padding: 32px; color: #334155; }
        .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace; }
        .expiry-note { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600; }
        .security-alert { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; font-size: 11px; color: #92400e; margin-top: 20px; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">P</div>
          <h1 class="brand-title">POLARIS PLATFORM</h1>
          <div class="brand-subtitle">Executive Legislative OS & Intelligence</div>
        </div>
        <div class="content">
          <div class="greeting">Salam Hormat, ${recipientName}</div>
          <p class="text">
            Sistem mendeteksi permintaan masuk ke Ruang Kerja Eksekutif POLARIS. Gunakan kode otorisasi 6-digit berikut untuk melanjutkan sesi aman Anda:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry-note">⏱️ Berlaku selama 5 menit. Jangan bagikan kepada siapa pun.</div>
          </div>
          <div class="security-alert">
            <strong>Peringatan Keamanan Parlemen:</strong> Jika Anda atau staf ahli Anda tidak merasa meminta kode ini, mohon abaikan email ini. Akun Anda tetap aman terlindungi enkripsi.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} POLARIS Legislative Intelligence OS. Protokol Keamanan Tingkat Tinggi.
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`[EmailOTP] Kode OTP berhasil dikirim ke ${to} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
      } else {
        this.logger.warn(`[EmailOTP-DEV] Transporter tidak aktif. Kode OTP untuk ${to}: [ ${otpCode} ]`);
        return { success: true, devMode: true };
      }
    } catch (err: any) {
      this.logger.error(`[EmailOTP-Error] Gagal mengirim email ke ${to}: ${err.message}`);
      this.logger.warn(`[EmailOTP-FALLBACK] Kode OTP darurat untuk ${to}: [ ${otpCode} ]`);
      throw new Error(`Gagal mengirimkan email verifikasi: ${err.message}`);
    }
  }

  async sendSystemAlertEmail(to: string, subject: string, alertDetails: { title: string; message: string; remainingUsd: number; percentRemaining: number }) {
    const from = process.env.SMTP_FROM || 'POLARIS Security & Ops <smtpgeocitra@gmail.com>';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head><meta charset="UTF-8"><style>
      body { font-family: -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
      .box { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: #991b1b; padding: 24px; text-align: center; color: #ffffff; }
      .content { padding: 28px; color: #334155; }
      .kpi-badge { background: #fef2f2; border: 2px dashed #f87171; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
      .usd-val { font-size: 32px; font-weight: 900; color: #991b1b; font-family: monospace; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; margin-top: 16px; }
    </style></head>
    <body>
      <div class="box">
        <div class="header">
          <h2 style="margin:0;">⚠️ PERINGATAN SALDO DEPOSIT AI KRITIS</h2>
          <p style="margin:4px 0 0; font-size:12px; opacity:0.85;">POLARIS Central Control Operations</p>
        </div>
        <div class="content">
          <p><strong>Yth. Tim Administrator &amp; Finance POLARIS,</strong></p>
          <p>${alertDetails.message}</p>
          <div class="kpi-badge">
            <div style="font-size:11px; text-transform:uppercase; font-weight:bold; color:#7f1d1d;">Sisa Saldo Deposit Aktif</div>
            <div class="usd-val">$${alertDetails.remainingUsd.toFixed(2)} USD</div>
            <div style="font-size:12px; font-weight:bold; color:#b91c1c;">Tersisa ${alertDetails.percentRemaining}% dari Modal Master</div>
          </div>
          <p style="font-size:12px; color:#64748b;">
            Mohon segera melakukan isi ulang deposit kredit di dashboard OpenAI dan mencatat transaksi di Konsol Superadmin untuk mencegah pemutusan layanan otomatis (*Circuit-Breaker Trip*).
          </p>
          <center>
            <a href="https://app.polaris.id/superadmin/ai-monitoring" class="btn">Buka Konsol AI Monitoring &amp; Top Up</a>
          </center>
        </div>
      </div>
    </body></html>`;

    try {
      if (this.transporter) {
        await this.transporter.sendMail({ from, to, subject, html: htmlContent });
        this.logger.log(`[AlertEmail] Notifikasi saldo darurat terkirim ke ${to}`);
      } else {
        this.logger.warn(`[AlertEmail-Dev] Transporter tidak aktif. Alert terkirim ke log: ${subject}`);
      }
    } catch (err: any) {
      this.logger.error(`[AlertEmail-Error] Gagal mengirim email alert: ${err.message}`);
    }
  }
}

