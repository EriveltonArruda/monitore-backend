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
import { Parser as Json2CsvParser } from 'json2csv';
import PDFDocument from 'pdfkit';

// ====================== Helpers de dinheiro ======================
const fromCents = (c: number) => Number((c / 100).toFixed(2));

// Aceita string "1.234,56", "1234.56", número, etc.
const toCentsSmart = (val: string | number): number => {
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) throw new BadRequestException('Valor inválido');
    return Math.round(val * 100);
  }
  if (typeof val === 'string') {
    const norm = val.replace(/\./g, '').replace(',', '.').trim();
    const num = Number(norm);
    if (Number.isNaN(num)) throw new BadRequestException('Valor inválido');
    return Math.round(num * 100);
  }
  throw new BadRequestException('Valor inválido');
};

// Blindagem contra caches do TS/DTO antigo
type CreateReimbursementShape = {
  amount: number | string;
  reimbursedAt?: string;
  bankAccount?: string;
  notes?: string;
};

// DTOs simples (evitamos criar novos arquivos agora)
type CreateAdvanceDto = {
  amount: number | string;
  issuedAt?: string;
  method?: string;
  notes?: string;
};
type CreateReturnDto = {
  amount: number | string;
  returnedAt?: string;
  method?: string;
  notes?: string;
};

@Injectable()
export class TravelExpensesService {
  constructor(private prisma: PrismaService) { }

