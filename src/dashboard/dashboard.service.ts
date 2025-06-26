import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // Para buscar os produtos com estoque baixo, vamos fazer uma busca mais específica
    // e depois filtrar os resultados. Para uma aplicação com milhões de produtos,
    // usaríamos uma consulta SQL pura para otimização, mas esta abordagem é
    // perfeita e mais clara para a nossa escala.
    const allProducts = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockQuantity: true,
        salePrice: true,
      },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.stockQuantity <= p.minStockQuantity,
    );
    
    // As outras buscas continuam otimizadas com a transação
    const [totalMovements, recentMovements] = await this.prisma.$transaction([
      this.prisma.stockMovement.count(),
      this.prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } },
      }),
    ]);
    
    const totalProducts = allProducts.length;
    const stockValue = allProducts.reduce((acc, product) => acc + (product.stockQuantity * product.salePrice), 0);
    const lowStockProductsCount = lowStockProducts.length;

    // Retornamos um objeto organizado com todos os dados, incluindo a nova lista.
    return {
      totalProducts,
      totalMovements,
      stockValue,
      lowStockProductsCount,
      // Retornamos apenas os 3 primeiros produtos com estoque baixo para a UI
      lowStockProducts: lowStockProducts.slice(0, 3), 
      recentMovements,
    };
  }
}
