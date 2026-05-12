import formatCardNumber from '../../src/utils/format-card-number';
import formatExpirationDate from '../../src/utils/format-expiration-date';

describe('formatCardNumber', () => {
  it('formats 16 digits into groups of 4', () => {
    expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('ignores non-digit characters and keeps grouping', () => {
    expect(formatCardNumber('1234-5678 9abc0123 4567')).toBe('1234 5678 9012 3456');
  });

  it('limits to 16 digits', () => {
    expect(formatCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456');
  });

  it('returns empty string for empty input', () => {
    expect(formatCardNumber('')).toBe('');
  });
});

describe('formatExpirationDate', () => {
  it('keeps up to 2 digits without slash', () => {
    expect(formatExpirationDate('1')).toBe('1');
    expect(formatExpirationDate('12')).toBe('12');
  });

  it('formats as MM/YY when more than 2 digits', () => {
    expect(formatExpirationDate('123')).toBe('12/3');
    expect(formatExpirationDate('1234')).toBe('12/34');
  });

  it('ignores non-digit characters', () => {
    expect(formatExpirationDate('1a/2b3')).toBe('12/3');
  });

  it('limits to 4 digits', () => {
    expect(formatExpirationDate('123456')).toBe('12/34');
  });
});
