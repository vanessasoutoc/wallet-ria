import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, Logger } from '@nestjs/common';
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
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            processPayment: jest.fn(),
            getAllPayments: jest.fn(),
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
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      await controller.create(mockDto);

      expect(service.processPayment).toHaveBeenCalledWith(mockDto);
      expect(service.processPayment).toHaveBeenCalledTimes(1);
    });

    it('should return the result from processPayment', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result).toEqual(mockApprovedResponse);
    });

    it('should return approved status when service returns approved', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.status).toBe('approved');
    });

    it('should return declined status when service returns declined', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockDeclinedResponse);

      const result = await controller.create(mockDto);

      expect(result.status).toBe('declined');
    });

    it('should return the transactionId from the service response', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.transactionId).toBe('txn_1715000000000');
    });

    it('should return the steps array from the service response', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.steps).toEqual(mockApprovedResponse.steps);
    });

    it('should return the totalTimeMs from the service response', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockResolvedValue(mockApprovedResponse);

      const result = await controller.create(mockDto);

      expect(result.totalTimeMs).toBe(1500);
    });

    it('should throw InternalServerErrorException when service throws an error', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockRejectedValue(new Error('Unexpected DB error'));

      await expect(controller.create(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException with message "Payment processing failed"', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockRejectedValue(new Error('Network failure'));

      await expect(controller.create(mockDto)).rejects.toThrow(
        'Payment processing failed',
      );
    });

    it('should throw InternalServerErrorException even when service throws a non-Error value', async () => {
      jest.spyOn(service, 'processPayment').mockRejectedValue('string error');

      await expect(controller.create(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should not expose the original error message to the client', async () => {
      jest
        .spyOn(service, 'processPayment')
        .mockRejectedValue(new Error('Sensitive internal error'));

      try {
        await controller.create(mockDto);
        fail('Expected InternalServerErrorException to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect((err as InternalServerErrorException).message).toBe(
          'Payment processing failed',
        );
      }
    });
  });

  describe('findAll (GET /v1/payments)', () => {
    it('should call getAllPayments with page and default limit of 10', async () => {
      const paginatedResponse = {
        items: [mockApprovedResponse],
        page: 2,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      await controller.findAll(2, 10);

      expect(service.getAllPayments).toHaveBeenCalledWith(2, 10);
      expect(service.getAllPayments).toHaveBeenCalledTimes(1);
    });

    it('should call getAllPayments with provided limit parameter', async () => {
      const paginatedResponse = {
        items: [mockApprovedResponse],
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      await controller.findAll(1, 20);

      expect(service.getAllPayments).toHaveBeenCalledWith(1, 20);
      expect(service.getAllPayments).toHaveBeenCalledTimes(1);
    });

    it('should enforce maximum limit of 100 items per page', async () => {
      const paginatedResponse = {
        items: [mockApprovedResponse],
        page: 1,
        limit: 100,
        totalItems: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      // Request with limit > 100 should be capped at 100
      await controller.findAll(1, 500);

      expect(service.getAllPayments).toHaveBeenCalledWith(1, 100);
    });

    it('should enforce minimum limit of 1 item per page', async () => {
      const paginatedResponse = {
        items: [mockApprovedResponse],
        page: 1,
        limit: 1,
        totalItems: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      // Request with limit < 1 should be set to 1
      await controller.findAll(1, -5);

      expect(service.getAllPayments).toHaveBeenCalledWith(1, 1);
    });

    it('should return full paginated response with items and metadata', async () => {
      const paginatedResponse = {
        items: [mockApprovedResponse],
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(result.items).toEqual([mockApprovedResponse]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalItems).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return paginated response with empty items array when no payments exist', async () => {
      const paginatedResponse = {
        items: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('should return paginated response with items from the specified page', async () => {
      const mockItem1 = { ...mockApprovedResponse, transactionId: 'txn_1' };
      const mockItem2 = { ...mockApprovedResponse, transactionId: 'txn_2' };
      const paginatedResponse = {
        items: [mockItem1, mockItem2],
        page: 2,
        limit: 10,
        totalItems: 20,
        totalPages: 2,
      };

      jest.spyOn(service, 'getAllPayments').mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(2, 10);

      expect(result).toEqual(paginatedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].transactionId).toBe('txn_1');
      expect(result.items[1].transactionId).toBe('txn_2');
      expect(result.page).toBe(2);
      expect(result.totalItems).toBe(20);
      expect(result.totalPages).toBe(2);
    });
  });
});
