import { IsString, IsNumber, Min } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  cardNumber: string;

  @IsString()
  holderName: string;

  @IsString()
  expirationDate: string;

  @IsString()
  cvv: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}