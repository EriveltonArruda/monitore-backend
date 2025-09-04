import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { FindDepartmentsDto } from './dto/find-departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: dto.name,
        municipality: { connect: { id: dto.municipalityId } },
      },
      include: { municipality: true },
    });
  }

  async findAll(query: FindDepartmentsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {};
    const and: Prisma.DepartmentWhereInput[] = [];

    if (query.municipalityId) {
      and.push({ municipalityId: Number(query.municipalityId) });
    }

    if (query.search && query.search.trim() !== '') {
      and.push({ name: { contains: query.search.trim(), mode: 'insensitive' } });
    }

    if (and.length) where.AND = and;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ municipalityId: 'asc' }, { name: 'asc' }],
        include: { municipality: true },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.department.findUnique({
      where: { id },
      include: { municipality: true },
    });
    if (!row) throw new NotFoundException('Órgão/Secretaria não encontrado.');
    return row;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        municipality: dto.municipalityId
          ? { connect: { id: dto.municipalityId } }
          : undefined,
      },
      include: { municipality: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
