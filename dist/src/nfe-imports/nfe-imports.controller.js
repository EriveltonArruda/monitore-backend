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
exports.NfeImportsController = void 0;
const common_1 = require("@nestjs/common");
const nfe_imports_service_1 = require("./nfe-imports.service");
const update_nfe_import_dto_1 = require("./dto/update-nfe-import.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const apply_to_stock_dto_1 = require("./dto/apply-to-stock.dto");
function xmlFileFilter(req, file, cb) {
    const isXml = file.mimetype === 'application/xml' ||
        file.mimetype === 'text/xml' ||
        file.originalname.toLowerCase().endsWith('.xml');
    if (!isXml) {
        return cb(new common_1.BadRequestException('Envie um arquivo XML válido (.xml).'), false);
    }
    cb(null, true);
}
function pdfFileFilter(req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf' ||
        file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
        return cb(new common_1.BadRequestException('Envie um arquivo PDF válido (.pdf).'), false);
    }
    cb(null, true);
}
let NfeImportsController = class NfeImportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(search, page = '1', limit = '10') {
        return this.service.findAll({
            search: search?.trim() || undefined,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    }
    findOne(id) {
        return this.service.findOneFull(id);
    }
    async upload(file) {
        if (!file)
            throw new common_1.BadRequestException('Nenhum arquivo enviado.');
        const savedPath = `/uploads/nfe/${file.filename}`;
        return this.service.createFromXml(savedPath);
    }
    async uploadXmlAlias(file) {
        if (!file)
            throw new common_1.BadRequestException('Nenhum arquivo enviado.');
        const savedPath = `/uploads/nfe/${file.filename}`;
        return this.service.createFromXml(savedPath);
    }
    reprocess(id) {
        return this.service.reprocess(id);
    }
    applyToStock(id, dto) {
        return this.service.applyToStock(id, dto);
    }
    async downloadXmlOld(id, res) {
        const { abs, filename } = await this.service.getRawXmlPath(id);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.sendFile(abs);
    }
    async downloadXml(id, res) {
        const { abs, filename } = await this.service.getRawXmlPath(id);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.sendFile(abs);
    }
    async uploadPdf(id, file) {
        if (!file)
            throw new common_1.BadRequestException('Nenhum arquivo enviado.');
        const savedPath = `/uploads/nfe-pdf/${file.filename}`;
        return this.service.attachPdf(id, savedPath);
    }
    async getPdf(id, res) {
        const { abs, filename } = await this.service.getPdfPath(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.sendFile(abs);
    }
    async deletePdf(id) {
        await this.service.removePdf(id);
        return { ok: true };
    }
    update(id, updateNfeImportDto) {
        return this.service.update(id, updateNfeImportDto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.NfeImportsController = NfeImportsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/nfe',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname).toLowerCase());
            },
        }),
        fileFilter: xmlFileFilter,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('upload-xml'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/nfe',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname).toLowerCase());
            },
        }),
        fileFilter: xmlFileFilter,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "uploadXmlAlias", null);
__decorate([
    (0, common_1.Post)(':id/reprocess'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "reprocess", null);
__decorate([
    (0, common_1.Post)(':id/apply-to-stock'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, apply_to_stock_dto_1.ApplyToStockDto]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "applyToStock", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "downloadXmlOld", null);
__decorate([
    (0, common_1.Get)(':id/xml'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "downloadXml", null);
__decorate([
    (0, common_1.Post)(':id/pdf'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/nfe-pdf',
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, unique + (0, path_1.extname)(file.originalname).toLowerCase());
            },
        }),
        fileFilter: pdfFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "uploadPdf", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "getPdf", null);
__decorate([
    (0, common_1.Delete)(':id/pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NfeImportsController.prototype, "deletePdf", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_nfe_import_dto_1.UpdateNfeImportDto]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NfeImportsController.prototype, "remove", null);
exports.NfeImportsController = NfeImportsController = __decorate([
    (0, common_1.Controller)('nfe-imports'),
    __metadata("design:paramtypes", [nfe_imports_service_1.NfeImportsService])
], NfeImportsController);
//# sourceMappingURL=nfe-imports.controller.js.map