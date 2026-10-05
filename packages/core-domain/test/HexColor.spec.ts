import { describe, it, expect } from 'vitest';
import { HexColor } from '../src/value-objects/HexColor.js';

describe('HexColor Value Object', () => {
  it('harus menerima kode HEX 6 digit yang valid dan menormalisasi ke huruf kapital', () => {
    const color = new HexColor('#1890ff');
    expect(color.getValue()).toBe('#1890FF');
  });

  it('harus menolak format warna yang tidak valid', () => {
    expect(() => new HexColor('blue')).toThrowError(/Format warna HEX.*tidak valid/);
    expect(() => new HexColor('#FFF')).toThrowError(/Format warna HEX.*tidak valid/);
    expect(() => new HexColor('#1890FFAA')).toThrowError(/Format warna HEX.*tidak valid/);
    expect(() => new HexColor('1890FF')).toThrowError(/Format warna HEX.*tidak valid/);
  });
});