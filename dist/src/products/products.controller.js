"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const pdfmake_1 = __importDefault(require("pdfmake"));
const exceljs_1 = __importDefault(require("exceljs"));
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    async exportProductsPdf(res) {
        const products = await this.productsService.findAllUnpaginatedFull();
        const fonts = {
            Roboto: {
                normal: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Regular.ttf'),
                bold: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Bold.ttf'),
                italics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-Italic.ttf'),
                bolditalics: (0, path_1.join)(process.cwd(), 'fonts', 'Roboto-BoldItalic.ttf'),
            },
        };
        const printer = new pdfmake_1.default(fonts);
        const tableBody = [
            [
                { text: 'Nome', style: 'tableHeader' },
                { text: 'Categoria', style: 'tableHeader' },
                { text: 'Estoque', style: 'tableHeader' },
                { text: 'Preço Custo', style: 'tableHeader' },
                { text: 'Fornecedor', style: 'tableHeader' },
            ],
            ...products.map((p) => [
                p.name ?? '-',
                p.category?.name ?? '-',
                p.stockQuantity ?? '-',
                p.costPrice != null
                    ? `R$ ${Number(p.costPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '-',
                p.supplier?.name ?? '-',
            ]),
        ];
        const docDefinition = {
            content: [
                { text: 'Relatório de Produtos', style: 'header', margin: [0, 0, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto', 'auto', '*'],
                        body: tableBody,
                    },
                    layout: 'lightHorizontalLines',
                },
                {
                    text: `\nData de geração: ${new Date().toLocaleString('pt-BR')}`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 10, 0, 0],
                },
                {
                    text: 'Gerado pelo Sistema Monitore',
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 20, 0, 0],
                },
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                tableHeader: { bold: true, fillColor: '#eeeeee' },
            },
            defaultStyle: { font: 'Roboto' },
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
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
    async exportProductsExcel(res) {
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
            'Data Cadastro',
        ];
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Produtos');
        worksheet.addRow(headers);
        worksheet.getRow(1).font = { bold: true };
        products.forEach((p) => {
            worksheet.addRow([
                p.id ?? '-',
                p.name ?? '-',
                p.sku ?? '-',
                p.description ?? '-',
                p.category?.name ?? '-',
                p.supplier?.name ?? '-',
                p.stockQuantity ?? '-',
                p.minStockQuantity ?? '-',
                p.costPrice != null
                    ? Number(p.costPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : '-',
                p.status ?? '-',
                p.location ?? '-',
                p.createdAt ? new Date(p.createdAt).toLocaleString('pt-BR') : '-',
            ]);
        });
        (worksheet.columns || []).forEach((column) => {
            if (!column)
                return;
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const v = cell.value;
                const text = v == null
                    ? ''
                    : typeof v === 'object' && 'richText' in v
                        ? v.richText.map((rt) => rt.text).join('')
                        : v.toString();
                maxLength = Math.max(maxLength, text.length);
            });
            column.width = maxLength + 2;
        });
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-produtos.xlsx');
        res.end(buffer);
    }
    findAll(search, categoryId, status, stockLevel, page, limit) {
        return this.productsService.findAll({
            search,
            categoryId: categoryId ? Number(categoryId) : undefined,
            status,
            stockLevel,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    findAllUnpaginated() {
        return this.productsService.findAllUnpaginatedFull();
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    async uploadProductImage(id, file) {
        if (!file)
            throw new common_1.BadRequestException('Nenhum arquivo enviado');
        const imageUrl = `/uploads/products/${file.filename}`;
        await this.productsService.updateMainImageUrl(Number(id), imageUrl);
        return { imageUrl };
    }
    async deleteMainImage(id) {
        return this.productsService.removeMainImage(id);
    }
    listImages(id) {
        return this.productsService.listImages(id);
    }
    async uploadGalleryImages(id, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado');
        }
        const urls = files.map((f) => `/uploads/products/${f.filename}`);
        const created = await this.productsService.addImages(id, urls);
        await this.productsService.ensureMainImage(id, urls[0]).catch(() => { });
        return created;
    }
    async deleteGalleryImage(id, imageId) {
        return this.productsService.removeImage(imageId, id);
    }
    update(id, updateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('export-pdf'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportProductsPdf", null);
__decorate([
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportProductsExcel", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('stockLevel')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllUnpaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Arquivo precisa ser uma imagem'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadProductImage", null);
__decorate([
    (0, common_1.Delete)(':id/main-image'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deleteMainImage", null);
__decorate([
    (0, common_1.Get)(':id/images'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "listImages", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 12, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Arquivo precisa ser uma imagem'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadGalleryImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deleteGalleryImage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map