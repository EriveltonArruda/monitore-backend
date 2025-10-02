import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

type ListFilters = {
  page?: number;
  limit?: number;
  search?: string | string[]; // 👈 pode vir array, vamos sanitizar
  type?: string;
  productId?: number;
  period?: string;
};

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) { }

  async create(createStockMovementDto: CreateStockMovementDto) {
    const { productId, type, quantity, userId = 1, ...restData } = createStockMovementDto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Produto com ID #${productId} não encontrado.`);
      }

      let newStockQuantity: number;

      if (type === 'ENTRADA') {
        newStockQuantity = product.stockQuantity + quantity;
      } else if (type === 'AJUSTE') {
        newStockQuantity = quantity;
      } else {
        if (product.stockQuantity < quantity) {
          throw new BadRequestException(`Estoque insuficiente.`);
        }
        newStockQuantity = product.stockQuantity - quantity;
      }

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStockQuantity },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          userId,
          ...restData,
        },
      });

      return movement;
    });
  }

  // ------- build where compartilhado -------
  private buildWhere(filters: Omit<ListFilters, 'page' | 'limit'>) {
    const where: any = {};

    // 👇 Sanitiza `search` (string | string[] -> string)
    const raw = filters.search;
    const q =
      typeof raw === 'string'
        ? raw.trim()
        : Array.isArray(raw)
          ? String(raw[0] ?? '').trim()
          : '';

    if (q) {
      where.OR = [
        { details: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
        { product: { is: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.period) {
      const now = new Date();
      let startDate: Date | null = null;
      if (filters.period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filters.period === 'last7') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      } else if (filters.period === 'last30') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      }
      if (startDate) {
        where.createdAt = { gte: startDate };
      }
    }

    return where;
  }

  async findAll(params: ListFilters) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhere({
      search: params.search,
      type: params.type,
      productId: params.productId,
      period: params.period,
    });

    const [movements, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { data: movements, total };
  }

  // ------- lista sem paginação para PDF -------
  async findForExport(filters: Omit<ListFilters, 'page' | 'limit'>) {
    const where = this.buildWhere(filters);
    const data = await this.prisma.stockMovement.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return data;
  }

  // ---------- Buscar detalhes de uma movimentação ----------
  async findOne(id: number) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!movement) {
      throw new NotFoundException(`Movimentação com ID #${id} não encontrada.`);
    }

    return movement;
  }

  async remove(id: number) {
    const movement = await this.prisma.stockMovement.findUnique({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Movimentação com ID #${id} não encontrada.`);
    }

    // Obs.: não desfaz o estoque. Se quiser estornar, me avisa que ajusto.
    return this.prisma.stockMovement.delete({ where: { id } });
  }
}
