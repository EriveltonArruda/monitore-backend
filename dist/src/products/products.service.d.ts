import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
interface FindAllProductsParams {
    search?: string;
    categoryId?: number;
    status?: string;
    stockLevel?: 'low' | 'normal';
}
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto): Prisma.Prisma__ProductClient<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(params?: FindAllProductsParams): Prisma.PrismaPromise<({
        category: {
            id: number;
            name: string;
        } | null;
        supplier: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            name: string;
        } | null;
        supplier: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
}
export {};
