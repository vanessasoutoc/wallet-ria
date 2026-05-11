import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePaymentDto } from '../../../../src/modules/payments/dto/create-payment.dto';

const validDto = () => ({
  cardNumber: '4111111111111111',
  holderName: 'John Doe',
  expirationDate: '12/99',
  cvv: '123',
  amount: 150,
});

const monthYearOffset = (monthsFromNow: number): string => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, 1);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
};

describe('CreatePaymentDto validation', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreatePaymentDto, validDto());
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects cardNumber shorter than 16 characters', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      ...validDto(),
      cardNumber: '411111111111111',
    });

    const errors = await validate(dto);

    const cardError = errors.find((e) => e.property === 'cardNumber');
    expect(cardError).toBeDefined();
    expect(cardError?.constraints?.minLength).toBeDefined();
  });

  it('rejects cvv shorter than 3 characters', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      ...validDto(),
      cvv: '12',
    });

    const errors = await validate(dto);

    const cvvError = errors.find((e) => e.property === 'cvv');
    expect(cvvError).toBeDefined();
    expect(cvvError?.constraints?.minLength).toBeDefined();
  });

  it('rejects expirationDate that does not match MM/YY', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      ...validDto(),
      expirationDate: '2028-12',
    });

    const errors = await validate(dto);

    const expirationError = errors.find((e) => e.property === 'expirationDate');
    expect(expirationError).toBeDefined();
    expect(expirationError?.constraints?.matches).toBeDefined();
  });

  it('rejects expirationDate in the current month', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      ...validDto(),
      expirationDate: monthYearOffset(0),
    });

    const errors = await validate(dto);

    const expirationError = errors.find((e) => e.property === 'expirationDate');
    expect(expirationError).toBeDefined();
    expect(expirationError?.constraints?.isFutureExpirationDate).toBeDefined();
  });

  it('accepts expirationDate in a future month', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      ...validDto(),
      expirationDate: monthYearOffset(1),
    });

    const errors = await validate(dto);

    const expirationError = errors.find((e) => e.property === 'expirationDate');
    expect(expirationError).toBeUndefined();
  });
});
