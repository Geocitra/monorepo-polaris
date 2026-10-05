import { describe, it, expect } from 'vitest';
import { PlatformTokenPool } from '../src/entities/PlatformTokenPool.js';

describe('PlatformTokenPool Entity & State Machine (GRASP Information Expert)', () => {
  it('harus menginisialisasi entitas dengan status default CLOSED dan operasional', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 0,
      alertThresholdPercent: 20,
    });

    expect(pool.circuitState).toBe('CLOSED');
    expect(pool.isOperational()).toBe(true);
    expect(pool.calculateRemainingUsd(0)).toBe(50.00);
    expect(pool.calculateRemainingPercent(0)).toBe(100);
  });

  it('harus menghitung sisa saldo dan persentase secara akurat', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 100.00,
      totalTokensAllocated: 20_000_000,
      totalTokensConsumed: 5_000_000,
      alertThresholdPercent: 20,
    });

    const remaining = pool.calculateRemainingUsd(65.50);
    expect(remaining).toBe(34.50);

    const percent = pool.calculateRemainingPercent(65.50);
    expect(percent).toBe(35);
  });

  it('tidak boleh memicu alarm peringatan jika saldo di atas batas threshold (> 20%)', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 2_000_000,
      alertThresholdPercent: 20,
    });

    const evalResult = pool.evaluateState(20.00); // Sisa $30.00 (60%)
    expect(evalResult.shouldTrip).toBe(false);
    expect(evalResult.isWarning).toBe(false);
    expect(pool.circuitState).toBe('CLOSED');
  });

  it('harus memicu isWarning jika sisa saldo <= 20% namun belum melewati batas kritis ($2.00)', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 8_000_000,
      alertThresholdPercent: 20,
    });

    const evalResult = pool.evaluateState(42.00); // Sisa $8.00 (16% <= 20%)
    expect(evalResult.isWarning).toBe(true);
    expect(evalResult.shouldTrip).toBe(false);
    expect(pool.circuitState).toBe('CLOSED');
    expect(pool.isOperational()).toBe(true);
  });

  it('harus memutus sirkuit (trip ke OPEN) saat sisa saldo <= $2.00 (Hard Minimum Safety)', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 9_500_000,
      alertThresholdPercent: 20,
    });

    const evalResult = pool.evaluateState(48.50); // Sisa $1.50 <= $2.00
    expect(evalResult.shouldTrip).toBe(true);
    expect(evalResult.isWarning).toBe(true);
    expect(pool.circuitState).toBe('OPEN');
    expect(pool.isOperational()).toBe(false);
  });

  it('harus mengubah sirkuit menjadi HALF_OPEN jika saldo naik di atas batas kritis tetapi sebelumnya OPEN', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 9_500_000,
      alertThresholdPercent: 20,
      circuitState: 'OPEN',
    });

    const evalResult = pool.evaluateState(40.00); // Sisa $10.00 > $2.00
    expect(pool.circuitState).toBe('HALF_OPEN');
    expect(pool.isOperational()).toBe(true);
  });

  it('harus mereset status sirkuit ke CLOSED saat top-up berhasil dicatat', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 10.00,
      totalTokensAllocated: 2_000_000,
      totalTokensConsumed: 2_000_000,
      alertThresholdPercent: 20,
      circuitState: 'OPEN',
    });

    pool.recordTopup(50.00, 10_000_000);
    expect(pool.totalBudgetUsd).toBe(60.00);
    expect(pool.totalTokensAllocated).toBe(12_000_000);
    expect(pool.circuitState).toBe('CLOSED');
    expect(pool.lastTopupDate).toBeInstanceOf(Date);
  });

  it('harus menolak top-up bernilai 0 atau negatif dengan DomainInvariantError', () => {
    const pool = new PlatformTokenPool({
      id: 'pool-1',
      totalBudgetUsd: 50.00,
      totalTokensAllocated: 10_000_000,
      totalTokensConsumed: 0,
      alertThresholdPercent: 20,
    });

    expect(() => pool.recordTopup(0, 1_000_000)).toThrow('[DomainInvariantError]');
    expect(() => pool.recordTopup(-10, 1_000_000)).toThrow('[DomainInvariantError]');
  });
});
