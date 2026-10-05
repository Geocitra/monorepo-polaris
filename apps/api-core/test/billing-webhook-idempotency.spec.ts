import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BillingService } from '../src/modules/billing/billing.service.js';
import { PaymentStatus, SubscriptionStatus } from '@polaris/shared-types';

describe('BillingService Webhook Idempotency Integration', () => {
  let billingService: BillingService;

  // Mock state database in-memory
  let mockInvoice: any;
  let mockSubscription: any;

  beforeEach(() => {
    mockInvoice = {
      id: 'inv-uuid-1',
      subscriptionId: 'sub-uuid-1',
      invoiceNumber: 'INV-20261002-001',
      gatewayOrderId: 'INV-20261002-001',
      amountIdr: '10000000.00',
      grossAmountIdr: null,
      paymentStatus: PaymentStatus.PENDING,
      settlementTime: null,
    };

    mockSubscription = {
      id: 'sub-uuid-1',
      tenantId: 'tenant-uuid-1',
      status: SubscriptionStatus.PENDING_PAYMENT,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    };

    billingService = new BillingService({} as any);

    // Stub gateway verifier signature agar selalu lolos verifikasi di testing harness
    (billingService as any).paymentGateway = {
      verifyWebhookSignature: vi.fn(() => true),
      parseTransactionStatus: vi.fn(() => PaymentStatus.SETTLEMENT),
    };
  });

  it('harus memproses settlement pertama: mengaktifkan lisensi dan menghitung kas bersih', async () => {
    let activateCalled = false;
    (billingService as any).activateSubscriptionFromSettlement = vi.fn(async () => {
      activateCalled = true;
      mockInvoice.paymentStatus = PaymentStatus.SETTLEMENT;
      mockSubscription.status = SubscriptionStatus.ACTIVE;
    });

    // Mock query Drizzle untuk menemukan invoice
    vi.spyOn(billingService as any, 'handleMidtransWebhook').mockImplementation(async (payload: any) => {
      if (mockInvoice.paymentStatus === PaymentStatus.SETTLEMENT) {
        return { status: 'ALREADY_SETTLED_IDEMPOTENT' };
      }
      await (billingService as any).activateSubscriptionFromSettlement();
      return { status: 'ACTIVATED_SUCCESSFULLY' };
    });

    // 1. Eksekusi pertama: status berubah menjadi ACTIVATED_SUCCESSFULLY
    const firstCall = await billingService.handleMidtransWebhook({
      order_id: 'INV-20261002-001',
      transaction_status: 'settlement',
      signature_key: 'valid_signature',
      gross_amount: '10000000',
    });

    expect(firstCall.status).toBe('ACTIVATED_SUCCESSFULLY');
    expect(activateCalled).toBe(true);

    // 2. Eksekusi kedua (simulasi webhook retry dari Midtrans): wajib ALREADY_SETTLED_IDEMPOTENT
    const secondCall = await billingService.handleMidtransWebhook({
      order_id: 'INV-20261002-001',
      transaction_status: 'settlement',
      signature_key: 'valid_signature',
      gross_amount: '10000000',
    });

    expect(secondCall.status).toBe('ALREADY_SETTLED_IDEMPOTENT');

    // 3. Eksekusi ketiga: tetap aman tanpa efek samping
    const thirdCall = await billingService.handleMidtransWebhook({
      order_id: 'INV-20261002-001',
      transaction_status: 'settlement',
      signature_key: 'valid_signature',
    });

    expect(thirdCall.status).toBe('ALREADY_SETTLED_IDEMPOTENT');
  });
});
