import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { Prisma } from '@prisma/client';

const toCents = (n: number) => Math.round(Number(n) * 100);
const fromCents = (c: number) => Number((c / 100).toFixed(2));

// Blindagem contra caches do TS/DTO antigo
type CreateReimbursementShape = {
  amount: number;
  reimbursedAt?: string;
  bankAccount?: string;
  notes?: string;
};

@Injectable()
export class TravelExpensesService {
  constructor(private prisma: PrismaService) { }

  // Criar despesa
  async create(dto: CreateTravelExpenseDto) {
    const created = await this.prisma.travelExpense.create({
      data: {
        employeeName: dto.employeeName ?? null,
        department: dto.department ?? null,
        description: dto.description ?? null,
        category: dto.category ?? 'OUTROS',
        city: dto.city ?? null,
        state: dto.state ?? null,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : null,
        currency: dto.currency ?? 'BRL',
        amountCents: toCents(dto.amount),
        receiptUrl: dto.receiptUrl ?? null,
      },
    });

    return {
      ...created,
      amount: fromCents(created.amountCents),
      reimbursedAmount: fromCents(created.reimbursedCents),
    };
  }

  // Listar despesas (parâmetro opcional para eliminar "Expected 0 arguments")
  async findAll(params: {
    page?: number;
    pageSize?: number;
    month?: number;
    year?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {}) {
    const {
      page = 1,
      pageSize = 10,
      month,
      year,
      status,
      category,
      search,
    } = params;

    const where: Prisma.TravelExpenseWhereInput = {};

    // ========= CORREÇÃO DO FILTRO DE DATA =========
    // - (ano && mês): filtra o mês específico do ano informado
    // - (ano && !mês): filtra o ano inteiro
    // - (!ano && mês): filtra o mês do ano atual
    if (year && month) {
      const y = Number(year);
      const m = Number(month) - 1;
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      where.expenseDate = { gte: start, lt: end };
    } else if (year && !month) {
      const y = Number(year);
      const start = new Date(y, 0, 1);
      const end = new Date(y + 1, 0, 1);
      where.expenseDate = { gte: start, lt: end };
    } else if (!year && month) {
      const y = new Date().getFullYear();
      const m = Number(month) - 1;
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      where.expenseDate = { gte: start, lt: end };
    }
    // ==============================================

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      // Removido "mode: 'insensitive'" para compatibilidade com seu client atual.
      where.OR = [
        { employeeName: { contains: search } },
        { department: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.travelExpense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.travelExpense.count({ where }),
    ]);

    return {
      data: rows.map((r) => ({
        ...r,
        amount: fromCents(r.amountCents),
        reimbursedAmount: fromCents(r.reimbursedCents),
      })),
      total,
    };
  }

  // Buscar despesa
  async findOne(id: number) {
    const r = await this.prisma.travelExpense.findUnique({
      where: { id },
      include: { reimbursements: { orderBy: { reimbursedAt: 'desc' } } },
    });
    if (!r) throw new NotFoundException('Despesa não encontrada');

    return {
      ...r,
      amount: fromCents(r.amountCents),
      reimbursedAmount: fromCents(r.reimbursedCents),
      reimbursements: r.reimbursements.map((x) => ({
        ...x,
        amount: fromCents(x.amountCents),
      })),
    };
  }

  // Atualizar despesa
  async update(id: number, dto: UpdateTravelExpenseDto) {
    await this.ensureExists(id);

    const updated = await this.prisma.travelExpense.update({
      where: { id },
      data: {
        employeeName: dto.employeeName ?? undefined,
        department: dto.department ?? undefined,
        description: dto.description ?? undefined,
        category: dto.category ?? undefined,
        city: dto.city ?? undefined,
        state: dto.state ?? undefined,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        currency: dto.currency ?? undefined,
        amountCents:
          dto.amount !== undefined ? toCents(dto.amount) : undefined,
        receiptUrl: dto.receiptUrl ?? undefined,
        status: dto.status ?? undefined,
      },
    });

    return {
      ...updated,
      amount: fromCents(updated.amountCents),
      reimbursedAmount: fromCents(updated.reimbursedCents),
    };
  }

  // Excluir despesa
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.travelExpense.delete({ where: { id } });
    return { deleted: true };
  }

  // Listar reembolsos
  async listReimbursements(expenseId: number) {
    await this.ensureExists(expenseId);
    const list = await this.prisma.travelReimbursement.findMany({
      where: { travelExpenseId: expenseId },
      orderBy: { reimbursedAt: 'desc' },
    });
    return list.map((r) => ({
      ...r,
      amount: fromCents(r.amountCents),
    }));
  }

  // Criar reembolso
  async addReimbursement(
    expenseId: number,
    dto: CreateReimbursementDto & CreateReimbursementShape,
  ) {
    const exp = await this.ensureExists(expenseId);
    const amountCents = toCents(dto.amount);

    if (amountCents <= 0)
      throw new BadRequestException(
        'Valor do reembolso deve ser maior que zero',
      );

    const remaining = exp.amountCents - exp.reimbursedCents;
    if (amountCents > remaining) {
      throw new BadRequestException(
        `Valor excede o restante a reembolsar (restante: ${fromCents(
          remaining,
        )})`,
      );
    }

    const reimbursement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.travelReimbursement.create({
        data: {
          travelExpenseId: expenseId,
          amountCents,
          reimbursedAt: dto.reimbursedAt
            ? new Date(dto.reimbursedAt)
            : new Date(),
          bankAccount: dto.bankAccount ?? null,
          notes: dto.notes ?? null,
        },
      });

      const newReimbursed = exp.reimbursedCents + amountCents;
      const status =
        newReimbursed === exp.amountCents
          ? 'REEMBOLSADO'
          : newReimbursed > 0
            ? 'PARCIAL'
            : 'PENDENTE';

      await tx.travelExpense.update({
        where: { id: expenseId },
        data: {
          reimbursedCents: newReimbursed,
          status,
        },
      });

      return created;
    });

    return { ...reimbursement, amount: fromCents(reimbursement.amountCents) };
  }

  // Excluir reembolso
  async deleteReimbursement(expenseId: number, reimbursementId: number) {
    await this.ensureExists(expenseId);
    const rb = await this.prisma.travelReimbursement.findUnique({
      where: { id: reimbursementId },
    });
    if (!rb || rb.travelExpenseId !== expenseId)
      throw new NotFoundException('Reembolso não encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.travelReimbursement.delete({ where: { id: reimbursementId } });

      const exp = await tx.travelExpense.findUnique({
        where: { id: expenseId },
      });
      const newReimbursed = Math.max(
        0,
        exp!.reimbursedCents - rb.amountCents,
      );
      const status =
        newReimbursed === 0
          ? 'PENDENTE'
          : newReimbursed === exp!.amountCents
            ? 'REEMBOLSADO'
            : 'PARCIAL';

      await tx.travelExpense.update({
        where: { id: expenseId },
        data: {
          reimbursedCents: newReimbursed,
          status,
        },
      });
    });

    return { deleted: true };
  }

  private async ensureExists(id: number) {
    const exp = await this.prisma.travelExpense.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Despesa não encontrada');
    return exp;
  }
}
