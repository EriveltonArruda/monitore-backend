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
    private buildWhere;
    findAll(params: ListFilters): Promise<{
        data: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                status: string;
                sku: string | null;
                unit: string | null;
                stockQuantity: number;
                costPrice: number | null;
                categoryId: number | null;
                supplierId: number | null;
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
    findForExport(filters: Omit<ListFilters, 'page' | 'limit'>): Promise<({
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: string;
            sku: string | null;
            unit: string | null;
            stockQuantity: number;
            costPrice: number | null;
            categoryId: number | null;
            supplierId: number | null;
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
    })[]>;
    findOne(id: number): Promise<{
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: string;
            sku: string | null;
            unit: string | null;
            stockQuantity: number;
            costPrice: number | null;
            categoryId: number | null;
            supplierId: number | null;
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
export {};
