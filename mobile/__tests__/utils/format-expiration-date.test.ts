import formatExpirationDate from '../../src/utils/format-expiration-date';

describe('formatExpirationDate', () => {
  it('returns empty string for empty input', () => {
    expect(formatExpirationDate('')).toBe('');
  });

  it('keeps one or two digits without slash', () => {
    expect(formatExpirationDate('1')).toBe('1');
    expect(formatExpirationDate('12')).toBe('12');
  });

  it('adds slash when there are more than two digits', () => {
    expect(formatExpirationDate('123')).toBe('12/3');
    expect(formatExpirationDate('1234')).toBe('12/34');
  });

  it('ignores non-digit characters', () => {
    expect(formatExpirationDate('1a/2b3')).toBe('12/3');
  });

  it('limits output to MM/YY (4 digits)', () => {
    expect(formatExpirationDate('123456')).toBe('12/34');
  });
});
