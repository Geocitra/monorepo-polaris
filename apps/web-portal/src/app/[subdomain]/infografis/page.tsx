import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/api';
import { MetricsInfographicDock } from '@/components/sections/MetricsInfographicDock';
import { BarChart3, ArrowLeft, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Infografis Kinerja - POLARIS' };

  return {
    title: `Infografis Kinerja & Data Akuntabilitas - ${data.member.fullName}`,
    description: `Visualisasi capaian legislasi, alokasi anggaran daerah, dan dampak konkret pembangunan untuk rakyat dari ${data.member.fullName}.`,
  };
}

export default async function InfografisIndexPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) notFound();

  const { member, theme } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* HEADER & BREADCRUMB */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Transparansi & Akuntabilitas Publik</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Infografis Capaian Kinerja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Ikhtisar berbasis data mengenai pengawasan anggaran, produktivitas peraturan daerah, dan realisasi program nyata bagi masyarakat di daerah pemilihan {member.dapilName || member.customDapil || 'Jawa Barat I'}.
          </p>
        </div>
      </div>

      {/* 4 DOCK KARTU INFOGRAFIS UTAMA */}
      <MetricsInfographicDock
        member={member}
        theme={theme}
      />

      {/* CATATAN AKUNTABILITAS & METODOLOGI DATA */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Integritas & Validitas Data Kenegaraan</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Prinsip Transparansi Kinerja Dewan
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Seluruh angka dan indikator capaian yang disajikan dalam portal ini bersumber dari laporan resmi pelaksanaan tugas kedewanan, risalah pembahasan Badan Anggaran (Banggar), dan dokumentasi lapangan tim staf ahli perwakilan daerah.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sinkronisasi Risalah Parlemen</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verifikasi LKPJ Pemerintah Daerah</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Audit Partisipasi Konstituen</span>
          </div>
        </div>
      </section>
    </div>
  );
}
