import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * @Injectable()
 * Visão Geral: Este decorator marca a classe como um "Provider" que pode ser
 * gerenciado pelo container de Injeção de Dependência do NestJS.
 * Em termos simples, isso transforma a classe no "cérebro" da nossa funcionalidade de produtos.
 */
@Injectable()
export class ProductsService {
  /**
   * @constructor(private prisma: PrismaService)
   * Visão Geral: Aqui injetamos o PrismaService. Isso dá ao nosso ProductsService
   * a capacidade de se comunicar diretamente com o banco de dados.
   * `this.prisma` é a nossa ferramenta para todas as operações de banco de dados.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * MÉTODO: create
   * Visão Geral: Responsável por criar um novo produto no banco de dados.
   * Este método demonstra como lidar com RELACIONAMENTOS no Prisma.
   * - Desestruturamos o DTO para separar os IDs das relações dos outros dados.
   * - Usamos `category: { connect: { id: categoryId } }` para "conectar" o novo produto
   * a uma categoria que já existe, em vez de criar uma nova.
   */
  create(createProductDto: CreateProductDto) {
    const { categoryId, supplierId, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        category: {
          connect: { id: categoryId },
        },
        supplier: supplierId
          ? { connect: { id: supplierId } }
          : undefined,
      },
    });
  }

  /**
   * MÉTODO: findAll
   * Visão Geral: Busca todos os produtos cadastrados.
   * - `include`: Esta é uma instrução poderosa do Prisma. Pedimos para ele não trazer
   * apenas os dados do produto, mas também "incluir" os dados completos dos
   * objetos `category` e `supplier` relacionados. Isso é o que permite
   * ao nosso frontend mostrar o nome da categoria, e não apenas o ID.
   */
  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  /**
   * MÉTODO: findOne
   * Visão Geral: Busca um único produto pelo seu ID.
   * - É um método `async` porque a busca no banco pode levar um tempo.
   * - `findUnique`: O método otimizado do Prisma para buscar por uma chave única (como o ID).
   * - Tratamento de Erro: Se o produto não for encontrado, lançamos uma exceção
   * `NotFoundException`, que o NestJS converte automaticamente em um erro HTTP 404.
   */
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

  /**
   * MÉTODO: update
   * Visão Geral: Atualiza os dados de um produto existente.
   * - Primeiro, reutilizamos `this.findOne(id)` para garantir que o produto que
   * estamos tentando atualizar realmente existe. Se não existir, o próprio `findOne`
   * já dispara o erro 404.
   * - A lógica de `connect` é usada novamente para permitir a troca de categoria
   * ou fornecedor durante a atualização.
   */
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

  /**
   * MÉTODO: remove
   * Visão Geral: Deleta um produto do banco de dados.
   * - Assim como no `update`, primeiro usamos `this.findOne(id)` para validar
   * a existência do produto. Isso garante que não tentaremos deletar algo
   * que não existe, tratando o erro 404 de forma limpa.
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
