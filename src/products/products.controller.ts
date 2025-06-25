import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * @Controller('products')
 * Visão Geral: Este decorator define que esta classe será responsável por
 * gerenciar todas as requisições que chegam na rota base '/products'.
 * É o ponto de entrada para qualquer endpoint relacionado a produtos.
 */
@Controller('products')
export class ProductsController {
  /**
   * @constructor(private readonly productsService: ProductsService)
   * Visão Geral: Este é o mecanismo de "Injeção de Dependência".
   * O Controller precisa do Service para fazer o trabalho de verdade (falar com o banco).
   * O NestJS automaticamente "injeta" uma instância do ProductsService aqui,
   * permitindo que usemos `this.productsService` nos métodos abaixo.
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * ROTA: POST /products
   * Visão Geral: Este método é ativado quando uma requisição POST é feita para /products.
   * O objetivo é CRIAR um novo produto.
   * - @Body(): Pega os dados JSON enviados no corpo da requisição.
   * - createProductDto: Garante que os dados recebidos têm o formato correto.
   * - A única responsabilidade deste método é passar os dados para o service.
   */
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * ROTA: GET /products
   * Visão Geral: Este método é ativado em uma requisição GET para /products.
   * O objetivo é BUSCAR TODOS os produtos.
   * Ele simplesmente chama o método `findAll` do service.
   */
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * ROTA: GET /products/:id (ex: /products/12)
   * Visão Geral: Este método busca UM produto específico.
   * - @Param('id', ...): Pega o 'id' que veio na URL.
   * - ParseIntPipe: Uma ferramenta que valida e converte o 'id' (que chega como texto)
   * para um número, antes de passar para o service.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * ROTA: PATCH /products/:id (ex: /products/12)
   * Visão Geral: Este método ATUALIZA um produto existente.
   * Ele combina os dois conceitos:
   * - @Param('id', ...): para saber QUAL produto atualizar.
   * - @Body(): para receber os NOVOS dados do produto.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * ROTA: DELETE /products/:id (ex: /products/12)
   * Visão Geral: Este método REMOVE um produto do banco de dados.
   * - @Param('id', ...): para saber qual produto deve ser deletado.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
