import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
        salePrice: number;
        costPrice: number | null;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        supplierId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
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
            salePrice: number;
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
    findAllUnpaginated(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        salePrice: number;
    }[]>;
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
