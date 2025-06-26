export declare class CreateProductDto {
    name: string;
    sku?: string;
    description?: string;
    unit?: string;
    stockQuantity: number;
    salePrice: number;
    costPrice?: number;
    categoryId: number;
    supplierId?: number;
}
