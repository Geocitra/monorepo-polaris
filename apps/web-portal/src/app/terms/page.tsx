import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Ketentuan Layanan | POLARIS Platform',
  description: 'Ketentuan Layanan dan Penggunaan Platform POLARIS.',
};

export default function TermsPage() {
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
            <span className="text-blue-600 font-bold">Ketentuan Layanan</span>
          </div>

          <div className="space-y-4 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <span>Ketentuan Penggunaan Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Ketentuan Layanan (Terms of Service)
            </h1>
            <p className="text-slate-500 text-sm">Terakhir diperbarui: 27 Oktober 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mendaftar, mengakses, atau menggunakan layanan POLARIS Platform, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan Layanan ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">2. Tanggung Jawab Konten</h2>
              <p>
                Pengguna bertanggung jawab penuh atas segala materi, opini, naskah advokasi, infografis, dan poster yang diterbitkan melalui platform ini. POLARIS menyediakan sistem otomatisasi dan editorial cerdas, namun persetujuan akhir publikasi berada di bawah kendali pengguna.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">3. Integrasi Media Sosial Pihak Ketiga</h2>
              <p>
                Layanan kami memungkinkan integrasi dengan penyedia pihak ketiga seperti Meta (Instagram dan Threads). Pengguna wajib mematuhi ketentuan dan pedoman komunitas masing-masing platform media sosial yang digunakan.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">4. Pembatasan Penggunaan</h2>
              <p>Pengguna dilarang menggunakan POLARIS untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menyebarkan hoaks, ujaran kebencian, pencemaran nama baik, atau pelanggaran hukum Republik Indonesia.</li>
                <li>Melakukan spamming atau tindakan yang melanggar batasan kuota API pihak ketiga (Meta Platform Policies).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">5. Kontak</h2>
              <p>
                Pertanyaan seputar ketentuan ini dapat disampaikan ke: <span className="font-bold text-blue-600">legal@polarismedia.id</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
