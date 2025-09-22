import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { Response } from 'express';
import PdfPrinter from 'pdfmake';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

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

  // ---------- EXPORTA PDF (LISTA COMPLETA COM FILTROS) ----------
  @Get('export-pdf')
  async exportListPdf(
    @Query('search') search: string | undefined,
    @Query('type') type: string | undefined,
    @Query('productId') productIdStr: string | undefined,
    @Query('period') period: string | undefined,
    @Res() res: Response,
  ) {
    const productId = productIdStr ? Number(productIdStr) : undefined;

    const rows = await this.stockMovementsService.findForExport({
      search, type, productId, period,
    });

    const fonts = resolveFontsDir();
    const printer = new (PdfPrinter as any)({
      Roboto: {
        normal: join(fonts, 'Roboto-Regular.ttf'),
        bold: join(fonts, 'Roboto-Bold.ttf'),
        italics: join(fonts, 'Roboto-Italic.ttf'),
        bolditalics: join(fonts, 'Roboto-BoldItalic.ttf'),
      },
    });

    const money = (n: number | null | undefined) =>
      `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const fdate = (d?: string | Date | null) =>
      d ? new Date(d).toLocaleString('pt-BR') : '—';
    const typeLabel = (t?: string) =>
      t === 'ENTRADA' ? 'Entrada' : t === 'SAIDA' ? 'Saída' : t === 'AJUSTE' ? 'Ajuste' : (t ?? '—');

    const tableBody = [
      [
        { text: 'Data/Hora', style: 'th' },
        { text: 'Produto', style: 'th' },
        { text: 'Tipo', style: 'th' },
        { text: 'Quantidade', style: 'th' },
        { text: 'Preço Unit.', style: 'th' },
        { text: 'Total', style: 'th' },
        { text: 'Doc', style: 'th' },
        { text: 'Parte Relac.', style: 'th' },
        { text: 'Detalhes/Obs', style: 'th' },
      ],
      ...rows.map((r: any) => [
        fdate(r.createdAt),
        r.product?.name ?? '—',
        typeLabel(r.type),
        String(r.quantity ?? '—'),
        money(r.unitPriceAtMovement),
        money((r.unitPriceAtMovement || 0) * (r.quantity || 0)),
        r.document ?? '—',
        r.relatedParty ?? '—',
        [r.details, r.notes].filter(Boolean).join(' / ') || '—',
      ]),
    ];

    const filtersLine = buildFiltersLine({ search, type, productId, period });

    const docDefinition: any = {
      content: [
        { text: 'Relatório de Movimentações de Estoque', style: 'h1', margin: [0, 0, 0, 8] },
        { text: filtersLine, fontSize: 9, color: '#555', margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: `\nGerado em ${new Date().toLocaleString('pt-BR')}`,
          alignment: 'right',
          fontSize: 9,
          color: '#777',
        },
      ],
      styles: {
        h1: { fontSize: 16, bold: true, alignment: 'center' },
        th: { bold: true, fillColor: '#efefef' },
      },
      defaultStyle: { font: 'Roboto', fontSize: 10 },
      pageMargins: [18, 24, 18, 24],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (c: Buffer) => chunks.push(c));
    pdfDoc.on('end', () => {
      const pdf = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="movimentacoes-estoque.pdf"',
        'Content-Length': pdf.length,
      });
      res.end(pdf);
    });
    pdfDoc.end();
  }

  // ---------- EXPORTA PDF (INDIVIDUAL) ----------
  @Get(':id/export-pdf')
  async exportOnePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const r = await this.stockMovementsService.findOne(id);

    const fonts = resolveFontsDir();
    const printer = new (PdfPrinter as any)({
      Roboto: {
        normal: join(fonts, 'Roboto-Regular.ttf'),
        bold: join(fonts, 'Roboto-Bold.ttf'),
        italics: join(fonts, 'Roboto-Italic.ttf'),
        bolditalics: join(fonts, 'Roboto-BoldItalic.ttf'),
      },
    });

    const money = (n: number | null | undefined) =>
      `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const fdate = (d?: string | Date | null) =>
      d ? new Date(d).toLocaleString('pt-BR') : '—';
    const typeLabel = (t?: string) =>
      t === 'ENTRADA' ? 'Entrada' : t === 'SAIDA' ? 'Saída' : t === 'AJUSTE' ? 'Ajuste' : (t ?? '—');

    const details = [
      [{ text: 'Produto', bold: true }, r.product?.name ?? '—'],
      [{ text: 'Data/Hora', bold: true }, fdate(r.createdAt)],
      [{ text: 'Tipo', bold: true }, typeLabel(r.type)],
      [{ text: 'Quantidade', bold: true }, String(r.quantity ?? '—')],
      [{ text: 'Preço Unitário', bold: true }, money(r.unitPriceAtMovement)],
      [{ text: 'Total', bold: true }, money((r.unitPriceAtMovement || 0) * (r.quantity || 0))],
      [{ text: 'Documento', bold: true }, r.document ?? '—'],
      [{ text: 'Parte Relacionada', bold: true }, r.relatedParty ?? '—'],
      [{ text: 'Detalhes', bold: true }, r.details ?? '—'],
      [{ text: 'Observações', bold: true }, r.notes ?? '—'],
    ];

    const docDefinition: any = {
      content: [
        { text: 'Movimentação de Estoque – Detalhes', style: 'h1', margin: [0, 0, 0, 10] },
        {
          table: { widths: ['auto', '*'], body: details },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
        {
          text: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
          alignment: 'right',
          fontSize: 9,
          color: '#777',
        },
      ],
      styles: {
        h1: { fontSize: 16, bold: true, alignment: 'center' },
      },
      defaultStyle: { font: 'Roboto', fontSize: 10 },
      pageMargins: [18, 24, 18, 24],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (c: Buffer) => chunks.push(c));
    pdfDoc.on('end', () => {
      const pdf = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="movimentacao-${id}.pdf"`,
        'Content-Length': pdf.length,
      });
      res.end(pdf);
    });
    pdfDoc.end();
  }

  // ---------- Detalhes (JSON) ----------
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.remove(id);
  }
}

/* =========================
   Helpers
========================= */
function resolveFontsDir(): string {
  const devDir = join(process.cwd(), 'fonts');
  if (existsSync(devDir)) return devDir;

  const distDir = resolve(__dirname, '..', '..', 'fonts');
  if (existsSync(distDir)) return distDir;

  return process.cwd();
}

function buildFiltersLine(q: { search?: string; type?: string; productId?: number; period?: string }) {
  const items: string[] = [];
  if (q.search) items.push(`Busca: "${q.search}"`);
  if (q.type) items.push(`Tipo: ${q.type}`);
  if (q.productId) items.push(`ProdutoID: ${q.productId}`);
  if (q.period) items.push(`Período: ${q.period}`);
  return items.length ? items.join(' | ') : 'Sem filtros';
}
