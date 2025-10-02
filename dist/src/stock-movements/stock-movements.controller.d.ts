import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { Response } from 'express';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(createStockMovementDto: CreateStockMovementDto): Promise<{
        id: number;
        type: string;
        quantity: number;
        details: string | null;
        relatedParty: string | null;
        unitPriceAtMovement: number | null;
        notes: string | null;
        document: string | null;
        createdAt: Date;
        productId: number;
        userId: number;
    }>;
    findAll(page?: string | string[], limit?: string | string[], search?: string | string[], type?: string | string[], productId?: string | string[], period?: string | string[]): Promise<{
        data: ({
            product: {
                id: number;
                createdAt: Date;
                name: string;
                sku: string | null;
                description: string | null;
                unit: string | null;
                status: string;
                stockQuantity: number;
                minStockQuantity: number;
                costPrice: number | null;
                location: string | null;
                mainImageUrl: string | null;
                videoUrl: string | null;
                updatedAt: Date;
                categoryId: number | null;
                supplierId: number | null;
            };
        } & {
            id: number;
            type: string;
            quantity: number;
            details: string | null;
            relatedParty: string | null;
            unitPriceAtMovement: number | null;
            notes: string | null;
            document: string | null;
            createdAt: Date;
            productId: number;
            userId: number;
        })[];
        total: number;
    }>;
    exportListPdf(search: string | string[] | undefined, type: string | string[] | undefined, productIdStr: string | string[] | undefined, period: string | string[] | undefined, res: Response): Promise<void>;
    exportOnePdf(id: number, res: Response): Promise<void>;
    findOne(id: number): Promise<{
        product: {
            id: number;
            createdAt: Date;
            name: string;
            sku: string | null;
            description: string | null;
            unit: string | null;
            status: string;
            stockQuantity: number;
            minStockQuantity: number;
            costPrice: number | null;
            location: string | null;
            mainImageUrl: string | null;
            videoUrl: string | null;
            updatedAt: Date;
            categoryId: number | null;
            supplierId: number | null;
        };
    } & {
        id: number;
        type: string;
        quantity: number;
        details: string | null;
        relatedParty: string | null;
        unitPriceAtMovement: number | null;
        notes: string | null;
        document: string | null;
        createdAt: Date;
        productId: number;
        userId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        type: string;
        quantity: number;
        details: string | null;
        relatedParty: string | null;
        unitPriceAtMovement: number | null;
        notes: string | null;
        document: string | null;
        createdAt: Date;
        productId: number;
        userId: number;
    }>;
}
