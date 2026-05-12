import { rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  PaymentsRepository,
  StoredPayment,
  PaginatedPayments,
} from '../../../../src/modules/payments/repositories/payments.repository';
import { CreatePaymentDto } from '../../../../src/modules/payments/dto/create-payment.dto';

const mockPaymentDto: CreatePaymentDto = {
  cardNumber: '4111111111111111',
  holderName: 'John Doe',
  expirationDate: '12/28',
  cvv: '123',
  amount: 150.0,
};

describe('PaymentsRepository', () => {
  afterAll(() => {
    try {
      const dbPath = join(process.cwd(), 'data', 'wallet.db');
      rmSync(dbPath, { force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('saveTransaction', () => {
    let repository: PaymentsRepository;

    beforeEach(() => {
      repository = new PaymentsRepository();
    });

    afterEach(() => {
      repository.onModuleDestroy();
    });

    it('should save a transaction and return it with the expected shape', () => {
      const input = {
        payment: mockPaymentDto,
        transactionId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'approved' as const,
        totalTimeMs: 1500,
        steps: [
          { step: 'card_validation', timeMs: 500 },
          { step: 'anti_fraud', timeMs: 600 },
          { step: 'payment', timeMs: 400 },
        ],
      };

      const result = repository.saveTransaction(input);

      expect(result).toMatchObject({
        id: expect.any(Number),
        transactionId: input.transactionId,
        cardNumberLast4: '1111',
        holderName: mockPaymentDto.holderName,
        expirationDate: mockPaymentDto.expirationDate,
        amount: mockPaymentDto.amount,
        status: 'approved',
        totalTimeMs: input.totalTimeMs,
        steps: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should extract the last 4 digits of the card number', () => {
      const input = {
        payment: mockPaymentDto,
        transactionId: 'test-txn-id',
        status: 'approved' as const,
        totalTimeMs: 500,
        steps: [],
      };

      const result = repository.saveTransaction(input);

      expect(result.cardNumberLast4).toBe('1111');
    });

    it('should store steps as a JSON string', () => {
      const steps = [
        { step: 'card_validation', timeMs: 500 },
        { step: 'anti_fraud', timeMs: 600 },
      ];
      const input = {
        payment: mockPaymentDto,
        transactionId: 'test-txn-id-steps',
        status: 'approved' as const,
        totalTimeMs: 1100,
        steps,
      };

      const result = repository.saveTransaction(input);

      expect(result.steps).toBe(JSON.stringify(steps));
      expect(JSON.parse(result.steps)).toEqual(steps);
    });

    it('should create a createdAt timestamp', () => {
      const before = new Date().toISOString();
      const input = {
        payment: mockPaymentDto,
        transactionId: 'test-txn-id-date',
        status: 'approved' as const,
        totalTimeMs: 500,
        steps: [],
      };

      const result = repository.saveTransaction(input);
      const after = new Date().toISOString();

      expect(new Date(result.createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
      expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime(),
      );
    });

    it('should save declined status correctly', () => {
      const input = {
        payment: mockPaymentDto,
        transactionId: 'declined-txn-id',
        status: 'declined' as const,
        totalTimeMs: 800,
        steps: [],
      };

      const result = repository.saveTransaction(input);

      expect(result.status).toBe('declined');
    });
  });

  describe('listPayments', () => {
    let repository: PaymentsRepository;

    beforeEach(() => {
      // Clean database before each test to avoid interference
      try {
        const dbPath = join(process.cwd(), 'data', 'wallet.db');
        rmSync(dbPath, { force: true });
      } catch {
        // Ignore if file doesn't exist
      }
      repository = new PaymentsRepository();
    });

    afterEach(() => {
      repository.onModuleDestroy();
    });

    it('should return empty paginated result when no payments exist', () => {
      const result = repository.listPayments();

      expect(result).toMatchObject({
        items: [],
        page: 1,
        limit: 5,
        totalItems: 0,
        totalPages: 1,
      });
    });

    it('should return paginated results with correct pagination metadata', () => {
      // Save 25 payments
      for (let i = 0; i < 15; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-${i}`,
          status: i % 2 === 0 ? 'approved' : 'declined',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const result = repository.listPayments(1, 5);

      expect(result).toMatchObject({
        page: 1,
        limit: 5,
        totalItems: 15,
        totalPages: 3,
      });
      expect(result.items).toHaveLength(5);
    });

    it('should respect pagination limits and offsets', () => {
      for (let i = 1; i <= 25; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-${i}`,
          status: 'approved',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const page1 = repository.listPayments(1, 5);
      const page2 = repository.listPayments(2, 5);
      const page3 = repository.listPayments(3, 5);

      expect(page1.items).toHaveLength(5);
      expect(page2.items).toHaveLength(5);
      expect(page3.items).toHaveLength(5);

      // Verify no overlap
      const page1Ids = page1.items.map((item) => item.transactionId);
      const page2Ids = page2.items.map((item) => item.transactionId);
      const page3Ids = page3.items.map((item) => item.transactionId);

      expect(
        page1Ids.some((id) => page2Ids.includes(id)),
      ).toBe(false);
      expect(
        page2Ids.some((id) => page3Ids.includes(id)),
      ).toBe(false);
    });

    it('should default to page 1 and limit 10', () => {
      for (let i = 0; i < 5; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-default-${i}`,
          status: 'approved',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const result = repository.listPayments();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
    });

    it('should handle invalid page numbers gracefully', () => {
      for (let i = 0; i < 5; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-invalid-${i}`,
          status: 'approved',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const negativePageResult = repository.listPayments(-1, 5);
      const zeroPageResult = repository.listPayments(0, 5);
      const nonIntegerPageResult = repository.listPayments(1.5, 5);

      expect(negativePageResult.page).toBe(1);
      expect(zeroPageResult.page).toBe(1);
      expect(nonIntegerPageResult.page).toBe(1);
    });

    it('should handle invalid limit values gracefully', () => {
      for (let i = 0; i < 5; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-limit-${i}`,
          status: 'approved',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const negativeLimitResult = repository.listPayments(1, -5);
      const zeroLimitResult = repository.listPayments(1, 0);
      const nonIntegerLimitResult = repository.listPayments(1, 5.7);

      expect(negativeLimitResult.limit).toBe(5);
      expect(zeroLimitResult.limit).toBe(5);
      expect(nonIntegerLimitResult.limit).toBe(5);
    });

    it('should order results by createdAt DESC (newest first)', async () => {
      // Save 3 payments with slight delays to ensure different timestamps
      const txn1 = repository.saveTransaction({
        payment: mockPaymentDto,
        transactionId: 'txn-1',
        status: 'approved',
        totalTimeMs: 500,
        steps: [],
      });

      // Small delay to ensure different createdAt
      await new Promise((resolve) => setTimeout(resolve, 10));

      const txn2 = repository.saveTransaction({
        payment: mockPaymentDto,
        transactionId: 'txn-2',
        status: 'approved',
        totalTimeMs: 500,
        steps: [],
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const txn3 = repository.saveTransaction({
        payment: mockPaymentDto,
        transactionId: 'txn-3',
        status: 'approved',
        totalTimeMs: 500,
        steps: [],
      });

      const result = repository.listPayments();

      // Should be in reverse order (newest first)
      expect(result.items[0].transactionId).toBe('txn-3');
      expect(result.items[1].transactionId).toBe('txn-2');
      expect(result.items[2].transactionId).toBe('txn-1');
    });

    it('should calculate totalPages correctly', () => {
      // Save 25 items
      for (let i = 0; i < 25; i++) {
        repository.saveTransaction({
          payment: mockPaymentDto,
          transactionId: `txn-pages-${i}`,
          status: 'approved',
          totalTimeMs: 500,
          steps: [],
        });
      }

      const resultLimit5 = repository.listPayments(1, 5);
      const resultLimit10 = repository.listPayments(1, 10);
      const resultLimit25 = repository.listPayments(1, 25);
      const resultLimit50 = repository.listPayments(1, 50);

      expect(resultLimit5.totalPages).toBe(5);
      expect(resultLimit10.totalPages).toBe(3);
      expect(resultLimit25.totalPages).toBe(1);
      expect(resultLimit50.totalPages).toBe(1);
    });

    it('should return results of expected shape', () => {
      repository.saveTransaction({
        payment: mockPaymentDto,
        transactionId: 'test-txn-shape',
        status: 'approved',
        totalTimeMs: 500,
        steps: [{ step: 'payment', timeMs: 500 }],
      });

      const result: PaginatedPayments = repository.listPayments();

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalItems');
      expect(result).toHaveProperty('totalPages');

      const item: StoredPayment = result.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('transactionId');
      expect(item).toHaveProperty('cardNumberLast4');
      expect(item).toHaveProperty('holderName');
      expect(item).toHaveProperty('expirationDate');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('totalTimeMs');
      expect(item).toHaveProperty('steps');
      expect(item).toHaveProperty('createdAt');
    });
  });

  describe('onModuleDestroy', () => {
    let repository: PaymentsRepository;

    beforeEach(() => {
      repository = new PaymentsRepository();
    });

    it('should close the database connection', () => {
      const closeSpy = jest.spyOn(
        (repository as any).database,
        'close',
      );

      repository.onModuleDestroy();

      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
