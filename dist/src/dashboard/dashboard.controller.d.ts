import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        totalProducts: number;
        totalMovements: number;
        stockValue: number;
        lowStockProductsCount: number;
        lowStockProducts: {
            id: number;
            name: string;
            stockQuantity: number;
            minStockQuantity: number;
            costPrice: number | null;
        }[];
        recentMovements: ({
            product: {
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            type: string;
            quantity: number;
            details: string | null;
            relatedParty: string | null;
            unitPriceAtMovement: number | null;
            notes: string | null;
            document: string | null;
            productId: number;
            userId: number;
        })[];
    }>;
}
