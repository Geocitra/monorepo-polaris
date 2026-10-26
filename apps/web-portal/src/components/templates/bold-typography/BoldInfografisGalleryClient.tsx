'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  ArrowRight,
  X,
  Calendar,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Maximize2,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface InfographicItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
  dataPoints?: { label: string; value: string }[];
}

interface BoldInfografisGalleryClientProps {
  initialInfographics: any[];
  member: any;
  theme?: any;
}

export function BoldInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: BoldInfografisGalleryClientProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(null);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Default rich mock infographics matching Bold Red Typography
  const defaultInfographics: InfographicItem[] = [
    {
      id: 'info-1',
      title: 'Alokasi & Penyerapan Dana Aspirasi Infrastruktur Jalan',
      category: 'Infrastruktur',
      date: '12 Okt 2026',
      summary:
        'Pemetaan alokasi anggaran Rp 48,5 Miliar untuk peningkatan kualitas jalan penghubung antardesa dan jembatan logistik di 16 kecamatan.',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      dataPoints: [
        { label: 'Total Anggaran Diadvokasi', value: 'Rp 48,5 Miliar' },
        { label: 'Realisasi Panjang Jalan', value: '42,8 KM' },
        { label: 'Kecamatan Penerima Manfaat', value: '16 Kecamatan' },
      ],
    },
    {
      id: 'info-2',
      title: 'Distribusi Bantuan Alsintan & Pupuk Subsidi Petani Lokal',
      category: 'Pertanian',
      date: '28 Sep 2026',
      summary:
        'Distribusi 120 unit traktor tangan, 45 pompa air irigasi, dan 1.800 ton pupuk bersubsidi langsung ke 34 kelompok tani binaan.',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      dataPoints: [
        { label: 'Kelompok Tani Binaan', value: '34 Poktan' },
        { label: 'Total Alsintan Tersalurkan', value: '165 Unit' },
        { label: 'Pupuk Subsidi Terdistribusi', value: '1.800 Ton' },
      ],
    },
    {
      id: 'info-3',
      title: 'Capaian Legislasi & Advokasi 5 RUU Prioritas Parlemen',
      category: 'Legislasi',
      date: '15 Sep 2026',
      summary:
        'Pengawalan pasal-pasal kunci dalam RUU Perlindungan Pekerja, RUU Ketahanan Pangan, dan revisi UU Pendidikan Tinggi selama masa sidang 2025/2026.',
      imageUrl: '/images/showcase-artikel-legislasi.jpg',
      dataPoints: [
        { label: 'RUU Terkawal Ketat', value: '5 RUU' },
        { label: 'Draf Naskah Akademik Disahkan', value: '12 Risalah' },
        { label: 'Tingkat Kehadiran Sidang Paripurna', value: '100%' },
      ],
    },
    {
      id: 'info-4',
      title: 'Realisasi Beasiswa PIP & KIP Kuliah untuk Anak Petani & Buruh',
      category: 'Pendidikan',
      date: '02 Sep 2026',
      summary:
        'Penyaluran beasiswa pendidikan bagi 3.420 siswa SD-SMA dan 450 mahasiswa perguruan tinggi negeri dari keluarga prasejahtera di Dapil.',
      imageUrl: '/images/showcase-infografis-pendidikan.jpg',
      dataPoints: [
        { label: 'Penerima KIP Kuliah PTN', value: '450 Mahasiswa' },
        { label: 'Penerima PIP SD-SMA', value: '3.420 Siswa' },
        { label: 'Total Alokasi Beasiswa', value: 'Rp 14,2 Miliar' },
      ],
    },
    {
      id: 'info-5',
      title: 'Pemberdayaan UMKM & Pelatihan Sertifikasi Halal Gratis',
      category: 'Ekonomi',
      date: '18 Agu 2026',
      summary:
        'Fasilitasi modal usaha bergulir dan penerbitan 500 sertifikasi halal gratis untuk pelaku usaha rumahan dan kuliner tradisional.',
      imageUrl: '/images/showcase-infografis-umkm.jpg',
      dataPoints: [
        { label: 'UMKM Terbina', value: '500 Usaha' },
        { label: 'Sertifikasi Halal Diterbitkan', value: '100% Gratis' },
        { label: 'Akses Permodalan KUR Disalurkan', value: 'Rp 8,5 Miliar' },
      ],
    },
    {
      id: 'info-6',
      title: 'Pemeriksaan Kesehatan Gratis & Penanganan Stunting Terpadu',
      category: 'Kesehatan',
      date: '04 Agu 2026',
      summary:
        'Penyelenggaraan bakti sosial keliling di 24 titik puskesmas pembantu serta pembagian paket nutrisi balita dan ibu hamil.',
      imageUrl: '/images/showcase-infografis-kesehatan.jpg',
      dataPoints: [
        { label: 'Warga Penerima Layanan', value: '4.850 Warga' },
        { label: 'Paket Gizi Tersalurkan', value: '2.400 Paket' },
        { label: 'Titik Posko Bergerak', value: '24 Titik' },
      ],
    },
  ];

  // Merge initial with defaults
  const allInfographics: InfographicItem[] =
    initialInfographics.length > 0
      ? initialInfographics.map((item, idx) => ({
          id: item.id || `infographic-${idx}`,
          title: item.title,
          category: item.category || 'Transparansi',
          date: item.publishedAt ? formatDateIndonesian(item.publishedAt) : '10 Oktober 2026',
          summary: item.excerpt || item.caption || item.description || 'Infografis akuntabilitas kinerja perwakilan rakyat.',
          imageUrl: item.featuredImageUrl || item.posterUrl || item.imageUrl || '/images/showcase-infografis-apbd.jpg',
          dataPoints: item.dataPoints || [
            { label: 'Status Pengawasan', value: 'Selesai Terealisasi' },
            { label: 'Konstituen Terdampak', value: 'Ribuan Warga' },
          ],
        }))
      : defaultInfographics;

  const categories = ['Semua', 'Infrastruktur', 'Pertanian', 'Legislasi', 'Pendidikan', 'Ekonomi', 'Kesehatan'];

  const filtered = allInfographics.filter((item) => {
    const matchCategory = activeFilter === 'Semua' || item.category.toLowerCase() === activeFilter.toLowerCase();
    const matchSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* ─── TOOLBAR: SEARCH & CATEGORY FILTER ─── */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-red-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari infografis kinerja, anggaran, proyek jalan, atau data bansos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>TERSEDIA:</span>
            <span className="font-bold text-red-500">{filtered.length} INFOGRAFIS AKUNTABILITAS</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline-block">
            KATEGORI:
          </div>
          {categories.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── INFOGRAPHICS GRID (HIGH CONTRAST POSTER CARDS) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filtered.map((item, idx) => {
          const num = String(idx + 1).padStart(2, '0');
          return (
            <div
              key={item.id}
              onClick={() => setSelectedInfographic(item)}
              className="group rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-red-600/60 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg"
            >
              {/* Poster Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-md">
                    {item.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-mono flex items-center justify-between">
                  <span className="text-red-400 font-bold">{num}</span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
              </div>

              {/* Text & Data Points */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-bebas text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition-colors uppercase leading-[0.95] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                    {item.summary}
                  </p>
                </div>

                {/* Key Metrics Chips */}
                {item.dataPoints && item.dataPoints.length > 0 && (
                  <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                    {item.dataPoints.slice(0, 2).map((dp, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                        <div className="text-[10px] font-mono text-slate-500 uppercase truncate">
                          {dp.label}
                        </div>
                        <div className="text-xs font-bold text-red-400 truncate font-mono">
                          {dp.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">KLIK UNTUK MEMPERBESAR</span>
                  <span className="text-red-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    DETAIL →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── INTERACTIVE LIGHTBOX MODAL ─── */}
      {selectedInfographic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/15 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedInfographic(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/80 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/20"
              aria-label="Tutup pratinjau"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image View */}
            <div className="lg:col-span-7 bg-black flex items-center justify-center p-4 sm:p-6 relative overflow-auto max-h-[50vh] lg:max-h-none flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Right Information Sidebar */}
            <div className="w-full lg:w-[380px] p-6 sm:p-8 bg-[#0D0D0D] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between overflow-y-auto max-h-[42vh] lg:max-h-none">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold uppercase">
                    {selectedInfographic.category}
                  </span>
                  <span className="text-slate-400">{selectedInfographic.date}</span>
                </div>

                <h2 className="font-bebas text-2xl sm:text-4xl font-black text-white uppercase leading-tight tracking-tight">
                  {selectedInfographic.title}
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedInfographic.summary}
                </p>

                {/* Data Points Breakdown */}
                {selectedInfographic.dataPoints && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider">
                      ANGKA &amp; INDIKATOR KUNCI:
                    </div>
                    {selectedInfographic.dataPoints.map((dp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-400">{dp.label}</span>
                        <span className="text-white font-bold">{dp.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
                  Sumber: Sekretariat Komisi DPR RI &amp; Rumah Aspirasi {dapil}.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-2.5">
                <a
                  href={selectedInfographic.imageUrl}
                  download={`${selectedInfographic.title}.jpg`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>UNDUH GAMBAR RESOLUSI PENUH</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Infografis Kinerja Parlemen: ${selectedInfographic.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-wider transition-all"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>BAGIKAN KE WHATSAPP</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
