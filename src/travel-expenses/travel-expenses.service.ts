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

// DTOs simples (evitamos criar novos arquivos agora)
type CreateAdvanceDto = {
  amount: number;
  issuedAt?: string;
  method?: string;
  notes?: string;
};
type CreateReturnDto = {
  amount: number;
  returnedAt?: string;
  method?: string;
  notes?: string;
};

@Injectable()
export class TravelExpensesService {
  constructor(private prisma: PrismaService) { }

  // ====== NOVO: método principal de criação ======
  async createExpense(dto: CreateTravelExpenseDto) {
    const created = await this.prisma.travelExpense.create({
      data: {
        employeeName: dto.employeeName ?? null,
        department: dto.department ?? null,
        description: dto.description ?? null,
        category: dto.category ?? 'OUTROS',
        city: dto.city ?? null,
        state: dto.state ?? null,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
        currency: dto.currency ?? 'BRL',
        amountCents: toCents(dto.amount),
        receiptUrl: dto.receiptUrl ?? null,
        status: 'PENDENTE',
        reimbursedCents: 0,
      },
    });

    return {
      ...created,
      amount: fromCents(created.amountCents),
      reimbursedAmount: fromCents(created.reimbursedCents),
    };
  }

  // ====== Alias para compatibilidade com o controller ======
  async create(dto: CreateTravelExpenseDto) {
    return this.createExpense(dto);
  }

  // ===== Helpers de totais e status =====
  private async getTotals(
    expenseId: number,
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    // Usamos Promise.all para funcionar tanto com PrismaService quanto com TransactionClient
    const [advSum, retSum, exp] = await Promise.all([
      (tx as any).travelAdvance.aggregate({
        where: { travelExpenseId: expenseId },
        _sum: { amountCents: true },
      }),
      (tx as any).travelReturn.aggregate({
        where: { travelExpenseId: expenseId },
        _sum: { amountCents: true },
      }),
      (tx as any).travelExpense.findUnique({ where: { id: expenseId } }),
    ]);

    if (!exp) throw new NotFoundException('Despesa não encontrada');

    const advances = advSum._sum.amountCents ?? 0;
    const returns = retSum._sum.amountCents ?? 0;

    return {
      amountCents: exp.amountCents,
      reimbursedCents: exp.reimbursedCents,
      advancesCents: advances,
      returnsCents: returns,
      status: exp.status,
    };
  }

  private computeStatus(
    amountCents: number,
    reimbursedCents: number,
    advancesCents: number,
    returnsCents: number,
  ) {
    const dueToEmployee = amountCents - advancesCents - reimbursedCents;
    const expectedReturn = dueToEmployee < 0 ? -dueToEmployee : 0;
    const outstandingReturn = Math.max(0, expectedReturn - returnsCents);

    if (dueToEmployee === 0 && outstandingReturn === 0) return 'REEMBOLSADO';
    if (reimbursedCents === 0 && advancesCents === 0 && returnsCents === 0) return 'PENDENTE';
    return 'PARCIAL';
  }

  private async recalcAndUpdateStatus(
    expenseId: number,
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const t = await this.getTotals(expenseId, tx);
    const status = this.computeStatus(
      t.amountCents,
      t.reimbursedCents,
      t.advancesCents,
      t.returnsCents,
    );
    await (tx as any).travelExpense.update({
      where: { id: expenseId },
      data: { status },
    });
    return status;
  }

  // Listar despesas (com totais de adiantamentos/devoluções agregados)
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

