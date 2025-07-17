import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(search?: string, categoryId?: string, status?: string, stockLevel?: 'low' | 'normal', page?: string, limit?: string): Promise<{
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
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
