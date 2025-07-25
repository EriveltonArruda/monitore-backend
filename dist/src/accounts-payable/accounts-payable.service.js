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
exports.AccountsPayableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AccountsPayableService = class AccountsPayableService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAccountsPayableDto) {
        const { installmentType, dueDate, isRecurring, recurringUntil } = createAccountsPayableDto;
        if (installmentType === 'UNICA') {
            createAccountsPayableDto.installments = null;
            createAccountsPayableDto.currentInstallment = null;
        }
        if (dueDate) {
            const parsed = new Date(dueDate);
            parsed.setHours(0, 0, 0, 0);
            createAccountsPayableDto.dueDate = parsed;
        }
        const originalAccount = await this.prisma.accountPayable.create({
            data: createAccountsPayableDto,
        });
        if (isRecurring && recurringUntil) {
            const startDate = new Date(createAccountsPayableDto.dueDate);
            const endDate = new Date(recurringUntil);
            endDate.setHours(0, 0, 0, 0);
            const originalDay = startDate.getDate();
            let currentYear = startDate.getFullYear();
            let currentMonth = startDate.getMonth() + 1;
            while (true) {
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const adjustedDay = Math.min(originalDay, lastDayOfMonth);
                const nextDueDate = new Date(currentYear, currentMonth, adjustedDay);
                nextDueDate.setHours(0, 0, 0, 0);
                if (nextDueDate > endDate)
                    break;
                await this.prisma.accountPayable.create({
                    data: {
                        name: originalAccount.name,
                        category: originalAccount.category,
                        value: originalAccount.value,
                        dueDate: nextDueDate,
                        status: 'A_PAGAR',
                        installmentType: 'UNICA',
                        installments: null,
                        currentInstallment: null,
                        isRecurring: false,
                        recurringUntil: null,
                        recurringSourceId: originalAccount.id,
                    },
                });
                currentMonth++;
            }
        }
        return originalAccount;
    }
    async findAll(params) {
        const { page, limit, month, year } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            where.dueDate = {
                gte: startDate,
                lte: endDate,
            };
        }
        const [accounts, total] = await this.prisma.$transaction([
            this.prisma.accountPayable.findMany({
                where,
                orderBy: { dueDate: 'asc' },
                skip,
                take: limit,
                include: {
                    payments: true,
                },
            }),
            this.prisma.accountPayable.count({ where }),
        ]);
        return {
            data: accounts,
            total,
        };
    }
    async findOne(id) {
        const account = await this.prisma.accountPayable.findUnique({
            where: { id },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Conta com ID #${id} não encontrada.`);
        }
        return account;
    }
    async update(id, updateAccountsPayableDto) {
        const existingAccount = await this.findOne(id);
        const dataToUpdate = { ...updateAccountsPayableDto };
        if (updateAccountsPayableDto.dueDate) {
            const parsed = new Date(updateAccountsPayableDto.dueDate);
            parsed.setHours(0, 0, 0, 0);
            dataToUpdate.dueDate = parsed;
        }
        const statusUpdatedToPaid = updateAccountsPayableDto.status === 'PAGO';
        const updatedAccount = await this.prisma.accountPayable.update({
            where: { id },
            data: dataToUpdate,
        });
        if (statusUpdatedToPaid) {
            const existingPayments = await this.prisma.payment.findMany({
                where: { accountId: id },
            });
            const totalPaid = existingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const remainingAmount = updatedAccount.value - totalPaid;
            if (remainingAmount > 0) {
                await this.prisma.payment.create({
                    data: {
                        accountId: id,
                        paidAt: new Date(),
                        amount: remainingAmount,
                    },
                });
            }
        }
        if (statusUpdatedToPaid &&
            existingAccount.installmentType === 'PARCELADO' &&
            existingAccount.currentInstallment &&
            existingAccount.installments &&
            existingAccount.currentInstallment < existingAccount.installments) {
            const nextInstallment = existingAccount.currentInstallment + 1;
            const currentDueDate = new Date(existingAccount.dueDate);
            const nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1));
            nextDueDate.setHours(0, 0, 0, 0);
            await this.prisma.accountPayable.create({
                data: {
                    name: existingAccount.name,
                    category: existingAccount.category,
                    value: existingAccount.value,
                    dueDate: nextDueDate,
                    status: 'A_PAGAR',
                    installmentType: 'PARCELADO',
                    installments: existingAccount.installments,
                    currentInstallment: nextInstallment,
                },
            });
        }
        return updatedAccount;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.payment.deleteMany({
            where: { accountId: id },
        });
        return this.prisma.accountPayable.delete({
            where: { id },
        });
    }
    async registerPayment(accountId, paidAt) {
        const account = await this.prisma.accountPayable.findUnique({
            where: { id: accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Conta a pagar não encontrada.');
        }
        if (account.status !== 'PAGO') {
            await this.prisma.accountPayable.update({
                where: { id: accountId },
                data: { status: 'PAGO' },
            });
        }
        return this.prisma.payment.create({
            data: {
                accountId,
                paidAt,
            },
        });
    }
};
exports.AccountsPayableService = AccountsPayableService;
exports.AccountsPayableService = AccountsPayableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsPayableService);
//# sourceMappingURL=accounts-payable.service.js.map