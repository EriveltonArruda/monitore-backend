import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getSummary() {
    // Busca todos os produtos, sem salePrice
    const allProducts = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        minStockQuantity: true,
        costPrice: true, // Adiciona costPrice para calcular valor em estoque se quiser
      },
    });

    const lowStockProducts = allProducts.filter(
      (p) => p.stockQuantity <= p.minStockQuantity,
    );

    const [totalMovements, recentMovements] = await this.prisma.$transaction([
      this.prisma.stockMovement.count(),
      this.prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } },
      }),
    ]);

    const totalProducts = allProducts.length;
    // Soma estoque * costPrice (caso queira valor estimado em reais)
    const stockValue = allProducts.reduce((acc, product) => acc + (product.stockQuantity * (product.costPrice || 0)), 0);
    const lowStockProductsCount = lowStockProducts.length;

    return {
      totalProducts,
      totalMovements,
      stockValue,
      lowStockProductsCount,
      lowStockProducts: lowStockProducts.slice(0, 3),
      recentMovements,
    };
  }
}
