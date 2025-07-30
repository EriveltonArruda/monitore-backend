import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BadRequestException } from '@nestjs/common';

// A interface de parâmetros agora inclui 'page' e 'limit'
interface FindAllProductsParams {
  search?: string;
  categoryId?: number;
  status?: string;
  stockLevel?: 'low' | 'normal';
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  create(createProductDto: CreateProductDto) {
    const { categoryId, supplierId, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        category: {
          connect: { id: categoryId },
        },
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
      },
    });
  }

  /**
   * MÉTODO: findAll
   * ATUALIZAÇÃO: Agora implementa a lógica de paginação.
   */
  async findAll(params?: FindAllProductsParams) {
    const { search, categoryId, status, stockLevel, page = 1, limit = 10 } = params || {};

    const skip = (page - 1) * limit; // Calcula quantos itens pular

    const andConditions: Prisma.ProductWhereInput[] = [];

    // Removemos a opção `mode: 'insensitive'`, pois não é suportada pelo Prisma com SQLite
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } }
        ]
      });
    }

    if (categoryId) { andConditions.push({ categoryId }); }
    if (status) { andConditions.push({ status: status.toUpperCase() }); }
    if (stockLevel === 'low') { andConditions.push({ stockQuantity: { lte: this.prisma.product.fields.minStockQuantity } }); }
    else if (stockLevel === 'normal') { andConditions.push({ stockQuantity: { gt: this.prisma.product.fields.minStockQuantity } }); }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Usamos $transaction para executar duas consultas em paralelo para eficiência
    const [products, total] = await this.prisma.$transaction([
      // Consulta 1: Busca os itens da página atual
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { name: 'asc' },
        skip: skip,
        take: limit,
      }),
      // Consulta 2: Conta o número total de itens que correspondem aos filtros
      this.prisma.product.count({ where }),
    ]);

    // Retornamos um objeto com os dados e o total de registros
    return {
      data: products,
      total,
    };
  }

  // NOVO MÉTODO: Retorna todos os produtos com os campos necessários para o dropdown
  findAllUnpaginated() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        salePrice: true,
      }
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID #${id} não encontrado.`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const { categoryId, supplierId, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error)
      // Se for erro de constraint do Prisma (produto vinculado em outra tabela)
      if (
        error.code === 'P2003' || // Foreign key constraint failed on the field
        error.code === 'P2014'    // Tried to delete a record with child records
      ) {
        throw new BadRequestException(
          'Não é possível excluir este produto pois ele está vinculado a movimentações, entradas ou saídas de estoque.'
        );
      }
      // Se não for um erro tratado, lance o erro original
      throw error;
    }
  }
}
