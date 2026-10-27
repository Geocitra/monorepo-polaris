import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata = {
  title: 'Kebijakan Privasi | POLARIS Platform',
  description: 'Kebijakan Privasi dan Perlindungan Data Pribadi Platform POLARIS.',
};

export default function PrivacyPolicyPage() {
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
            <span className="text-blue-600 font-bold">Kebijakan Privasi</span>
          </div>

          <div className="space-y-4 border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>UU PDP No. 27/2022 & Standar Keamanan Data</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Kebijakan Privasi & Perlindungan Data
            </h1>
            <p className="text-slate-500 text-sm">Terakhir diperbarui: 27 Oktober 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">1. Pengantar</h2>
              <p>
                POLARIS Platform (&quot;kami&quot;, &quot;Platform&quot;) berkomitmen untuk melindungi privasi dan data pribadi pengguna kami sesuai dengan Undang-Undang Perlindungan Data Pribadi Republik Indonesia (UU PDP No. 27/2022) serta standar internasional perlindungan informasi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">2. Data yang Kami Kumpulkan</h2>
              <p>
                Ketika Anda menggunakan POLARIS dan menghubungkan akun media sosial (seperti Instagram dan Threads melalui Meta Graph API), kami hanya mengakses data yang Anda izinkan secara eksplisit:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Informasi profil dasar: Nama pengguna (username), ID akun media sosial, nama tampilan, dan foto profil.</li>
                <li>Token Akses (OAuth Access Token): Disimpan secara terenkripsi menggunakan algoritma AES-256-GCM dengan kunci HKDF spesifik per-tenant.</li>
                <li>Konten publikasi: Teks, poster, dan materi diseminasi publik yang Anda instruksikan untuk diterbitkan.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">3. Penggunaan Informasi</h2>
              <p>Kami menggunakan data yang dikumpulkan semata-mata untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Memfasilitasi publikasi otomatis materi advokasi dan telaah kebijakan ke akun media sosial yang telah Anda tautkan.</li>
                <li>Menampilkan status analitik dan performa penerbitan konten di dashboard Anda.</li>
                <li>Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga mana pun untuk tujuan periklanan atau komersial.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">4. Penghapusan dan Retensi Data</h2>
              <p>
                Anda memiliki hak penuh untuk mencabut izin akses kapan saja melalui pengaturan profil di dashboard kami atau melalui pengaturan aplikasi Meta (Instagram/Threads). Untuk informasi petunjuk penghapusan data secara mandiri, silakan kunjungi halaman <Link href="/data-deletion" className="text-blue-600 font-bold underline">Petunjuk Penghapusan Data</Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">5. Kontak Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi tim kepatuhan data kami melalui email: <span className="font-bold text-blue-600">privacy@polarismedia.id</span>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
