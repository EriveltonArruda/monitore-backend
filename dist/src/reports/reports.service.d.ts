import { PrismaService } from 'src/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getGeneralReport(): Promise<{
        summaryCards: {
            totalProducts: number;
            stockValue: number;
            totalMovements: number;
            lowStockProducts: number;
        };
        productsByCategory: {
            name: string;
            value: number;
        }[];
        valueByCategory: {
            name: string;
            value: number;
        }[];
        movementsLast7Days: {
            date: string;
            count: number;
        }[];
    }>;
}
