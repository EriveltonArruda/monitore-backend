import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
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
      bankAccount: body.bankAccount ?? undefined,
    });
  }

  @Patch(':id')
  async updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      paidAt?: string;
      amount?: number;
      bankAccount?: string | null;
    },
  ) {
    return this.paymentsService.update(id, {
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
      amount: body.amount,
      bankAccount: body.bankAccount ?? undefined,
    });
  }

  @Delete(':id')
  async removePayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
