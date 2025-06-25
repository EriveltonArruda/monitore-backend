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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createProductDto) {
        const { categoryId, supplierId, ...productData } = createProductDto;
        return this.prisma.product.create({
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId },
                },
                supplier: supplierId
                    ? { connect: { id: supplierId } }
                    : undefined,
            },
        });
    }
    findAll() {
        return this.prisma.product.findMany({
            include: {
                category: true,
                supplier: true,
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, supplier: true },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID #${id} não encontrado.`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        const { categoryId, supplierId, ...productData } = updateProductDto;
        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                category: categoryId ? { connect: { id: categoryId } } : undefined,
                supplier: supplierId ? { connect: { id: supplierId } } : undefined,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.product.delete({ where: { id } });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map