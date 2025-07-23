import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  async findByAccountId(accountId: number) {
    return this.prisma.payment.findMany({
      where: { accountId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async create(data: {
    accountId: number;
    paidAt: Date;
    amount: number;
    bankAccount?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        accountId: data.accountId,
        paidAt: data.paidAt,
        amount: data.amount,
        bankAccount: data.bankAccount ?? null, // ✅ forma correta
      },
    });
  }
}
