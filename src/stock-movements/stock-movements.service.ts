import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

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

  async findAll(params: {
    page: number,
    limit: number,
    search?: string,
    type?: string,
    productId?: number,
    period?: string
  }) {
    const { page, limit, search, type, productId, period } = params;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { product: { is: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    // Filtro por tipo de movimentação
    if (type) {
      where.type = type;
    }

    // Filtro por produto
    if (productId) {
      where.productId = productId;
    }

    // Filtro por período
    if (period) {
      const now = new Date();
      let startDate: Date | null = null;
      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // meia-noite de hoje
      } else if (period === 'last7') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); // últimos 7 dias
      } else if (period === 'last30') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // últimos 30 dias
      }
      if (startDate) {
        where.createdAt = { gte: startDate };
      }
    }

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

  async remove(id: number) {
    // Busca a movimentação antes de tentar excluir
    const movement = await this.prisma.stockMovement.findUnique({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Movimentação com ID #${id} não encontrada.`);
    }

    // Exclui a movimentação
    return this.prisma.stockMovement.delete({ where: { id } });
  }
}