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

  async findAll(params: { page: number, limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [movements, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count(),
    ]);

    return {
      data: movements,
      total,
    };
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