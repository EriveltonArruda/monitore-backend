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
            costPrice: number | null;
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
            userId: number;
            details: string | null;
            relatedParty: string | null;
            unitPriceAtMovement: number | null;
            notes: string | null;
            document: string | null;
        })[];
    }>;
}
