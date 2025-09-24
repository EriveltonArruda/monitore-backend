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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfeImportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs = __importStar(require("fs/promises"));
const fast_xml_parser_1 = require("fast-xml-parser");
let NfeImportsService = class NfeImportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ search, page = 1, limit = 10 }) {
        const where = search
            ? {
                OR: [
                    { accessKey: { contains: search } },
                    { emitterName: { contains: search } },
                    { destName: { contains: search } },
                    { number: { contains: search } },
                ],
            }
            : {};
        const [data, total] = await this.prisma.$transaction([
            this.prisma.nfeImport.findMany({
                where,
                orderBy: { id: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    createdAt: true,
                    accessKey: true,
                    number: true,
                    series: true,
                    issueDate: true,
                    emitterName: true,
                    destName: true,
                    totalAmount: true,
                },
            }),
            this.prisma.nfeImport.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOneFull(id) {
        const nfe = await this.prisma.nfeImport.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        return nfe;
    }
    async createFromXml(savedPath) {
        const abs = this.absPath(savedPath);
        let xml = '';
        try {
            xml = await fs.readFile(abs, 'utf-8');
        }
        catch {
            throw new common_1.BadRequestException('Não foi possível ler o arquivo XML salvo.');
        }
        const parsed = this.parseXml(xml);
        const mapped = this.mapParsedToModel(parsed);
        const upserted = await this.prisma.nfeImport.upsert({
            where: { accessKey: mapped.accessKey || '' },
            update: {
                rawXmlPath: savedPath,
                number: mapped.number,
                series: mapped.series,
                issueDate: mapped.issueDate || null,
                emitterCnpj: mapped.emitterCnpj,
                emitterName: mapped.emitterName,
                destCnpj: mapped.destCnpj,
                destName: mapped.destName,
                totalAmount: mapped.totalAmount,
                items: {
                    deleteMany: {},
                    create: mapped.items.map((it) => ({
                        productCode: it.productCode,
                        description: it.description,
                        quantity: it.quantity,
                        unit: it.unit,
                        unitPrice: it.unitPrice,
                        total: it.total,
                    })),
                },
            },
            create: {
                rawXmlPath: savedPath,
                accessKey: mapped.accessKey || null,
                number: mapped.number,
                series: mapped.series,
                issueDate: mapped.issueDate || null,
                emitterCnpj: mapped.emitterCnpj,
                emitterName: mapped.emitterName,
                destCnpj: mapped.destCnpj,
                destName: mapped.destName,
                totalAmount: mapped.totalAmount,
                items: {
                    create: mapped.items.map((it) => ({
                        productCode: it.productCode,
                        description: it.description,
                        quantity: it.quantity,
                        unit: it.unit,
                        unitPrice: it.unitPrice,
                        total: it.total,
                    })),
                },
            },
            include: { items: true },
        });
        return upserted;
    }
    async reprocess(id) {
        const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (!nfe.rawXmlPath)
            throw new common_1.BadRequestException('Importação não possui caminho do XML.');
        return this.createFromXml(nfe.rawXmlPath);
    }
    async getRawXmlPath(id) {
        const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (!nfe.rawXmlPath)
            throw new common_1.NotFoundException('XML não associado.');
        const abs = this.absPath(nfe.rawXmlPath);
        const filename = (nfe.accessKey || `nfe-${id}`) + '.xml';
        return { abs, filename };
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.nfeImport.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.nfeImport.delete({ where: { id } });
    }
    async applyToStock(id, dto) {
        const nfe = await this.prisma.nfeImport.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (!dto?.mappings?.length)
            throw new common_1.BadRequestException('Envie os mapeamentos de itens → produtos.');
        const mapByItemId = new Map();
        for (const m of dto.mappings) {
            if (!m.itemId || !m.productId) {
                throw new common_1.BadRequestException('itemId e productId são obrigatórios em cada mapping.');
            }
            mapByItemId.set(m.itemId, { productId: m.productId, unitPrice: m.unitPrice });
        }
        const ops = [];
        for (const it of nfe.items) {
            const map = mapByItemId.get(it.id);
            if (!map)
                continue;
            const quantity = Number(it.quantity || 0);
            if (!quantity || isNaN(quantity))
                continue;
            const unitPrice = dto.overrideAllUnitPrice ??
                map.unitPrice ??
                (it.unitPrice != null ? Number(it.unitPrice) : undefined);
            ops.push(this.prisma.stockMovement.create({
                data: {
                    type: 'ENTRADA',
                    quantity: Math.round(quantity),
                    details: `Entrada via NF-e Nº ${nfe.number || ''} SÉRIE ${nfe.series || ''}`.trim(),
                    relatedParty: nfe.emitterName || null,
                    unitPriceAtMovement: unitPrice ?? null,
                    notes: null,
                    document: nfe.accessKey || null,
                    product: { connect: { id: map.productId } },
                    user: { connect: { id: dto.userId ?? 1 } },
                },
            }));
            if (dto.setCostPriceFromItem && unitPrice != null) {
                ops.push(this.prisma.product.update({
                    where: { id: map.productId },
                    data: { costPrice: unitPrice },
                }));
            }
            if (dto.updateProductStockMirror) {
                ops.push(this.prisma.product.update({
                    where: { id: map.productId },
                    data: { stockQuantity: { increment: Math.round(quantity) } },
                }));
            }
        }
        await this.prisma.$transaction(ops);
        return { ok: true, movementsCreated: ops.length };
    }
    async attachPdf(id, savedPath) {
        const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (nfe.pdfPath && nfe.pdfPath !== savedPath) {
            const oldAbs = this.absPath(nfe.pdfPath);
            try {
                await fs.unlink(oldAbs);
            }
            catch {
            }
        }
        const updated = await this.prisma.nfeImport.update({
            where: { id },
            data: { pdfPath: savedPath },
        });
        return { ok: true, pdfPath: updated.pdfPath };
    }
    async getPdfPath(id) {
        const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (!nfe.pdfPath)
            throw new common_1.NotFoundException('PDF não associado.');
        const abs = this.absPath(nfe.pdfPath);
        const filename = (nfe.accessKey || `nfe-${id}`) + '.pdf';
        return { abs, filename };
    }
    async removePdf(id) {
        const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
        if (!nfe)
            throw new common_1.NotFoundException('Importação não encontrada');
        if (!nfe.pdfPath)
            return;
        const abs = this.absPath(nfe.pdfPath);
        try {
            await fs.unlink(abs);
        }
        catch {
        }
        await this.prisma.nfeImport.update({
            where: { id },
            data: { pdfPath: null },
        });
    }
    absPath(savedPath) {
        const rel = savedPath.replace(/^\//, '');
        return (0, path_1.join)(process.cwd(), rel);
    }
    async ensureExists(id) {
        const exists = await this.prisma.nfeImport.findUnique({ where: { id }, select: { id: true } });
        if (!exists)
            throw new common_1.NotFoundException('Importação não encontrada');
    }
    parseXml(xml) {
        const parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            parseTagValue: true,
            parseAttributeValue: true,
            trimValues: true,
        });
        return parser.parse(xml);
    }
    mapParsedToModel(parsed) {
        const inf = parsed?.nfeProc?.NFe?.infNFe ||
            parsed?.NFe?.infNFe ||
            parsed?.nfeProc?.NFe?.infNFe?.[0] ||
            parsed?.NFe?.infNFe?.[0];
        if (!inf)
            throw new common_1.BadRequestException('Estrutura de NFe não reconhecida.');
        const ide = inf.ide || {};
        const emit = inf.emit || {};
        const dest = inf.dest || {};
        const accessKey = parsed?.nfeProc?.protNFe?.infProt?.chNFe ||
            parsed?.protNFe?.infProt?.chNFe ||
            null;
        let det = inf.det || [];
        if (!Array.isArray(det))
            det = [det];
        const items = det.map((d) => {
            const prod = d?.prod || {};
            const qCom = Number(prod.qCom ?? prod.qTrib ?? 0);
            const vUnCom = Number(prod.vUnCom ?? prod.vUnTrib ?? 0);
            const vProd = Number(prod.vProd ?? qCom * vUnCom ?? 0);
            return {
                productCode: prod.cProd ?? prod.cEAN ?? null,
                description: prod.xProd ?? null,
                quantity: isNaN(qCom) ? null : qCom,
                unit: prod.uCom ?? prod.uTrib ?? null,
                unitPrice: isNaN(vUnCom) ? null : vUnCom,
                total: isNaN(vProd) ? null : vProd,
            };
        });
        const totalAmount = Number(inf.total?.ICMSTot?.vNF ?? inf.total?.ICMSTot?.vProd ?? 0) || null;
        const issueDateStr = ide.dhEmi || ide.dEmi || null;
        const issueDate = issueDateStr ? new Date(issueDateStr) : null;
        return {
            accessKey,
            number: (ide.nNF ?? ide.nNF?.toString() ?? null),
            series: (ide.serie ?? ide.serie?.toString() ?? null),
            issueDate,
            emitterCnpj: emit.CNPJ ?? null,
            emitterName: emit.xNome ?? null,
            destCnpj: dest.CNPJ ?? null,
            destName: dest.xNome ?? null,
            totalAmount,
            items,
        };
    }
};
exports.NfeImportsService = NfeImportsService;
exports.NfeImportsService = NfeImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NfeImportsService);
//# sourceMappingURL=nfe-imports.service.js.map