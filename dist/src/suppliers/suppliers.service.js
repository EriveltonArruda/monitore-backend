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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createSupplierDto) {
        return this.prisma.supplier.create({ data: createSupplierDto });
    }
    async findAll(params) {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const [suppliers, total] = await this.prisma.$transaction([
            this.prisma.supplier.findMany({
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.supplier.count(),
        ]);
        return {
            data: suppliers,
            total,
        };
    }
    findAllUnpaginated() {
        return this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) {
            throw new common_1.NotFoundException(`Fornecedor com ID #${id} não encontrado.`);
        }
        return supplier;
    }
    async update(id, updateSupplierDto) {
        await this.findOne(id);
        return this.prisma.supplier.update({
            where: { id },
            data: updateSupplierDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.supplier.delete({ where: { id } });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map