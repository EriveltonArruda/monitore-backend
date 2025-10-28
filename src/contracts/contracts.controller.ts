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
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument = require('pdfkit');
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FindContractsDto } from './dto/find-contracts.dto';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'contracts');
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};

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

  // ========== UPLOAD DE ANEXO (PDF) ==========
  /**
   * Envie multipart/form-data com campo "file".
   * Retorna { url: 'uploads/contracts/arquivo.pdf' } para ser salvo no contrato.
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname) || '.pdf';
          const base = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_\-]/g, '');
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          cb(null, `${base || 'contrato'}_${stamp}${ext.toLowerCase()}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf');
        if (!ok) return cb(new BadRequestException('Apenas PDF é permitido.'), false);
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo não recebido.');
    // caminho relativo que vamos guardar no DB e servir via /contracts/:id/attachment
    const rel = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
    return { url: rel }; // ex.: "uploads/contracts/contrato_2025-03-01-12-00-00.pdf"
  }

  // ====== EXPORT PDF (deve vir ANTES de :id) ======

  /** Lista (com filtros da tela) */
  @Get('export-pdf')
  async exportListPdf(@Query() query: FindContractsDto, @Res() res: Response) {
    const safeQuery: FindContractsDto = { ...query, page: 1, limit: 10000 };
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
          ? Number(c.monthlyValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

  /** Individual (download forçado) */
  @Get(':id/export-pdf')
  async exportOnePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const c = await this.contractsService.findOne(id);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `contrato_${c.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    this.drawContractDoc(doc, c);
    doc.end();
  }

  // ====== NOVAS ROTAS PARA ANEXO / VISUALIZAÇÃO INLINE ======

  /** Clipe: abre o anexo (redirect se http/https, ou serve arquivo local) */
  @Get(':id/attachment')
  async getAttachment(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const c = await this.contractsService.findOne(id);
    const url = c.attachmentUrl?.trim();
    if (!url) throw new NotFoundException('Contrato não possui anexo.');

    // URL externa → redireciona
    if (/^https?:\/\//i.test(url)) {
      return res.redirect(302, url);
    }

    // Path local → serve arquivo
    const localPath = path.resolve(url); // ajuste se você usa um diretório base
    if (!fs.existsSync(localPath)) {
      throw new NotFoundException('Arquivo do anexo não encontrado.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="contrato_${id}.pdf"`);
    const stream = fs.createReadStream(localPath);
    stream.pipe(res);
  }

  /** Impressora: mostra o PDF inline (se houver anexo, usa-o; senão, gera relatório inline) */
  @Get(':id/view-pdf')
  async viewPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const c = await this.contractsService.findOne(id);

    // Se tiver anexo: mesmo comportamento do /attachment, mas garantindo inline
    const url = c.attachmentUrl?.trim();
    if (url) {
      if (/^https?:\/\//i.test(url)) {
        // browsers imprimem após abrir a aba; podemos redirecionar
        return res.redirect(302, url);
      }
      const localPath = path.resolve(url);
      if (!fs.existsSync(localPath)) {
        throw new NotFoundException('Arquivo do anexo não encontrado.');
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="contrato_${id}.pdf"`);
      return fs.createReadStream(localPath).pipe(res);
    }

    // Sem anexo → gera PDF inline
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="contrato_${c.id}.pdf"`);
    doc.pipe(res);

    this.drawContractDoc(doc, c);
    doc.end();
  }

  // ====== CRUD com :id (depois das rotas específicas) ======

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }

  // ==== helper para evitar duplicação ao gerar o PDF individual ====
  private drawContractDoc(doc: PDFKit.PDFDocument, c: any) {
    doc.fontSize(18).text(`Contrato ${c.code}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, {
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

    const start = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
    const end = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
    field('Vigência', `${start} → ${end}`);

    field(
      'Valor Mensal',
      c.monthlyValue != null
        ? Number(c.monthlyValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
    doc.fontSize(9).fillColor('#666').text('Relatório gerado pelo sistema', { align: 'center' });
  }
}
