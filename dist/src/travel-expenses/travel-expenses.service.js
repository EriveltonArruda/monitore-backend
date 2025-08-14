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
exports.TravelExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const toCents = (n) => Math.round(Number(n) * 100);
const fromCents = (c) => Number((c / 100).toFixed(2));
let TravelExpensesService = class TravelExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const created = await this.prisma.travelExpense.create({
            data: {
                employeeName: dto.employeeName ?? null,
                department: dto.department ?? null,
                description: dto.description ?? null,
                category: dto.category ?? 'OUTROS',
                city: dto.city ?? null,
                state: dto.state ?? null,
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : null,
                currency: dto.currency ?? 'BRL',
                amountCents: toCents(dto.amount),
                receiptUrl: dto.receiptUrl ?? null,
            },
        });
        return {
            ...created,
            amount: fromCents(created.amountCents),
            reimbursedAmount: fromCents(created.reimbursedCents),
        };
    }
    async findAll(params = {}) {
        const { page = 1, pageSize = 10, month, year, status, category, search, } = params;
        const where = {};
        if (year && month) {
            const y = Number(year);
            const m = Number(month) - 1;
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 1);
            where.expenseDate = { gte: start, lt: end };
        }
        else if (year && !month) {
            const y = Number(year);
            const start = new Date(y, 0, 1);
            const end = new Date(y + 1, 0, 1);
            where.expenseDate = { gte: start, lt: end };
        }
        else if (!year && month) {
            const y = new Date().getFullYear();
            const m = Number(month) - 1;
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 1);
            where.expenseDate = { gte: start, lt: end };
        }
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { employeeName: { contains: search } },
                { department: { contains: search } },
                { description: { contains: search } },
                { city: { contains: search } },
            ];
        }
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.travelExpense.findMany({
                where,
                orderBy: { expenseDate: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.travelExpense.count({ where }),
        ]);
        return {
            data: rows.map((r) => ({
                ...r,
                amount: fromCents(r.amountCents),
                reimbursedAmount: fromCents(r.reimbursedCents),
            })),
            total,
        };
    }
    async findOne(id) {
        const r = await this.prisma.travelExpense.findUnique({
            where: { id },
            include: { reimbursements: { orderBy: { reimbursedAt: 'desc' } } },
        });
        if (!r)
            throw new common_1.NotFoundException('Despesa não encontrada');
        return {
            ...r,
            amount: fromCents(r.amountCents),
            reimbursedAmount: fromCents(r.reimbursedCents),
            reimbursements: r.reimbursements.map((x) => ({
                ...x,
                amount: fromCents(x.amountCents),
            })),
        };
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const updated = await this.prisma.travelExpense.update({
            where: { id },
            data: {
                employeeName: dto.employeeName ?? undefined,
                department: dto.department ?? undefined,
                description: dto.description ?? undefined,
                category: dto.category ?? undefined,
                city: dto.city ?? undefined,
                state: dto.state ?? undefined,
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
                currency: dto.currency ?? undefined,
                amountCents: dto.amount !== undefined ? toCents(dto.amount) : undefined,
                receiptUrl: dto.receiptUrl ?? undefined,
                status: dto.status ?? undefined,
            },
        });
        return {
            ...updated,
            amount: fromCents(updated.amountCents),
            reimbursedAmount: fromCents(updated.reimbursedCents),
        };
    }
    async remove(id) {
        await this.ensureExists(id);
        await this.prisma.travelExpense.delete({ where: { id } });
        return { deleted: true };
    }
    async listReimbursements(expenseId) {
        await this.ensureExists(expenseId);
        const list = await this.prisma.travelReimbursement.findMany({
            where: { travelExpenseId: expenseId },
            orderBy: { reimbursedAt: 'desc' },
        });
        return list.map((r) => ({
            ...r,
            amount: fromCents(r.amountCents),
        }));
    }
    async addReimbursement(expenseId, dto) {
        const exp = await this.ensureExists(expenseId);
        const amountCents = toCents(dto.amount);
        if (amountCents <= 0)
            throw new common_1.BadRequestException('Valor do reembolso deve ser maior que zero');
        const remaining = exp.amountCents - exp.reimbursedCents;
        if (amountCents > remaining) {
            throw new common_1.BadRequestException(`Valor excede o restante a reembolsar (restante: ${fromCents(remaining)})`);
        }
        const reimbursement = await this.prisma.$transaction(async (tx) => {
            const created = await tx.travelReimbursement.create({
                data: {
                    travelExpenseId: expenseId,
                    amountCents,
                    reimbursedAt: dto.reimbursedAt
                        ? new Date(dto.reimbursedAt)
                        : new Date(),
                    bankAccount: dto.bankAccount ?? null,
                    notes: dto.notes ?? null,
                },
            });
            const newReimbursed = exp.reimbursedCents + amountCents;
            const status = newReimbursed === exp.amountCents
                ? 'REEMBOLSADO'
                : newReimbursed > 0
                    ? 'PARCIAL'
                    : 'PENDENTE';
            await tx.travelExpense.update({
                where: { id: expenseId },
                data: {
                    reimbursedCents: newReimbursed,
                    status,
                },
            });
            return created;
        });
        return { ...reimbursement, amount: fromCents(reimbursement.amountCents) };
    }
    async deleteReimbursement(expenseId, reimbursementId) {
        await this.ensureExists(expenseId);
        const rb = await this.prisma.travelReimbursement.findUnique({
            where: { id: reimbursementId },
        });
        if (!rb || rb.travelExpenseId !== expenseId)
            throw new common_1.NotFoundException('Reembolso não encontrado');
        await this.prisma.$transaction(async (tx) => {
            await tx.travelReimbursement.delete({ where: { id: reimbursementId } });
            const exp = await tx.travelExpense.findUnique({
                where: { id: expenseId },
            });
            const newReimbursed = Math.max(0, exp.reimbursedCents - rb.amountCents);
            const status = newReimbursed === 0
                ? 'PENDENTE'
                : newReimbursed === exp.amountCents
                    ? 'REEMBOLSADO'
                    : 'PARCIAL';
            await tx.travelExpense.update({
                where: { id: expenseId },
                data: {
                    reimbursedCents: newReimbursed,
                    status,
                },
            });
        });
        return { deleted: true };
    }
    async ensureExists(id) {
        const exp = await this.prisma.travelExpense.findUnique({ where: { id } });
        if (!exp)
            throw new common_1.NotFoundException('Despesa não encontrada');
        return exp;
    }
};
exports.TravelExpensesService = TravelExpensesService;
exports.TravelExpensesService = TravelExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TravelExpensesService);
//# sourceMappingURL=travel-expenses.service.js.map