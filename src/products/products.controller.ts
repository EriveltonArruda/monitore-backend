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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import PdfPrinter from 'pdfmake';
import { join } from 'path';
import ExcelJS from 'exceljs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('export-pdf')
  async exportProductsPdf(@Res() res: Response) {
    // Busca todos os produtos (apenas campos essenciais)
    const products = await this.productsService.findAllUnpaginatedFull();

    // Fontes do PDFMake
    const fonts = {
      Roboto: {
        normal: join(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
        bold: join(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
        italics: join(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: join(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf')
      }
    };

    const printer = new (PdfPrinter as any)(fonts);

    // Só as colunas essenciais
    const tableBody = [
      [
        { text: 'Nome', style: 'tableHeader' },
        { text: 'Categoria', style: 'tableHeader' },
        { text: 'Estoque', style: 'tableHeader' },
        { text: 'Preço Custo', style: 'tableHeader' },
        { text: 'Fornecedor', style: 'tableHeader' }
      ],
      ...products.map((p: any) => [
        p.name ?? '-',
        p.category?.name ?? '-',
        p.stockQuantity ?? '-',
        p.costPrice != null ? `R$ ${Number(p.costPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-',
        p.supplier?.name ?? '-'
      ])
    ];

    const docDefinition: any = {
      content: [
        { text: 'Relatório de Produtos', style: 'header', margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', '*'],
            body: tableBody
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: `\nData de geração: ${new Date().toLocaleString('pt-BR')}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 10, 0, 0]
        },
        {
          text: 'Gerado pelo Sistema Monitore',
          fontSize: 9,
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center'
        },
        tableHeader: {
          bold: true,
          fillColor: '#eeeeee'
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Cria o PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];

    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-produtos.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    });
    pdfDoc.end();
  }

  @Get('export-excel')
  async exportProductsExcel(@Res() res: Response) {
    const products = await this.productsService.findAllUnpaginatedFull();

    const headers = [
      'ID',
      'Nome',
      'SKU',
      'Descrição',
      'Categoria',
      'Fornecedor',
      'Estoque',
      'Estoque Mínimo',
      'Preço de Custo',
      'Status',
      'Localização',
      'Data Cadastro'
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Produtos');

    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };

    products.forEach((p: any) => {
      worksheet.addRow([
        p.id ?? '-',
        p.name ?? '-',
        p.sku ?? '-',
        p.description ?? '-',
        p.category?.name ?? '-',
        p.supplier?.name ?? '-',
        p.stockQuantity ?? '-',
        p.minStockQuantity ?? '-',
        p.costPrice != null ? Number(p.costPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
        p.status ?? '-',
        p.location ?? '-',
        p.createdAt ? new Date(p.createdAt).toLocaleString('pt-BR') : '-',
      ]);
    });

    // Autoajuste de largura das colunas (com guard para TS)
    (worksheet.columns || []).forEach((column) => {
      if (!column) return; // coluna pode ser undefined no tipo

      let maxLength = 10;

      (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value as any;
        const text =
          v == null
            ? ''
            : typeof v === 'object' && 'richText' in v
              ? v.richText.map((rt: any) => rt.text).join('')
              : v.toString();

        maxLength = Math.max(maxLength, text.length);
      });

      (column as ExcelJS.Column).width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-produtos.xlsx');
    res.end(buffer);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('stockLevel') stockLevel?: 'low' | 'normal',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll({
      search,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status,
      stockLevel,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get('all')
  findAllUnpaginated() {
    return this.productsService.findAllUnpaginatedFull();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Arquivo precisa ser uma imagem'), false);
      }
      cb(null, true);
    }
  }))
  async uploadProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const imageUrl = `/uploads/products/${file.filename}`;
    await this.productsService.updateMainImageUrl(Number(id), imageUrl);
    return { imageUrl };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
