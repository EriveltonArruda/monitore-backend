import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(createStockMovementDto: CreateStockMovementDto): Promise<{
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
    }>;
    findAll(page?: string, limit?: string): Promise<{
        data: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number | null;
                supplierId: number | null;
                sku: string | null;
                description: string | null;
                unit: string | null;
                stockQuantity: number;
                salePrice: number;
                costPrice: number | null;
                status: string;
                minStockQuantity: number;
                location: string | null;
                mainImageUrl: string | null;
                videoUrl: string | null;
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
        total: number;
    }>;
}
