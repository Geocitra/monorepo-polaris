'use client';

import React, { useRef } from 'react';
import { UploadCloud, RefreshCw, ShieldCheck, Lock, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { DatahubPrivacyScope } from '@polaris/shared-types';
import { AssignedTenantItem, CATEGORY_LABELS } from './types';

interface KnowledgeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  assignedTenants: AssignedTenantItem[];
  uploadTargetTenantId: string;
  setUploadTargetTenantId: (val: string) => void;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  uploadCustomTitle: string;
  setUploadCustomTitle: (val: string) => void;
  uploadCategory: string;
  setUploadCategory: (val: string) => void;
  uploadScope: string;
  setUploadScope: (val: string) => void;
  isUploading: boolean;
}

export function KnowledgeUploadModal({
  isOpen,
  onClose,
  onSubmit,
  assignedTenants,
  uploadTargetTenantId,
  setUploadTargetTenantId,
  uploadFile,
  setUploadFile,
  uploadCustomTitle,
  setUploadCustomTitle,
  uploadCategory,
  setUploadCategory,
  uploadScope,
  setUploadScope,
  isUploading,
}: KnowledgeUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unggah Dokumen Baru ke Knowledge Base Binaan"
      maxWidth="max-w-xl"
    >
      <form onSubmit={onSubmit} className="space-y-4 pt-1 pb-16">
        {/* Target Dewan Binaan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Target Anggota Dewan Binaan <span className="text-rose-500">*</span>
          </label>
          <select
            value={uploadTargetTenantId}
            onChange={(e) => setUploadTargetTenantId(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            {assignedTenants.map((t) => (
              <option key={t.tenantId} value={t.tenantId}>
                {t.fullName} ({t.partyAffiliation || 'Dewan'} - {t.customDapilName || 'Dapil'})
              </option>
            ))}
          </select>
        </div>

        {/* Pilih File */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Berkas Dokumen / Spreadsheet / Scan <span className="text-rose-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/70 dark:bg-slate-900/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.tsv,.txt,.md,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadFile(f);
                  if (!uploadCustomTitle) {
                    setUploadCustomTitle(f.name.replace(/\.[^/.]+$/, ''));
                  }
                }
              }}
            />
            <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 dark:text-indigo-400 mb-1" />
            {uploadFile ? (
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{uploadFile.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Klik untuk memilih berkas</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Mendukung PDF, DOCX, Excel/CSV, TXT, dan Foto Scan (Maks. 25 MB)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Judul Kustom */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Judul Dokumen (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Perda No. 4 Tahun 2024 tentang Pajak Daerah Kota Bandung"
            value={uploadCustomTitle}
            onChange={(e) => setUploadCustomTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Kategori Dokumen */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Dokumen</label>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="AUTO">✨ Deteksi Otomatis oleh AI (Rekomendasi)</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cakupan Hak Akses AI */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Cakupan Hak Akses AI <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${uploadScope === DatahubPrivacyScope.PARTY_CONFIDENTIAL
                ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-500 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <input
                type="radio"
                name="uploadScope"
                value={DatahubPrivacyScope.PARTY_CONFIDENTIAL}
                checked={uploadScope === DatahubPrivacyScope.PARTY_CONFIDENTIAL}
                onChange={(e) => setUploadScope(e.target.value)}
                className="mt-0.5 text-indigo-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Internal Fraksi (Satu Partai Politik) — Rekomendasi</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dapat diakses oleh AI seluruh dewan binaan Anda yang satu partai untuk sinkronisasi sikap fraksi.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${uploadScope === DatahubPrivacyScope.PRIVATE_TENANT
                ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-500 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <input
                type="radio"
                name="uploadScope"
                value={DatahubPrivacyScope.PRIVATE_TENANT}
                checked={uploadScope === DatahubPrivacyScope.PRIVATE_TENANT}
                onChange={(e) => setUploadScope(e.target.value)}
                className="mt-0.5 text-indigo-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Rahasia Pribadi (Hanya AI Dewan Ini Saja)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Terkunci mutlak untuk dewan yang bersangkutan. Anggota dewan lain tidak bisa mengakses data ini.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${uploadScope === DatahubPrivacyScope.DAPIL_SHARED
                ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-500 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <input
                type="radio"
                name="uploadScope"
                value={DatahubPrivacyScope.DAPIL_SHARED}
                checked={uploadScope === DatahubPrivacyScope.DAPIL_SHARED}
                onChange={(e) => setUploadScope(e.target.value)}
                className="mt-0.5 text-indigo-600"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Berbagi Dapil (Regulasi Publik Satu Daerah)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Perda, APBD atau data daerah yang dapat dirujuk bersama oleh dewan dari dapil yang sama.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isUploading || !uploadFile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengekstrak & Vektorisasi...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Unggah & Sinkronkan</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

