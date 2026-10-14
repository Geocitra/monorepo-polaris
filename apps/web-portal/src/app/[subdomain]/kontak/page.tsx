import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/api';
import { Building2, Mail, MessageCircle, MapPin, ArrowLeft, Instagram, ExternalLink, Clock, ShieldCheck } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Kontak Resmi - POLARIS' };

  return {
    title: `Kontak Resmi & Sekretariat - ${data.member.fullName}`,
    description: `Alamat kantor perwakilan dewan, kontak staf ahli, dan media sosial resmi ${data.member.fullName}.`,
  };
}

export default async function KontakPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) notFound();

  const { member } = data;
  const party = member.partyAffiliation || 'Golkar';
  const dapil = member.dapilName || member.customDapil || 'Jawa Barat I';

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
            <Building2 className="w-3.5 h-3.5" />
            <span>Kanal Korespondensi & Komunikasi Dewan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kontak & Sekretariat Resmi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Informasi alamat kantor perwakilan, layanan staf ahli, serta kanal media sosial terverifikasi {member.fullName}.
          </p>
        </div>
      </div>

      {/* INFORMASI KANTOR & KANAL KOMUNIKASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KARTU 1: KANTOR PERWAKILAN FRAKSI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black">
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sekretariat Fraksi {party}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gedung Dewan Perwakilan Rakyat
            </p>
          </div>
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Wilayah Penugasan: Dapil {dapil}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Senin – Jumat: 08.30 – 16.30 WIB</span>
            </p>
          </div>
        </div>

        {/* KARTU 2: WHATSAPP STAF AHLI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              WhatsApp Layanan Staf Ahli
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Komunikasi permohonan dialog & konfirmasi agenda dewan.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <a
              href="https://wa.me/?text=Halo%20Sekretariat%20Dewan,%20saya%20ingin%20mengajukan%20komunikasi%20terkait%20kebijakan."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <span>Hubungi via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* KARTU 3: MEDIA SOSIAL RESMI */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-700 flex items-center justify-center font-black">
            <Instagram className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Media Sosial Resmi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dokumentasi kegiatan lapangan dan warta aktual.
            </p>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <a
              href={`https://instagram.com/${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-slate-700 hover:text-pink-600 font-semibold transition"
            >
              <span>Instagram: @{subdomain}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href={`https://threads.net/@${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-slate-700 hover:text-slate-900 font-semibold transition"
            >
              <span>Threads: @{subdomain}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* INFORMASI KEBIJAKAN PRIVASI & INTEGRITAS */}
      <section className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-4 text-xs text-amber-900">
        <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0" />
        <p className="leading-relaxed">
          Seluruh komunikasi yang masuk ke sekretariat {member.fullName} ditangani langsung oleh tim staf ahli dewan dengan komitmen integritas, kerahasiaan identitas masyarakat sipil, dan keterbukaan informasi publik.
        </p>
      </section>
    </div>
  );
}
