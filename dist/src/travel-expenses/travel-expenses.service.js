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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const json2csv_1 = require("json2csv");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fromCents = (c) => Number((c / 100).toFixed(2));
const toCentsSmart = (val) => {
    if (typeof val === 'number') {
        if (!Number.isFinite(val))
            throw new common_1.BadRequestException('Valor inválido');
        return Math.round(val * 100);
    }
    if (typeof val === 'string') {
        const norm = val.replace(/\./g, '').replace(',', '.').trim();
        const num = Number(norm);
        if (Number.isNaN(num))
            throw new common_1.BadRequestException('Valor inválido');
        return Math.round(num * 100);
    }
    throw new common_1.BadRequestException('Valor inválido');
};
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
                amountCents: toCentsSmart(dto.amount),
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
        const [advSum, retSum, reiSum, exp] = await Promise.all([
            tx.travelAdvance.aggregate({
                where: { travelExpenseId: expenseId },
                _sum: { amountCents: true },
            }),
            tx.travelReturn.aggregate({
                where: { travelExpenseId: expenseId },
                _sum: { amountCents: true },
            }),
            tx.travelReimbursement.aggregate({
                where: { travelExpenseId: expenseId },
                _sum: { amountCents: true },
            }),
            tx.travelExpense.findUnique({ where: { id: expenseId } }),
        ]);
        if (!exp)
            throw new common_1.NotFoundException('Despesa não encontrada');
        const advancesCents = advSum._sum.amountCents ?? 0;
        const returnsCents = retSum._sum.amountCents ?? 0;
        const reimbursedCentsAgg = reiSum._sum.amountCents ?? 0;
        return {
            amountCents: exp.amountCents,
            reimbursedCentsAgg,
            advancesCents,
            returnsCents,
            status: exp.status,
        };
    }
    round2c(n) {
        return Math.round(n);
    }
    computeBalanceCents(amountCents, reimbursedCents, advancesCents, returnsCents) {
        return this.round2c(amountCents - advancesCents - reimbursedCents + returnsCents);
    }
    computeStatusByBalance(balanceCents) {
        if (balanceCents <= 0)
            return 'REEMBOLSADO';
        return 'PARCIAL';
    }
    async recalcAndUpdateStatus(expenseId, tx = this.prisma) {
        const t = await this.getTotals(expenseId, tx);
        const balanceCents = this.computeBalanceCents(t.amountCents, t.reimbursedCentsAgg, t.advancesCents, t.returnsCents);
        let nextStatus = this.computeStatusByBalance(balanceCents);
        if (t.advancesCents === 0 && t.reimbursedCentsAgg === 0 && t.returnsCents === 0) {
            nextStatus = 'PENDENTE';
        }
        await tx.travelExpense.update({
            where: { id: expenseId },
            data: {
                reimbursedCents: t.reimbursedCentsAgg,
                status: nextStatus,
            },
        });
        return nextStatus;
    }
    buildWhere(filters) {
        const month = typeof filters.month === 'string' ? Number(filters.month) : filters.month;
        const year = typeof filters.year === 'string' ? Number(filters.year) : filters.year;
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
        if (filters.status)
            where.status = filters.status;
        if (filters.category)
            where.category = filters.category;
        if (filters.search) {
            where.OR = [
                { employeeName: { contains: filters.search, mode: 'insensitive' } },
                { department: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { city: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return where;
    }
    async findAll(params = {}) {
        const { page = 1, pageSize = 10, month, year, status, category, search, } = params;
        const where = this.buildWhere({ month, year, status, category, search });
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
            return {
                data: [],
                total,
                page,
                totalPages: Math.ceil(total / pageSize) || 1,
                limit: pageSize,
            };
        }
        const ids = rows.map((r) => r.id);
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
        const data = rows.map((r) => {
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
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / pageSize) || 1,
            limit: pageSize,
        };
    }
    async exportCsv(filters) {
        const where = this.buildWhere(filters);
        const rows = await this.prisma.travelExpense.findMany({
            where,
            orderBy: { expenseDate: 'desc' },
        });
        if (rows.length === 0) {
            const parser = new json2csv_1.Parser();
            return parser.parse([]);
        }
        const ids = rows.map((r) => r.id);
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
        const flat = rows.map((r) => ({
            ID: r.id,
            Funcionário: r.employeeName ?? '',
            Departamento: r.department ?? '',
            Descrição: r.description ?? '',
            Categoria: r.category ?? '',
            Cidade: r.city ?? '',
            Estado: r.state ?? '',
            Data: r.expenseDate
                ? new Date(r.expenseDate).toISOString().slice(0, 10)
                : '',
            Moeda: r.currency ?? 'BRL',
            Valor: fromCents(r.amountCents),
            Adiantado: fromCents(advMap.get(r.id) ?? 0),
            Devolvido: fromCents(retMap.get(r.id) ?? 0),
            Reembolsado: fromCents(r.reimbursedCents),
            Status: r.status,
        }));
        const parser = new json2csv_1.Parser();
        return parser.parse(flat);
    }
    async exportPdf(filters) {
        const where = this.buildWhere(filters);
        const rows = await this.prisma.travelExpense.findMany({
            where,
            orderBy: { expenseDate: 'desc' },
        });
        const ids = rows.map((r) => r.id);
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
        const doc = new pdfkit_1.default({ margin: 40 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('error', () => { });
        doc.fontSize(16).text('Relatório de Despesas de Viagem', { align: 'center' });
        doc.moveDown(0.5);
        const filtParts = [];
        if (filters.month)
            filtParts.push(`Mês: ${filters.month}`);
        if (filters.year)
            filtParts.push(`Ano: ${filters.year}`);
        if (filters.status)
            filtParts.push(`Status: ${filters.status}`);
        if (filters.category)
            filtParts.push(`Categoria: ${filters.category}`);
        if (filters.search)
            filtParts.push(`Busca: ${filters.search}`);
        if (filtParts.length)
            doc.fontSize(10).text(filtParts.join('  |  '), { align: 'center' });
        doc.moveDown();
        doc.fontSize(11).text('Func.', 40, doc.y, { continued: true, width: 150 });
        doc.text('Cat.', { continued: true, width: 90 });
        doc.text('Data', { continued: true, width: 70 });
        doc.text('Local', { continued: true, width: 110 });
        doc.text('Valor', { continued: true, width: 70 });
        doc.text('Adiant.', { continued: true, width: 70 });
        doc.text('Devolv.', { continued: true, width: 70 });
        doc.text('Reemb.', { continued: true, width: 70 });
        doc.text('Status', { width: 80 });
        doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
        doc.moveDown(0.5);
        const money = (n) => fromCents(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        rows.forEach((r) => {
            const local = [r.city, r.state].filter(Boolean).join(' / ');
            doc.fontSize(10).text(r.employeeName ?? '—', 40, doc.y, { continued: true, width: 150 });
            doc.text(r.category ?? '—', { continued: true, width: 90 });
            doc.text(r.expenseDate ? new Date(r.expenseDate).toLocaleDateString('pt-BR') : '—', {
                continued: true,
                width: 70,
            });
            doc.text(local || '—', { continued: true, width: 110 });
            doc.text(money(r.amountCents), { continued: true, width: 70 });
            doc.text(money(advMap.get(r.id) ?? 0), { continued: true, width: 70 });
            doc.text(money(retMap.get(r.id) ?? 0), { continued: true, width: 70 });
            doc.text(money(r.reimbursedCents), { continued: true, width: 70 });
            doc.text(r.status, { width: 80 });
        });
        const totalValor = rows.reduce((acc, r) => acc + r.amountCents, 0);
        const totalAdiant = rows.reduce((acc, r) => acc + (advMap.get(r.id) ?? 0), 0);
        const totalDevolv = rows.reduce((acc, r) => acc + (retMap.get(r.id) ?? 0), 0);
        const totalReemb = rows.reduce((acc, r) => acc + r.reimbursedCents, 0);
        doc.moveDown();
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(11).text(`Totais — Valor: ${money(totalValor)}  |  Adiantado: ${money(totalAdiant)}  |  Devolvido: ${money(totalDevolv)}  |  Reembolsado: ${money(totalReemb)}`);
        doc.end();
        return await new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
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
                amountCents: dto.amount !== undefined ? toCentsSmart(dto.amount) : undefined,
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
        await this.ensureExists(expenseId);
        const amountCents = toCentsSmart(dto.amount);
        if (amountCents <= 0)
            throw new common_1.BadRequestException('Valor do reembolso deve ser maior que zero');
        const totalsBefore = await this.getTotals(expenseId);
        const maxReembolso = Math.max(0, totalsBefore.amountCents - totalsBefore.advancesCents - totalsBefore.reimbursedCentsAgg);
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
        const amountCents = toCentsSmart(dto.amount);
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
        const amountCents = toCentsSmart(dto.amount);
        if (amountCents <= 0)
            throw new common_1.BadRequestException('Valor da devolução deve ser maior que zero');
        const totals = await this.getTotals(expenseId);
        const expectedReturn = Math.max(0, totals.advancesCents - (totals.amountCents - totals.reimbursedCentsAgg));
        const outstandingReturn = Math.max(0, expectedReturn - totals.returnsCents);
        if (amountCents > outstandingReturn) {
            throw new common_1.BadRequestException(`Valor excede a devolução esperada (restante: ${fromCents(outstandingReturn)})`);
        }
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