import {
  IsNumber,
  IsString,
  Matches,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureExpirationDate', async: false })
class IsFutureExpirationDateConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) {
      return false;
    }

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);

    const expirationMonthStart = new Date(year, month - 1, 1);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return expirationMonthStart.getTime() > currentMonthStart.getTime();
  }

  defaultMessage(): string {
    return 'expirationDate must be after the current month';
  }
}

export class CreatePaymentDto {
  @IsString()
  @MinLength(16, { message: 'cardNumber must be at least 16 characters' })
  cardNumber: string;

  @IsString()
  holderName: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'expirationDate must be in MM/YY format',
  })
  @Validate(IsFutureExpirationDateConstraint)
  expirationDate: string;

  @IsString()
  @MinLength(3, { message: 'cvv must be at least 3 characters' })
  cvv: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
