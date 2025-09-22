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
exports.StockMovementsController = void 0;
const common_1 = require("@nestjs/common");
const stock_movements_service_1 = require("./stock-movements.service");
const create_stock_movement_dto_1 = require("./dto/create-stock-movement.dto");
const pdfmake_1 = __importDefault(require("pdfmake"));
const fs_1 = require("fs");
const path_1 = require("path");
let StockMovementsController = class StockMovementsController {
    stockMovementsService;
    constructor(stockMovementsService) {
        this.stockMovementsService = stockMovementsService;
    }
    create(createStockMovementDto) {
        return this.stockMovementsService.create(createStockMovementDto);
    }
    findAll(page, limit, search, type, productId, period) {
        return this.stockMovementsService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search,
            type,
            productId: productId ? Number(productId) : undefined,
            period,
        });
    }
    async exportListPdf(search, type, productIdStr, period, res) {
        const productId = productIdStr ? Number(productIdStr) : undefined;
        const rows = await this.stockMovementsService.findForExport({
            search, type, productId, period,
        });
        const fonts = resolveFontsDir();
        const printer = new pdfmake_1.default({
            Roboto: {
                normal: (0, path_1.join)(fonts, 'Roboto-Regular.ttf'),
                bold: (0, path_1.join)(fonts, 'Roboto-Bold.ttf'),
                italics: (0, path_1.join)(fonts, 'Roboto-Italic.ttf'),
                bolditalics: (0, path_1.join)(fonts, 'Roboto-BoldItalic.ttf'),
            },
        });
        const money = (n) => `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const fdate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '—';
        const typeLabel = (t) => t === 'ENTRADA' ? 'Entrada' : t === 'SAIDA' ? 'Saída' : t === 'AJUSTE' ? 'Ajuste' : (t ?? '—');
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
            ...rows.map((r) => [
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
        const docDefinition = {
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
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
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
    async exportOnePdf(id, res) {
        const r = await this.stockMovementsService.findOne(id);
        const fonts = resolveFontsDir();
        const printer = new pdfmake_1.default({
            Roboto: {
                normal: (0, path_1.join)(fonts, 'Roboto-Regular.ttf'),
                bold: (0, path_1.join)(fonts, 'Roboto-Bold.ttf'),
                italics: (0, path_1.join)(fonts, 'Roboto-Italic.ttf'),
                bolditalics: (0, path_1.join)(fonts, 'Roboto-BoldItalic.ttf'),
            },
        });
        const money = (n) => `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const fdate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '—';
        const typeLabel = (t) => t === 'ENTRADA' ? 'Entrada' : t === 'SAIDA' ? 'Saída' : t === 'AJUSTE' ? 'Ajuste' : (t ?? '—');
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
        const docDefinition = {
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
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
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
    findOne(id) {
        return this.stockMovementsService.findOne(id);
    }
    remove(id) {
        return this.stockMovementsService.remove(id);
    }
};
exports.StockMovementsController = StockMovementsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_movement_dto_1.CreateStockMovementDto]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('productId')),
    __param(5, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export-pdf'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('productId')),
    __param(3, (0, common_1.Query)('period')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "exportListPdf", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "exportOnePdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "remove", null);
exports.StockMovementsController = StockMovementsController = __decorate([
    (0, common_1.Controller)('stock-movements'),
    __metadata("design:paramtypes", [stock_movements_service_1.StockMovementsService])
], StockMovementsController);
function resolveFontsDir() {
    const devDir = (0, path_1.join)(process.cwd(), 'fonts');
    if ((0, fs_1.existsSync)(devDir))
        return devDir;
    const distDir = (0, path_1.resolve)(__dirname, '..', '..', 'fonts');
    if ((0, fs_1.existsSync)(distDir))
        return distDir;
    return process.cwd();
}
function buildFiltersLine(q) {
    const items = [];
    if (q.search)
        items.push(`Busca: "${q.search}"`);
    if (q.type)
        items.push(`Tipo: ${q.type}`);
    if (q.productId)
        items.push(`ProdutoID: ${q.productId}`);
    if (q.period)
        items.push(`Período: ${q.period}`);
    return items.length ? items.join(' | ') : 'Sem filtros';
}
//# sourceMappingURL=stock-movements.controller.js.map