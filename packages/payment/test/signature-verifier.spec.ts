import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { MidtransSignatureVerifier } from '../src/signature.verifier.js';
import { MIDTRANS_CONFIG } from '../src/midtrans.client.js';

describe('MidtransSignatureVerifier', () => {
  it('harus memvalidasi SHA-512 signature webhook resmi yang cocok', () => {
    const orderId = 'INV-20261002-TEST';
    const statusCode = '200';
    const grossAmount = '2000000.00';
    const serverKey = MIDTRANS_CONFIG.serverKey;

    const validSignature = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    const result = MidtransSignatureVerifier.verifySignature({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: validSignature,
    });

    expect(result).toBe(true);
  });

  it('harus menolak webhook jika signature key telah dimanipulasi', () => {
    const result = MidtransSignatureVerifier.verifySignature({
      order_id: 'INV-20261002-TEST',
      status_code: '200',
      gross_amount: '2000000.00',
      signature_key: 'invalid_fraud_hash_key_123',
    });

    expect(result).toBe(false);
  });
});