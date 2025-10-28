import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FindContractsDto } from './dto/find-contracts.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) { }

  // CREATE
  async create(dto: CreateContractDto) {
    const data: Prisma.ContractCreateInput = {
      code: dto.code,
      description: dto.description ?? null,
      municipality: { connect: { id: dto.municipalityId } },
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      monthlyValue: dto.monthlyValue ?? null,

      // Prisma aplica default(true) se undefined
      active: dto.active !== undefined ? dto.active : undefined,

      // normaliza para UPPER; se undefined, Prisma usa default
      status: dto.status ? (dto.status.toUpperCase() as any) : undefined,

      // NOVO: anexo
      attachmentUrl: dto.attachmentUrl ?? null,
    };

    const created = await this.prisma.contract.create({
      data,
      include: { municipality: true, department: true },
    });

    return { ...created, ...computeAlert(created.endDate, 30) };
  }

  // FIND ALL + paginação e filtros
  async findAll(query: FindContractsDto) {
    const {
      page = 1,
      limit = 10,
      municipalityId,
      departmentId,
      search,
      endFrom,
      endTo,
      dueInDays,
      expiredOnly,
      order = 'asc',
    } = query;

    const where: Prisma.ContractWhereInput = {};
    const and: Prisma.ContractWhereInput[] = [];

    if (municipalityId) and.push({ municipalityId: Number(municipalityId) });
    if (departmentId) and.push({ departmentId: Number(departmentId) });

    if (search && search.trim() !== '') {
      and.push({
        OR: [
          { code: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ],
      });
    }

    const endRange: Prisma.DateTimeFilter = {};
    if (endFrom) endRange.gte = startOfDay(toLocalDate(endFrom));
    if (endTo) endRange.lte = endOfDay(toLocalDate(endTo));
    if (Object.keys(endRange).length > 0) and.push({ endDate: endRange });

    if (expiredOnly && expiredOnly.toString().toLowerCase() === 'true') {
      and.push({ endDate: { lt: startOfDay(new Date()) } });
    }

    // dueInDays pode vir string; normaliza para number
    const due = Number(dueInDays);
    if (!Number.isNaN(due) && due > 0) {
      const today = startOfDay(new Date());
      const limitDate = endOfDay(addDays(today, due));
      and.push({ endDate: { gte: today, lte: limitDate } });
    }

    if (and.length > 0) where.AND = and;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        take,
        skip,
        orderBy: { endDate: order === 'desc' ? 'desc' : 'asc' },
        include: { municipality: true, department: true },
      }),
      this.prisma.contract.count({ where }),
    ]);

    const enriched = rows.map((c) => ({ ...c, ...computeAlert(c.endDate, 30) }));

    return {
      data: enriched,
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.max(1, Math.ceil(total / take)),
    };
  }

  // FIND ONE
  async findOne(id: number) {
    const row = await this.prisma.contract.findUnique({
      where: { id },
      include: { municipality: true, department: true },
    });
    if (!row) throw new NotFoundException('Contrato não encontrado.');
    return { ...row, ...computeAlert(row.endDate, 30) };
  }

  // UPDATE
  async update(id: number, dto: UpdateContractDto) {
    const exists = await this.prisma.contract.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Contrato não encontrado.');

    const data: Prisma.ContractUpdateInput = {
      code: dto.code ?? undefined,
      description: dto.description ?? undefined,
      municipality: dto.municipalityId ? { connect: { id: dto.municipalityId } } : undefined,
      department:
        dto.departmentId === null
          ? { disconnect: true }
          : dto.departmentId
            ? { connect: { id: dto.departmentId } }
            : undefined,
      startDate:
        dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
      monthlyValue: dto.monthlyValue ?? undefined,

      active: dto.active !== undefined ? dto.active : undefined,
      status: dto.status ? (dto.status.toUpperCase() as any) : undefined,

      // NOVO: anexo (permitindo nulificar)
      attachmentUrl: dto.attachmentUrl !== undefined ? (dto.attachmentUrl ?? null) : undefined,
    };

    const updated = await this.prisma.contract.update({
      where: { id },
      data,
      include: { municipality: true, department: true },
    });

    return { ...updated, ...computeAlert(updated.endDate, 30) };
  }

  // DELETE
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.contract.delete({ where: { id } });
    return { success: true };
  }
}

/* =========================
   Helpers (datas + alerta)
========================= */

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
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function computeAlert(endDate: Date | null, thresholdDays = 30) {
  if (!endDate)
    return {
      daysToEnd: null as number | null,
      alertTag: null as 'EXPIRADO' | 'D-7' | 'D-30' | 'HOJE' | null,
    };

  const today = startOfDay(new Date());
  const end = startOfDay(new Date(endDate));
  const diffMs = end.getTime() - today.getTime();
  const daysToEnd = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let alertTag: 'EXPIRADO' | 'D-7' | 'D-30' | 'HOJE' | null = null;
  if (daysToEnd < 0) alertTag = 'EXPIRADO';
  else if (daysToEnd === 0) alertTag = 'HOJE';
  else if (daysToEnd <= 7) alertTag = 'D-7';
  else if (daysToEnd <= thresholdDays) alertTag = 'D-30';

  return { daysToEnd, alertTag };
}
