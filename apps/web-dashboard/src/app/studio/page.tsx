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
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
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
            {/* KARTU 1: KAMPANYE ISU TERPADU */}
            <div className="rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 via-white to-white dark:via-slate-900 dark:to-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
              <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-sm">
                Paket Lengkap
              </span>

              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Rocket className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Kampanye Isu Terpadu
                  </h3>
                  <span className="text-xs font-bold text-primary">
                    Website Resmi + Sebaran Medsos
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Cukup masukkan 1 isu daerah. Mesin otomatis menyusun naskah kajian website 3.000 kata, poster DALL-E, dan teks sebaran WA/IG yang membawa link ke web Anda.
                </p>

                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Naskah Artikel 3.000 Kata</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Poster Visual DALL-E 3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Format WhatsApp & Instagram</span>
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

            {/* KARTU 2: TULIS ARTIKEL SAJA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <FileText className="h-6 w-6 text-teal-400" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Tulis Artikel Saja
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Dokumen Naskah & Cetak PDF
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Editor teks untuk menyusun rilis pers wartawan, draf pandangan umum fraksi, atau opini kebijakan tanpa perlu repot memikirkan poster dan medsos.
                </p>

                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Editor Naskah Bebas Distraksi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Kutipan Pasal Regulasi UU & Perda</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Ekspor Dokumen Resmi Format PDF</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link href="/studio/artikel" className="block w-full">
                  <Button variant="outline" size="md" className="w-full border-slate-300 font-bold text-xs gap-2 text-slate-700 hover:text-slate-900">
                    <span>Buka Editor Naskah</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* KARTU 3: DESAIN INFOGRAFIS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Desain Infografis Saja
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Flyer Visual & Feed Instagram
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Canvas grafis instan untuk membuat poster ucapan hari besar, flyer jadwal silaturahmi reses, atau kartu data statistik APBD satu slide siap unduh.
                </p>

                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Template Visual Khas Parlemen</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Kartu Statistik Data Daerah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unduh Gambar PNG Resolusi Tinggi</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link href="/studio/infografis" className="block w-full">
                  <Button variant="outline" size="md" className="w-full border-slate-300 font-bold text-xs gap-2 text-slate-700 hover:text-slate-900">
                    <span>Buka Studio Grafis</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION BAWAH: STATUS KONTEN & AKSES CEPAT KE KATALOG */}
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                <span>Katalog & Kelola Konten Website</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {articles.length} Karya Tersimpan ({publishedCount} Tayang di Website Resmi, {draftCount} Draf)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Kelola naskah yang tayang di website portal dewan, atur publikasi, perbarui artikel lama, atau salin tautan artikel untuk konstituen.
              </p>
            </div>

            <Link href="/studio/library" className="shrink-0">
              <Button size="md" className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs gap-2 shadow-sm">
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
