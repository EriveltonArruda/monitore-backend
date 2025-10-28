"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PDFDocument = require("pdfkit");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const contracts_service_1 = require("./contracts.service");
const create_contract_dto_1 = require("./dto/create-contract.dto");
const update_contract_dto_1 = require("./dto/update-contract.dto");
const find_contracts_dto_1 = require("./dto/find-contracts.dto");
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'contracts');
const ensureUploadDir = () => {
    if (!fs.existsSync(UPLOAD_DIR))
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};
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
    upload(file) {
        if (!file)
            throw new common_1.BadRequestException('Arquivo não recebido.');
        const rel = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
        return { url: rel };
    }
    async exportListPdf(query, res) {
        const safeQuery = { ...query, page: 1, limit: 10000 };
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
    async exportOnePdf(id, res) {
        const c = await this.contractsService.findOne(id);
        const doc = new PDFDocument({ margin: 50 });
        const filename = `contrato_${c.id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);
        this.drawContractDoc(doc, c);
        doc.end();
    }
    async getAttachment(id, res) {
        const c = await this.contractsService.findOne(id);
        const url = c.attachmentUrl?.trim();
        if (!url)
            throw new common_1.NotFoundException('Contrato não possui anexo.');
        if (/^https?:\/\//i.test(url)) {
            return res.redirect(302, url);
        }
        const localPath = path.resolve(url);
        if (!fs.existsSync(localPath)) {
            throw new common_1.NotFoundException('Arquivo do anexo não encontrado.');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="contrato_${id}.pdf"`);
        const stream = fs.createReadStream(localPath);
        stream.pipe(res);
    }
    async viewPdf(id, res) {
        const c = await this.contractsService.findOne(id);
        const url = c.attachmentUrl?.trim();
        if (url) {
            if (/^https?:\/\//i.test(url)) {
                return res.redirect(302, url);
            }
            const localPath = path.resolve(url);
            if (!fs.existsSync(localPath)) {
                throw new common_1.NotFoundException('Arquivo do anexo não encontrado.');
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="contrato_${id}.pdf"`);
            return fs.createReadStream(localPath).pipe(res);
        }
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="contrato_${c.id}.pdf"`);
        doc.pipe(res);
        this.drawContractDoc(doc, c);
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
    drawContractDoc(doc, c) {
        doc.fontSize(18).text(`Contrato ${c.code}`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#555').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, {
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
        const start = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
        const end = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
        field('Vigência', `${start} → ${end}`);
        field('Valor Mensal', c.monthlyValue != null
            ? Number(c.monthlyValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
        doc.fontSize(9).fillColor('#666').text('Relatório gerado pelo sistema', { align: 'center' });
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
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
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
            const ok = file.mimetype === 'application/pdf' ||
                file.originalname.toLowerCase().endsWith('.pdf');
            if (!ok)
                return cb(new common_1.BadRequestException('Apenas PDF é permitido.'), false);
            cb(null, true);
        },
        limits: { fileSize: 20 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "upload", null);
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
    (0, common_1.Get)(':id/attachment'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getAttachment", null);
__decorate([
    (0, common_1.Get)(':id/view-pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "viewPdf", null);
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