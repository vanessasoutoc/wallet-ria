import { getCardBrand } from '../../../src/components/payments/get-card-brand';

describe('getCardBrand', () => {
  it('detects visa', () => {
    expect(getCardBrand('4111111111111111')).toBe('visa');
  });

  it('detects mastercard', () => {
    expect(getCardBrand('5555555555554444')).toBe('mastercard');
  });

  it('detects amex', () => {
    expect(getCardBrand('378282246310005')).toBe('amex');
  });

  it('detects discover', () => {
    expect(getCardBrand('6011111111111117')).toBe('discover');
  });

  it('detects jcb', () => {
    expect(getCardBrand('3530111333300000')).toBe('jcb');
  });

  it('returns unknown for unsupported numbers', () => {
    expect(getCardBrand('1234567890123456')).toBe('unknown');
  });

  it('ignores non-digit characters', () => {
    expect(getCardBrand('4111 1111-1111 1111')).toBe('visa');
  });
});
