import delay from '../../../src/common/utils/delay';

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return a Promise', () => {
    const result = delay(100);
    expect(result).toBeInstanceOf(Promise);
    jest.runAllTimers();
  });

  it('should resolve after the specified number of milliseconds', async () => {
    const ms = 500;
    let resolved = false;

    const promise = delay(ms).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(ms);
    await promise;

    expect(resolved).toBe(true);
  });

  it('should not resolve before the specified time has elapsed', async () => {
    const ms = 1000;
    let resolved = false;

    const promise = delay(ms).then(() => {
      resolved = true;
    });

    jest.advanceTimersByTime(ms - 1);
    await Promise.resolve();

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;

    expect(resolved).toBe(true);
  });

  it('should resolve with undefined', async () => {
    const promise = delay(100);
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBeUndefined();
  });

  it('should resolve immediately when called with 0ms', async () => {
    let resolved = false;

    const promise = delay(0).then(() => {
      resolved = true;
    });

    jest.advanceTimersByTime(0);
    await promise;

    expect(resolved).toBe(true);
  });

  it('should call setTimeout with the correct delay value', () => {
    const spy = jest.spyOn(global, 'setTimeout');
    const ms = 750;

    delay(ms);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(Function), ms);

    spy.mockRestore();
  });

  it('should work independently for multiple concurrent calls', async () => {
    const order: number[] = [];

    const p1 = delay(300).then(() => order.push(300));
    const p2 = delay(100).then(() => order.push(100));
    const p3 = delay(200).then(() => order.push(200));

    jest.advanceTimersByTime(100);
    await p2;
    jest.advanceTimersByTime(100);
    await p3;
    jest.advanceTimersByTime(100);
    await p1;

    expect(order).toEqual([100, 200, 300]);
  });
});
