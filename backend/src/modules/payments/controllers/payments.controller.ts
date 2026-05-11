import {
  Controller,
  Post,
  Body,
  Version,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Version('1')
  async create(@Body() dto: CreatePaymentDto) {
    try {
      return await this.paymentsService.processPayment(dto);
    } catch {
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  @Get()
  @Version('1')
  async index() {
    try {
      return await this.paymentsService.getAllPayments();
    } catch {
      throw new InternalServerErrorException('Failed to retrieve payments');
    }
  }
}
