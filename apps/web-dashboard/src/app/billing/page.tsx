'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ExpiryAlertModal } from '@/components/billing/ExpiryAlertModal';
import { PaymentSuccessModal, PaymentSuccessDetails } from '@/components/billing/PaymentSuccessModal';
import { cn, formatDateIndonesian } from '@/lib/utils';
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Zap,
  Receipt,
  Clock,
  Check,
  Crown,
  ArrowRight,
  Loader2,
  CheckCircle2,
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

const PLANS = [
  {
    id: 'MONTHLY' as const,
    name: '1 Bulan',
    durationLabel: '30 Hari',
    badge: 'Fleksibel',
    badgeClass: 'bg-slate-100 text-slate-600',
    price: 2000000,
    priceFormatted: 'Rp2.000.000',
    originalPriceFormatted: null,
    rateNote: '/ 30 hari',
    tagline: 'Cocok untuk evaluasi atau masa sidang singkat',
    savings: null,
    highlight: false,
    perks: [
      '+30 Hari Masa Aktif Langsung',
      'AI Unlimited (Naskah & Poster)',
      'Situs Publik & Kanal Aspirasi Warga',
      'Garansi Hari Tidak Hangus',
    ],
  },
  {
    id: 'SEMESTER' as const,
    name: '6 Bulan',
    durationLabel: '180 Hari',
    badge: 'Paling Populer',
    badgeClass: 'bg-blue-600 text-white shadow-xs',
    price: 10000000,
    priceFormatted: 'Rp10.000.000',
    originalPriceFormatted: 'Rp12.000.000',
    rateNote: '~Rp1,66 Jt/bln',
    tagline: 'Bayar 5 bulan untuk 6 bulan penuh (Diskon 1 Bulan Bebas Biaya)',
    savings: 'Potongan 1 Bulan (Hemat Rp2 Juta dari Rp12 Jt)',
    highlight: true,
    perks: [
      '+180 Hari Masa Aktif Penuh',
      'AI Unlimited (Naskah & Poster)',
      'Dukungan Custom Domain (.id)',
      'Prioritas Jalur Render Naskah & AI',
    ],
  },
  {
    id: 'ANNUAL' as const,
    name: '1 Tahun',
    durationLabel: '365 Hari',
    badge: 'Nilai Terbaik',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200',
    price: 20000000,
    priceFormatted: 'Rp20.000.000',
    originalPriceFormatted: 'Rp24.000.000',
    rateNote: '~Rp1,67 Jt/bln',
    tagline: 'Bayar 10 bulan untuk 12 bulan penuh (Diskon 2 Bulan Bebas Biaya)',
    savings: 'Potongan 2 Bulan (Hemat Rp4 Juta dari Rp24 Jt)',
    highlight: false,
    perks: [
      '+365 Hari Masa Aktif Penuh',
      'AI Unlimited (Naskah & Poster)',
      'Custom Domain & Arsip Digital Permanen',
      'Bantuan Teknis Prioritas 24/7',
    ],
  },
];

export default function BillingPage() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'SEMESTER' | 'ANNUAL'>('SEMESTER');
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

  async function handleCheckout(cycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL') {
    setCheckoutLoading(cycle);

    try {
      const res = await ApiClient.request<any>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ billingCycle: cycle }),
      });

      const plan = PLANS.find((p) => p.id === cycle);

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
              planName: plan?.name ? `${plan.name} (${plan.durationLabel})` : 'Paket Eksekutif',
              amountFormatted: plan?.priceFormatted || 'Rp2.000.000',
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
                  planName: plan?.name ? `${plan.name} (${plan.durationLabel})` : 'Paket Eksekutif',
                  amountFormatted: plan?.priceFormatted || 'Rp2.000.000',
                  validUntil: updated?.currentPeriodEnd ? formatDateIndonesian(updated.currentPeriodEnd) : 'Aktif',
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

  const quota = billing?.quota;
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

  const activePlanObj = PLANS.find((p) => p.id === selectedCycle) || PLANS[1];

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

          {/* 2. UNIFIED SUBSCRIPTION HUB (SATU CONTAINER BESAR YANG TENANG) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
            {/* Header Hub */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Perpanjangan Lisensi
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Pilih Durasi Masa Aktif
                </h2>
              </div>
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60 self-start sm:self-auto">
                <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                <span>Virtual Account BCA, Mandiri, BNI, BRI & QRIS</span>
              </div>
            </div>

            {/* 3 Opsi Pilihan Durasi (Interactive Selectable Tiles) */}
            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => {
                const isSelected = selectedCycle === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedCycle(plan.id)}
                    className={cn(
                      'relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none',
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/40 dark:to-slate-900 shadow-md ring-2 ring-blue-600/10 dark:ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={cn('text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full', plan.badgeClass)}>
                          {plan.badge}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                          <span>{plan.durationLabel}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {plan.priceFormatted}
                          </span>
                          {plan.originalPriceFormatted && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {plan.originalPriceFormatted}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-400">
                            {plan.rateNote}
                          </span>
                        </div>
                        {plan.savings && (
                          <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                            {plan.savings}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          {plan.tagline}
                        </p>
                      </div>

                      <ul className="text-xs space-y-2 pt-3 border-t border-slate-100 text-slate-600">
                        {plan.perks.map((perk, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                            <span className="leading-tight">{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                        {isSelected ? '● Paket Terpilih' : 'Klik untuk memilih'}
                      </span>
                      <span className={cn('text-xs font-black', isSelected ? 'text-blue-600' : 'text-slate-500')}>
                        +{plan.durationLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACTION CHECKOUT STRIP (Langsung Eksekusi Tanpa Ribet) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    Konfirmasi Transaksi:
                  </span>
                  <span className="text-xs font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {activePlanObj.name} (+{activePlanObj.durationLabel})
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {isSubActive && currentPeriodEnd
                    ? `Masa aktif akan bertambah +${activePlanObj.durationLabel} di ujung periode aktif Anda saat ini.`
                    : `Masa aktif akan langsung aktif selama ${activePlanObj.durationLabel} sejak pembayaran berhasil.`}
                </div>
                <div className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold pt-0.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Garansi Akumulasi: Sisa hari yang berjalan tidak akan hangus.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Investasi
                  </div>
                  <div className="text-2xl font-black text-white font-mono tracking-tight">
                    {activePlanObj.priceFormatted}
                  </div>
                </div>

                <Button
                  onClick={() => handleCheckout(selectedCycle)}
                  disabled={checkoutLoading !== null}
                  loading={checkoutLoading === selectedCycle}
                  className="text-white font-extrabold text-xs gap-2 py-3 px-6 rounded-xl shadow-lg cursor-pointer h-auto hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <span>Lanjut Pembayaran</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TRUST ROW (1 BARIS RINGKAS, NO ESSAY) */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                <span><strong>Akumulasi Hari:</strong> Durasi baru langsung ditambah.</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600 shrink-0" />
                <span><strong>Kwitansi LPJ:</strong> Invoice instan untuk SPJ.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Tanpa Auto-Debit:</strong> Bayar manual via VA/QRIS.</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                <span><strong>Grace Period:</strong> 3 hari toleransi transisi.</span>
              </div>
            </div>
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
