import { paymentService } from '../../src/services/payments';

describe('paymentService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('createPayment sends POST and returns parsed response', async () => {
    const payload = {
      cardNumber: '4111111111111111',
      holderName: 'John Doe',
      expirationDate: '12/34',
      cvv: '123',
      amount: 100,
    };

    const apiResponse = {
      id: 'pay_1',
      cardNumber: payload.cardNumber,
      holderName: payload.holderName,
      expirationDate: payload.expirationDate,
      amount: payload.amount,
      createdAt: '2026-05-12T10:00:00.000Z',
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await paymentService.createPayment(payload);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(apiResponse);
  });

  it('createPayment throws message from API when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid payment payload' }),
    });

    await expect(
      paymentService.createPayment({
        cardNumber: '4111111111111111',
        holderName: 'John Doe',
        expirationDate: '12/34',
        cvv: '123',
        amount: 100,
      }),
    ).rejects.toThrow('Invalid payment payload');
  });

  it('listPayments sends GET with page and limit params', async () => {
    const apiResponse = {
      items: [],
      page: 2,
      limit: 5,
      totalItems: 0,
      totalPages: 0,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await paymentService.listPayments(2, 5);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/v1/payments?page=2&limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(apiResponse);
  });

  it('listPayments uses default pagination params when omitted', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      }),
    });

    await paymentService.listPayments();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/v1/payments?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('listPayments throws fallback status message when API has no message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(paymentService.listPayments()).rejects.toThrow('Error: 500');
  });
});
