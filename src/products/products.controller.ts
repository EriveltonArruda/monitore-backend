import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query, // Importamos o decorator @Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * ROTA: GET /products
   * ATUALIZAÇÃO: O método agora também aceita 'page' e 'limit' para paginação.
   * Ex: /products?page=2&limit=10
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('stockLevel') stockLevel?: 'low' | 'normal',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll({
      search,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status,
      stockLevel,
      page: page ? Number(page) : 1, // Página padrão é 1
      limit: limit ? Number(limit) : 10, // Limite padrão de 10 itens por página
    });
  }

  // NOVO ENDPOINT: Busca TODOS os produtos, sem paginação
  @Get('all')
  findAllUnpaginated() {
    return this.productsService.findAllUnpaginated();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}