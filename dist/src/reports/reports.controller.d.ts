import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
