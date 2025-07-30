import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('general')
  getGeneralReport() {
    return this.reportsService.getGeneralReport();
  }

  // NOVO ENDPOINT: Relatório mensal de contas a pagar
  @Get('accounts-payable/month')
  getAccountsPayableMonthlyReport(
    @Query('year') year?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getAccountsPayableMonthlyReport({
      year: year ? Number(year) : new Date().getFullYear(),
      category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
  }
}
