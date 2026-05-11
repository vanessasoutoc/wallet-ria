import randomBetween from '../../../src/common/utils/random-between';

describe('randomBetween', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a number', () => {
    const result = randomBetween(1, 10);
    expect(typeof result).toBe('number');
  });

  it('should return an integer (no decimal places)', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomBetween(1, 100);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should return min when Math.random() returns 0', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomBetween(5, 10)).toBe(5);
  });

  it('should return max when Math.random() returns a value just below 1', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
    expect(randomBetween(5, 10)).toBe(10);
  });

  it('should return min when min === max', () => {
    const result = randomBetween(7, 7);
    expect(result).toBe(7);
  });

  it('should always return a value within [min, max] range', () => {
    const min = 300;
    const max = 800;

    for (let i = 0; i < 100; i++) {
      const result = randomBetween(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  it('should include the min boundary', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomBetween(450, 730)).toBe(450);
  });

  it('should include the max boundary', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
    expect(randomBetween(450, 730)).toBe(730);
  });

  it('should use Math.random() to produce the result', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    randomBetween(0, 10);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return correct value for a known Math.random() input', () => {
    // Math.floor(0.5 * (10 - 0 + 1)) + 0 = Math.floor(5.5) + 0 = 5
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(randomBetween(0, 10)).toBe(5);
  });

  it('should produce different values across calls with real Math.random()', () => {
    const results = new Set<number>();
    for (let i = 0; i < 200; i++) {
      results.add(randomBetween(1, 1000));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
