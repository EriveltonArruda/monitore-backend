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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReceivablesService = class ReceivablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const data = {
            contract: { connect: { id: dto.contractId } },
            noteNumber: dto.noteNumber ?? null,
            issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
            grossAmount: dto.grossAmount ?? null,
            netAmount: dto.netAmount ?? null,
            periodLabel: dto.periodLabel ?? null,
            periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
            periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
            deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
            receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : null,
            status: dto.status ?? 'A_RECEBER',
        };
        return this.prisma.receivable.create({
            data,
            include: {
                contract: { include: { municipality: true, department: true } },
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 20);
        const skip = (page - 1) * limit;
        const { where } = buildReceivablesWhere(query);
        const orderByField = query.orderBy ?? 'issueDate';
        const orderDirection = query.order ?? 'desc';
        const [data, total] = await this.prisma.$transaction([
            this.prisma.receivable.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [orderByField]: orderDirection },
                include: {
                    contract: { include: { municipality: true, department: true } },
                },
            }),
            this.prisma.receivable.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findOne(id) {
        const row = await this.prisma.receivable.findUnique({
            where: { id },
            include: { contract: { include: { municipality: true, department: true } } },
        });
        if (!row)
            throw new common_1.NotFoundException('Recebível não encontrado.');
        return row;
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = {
            contract: dto.contractId ? { connect: { id: dto.contractId } } : undefined,
            noteNumber: dto.noteNumber !== undefined ? dto.noteNumber : undefined,
            issueDate: dto.issueDate !== undefined
                ? dto.issueDate
                    ? new Date(dto.issueDate)
                    : null
                : undefined,
            grossAmount: dto.grossAmount !== undefined ? dto.grossAmount : undefined,
            netAmount: dto.netAmount !== undefined ? dto.netAmount : undefined,
            periodLabel: dto.periodLabel !== undefined ? dto.periodLabel : undefined,
            periodStart: dto.periodStart !== undefined
                ? dto.periodStart
                    ? new Date(dto.periodStart)
                    : null
                : undefined,
            periodEnd: dto.periodEnd !== undefined
                ? dto.periodEnd
                    ? new Date(dto.periodEnd)
                    : null
                : undefined,
            deliveryDate: dto.deliveryDate !== undefined
                ? dto.deliveryDate
                    ? new Date(dto.deliveryDate)
                    : null
                : undefined,
            receivedAt: dto.receivedAt !== undefined
                ? dto.receivedAt
                    ? new Date(dto.receivedAt)
                    : null
                : undefined,
            status: dto.status ?? undefined,
        };
        return this.prisma.receivable.update({
            where: { id },
            data,
            include: { contract: { include: { municipality: true, department: true } } },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.receivable.delete({ where: { id } });
        return { success: true };
    }
    async findForExport(query) {
        const { where } = buildReceivablesWhere(query);
        const orderByField = query.orderBy ?? 'issueDate';
        const orderDirection = query.order ?? 'desc';
        const data = await this.prisma.receivable.findMany({
            where,
            orderBy: { [orderByField]: orderDirection },
            include: {
                contract: { include: { municipality: true, department: true } },
            },
        });
        return data;
    }
};
exports.ReceivablesService = ReceivablesService;
exports.ReceivablesService = ReceivablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceivablesService);
function toLocalDate(ymd) {
    const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d);
}
function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}
function buildReceivablesWhere(query) {
    const where = {};
    const and = [];
    if (query.contractId)
        and.push({ contractId: Number(query.contractId) });
    if (query.municipalityId)
        and.push({ contract: { municipalityId: Number(query.municipalityId) } });
    if (query.departmentId)
        and.push({ contract: { departmentId: Number(query.departmentId) } });
    if (query.status && query.status.trim() !== '')
        and.push({ status: query.status });
    if (query.search && query.search.trim() !== '') {
        and.push({
            OR: [
                { noteNumber: { contains: query.search.trim(), mode: 'insensitive' } },
                { periodLabel: { contains: query.search.trim(), mode: 'insensitive' } },
                { contract: { code: { contains: query.search.trim(), mode: 'insensitive' } } },
            ],
        });
    }
    if (query.issueFrom || query.issueTo) {
        const f = {};
        if (query.issueFrom)
            f.gte = startOfDay(toLocalDate(query.issueFrom));
        if (query.issueTo)
            f.lte = endOfDay(toLocalDate(query.issueTo));
        and.push({ issueDate: f });
    }
    if (query.periodFrom || query.periodTo) {
        const f = {};
        if (query.periodFrom)
            f.gte = startOfDay(toLocalDate(query.periodFrom));
        if (query.periodTo)
            f.lte = endOfDay(toLocalDate(query.periodTo));
        and.push({ periodStart: f });
    }
    if (query.receivedFrom || query.receivedTo) {
        const f = {};
        if (query.receivedFrom)
            f.gte = startOfDay(toLocalDate(query.receivedFrom));
        if (query.receivedTo)
            f.lte = endOfDay(toLocalDate(query.receivedTo));
        and.push({ receivedAt: f });
    }
    if (and.length)
        where.AND = and;
    return { where };
}
//# sourceMappingURL=receivables.service.js.map