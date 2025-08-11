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
import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { Response } from 'express';
import PdfPrinter from 'pdfmake';
import { join } from 'path';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) { }

  @Post()
  create(@Body() dto: CreateAccountsPayableDto) {
    return this.accountsPayableService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.accountsPayableService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status: status && status !== 'TODOS' ? status : undefined,
      category: category && category !== 'TODAS' ? category : undefined,
      search: search || '',
    });
  }

  // ==== ROTAS ESPECÍFICAS PRIMEIRO ====

  @Get('reports/month')
  async getMonthlyReport(
    @Query('year') year?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accountsPayableService.getMonthlyReport(
      year,
      category,
      status,
      Number(page) || 1,
      Number(limit) || 12,
    );
  }

  @Get('export-pdf')
  async exportListPdf(
    @Res() res: Response,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const { data: accounts } = await this.accountsPayableService.findAll({
      page: 1,
      limit: 100000,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status: status && status !== 'TODOS' ? status : undefined,
      category: category && category !== 'TODAS' ? category : undefined,
      search: search || '',
    });

    const fonts = {
      Roboto: {
        normal: join(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
        bold: join(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
        italics: join(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: join(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf'),
      },
    };
    const printer = new (PdfPrinter as any)(fonts);

    const brl = (n: number) =>
      `R$ ${Number(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const fdate = (d?: Date | string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
    const installmentLabel = (acc: any) =>
      acc.installmentType === 'PARCELADO' && acc.installments && acc.currentInstallment
        ? `${acc.currentInstallment}/${acc.installments}`
        : 'Única';

    const tableBody = [
      [
        { text: 'Nome', style: 'tableHeader' },
        { text: 'Categoria', style: 'tableHeader' },
        { text: 'Valor', style: 'tableHeader' },
        { text: 'Vencimento', style: 'tableHeader' },
        { text: 'Status', style: 'tableHeader' },
        { text: 'Parcela', style: 'tableHeader' },
      ],
      ...accounts.map((a: any) => [
        a.name ?? '-',
        a.category ?? '-',
        brl(a.value),
        fdate(a.dueDate),
        a.status ?? '-',
        installmentLabel(a),
      ]),
    ];

    const filtersLine = [
      month ? `Mês: ${month}` : 'Mês: Todos',
      year ? `Ano: ${year}` : 'Ano: Todos',
      status && status !== 'TODOS' ? `Status: ${status}` : 'Status: Todos',
      category && category !== 'TODAS' ? `Categoria: ${category}` : 'Categoria: Todas',
      search ? `Busca: "${search}"` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const docDefinition: any = {
      content: [
        { text: 'Relatório - Contas a Pagar', style: 'header', margin: [0, 0, 0, 6] },
        { text: filtersLine, fontSize: 9, margin: [0, 0, 0, 10] },
        {
          table: { headerRows: 1, widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'], body: tableBody },
          layout: 'lightHorizontalLines',
        },
        {
          text: `\nGerado em ${new Date().toLocaleString('pt-BR')}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
      },
      defaultStyle: { font: 'Roboto' },
      pageMargins: [20, 30, 20, 30],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];
    pdfDoc.on('data', (c) => chunks.push(c));
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-contas-a-pagar.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    });
    pdfDoc.end();
  }

  @Get(':id/export-pdf')
  async exportOnePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const account = await this.accountsPayableService.findOne(id);

    const fonts = {
      Roboto: {
        normal: join(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
        bold: join(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
        italics: join(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: join(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf'),
      },
    };
    const printer = new (PdfPrinter as any)(fonts);

    const brl = (n: number) =>
      `R$ ${Number(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const fdate = (d?: Date | string) => (d ? new Date(d).toLocaleString('pt-BR') : '-');
    const parcela =
      account.installmentType === 'PARCELADO' && account.installments && account.currentInstallment
        ? `${account.currentInstallment}/${account.installments}`
        : 'Única';

    const details = [
      [{ text: 'Nome', bold: true }, account.name ?? '-'],
      [{ text: 'Categoria', bold: true }, account.category ?? '-'],
      [{ text: 'Valor', bold: true }, brl(account.value)],
      [{ text: 'Vencimento', bold: true }, fdate(account.dueDate)],
      [{ text: 'Status', bold: true }, account.status ?? '-'],
      [{ text: 'Parcela', bold: true }, parcela],
      [{ text: 'Criado em', bold: true }, fdate(account.createdAt)],
      [{ text: 'Atualizado em', bold: true }, fdate(account.updatedAt)],
    ];

    const paymentsBody = [
      [
        { text: 'Data de Pagamento', style: 'tableHeader' },
        { text: 'Valor', style: 'tableHeader' },
        { text: 'Conta Bancária', style: 'tableHeader' },
      ],
      ...(Array.isArray(account.payments) && account.payments.length > 0
        ? account.payments.map((p: any) => [
          fdate(p.paidAt),
          p.amount != null ? brl(p.amount) : '-',
          p.bankAccount ?? '-',
        ])
        : [[{ text: 'Sem pagamentos registrados', colSpan: 3, italics: true }, {}, {}]]),
    ];

    const docDefinition: any = {
      content: [
        { text: 'Conta a Pagar - Detalhes', style: 'header', margin: [0, 0, 0, 10] },
        {
          table: { widths: ['auto', '*'], body: details },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 14],
        },
        { text: 'Pagamentos', style: 'subheader', margin: [0, 0, 0, 6] },
        {
          table: { headerRows: 1, widths: ['auto', 'auto', '*'], body: paymentsBody },
          layout: 'lightHorizontalLines',
        },
        {
          text: `\nGerado em ${new Date().toLocaleString('pt-BR')}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        subheader: { fontSize: 12, bold: true },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
      },
      defaultStyle: { font: 'Roboto' },
      pageMargins: [20, 30, 20, 30],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];
    pdfDoc.on('data', (c) => chunks.push(c));
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="conta-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    });
    pdfDoc.end();
  }

  // ==== ROTA GENÉRICA POR ÚLTIMO ====
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccountsPayableDto) {
    return this.accountsPayableService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.remove(id);
  }
}
