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
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StockMovementsService = class StockMovementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createStockMovementDto) {
        const { productId, type, quantity, userId = 1, ...restData } = createStockMovementDto;
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) {
                throw new common_1.NotFoundException(`Produto com ID #${productId} não encontrado.`);
            }
            let newStockQuantity;
            if (type === 'ENTRADA') {
                newStockQuantity = product.stockQuantity + quantity;
            }
            else if (type === 'AJUSTE') {
                newStockQuantity = quantity;
            }
            else {
                if (product.stockQuantity < quantity) {
                    throw new common_1.BadRequestException(`Estoque insuficiente.`);
                }
                newStockQuantity = product.stockQuantity - quantity;
            }
            await tx.product.update({
                where: { id: productId },
                data: { stockQuantity: newStockQuantity },
            });
            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    type,
                    quantity,
                    userId,
                    ...restData,
                },
            });
            return movement;
        });
    }
    async findAll(params) {
        const { page, limit, search, type, productId, period } = params;
        const skip = (page - 1) * limit;
        let where = {};
        if (search) {
            where.OR = [
                { details: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
                { product: { is: { name: { contains: search, mode: 'insensitive' } } } }
            ];
        }
        if (type) {
            where.type = type;
        }
        if (productId) {
            where.productId = productId;
        }
        if (period) {
            const now = new Date();
            let startDate = null;
            if (period === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            }
            else if (period === 'last7') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            }
            else if (period === 'last30') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
            }
            if (startDate) {
                where.createdAt = { gte: startDate };
            }
        }
        const [movements, total] = await this.prisma.$transaction([
            this.prisma.stockMovement.findMany({
                where,
                include: { product: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.stockMovement.count({ where }),
        ]);
        return { data: movements, total };
    }
    async findOne(id) {
        const movement = await this.prisma.stockMovement.findUnique({
            where: { id },
            include: {
                product: true,
            },
        });
        if (!movement) {
            throw new common_1.NotFoundException(`Movimentação com ID #${id} não encontrada.`);
        }
        return movement;
    }
    async remove(id) {
        const movement = await this.prisma.stockMovement.findUnique({ where: { id } });
        if (!movement) {
            throw new common_1.NotFoundException(`Movimentação com ID #${id} não encontrada.`);
        }
        return this.prisma.stockMovement.delete({ where: { id } });
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map