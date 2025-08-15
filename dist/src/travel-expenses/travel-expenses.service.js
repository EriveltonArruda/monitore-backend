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
    async createExpense(dto) {
        const created = await this.prisma.travelExpense.create({
            data: {
                employeeName: dto.employeeName ?? null,
                department: dto.department ?? null,
                description: dto.description ?? null,
                category: dto.category ?? 'OUTROS',
                city: dto.city ?? null,
                state: dto.state ?? null,
                expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
                currency: dto.currency ?? 'BRL',
                amountCents: toCents(dto.amount),
                receiptUrl: dto.receiptUrl ?? null,
                status: 'PENDENTE',
                reimbursedCents: 0,
            },
        });
        return {
            ...created,
            amount: fromCents(created.amountCents),
            reimbursedAmount: fromCents(created.reimbursedCents),
        };
    }
    async create(dto) {
        return this.createExpense(dto);
    }
    async getTotals(expenseId, tx = this.prisma) {
        const [advSum, retSum, exp] = await Promise.all([
            tx.travelAdvance.aggregate({
                where: { travelExpenseId: expenseId },
                _sum: { amountCents: true },
            }),
            tx.travelReturn.aggregate({
                where: { travelExpenseId: expenseId },
                _sum: { amountCents: true },
            }),
            tx.travelExpense.findUnique({ where: { id: expenseId } }),
        ]);
        if (!exp)
            throw new common_1.NotFoundException('Despesa não encontrada');
        const advances = advSum._sum.amountCents ?? 0;
        const returns = retSum._sum.amountCents ?? 0;
        return {
            amountCents: exp.amountCents,
            reimbursedCents: exp.reimbursedCents,
            advancesCents: advances,
            returnsCents: returns,
            status: exp.status,
        };
    }
    computeStatus(amountCents, reimbursedCents, advancesCents, returnsCents) {
        const dueToEmployee = amountCents - advancesCents - reimbursedCents;
        const expectedReturn = dueToEmployee < 0 ? -dueToEmployee : 0;
        const outstandingReturn = Math.max(0, expectedReturn - returnsCents);
        if (dueToEmployee === 0 && outstandingReturn === 0)
            return 'REEMBOLSADO';
        if (reimbursedCents === 0 && advancesCents === 0 && returnsCents === 0)
            return 'PENDENTE';
        return 'PARCIAL';
    }
    async recalcAndUpdateStatus(expenseId, tx = this.prisma) {
        const t = await this.getTotals(expenseId, tx);
        const status = this.computeStatus(t.amountCents, t.reimbursedCents, t.advancesCents, t.returnsCents);
        await tx.travelExpense.update({
            where: { id: expenseId },
            data: { status },
        });
        return status;
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
        if (rows.length === 0) {
            return { data: [], total };
        }
        const ids = rows.map(r => r.id);
        const [advList, retList] = await this.prisma.$transaction([
            this.prisma.travelAdvance.findMany({
                where: { travelExpenseId: { in: ids } },
                select: { travelExpenseId: true, amountCents: true },
            }),
            this.prisma.travelReturn.findMany({
                where: { travelExpenseId: { in: ids } },
                select: { travelExpenseId: true, amountCents: true },
            }),
        ]);
        const advMap = new Map();
        for (const a of advList) {
            advMap.set(a.travelExpenseId, (advMap.get(a.travelExpenseId) ?? 0) + (a.amountCents ?? 0));
        }
        const retMap = new Map();
        for (const r of retList) {
            retMap.set(r.travelExpenseId, (retMap.get(r.travelExpenseId) ?? 0) + (r.amountCents ?? 0));
        }
        const data = rows.map(r => {
            const advancesCents = advMap.get(r.id) ?? 0;
            const returnsCents = retMap.get(r.id) ?? 0;
            return {
                ...r,
                amount: fromCents(r.amountCents),
                reimbursedAmount: fromCents(r.reimbursedCents),
                advancesAmount: fromCents(advancesCents),
                returnsAmount: fromCents(returnsCents),
            };
        });
        return { data, total };
    }
    async findOne(id) {
        const r = await this.prisma.travelExpense.findUnique({
            where: { id },
            include: {
                reimbursements: { orderBy: { reimbursedAt: 'desc' } },
                advances: true,
                returns: true,
            },
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
            advances: r.advances.map((a) => ({ ...a, amount: fromCents(a.amountCents) })),
            returns: r.returns.map((t) => ({ ...t, amount: fromCents(t.amountCents) })),
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
        await this.recalcAndUpdateStatus(id);
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
        const totals = await this.getTotals(expenseId);
        const maxReembolso = Math.max(0, totals.amountCents - totals.advancesCents - totals.reimbursedCents);
        if (amountCents > maxReembolso) {
            throw new common_1.BadRequestException(`Valor excede o restante a reembolsar (restante: ${fromCents(maxReembolso)})`);
        }
        const reimbursement = await this.prisma.$transaction(async (tx) => {
            const created = await tx.travelReimbursement.create({
                data: {
                    travelExpenseId: expenseId,
                    amountCents,
                    reimbursedAt: dto.reimbursedAt ? new Date(dto.reimbursedAt) : new Date(),
                    bankAccount: dto.bankAccount ?? null,
                    notes: dto.notes ?? null,
                },
            });
            await tx.travelExpense.update({
                where: { id: expenseId },
                data: { reimbursedCents: exp.reimbursedCents + amountCents },
            });
            await this.recalcAndUpdateStatus(expenseId, tx);
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
            const exp = await tx.travelExpense.findUnique({ where: { id: expenseId } });
            const newReimbursed = Math.max(0, (exp?.reimbursedCents ?? 0) - rb.amountCents);
            await tx.travelExpense.update({
                where: { id: expenseId },
                data: { reimbursedCents: newReimbursed },
            });
            await this.recalcAndUpdateStatus(expenseId, tx);
        });
        return { deleted: true };
    }
    async listAdvances(expenseId) {
        await this.ensureExists(expenseId);
        const list = await this.prisma.travelAdvance.findMany({
            where: { travelExpenseId: expenseId },
            orderBy: { issuedAt: 'desc' },
        });
        return list.map((a) => ({ ...a, amount: fromCents(a.amountCents) }));
    }
    async addAdvance(expenseId, dto) {
        await this.ensureExists(expenseId);
        const amountCents = toCents(dto.amount);
        if (amountCents <= 0)
            throw new common_1.BadRequestException('Valor do adiantamento deve ser maior que zero');
        const created = await this.prisma.$transaction(async (tx) => {
            const adv = await tx.travelAdvance.create({
                data: {
                    travelExpenseId: expenseId,
                    amountCents,
                    issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
                    method: dto.method ?? null,
                    notes: dto.notes ?? null,
                },
            });
            await this.recalcAndUpdateStatus(expenseId, tx);
            return adv;
        });
        return { ...created, amount: fromCents(created.amountCents) };
    }
    async deleteAdvance(expenseId, advanceId) {
        await this.ensureExists(expenseId);
        const adv = await this.prisma.travelAdvance.findUnique({ where: { id: advanceId } });
        if (!adv || adv.travelExpenseId !== expenseId)
            throw new common_1.NotFoundException('Adiantamento não encontrado');
        await this.prisma.$transaction(async (tx) => {
            await tx.travelAdvance.delete({ where: { id: advanceId } });
            await this.recalcAndUpdateStatus(expenseId, tx);
        });
        return { deleted: true };
    }
    async listReturns(expenseId) {
        await this.ensureExists(expenseId);
        const list = await this.prisma.travelReturn.findMany({
            where: { travelExpenseId: expenseId },
            orderBy: { returnedAt: 'desc' },
        });
        return list.map((r) => ({ ...r, amount: fromCents(r.amountCents) }));
    }
    async addReturn(expenseId, dto) {
        await this.ensureExists(expenseId);
        const amountCents = toCents(dto.amount);
        if (amountCents <= 0)
            throw new common_1.BadRequestException('Valor da devolução deve ser maior que zero');
        const created = await this.prisma.$transaction(async (tx) => {
            const ret = await tx.travelReturn.create({
                data: {
                    travelExpenseId: expenseId,
                    amountCents,
                    returnedAt: dto.returnedAt ? new Date(dto.returnedAt) : new Date(),
                    method: dto.method ?? null,
                    notes: dto.notes ?? null,
                },
            });
            await this.recalcAndUpdateStatus(expenseId, tx);
            return ret;
        });
        return { ...created, amount: fromCents(created.amountCents) };
    }
    async deleteReturn(expenseId, returnId) {
        await this.ensureExists(expenseId);
        const ret = await this.prisma.travelReturn.findUnique({ where: { id: returnId } });
        if (!ret || ret.travelExpenseId !== expenseId)
            throw new common_1.NotFoundException('Devolução não encontrada');
        await this.prisma.$transaction(async (tx) => {
            await tx.travelReturn.delete({ where: { id: returnId } });
            await this.recalcAndUpdateStatus(expenseId, tx);
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