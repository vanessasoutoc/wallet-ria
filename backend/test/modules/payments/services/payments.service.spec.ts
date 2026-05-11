import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../../../../src/modules/payments/services/payments.service';
import { CreatePaymentDto } from '../../../../src/modules/payments/dto/create-payment.dto';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';

jest.mock('../../../../src/common/utils/delay', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../../src/common/utils/random-between', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import randomBetween from '../../../../src/common/utils/random-between';

const STEP_ORDER = [
  'account_validation',
  'card_validation',
  'anti_fraud',
  'acquirer_processing',
  'payment',
  'notification',
];

const mockDto: CreatePaymentDto = {
  cardNumber: '4111111111111111',
  holderName: 'John Doe',
  expirationDate: '12/28',
  cvv: '123',
  amount: 150.0,
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: { saveTransaction: jest.Mock; listPayments: jest.Mock };

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  beforeEach(async () => {
    paymentsRepository = {
      saveTransaction: jest.fn(),
      listPayments: jest.fn().mockReturnValue({
        items: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepository,
          useValue: paymentsRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processPayment', () => {
    it('should return a response with the expected shape', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      expect(result).toMatchObject({
        status: expect.stringMatching(/^(approved|declined)$/),
        transactionId: expect.stringMatching(uuidPattern),
        totalTimeMs: expect.any(Number),
        steps: expect.any(Array),
      });

      expect(paymentsRepository.saveTransaction).toHaveBeenCalledTimes(1);
    });

    it('should return status "approved" when Math.random() returns a value >= 0.1', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      expect(result.status).toBe('approved');
      expect(paymentsRepository.saveTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' }),
      );
    });

    it('should return status "declined" when Math.random() returns a value < 0.1', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const result = await service.processPayment(mockDto);

      expect(result.status).toBe('declined');
      expect(paymentsRepository.saveTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'declined' }),
      );
    });

    it('should generate a UUID transactionId', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      expect(result.transactionId).toMatch(uuidPattern);
    });

    it('should generate a unique transactionId on each call', async () => {
      (randomBetween as jest.Mock).mockReturnValue(3);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result1 = await service.processPayment(mockDto);
      const result2 = await service.processPayment(mockDto);

      expect(result1.transactionId).toMatch(uuidPattern);
      expect(result2.transactionId).toMatch(uuidPattern);
      expect(result1.transactionId).not.toBe(result2.transactionId);
    });

    it.each([3, 4, 5, 6])(
      'should select exactly %i steps when randomBetween returns %i for count',
      async (count) => {
        (randomBetween as jest.Mock)
          .mockReturnValueOnce(count)
          .mockReturnValue(500);
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const result = await service.processPayment(mockDto);

        expect(result.steps).toHaveLength(count);
      },
    );

    it('should return only valid and known step names', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(6).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      result.steps.forEach(({ step }) => {
        expect(STEP_ORDER).toContain(step);
      });
    });

    it('should return steps in logical order (preserving STEP_ORDER sequence)', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(4).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      const indices = result.steps.map((s) => STEP_ORDER.indexOf(s.step));
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1]);
      }
    });

    it('should set totalTimeMs equal to the sum of all step timMs', async () => {
      const stepDuration = 600;
      (randomBetween as jest.Mock)
        .mockReturnValueOnce(3)
        .mockReturnValue(stepDuration);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      const expectedTotal = result.steps.reduce((sum, s) => sum + s.timeMs, 0);
      expect(result.totalTimeMs).toBe(expectedTotal);
      expect(result.totalTimeMs).toBe(stepDuration * 3);
    });

    it('should return each step with "step" (string) and "timeMs" (number) fields', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      result.steps.forEach((s) => {
        expect(typeof s.step).toBe('string');
        expect(typeof s.timeMs).toBe('number');
        expect(s.timeMs).toBeGreaterThan(0);
      });
    });

    it('should use the duration returned by randomBetween as each step timeMs', async () => {
      const stepDuration = 750;
      (randomBetween as jest.Mock)
        .mockReturnValueOnce(3)
        .mockReturnValue(stepDuration);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      result.steps.forEach((s) => {
        expect(s.timeMs).toBe(stepDuration);
      });
    });

    it('should not include duplicate steps in the response', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(6).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      const stepNames = result.steps.map((s) => s.step);
      const uniqueStepNames = new Set(stepNames);
      expect(uniqueStepNames.size).toBe(stepNames.length);
    });

    it('should fetch payments with 10 items per page', async () => {
      const result = await service.getAllPayments(3);

      expect(paymentsRepository.listPayments).toHaveBeenCalledWith(3, 10);
      expect(result).toEqual({
        items: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      });
    });
  });
});
