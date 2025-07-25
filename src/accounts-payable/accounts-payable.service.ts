import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface FindAllAccountsParams {
  page: number;
  limit: number;
  month?: number;
  year?: number;
}

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  // Criação de uma nova conta a pagar (com suporte a recorrência)
  async create(createAccountsPayableDto: CreateAccountsPayableDto) {
    const { installmentType, dueDate, isRecurring, recurringUntil } = createAccountsPayableDto;

    if (installmentType === 'UNICA') {
      createAccountsPayableDto.installments = null;
      createAccountsPayableDto.currentInstallment = null;
    }

    // Remove a hora da data de vencimento
    if (dueDate) {
      const parsed = new Date(dueDate);
      parsed.setHours(0, 0, 0, 0);
      createAccountsPayableDto.dueDate = parsed;
    }

    // Cria a conta original
    const originalAccount = await this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });

    // Se marcada como recorrente, gerar cópias mensais até a data limite
    if (isRecurring && recurringUntil) {
      const startDate = new Date(createAccountsPayableDto.dueDate);
      const endDate = new Date(recurringUntil);
      endDate.setHours(0, 0, 0, 0);

      const originalDay = startDate.getDate();

      let currentYear = startDate.getFullYear();
      let currentMonth = startDate.getMonth() + 1; // começamos no mês seguinte

      while (true) {
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const adjustedDay = Math.min(originalDay, lastDayOfMonth);

        const nextDueDate = new Date(currentYear, currentMonth, adjustedDay);
        nextDueDate.setHours(0, 0, 0, 0);

        if (nextDueDate > endDate) break; // fim do loop

        await this.prisma.accountPayable.create({
          data: {
            name: originalAccount.name,
            category: originalAccount.category,
            value: originalAccount.value,
            dueDate: nextDueDate,
            status: 'A_PAGAR',
            installmentType: 'UNICA',
            installments: null,
            currentInstallment: null,
            isRecurring: false,
            recurringUntil: null,
            recurringSourceId: originalAccount.id,
          },
        });

        currentMonth++;
      }
    }

    return originalAccount;
  }

  // Busca paginada com filtros de mês e ano
  async findAll(params: FindAllAccountsParams) {
    const { page, limit, month, year } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountPayableWhereInput = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      where.dueDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.accountPayable.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: {
          payments: true,
        },
      }),
      this.prisma.accountPayable.count({ where }),
    ]);

    return {
      data: accounts,
      total,
    };
  }

  // Busca uma conta por ID
  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }

    return account;
  }

  // Atualização de conta com lógica de parcelamento
  async update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto) {
    const existingAccount = await this.findOne(id);

    const dataToUpdate: any = { ...updateAccountsPayableDto };

    // Remove hora da data de vencimento
    if (updateAccountsPayableDto.dueDate) {
      const parsed = new Date(updateAccountsPayableDto.dueDate);
      parsed.setHours(0, 0, 0, 0);
      dataToUpdate.dueDate = parsed;
    }

    const statusUpdatedToPaid = updateAccountsPayableDto.status === 'PAGO';

    const updatedAccount = await this.prisma.accountPayable.update({
      where: { id },
      data: dataToUpdate,
    });

    // Se for marcada como paga, registra valor restante
    if (statusUpdatedToPaid) {
      const existingPayments = await this.prisma.payment.findMany({
        where: { accountId: id },
      });

      const totalPaid = existingPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      );
      const remainingAmount = updatedAccount.value - totalPaid;

      if (remainingAmount > 0) {
        await this.prisma.payment.create({
          data: {
            accountId: id,
            paidAt: new Date(),
            amount: remainingAmount,
          },
        });
      }
    }

    // Se for parcelado, gera próxima parcela
    if (
      statusUpdatedToPaid &&
      existingAccount.installmentType === 'PARCELADO' &&
      existingAccount.currentInstallment &&
      existingAccount.installments &&
      existingAccount.currentInstallment < existingAccount.installments
    ) {
      const nextInstallment = existingAccount.currentInstallment + 1;

      const currentDueDate = new Date(existingAccount.dueDate);
      const nextDueDate = new Date(
        currentDueDate.setMonth(currentDueDate.getMonth() + 1),
      );
      nextDueDate.setHours(0, 0, 0, 0);

      await this.prisma.accountPayable.create({
        data: {
          name: existingAccount.name,
          category: existingAccount.category,
          value: existingAccount.value,
          dueDate: nextDueDate,
          status: 'A_PAGAR',
          installmentType: 'PARCELADO',
          installments: existingAccount.installments,
          currentInstallment: nextInstallment,
        },
      });
    }

    return updatedAccount;
  }

  // Remoção de conta e seus pagamentos
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.payment.deleteMany({
      where: { accountId: id },
    });

    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }

  // Registro manual de pagamento (com data e hora)
  async registerPayment(accountId: number, paidAt: Date) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta a pagar não encontrada.');
    }

    if (account.status !== 'PAGO') {
      await this.prisma.accountPayable.update({
        where: { id: accountId },
        data: { status: 'PAGO' },
      });
    }

    return this.prisma.payment.create({
      data: {
        accountId,
        paidAt,
      },
    });
  }
}
