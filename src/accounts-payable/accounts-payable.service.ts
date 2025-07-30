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
  status?: string; // Novo campo para filtro de status
  category?: string; // campo de categorias
  search?: string;
}

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  async create(createAccountsPayableDto: CreateAccountsPayableDto) {
    const { installmentType, dueDate, isRecurring, recurringUntil } = createAccountsPayableDto;

    if (installmentType === 'UNICA') {
      createAccountsPayableDto.installments = null;
      createAccountsPayableDto.currentInstallment = null;
    }

    if (dueDate) {
      const parsed = new Date(dueDate);
      parsed.setHours(0, 0, 0, 0);
      createAccountsPayableDto.dueDate = parsed;
    }

    const originalAccount = await this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });

    if (isRecurring && recurringUntil) {
      const startDate = new Date(createAccountsPayableDto.dueDate);
      const endDate = new Date(recurringUntil);
      endDate.setHours(0, 0, 0, 0);

      const originalDay = startDate.getDate();

      let currentYear = startDate.getFullYear();
      let currentMonth = startDate.getMonth() + 1;

      while (true) {
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const adjustedDay = Math.min(originalDay, lastDayOfMonth);
        const nextDueDate = new Date(currentYear, currentMonth, adjustedDay);
        nextDueDate.setHours(0, 0, 0, 0);

        if (nextDueDate > endDate) break;

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

  async findAll(params: FindAllAccountsParams) {
    const { page, limit, month, year, status, category, search } = params;
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

    // Filtro por status (exceto "TODOS")
    if (status && status !== 'TODOS') {
      where.status = status;
    }

    // Filtro por categoria (exceto "TODAS")
    if (category && category !== 'TODAS') {
      where.category = category;
    }

    if (search && search.trim() !== '') {
      where.name = {
        contains: search.trim()
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

  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }

    return account;
  }

  async update(
    id: number,
    updateAccountsPayableDto: UpdateAccountsPayableDto
  ) {
    const existingAccount = await this.prisma.accountPayable.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!existingAccount) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }
    const prevStatus = existingAccount.status;

    const dataToUpdate: any = { ...updateAccountsPayableDto };
    if (updateAccountsPayableDto.dueDate) {
      const d = new Date(updateAccountsPayableDto.dueDate);
      d.setHours(0, 0, 0, 0);
      dataToUpdate.dueDate = d;
    }

    const {
      paymentAmount, // string ou number vindo do front
      bankAccount,
      paidAt,
      ...accountFields
    } = dataToUpdate;

    return await this.prisma.$transaction(async (prisma) => {
      const updatedAccount = await prisma.accountPayable.update({
        where: { id },
        data: accountFields,
      });

      const paymentsSoFar = await prisma.payment.findMany({
        where: { accountId: id },
      });
      let totalPaid = paymentsSoFar.reduce((sum, p) => sum + (p.amount ?? 0), 0);

      const paymentDate = paidAt
        ? new Date(paidAt)
        : new Date();

      if (paymentAmount) {
        const raw = typeof paymentAmount === 'string'
          ? paymentAmount.replace(',', '.')
          : String(paymentAmount);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0) {
          const exists = await prisma.payment.findFirst({
            where: {
              accountId: id,
              amount: parsed,
              paidAt: paymentDate,
            },
          });
          if (!exists) {
            await prisma.payment.create({
              data: {
                accountId: id,
                paidAt: paymentDate,
                amount: parsed,
                bankAccount: bankAccount ?? null,
              },
            });
            totalPaid += parsed;
          }
        }
      }
      else if (
        prevStatus !== 'PAGO' &&
        updateAccountsPayableDto.status === 'PAGO'
      ) {
        const remaining = updatedAccount.value - totalPaid;
        if (remaining > 0) {
          const exists = await prisma.payment.findFirst({
            where: {
              accountId: id,
              amount: remaining,
            },
          });
          if (!exists) {
            await prisma.payment.create({
              data: {
                accountId: id,
                paidAt: paymentDate,
                amount: remaining,
                bankAccount: bankAccount ?? null,
              },
            });
            totalPaid += remaining;
          }
        }
      }

      if (totalPaid >= updatedAccount.value && updatedAccount.status !== 'PAGO') {
        await prisma.accountPayable.update({
          where: { id },
          data: { status: 'PAGO' },
        });
      }

      if (
        existingAccount.installmentType === 'PARCELADO' &&
        existingAccount.currentInstallment! < existingAccount.installments! &&
        totalPaid >= updatedAccount.value
      ) {
        const nextDue = new Date(existingAccount.dueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        nextDue.setHours(0, 0, 0, 0);

        await prisma.accountPayable.create({
          data: {
            name: existingAccount.name,
            category: existingAccount.category,
            value: existingAccount.value,
            dueDate: nextDue,
            status: 'A_PAGAR',
            installmentType: 'PARCELADO',
            installments: existingAccount.installments,
            currentInstallment: existingAccount.currentInstallment! + 1,
          },
        });
      }

      return updatedAccount;
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.payment.deleteMany({
      where: { accountId: id },
    });

    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }

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
