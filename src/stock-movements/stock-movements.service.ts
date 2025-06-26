import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(createStockMovementDto: CreateStockMovementDto) {
    // Adicionamos o userId com um valor padrão de 1
    const { productId, type, quantity, userId = 1, ...restData } = createStockMovementDto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Produto com ID #${productId} não encontrado.`);
      }

      let newStockQuantity: number;

      // --- LÓGICA DE ATUALIZAÇÃO DE ESTOQUE REFEITA ---
      if (type === 'ENTRADA') {
        newStockQuantity = product.stockQuantity + quantity;
      } else if (type === 'SAIDA') {
        if (product.stockQuantity < quantity) {
          throw new BadRequestException(`Estoque insuficiente. Disponível: ${product.stockQuantity}.`);
        }
        newStockQuantity = product.stockQuantity - quantity;
      } else if (type === 'AJUSTE') {
        // Para 'Ajuste', a 'quantity' vinda do formulário é a 'Nova Quantidade'.
        // Ela define o estoque diretamente.
        newStockQuantity = quantity;
      } else {
        // Segurança para tipos desconhecidos
        throw new BadRequestException(`Tipo de movimentação inválido: ${type}`);
      }
      
      // Atualiza o estoque do produto
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStockQuantity },
      });
      
      // Cria o registro da movimentação com todos os novos campos
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          userId,
          ...restData, // Adiciona os outros campos como details, document, etc.
        },
      });

      return movement;
    });
  }

  findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
