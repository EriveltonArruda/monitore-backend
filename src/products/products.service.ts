import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

// O tipo de parâmetros agora inclui os novos filtros
interface FindAllProductsParams {
  search?: string;
  categoryId?: number;
  status?: string; // <-- CORREÇÃO: Propriedade que faltava foi adicionada
  stockLevel?: 'low' | 'normal';
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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

  findAll(params?: FindAllProductsParams) {
    const { search, categoryId, status, stockLevel } = params || {};
    
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      });
    }

    if (categoryId) {
      andConditions.push({ categoryId: categoryId });
    }

    // Adiciona o filtro de status, se ele for enviado
    if (status) {
      andConditions.push({ status: status });
    }

    // Adiciona o filtro de nível de estoque.
    if (stockLevel === 'low') {
        andConditions.push({ 
            stockQuantity: { lte: this.prisma.product.fields.minStockQuantity } 
        });
    } else if (stockLevel === 'normal') {
        andConditions.push({ 
            stockQuantity: { gt: this.prisma.product.fields.minStockQuantity }
        });
    }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: {
        name: 'asc',
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
    return this.prisma.product.delete({ where: { id } });
  }
}
