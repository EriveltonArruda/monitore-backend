import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { subDays } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getGeneralReport() {
    // --- 1. DADOS PARA OS CARDS DE RESUMO ---
    const totalProducts = await this.prisma.product.count();
    const allProducts = await this.prisma.product.findMany({
      select: { stockQuantity: true, minStockQuantity: true, salePrice: true },
    });
    const stockValue = allProducts.reduce((acc, p) => acc + p.stockQuantity * p.salePrice, 0);
    const lowStockProductsCount = allProducts.filter(p => p.stockQuantity <= p.minStockQuantity).length;
    
    // --- 2. DADOS PARA O GRÁFICO DE PRODUTOS POR CATEGORIA (PIZZA) ---
    const productsByCategory = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
      where: { categoryId: { not: null } },
    });

    // CORREÇÃO APLICADA AQUI:
    // Filtramos a lista para remover os valores nulos e garantir ao TypeScript
    // que estamos trabalhando apenas com números.
    const categoryIds = productsByCategory
      .map(item => item.categoryId)
      .filter((id): id is number => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const productsByCategoryData = productsByCategory.map(item => {
      const category = categories.find(c => c.id === item.categoryId);
      return {
        name: category?.name || 'Sem Categoria',
        value: item._count.id,
      };
    });


    // --- 3. DADOS PARA O GRÁFICO DE VALOR POR CATEGORIA (BARRAS) ---
    const productsWithValue = await this.prisma.product.findMany({
        include: { category: { select: { name: true } } }
    });

    const valueByCategory = productsWithValue.reduce((acc, product) => {
        const categoryName = product.category?.name || 'Sem Categoria';
        const productValue = product.stockQuantity * product.salePrice;
        acc[categoryName] = (acc[categoryName] || 0) + productValue;
        return acc;
    }, {} as Record<string, number>);

    const valueByCategoryData = Object.keys(valueByCategory).map(name => ({
        name,
        value: valueByCategory[name],
    }));


    // --- 4. DADOS PARA O GRÁFICO DE MOVIMENTAÇÕES (LINHA) ---
    const sevenDaysAgo = subDays(new Date(), 7);
    const movementsLast7Days = await this.prisma.stockMovement.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const movementsLast7DaysData = movementsLast7Days.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id,
    }));


    // --- 5. Retornar todos os dados compilados ---
    return {
      summaryCards: {
        totalProducts,
        stockValue,
        totalMovements: await this.prisma.stockMovement.count(), 
        lowStockProducts: lowStockProductsCount,
      },
      productsByCategory: productsByCategoryData,
      valueByCategory: valueByCategoryData,
      movementsLast7Days: movementsLast7DaysData,
    };
  }
}
