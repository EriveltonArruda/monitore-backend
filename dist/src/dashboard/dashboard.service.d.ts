import { PrismaService } from 'src/prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        totalProducts: number;
        totalMovements: number;
        stockValue: number;
        lowStockProductsCount: number;
        lowStockProducts: {
            id: number;
            name: string;
            stockQuantity: number;
            salePrice: number;
            minStockQuantity: number;
        }[];
        recentMovements: ({
            product: {
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            productId: number;
            type: string;
            quantity: number;
            details: string | null;
            relatedParty: string | null;
            unitPriceAtMovement: number | null;
            notes: string | null;
            document: string | null;
            userId: number;
        })[];
    }>;
}
