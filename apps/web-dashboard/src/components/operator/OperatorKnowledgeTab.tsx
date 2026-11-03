'use client';

import React, { useState, useEffect } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { DatahubPrivacyScope } from '@polaris/shared-types';
import {
  AssignedTenantItem,
  OperatorDocumentItem,
  KnowledgeStats,
  CATEGORY_LABELS,
  SCOPE_CONFIG,
  KnowledgeHeader,
  KnowledgeStatsCards,
  KnowledgeFilterBar,
  KnowledgeDocumentTable,
  KnowledgeUploadModal,
  KnowledgeEditModal,
  KnowledgeDetachModal,
} from './knowledge';

export type { AssignedTenantItem, OperatorDocumentItem };
export { CATEGORY_LABELS, SCOPE_CONFIG };

interface OperatorKnowledgeTabProps {
  assignedTenants: AssignedTenantItem[];
  selectedTenant: AssignedTenantItem | null;
  onSelectTenant: (tenant: AssignedTenantItem | null) => void;
}

export function OperatorKnowledgeTab({
  assignedTenants,
  selectedTenant,
  onSelectTenant,
}: OperatorKnowledgeTabProps) {
  const { toast } = useToast();

  const [documents, setDocuments] = useState<OperatorDocumentItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({
    totalDocuments: 0,
    totalTokens: 0,
    assignedTenantsCount: 0,
    scopeCounts: { PRIVATE_TENANT: 0, PARTY_CONFIDENTIAL: 0, DAPIL_SHARED: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState<string>(selectedTenant ? selectedTenant.tenantId : 'ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');

  // Modal Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTargetTenantId, setUploadTargetTenantId] = useState<string>(
    selectedTenant ? selectedTenant.tenantId : assignedTenants[0]?.tenantId || ''
  );
  const [uploadCustomTitle, setUploadCustomTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('AUTO');
  const [uploadScope, setUploadScope] = useState<string>(DatahubPrivacyScope.PARTY_CONFIDENTIAL);
  const [isUploading, setIsUploading] = useState(false);

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<OperatorDocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('DOKUMEN_INTERNAL');
  const [editScope, setEditScope] = useState<string>(DatahubPrivacyScope.PRIVATE_TENANT);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Detach State
  const [isDetachModalOpen, setIsDetachModalOpen] = useState(false);
  const [detachingRef, setDetachingRef] = useState<OperatorDocumentItem | null>(null);
  const [isDetaching, setIsDetaching] = useState(false);

  useEffect(() => {
    if (selectedTenant) {
      setTenantFilter(selectedTenant.tenantId);
      setUploadTargetTenantId(selectedTenant.tenantId);
    } else if (assignedTenants && assignedTenants.length > 0) {
      if (!uploadTargetTenantId || !assignedTenants.some((t) => t.tenantId === uploadTargetTenantId)) {
        setUploadTargetTenantId(assignedTenants[0].tenantId);
      }
    }
  }, [selectedTenant, assignedTenants]);

  function openUploadModal() {
    if (selectedTenant) {
      setUploadTargetTenantId(selectedTenant.tenantId);
    } else if (tenantFilter !== 'ALL') {
      setUploadTargetTenantId(tenantFilter);
    } else if (assignedTenants.length > 0) {
      if (!uploadTargetTenantId || !assignedTenants.some((t) => t.tenantId === uploadTargetTenantId)) {
        setUploadTargetTenantId(assignedTenants[0].tenantId);
      }
    }
    setUploadFile(null);
    setUploadCustomTitle('');
    setUploadCategory('AUTO');
    setUploadScope(DatahubPrivacyScope.PARTY_CONFIDENTIAL);
    setIsUploadModalOpen(true);
  }

  useEffect(() => {
    loadData();
  }, [tenantFilter, categoryFilter, scopeFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const statsRes = await AdminApiClient.request<any>('/operator/datahub/stats');
      if (statsRes) {
        setStats(statsRes);
      }

      const params = new URLSearchParams();
      if (tenantFilter !== 'ALL') params.append('tenantId', tenantFilter);
      if (categoryFilter !== 'ALL') params.append('categoryTag', categoryFilter);
      if (scopeFilter !== 'ALL') params.append('privacyScope', scopeFilter);
      if (search.trim()) params.append('search', search.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const docsRes = await AdminApiClient.request<OperatorDocumentItem[]>(
        `/operator/datahub/documents${queryStr}`
      );
      setDocuments(docsRes || []);
    } catch (err: any) {
      console.error('Gagal memuat dokumen operator:', err);
      toast({
        type: 'error',
        title: 'Gagal Memuat Dokumen',
        description: err.message || 'Terjadi kendala saat memuat berkas pengetahuan.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      toast({ type: 'error', title: 'Berkas Kosong', description: 'Pilih berkas yang akan diunggah.' });
      return;
    }
    if (!uploadTargetTenantId) {
      toast({ type: 'error', title: 'Pilih Tokoh Dewan', description: 'Wajib memilih tokoh dewan pemilik dokumen.' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tenantId', uploadTargetTenantId);
      if (uploadCustomTitle.trim()) {
        formData.append('customTitle', uploadCustomTitle.trim());
      }
      if (uploadCategory !== 'AUTO') {
        formData.append('categoryTag', uploadCategory);
      }
      formData.append('privacyScope', uploadScope);

      await AdminApiClient.uploadFormData('/operator/datahub/upload', formData);

      toast({
        type: 'success',
        title: 'Dokumen Berhasil Diserap',
        description: 'Berkas telah diproses, diklasifikasikan, dan disinkronkan ke Knowledge AI.',
      });

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadCustomTitle('');
      setUploadCategory('AUTO');
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Unggah Gagal',
        description: err.message || 'Gagal memproses unggah dokumen.',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function openEditModal(doc: OperatorDocumentItem) {
    setEditingRef(doc);
    setEditTitle(doc.customTitle || doc.originalFileName);
    setEditCategory(doc.categoryTag);
    setEditScope(doc.privacyScope);
    setIsEditModalOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRef) return;

    setIsUpdating(true);
    try {
      await AdminApiClient.request(`/operator/datahub/references/${editingRef.refId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          customTitle: editTitle.trim(),
          categoryTag: editCategory,
          privacyScope: editScope,
        }),
      });

      toast({
        type: 'success',
        title: 'Klasifikasi Diperbarui',
        description: 'Judul, kategori, dan cakupan privasi berhasil disesuaikan.',
      });

      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperbarui',
        description: err.message || 'Terjadi kesalahan saat menyimpan perubahan.',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  function openDetachModal(doc: OperatorDocumentItem) {
    setDetachingRef(doc);
    setIsDetachModalOpen(true);
  }

  async function handleDetachConfirm() {
    if (!detachingRef) return;

    setIsDetaching(true);
    try {
      await AdminApiClient.request(`/operator/datahub/references/${detachingRef.refId}`, {
        method: 'DELETE',
      });

      toast({
        type: 'success',
        title: 'Kaitan Dicabut',
        description: 'Dokumen berhasil dilepas dari Knowledge AI tokoh binaan Anda.',
      });

      setIsDetachModalOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mencabut Kaitan',
        description: err.message || 'Terjadi kendala saat melepas dokumen.',
      });
    } finally {
      setIsDetaching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTION */}
      <KnowledgeHeader
        loading={loading}
        onRefresh={loadData}
        onOpenUpload={openUploadModal}
      />

      {/* 2. STATS SUMMARY CARDS */}
      <KnowledgeStatsCards stats={stats} />

      {/* 3. FILTER & SEARCH CONTROLS */}
      <KnowledgeFilterBar
        search={search}
        setSearch={setSearch}
        onSearchSubmit={handleSearchSubmit}
        tenantFilter={tenantFilter}
        setTenantFilter={setTenantFilter}
        assignedTenants={assignedTenants}
        onSelectTenant={onSelectTenant}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        scopeFilter={scopeFilter}
        setScopeFilter={setScopeFilter}
      />

      {/* 4. DOCUMENT LIST TABLE */}
      <KnowledgeDocumentTable
        documents={documents}
        loading={loading}
        onOpenUpload={openUploadModal}
        onOpenEdit={openEditModal}
        onOpenDetach={openDetachModal}
      />

      {/* 5. MODAL UNGGAH DOKUMEN BARU */}
      <KnowledgeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        assignedTenants={assignedTenants}
        uploadTargetTenantId={uploadTargetTenantId}
        setUploadTargetTenantId={setUploadTargetTenantId}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploadCustomTitle={uploadCustomTitle}
        setUploadCustomTitle={setUploadCustomTitle}
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        uploadScope={uploadScope}
        setUploadScope={setUploadScope}
        isUploading={isUploading}
      />

      {/* 6. MODAL EDIT KLASIFIKASI */}
      <KnowledgeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editScope={editScope}
        setEditScope={setEditScope}
        isUpdating={isUpdating}
      />

      {/* 7. MODAL DETACH / CABUT KAITAN */}
      <KnowledgeDetachModal
        isOpen={isDetachModalOpen}
        onClose={() => setIsDetachModalOpen(false)}
        onConfirm={handleDetachConfirm}
        detachingRef={detachingRef}
        isDetaching={isDetaching}
      />
    </div>
  );
}