  // ====================== CREATE DESPESA ======================
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
        amountCents: toCentsSmart(dto.amount as any),
        receiptUrl: dto.receiptUrl ?? null,
        status: 'PENDENTE',
        // este campo será mantido sincronizado via recálculo (agregação de reimbursements)
        reimbursedCents: 0,
      },
    });

    return {
      ...created,
      amount: fromCents(created.amountCents),
      reimbursedAmount: fromCents(created.reimbursedCents),
    };
  }

  // Alias compatível com controller atual
  async create(dto: CreateTravelExpenseDto) {
    return this.createExpense(dto);
  }

  // ====================== HELPERS: Totais, Balanço e Status ======================
  private async getTotals(
    expenseId: number,
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const [advSum, retSum, reiSum, exp] = await Promise.all([
      (tx as any).travelAdvance.aggregate({
        where: { travelExpenseId: expenseId },
        _sum: { amountCents: true },
      }),
      (tx as any).travelReturn.aggregate({
        where: { travelExpenseId: expenseId },
        _sum: { amountCents: true },
      }),
      (tx as any).travelReimbursement.aggregate({
        where: { travelExpenseId: expenseId },
        _sum: { amountCents: true },
      }),
      (tx as any).travelExpense.findUnique({ where: { id: expenseId } }),
    ]);

    if (!exp) throw new NotFoundException('Despesa não encontrada');

    const advancesCents = advSum._sum.amountCents ?? 0;
    const returnsCents = retSum._sum.amountCents ?? 0;
    const reimbursedCentsAgg = reiSum._sum.amountCents ?? 0;

    return {
      amountCents: exp.amountCents,
      reimbursedCentsAgg,
      advancesCents,
      returnsCents,
      status: exp.status,
    };
  }

  private round2c(n: number) {
    // já trabalhamos em centavos; manter arredondamento inteiro
    return Math.round(n);
  }

  // saldo do ponto de vista de "fechar" o relatório:
  // total - adiantado - reembolsado + devolvido
  private computeBalanceCents(
    amountCents: number,
    reimbursedCents: number,
    advancesCents: number,
    returnsCents: number,
  ) {
    return this.round2c(amountCents - advancesCents - reimbursedCents + returnsCents);
  }

  private computeStatusByBalance(
    balanceCents: number,
  ): 'PENDENTE' | 'PARCIAL' | 'REEMBOLSADO' {
    if (balanceCents <= 0) return 'REEMBOLSADO';
    return 'PARCIAL';
  }

  private async recalcAndUpdateStatus(
    expenseId: number,
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const t = await this.getTotals(expenseId, tx);
    const balanceCents = this.computeBalanceCents(
      t.amountCents,
      t.reimbursedCentsAgg,
      t.advancesCents,
      t.returnsCents,
    );

    let nextStatus = this.computeStatusByBalance(balanceCents);

    // sem movimentos → PENDENTE
    if (t.advancesCents === 0 && t.reimbursedCentsAgg === 0 && t.returnsCents === 0) {
      nextStatus = 'PENDENTE';
    }

    // manter reimbursedCents sincronizado com a soma real de reembolsos
    await (tx as any).travelExpense.update({
      where: { id: expenseId },
      data: {
        reimbursedCents: t.reimbursedCentsAgg,
        status: nextStatus,
      },
    });

    return nextStatus;
  }

  // ====================== WHERE builder (filtros) ======================
  private buildWhere(filters: {
    month?: number | string;
    year?: number | string;
    status?: string;
    category?: string;
    search?: string;
  }): Prisma.TravelExpenseWhereInput {
    const month =
      typeof filters.month === 'string' ? Number(filters.month) : filters.month;
    const year =
      typeof filters.year === 'string' ? Number(filters.year) : filters.year;

    const where: Prisma.TravelExpenseWhereInput = {};

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

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { employeeName: { contains: filters.search, mode: 'insensitive' } },
        { department: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  // ====================== LISTAGEM com paginação ======================
  async findAll(params: {
    page?: number;
    pageSize?: number;
    month?: number | string;
    year?: number | string;
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

    const where = this.buildWhere({ month, year, status, category, search });

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
      return {
        data: [],
        total,
        page,
        totalPages: Math.ceil(total / pageSize) || 1,
        limit: pageSize,
      };
    }

    const ids = rows.map((r) => r.id);

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
      advMap.set(
        a.travelExpenseId,
        (advMap.get(a.travelExpenseId) ?? 0) + (a.amountCents ?? 0),
      );
    }

    const retMap = new Map<number, number>();
    for (const r of retList) {
      retMap.set(
        r.travelExpenseId,
        (retMap.get(r.travelExpenseId) ?? 0) + (r.amountCents ?? 0),
      );
    }

    const data = rows.map((r) => {
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

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / pageSize) || 1,
      limit: pageSize,
    };
  }

  // ====================== EXPORT CSV ======================
  async exportCsv(filters: {
    month?: number | string;
    year?: number | string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<string> {
    const where = this.buildWhere(filters);

    const rows = await this.prisma.travelExpense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    if (rows.length === 0) {
      const parser = new Json2CsvParser();
      return parser.parse([]);
    }

    const ids = rows.map((r) => r.id);

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
      advMap.set(
        a.travelExpenseId,
        (advMap.get(a.travelExpenseId) ?? 0) + (a.amountCents ?? 0),
      );
    }

    const retMap = new Map<number, number>();
    for (const r of retList) {
      retMap.set(
        r.travelExpenseId,
        (retMap.get(r.travelExpenseId) ?? 0) + (r.amountCents ?? 0),
      );
    }

    const flat = rows.map((r) => ({
      ID: r.id,
      Funcionário: r.employeeName ?? '',
      Departamento: r.department ?? '',
      Descrição: r.description ?? '',
      Categoria: r.category ?? '',
      Cidade: r.city ?? '',
      Estado: r.state ?? '',
      Data: r.expenseDate
        ? new Date(r.expenseDate).toISOString().slice(0, 10)
        : '',
      Moeda: r.currency ?? 'BRL',
      Valor: fromCents(r.amountCents),
      Adiantado: fromCents(advMap.get(r.id) ?? 0),
      Devolvido: fromCents(retMap.get(r.id) ?? 0),
      Reembolsado: fromCents(r.reimbursedCents),
      Status: r.status,
    }));

    const parser = new Json2CsvParser();
    return parser.parse(flat);
  }

  // ====================== EXPORT PDF (simples) ======================
  async exportPdf(filters: {
    month?: number | string;
    year?: number | string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Buffer> {
    const where = this.buildWhere(filters);

    const rows = await this.prisma.travelExpense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    const ids = rows.map((r) => r.id);
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
      advMap.set(
        a.travelExpenseId,
        (advMap.get(a.travelExpenseId) ?? 0) + (a.amountCents ?? 0),
      );
    }

    const retMap = new Map<number, number>();
    for (const r of retList) {
      retMap.set(
        r.travelExpenseId,
        (retMap.get(r.travelExpenseId) ?? 0) + (r.amountCents ?? 0),
      );
    }

    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', () => { /* evita throw em stream */ });

    // Cabeçalho
    doc.fontSize(16).text('Relatório de Despesas de Viagem', { align: 'center' });
    doc.moveDown(0.5);

    const filtParts: string[] = [];
    if (filters.month) filtParts.push(`Mês: ${filters.month}`);
    if (filters.year) filtParts.push(`Ano: ${filters.year}`);
    if (filters.status) filtParts.push(`Status: ${filters.status}`);
    if (filters.category) filtParts.push(`Categoria: ${filters.category}`);
    if (filters.search) filtParts.push(`Busca: ${filters.search}`);
    if (filtParts.length) doc.fontSize(10).text(filtParts.join('  |  '), { align: 'center' });

    doc.moveDown();

    // Cabeçalho da tabela
    doc.fontSize(11).text('Func.', 40, doc.y, { continued: true, width: 150 });
    doc.text('Cat.', { continued: true, width: 90 });
    doc.text('Data', { continued: true, width: 70 });
    doc.text('Local', { continued: true, width: 110 });
    doc.text('Valor', { continued: true, width: 70 });
    doc.text('Adiant.', { continued: true, width: 70 });
    doc.text('Devolv.', { continued: true, width: 70 });
    doc.text('Reemb.', { continued: true, width: 70 });
    doc.text('Status', { width: 80 });
    doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
    doc.moveDown(0.5);

    // Linhas
    const money = (n: number) =>
      fromCents(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    rows.forEach((r) => {
      const local = [r.city, r.state].filter(Boolean).join(' / ');
      doc.fontSize(10).text(r.employeeName ?? '—', 40, doc.y, { continued: true, width: 150 });
      doc.text(r.category ?? '—', { continued: true, width: 90 });
      doc.text(r.expenseDate ? new Date(r.expenseDate).toLocaleDateString('pt-BR') : '—', {
        continued: true,
        width: 70,
      });
      doc.text(local || '—', { continued: true, width: 110 });
      doc.text(money(r.amountCents), { continued: true, width: 70 });
      doc.text(money(advMap.get(r.id) ?? 0), { continued: true, width: 70 });
      doc.text(money(retMap.get(r.id) ?? 0), { continued: true, width: 70 });
      doc.text(money(r.reimbursedCents), { continued: true, width: 70 });
      doc.text(r.status, { width: 80 });
    });

    // Totalizador simples
    const totalValor = rows.reduce((acc, r) => acc + r.amountCents, 0);
    const totalAdiant = rows.reduce((acc, r) => acc + (advMap.get(r.id) ?? 0), 0);
    const totalDevolv = rows.reduce((acc, r) => acc + (retMap.get(r.id) ?? 0), 0);
    const totalReemb = rows.reduce((acc, r) => acc + r.reimbursedCents, 0);

    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).text(
      `Totais — Valor: ${money(totalValor)}  |  Adiantado: ${money(totalAdiant)}  |  Devolvido: ${money(totalDevolv)}  |  Reembolsado: ${money(totalReemb)}`
    );

    doc.end();

    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  // ====================== FIND ONE ======================
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

  // ====================== UPDATE DESPESA ======================
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
          dto.amount !== undefined ? toCentsSmart(dto.amount as any) : undefined,
        receiptUrl: dto.receiptUrl ?? undefined,
        status: dto.status ?? undefined, // permite override manual se você usa isso; caso não, remova
      },
    });

    await this.recalcAndUpdateStatus(id);

    return {
      ...updated,
      amount: fromCents(updated.amountCents),
      reimbursedAmount: fromCents(updated.reimbursedCents),
    };
  }

  // ====================== DELETE DESPESA ======================
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.travelExpense.delete({ where: { id } });
    return { deleted: true };
  }

  // ====================== REEMBOLSOS ======================
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
    await this.ensureExists(expenseId);

    const amountCents = toCentsSmart(dto.amount as any);
    if (amountCents <= 0)
      throw new BadRequestException('Valor do reembolso deve ser maior que zero');

    // validação: não exceder restante a reembolsar (sem considerar devoluções para o "restante a reembolsar")
    const totalsBefore = await this.getTotals(expenseId);
    const maxReembolso = Math.max(
      0,
      totalsBefore.amountCents - totalsBefore.advancesCents - totalsBefore.reimbursedCentsAgg,
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

      // NÃO somar manualmente em travelExpense.reimbursedCents; recálculo sincroniza
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
      // NÃO decrementar manualmente; recálculo sincroniza
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ====================== ADIANTAMENTOS ======================
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
    const amountCents = toCentsSmart(dto.amount as any);
    if (amountCents <= 0)
      throw new BadRequestException('Valor do adiantamento deve ser maior que zero');

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
    if (!adv || adv.travelExpenseId !== expenseId)
      throw new NotFoundException('Adiantamento não encontrado');

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).travelAdvance.delete({ where: { id: advanceId } });
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ====================== DEVOLUÇÕES ======================
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
    const amountCents = toCentsSmart(dto.amount as any);
    if (amountCents <= 0)
      throw new BadRequestException('Valor da devolução deve ser maior que zero');

    // devolução máxima esperada:
    // expectedReturn = max(0, advances - (amount - reimbursed))
    // outstandingReturn = max(0, expectedReturn - returns)
    const totals = await this.getTotals(expenseId);
    const expectedReturn = Math.max(
      0,
      totals.advancesCents - (totals.amountCents - totals.reimbursedCentsAgg),
    );
    const outstandingReturn = Math.max(0, expectedReturn - totals.returnsCents);

    if (amountCents > outstandingReturn) {
      throw new BadRequestException(
        `Valor excede a devolução esperada (restante: ${fromCents(outstandingReturn)})`,
      );
    }

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
    if (!ret || ret.travelExpenseId !== expenseId)
      throw new NotFoundException('Devolução não encontrada');

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).travelReturn.delete({ where: { id: returnId } });
      await this.recalcAndUpdateStatus(expenseId, tx);
    });

    return { deleted: true };
  }

  // ====================== UTIL ======================
  private async ensureExists(id: number) {
    const exp = await this.prisma.travelExpense.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Despesa não encontrada');
    return exp;
  }
}
