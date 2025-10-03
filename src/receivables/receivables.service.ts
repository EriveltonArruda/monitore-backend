import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Receivable } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { FindReceivablesDto } from './dto/find-receivables.dto';

@Injectable()
export class ReceivablesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateReceivableDto) {
    const data: Prisma.ReceivableCreateInput = {
      contract: { connect: { id: dto.contractId } },
      noteNumber: dto.noteNumber ?? null,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
      grossAmount: dto.grossAmount ?? null,
      netAmount: dto.netAmount ?? null,
      periodLabel: dto.periodLabel ?? null,
      periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
      periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
      receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : null,
      status: dto.status ?? 'A_RECEBER',
    };

    const row = await this.prisma.receivable.create({
      data,
      include: {
        contract: { include: { municipality: true, department: true } },
      },
    });
    return withDerivedStatus(row);
  }

  async findAll(query: FindReceivablesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const { where } = buildReceivablesWhere(query);

    const orderByField = query.orderBy ?? 'issueDate';
    const orderDirection = query.order ?? 'desc';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.receivable.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderDirection },
        include: {
          contract: { include: { municipality: true, department: true } },
        },
      }),
      this.prisma.receivable.count({ where }),
    ]);

    const mapped = data.map(withDerivedStatus);

    return {
      data: mapped,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.receivable.findUnique({
      where: { id },
      include: { contract: { include: { municipality: true, department: true } } },
    });
    if (!row) throw new NotFoundException('Recebível não encontrado.');
    return withDerivedStatus(row);
  }

  async update(id: number, dto: UpdateReceivableDto) {
    await this.findOne(id);

    const data: Prisma.ReceivableUpdateInput = {
      contract: dto.contractId ? { connect: { id: dto.contractId } } : undefined,
      noteNumber: dto.noteNumber !== undefined ? dto.noteNumber : undefined,
      issueDate:
        dto.issueDate !== undefined
          ? dto.issueDate
            ? new Date(dto.issueDate)
            : null
          : undefined,
      grossAmount: dto.grossAmount !== undefined ? dto.grossAmount : undefined,
      netAmount: dto.netAmount !== undefined ? dto.netAmount : undefined,
      periodLabel: dto.periodLabel !== undefined ? dto.periodLabel : undefined,
      periodStart:
        dto.periodStart !== undefined
          ? dto.periodStart
            ? new Date(dto.periodStart)
            : null
          : undefined,
      periodEnd:
        dto.periodEnd !== undefined
          ? dto.periodEnd
            ? new Date(dto.periodEnd)
            : null
          : undefined,
      deliveryDate:
        dto.deliveryDate !== undefined
          ? dto.deliveryDate
            ? new Date(dto.deliveryDate)
            : null
          : undefined,
      receivedAt:
        dto.receivedAt !== undefined
          ? dto.receivedAt
            ? new Date(dto.receivedAt)
            : null
          : undefined,
      status: dto.status ?? undefined,
    };

    const updated = await this.prisma.receivable.update({
      where: { id },
      data,
      include: { contract: { include: { municipality: true, department: true } } },
    });

    return withDerivedStatus(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.receivable.delete({ where: { id } });
    return { success: true };
  }

  // ======= lista para exportação (sem paginação) =======
  async findForExport(query: FindReceivablesDto) {
    const { where } = buildReceivablesWhere(query);

    const orderByField = query.orderBy ?? 'issueDate';
    const orderDirection = query.order ?? 'desc';

    const data = await this.prisma.receivable.findMany({
      where,
      orderBy: { [orderByField]: orderDirection },
      include: {
        contract: { include: { municipality: true, department: true } },
      },
    });

    return data.map(withDerivedStatus);
  }
}

/* ===== helpers de data ===== */
function toLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d); // local 00:00
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
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/* ===== Tipagem auxiliar p/ status derivado ===== */
type DerivableReceivable = {
  receivedAt: Date | string | null;
  issueDate: Date | string | null;
  periodStart: Date | string | null;
  periodEnd: Date | string | null;
  status?: string | null;
  // mantém os demais campos sem perder inferência
  [key: string]: any;
};

