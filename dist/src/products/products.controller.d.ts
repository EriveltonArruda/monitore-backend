import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Response } from 'express';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    exportProductsPdf(res: Response): Promise<void>;
    exportProductsExcel(res: Response): Promise<void>;
    findAll(search?: string, categoryId?: string, status?: string, stockLevel?: 'low' | 'normal', page?: string, limit?: string): Promise<{
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
    findAllUnpaginated(): import(".prisma/client").Prisma.PrismaPromise<({
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
    uploadProductImage(id: number, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    deleteMainImage(id: number): Promise<{
        ok: boolean;
    }>;
    listImages(id: number): Promise<{
        id: number;
        url: string;
    }[]>;
    uploadGalleryImages(id: number, files: Express.Multer.File[]): Promise<{
        id: number;
        url: string;
    }[]>;
    deleteGalleryImage(id: number, imageId: number): Promise<{
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
}
