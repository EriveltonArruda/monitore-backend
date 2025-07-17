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
    create(createAccountsPayableDto) {
        const { installmentType } = createAccountsPayableDto;
        if (installmentType === 'UNICA') {
            createAccountsPayableDto.installments = null;
            createAccountsPayableDto.currentInstallment = null;
        }
        return this.prisma.accountPayable.create({
            data: createAccountsPayableDto,
        });
    }
    async findAll(params) {
        const { page, limit, month, year } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
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
            }),
            this.prisma.accountPayable.count({ where }),
        ]);
        return {
            data: accounts,
            total,
        };
    }
    async findOne(id) {
        const account = await this.prisma.accountPayable.findUnique({ where: { id } });
        if (!account) {
            throw new common_1.NotFoundException(`Conta com ID #${id} não encontrada.`);
        }
        return account;
    }
    async update(id, updateAccountsPayableDto) {
        await this.findOne(id);
        const dataToUpdate = { ...updateAccountsPayableDto };
        if (updateAccountsPayableDto.dueDate) {
            dataToUpdate.dueDate = new Date(updateAccountsPayableDto.dueDate);
        }
        if (updateAccountsPayableDto.installmentType === 'UNICA') {
            dataToUpdate.installments = null;
            dataToUpdate.currentInstallment = null;
        }
        return this.prisma.accountPayable.update({
            where: { id },
            data: dataToUpdate,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.accountPayable.delete({
            where: { id },
        });
    }
};
exports.AccountsPayableService = AccountsPayableService;
exports.AccountsPayableService = AccountsPayableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsPayableService);
//# sourceMappingURL=accounts-payable.service.js.map