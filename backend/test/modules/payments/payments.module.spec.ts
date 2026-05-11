import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsModule } from '../../../src/modules/payments/payments.module';
import { PaymentsController } from '../../../src/modules/payments/controllers/payments.controller';
import { PaymentsService } from '../../../src/modules/payments/services/payments.service';

jest.mock('../../../src/common/utils/delay', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../src/common/utils/random-between', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(3),
}));

describe('PaymentsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PaymentsModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module without errors', () => {
    expect(module).toBeDefined();
  });

  it('should provide PaymentsService', () => {
    const service = module.get<PaymentsService>(PaymentsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(PaymentsService);
  });

  it('should provide PaymentsController', () => {
    const controller = module.get<PaymentsController>(PaymentsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(PaymentsController);
  });

  it('should inject PaymentsService into PaymentsController', () => {
    const controller = module.get<PaymentsController>(PaymentsController);
    expect(controller).toBeDefined();
    // If injection failed, the controller would throw during compilation
  });
});
