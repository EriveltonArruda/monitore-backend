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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs/promises"));
const path_1 = require("path");
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
                category: { connect: { id: categoryId } },
                supplier: supplierId ? { connect: { id: supplierId } } : undefined,
            },
        });
    }
    async findAll(params) {
        const { search, categoryId, status, stockLevel, page = 1, limit = 10 } = params || {};
        const skip = (page - 1) * limit;
        const andConditions = [];
        if (search) {
            andConditions.push({
                OR: [{ name: { contains: search } }, { sku: { contains: search } }],
            });
        }
        if (categoryId)
            andConditions.push({ categoryId });
        if (status)
            andConditions.push({ status: status.toUpperCase() });
        if (stockLevel === 'low') {
            andConditions.push({ stockQuantity: { lte: this.prisma.product.fields.minStockQuantity } });
        }
        else if (stockLevel === 'normal') {
            andConditions.push({ stockQuantity: { gt: this.prisma.product.fields.minStockQuantity } });
        }
        const where = andConditions.length > 0 ? { AND: andConditions } : {};
        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                include: { category: true, supplier: true },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return { data: products, total };
    }
    findAllUnpaginatedFull() {
        return this.prisma.product.findMany({
            orderBy: { name: 'asc' },
            include: { category: true, supplier: true },
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
    async updateMainImageUrl(id, imageUrl) {
        return this.prisma.product.update({
            where: { id },
            data: { mainImageUrl: imageUrl },
        });
    }
    async removeMainImage(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Produto não encontrado');
        const current = product.mainImageUrl;
        await this.prisma.product.update({
            where: { id },
            data: { mainImageUrl: null },
        });
        if (current && current.startsWith('/uploads/products/')) {
            const absPath = (0, path_1.join)(process.cwd(), current.replace(/^\//, ''));
            try {
                await fs.unlink(absPath);
            }
            catch {
            }
        }
        return { ok: true };
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
        try {
            return await this.prisma.product.delete({ where: { id } });
        }
        catch (error) {
            console.error(error);
            if (error.code === 'P2003' || error.code === 'P2014') {
                throw new common_1.BadRequestException('Não é possível excluir este produto pois ele está vinculado a movimentações, entradas ou saídas de estoque.');
            }
            throw error;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map