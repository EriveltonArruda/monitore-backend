import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as fs from 'fs/promises';
import { join } from 'path';

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
        OR: [{ name: { contains: search } }, { sku: { contains: search } }],
      });
    }
    if (categoryId) andConditions.push({ categoryId });
    if (status) andConditions.push({ status: status.toUpperCase() });

    if (stockLevel === 'low') {
      andConditions.push({ stockQuantity: { lte: this.prisma.product.fields.minStockQuantity } });
    } else if (stockLevel === 'normal') {
      andConditions.push({ stockQuantity: { gt: this.prisma.product.fields.minStockQuantity } });
    }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, supplier: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total };
  }

  // Para PDF/Excel: retorna todos os produtos com category e supplier
  findAllUnpaginatedFull() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true, supplier: true },
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

  async removeMainImage(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const current = product.mainImageUrl;

    await this.prisma.product.update({
      where: { id },
      data: { mainImageUrl: null },
    });

    if (current && current.startsWith('/uploads/products/')) {
      const absPath = join(process.cwd(), current.replace(/^\//, ''));
      try {
        await fs.unlink(absPath);
      } catch {
        // ignora erro se o arquivo já não existir
      }
    }

    return { ok: true };
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
      return await this.prisma.product.delete({ where: { id } });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2003' || error.code === 'P2014') {
        throw new BadRequestException(
          'Não é possível excluir este produto pois ele está vinculado a movimentações, entradas/saídas de estoque ou possui imagens vinculadas.',
        );
      }
      throw error;
    }
  }

  // ========= GALERIA =========

  async listImages(productId: number) {
    await this.findOne(productId);
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { id: 'desc' },
      select: { id: true, url: true },
    });
  }

  async addImages(productId: number, urls: string[]) {
    await this.findOne(productId);
    if (!urls.length) return [];

    const created = await this.prisma.$transaction(
      urls.map((url) =>
        this.prisma.productImage.create({
          data: { productId, url },
          select: { id: true, url: true },
        }),
      ),
    );
    return created;
  }

  async ensureMainImage(productId: number, url: string) {
    const p = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { mainImageUrl: true },
    });
    if (!p) throw new NotFoundException('Produto não encontrado');
    if (!p.mainImageUrl) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { mainImageUrl: url },
      });
    }
  }

  // >>>>>>>>>>>>>>>>>>>>>>> ADICIONADO <<<<<<<<<<<<<<<<<<<<<<
  async setMainImage(productId: number, imageId: number) {
    const img = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, url: true, productId: true },
    });
    if (!img) throw new NotFoundException('Imagem não encontrada');
    if (img.productId !== productId) {
      throw new ForbiddenException('Imagem não pertence ao produto informado');
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { mainImageUrl: img.url },
    });

    return { ok: true, mainImageUrl: img.url };
  }
  // >>>>>>>>>>>>>>>>>>>>>>> FIM ADIÇÃO <<<<<<<<<<<<<<<<<<<<<<

  /**
   * Remove uma imagem da galeria e, se ela for a imagem principal do produto,
   * define automaticamente outra imagem da galeria como principal (se existir).
   * Retorna { ok: true, updatedMainImageUrl: string | null } para o front atualizar o preview.
   */
  async removeImage(imageId: number, productId?: number) {
    const img = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, url: true, productId: true },
    });
    if (!img) throw new NotFoundException('Imagem não encontrada');

    if (productId && img.productId !== productId) {
      throw new ForbiddenException('Imagem não pertence ao produto informado');
    }

    // Checar se esta imagem é a principal
    const product = await this.prisma.product.findUnique({
      where: { id: img.productId },
      select: { id: true, mainImageUrl: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const isMain = !!product.mainImageUrl && product.mainImageUrl === img.url;

    // Remove a imagem (DB)
    await this.prisma.productImage.delete({ where: { id: imageId } });

    // Remove arquivo físico, se estiver no diretório esperado
    if (img.url && img.url.startsWith('/uploads/products/')) {
      const absPath = join(process.cwd(), img.url.replace(/^\//, ''));
      try {
        await fs.unlink(absPath);
      } catch {
        // ignora se já não existir
      }
    }

    let updatedMain: string | null | undefined = undefined;

    if (isMain) {
      // Tentar promover outra imagem da galeria como principal
      const another = await this.prisma.productImage.findFirst({
        where: { productId: product.id },
        orderBy: { id: 'desc' },
        select: { url: true },
      });

      updatedMain = another?.url ?? null;
      await this.prisma.product.update({
        where: { id: product.id },
        data: { mainImageUrl: updatedMain },
      });
    }

    return { ok: true, updatedMainImageUrl: updatedMain };
  }
}
