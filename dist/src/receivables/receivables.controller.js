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
exports.ReceivablesController = void 0;
const common_1 = require("@nestjs/common");
const receivables_service_1 = require("./receivables.service");
const create_receivable_dto_1 = require("./dto/create-receivable.dto");
const update_receivable_dto_1 = require("./dto/update-receivable.dto");
const find_receivables_dto_1 = require("./dto/find-receivables.dto");
const pdfmake_1 = __importDefault(require("pdfmake"));
const fs_1 = require("fs");
const path_1 = require("path");
let ReceivablesController = class ReceivablesController {
    receivablesService;
    constructor(receivablesService) {
        this.receivablesService = receivablesService;
    }
    create(dto) {
        return this.receivablesService.create(dto);
    }
    findAll(query) {
        return this.receivablesService.findAll(query);
    }
    async exportListPdf(query, res) {
        const fullQuery = { ...query, page: 1, limit: 100000 };
        const { data: rows } = await this.receivablesService.findAll(fullQuery);
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
        const fdate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
        const toPeriod = (r) => {
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
            ...rows.map((r) => [
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
        const docDefinition = {
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
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
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
    async exportOnePdf(id, res) {
        const r = await this.receivablesService.findOne(id);
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
        const toPeriod = (r) => r.periodStart || r.periodEnd
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
        const docDefinition = {
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
        const chunks = [];
        pdfDoc.on('data', (c) => chunks.push(c));
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
    findOne(id) {
        return this.receivablesService.findOne(id);
    }
    update(id, dto) {
        return this.receivablesService.update(id, dto);
    }
    remove(id) {
        return this.receivablesService.remove(id);
    }
};
exports.ReceivablesController = ReceivablesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_receivable_dto_1.CreateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_receivables_dto_1.FindReceivablesDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export-pdf'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_receivables_dto_1.FindReceivablesDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "exportListPdf", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "exportOnePdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_receivable_dto_1.UpdateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "remove", null);
exports.ReceivablesController = ReceivablesController = __decorate([
    (0, common_1.Controller)('receivables'),
    __metadata("design:paramtypes", [receivables_service_1.ReceivablesService])
], ReceivablesController);
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
    if (q.municipalityId)
        items.push(`Município: ${q.municipalityId}`);
    if (q.departmentId)
        items.push(`Órgão: ${q.departmentId}`);
    if (q.contractId)
        items.push(`Contrato: ${q.contractId}`);
    if (q.status)
        items.push(`Status: ${q.status}`);
    if (q.search)
        items.push(`Busca: "${q.search}"`);
    if (q.issueFrom || q.issueTo)
        items.push(`Emissão: ${q.issueFrom ?? '—'} → ${q.issueTo ?? '—'}`);
    if (q.orderBy)
        items.push(`Ordenar por: ${q.orderBy} (${q.order ?? 'desc'})`);
    return items.length ? items.join(' | ') : 'Sem filtros';
}
//# sourceMappingURL=receivables.controller.js.map