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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const allProducts = await this.prisma.product.findMany({
            select: {
                id: true,
                name: true,
                stockQuantity: true,
                minStockQuantity: true,
                costPrice: true,
            },
        });
        const lowStockProducts = allProducts.filter((p) => p.stockQuantity <= p.minStockQuantity);
        const [totalMovements, recentMovements] = await this.prisma.$transaction([
            this.prisma.stockMovement.count(),
            this.prisma.stockMovement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { product: { select: { name: true } } },
            }),
        ]);
        const totalProducts = allProducts.length;
        const stockValue = allProducts.reduce((acc, product) => acc + (product.stockQuantity * (product.costPrice || 0)), 0);
        const lowStockProductsCount = lowStockProducts.length;
        return {
            totalProducts,
            totalMovements,
            stockValue,
            lowStockProductsCount,
            lowStockProducts: lowStockProducts.slice(0, 3),
            recentMovements,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map