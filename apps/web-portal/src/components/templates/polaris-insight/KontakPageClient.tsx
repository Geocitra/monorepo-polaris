'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  ExternalLink,
  Mail,
  Sparkles,
} from 'lucide-react';

interface KontakPageClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function KontakPageClient({ member, theme, subdomain }: KontakPageClientProps) {
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';
  const officialEmail =
    member?.email || `sekretariat@${subdomain || 'ahmadfauzi'}.polaris.id`;

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* SECTION 1: DUA KANTOR & SEKRETARIAT UTAMA (SENAYAN & DAPIL)*/}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Kantor &amp; Sekretariat Resmi
            </h2>
            <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
            Pusat Pelayanan &amp; Korespondensi
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* KARTU 1: Kantor Parlemen DPR RI (Senayan) */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#96702c]/70 hover:shadow-lg transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#96702c] border border-amber-200/70 flex items-center justify-center font-black shadow-xs">
                  <Building2 className="w-6 h-6 text-[#96702c]" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Kantor Parlemen Senayan</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Sekretariat Fraksi {party} DPR RI
                </h3>
                <p className="text-xs font-bold text-[#96702c] mt-0.5">
                  Gedung Nusantara I DPR RI, Lantai 14
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jl. Jend. Gatot Subroto No. 1, Senayan, Jakarta Pusat 10270. Kantor resmi penelaahan legislasi nasional, surat permohonan dinas, koordinasi komisi, dan audiensi tingkat kementerian.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-amber-200/60 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-[#96702c]" />
                  <span>Waktu Layanan Resepsi &amp; Administrasi:</span>
                </div>
                <div className="pl-6 space-y-0.5 text-[11px] text-slate-500">
                  <div>Senin – Kamis: 08.30 – 16.30 WIB</div>
                  <div>Jumat: 08.30 – 17.00 WIB (Istirahat Shalat Jumat 11.30 – 13.00)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Kompleks Parlemen Republik Indonesia
              </span>
              <a
                href="https://maps.google.com/?q=Gedung+DPR+MPR+RI+Senayan+Jakarta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Petunjuk Lokasi Google Maps</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
            </div>
          </div>

          {/* KARTU 2: Rumah Aspirasi Daerah Pemilihan */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#96702c]/70 hover:shadow-lg transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#96702c] border border-amber-200/70 flex items-center justify-center font-black shadow-xs">
                  <MapPin className="w-6 h-6 text-[#96702c]" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#96702c] border border-amber-200/80 text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3 text-[#96702c]" />
                  <span>Posko Warga Dapil</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Rumah Aspirasi Rakyat {dapil}
                </h3>
                <p className="text-xs font-bold text-[#96702c] mt-0.5">
                  Pusat Layanan Warga &amp; Advokasi Daerah
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Posko induk advokasi masyarakat di Daerah Pemilihan {dapil}. Tempat pertemuan tatap muka konstituen, pendataan bantuan sosial, dialog terbuka pengurus komunitas, dan ruang temu reses anggota dewan.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-amber-200/60 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-[#96702c]" />
                  <span>Waktu Layanan Posko Daerah:</span>
                </div>
                <div className="pl-6 space-y-0.5 text-[11px] text-slate-500">
                  <div>Senin – Sabtu: 09.00 – 17.00 WIB</div>
                  <div>Terbuka untuk perwakilan warga, tokoh masyarakat, dan pemuda</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Daerah Pemilihan {dapil}
              </span>
              <a
                href="https://wa.me/?text=Halo%20Sekretariat%20Rumah%20Aspirasi,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20warga."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold transition shadow-xs"
              >
                <span>Hubungi Posko Dapil</span>
                <MessageCircle className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: TIGA SALURAN KOMUNIKASI LANGSUNG               */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Saluran Komunikasi Langsung
            </h2>
            <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
            Layanan Cepat Tanggap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KANAL 1: WhatsApp Hotline Staf Ahli */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-black">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Respons Cepat</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  WhatsApp Hotline Staf Ahli
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Layanan Koordinasi &amp; Konfirmasi Audiensi
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Saluran komunikasi cepat bersama tim staf ahli untuk konfirmasi agenda dewan, koordinasi kegiatan reses, dan pertanyaan langsung.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href="https://wa.me/?text=Halo%20Sekretariat%20Dewan,%20saya%20ingin%20berkomunikasi%20terkait%20agenda%20dan%20informasi%20resmi."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          {/* KANAL 2: Surat Elektronik (Email Resmi) */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#96702c]/60 hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#96702c] border border-amber-200/70 flex items-center justify-center font-black">
                  <Mail className="w-6 h-6 text-[#96702c]" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <span>Dokumen PDF</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Surat Elektronik &amp; Administrasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Korespondensi Dokumen Resmi
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pengiriman berkas proposal kegiatan, undangan resmi, dokumen hasil kajian akademis, dan risalah permohonan narasumber.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={`mailto:${officialEmail}?subject=Permohonan%20Resmi%20-%20${encodeURIComponent(officialFullName)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="truncate">{officialEmail}</span>
              </a>
            </div>
          </div>

          {/* KANAL 3: Saluran Publikasi Media Sosial */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-pink-500/60 hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-700 border border-pink-200/70 flex items-center justify-center font-black">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/60">
                  <span>Kanal Terverifikasi</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Saluran Publikasi Resmi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dokumentasi Lapangan &amp; Rilis Pers
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pantau kegiatan sidang komisi, liputan kunjungan kerja lapangan, serta sikap kebijakan resmi {officialFullName} secara berkala.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold transition shadow-xs"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{instagramUsername}</span>
              </a>
              <a
                href={`https://threads.net/@${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition border border-slate-200"
                title="Threads"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
