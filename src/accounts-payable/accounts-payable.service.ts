// Serviço de Contas a Pagar: regras de negócio e acesso ao Prisma
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { GetPayablesStatusQueryDto } from './dto/get-payables-status.dto';

interface FindAllAccountsParams {
  page: number;
  limit: number;
  month?: number;
  year?: number;
  status?: string;
  category?: string;
  search?: string;
}

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  // Cria uma conta a pagar (suporta única, parcelada e recorrente mensal)
  async create(createAccountsPayableDto: CreateAccountsPayableDto) {
    const { installmentType, dueDate, isRecurring, recurringUntil, installments } =
      createAccountsPayableDto;

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

    // Parcelas futuras (2..N)
    if (installmentType === 'PARCELADO' && installments && installments > 1) {
      const baseDueDate = new Date(createAccountsPayableDto.dueDate);
      const originalDay = baseDueDate.getDate();

      for (let i = 2; i <= installments; i++) {
        const nextMonth = baseDueDate.getMonth() + (i - 1);
        const nextYear = baseDueDate.getFullYear() + Math.floor(nextMonth / 12);
        const realMonth = nextMonth % 12;

        const lastDay = new Date(nextYear, realMonth + 1, 0).getDate();
        const day = Math.min(originalDay, lastDay);
        const dueDateParcela = new Date(nextYear, realMonth, day, 0, 0, 0, 0);

        await this.prisma.accountPayable.create({
          data: {
            ...createAccountsPayableDto,
            dueDate: dueDateParcela,
            currentInstallment: i,
          },
        });
      }
    }

    // Recorrência mensal
    if (isRecurring && recurringUntil) {
      const startDate = new Date(createAccountsPayableDto.dueDate);
      const endDate = new Date(recurringUntil);
      endDate.setHours(0, 0, 0, 0);

      const originalDay = startDate.getDate();

      let currentMonth = startDate.getMonth() + 1;
      let currentYear = startDate.getFullYear();

      while (true) {
        const realMonth = currentMonth % 12;
        const year = currentYear + Math.floor(currentMonth / 12);

        const lastDayOfMonth = new Date(year, realMonth + 1, 0).getDate();
        const day = Math.min(originalDay, lastDayOfMonth);
        const nextDueDate = new Date(year, realMonth, day, 0, 0, 0, 0);

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

  // Lista paginada com filtros + campos de alerta (daysToDue, alertTag)
  async findAll(params: FindAllAccountsParams) {
    const { page, limit, month, year, status, category, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountPayableWhereInput = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      where.dueDate = { gte: startDate, lte: endDate };
    } else if (year && !month) {
      const startDate = new Date(Number(year), 0, 1, 0, 0, 0, 0);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);
      where.dueDate = { gte: startDate, lte: endDate };
    }

    if (status && status !== 'TODOS') {
      where.status = status;
    }

    if (category && category !== 'TODAS') {
      where.category = category;
    }

    if (search && search.trim() !== '') {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.accountPayable.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: { payments: true },
      }),
      this.prisma.accountPayable.count({ where }),
    ]);

    const enriched = accounts.map((a) => ({
      ...a,
      ...computeAlertFields(a.status, a.dueDate),
    }));

    return { data: enriched, total };
  }

  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }

    return { ...account, ...computeAlertFields(account.status, account.dueDate) };
  }

  async findForExportDetailed(
    year: number,
    month: number,
    category?: string,
    status?: string,
  ) {
    const where: Prisma.AccountPayableWhereInput = {
      dueDate: {
        gte: new Date(year, month - 1, 1, 0, 0, 0, 0),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
      },
    };

    if (category && category !== 'TODAS') where.category = category;
    if (status && status !== 'TODOS') where.status = status;

    const accounts = await this.prisma.accountPayable.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: { payments: true },
    });

    const totals = accounts.reduce(
      (acc, a) => {
        const paidSum = (a.payments || []).reduce((s, p) => s + Number(p.amount ?? 0), 0);
        acc.total += Number(a.value);
        acc.paid += paidSum;
        acc.pending += Math.max(Number(a.value) - paidSum, 0);
        acc.count += 1;
        return acc;
      },
      { count: 0, total: 0, paid: 0, pending: 0 },
    );

    return { accounts, totals };
  }

  // Relatório mensal agregado
  async getMonthlyReport(year?: string, category?: string, status?: string, page = 1, limit = 12) {
    const where: Prisma.AccountPayableWhereInput = {};
    if (year) {
      where.dueDate = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    }
    if (category && category !== 'TODAS') where.category = category;
    if (status && status !== 'TODOS') where.status = status;

    const accounts = await this.prisma.accountPayable.findMany({
      where,
      include: { payments: true },
      orderBy: { dueDate: 'asc' },
    });

    const monthsMap = new Map<string, any>();
    accounts.forEach((account) => {
      const month = format(new Date(account.dueDate), 'yyyy-MM');
      if (!monthsMap.has(month)) {
        monthsMap.set(month, { month, total: 0, paid: 0, pending: 0, count: 0 });
      }
      const data = monthsMap.get(month);

      data.total += Number(account.value);
      data.count += 1;

      const paidSum = account.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      data.paid += paidSum;
      data.pending += Math.max(Number(account.value) - paidSum, 0);

      monthsMap.set(month, data);
    });

    const allMonths = Array.from(monthsMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    const total = allMonths.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Number(page) || 1;
    const start = (currentPage - 1) * limit;
    const paginatedData = allMonths.slice(start, start + limit);

    return { data: paginatedData, total, totalPages, currentPage };
  }

  // Atualiza + pagamentos + próxima parcela (parcelado)
  async update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto) {
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

    const userExplicitStatusProvided =
      typeof updateAccountsPayableDto.status !== 'undefined';
    const desiredStatus = updateAccountsPayableDto.status;

    const { paymentAmount, bankAccount, paidAt, ...accountFields } = dataToUpdate;

    return await this.prisma.$transaction(async (prisma) => {
      let updatedAccount = await prisma.accountPayable.update({
        where: { id },
        data: accountFields,
      });

      const paymentsSoFar = await prisma.payment.findMany({ where: { accountId: id } });
      let totalPaid = paymentsSoFar.reduce((sum, p) => sum + (p.amount ?? 0), 0);

      const paymentDate = paidAt ? new Date(paidAt) : new Date();

      if (paymentAmount) {
        const raw =
          typeof paymentAmount === 'string'
            ? paymentAmount.replace(',', '.')
            : String(paymentAmount);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0) {
          const exists = await prisma.payment.findFirst({
            where: { accountId: id, amount: parsed, paidAt: paymentDate },
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
      } else if (prevStatus !== 'PAGO' && desiredStatus === 'PAGO') {
        const remaining = updatedAccount.value - totalPaid;
        if (remaining > 0) {
          const exists = await prisma.payment.findFirst({
            where: { accountId: id, amount: remaining },
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

      if (
        (!userExplicitStatusProvided || desiredStatus === 'PAGO') &&
        totalPaid >= updatedAccount.value &&
        updatedAccount.status !== 'PAGO'
      ) {
        updatedAccount = await prisma.accountPayable.update({
          where: { id },
          data: { status: 'PAGO' },
        });
      }

      const finalStatus = updatedAccount.status;
      if (
        finalStatus === 'PAGO' &&
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
            value: updatedAccount.value,
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
    await this.prisma.payment.deleteMany({ where: { accountId: id } });
    return this.prisma.accountPayable.delete({ where: { id } });
  }

  async registerPayment(accountId: number, paidAt: Date) {
    const account = await this.prisma.accountPayable.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Conta a pagar não encontrada.');

    if (account.status !== 'PAGO') {
      await this.prisma.accountPayable.update({ where: { id: accountId }, data: { status: 'PAGO' } });
    }

    return this.prisma.payment.create({ data: { accountId, paidAt } });
  }

  // -----------------------------
  // (NOVO) /reports/status (mantido)
  // -----------------------------
  async getPayablesStatus(query: GetPayablesStatusQueryDto) {
    const now = new Date();
    const hasPeriod = Boolean(query.from && query.to);

    const baseDateFilter: Prisma.AccountPayableWhereInput | undefined = hasPeriod
      ? {
        dueDate: {
          gte: startOfDay(parseYMDLocal(query.from!)),
          lte: endOfDay(parseYMDLocal(query.to!)),
        },
      }
      : undefined;

    const statusFilter =
      query.status && query.status !== 'TODOS' ? { status: query.status } : undefined;

    const categoryFilter =
      query.category && query.category !== 'TODAS' ? { category: query.category } : undefined;

    const commonWhere: Prisma.AccountPayableWhereInput = {
      ...(baseDateFilter ?? {}),
      ...(statusFilter ?? {}),
      ...(categoryFilter ?? {}),
    };

    const vencidoWhere: Prisma.AccountPayableWhereInput = {
      AND: [
        commonWhere,
        {
          OR: [
            { status: 'VENCIDO' },
            { AND: [{ status: { not: 'PAGO' } }, { dueDate: { lt: startOfDay(now) } }] },
          ],
        },
      ],
    };

    const abertoWhere: Prisma.AccountPayableWhereInput = {
      AND: [
        commonWhere,
        { status: { not: 'PAGO' } },
        { status: { not: 'VENCIDO' } },
        { dueDate: { gte: startOfDay(now) } },
      ],
    };

    const pagoWhere: Prisma.AccountPayableWhereInput = {
      AND: [commonWhere, { status: 'PAGO' }],
    };

    const due7Where: Prisma.AccountPayableWhereInput = {
      AND: [
        commonWhere,
        { status: { not: 'PAGO' } },
        { dueDate: { gte: startOfDay(now), lte: endOfDay(addDays(now, 7)) } },
      ],
    };

    const due3Where: Prisma.AccountPayableWhereInput = {
      AND: [
        commonWhere,
        { status: { not: 'PAGO' } },
        { dueDate: { gte: startOfDay(now), lte: endOfDay(addDays(now, 3)) } },
      ],
    };

    const agg = (where: Prisma.AccountPayableWhereInput) =>
      this.prisma.accountPayable.aggregate({
        where,
        _count: { _all: true },
        _sum: { value: true },
      });

    const [vencidoAgg, abertoAgg, pagoAgg, totalAgg, due7Agg, due3Agg] = await Promise.all([
      agg(vencidoWhere),
      agg(abertoWhere),
      agg(pagoWhere),
      agg(commonWhere),
      agg(due7Where),
      agg(due3Where),
    ]);

    return {
      period: hasPeriod
        ? {
          from: startOfDay(parseYMDLocal(query.from!)).toISOString().slice(0, 10),
          to: endOfDay(parseYMDLocal(query.to!)).toISOString().slice(0, 10),
        }
        : null,
      totals: {
        count: totalAgg._count?._all ?? 0,
        amount: Number(totalAgg._sum?.value ?? 0),
      },
      buckets: {
        VENCIDO: {
          count: vencidoAgg._count?._all ?? 0,
          amount: Number(vencidoAgg._sum?.value ?? 0),
        },
        ABERTO: {
          count: abertoAgg._count?._all ?? 0,
          amount: Number(abertoAgg._sum?.value ?? 0),
        },
        PAGO: {
          count: pagoAgg._count?._all ?? 0,
          amount: Number(pagoAgg._sum?.value ?? 0),
        },
        DUE_7: {
          count: due7Agg._count?._all ?? 0,
          amount: Number(due7Agg._sum?.value ?? 0),
        },
        DUE_3: {
          count: due3Agg._count?._all ?? 0,
          amount: Number(due3Agg._sum?.value ?? 0),
        },
      },
      currency: 'BRL',
      generatedAt: new Date().toISOString(),
    };
  }

  // -----------------------------
  // (NOVO) /summary (formato pedido)
  // -----------------------------
  async getSummary(query: {
    from?: string;
    to?: string;
    status?: string;
    category?: string;
    search?: string;
  }) {
    const now = new Date();

    // período (opcional)
    const baseDateFilter: Prisma.AccountPayableWhereInput | undefined =
      query.from && query.to
        ? {
          dueDate: {
            gte: startOfDay(parseYMDLocal(query.from)),
            lte: endOfDay(parseYMDLocal(query.to)),
          },
        }
        : undefined;

    // filtros iguais da listagem
    const whereFilters: Prisma.AccountPayableWhereInput = {
      ...(baseDateFilter ?? {}),
    };

    if (query.status && query.status !== 'TODOS') {
      whereFilters.status = query.status;
    }
    if (query.category && query.category !== 'TODAS') {
      whereFilters.category = query.category;
    }
    if (query.search && query.search.trim() !== '') {
      whereFilters.name = { contains: query.search.trim(), mode: 'insensitive' };
    }

    // buckets
    const overdueWhere: Prisma.AccountPayableWhereInput = {
      AND: [
        whereFilters,
        {
          OR: [
            { status: 'VENCIDO' },
            { AND: [{ status: { not: 'PAGO' } }, { dueDate: { lt: startOfDay(now) } }] },
          ],
        },
      ],
    };

    const due7Where: Prisma.AccountPayableWhereInput = {
      AND: [
        whereFilters,
        { status: { not: 'PAGO' } },
        { dueDate: { gte: startOfDay(now), lte: endOfDay(addDays(now, 7)) } },
      ],
    };

    const due3Where: Prisma.AccountPayableWhereInput = {
      AND: [
        whereFilters,
        { status: { not: 'PAGO' } },
        { dueDate: { gte: startOfDay(now), lte: endOfDay(addDays(now, 3)) } },
      ],
    };

    // "open" = não pagos e não vencidos (>= hoje)
    const openWhere: Prisma.AccountPayableWhereInput = {
      AND: [
        whereFilters,
        { status: { not: 'PAGO' } },
        { status: { not: 'VENCIDO' } },
        { dueDate: { gte: startOfDay(now) } },
      ],
    };

    const paidWhere: Prisma.AccountPayableWhereInput = {
      AND: [whereFilters, { status: 'PAGO' }],
    };

    const agg = (where: Prisma.AccountPayableWhereInput) =>
      this.prisma.accountPayable.aggregate({
        where,
        _count: { _all: true },
        _sum: { value: true },
      });

    const [overdue, due7, due3, open, paid] = await Promise.all([
      agg(overdueWhere),
      agg(due7Where),
      agg(due3Where),
      agg(openWhere),
      agg(paidWhere),
    ]);

    const toResp = (a: any) => ({
      count: a._count?._all ?? 0,
      amount: Number(a._sum?.value ?? 0),
    });

    return {
      overdue: toResp(overdue),
      due7: toResp(due7),
      due3: toResp(due3),
      open: toResp(open),
      paid: toResp(paid),
      currency: 'BRL',
      generatedAt: new Date().toISOString(),
    };
  }
}

/* =========================
   Utils de data
========================= */
function parseYMDLocal(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d); // local midnight
}
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/* =========================
   Util de ALERTAS por item
========================= */
function computeAlertFields(status: string, dueDate: Date | string) {
  const due = new Date(dueDate);
  const today = startOfDay(new Date());
  const diffMs = startOfDay(due).getTime() - today.getTime();
  const daysToDue = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let alertTag: 'VENCIDO' | 'D-3' | 'D-7' | null = null;

  if (status === 'PAGO') {
    alertTag = null;
  } else if (daysToDue < 0) {
    alertTag = 'VENCIDO';
  } else if (daysToDue <= 3) {
    alertTag = 'D-3';
  } else if (daysToDue <= 7) {
    alertTag = 'D-7';
  }

  return { daysToDue, alertTag };
}
