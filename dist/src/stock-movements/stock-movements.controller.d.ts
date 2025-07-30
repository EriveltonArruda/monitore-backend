import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
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
                salePrice: number;
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