    // Filtro de data (corrigido)
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

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { employeeName: { contains: search } },
        { department: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
      ];
    }

    // 1) Busca pagina de despesas + total
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.travelExpense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.travelExpense.count({ where }),
    ]);

    if (rows.length === 0) {
      return { data: [], total };
    }

    const ids = rows.map(r => r.id);

    // 2) Agrega adiantamentos e devoluções por despesa (SEM groupBy: somamos em memória)
    const [advList, retList] = await this.prisma.$transaction([
      this.prisma.travelAdvance.findMany({
        where: { travelExpenseId: { in: ids } },
        select: { travelExpenseId: true, amountCents: true },
      }),
      this.prisma.travelReturn.findMany({
        where: { travelExpenseId: { in: ids } },
        select: { travelExpenseId: true, amountCents: true },
      }),
    ]);

    const advMap = new Map<number, number>();
    for (const a of advList) {
      advMap.set(a.travelExpenseId, (advMap.get(a.travelExpenseId) ?? 0) + (a.amountCents ?? 0));
    }

    const retMap = new Map<number, number>();
    for (const r of retList) {
      retMap.set(r.travelExpenseId, (retMap.get(r.travelExpenseId) ?? 0) + (r.amountCents ?? 0));
    }

    // 3) Monta resposta com os novos campos
    const data = rows.map(r => {
      const advancesCents = advMap.get(r.id) ?? 0;
      const returnsCents = retMap.get(r.id) ?? 0;

      return {
        ...r,
        amount: fromCents(r.amountCents),
        reimbursedAmount: fromCents(r.reimbursedCents),
        advancesAmount: fromCents(advancesCents),
        returnsAmount: fromCents(returnsCents),
      };
    });

    return { data, total };
  }

  // ===== Buscar despesa =====
  async findOne(id: number) {
    const r = await this.prisma.travelExpense.findUnique({
      where: { id },
      include: {
        reimbursements: { orderBy: { reimbursedAt: 'desc' } },
        advances: true,
        returns: true,
      },
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
      advances: r.advances.map((a) => ({ ...a, amount: fromCents(a.amountCents) })),
      returns: r.returns.map((t) => ({ ...t, amount: fromCents(t.amountCents) })),
    };
  }

  // ===== Atualizar despesa =====
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
        amountCents: dto.amount !== undefined ? toCents(dto.amount) : undefined,
        receiptUrl: dto.receiptUrl ?? undefined,
        status: dto.status ?? undefined, // ainda permitimos alteração manual, se necessário
      },
    });

    // Recalcula status considerando advances/returns atuais
    await this.recalcAndUpdateStatus(id);

    return {
      ...updated,
      amount: fromCents(updated.amountCents),
      reimbursedAmount: fromCents(updated.reimbursedCents),
    };
  }

  // ===== Excluir despesa =====
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.travelExpense.delete({ where: { id } });
    return { deleted: true };
  }

  // ===== Reembolsos =====
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

  async addReimbursement(
    expenseId: number,
    dto: CreateReimbursementDto & CreateReimbursementShape,
  ) {
    const exp = await this.ensureExists(expenseId);
    const amountCents = toCents(dto.amount);

    if (amountCents <= 0)
      throw new BadRequestException('Valor do reembolso deve ser maior que zero');

    // teto de reembolso considera adiantamentos
    const totals = await this.getTotals(expenseId);
    const maxReembolso = Math.max(
      0,
      totals.amountCents - totals.advancesCents - totals.reimbursedCents,
    );
    if (amountCents > maxReembolso) {
      throw new BadRequestException(
        `Valor excede o restante a reembolsar (restante: ${fromCents(maxReembolso)})`,
      );
    }

    const reimbursement = await this.prisma.$transaction(async (tx) => {
      const created = await (tx as any).travelReimbursement.create({
        data: {
          travelExpenseId: expenseId,
          amountCents,
          reimbursedAt: dto.reimbursedAt ? new Date(dto.reimbursedAt) : new Date(),
          bankAccount: dto.bankAccount ?? null,
          notes: dto.notes ?? null,
        },
      });

      // Atualiza o espelho reimbursedCents
      await (tx as any).travelExpense.update({
        where: { id: expenseId },
        data: { reimbursedCents: exp.reimbursedCents + amountCents },
      });

      // Recalcula status
      await this.recalcAndUpdateStatus(expenseId, tx);

      return created;
    });

    return { ...reimbursement, amount: fromCents(reimbursement.amountCents) };
  }

  async deleteReimbursement(expenseId: number, reimbursementId: number) {
    await this.ensureExists(expenseId);
    const rb = await this.prisma.travelReimbursement.findUnique({
      where: { id: reimbursementId },
    });
    if (!rb || rb.travelExpenseId !== expenseId)
      throw new NotFoundException('Reembolso não encontrado');

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).travelReimbursement.delete({ where: { id: reimbursementId } });

      const exp = await (tx as any).travelExpense.findUnique({ where: { id: expenseId } });
      const newReimbursed = Math.max(0, (exp?.reimbursedCents ?? 0) - rb.amountCents);

      await (tx as any).travelExpense.update({
        where: { id: expenseId },
        data: { reimbursedCents: newReimbursed },
      });

      // Recalcula status (agora considerando advances/returns)
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ===== Adiantamentos =====
  async listAdvances(expenseId: number) {
    await this.ensureExists(expenseId);
    const list = await this.prisma.travelAdvance.findMany({
      where: { travelExpenseId: expenseId },
      orderBy: { issuedAt: 'desc' },
    });
    return list.map((a) => ({ ...a, amount: fromCents(a.amountCents) }));
  }

  async addAdvance(expenseId: number, dto: CreateAdvanceDto) {
    await this.ensureExists(expenseId);
    const amountCents = toCents(dto.amount);
    if (amountCents <= 0) throw new BadRequestException('Valor do adiantamento deve ser maior que zero');

    const created = await this.prisma.$transaction(async (tx) => {
      const adv = await (tx as any).travelAdvance.create({
        data: {
          travelExpenseId: expenseId,
          amountCents,
          issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
          method: dto.method ?? null,
          notes: dto.notes ?? null,
        },
      });

      await this.recalcAndUpdateStatus(expenseId, tx);
      return adv;
    });

    return { ...created, amount: fromCents(created.amountCents) };
  }

  async deleteAdvance(expenseId: number, advanceId: number) {
    await this.ensureExists(expenseId);
    const adv = await this.prisma.travelAdvance.findUnique({ where: { id: advanceId } });
    if (!adv || adv.travelExpenseId !== expenseId) throw new NotFoundException('Adiantamento não encontrado');

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).travelAdvance.delete({ where: { id: advanceId } });
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ===== Devoluções =====
  async listReturns(expenseId: number) {
    await this.ensureExists(expenseId);
    const list = await this.prisma.travelReturn.findMany({
      where: { travelExpenseId: expenseId },
      orderBy: { returnedAt: 'desc' },
    });
    return list.map((r) => ({ ...r, amount: fromCents(r.amountCents) }));
  }

  async addReturn(expenseId: number, dto: CreateReturnDto) {
    await this.ensureExists(expenseId);
    const amountCents = toCents(dto.amount);
    if (amountCents <= 0) throw new BadRequestException('Valor da devolução deve ser maior que zero');

    const created = await this.prisma.$transaction(async (tx) => {
      const ret = await (tx as any).travelReturn.create({
        data: {
          travelExpenseId: expenseId,
          amountCents,
          returnedAt: dto.returnedAt ? new Date(dto.returnedAt) : new Date(),
          method: dto.method ?? null,
          notes: dto.notes ?? null,
        },
      });

      await this.recalcAndUpdateStatus(expenseId, tx);
      return ret;
    });

    return { ...created, amount: fromCents(created.amountCents) };
  }

  async deleteReturn(expenseId: number, returnId: number) {
    await this.ensureExists(expenseId);
    const ret = await this.prisma.travelReturn.findUnique({ where: { id: returnId } });
    if (!ret || ret.travelExpenseId !== expenseId) throw new NotFoundException('Devolução não encontrada');

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).travelReturn.delete({ where: { id: returnId } });
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ===== util =====
  private async ensureExists(id: number) {
    const exp = await this.prisma.travelExpense.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Despesa não encontrada');
    return exp;
  }
}
