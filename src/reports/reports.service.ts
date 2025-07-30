import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { subDays } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

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

  // NOVO MÉTODO: Relatório mensal de contas a pagar agrupado por mês
  async getAccountsPayableMonthlyReport(params: {
    year: number,
    category?: string,
    page?: number,
    limit?: number
  }) {
    const { year, category = "TODAS", page = 1, limit = 12 } = params;

    // Filtro base: ano
    let where: any = {
      dueDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    };

    // Filtro de categoria, se informado
    if (category && category !== "TODAS") {
      where.category = { equals: category };
    }

    // Busca todas as contas a pagar do ano (e categoria, se houver)
    const accounts = await this.prisma.accountPayable.findMany({
      where,
      select: {
        id: true,
        value: true,
        status: true,
        dueDate: true,
      },
    });

    // Agrupa por mês
    const grouped = {} as Record<string, { total: number, paid: number, pending: number, count: number }>;
    for (const account of accounts) {
      // Mês no formato YYYY-MM
      const due = new Date(account.dueDate);
      const key = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { total: 0, paid: 0, pending: 0, count: 0 };
      }
      grouped[key].total += Number(account.value);
      grouped[key].count += 1;
      if (account.status === 'PAGO') {
        grouped[key].paid += Number(account.value);
      } else {
        grouped[key].pending += Number(account.value);
      }
    }

    // Ordena os meses
    const allMonths = Object.keys(grouped).sort();

    // Paginação manual
    const total = allMonths.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedMonths = allMonths.slice(start, end);

    // Monta os itens para retornar
    const data = pagedMonths.map(month => ({
      month,
      ...grouped[month]
    }));

    return {
      data,
      total,
      totalPages,
      page,
      limit,
    };
  }
}
