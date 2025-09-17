import { Controller, Get, Post, Body, Param, Query, Delete, ParseIntPipe } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) { }

  @Post()
  create(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockMovementsService.create(createStockMovementDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('productId') productId?: string,
    @Query('period') period?: string
  ) {
    return this.stockMovementsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      type,
      productId: productId ? Number(productId) : undefined,
      period,
    });
  }

  // ---------- NOVO: Detalhes ----------
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.remove(id);
  }
}
