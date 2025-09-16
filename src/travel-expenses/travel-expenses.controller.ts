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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TravelExpensesService } from './travel-expenses.service';
import { CreateTravelExpenseDto } from './dto/create-travel-expense.dto';
import { UpdateTravelExpenseDto } from './dto/update-travel-expense.dto';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';

@Controller('travel-expenses')
export class TravelExpensesController {
  constructor(private readonly service: TravelExpensesService) { }

  // ---------- Utils (filename dinâmico p/ export) ----------
  private buildExportFilename(query: any, ext: 'csv' | 'pdf') {
    const parts: string[] = ['relatorio_despesas_viagem'];
    if (query?.year) parts.push(String(query.year));
    if (query?.month) parts.push(String(query.month).padStart(2, '0'));
    if (query?.status) parts.push(String(query.status).toLowerCase());
    if (query?.category) parts.push(String(query.category).toLowerCase());
    // slug simples
    const base = parts.join('_').replace(/[^\w\-]+/g, '_');
    return `${base}.${ext}`;
  }

  // ---------- CRUD base ----------
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

  // Buscar despesa específica (com histórico)
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

  // ---------- Exportações ----------
  @Get('export-csv')
  async exportCsv(@Query() query: any, @Res() res: Response) {
    const filename = this.buildExportFilename(query, 'csv');
    const csv = await this.service.exportCsv(query);

    // BOM para Excel (abre acentuação certinho)
    const payload = '\uFEFF' + csv;

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    res.send(payload);
  }

  @Get('export-pdf')
  async exportPdf(@Query() query: any, @Res() res: Response) {
    const filename = this.buildExportFilename(query, 'pdf');
    const buffer = await this.service.exportPdf(query);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
    });
    res.end(buffer);
  }

  // ---------- Reembolsos ----------
  @Get(':id/reimbursements')
  listReimbursements(@Param('id', ParseIntPipe) id: number) {
    return this.service.listReimbursements(id);
  }

  @Post(':id/reimbursements')
  addReimbursement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReimbursementDto,
  ) {
    return this.service.addReimbursement(id, dto);
  }

  @Delete(':id/reimbursements/:reimbursementId')
  deleteReimbursement(
    @Param('id', ParseIntPipe) id: number,
    @Param('reimbursementId', ParseIntPipe) reimbursementId: number,
  ) {
    return this.service.deleteReimbursement(id, reimbursementId);
  }

  // ---------- Adiantamentos ----------
  @Get(':id/advances')
  listAdvances(@Param('id', ParseIntPipe) id: number) {
    return this.service.listAdvances(id);
  }

  @Post(':id/advances')
  addAdvance(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      amount: number | string;
      issuedAt?: string;
      method?: string;
      notes?: string;
    },
  ) {
    return this.service.addAdvance(id, dto);
  }

  @Delete(':id/advances/:advanceId')
  deleteAdvance(
    @Param('id', ParseIntPipe) id: number,
    @Param('advanceId', ParseIntPipe) advanceId: number,
  ) {
    return this.service.deleteAdvance(id, advanceId);
  }

  // ---------- Devoluções ----------
  @Get(':id/returns')
  listReturns(@Param('id', ParseIntPipe) id: number) {
    return this.service.listReturns(id);
  }

  @Post(':id/returns')
  addReturn(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      amount: number | string;
      returnedAt?: string;
      method?: string;
      notes?: string;
    },
  ) {
    return this.service.addReturn(id, dto);
  }

  @Delete(':id/returns/:returnId')
  deleteReturn(
    @Param('id', ParseIntPipe) id: number,
    @Param('returnId', ParseIntPipe) returnId: number,
  ) {
    return this.service.deleteReturn(id, returnId);
  }
}
