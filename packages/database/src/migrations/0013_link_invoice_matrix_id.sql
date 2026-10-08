-- Migration 0013: Menghubungkan invoice transaksi ke matriks harga deterministik
-- Mencegah tebakan durasi dan memastikan jejak audit finansial yang pasti

ALTER TABLE invoice_transactions 
ADD COLUMN IF NOT EXISTS matrix_id UUID REFERENCES subscription_price_matrices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_matrix_id ON invoice_transactions(matrix_id);
