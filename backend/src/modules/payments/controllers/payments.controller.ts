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
  Logger,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Version('1')
  async create(@Body() dto: CreatePaymentDto) {
    try {
      return await this.paymentsService.processPayment(dto);
    } catch (error) {
      this.logger.error(`Payment processing error: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  @Get()
  @Version('1')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // Enforce maximum limit of 100 items per page
    const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
    return await this.paymentsService.getAllPayments(page, sanitizedLimit);
  }
}
