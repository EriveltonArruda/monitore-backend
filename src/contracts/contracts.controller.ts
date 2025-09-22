import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import PDFDocument = require('pdfkit');

import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FindContractsDto } from './dto/find-contracts.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindContractsDto) {
    return this.contractsService.findAll(query);
  }

  // ====== EXPORT PDF (deve vir ANTES de :id) ======

  /** Lista (com filtros da tela) */
  @Get('export-pdf')
  async exportListPdf(@Query() query: FindContractsDto, @Res() res: Response) {
    const safeQuery: FindContractsDto = {
      ...query,
      page: 1,
      limit: 10000,
    };

    const { data } = await this.contractsService.findAll(safeQuery);

    const doc = new PDFDocument({ margin: 40 });
    const filename = `contratos_${new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[:T]/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(16).text('Relatório de Contratos', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor('#555')
      .text(
        `Gerado em: ${new Date().toLocaleString('pt-BR')}  |  Total: ${data.length}`,
        { align: 'center' },
      );
    doc.moveDown();
    doc.fillColor('#000');

    // Tabela
    const headers = ['Código', 'Município', 'Órgão', 'Vigência', 'Valor Mensal', 'Alerta'];
    const colWidths = [110, 140, 160, 150, 100, 80];

    const drawRow = (values: string[]) => {
      values.forEach((v, i) => {
        doc.fontSize(9).fillColor('#000').text(v || '—', {
          width: colWidths[i],
          continued: i < values.length - 1,
        });
      });
      (doc as any).continued = false;
      doc.moveDown(0.5);
    };

    doc.font('Helvetica-Bold');
    drawRow(headers);
    doc.font('Helvetica');

    data.forEach((c) => {
      const start = c.startDate ? new Date(c.startDate) : null;
      const end = c.endDate ? new Date(c.endDate) : null;
      const period = `${start ? start.toLocaleDateString('pt-BR') : '—'} → ${end ? end.toLocaleDateString('pt-BR') : '—'
        }`;

      const monthly =
        c.monthlyValue != null
          ? Number(c.monthlyValue).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
          : '—';

      drawRow([
        c.code,
        c.municipality?.name ?? '—',
        c.department?.name ?? '—',
        period,
        monthly,
        c.alertTag ?? '—',
      ]);

      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        doc.font('Helvetica-Bold');
        drawRow(headers);
        doc.font('Helvetica');
      }
    });

    doc.end();
  }

  /** Individual */
  @Get(':id/export-pdf')
  async exportOnePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const c = await this.contractsService.findOne(id);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `contrato_${c.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(18).text(`Contrato ${c.code}`, { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor('#555')
      .text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, {
        align: 'center',
      });
    doc.moveDown(1.2);
    doc.fillColor('#000');

    const field = (label: string, value?: string | number | null) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value ?? '—'));
    };

    field('Município', c.municipality?.name);
    field('Órgão/Secretaria', c.department?.name ?? '—');

    const start = c.startDate
      ? new Date(c.startDate).toLocaleDateString('pt-BR')
      : '—';
    const end = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
    field('Vigência', `${start} → ${end}`);

    field(
      'Valor Mensal',
      c.monthlyValue != null
        ? Number(c.monthlyValue).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        : '—',
    );

    field('Status', c.status);
    field('Alerta', c.alertTag ?? '—');
    if (typeof c.daysToEnd === 'number') field('Dias p/ término', c.daysToEnd);

    if (c.description) {
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Descrição');
      doc.font('Helvetica').text(c.description);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666').text('Relatório gerado pelo sistema', {
      align: 'center',
    });

    doc.end();
  }

  // ====== CRUD com :id (depois das rotas específicas) ======

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}
