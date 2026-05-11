import {
  Controller,
  Post,
  Body,
  Version,
  InternalServerErrorException,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.paymentsService.getAllPayments(page);
  }
}
