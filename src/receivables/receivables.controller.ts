import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { FindReceivablesDto } from './dto/find-receivables.dto';
import { Response } from 'express';
import PdfPrinter from 'pdfmake';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) { }

  @Post()
  create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindReceivablesDto) {
    return this.receivablesService.findAll(query);
  }

  // ---------- EXPORTA PDF (LISTA COMPLETA COM FILTROS) ----------
  @Get('export-pdf')
  async exportListPdf(@Query() query: FindReceivablesDto, @Res() res: Response) {
    // busca tudo com filtros (sem paginação) e já recebe status derivado do service
    const fullQuery: FindReceivablesDto = { ...query, page: 1 as any, limit: 100000 as any };
    const { data: rows } = await this.receivablesService.findAll(fullQuery);

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
      d ? new Date(d).toLocaleDateString('pt-BR') : '—';

    const toPeriod = (r: any) => {
      if (r.periodStart || r.periodEnd) {
        return `${fdate(r.periodStart)} → ${fdate(r.periodEnd)}`;
      }
      return r.periodLabel || '—';
    };

    const tableBody = [
      [
        { text: 'Contrato', style: 'th' },
        { text: 'NF', style: 'th' },
        { text: 'Período', style: 'th' },
        { text: 'Emissão', style: 'th' },
        { text: 'Entrega', style: 'th' },
        { text: 'Recebido em', style: 'th' },
        { text: 'Status', style: 'th' },
        { text: 'Bruto', style: 'th' },
        { text: 'Líquido', style: 'th' },
      ],
      ...rows.map((r: any) => [
        r.contract?.code ?? '—',
        r.noteNumber ?? '—',
        toPeriod(r),
        fdate(r.issueDate),
        fdate(r.deliveryDate),
        fdate(r.receivedAt),
        (r.status ?? '').replace('_', ' '),
        money(r.grossAmount),
        money(r.netAmount),
      ]),
    ];

    const docDefinition: any = {
      content: [
        { text: 'Relatório de Recebíveis', style: 'h1', margin: [0, 0, 0, 8] },
        {
          text: buildFiltersLine(query),
          fontSize: 9,
          color: '#555',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
        'Content-Disposition': 'attachment; filename="recebiveis.pdf"',
        'Content-Length': pdf.length,
      });
      res.end(pdf);
    });
    pdfDoc.end();
  }

  // ---------- EXPORTA PDF (INDIVIDUAL) ----------
  @Get(':id/export-pdf')
  async exportOnePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const r = await this.receivablesService.findOne(id);

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
    const toPeriod = (r: any) =>
      r.periodStart || r.periodEnd
        ? `${fdate(r.periodStart)} → ${fdate(r.periodEnd)}`
        : r.periodLabel || '—';

    const details = [
      [{ text: 'Contrato', bold: true }, r.contract?.code ?? '—'],
      [{ text: 'Município', bold: true }, r.contract?.municipality?.name ?? '—'],
      [{ text: 'Órgão/Secretaria', bold: true }, r.contract?.department?.name ?? '—'],
      [{ text: 'NF', bold: true }, r.noteNumber ?? '—'],
      [{ text: 'Período', bold: true }, toPeriod(r)],
      [{ text: 'Emissão', bold: true }, fdate(r.issueDate)],
      [{ text: 'Entrega', bold: true }, fdate(r.deliveryDate)],
      [{ text: 'Recebido em', bold: true }, fdate(r.receivedAt)],
      [{ text: 'Status', bold: true }, (r.status ?? '').replace('_', ' ')],
      [{ text: 'Valor Bruto', bold: true }, money(r.grossAmount)],
      [{ text: 'Valor Líquido', bold: true }, money(r.netAmount)],
    ];

    const docDefinition: any = {
      content: [
        { text: 'Recebível – Detalhes', style: 'h1', margin: [0, 0, 0, 10] },
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
        'Content-Disposition': `attachment; filename="recebivel-${id}.pdf"`,
        'Content-Length': pdf.length,
      });
      res.end(pdf);
    });
    pdfDoc.end();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReceivableDto) {
    return this.receivablesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.remove(id);
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

function buildFiltersLine(q: FindReceivablesDto) {
  const items: string[] = [];
  if (q.municipalityId) items.push(`Município: ${q.municipalityId}`);
  if (q.departmentId) items.push(`Órgão: ${q.departmentId}`);
  if (q.contractId) items.push(`Contrato: ${q.contractId}`);
  if (q.status) items.push(`Status: ${q.status}`);
  if (q.search) items.push(`Busca: "${q.search}"`);
  if (q.issueFrom || q.issueTo) items.push(`Emissão: ${q.issueFrom ?? '—'} → ${q.issueTo ?? '—'}`);
  if (q.orderBy) items.push(`Ordenar por: ${q.orderBy} (${q.order ?? 'desc'})`);
  return items.length ? items.join(' | ') : 'Sem filtros';
}
