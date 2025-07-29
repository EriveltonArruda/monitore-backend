import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  // Busca todos os pagamentos por ID da conta
  async findByAccountId(accountId: number) {
    return this.prisma.payment.findMany({
      where: { accountId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async create(data: {
    accountId: number;
    paidAt: Date;
    amount: number | string; // Pode vir com vírgula
    bankAccount?: string;
  }) {
    // Normaliza valor com vírgula
    const normalizedAmount = typeof data.amount === 'string'
      ? parseFloat(data.amount.replace(',', '.'))
      : data.amount;

    if (isNaN(normalizedAmount) || normalizedAmount <= 0) {
      throw new Error('Valor do pagamento inválido.');
    }

    // Verifica se já existe pagamento idêntico no mesmo horário
    const existing = await this.prisma.payment.findFirst({
      where: {
        accountId: data.accountId,
        amount: normalizedAmount,
        paidAt: data.paidAt,
      },
    });

    if (existing) {
      return existing; // Evita duplicata
    }

    return this.prisma.payment.create({
      data: {
        accountId: data.accountId,
        paidAt: data.paidAt,
        amount: normalizedAmount,
        bankAccount: data.bankAccount ?? null,
      },
    });
  }

  // Atualização de um pagamento
  async update(id: number, data: {
    paidAt?: Date;
    amount?: number;
    bankAccount?: string | null;
  }) {
    const existing = await this.prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  // Exclusão de um pagamento
  async remove(id: number) {
    const existing = await this.prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
