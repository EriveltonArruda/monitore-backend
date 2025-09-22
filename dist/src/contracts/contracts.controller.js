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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const contracts_service_1 = require("./contracts.service");
const create_contract_dto_1 = require("./dto/create-contract.dto");
const update_contract_dto_1 = require("./dto/update-contract.dto");
const find_contracts_dto_1 = require("./dto/find-contracts.dto");
let ContractsController = class ContractsController {
    contractsService;
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    create(dto) {
        return this.contractsService.create(dto);
    }
    findAll(query) {
        return this.contractsService.findAll(query);
    }
    async exportListPdf(query, res) {
        const safeQuery = {
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
        doc.fontSize(16).text('Relatório de Contratos', { align: 'center' });
        doc.moveDown(0.5);
        doc
            .fontSize(10)
            .fillColor('#555')
            .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}  |  Total: ${data.length}`, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000');
        const headers = ['Código', 'Município', 'Órgão', 'Vigência', 'Valor Mensal', 'Alerta'];
        const colWidths = [110, 140, 160, 150, 100, 80];
        const drawRow = (values) => {
            values.forEach((v, i) => {
                doc.fontSize(9).fillColor('#000').text(v || '—', {
                    width: colWidths[i],
                    continued: i < values.length - 1,
                });
            });
            doc.continued = false;
            doc.moveDown(0.5);
        };
        doc.font('Helvetica-Bold');
        drawRow(headers);
        doc.font('Helvetica');
        data.forEach((c) => {
            const start = c.startDate ? new Date(c.startDate) : null;
            const end = c.endDate ? new Date(c.endDate) : null;
            const period = `${start ? start.toLocaleDateString('pt-BR') : '—'} → ${end ? end.toLocaleDateString('pt-BR') : '—'}`;
            const monthly = c.monthlyValue != null
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
    async exportOnePdf(id, res) {
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
        const field = (label, value) => {
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
        field('Valor Mensal', c.monthlyValue != null
            ? Number(c.monthlyValue).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            })
            : '—');
        field('Status', c.status);
        field('Alerta', c.alertTag ?? '—');
        if (typeof c.daysToEnd === 'number')
            field('Dias p/ término', c.daysToEnd);
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
    findOne(id) {
        return this.contractsService.findOne(id);
    }
    update(id, dto) {
        return this.contractsService.update(id, dto);
    }
    remove(id) {
        return this.contractsService.remove(id);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contract_dto_1.CreateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_contracts_dto_1.FindContractsDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export-pdf'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_contracts_dto_1.FindContractsDto, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "exportListPdf", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "exportOnePdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_contract_dto_1.UpdateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "remove", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map