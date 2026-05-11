import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

jest.mock('../../../common/utils/delay', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../common/utils/random-between', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import randomBetween from '../../../common/utils/random-between';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService],
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
        transactionId: expect.stringMatching(/^txn_\d+$/),
        totalTimeMs: expect.any(Number),
        steps: expect.any(Array),
      });
    });

    it('should return status "approved" when Math.random() returns a value >= 0.1', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      expect(result.status).toBe('approved');
    });

    it('should return status "declined" when Math.random() returns a value < 0.1', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const result = await service.processPayment(mockDto);

      expect(result.status).toBe('declined');
    });

    it('should generate a transactionId starting with "txn_"', async () => {
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(500);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.processPayment(mockDto);

      expect(result.transactionId).toMatch(/^txn_\d+$/);
    });

    it('should generate a unique transactionId on each call', async () => {
      (randomBetween as jest.Mock).mockReturnValue(3);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(1715000000000)
        .mockReturnValueOnce(1715000001000);

      const result1 = await service.processPayment(mockDto);
      const result2 = await service.processPayment(mockDto);

      expect(result1.transactionId).toBe('txn_1715000000000');
      expect(result2.transactionId).toBe('txn_1715000001000');
      expect(result1.transactionId).not.toBe(result2.transactionId);
    });

    it.each([3, 4, 5, 6])(
      'should select exactly %i steps when randomBetween returns %i for count',
      async (count) => {
        (randomBetween as jest.Mock).mockReturnValueOnce(count).mockReturnValue(500);
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
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(stepDuration);
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
      (randomBetween as jest.Mock).mockReturnValueOnce(3).mockReturnValue(stepDuration);
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
  });
});
