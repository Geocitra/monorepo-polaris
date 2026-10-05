'use client';

import React, { useEffect, useState } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import { AiObservabilityKpis } from '@/components/superadmin/ai/AiObservabilityKpis';
import { MasterTokenPoolCard } from '@/components/superadmin/ai/MasterTokenPoolCard';
import { AiModelMetricsCards } from '@/components/superadmin/ai/AiModelMetricsCards';
import { AiTenantQuotaTable } from '@/components/superadmin/ai/AiTenantQuotaTable';
import { AiTracesLogTable } from '@/components/superadmin/ai/AiTracesLogTable';

export default function SuperadminAiMonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [obsRes, traceRes] = await Promise.all([
        AdminApiClient.request<any>('/admin/ai/observability'),
        AdminApiClient.request<any[]>('/admin/ai/traces?limit=15'),
      ]);

      setData(obsRes);
      setTraces(traceRes);
    } catch (err) {
      console.error('Failed to load AI observability data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Observabilitas AI, Token & Langfuse Tracing
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Audit konsumsi token OpenAI GPT-4o, alokasi deposit master platform, sisa kuota saldo, dan telemetri inferensi realtime.
        </p>
      </div>

      {/* 2. MASTER TOKEN VAULT & SISA KUOTA CARD */}
      <MasterTokenPoolCard
        pool={data?.masterPool}
        onRefresh={loadAll}
      />

      {/* 3. KPIS & LANGFUSE STATUS */}
      <AiObservabilityKpis
        summary={data?.summary}
        langfuse={data?.langfuse}
      />

      {/* 3. MODEL METRICS BREAKDOWN */}
      <AiModelMetricsCards metrics={data?.modelMetrics} />

      {/* 4. PER-TENANT QUOTA TABLE */}
      <AiTenantQuotaTable tenants={data?.tenantBreakdowns} />

      {/* 5. LIVE TRACES LOG TABLE */}
      <AiTracesLogTable
        traces={traces}
        loading={loading}
        onRefresh={loadAll}
      />
    </div>
  );
}
