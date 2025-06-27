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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGeneralReport() {
        const totalProducts = await this.prisma.product.count();
        const allProducts = await this.prisma.product.findMany({
            select: { stockQuantity: true, minStockQuantity: true, salePrice: true },
        });
        const stockValue = allProducts.reduce((acc, p) => acc + p.stockQuantity * p.salePrice, 0);
        const lowStockProductsCount = allProducts.filter(p => p.stockQuantity <= p.minStockQuantity).length;
        const productsByCategory = await this.prisma.product.groupBy({
            by: ['categoryId'],
            _count: {
                id: true,
            },
            where: { categoryId: { not: null } },
        });
        const categoryIds = productsByCategory
            .map(item => item.categoryId)
            .filter((id) => id !== null);
        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        });
        const productsByCategoryData = productsByCategory.map(item => {
            const category = categories.find(c => c.id === item.categoryId);
            return {
                name: category?.name || 'Sem Categoria',
                value: item._count.id,
            };
        });
        const productsWithValue = await this.prisma.product.findMany({
            include: { category: { select: { name: true } } }
        });
        const valueByCategory = productsWithValue.reduce((acc, product) => {
            const categoryName = product.category?.name || 'Sem Categoria';
            const productValue = product.stockQuantity * product.salePrice;
            acc[categoryName] = (acc[categoryName] || 0) + productValue;
            return acc;
        }, {});
        const valueByCategoryData = Object.keys(valueByCategory).map(name => ({
            name,
            value: valueByCategory[name],
        }));
        const sevenDaysAgo = (0, date_fns_1.subDays)(new Date(), 7);
        const movementsLast7Days = await this.prisma.stockMovement.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const movementsLast7DaysData = movementsLast7Days.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            count: item._count.id,
        }));
        return {
            summaryCards: {
                totalProducts,
                stockValue,
                totalMovements: await this.prisma.stockMovement.count(),
                lowStockProducts: lowStockProductsCount,
            },
            productsByCategory: productsByCategoryData,
            valueByCategory: valueByCategoryData,
            movementsLast7Days: movementsLast7DaysData,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map