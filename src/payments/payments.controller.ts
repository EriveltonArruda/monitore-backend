import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  async findByAccountId(@Query('accountId') accountId: string) {
    const id = parseInt(accountId);
    if (isNaN(id)) {
      throw new Error('accountId inválido');
    }
    return this.paymentsService.findByAccountId(id);
  }

  @Post()
  async createPayment(@Body() body: CreatePaymentDto) {
    return this.paymentsService.create({
      accountId: body.accountId,
      paidAt: new Date(body.paidAt),
      amount: body.amount,
    });
  }
}
