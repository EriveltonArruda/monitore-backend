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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContractsService = class ContractsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const data = {
            code: dto.code,
            description: dto.description ?? null,
            municipality: { connect: { id: dto.municipalityId } },
            department: dto.departmentId ? { connect: { id: dto.departmentId } } : undefined,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            monthlyValue: dto.monthlyValue ?? null,
        };
        const created = await this.prisma.contract.create({
            data,
            include: { municipality: true, department: true },
        });
        return {
            ...created,
            ...computeAlert(created.endDate, 30),
        };
    }
    async findAll(query) {
        const { page = 1, limit = 10, municipalityId, departmentId, search, endFrom, endTo, dueInDays, expiredOnly, order = 'asc' } = query;
        const where = {};
        const and = [];
        if (municipalityId)
            and.push({ municipalityId: Number(municipalityId) });
        if (departmentId)
            and.push({ departmentId: Number(departmentId) });
        if (search && search.trim() !== '') {
            and.push({
                OR: [
                    { code: { contains: search.trim(), mode: 'insensitive' } },
                    { description: { contains: search.trim(), mode: 'insensitive' } },
                ],
            });
        }
        const endRange = {};
        if (endFrom)
            endRange.gte = startOfDay(toLocalDate(endFrom));
        if (endTo)
            endRange.lte = endOfDay(toLocalDate(endTo));
        if (Object.keys(endRange).length > 0)
            and.push({ endDate: endRange });
        if (expiredOnly && expiredOnly.toString().toLowerCase() === 'true') {
            and.push({ endDate: { lt: startOfDay(new Date()) } });
        }
        if (typeof dueInDays === 'number' && dueInDays > 0) {
            const today = startOfDay(new Date());
            const limitDate = endOfDay(addDays(today, dueInDays));
            and.push({ endDate: { gte: today, lte: limitDate } });
        }
        if (and.length > 0)
            where.AND = and;
        const skip = (Number(page) - 1) * Number(limit);
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.contract.findMany({
                where,
                take: Number(limit),
                skip,
                orderBy: { endDate: order === 'desc' ? 'desc' : 'asc' },
                include: { municipality: true, department: true },
            }),
            this.prisma.contract.count({ where }),
        ]);
        const enriched = rows.map((c) => ({
            ...c,
            ...computeAlert(c.endDate, 30),
        }));
        return {
            data: enriched,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.max(1, Math.ceil(total / Number(limit))),
        };
    }
    async findOne(id) {
        const row = await this.prisma.contract.findUnique({
            where: { id },
            include: { municipality: true, department: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Contrato não encontrado.');
        return { ...row, ...computeAlert(row.endDate, 30) };
    }
    async update(id, dto) {
        const exists = await this.prisma.contract.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Contrato não encontrado.');
        const data = {
            code: dto.code ?? undefined,
            description: dto.description ?? undefined,
            municipality: dto.municipalityId
                ? { connect: { id: dto.municipalityId } }
                : undefined,
            department: dto.departmentId === null
                ? { disconnect: true }
                : dto.departmentId
                    ? { connect: { id: dto.departmentId } }
                    : undefined,
            startDate: dto.startDate !== undefined
                ? dto.startDate
                    ? new Date(dto.startDate)
                    : null
                : undefined,
            endDate: dto.endDate !== undefined
                ? dto.endDate
                    ? new Date(dto.endDate)
                    : null
                : undefined,
            monthlyValue: dto.monthlyValue ?? undefined,
        };
        const updated = await this.prisma.contract.update({
            where: { id },
            data,
            include: { municipality: true, department: true },
        });
        return { ...updated, ...computeAlert(updated.endDate, 30) };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.contract.delete({ where: { id } });
        return { success: true };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
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
function addDays(d, days) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}
function computeAlert(endDate, thresholdDays = 30) {
    if (!endDate)
        return {
            daysToEnd: null,
            alertTag: null,
        };
    const today = startOfDay(new Date());
    const end = startOfDay(new Date(endDate));
    const diffMs = end.getTime() - today.getTime();
    const daysToEnd = Math.round(diffMs / (1000 * 60 * 60 * 24));
    let alertTag = null;
    if (daysToEnd < 0)
        alertTag = 'EXPIRADO';
    else if (daysToEnd === 0)
        alertTag = 'HOJE';
    else if (daysToEnd <= 7)
        alertTag = 'D-7';
    else if (daysToEnd <= thresholdDays)
        alertTag = 'D-30';
    return { daysToEnd, alertTag };
}
//# sourceMappingURL=contracts.service.js.map