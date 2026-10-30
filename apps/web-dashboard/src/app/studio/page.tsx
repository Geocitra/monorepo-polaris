'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Rocket,
  FileText,
  BarChart3,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  ChevronRight,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export default function StudioHubPage() {
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [p, b, arts] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status'),
          ApiClient.request<any[]>('/studio/articles').catch(() => []),
        ]);
        setProfile(p);
        setBilling(b);
        setArticles(arts);
      } catch (err) {
        console.error('Failed to init Studio Hub', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftCount = articles.filter((a) => a.status !== 'PUBLISHED').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      <Sidebar subdomain={profile?.subdomain} customDomain={profile?.customDomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain} customDomain={profile?.customDomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex items-center justify-between">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Studio Konten</span>
            </Link>
          </div>

          {/* 3 KARTU ALAT UTAMA (HERO LAUNCHPAD) */}
          <section className="grid gap-6 md:grid-cols-3">
            {/* KARTU 1: PUBLIKASI ISU TERPADU */}
            <div className="rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 via-white to-white dark:via-[#0E131F] dark:to-[#0E131F] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
              <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-sm">
                Paket Lengkap
              </span>

              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Rocket className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Publikasi Isu Terpadu
                  </h3>
                  <span className="text-xs font-bold text-primary dark:text-blue-400">
                    Naskah Narasi + Visual Kreatif + Medsos
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-200 leading-relaxed">
                  Satu input gagasan atau isu daerah untuk merumuskan naskah narasi lengkap, visual pendukung (poster/infografis), dan pesan sebaran multi-kanal.
                </p>

                <ul className="text-xs text-slate-600 dark:text-slate-100 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Naskah Narasi & Kajian Mendalam</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Visual Pendukung (Poster / Infografis)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Format Sebaran WhatsApp & Instagram</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/studio/terpadu" className="block w-full">
                  <Button size="md" className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-2 shadow-sm">
                    <span>Buka Generator Terpadu</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* KARTU 2: PENYUSUNAN NASKAH & NARASI */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-teal-600 dark:bg-slate-800 border border-teal-500/30 dark:border-slate-800 text-white flex items-center justify-center shadow-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Penyusunan Naskah & Narasi
                  </h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                    Kajian Kebijakan, Rilis Pers & PDF
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-200 leading-relaxed">
                  Editor terfokus untuk merumuskan rilis pers wartawan, naskah opini, telaah kebijakan, materi pidato, maupun draf pandangan umum fraksi tanpa materi visual.
                </p>

                <ul className="text-xs text-slate-600 dark:text-slate-100 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Editor Naskah Fokus & Bebas Distraksi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Rujukan Regulasi UU & Konteks Kebijakan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Ekspor Dokumen Resmi Format PDF</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/studio/artikel" className="block w-full">
                  <Button variant="outline" size="md" className="w-full font-bold text-xs gap-2 border-slate-200 text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 cursor-pointer">
                    <span>Buka Studio Naskah</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* KARTU 3: KREATIF VISUAL & DESAIN */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Kreatif Visual & Desain
                  </h3>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                    Poster Publik, Flyer & Infografis
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-200 leading-relaxed">
                  Kanvas grafis instan untuk merancang poster advokasi aspirasi, infografis data daerah/APBD, flyer silaturahmi reses, hingga kartu ucapan publik siap siar.
                </p>

                <ul className="text-xs text-slate-600 dark:text-slate-100 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Poster Publik & Flyer Silaturahmi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Infografis Data & Kartu Statistik APBD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Unduh Gambar Resolusi Tinggi (PNG / WebP)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/studio/infografis" className="block w-full">
                  <Button variant="outline" size="md" className="w-full font-bold text-xs gap-2 border-slate-200 text-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 cursor-pointer">
                    <span>Buka Studio Visual</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION BAWAH: STATUS KONTEN & AKSES CEPAT KE KATALOG */}
          <Card className="p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                <span>Katalog & Kelola Konten Website</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {articles.length} Karya Tersimpan ({publishedCount} Tayang di Website Resmi, {draftCount} Draf)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed">
                Kelola naskah yang tayang di website portal dewan, atur publikasi, perbarui artikel lama, atau salin tautan artikel untuk konstituen.
              </p>
            </div>

            <Link href="/studio/library" className="shrink-0">
              <Button size="md" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-extrabold text-xs gap-2 shadow-sm cursor-pointer">
                <span>Kelola Konten & Website</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}
