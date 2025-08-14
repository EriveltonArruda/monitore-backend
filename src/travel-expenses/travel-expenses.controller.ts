import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TravelExpensesService } from './travel-expenses.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';

@Controller('travel-expenses')
export class TravelExpensesController {
  constructor(private readonly service: TravelExpensesService) { }

  // Criar nova despesa
  @Post()
  create(@Body() dto: CreateTravelExpenseDto) {
    return this.service.create(dto);
  }

  // Listar despesas (com filtros opcionais)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status,
      category,
      search,
    });
  }

  // Buscar despesa específica (com histórico de reembolsos)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Atualizar despesa
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTravelExpenseDto,
  ) {
    return this.service.update(id, dto);
  }

  // Excluir despesa
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // Listar reembolsos
  @Get(':id/reimbursements')
  listReimbursements(@Param('id', ParseIntPipe) id: number) {
    return this.service.listReimbursements(id);
  }

  // Criar reembolso
  @Post(':id/reimbursements')
  addReimbursement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReimbursementDto,
  ) {
    return this.service.addReimbursement(id, dto);
  }

  // Excluir reembolso
  @Delete(':id/reimbursements/:reimbursementId')
  deleteReimbursement(
    @Param('id', ParseIntPipe) id: number,
    @Param('reimbursementId', ParseIntPipe) reimbursementId: number,
  ) {
    return this.service.deleteReimbursement(id, reimbursementId);
  }
}
