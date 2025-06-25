import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  // --- CRIAÇÃO COM RELACIONAMENTO ---
  create(createProductDto: CreateProductDto) {
    const { categoryId, supplierId, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        category: {
          connect: { id: categoryId }, // Conecta com uma categoria existente
        },
        supplier: supplierId
          ? { connect: { id: supplierId } } // Se o supplierId for enviado, conecta
          : undefined,
      },
    });
  }

  // --- BUSCA COM DADOS RELACIONADOS ---
  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true, // Inclui os dados completos da categoria no resultado
        supplier: true, // Inclui os dados completos do fornecedor
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

  // A lógica de update e remove segue o mesmo padrão que já vimos
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