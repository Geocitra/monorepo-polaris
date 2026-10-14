import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/api';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { ShieldCheck, MapPin, Building2, BookOpen, BarChart3, ArrowRight, Award, Compass, HeartHandshake } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Profil Anggota Dewan - POLARIS' };

  return {
    title: `Profil & Rekam Jejak - ${data.member.fullName}`,
    description: `Biografi resmi, daerah pemilihan, dan visi pengabdian kenegaraan ${data.member.fullName}.`,
  };
}

export default async function DewanProfilePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) notFound();

  const { member, theme } = data;
  const photoUrl = theme.officialPhotoUrl || '/images/avatar-dewan-budi.jpg';
  const party = member.partyAffiliation || 'Golkar';
  const dapil = member.dapilName || member.customDapil || 'Jawa Barat I';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* HEADER HERO PROFIL */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ebf3f9] via-slate-50 to-white border border-slate-200 p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {/* Foto Resmi Berwibawa */}
          <div className="relative shrink-0">
            <div className="h-64 w-52 sm:h-80 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={member.fullName}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Identitas & Tagline Kenegaraan */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-bold border border-amber-500/20">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Pejabat Publik Terverifikasi • Fraksi {party}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {member.fullName}
              </h1>
              <p className="text-sm sm:text-base font-bold text-amber-800 flex items-center justify-center md:justify-start gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Daerah Pemilihan {dapil} ({member.provinceName || 'Indonesia'})
                </span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl pt-2">
              {theme.bioBiography ||
                'Mendedikasikan amanah rakyat untuk memperjuangkan keadilan sosial, akselerasi ekonomi daerah, dan transparansi legislasi kenegaraan demi kemaslahatan seluruh lapisan masyarakat.'}
            </p>

            {/* Quick Action Navigation */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                href="/artikel"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Katalog Artikel Kebijakan</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link
                href="/infografis"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Lihat Infografis Kinerja</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TIGA PILAR KOMITMEN PENGABDIAN */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Pilar Fokus Pengabdian
          </h2>
          <span className="w-8 h-0.5 bg-slate-400 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black">
              <Compass className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Legislasikan Solusi Nyata
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengawal perancangan peraturan daerah dan regulasi perundang-undangan yang berpihak pada kemudahan berusaha, perlindungan UMKM, dan kepastian hukum masyarakat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Pengawasan Anggaran Transparan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memastikan setiap rupiah anggaran belanja daerah terserap tepat sasaran untuk infrastruktur jalan, fasilitas kesehatan prima, dan sarana pendidikan di wilayah pemilihan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Pendampingan Konstituen Berkelanjutan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Menjaga tali silaturahmi yang kokoh dengan masyarakat akar rumput, tokoh komunitas, dan pemuda melalui dialog berkala dan kehadiran langsung di tengah warga.
            </p>
          </div>
        </div>
      </section>

      {/* KATALOG FOTO PRIBADI & DOKUMENTASI DEWAN */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <PortalPhotoGallery photos={member.photoGallery} memberName={member.fullName} />
      )}
    </div>
  );
}
