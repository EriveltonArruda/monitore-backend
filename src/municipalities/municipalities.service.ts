import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';
import { FindMunicipalitiesDto } from './dto/find-municipalities.dto';

@Injectable()
export class MunicipalitiesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateMunicipalityDto) {
    return this.prisma.municipality.create({
      data: {
        name: dto.name,
        cnpj: dto.cnpj ?? null,
      },
    });
  }

  async findAll(query: FindMunicipalitiesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.MunicipalityWhereInput = {};
    if (query.search && query.search.trim() !== '') {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { cnpj: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.municipality.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.municipality.count({ where }),
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
    const row = await this.prisma.municipality.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Município não encontrado.');
    return row;
  }

  async update(id: number, dto: UpdateMunicipalityDto) {
    await this.findOne(id);
    return this.prisma.municipality.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        cnpj: dto.cnpj ?? undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.municipality.delete({ where: { id } });
    return { success: true };
  }
}
