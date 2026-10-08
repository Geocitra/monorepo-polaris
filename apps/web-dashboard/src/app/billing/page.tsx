'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { ExpiryAlertModal } from '@/components/billing/ExpiryAlertModal';
import { PaymentSuccessModal, PaymentSuccessDetails } from '@/components/billing/PaymentSuccessModal';
import { PricingPlanGrid } from '@/components/billing/PricingPlanGrid';
import { formatDateIndonesian } from '@/lib/utils';
import {
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}



export default function BillingPage() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'SEMESTER' | 'ANNUAL'>('SEMESTER');
  const [selectedTier, setSelectedTier] = useState<string>('PRO');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Modal Sukses Eksekutif
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState<PaymentSuccessDetails | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const p = await ApiClient.request<any>('/auth/me');
        const b = await ApiClient.request<any>('/billing/status');
        setProfile(p);
        setBilling(b);

        if (b?.planTier) {
          setSelectedTier(b.planTier === 'STARTER' ? 'STARTER' : 'PRO');
        }

        if (b?.availablePlans && b.availablePlans.length > 0) {
          const defaultPlan = b.availablePlans.find((plan: any) => plan.highlight) || b.availablePlans[0];
          setSelectedCycle(defaultPlan.id as any);
        }

        // Deteksi jika user dialihkan kembali dari Midtrans redirect URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const orderId = urlParams.get('order_id');
          const statusCode = urlParams.get('status_code');
          const transStatus = urlParams.get('transaction_status');

          if (orderId && (statusCode === '200' || transStatus === 'settlement' || transStatus === 'capture')) {
            try {
              const synced = await ApiClient.request<any>(`/billing/sync/${orderId}`, { method: 'POST' });
              setBilling(synced);
              setSuccessDetails({
                invoiceNumber: orderId,
                planName: 'Paket Parlemen Eksekutif',
                amountFormatted: 'Lunas Terverifikasi',
                validUntil: synced?.currentPeriodEnd ? formatDateIndonesian(synced.currentPeriodEnd) : 'Aktif',
              });
              setSuccessModalOpen(true);
            } catch {}
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleCheckout(cycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL', tier: string, matrixId?: string) {
    const targetTier = tier || selectedTier || 'PRO';
    const loadingKey = `${targetTier}_${cycle}`;
    setCheckoutLoading(loadingKey);

    try {
      const res = await ApiClient.request<any>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          billingCycle: cycle,
          planTier: targetTier,
          matrixId: matrixId || undefined,
        }),
      });

      const tierOfferings = billing?.tierOfferings || [];
      const offering = tierOfferings.find((t: any) => t.tier === targetTier);
      const cycleInfo = offering?.pricing?.[cycle];

      if (window.snap && res.snapToken) {
        window.snap.pay(res.snapToken, {
          onSuccess: async () => {
            let updatedBilling: any = null;
            try {
              updatedBilling = await ApiClient.request<any>(`/billing/sync/${res.invoiceNumber}`, { method: 'POST' });
              setBilling(updatedBilling);
            } catch {
              updatedBilling = await ApiClient.request<any>('/billing/status');
              setBilling(updatedBilling);
            }

            // Tampilkan Layar Sukses Eksekutif Kustom dengan hitungan mundur
            setSuccessDetails({
              invoiceNumber: res.invoiceNumber,
              planName: offering?.name ? `${offering.name} (${cycle})` : 'Paket Parlemen Eksekutif',
              amountFormatted: cycleInfo?.priceFormatted || 'Terbayar',
              validUntil: updatedBilling?.currentPeriodEnd ? formatDateIndonesian(updatedBilling.currentPeriodEnd) : 'Aktif',
            });
            setSuccessModalOpen(true);
          },
          onPending: async () => {
            toast({
              type: 'warning',
              title: 'Menunggu Pembayaran',
              description: 'Silakan selesaikan pembayaran sesuai petunjuk transaksi Snap.',
            });
            const updated = await ApiClient.request<any>('/billing/status');
            setBilling(updated);
          },
          onError: () => {
            toast({
              type: 'error',
              title: 'Pembayaran Gagal',
              description: 'Terjadi kendala pada transaksi. Silakan coba kembali.',
            });
          },
          onClose: async () => {
            try {
              const updated = await ApiClient.request<any>(`/billing/sync/${res.invoiceNumber}`, { method: 'POST' });
              setBilling(updated);
              if (updated?.subscriptionStatus === 'ACTIVE') {
                setSuccessDetails({
                  invoiceNumber: res.invoiceNumber,
                  planName: offering?.name ? `${offering.name} (${cycle})` : 'Paket Parlemen Eksekutif',
                  amountFormatted: cycleInfo?.priceFormatted || 'Terbayar',
                  validUntil: updated?.currentPeriodEnd ? formatDateIndonesian(updated?.currentPeriodEnd) : 'Aktif',
                });
                setSuccessModalOpen(true);
              }
            } catch {
              const updated = await ApiClient.request<any>('/billing/status');
              setBilling(updated);
            }
          },
        });
      } else if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memproses Transaksi',
        description: err.message || 'Terjadi gangguan saat menghubungi payment gateway.',
      });
    } finally {
      setCheckoutLoading(null);
    }
  }

  const isSubActive = billing?.subscriptionStatus === 'ACTIVE';
  const currentPeriodEnd = billing?.currentPeriodEnd;

  let daysLeft: number | null = null;
  if (currentPeriodEnd && isSubActive) {
    const endMs = new Date(currentPeriodEnd).getTime();
    const nowMs = Date.now();
    daysLeft = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
  }

  const snapScriptUrl = billing?.gatewayConfig?.snapScriptUrl ||
    (process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js');

  const clientKey = billing?.gatewayConfig?.clientKey ||
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
    'SB-Mid-client-placeholder';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Script
        src={snapScriptUrl}
        data-client-key={clientKey}
        strategy="lazyOnload"
      />

      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 transition-all duration-300">
          {/* 1. STATUS BAR MINIMALIS (BUKAN CARD BERLAPIS) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                    {profile?.fullName || 'Anggota Dewan'}
                  </h1>
                  {profile?.partyAffiliation ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Fraksi {profile.partyAffiliation}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Dewan / Lembaga Publik
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                  <span>Ruang Kerja Parlemen POLARIS</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    AI Unlimited
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6 self-start sm:self-auto">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Status Masa Aktif
                </div>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  {isSubActive && daysLeft !== null ? (
                    <span className="text-emerald-700 font-black flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif ({daysLeft} Hari Lagi)
                    </span>
                  ) : (
                    <span className="text-amber-600 font-black flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Perlu Aktivasi
                    </span>
                  )}
                </div>
                {isSubActive && currentPeriodEnd && (
                  <div className="text-[11px] text-slate-400 font-medium">
                    Berlaku s.d. {formatDateIndonesian(currentPeriodEnd)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. UNIFIED SUBSCRIPTION HUB (3D TENSOR PRICING GRID) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <PricingPlanGrid
              selectedCycle={selectedCycle}
              onCycleChange={setSelectedCycle}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              tierOfferings={billing?.tierOfferings}
              onCheckout={handleCheckout}
              checkoutLoading={checkoutLoading}
              isSubActive={isSubActive}
              currentTier={billing?.planTier}
              currentPeriodEnd={currentPeriodEnd}
            />
          </div>

          {/* POP-UP PENGINGAT H-1 (HANYA MUNCUL DI HARI KRITIS) */}
          <ExpiryAlertModal
            currentPeriodEnd={currentPeriodEnd}
            isSubActive={isSubActive}
          />

          {/* MODAL SUKSES PEMBAYARAN EKSEKUTIF DENGAN HITUNGAN MUNDUR */}
          <PaymentSuccessModal
            isOpen={successModalOpen}
            onClose={() => setSuccessModalOpen(false)}
            details={successDetails}
            targetRedirectUrl="/studio/artikel"
          />
        </main>
      </div>
    </div>
  );
}
