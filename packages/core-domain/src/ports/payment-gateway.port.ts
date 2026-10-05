export interface CreateTransactionParams {
  invoiceNumber: string;
  amountIdr: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface IPaymentGatewayPort {
  createInvoice(params: CreateTransactionParams): Promise<{ snapToken: string; redirectUrl: string }>;
  verifyWebhookSignature(payload: Record<string, any>, signatureKey: string): boolean;
}
