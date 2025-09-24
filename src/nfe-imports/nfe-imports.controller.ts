import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NfeImportsService } from './nfe-imports.service';
import { UpdateNfeImportDto } from './dto/update-nfe-import.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { ApplyToStockDto } from './dto/apply-to-stock.dto';

/** ====== Filtros de arquivo ====== */
function xmlFileFilter(req: any, file: Express.Multer.File, cb: any) {
  const isXml =
    file.mimetype === 'application/xml' ||
    file.mimetype === 'text/xml' ||
    file.originalname.toLowerCase().endsWith('.xml');
  if (!isXml) {
    return cb(new BadRequestException('Envie um arquivo XML válido (.xml).'), false);
  }
  cb(null, true);
}

function pdfFileFilter(req: any, file: Express.Multer.File, cb: any) {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return cb(new BadRequestException('Envie um arquivo PDF válido (.pdf).'), false);
  }
  cb(null, true);
}

@Controller('nfe-imports')
export class NfeImportsController {
  constructor(private readonly service: NfeImportsService) { }

  // ====== LISTAGEM BÁSICA (com paginação simples) ======
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.findAll({
      search: search?.trim() || undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  // ====== DETALHE (com itens) ======
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneFull(id);
  }

  // ====== UPLOAD XML (original) ======
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/nfe',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname).toLowerCase());
        },
      }),
      fileFilter: xmlFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const savedPath = `/uploads/nfe/${file.filename}`;
    return this.service.createFromXml(savedPath);
  }

  // ====== UPLOAD XML (alias para o front) ======
  @Post('upload-xml')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/nfe',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname).toLowerCase());
        },
      }),
      fileFilter: xmlFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadXmlAlias(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const savedPath = `/uploads/nfe/${file.filename}`;
    return this.service.createFromXml(savedPath);
  }

  // ====== REPROCESSAR DO XML BRUTO SALVO ======
  @Post(':id/reprocess')
  reprocess(@Param('id', ParseIntPipe) id: number) {
    return this.service.reprocess(id);
  }

  // ====== APLICAR AO ESTOQUE (gerar StockMovements) ======
  @Post(':id/apply-to-stock')
  applyToStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyToStockDto,
  ) {
    return this.service.applyToStock(id, dto);
  }

  // ====== DOWNLOAD DO XML ORIGINAL (rota antiga) ======
  @Get(':id/download')
  async downloadXmlOld(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { abs, filename } = await this.service.getRawXmlPath(id);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(abs);
  }

  // ====== DOWNLOAD DO XML ORIGINAL (alias usado no front) ======
  @Get(':id/xml')
  async downloadXml(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { abs, filename } = await this.service.getRawXmlPath(id);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(abs);
  }

  // ====== UPLOAD DO PDF DA NF-e ======
  @Post(':id/pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/nfe-pdf',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname).toLowerCase());
        },
      }),
      fileFilter: pdfFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadPdf(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const savedPath = `/uploads/nfe-pdf/${file.filename}`;
    return this.service.attachPdf(id, savedPath);
  }

  // ====== VISUALIZAR/BAIXAR PDF ======
  @Get(':id/pdf')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { abs, filename } = await this.service.getPdfPath(id);
    // inline para pré-visualização no navegador; mude para "attachment" se quiser baixar sempre
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(abs);
  }

  // ====== REMOVER PDF ======
  @Delete(':id/pdf')
  async deletePdf(@Param('id', ParseIntPipe) id: number) {
    await this.service.removePdf(id);
    return { ok: true };
  }

  // ====== UPDATE/DELETE (não essenciais) ======
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNfeImportDto: UpdateNfeImportDto,
  ) {
    return this.service.update(id, updateNfeImportDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
