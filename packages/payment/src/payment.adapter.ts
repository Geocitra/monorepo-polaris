import { IPaymentGatewayPort, CreateTransactionParams } from '@polaris/core-domain';
import { PaymentStatus } from '@polaris/shared-types';
import { snapClient, coreApiClient } from './midtrans.client.js';
import { MidtransSignatureVerifier } from './signature.verifier.js';

export class MidtransPaymentAdapter implements IPaymentGatewayPort {
  /**
   * createInvoice membuat sesi pembayaran baru di Midtrans Snap
   */
  public async createInvoice(
    params: CreateTransactionParams
  ): Promise<{ snapToken: string; redirectUrl: string }> {
    const parameter = {
      transaction_details: {
        order_id: params.invoiceNumber,
        gross_amount: Math.round(params.amountIdr),
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
      },
      item_details: [
        {
          id: 'SUBSCRIPTION_PRO',
          price: Math.round(params.amountIdr),
          quantity: 1,
          name: 'Paket Langganan POLARIS Pro (1 Bulan)',
        },
      ],
      usage_limit: 1, // Snap token hanya bisa dipakai 1 kali
    };

    try {
      const transaction = await snapClient.createTransaction(parameter);
      return {
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error: any) {
      throw new Error(`[MidtransGatewayError] Gagal membuat invoice Snap: ${error.message}`);
    }
  }

  /**
   * verifyWebhookSignature memverifikasi keaslian webhook notifikasi
   */
  public verifyWebhookSignature(payload: Record<string, any>, signatureKey: string): boolean {
    return MidtransSignatureVerifier.verifySignature({
      order_id: payload.order_id,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
      signature_key: signatureKey,
    });
  }

  /**
   * parseTransactionStatus menerjemahkan respons status Midtrans ke Domain PaymentStatus
   */
  public parseTransactionStatus(transactionStatus: string, fraudStatus?: string): PaymentStatus {
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        return PaymentStatus.PENDING;
      }
      if (fraudStatus === 'deny') {
        return PaymentStatus.FAILED;
      }
      return PaymentStatus.SETTLEMENT;
    }
    if (transactionStatus === 'settlement') {
      return PaymentStatus.SETTLEMENT;
    }
    if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      return PaymentStatus.EXPIRED;
    }
    if (transactionStatus === 'pending') {
      return PaymentStatus.PENDING;
    }
    return PaymentStatus.FAILED;
  }

  /**
   * checkOrderStatus melakukan query manual status invoice ke Midtrans
   */
  public async checkOrderStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const response = await coreApiClient.transaction.status(orderId);
      return this.parseTransactionStatus(response.transaction_status, response.fraud_status);
    } catch (error: any) {
      throw new Error(`[MidtransStatusError] Gagal memeriksa status order ${orderId}: ${error.message}`);
    }
  }

  /**
   * getOrderDetails mengambil detail lengkap status transaksi dari Midtrans
   */
  public async getOrderDetails(orderId: string): Promise<{
    paymentStatus: PaymentStatus;
    rawStatus: string;
    paymentType?: string;
    fraudStatus?: string;
    grossAmount?: number;
    settlementTime?: string;
  }> {
    try {
      const response = await coreApiClient.transaction.status(orderId);
      const paymentStatus = this.parseTransactionStatus(response.transaction_status, response.fraud_status);
      return {
        paymentStatus,
        rawStatus: response.transaction_status,
        paymentType: response.payment_type,
        fraudStatus: response.fraud_status,
        grossAmount: response.gross_amount ? parseFloat(response.gross_amount) : undefined,
        settlementTime: response.settlement_time || response.transaction_time,
      };
    } catch (error: any) {
      throw new Error(`[MidtransStatusError] Gagal memeriksa detail order ${orderId}: ${error.message}`);
    }
  }
}
