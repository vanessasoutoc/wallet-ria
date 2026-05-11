import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentsController } from '../../../../src/modules/payments/controllers/payments.controller';
import { PaymentsService } from '../../../../src/modules/payments/services/payments.service';
import { CreatePaymentDto } from '../../../../src/modules/payments/dto/create-payment.dto';

const mockDto: CreatePaymentDto = {
  cardNumber: '4111111111111111',
  holderName: 'John Doe',
  expirationDate: '12/28',
  cvv: '123',
  amount: 150.0,
};

const mockApprovedResponse = {
  status: 'approved',
  transactionId: 'txn_1715000000000',
  totalTimeMs: 1500,
  steps: [
    { step: 'card_validation', timeMs: 500 },
    { step: 'anti_fraud', timeMs: 600 },
    { step: 'payment', timeMs: 400 },
  ],
};

const mockDeclinedResponse = {
  ...mockApprovedResponse,
  status: 'declined',
};

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            processPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (POST /v1/payments)', () => {
    it('should call processPayment with the provided DTO', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      await controller.create(mockDto);

      expect(service.processPayment).toHaveBeenCalledWith(mockDto);
      expect(service.processPayment).toHaveBeenCalledTimes(1);
    });

    it('should return the result from processPayment', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result).toEqual(mockApprovedResponse);
    });

    it('should return approved status when service returns approved', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.status).toBe('approved');
    });

    it('should return declined status when service returns declined', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockDeclinedResponse);

      const result = await controller.create(mockDto);

      expect(result.status).toBe('declined');
    });

    it('should return the transactionId from the service response', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.transactionId).toBe('txn_1715000000000');
    });

    it('should return the steps array from the service response', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.steps).toEqual(mockApprovedResponse.steps);
    });

    it('should return the totalTimeMs from the service response', async () => {
      jest.spyOn(service, 'processPayment').mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.totalTimeMs).toBe(1500);
    });

    it('should throw InternalServerErrorException when service throws an error', async () => {
      jest.spyOn(service, 'processPayment').mockRejectedValue(new Error('Unexpected DB error'));

      await expect(controller.create(mockDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException with message "Payment processing failed"', async () => {
      jest.spyOn(service, 'processPayment').mockRejectedValue(new Error('Network failure'));

      await expect(controller.create(mockDto)).rejects.toThrow('Payment processing failed');
    });

    it('should throw InternalServerErrorException even when service throws a non-Error value', async () => {
      jest.spyOn(service, 'processPayment').mockRejectedValue('string error');

      await expect(controller.create(mockDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should not expose the original error message to the client', async () => {
      jest.spyOn(service, 'processPayment').mockRejectedValue(new Error('Sensitive internal error'));

      try {
        await controller.create(mockDto);
        fail('Expected InternalServerErrorException to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect((err as InternalServerErrorException).message).toBe('Payment processing failed');
      }
    });
  });
});
