'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Database,
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HardDrive,
  EyeOff,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { DatahubCategory, DatahubPrivacyScope } from '@polaris/shared-types';

export default function DatahubPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<{
    totalDocuments: number;
    totalTokensLearned: number;
    lastIngestedAt: string | null;
  }>({
    totalDocuments: 0,
    totalTokensLearned: 0,
    lastIngestedAt: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState<DatahubCategory>(
    DatahubCategory.REGULASI_DAERAH
  );
  const [privacyScope, setPrivacyScope] = useState<DatahubPrivacyScope>(
    DatahubPrivacyScope.PRIVATE_TENANT
  );

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const [uploadSuccessResult, setUploadSuccessResult] = useState<any | null>(null);

  useEffect(() => {
    loadProfileAndMetrics();
  }, []);

  async function loadProfileAndMetrics() {
    try {
      const prof = await ApiClient.request<any>('/identity/profile');
      setProfile(prof);

      const met = await ApiClient.request<any>('/datahub/metrics');
      if (met) {
        setMetrics({
          totalDocuments: Number(met.totalDocuments || 0),
          totalTokensLearned: Number(met.totalTokensLearned || 0),
          lastIngestedAt: met.lastIngestedAt,
        });
      }
    } catch (err) {
      console.error('Gagal memuat profil atau metrik DataHub:', err);
    }
  }

  function handleFileSelect(file: File) {
    // Validasi ekstensi
    const validExts = ['.pdf', '.docx', '.doc', '.txt', '.md', '.csv', '.png', '.jpg', '.jpeg', '.webp'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExts.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      toast({
        type: 'error',
        title: 'Format Berkas Tidak Didukung',
        description: 'Harap pilih berkas PDF, DOCX, TXT, Markdown, atau Gambar Scan (PNG/JPG).',
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'Ukuran Terlalu Besar',
        description: 'Ukuran berkas maksimal adalah 25 MB per dokumen.',
      });
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleStartUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStep(1); // Menghitung Fingerprint Digital
    setUploadSuccessResult(null);

    // Simulasi tahapan visual untuk micro-animation yang informatif
    const stepTimer1 = setTimeout(() => setUploadStep(2), 700);  // Cek Deduplikasi Master
    const stepTimer2 = setTimeout(() => setUploadStep(3), 1600); // Ekstraksi Multimodal
    const stepTimer3 = setTimeout(() => setUploadStep(4), 2800); // Vektorisasi pgvector

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (customTitle.trim()) {
        formData.append('customTitle', customTitle.trim());
      }
      formData.append('categoryTag', categoryTag);
      formData.append('privacyScope', privacyScope);

      const response = await ApiClient.uploadFormData<any>('/datahub/upload', formData);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setUploadStep(5); // Selesai

      setUploadSuccessResult(response);
      toast({
        type: 'success',
        title: 'Asimilasi Berhasil',
        description: response.message || 'Dokumen berhasil diserap ke dalam AI Knowledge Base.',
      });

      // Reload metrik terbaru
      await loadProfileAndMetrics();
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setUploadStep(0);
      toast({
        type: 'error',
        title: 'Gagal Memproses Dokumen',
        description: err.message || 'Terjadi kendala saat membaca atau memproses berkas.',
      });
    } finally {
      setUploading(false);
    }
  }

  function resetDropzone() {
    setSelectedFile(null);
    setCustomTitle('');
    setUploadStep(0);
    setUploadSuccessResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      <Sidebar subdomain={profile?.subdomainSlug} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
          {/* Header Title & Tenant Badges */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-xs font-semibold mb-3">
                <Database className="w-3.5 h-3.5" />
                DataHub Civic Intelligence Engine
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                Knowledge Ingestion Box
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
                Unggah dokumen regulasi, APBD, notula rapat, dan kajian internal. Berkas langsung
                diekstrak ke dalam basis memori AI Polaris untuk analisis kebijakan dan pembuatan draf artikel secara terisolasi.
              </p>
            </div>

            {/* Tenant Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {profile?.partyAffiliation || 'Partai Independen'}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {profile?.customDapilName || profile?.electoralDistrictId || 'Dapil Nasional'}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                RLS pgvector Terisolasi
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Dokumen Master Terindeks</span>
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {metrics.totalDocuments}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">berkas</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Deduplikasi aktif menghemat kapasitas penyimpanan server lokal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Token Diserap AI</span>
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-white mt-2">
                {metrics.totalTokensLearned.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">vektor token</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Diproses dengan Sliding-Window Overlap untuk menjaga pasal & tabel tetap utuh.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Penyimpanan & Keamanan</span>
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Storage & Zero Cloud
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Data disimpan di storage lokal server dengan proteksi privasi tingkat partai.
              </p>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-slate-900/60 border border-cyan-200/70 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
            <EyeOff className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-200">
                Prinsip Kerahasiaan One-Way Blind Ingestion
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Untuk menjamin keamanan politik dan mencegah kebocoran strategi antar akun, antarmuka ini
                bekerja secara searah (*Drop & Forget*). Berkas yang telah diunggah langsung diserap menjadi
                vektor pengetahuan AI dan tidak dipajang sebagai daftar unduhan publik.
              </p>
            </div>
          </div>

          {/* Main Dropzone Section */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xs space-y-6">
            {!uploadSuccessResult ? (
              <>
                {/* Form Metadata Input */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      Judul / Label Dokumen
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Draf APBD Perubahan 2026"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      disabled={uploading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Kategori Dokumen
                    </label>
                    <select
                      value={categoryTag}
                      onChange={(e) => setCategoryTag(e.target.value as DatahubCategory)}
                      disabled={uploading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-all [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-800 dark:[&>option]:text-slate-200"
                    >
                      <option value={DatahubCategory.REGULASI_DAERAH}>Regulasi Daerah (Perda / Perbup)</option>
                      <option value={DatahubCategory.ANGGARAN_APBD}>Anggaran & Keuangan (APBD / DPA)</option>
                      <option value={DatahubCategory.NOTULA_SIDANG}>Notula / Risalah Rapat Komisi</option>
                      <option value={DatahubCategory.KAJIAN_AKADEMIS}>Kajian Akademis / Naskah RUU</option>
                      <option value={DatahubCategory.ASPIRASI_KONSTITUEN}>Rekap Isu & Aspirasi Konstituen</option>
                      <option value={DatahubCategory.DOKUMEN_INTERNAL}>Dokumen & Pidato Internal</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Cakupan Hak Akses AI
                    </label>
                    <select
                      value={privacyScope}
                      onChange={(e) => setPrivacyScope(e.target.value as DatahubPrivacyScope)}
                      disabled={uploading}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-all [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-800 dark:[&>option]:text-slate-200"
                    >
                      <option value={DatahubPrivacyScope.PRIVATE_TENANT}>
                        🔒 Rahasia Pribadi (Hanya AI Saya)
                      </option>
                      <option value={DatahubPrivacyScope.PARTY_CONFIDENTIAL}>
                        🛡️ Internal Fraksi (Rekan Satu Partai)
                      </option>
                      <option value={DatahubPrivacyScope.DAPIL_SHARED}>
                        🏛️ Berbagi Dapil (Regulasi Publik Dapil)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                      : selectedFile
                      ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/10'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950/80'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md,.csv,.png,.jpg,.jpeg,.webp"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap diproses
                        </p>
                      </div>
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
                        Klik untuk mengganti berkas lain
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                          Tarik dan letakkan berkas di sini, atau{' '}
                          <span className="text-cyan-600 dark:text-cyan-400 underline decoration-cyan-500/40">pilih dari komputer</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Mendukung PDF, DOCX, TXT, Markdown, dan Gambar Scan (PNG/JPG) hingga 25 MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Stepper Progress (When Uploading) */}
                {uploading && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Sedang mengasimilasikan dokumen ke AI...
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">Langkah {uploadStep} dari 5</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
                      <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                          uploadStep >= 1
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        1. Fingerprint SHA-256
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                          uploadStep >= 2
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        2. Cek Deduplikasi
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                          uploadStep >= 3
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        3. Ekstraksi Multimodal
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                          uploadStep >= 4
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        4. Sliding Chunking
                      </div>
                      <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                          uploadStep >= 5
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        5. Vektorisasi pgvector
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {selectedFile && !uploading && (
                    <Button
                      variant="ghost"
                      onClick={resetDropzone}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    >
                      Batal
                    </Button>
                  )}
                  <Button
                    onClick={handleStartUpload}
                    disabled={!selectedFile || uploading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-950/20 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memproses Dokumen...
                      </>
                    ) : (
                      <>
                        Asimilasikan ke AI
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* Success Idempotent View */
              <div className="py-8 px-6 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Dokumen Berhasil Diasimilasi ke AI!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {uploadSuccessResult.message ||
                      'Dokumen Anda kini telah resmi menjadi bagian dari otak kecerdasan Polaris.'}
                  </p>
                </div>

                <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 text-left text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                    <span className="text-slate-500">Judul Referensi:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{customTitle || selectedFile?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                    <span className="text-slate-500">Kategori:</span>
                    <span className="font-medium text-cyan-600 dark:text-cyan-400">{categoryTag}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-900">
                    <span className="text-slate-500">Hak Akses AI:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">{privacyScope}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Status Deduplikasi:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {uploadSuccessResult.isDuplicate
                        ? 'Tersinkronisasi Instan (Hash Identik Terdeteksi)'
                        : 'Berkas Baru (Vektorisasi pgvector Sukses)'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={resetDropzone}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Unggah Dokumen Lainnya
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
