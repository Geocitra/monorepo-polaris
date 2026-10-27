import Link from 'next/link';
import { ArrowLeft, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Petunjuk Penghapusan Data Pengguna | POLARIS Platform',
  description: 'Panduan lengkap penghapusan data dan pemutusan akun Meta (Instagram & Threads) di POLARIS.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-bold">Penghapusan Data</span>
          </div>

          <div className="space-y-4 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
              <Trash2 className="h-4 w-4" />
              <span>Kepatuhan Meta Platform & UU PDP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Petunjuk Penghapusan Data Pengguna (User Data Deletion)
            </h1>
            <p className="text-slate-500 text-sm">
              Sesuai dengan ketentuan Meta Platform Policy dan UU PDP No. 27/2022, pengguna berhak menghapus data mereka secara mandiri kapan saja.
            </p>
          </div>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Cara 1: Pemutusan Langsung Melalui Dashboard POLARIS (Instan)
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                <li>Buka Dashboard POLARIS di <a href="https://app.polarismedia.id" className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer">app.polarismedia.id</a> dan masuk ke akun Anda.</li>
                <li>Navigasi ke menu <strong>Pengaturan Profil</strong> &gt; <strong>Akun Media Sosial Terhubung</strong>.</li>
                <li>Pada kartu akun Instagram atau Threads yang ingin Anda hapus, klik tombol <strong>Putuskan Akun (Disconnect)</strong>.</li>
                <li>Sistem kami akan segera menghapus seluruh token akses terenkripsi dan metadata akun sosial Anda dari basis data secara permanen.</li>
              </ol>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Cara 2: Mencabut Akses Melalui Pengaturan Akun Instagram / Meta
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                <li>Buka aplikasi Instagram atau buka situs <a href="https://www.instagram.com" className="text-blue-600 underline" target="_blank" rel="noreferrer">instagram.com</a>.</li>
                <li>Buka menu <strong>Settings (Pengaturan)</strong> &gt; <strong>Website Permissions (Izin Situs Web)</strong> &gt; <strong>Apps and Websites (Aplikasi dan Situs Web)</strong>.</li>
                <li>Pada tab <strong>Active (Aktif)</strong>, cari aplikasi <strong>POLARIS</strong>.</li>
                <li>Klik tombol <strong>Remove (Hapus)</strong>. Sesi OAuth akan langsung dibatalkan oleh Meta.</li>
              </ol>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Cara 3: Permohonan Penghapusan Akun & Data Lengkap Melalui Email
              </h2>
              <p className="text-slate-600">
                Jika Anda ingin seluruh data histori, dokumen unggahan, dan akun POLARIS Anda dihapus secara menyeluruh dari server kami:
              </p>
              <p className="text-slate-600">
                Kirimkan email ke <span className="font-bold text-blue-600">support@polarismedia.id</span> dengan subjek <em>&quot;Permohonan Penghapusan Data Pengguna - [Email Anda]&quot;</em>. Tim teknis kami akan memproses penghapusan seluruh data dalam waktu maksimal 3x24 jam kerja dan mengirimkan konfirmasi tertulis kepada Anda.
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
