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
    findAll(page?: string, limit?: string, search?: string, type?: string, productId?: string, period?: string): Promise<{
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
    exportListPdf(search: string | undefined, type: string | undefined, productIdStr: string | undefined, period: string | undefined, res: Response): Promise<void>;
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
