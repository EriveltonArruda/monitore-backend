import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createStockMovementDto: CreateStockMovementDto): Promise<{
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
    }>;
    findAll(params: {
        page: number;
        limit: number;
        search?: string;
        type?: string;
        productId?: number;
        period?: string;
    }): Promise<{
        data: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                description: string | null;
                unit: string | null;
                stockQuantity: number;
                costPrice: number | null;
                categoryId: number | null;
                supplierId: number | null;
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
            details: string | null;
            relatedParty: string | null;
            unitPriceAtMovement: number | null;
            notes: string | null;
            document: string | null;
            userId: number;
        })[];
        total: number;
    }>;
    remove(id: number): Promise<{
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
    }>;
}
