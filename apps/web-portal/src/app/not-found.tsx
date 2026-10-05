import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-blue-600">404 Error</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-4 max-w-md text-sm text-slate-600">
        Maaf, halaman publikasi atau tautan yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
