import * as crypto from 'crypto';
import { MIDTRANS_CONFIG } from './midtrans.client.js';

export class MidtransSignatureVerifier {
  /**
   * verifySignature mencocokkan signature_key dari webhook Midtrans
   * dengan kalkulasi SHA-512 lokal menggunakan Server Key rahasia.
   */
  public static verifySignature(payload: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  }): boolean {
    const rawString = `${payload.order_id}${payload.status_code}${payload.gross_amount}${MIDTRANS_CONFIG.serverKey}`;
    
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(rawString)
      .digest('hex');

    return calculatedSignature === payload.signature_key;
  }
}
