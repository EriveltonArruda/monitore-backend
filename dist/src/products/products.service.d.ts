import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
interface FindAllProductsParams {
    search?: string;
    categoryId?: number;
    status?: string;
    stockLevel?: 'low' | 'normal';
    page?: number;
    limit?: number;
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
        costPrice: number | null;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(params?: FindAllProductsParams): Promise<{
        data: ({
            category: {
                id: number;
                name: string;
            } | null;
            supplier: {
                id: number;
                name: string;
                cnpj: string | null;
                email: string | null;
                phone: string | null;
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
            costPrice: number | null;
            location: string | null;
            mainImageUrl: string | null;
            videoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number | null;
            supplierId: number | null;
        })[];
        total: number;
    }>;
    findAllUnpaginatedFull(): Prisma.PrismaPromise<({
        category: {
            id: number;
            name: string;
        } | null;
        supplier: {
            id: number;
            name: string;
            cnpj: string | null;
            email: string | null;
            phone: string | null;
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
            cnpj: string | null;
            email: string | null;
            phone: string | null;
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
        costPrice: number | null;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
    updateMainImageUrl(id: number, imageUrl: string): Promise<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
    removeMainImage(id: number): Promise<{
        ok: boolean;
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
        costPrice: number | null;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }>;
    listImages(productId: number): Promise<{
        id: number;
        url: string;
    }[]>;
    addImages(productId: number, urls: string[]): Promise<{
        id: number;
        url: string;
    }[]>;
    ensureMainImage(productId: number, url: string): Promise<void>;
    removeImage(imageId: number, productId?: number): Promise<{
        ok: boolean;
    }>;
}
export {};