/* ===== regra de status derivado (só para exibição) ===== */
function withDerivedStatus<T extends DerivableReceivable>(row: T): T {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const toDate = (v: Date | string | null) =>
    v ? new Date(v as any) : null;

  const receivedAt = toDate(row.receivedAt);

  if (receivedAt) {
    return { ...row, status: 'RECEBIDO' } as T;
  }

  let effectiveStart = toDate(row.periodStart);
  let effectiveEnd = toDate(row.periodEnd);

  if (!effectiveStart && !effectiveEnd) {
    const issue = toDate(row.issueDate);
    if (issue) {
      effectiveStart = startOfMonth(issue);
      effectiveEnd = endOfMonth(issue);
    }
  }

  if (!effectiveStart && !effectiveEnd) {
    return row; // sem dados de período/issueDate -> mantém status original
  }

  if (effectiveStart && !effectiveEnd) effectiveEnd = endOfMonth(effectiveStart);
  if (!effectiveStart && effectiveEnd) effectiveStart = startOfMonth(effectiveEnd);

  const isCurrentMonth =
    effectiveStart! <= monthEnd && effectiveEnd! >= monthStart;
  const isPast = effectiveEnd! < monthStart;
  const isFuture = effectiveStart! > monthEnd;

  let derived: 'ABERTO' | 'ATRASADO' | 'A_RECEBER' = 'A_RECEBER';
  if (isCurrentMonth) derived = 'ABERTO';
  else if (isPast) derived = 'ATRASADO';
  else if (isFuture) derived = 'A_RECEBER';

  return { ...row, status: derived } as T;
}

/* ===== builder compartilhado para filtros ===== */
function buildReceivablesWhere(query: FindReceivablesDto) {
  const where: Prisma.ReceivableWhereInput = {};
  const and: Prisma.ReceivableWhereInput[] = [];

  if (query.contractId) and.push({ contractId: Number(query.contractId) });
  if (query.municipalityId) and.push({ contract: { municipalityId: Number(query.municipalityId) } });
  if (query.departmentId) and.push({ contract: { departmentId: Number(query.departmentId) } });

  // Mantemos o filtro por status do banco (compatibilidade)
  if (query.status && query.status.trim() !== '') and.push({ status: query.status });

  if (query.search && query.search.trim() !== '') {
    const q = query.search.trim();
    and.push({
      OR: [
        { noteNumber: { contains: q, mode: 'insensitive' } },
        { periodLabel: { contains: q, mode: 'insensitive' } },
        { contract: { is: { code: { contains: q, mode: 'insensitive' } } } },
        { contract: { is: { municipality: { is: { name: { contains: q, mode: 'insensitive' } } } } } },
        { contract: { is: { department: { is: { name: { contains: q, mode: 'insensitive' } } } } } },
      ],
    });
  }

  if (query.issueFrom || query.issueTo) {
    const f: Prisma.DateTimeFilter = {};
    if (query.issueFrom) f.gte = startOfDay(toLocalDate(query.issueFrom));
    if (query.issueTo) f.lte = endOfDay(toLocalDate(query.issueTo));
    and.push({ issueDate: f });
  }

  if (query.periodFrom || query.periodTo) {
    const f: Prisma.DateTimeFilter = {};
    if (query.periodFrom) f.gte = startOfDay(toLocalDate(query.periodFrom));
    if (query.periodTo) f.lte = endOfDay(toLocalDate(query.periodTo));
    and.push({ periodStart: f });
  }

  if (query.receivedFrom || query.receivedTo) {
    const f: Prisma.DateTimeFilter = {};
    if (query.receivedFrom) f.gte = startOfDay(toLocalDate(query.receivedFrom));
    if (query.receivedTo) f.lte = endOfDay(toLocalDate(query.receivedTo));
    and.push({ receivedAt: f });
  }

  if (and.length) where.AND = and;

  return { where };
}
