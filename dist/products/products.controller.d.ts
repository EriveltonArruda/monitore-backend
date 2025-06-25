import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: number;
        sku: string | null;
        description: string | null;
        unit: string | null;
        stockQuantity: number;
        salePrice: number;
        costPrice: number | null;
        categoryId: number | null;
        supplierId: number | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        minStockQuantity: number;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            name: string;
            id: number;
        } | null;
        supplier: {
            name: string;
            id: number;
        } | null;
    } & {
        name: string;
        id: number;
        sku: string | null;
        description: string | null;
        unit: string | null;
        stockQuantity: number;
        salePrice: number;
        costPrice: number | null;
        categoryId: number | null;
        supplierId: number | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        minStockQuantity: number;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            name: string;
            id: number;
        } | null;
        supplier: {
            name: string;
            id: number;
        } | null;
    } & {
        name: string;
        id: number;
        sku: string | null;
        description: string | null;
        unit: string | null;
        stockQuantity: number;
        salePrice: number;
        costPrice: number | null;
        categoryId: number | null;
        supplierId: number | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        minStockQuantity: number;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        name: string;
        id: number;
        sku: string | null;
        description: string | null;
        unit: string | null;
        stockQuantity: number;
        salePrice: number;
        costPrice: number | null;
        categoryId: number | null;
        supplierId: number | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        minStockQuantity: number;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
        sku: string | null;
        description: string | null;
        unit: string | null;
        stockQuantity: number;
        salePrice: number;
        costPrice: number | null;
        categoryId: number | null;
        supplierId: number | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        minStockQuantity: number;
        location: string | null;
        mainImageUrl: string | null;
        videoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
