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
  Phone,
} from 'lucide-react';

interface BoldKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function BoldKontakClient({ member, theme, subdomain }: BoldKontakClientProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const party = member?.partyAffiliation || 'Fraksi Polaris';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const commission = member?.commissionName || 'Komisi X DPR RI';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';
  const officialEmail =
    member?.email || `aspirasi@${subdomain || 'ahmadfauzi'}.polaris.id`;

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ─── SECTION 1: TWO OFFICIAL HEADQUARTERS ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>KANTOR &amp; SEKRETARIAT RESMI</span>
          </span>
          <span className="text-red-400 font-mono hidden sm:inline-block">PUSAT KOORDINASI KONSTITUEN</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: DPR RI Senayan */}
          <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 hover:border-red-600/50 transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6 group shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/5">
                  GEDUNG LEGISLATIF PUSAT
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">
                  Kantor Parlemen DPR RI
                </h3>
                <p className="text-xs text-red-400 font-mono font-bold uppercase mt-0.5">
                  Fraksi {party} • {commission}
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    Gedung Nusantara I DPR RI, Lantai 14, Ruang 1402, Jl. Jenderal Gatot Subroto No. 1, Gelora, Tanah Abang, Jakarta Pusat 10270
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Senin – Jumat: 08.30 – 17.00 WIB (Sesuai Kalender Sidang)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span>(021) 5715-400 Ext. 1402 (Sekretariat Senayan)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">Akses Pengamanan Setjen DPR RI</span>
              <a
                href="https://maps.google.com/?q=Gedung+DPR+MPR+RI+Jakarta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 hover:text-white uppercase transition-colors"
              >
                <span>PETUNJUK LOKASI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Rumah Aspirasi Dapil */}
          <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 hover:border-red-600/50 transition-all p-6 sm:p-8 flex flex-col justify-between space-y-6 group shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/5">
                  POSKO ADVOKASI DAERAH
                </span>
              </div>

              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">
                  Rumah Aspirasi Rakyat Dapil
                </h3>
                <p className="text-xs text-red-400 font-mono font-bold uppercase mt-0.5">
                  Daerah Pemilihan {dapil}
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    Jl. R.E. Martadinata No. 88, Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Senin – Sabtu: 09.00 – 17.30 WIB (Pusat Penerimaan Berkas Warga)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span>+62 812-9876-5432 (Hotline Resmi Staf Ahli Dapil)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">Terbuka Untuk Seluruh Warga</span>
              <a
                href="https://maps.google.com/?q=Bandung+Jawa+Barat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 hover:text-white uppercase transition-colors"
              >
                <span>PETUNJUK LOKASI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: 3 DIRECT CONTACT CHANNELS ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>SALURAN KOMUNIKASI LANGSUNG</span>
          </span>
          <span className="text-slate-500 font-mono">LAYANAN STAF AHLI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channel 1: WhatsApp Hotline */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-emerald-500/50 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white uppercase font-mono">Hotline Staf Ahli (WA)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Konsultasi koordinasi langsung dan respons tanggap kebutuhan konstituen.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/6281298765432?text=Halo%20Sekretariat%20Dewan,%20saya%20ingin%20berkomunikasi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 uppercase"
              >
                <span>CHAT WHATSAPP RESMI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Channel 2: Email Resmi */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white uppercase font-mono">Surel Korespondensi</h4>
              <p className="text-xs text-slate-400 mt-1">
                Pengiriman dokumen resmi kenegaraan, undangan kemitraan, dan risalah naskah.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`mailto:${officialEmail}`}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-400 hover:text-white uppercase truncate max-w-full"
              >
                <span className="truncate">{officialEmail}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Channel 3: Instagram Resmi */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-pink-500/50 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-pink-950/40 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white uppercase font-mono">Instagram Resmi</h4>
              <p className="text-xs text-slate-400 mt-1">
                Ikuti liputan kegiatan sidang harian, video reses, dan rilis pers resmi.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-pink-400 hover:text-pink-300 uppercase"
              >
                <span>@{instagramUsername}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
