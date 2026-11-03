import { Lock, ShieldCheck, Layers } from 'lucide-react';

export interface AssignedTenantItem {
  assignmentId: string;
  canDirectPublish?: boolean;
  assignmentStatus?: string;
  tenantId: string;
  fullName: string;
  photoUrl: string | null;
  partyAffiliation: string | null;
  customDapilName?: string | null;
  legislativeLevel?: string | null;
  commissionName?: string | null;
}

export interface OperatorDocumentItem {
  refId: string;
  fileId: string;
  customTitle: string;
  privacyScope: string;
  categoryTag: string;
  dapilCode: string | null;
  partyAffiliation: string | null;
  createdAt: string;
  uploadedByTenantId: string;
  tenantName: string;
  tenantPhoto: string | null;
  tenantDapil: string | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  extractionStatus: string;
  totalPages: number;
  contentSha256: string;
  chunkCount: number;
  totalTokens: number;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalTokens: number;
  assignedTenantsCount: number;
  scopeCounts: Record<string, number>;
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  REGULASI_DAERAH: { label: 'Regulasi Daerah', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  ANGGARAN_APBD: { label: 'Anggaran & APBD', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' },
  NOTULA_SIDANG: { label: 'Notula & Risalah', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  ASPIRASI_KONSTITUEN: { label: 'Aspirasi & Reses', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30' },
  KAJIAN_AKADEMIS: { label: 'Kajian Akademis', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
  DOKUMEN_INTERNAL: { label: 'Dokumen Internal', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30' },
};

export const SCOPE_CONFIG: Record<string, { label: string; icon: typeof Lock; desc: string; badgeColor: string }> = {
  PRIVATE_TENANT: {
    label: 'Rahasia Pribadi',
    icon: Lock,
    desc: 'Hanya dapat diakses oleh AI dewan pemilik dokumen',
    badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  },
  PARTY_CONFIDENTIAL: {
    label: 'Internal Fraksi',
    icon: ShieldCheck,
    desc: 'Dapat diakses oleh seluruh anggota dewan satu fraksi partai',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  },
  DAPIL_SHARED: {
    label: 'Berbagi Dapil',
    icon: Layers,
    desc: 'Dapat diakses oleh sesama dewan dari daerah pemilihan yang sama',
    badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
  },
};

