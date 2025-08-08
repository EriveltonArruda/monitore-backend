import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
        category: { connect: { id: categoryId } },
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
      },
    });
  }

  async findAll(params?: FindAllProductsParams) {
    const { search, categoryId, status, stockLevel, page = 1, limit = 10 } = params || {};

    const skip = (page - 1) * limit;
    const andConditions: Prisma.ProductWhereInput[] = [];

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
    if (stockLevel === 'low') {
      andConditions.push({ stockQuantity: { lte: this.prisma.product.fields.minStockQuantity } });
    } else if (stockLevel === 'normal') {
      andConditions.push({ stockQuantity: { gt: this.prisma.product.fields.minStockQuantity } });
    }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [products, total] = await this.prisma.$transaction([
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
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
    };
  }

  // Método para PDF e Excel: retorna todos os produtos completos (inclui category e supplier)
  findAllUnpaginatedFull() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: true,
        supplier: true,
      },
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

  async updateMainImageUrl(id: number, imageUrl: string) {
    return this.prisma.product.update({
      where: { id },
      data: { mainImageUrl: imageUrl },
    });
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
      if (
        error.code === 'P2003' ||
        error.code === 'P2014'
      ) {
        throw new BadRequestException(
          'Não é possível excluir este produto pois ele está vinculado a movimentações, entradas ou saídas de estoque.'
        );
      }
      throw error;
    }
  }
}
