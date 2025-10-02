import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
type ListFilters = {
    page?: number;
    limit?: number;
    search?: string | string[];
    type?: string;
    productId?: number;
    period?: string;
};
export declare class StockMovementsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    private buildWhere;
    findAll(params: ListFilters): Promise<{
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
    findForExport(filters: Omit<ListFilters, 'page' | 'limit'>): Promise<({
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
    })[]>;
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
export {};
