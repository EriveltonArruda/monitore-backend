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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(params?: FindAllProductsParams): Promise<{
        data: ({
            category: {
                id: number;
                name: string;
            } | null;
            supplier: {
                id: number;
                email: string | null;
                name: string;
                cnpj: string | null;
                phone: string | null;
            } | null;
        } & {
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
            email: string | null;
            name: string;
            cnpj: string | null;
            phone: string | null;
        } | null;
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            name: string;
        } | null;
        supplier: {
            id: number;
            email: string | null;
            name: string;
            cnpj: string | null;
            phone: string | null;
        } | null;
    } & {
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
    }>;
    updateMainImageUrl(id: number, imageUrl: string): Promise<{
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
    }>;
    removeMainImage(id: number): Promise<{
        ok: boolean;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    setMainImage(productId: number, imageId: number): Promise<{
        ok: boolean;
        mainImageUrl: string;
    }>;
    removeImage(imageId: number, productId?: number): Promise<{
        ok: boolean;
        updatedMainImageUrl: string | null | undefined;
    }>;
}
export {};
